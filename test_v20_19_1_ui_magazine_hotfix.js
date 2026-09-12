const fs=require('fs');
const path=require('path');
const root=__dirname;
const text=p=>fs.readFileSync(path.join(root,p),'utf8');
const css=text('styles.css');
const magCss=text('magazine/magazine.css');
const media=text('magazine/magazine-media.js');
const ja=text('index.html');
const en=text('en/index.html');
const article=text('magazine/comfortable-day/index.html');
const checks=[
  ['JA hotfix cache',ja.includes('styles.css?v=201901')],
  ['EN hotfix root cache',en.includes('/styles.css?v=201901')],
  ['supporting mood cards compact',css.includes('v20.19.1 hotfix')&&css.includes('grid-template-rows:72px 50px!important')&&css.includes('height:122px!important')],
  ['supporting mood title stays one line',css.includes('white-space:nowrap!important')&&css.includes('font-size:9.2px!important')],
  ['feature spot card styles exist',magCss.includes('v20.19.1 — editorial spot cards')&&magCss.includes('.article-spot-media')&&magCss.includes('.article-spot-copy')],
  ['feature mobile card layout exists',magCss.includes('height:176px')&&magCss.includes('.article-spot-copy{padding:18px 18px 20px}')],
  ['media fallback reveals default image',media.includes("if(!endpoint){")&&media.includes("img.dataset.heroState='fallback'")],
  ['new feature article uses new card structure',article.includes('class="article-spot"')&&article.includes('class="article-spot-media"')&&article.includes('class="article-spot-copy"')],
  ['new feature article busts css cache',article.includes('magazine.css?v=201901')],
];
const magazineHtml=[...walk(path.join(root,'magazine')),...walk(path.join(root,'en/magazine'))].filter(x=>x.endsWith('.html'));
checks.push(['all pages using magazine css bust cache',magazineHtml.filter(f=>fs.readFileSync(f,'utf8').includes('magazine.css?v=')).every(f=>fs.readFileSync(f,'utf8').includes('magazine.css?v=201901'))]);
function walk(dir){
  if(!fs.existsSync(dir)) return [];
  const out=[];
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name);
    if(e.isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}
const failed=checks.filter(([,ok])=>!ok);
if(failed.length){
  console.error('v20.19.1 hotfix FAIL');
  failed.forEach(([n])=>console.error(' - '+n));
  process.exit(1);
}
console.log(`v20.19.1 hotfix PASS: ${checks.length} checks`);
