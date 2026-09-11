const fs=require('fs');
const path=require('path');
const root=__dirname;
const text=p=>fs.readFileSync(path.join(root,p),'utf8');
const ja=text('index.html');
const en=text('en/index.html');
const css=text('styles.css');
const checks=[
  ['JA CSS cache bump', ja.includes('styles.css?v=201700')],
  ['EN CSS cache bump', en.includes('/styles.css?v=201700')],
  ['JA concise hero copy', ja.includes('今日どこ行く？を、気分から決める。')],
  ['JA compact progress copy', ja.includes('気分 → やりたいこと → 条件')],
  ['JA WHAT ON swipe copy', ja.includes('今ある体験を、横にめくって探す。')],
  ['EN WHAT ON swipe copy', en.includes('swipe through what’s happening now.')],
  ['mobile mood rail flex', /@media\(max-width:760px\)[\s\S]*?\.vibe-group-mood \.vibe-grid\{[\s\S]*?display:flex!important/.test(css)],
  ['mobile mood rail snap', /\.vibe-group-mood \.vibe-grid\{[\s\S]*?scroll-snap-type:x mandatory/.test(css)],
  ['mobile whats on rail flex', /\.performance-preview-grid\{[\s\S]*?display:flex!important/.test(css)],
  ['mobile whats on rail snap', /\.performance-preview-grid\{[\s\S]*?scroll-snap-type:x mandatory/.test(css)],
  ['next card peek width', /\.performance-preview-card\{[\s\S]*?flex:0 0 min\(76vw,292px\)/.test(css)],
  ['mobile heading single line protection', /\.performance-preview \.section-heading\.compact h2\{[^}]*white-space:nowrap/.test(css)],
  ['shared story rails polished', css.includes('.editorial-story-grid,.magazine-preview-grid')],
];
const failed=checks.filter(([,ok])=>!ok);
if(failed.length){
  console.error('v20.17.0 FAIL');
  failed.forEach(([name])=>console.error(' - '+name));
  process.exit(1);
}
console.log(`v20.17.0 PASS: ${checks.length} home UI checks`);
