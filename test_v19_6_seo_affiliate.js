const fs=require('fs'),path=require('path');
const root=__dirname;
const seed=JSON.parse(fs.readFileSync(path.join(root,'seed.json'),'utf8'));
function ok(x,m){if(!x)throw new Error(m)}
ok(/^0\.19\.(?:6(?:\.\d+)?|7(?:\.\d+)?)$/.test(seed.metadata.version),'version');
ok(seed.spots.length=== 256,'256 spots');
ok(seed.spots.every(s=>s.monetization&&/[ABC]/.test(s.monetization.affiliate_fit)),'monetization grades');
const guides=JSON.parse(fs.readFileSync(path.join(root,'SEO_GUIDES_v19_6.json'),'utf8')).guides;
ok(guides.length===20,'20 v19.6 guides');
for(const g of guides){
  const p=path.join(root,'guide',g.slug,'index.html');
  ok(fs.existsSync(p),`missing ${g.slug}`);
  const h=fs.readFileSync(p,'utf8');
  ok(h.includes('<link rel="canonical"'),`canonical ${g.slug}`);
  ok(h.includes('G-M99DNGD18F'),`GA4 ${g.slug}`);
  ok(g.count>=5,`thin guide ${g.slug}: ${g.count}`);
}
const sm=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
ok((sm.match(/<url>/g)||[]).length>=24,'sitemap keeps v19.6 URLs');
const aff=fs.readFileSync(path.join(root,'affiliate-config.js'),'utf8');
ok(aff.includes('KIBUN_AFFILIATE_CONFIG'),'affiliate config present');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
ok(app.includes('affiliate_click'),'affiliate GA4');
ok(app.includes('seo_guide_open'),'SEO GA4');
console.log('V19.6 REGRESSION PASS: 20 SEO guides + 256 monetization grades + affiliate foundation retained');
