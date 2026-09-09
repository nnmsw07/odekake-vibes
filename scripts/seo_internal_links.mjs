import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function decodeHtml(value='') {
  return String(value)
    .replace(/&#(\d+);/g, (_,n)=>String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_,n)=>String.fromCodePoint(parseInt(n,16)))
    .replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'")
    .replaceAll('&lt;','<').replaceAll('&gt;','>');
}
function normalizeName(value='') {
  return decodeHtml(String(value).replace(/<[^>]+>/g,''))
    .normalize('NFKC').toLowerCase().replace(/[＋+]/g,'')
    .replace(/[\s\u3000・･|｜()（）［］\[\]【】「」『』'".,，。:：;；!！?？/&＆·・\-‐‑–—―]/g,'');
}
function htmlFiles(root) {
  const out=[path.join(root,'index.html')];
  for (const d of ['magazine','plans','guide']) {
    const base=path.join(root,d); if(!fs.existsSync(base)) continue;
    const stack=[base];
    while(stack.length){const cur=stack.pop();for(const ent of fs.readdirSync(cur,{withFileTypes:true})){const full=path.join(cur,ent.name);if(ent.isDirectory())stack.push(full);else if(ent.isFile()&&ent.name==='index.html')out.push(full)}}
  }
  return out.filter(fs.existsSync);
}

export function normalizePublicSpotLinks({root=process.cwd(), routes}) {
  if (!Array.isArray(routes) || !routes.length) throw new Error('routes are required');
  const byName=new Map(), byId=new Map();
  for(const r of routes){byId.set(r.spot_id,r);const k=normalizeName(r.name);if(k&&!byName.has(k))byName.set(k,r)}
  let guideCards=0, guideResolved=0, guideChanged=0, legacyFound=0, legacyChanged=0, filesChanged=0;
  const unmatched=[];
  for(const file of htmlFiles(root)){
    let html=fs.readFileSync(file,'utf8');const before=html;
    if(file.includes(`${path.sep}guide${path.sep}`) && path.basename(path.dirname(file))!=='guide'){
      html=html.replace(/<article class="spot-card">([\s\S]*?)<\/article>/g,(article,inner)=>{
        guideCards++;
        const hm=inner.match(/<h2>([\s\S]*?)<\/h2>/i);if(!hm)return article;
        const display=decodeHtml(hm[1].replace(/<[^>]+>/g,'')).trim();const route=byName.get(normalizeName(display));
        if(!route){unmatched.push({guide:path.basename(path.dirname(file)),name:display});return article}
        guideResolved++;
        const next=article.replace(/<a\s+href="[^"]*"([^>]*)data-guide-cta="spot"([^>]*)>[\s\S]*?<\/a>/i,`<a href="/spots/${encodeURIComponent(route.slug)}/"$1data-guide-cta="spot"$2>スポットを見る →</a>`);
        if(next!==article)guideChanged++;
        return next;
      });
    }
    html=html.replace(/href="([^"]*[?&](?:amp;)?spot=(spot_\d+)[^"]*)"/gi,(whole,href,id)=>{
      legacyFound++;const route=byId.get(id);if(!route)return whole;legacyChanged++;return `href="/spots/${encodeURIComponent(route.slug)}/"`;
    });
    if(html!==before){fs.writeFileSync(file,html);filesChanged++}
  }
  return {guideCards,guideResolved,guideChanged,legacyFound,legacyChanged,filesChanged,unmatched};
}

const self=fileURLToPath(import.meta.url);
if(process.argv[1]&&path.resolve(process.argv[1])===self){
  const root=process.cwd(), routesPath=path.join(root,'spots','routes.json');
  if(!fs.existsSync(routesPath))throw new Error('spots/routes.json がありません。');
  const routes=JSON.parse(fs.readFileSync(routesPath,'utf8')).routes;
  const r=normalizePublicSpotLinks({root,routes});
  console.log(`SEO internal links: guides ${r.guideResolved}/${r.guideCards}, legacy ?spot ${r.legacyChanged}/${r.legacyFound}, files changed ${r.filesChanged}`);
  if(r.unmatched.length){console.error('Unmatched guide spots:',r.unmatched);process.exitCode=1}
}
