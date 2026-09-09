const fs=require('fs');
const assert=require('assert');
const {execFileSync}=require('child_process');

const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
assert(app.includes("['c4 quiet-adult','culture','静かな大人時間'"),'quiet adult collection class missing');
assert(css.includes(".quiet-adult{background-image:url('images/ai/quiet-adult-time.webp')"),'quiet adult hero css missing');
assert(fs.existsSync('images/ai/quiet-adult-time.webp'),'quiet adult hero image missing');

const sitemap=fs.readFileSync('sitemap.xml','utf8');
assert(!sitemap.includes('/magazine/shibuya-with-kids/'),'noindex legacy shibuya page must not be in sitemap');
assert(!sitemap.includes('/magazine/shinjuku-family-day/'),'noindex legacy shinjuku page must not be in sitemap');
assert((sitemap.match(/<loc>/g)||[]).length===532,'unexpected sitemap URL count');

const guides=fs.readdirSync('guide',{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>`guide/${x.name}/index.html`).filter(fs.existsSync);
let cards=0,spotLinks=0;
for(const f of guides){const h=fs.readFileSync(f,'utf8');cards+=(h.match(/class="spot-card"/g)||[]).length;spotLinks+=(h.match(/data-guide-cta="spot"/g)||[]).length;assert(!/[?&](?:amp;)?spot=spot_/.test(h),`${f}: legacy spot query remains`)}
assert.strictEqual(cards,358,'guide card count changed unexpectedly');
assert.strictEqual(spotLinks,358,'guide spot links missing');

for(const root of ['index.html','magazine','plans','guide']){
  const files=[];
  const walk=p=>{const st=fs.statSync(p);if(st.isDirectory())for(const n of fs.readdirSync(p))walk(`${p}/${n}`);else if(p.endsWith('.html'))files.push(p)};
  walk(root);
  for(const f of files)assert(!/[?&](?:amp;)?spot=spot_/.test(fs.readFileSync(f,'utf8')),`${f}: legacy ?spot link remains`);
}
assert(fs.readFileSync('index.html','utf8').includes('href="spots/">スポット一覧</a>'),'spots hub footer link missing');
assert(fs.existsSync('.github/workflows/kibun-seo-audit.yml'),'SEO GitHub Action missing');
execFileSync(process.execPath,['scripts/seo_audit.mjs'],{stdio:'inherit'});
console.log('v20.12.8 SEO + quiet adult tests passed');
