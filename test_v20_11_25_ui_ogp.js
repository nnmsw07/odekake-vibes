const fs=require('fs'); const assert=require('assert');
const index=fs.readFileSync('index.html','utf8'); const app=fs.readFileSync('app.js','utf8'); const css=fs.readFileSync('styles.css','utf8');
assert(index.includes('class="mood-progress"')); assert(index.includes('<details class="conditions">'));
assert(app.includes('MOOD_PHOTOS')); assert(app.includes('mood-photo-card')); assert(app.includes('activity-list-card'));
assert(css.includes('v20.11.25 — compact mood-first selector')); assert(css.includes('grid-template-columns:repeat(3,1fr)!important'));
const pages=['magazine/index.html',...fs.readdirSync('magazine',{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>`magazine/${x.name}/index.html`).filter(fs.existsSync)];
for(const f of pages){const h=fs.readFileSync(f,'utf8'); assert(h.includes('og-v201125'),f+' fresh OGP URL missing'); assert(h.includes('og:image:width'),f+' og width missing');}
const ogs=fs.readdirSync('assets/og-v201125').filter(x=>x.endsWith('.jpg')); assert(ogs.length>=pages.length,'not enough OGP assets');
console.log('v20.11.25 UI/OGP: PASS');
