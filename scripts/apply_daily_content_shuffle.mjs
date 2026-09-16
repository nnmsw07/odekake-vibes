import fs from 'node:fs';

const targets = [
  { file: 'magazine/index.html', selector: '.article-grid', item: '.article-card', marker: 'kibun-daily-article-shuffle' },
  { file: 'plans/index.html', selector: '.plan-library', item: '.plan-library-card', marker: 'kibun-daily-plan-shuffle' }
];

function scriptFor({selector,item,marker}) {
  return `<script id="${marker}">(function(){
  const root=document.querySelector('${selector}');
  if(!root)return;
  const items=[...root.querySelectorAll('${item}')];
  if(items.length<2)return;
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  let seed=2166136261;
  const text='${marker}:'+day;
  for(let i=0;i<text.length;i++){seed^=text.charCodeAt(i);seed=Math.imul(seed,16777619)>>>0;}
  const rnd=()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
  for(let i=items.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
  items.forEach(el=>root.appendChild(el));
})();</script>`;
}

for (const target of targets) {
  let html = fs.readFileSync(target.file, 'utf8');
  if (html.includes(`id="${target.marker}"`)) continue;
  if (!html.includes('</body>')) throw new Error(`${target.file}: </body> not found`);
  html = html.replace('</body>', `${scriptFor(target)}</body>`);
  fs.writeFileSync(target.file, html);
  console.log(`updated ${target.file}`);
}
