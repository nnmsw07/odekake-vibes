const fs=require('fs');const path=require('path');
function ok(v,m){if(!v)throw new Error('FAIL: '+m);console.log('PASS',m)}
const read=p=>fs.readFileSync(p,'utf8');
const index=read('index.html'),enIndex=read('en/index.html'),css=read('styles.css');
ok(index.includes('styles.css?v=201902'),'JP top cache-busts v20.19.2 CSS');
ok(enIndex.includes('styles.css?v=201902'),'EN top cache-busts v20.19.2 CSS');
ok(index.includes('app.js?v=201902'),'JP app cache-busts venue links');
ok(enIndex.includes('/en/app.js?v=201902'),'EN app cache-busts venue links');
ok(css.includes('height:126px!important')&&css.includes('grid-template-rows:78px 48px!important'),'supporting mood cards are compact');
const app=read('app.js'),enApp=read('en/app.js');
ok(app.includes('/whats-on/?venue=${encodeURIComponent(spot.spot_id)}'),'JP spot detail links to venue WHAT’S ON');
ok(enApp.includes('/en/whats-on/?venue=${encodeURIComponent(spot.spot_id)}'),'EN spot detail links to venue WHAT’S ON');
const wa=read('whats-on/app.js'),ewa=read('en/whats-on/app.js');
ok(wa.includes("const venueId=params.get('venue')||''")&&wa.includes('ほかの施設のWHAT’S ONを見る'),'JP venue-only WHAT’S ON mode');
ok(ewa.includes("const venueId=params.get('venue')||''")&&ewa.includes('See what’s on at other venues'),'EN venue-only WHAT’S ON mode');
ok(read('whats-on/index.html').includes('venueWhatsOnCta'),'JP venue CTA mount');
ok(read('en/whats-on/index.html').includes('venueWhatsOnCta'),'EN venue CTA mount');
const magCss=read('magazine/magazine.css'),magMedia=read('magazine/magazine-media.js');
ok(magCss.includes('.spot-feature-media'),'legacy feature spot cards now support hero media');
ok((magMedia.match(/"spot_/g)||[]).length>150,'magazine hero resolver covers broad spot set');
let jpFeatures=0,jpMedia=0,bad=[];
for(const d of fs.readdirSync('magazine',{withFileTypes:true})){
 if(!d.isDirectory())continue;const p=path.join('magazine',d.name,'index.html');if(!fs.existsSync(p))continue;
 const t=read(p);const blocks=[...t.matchAll(/<article class="spot-feature">([\s\S]*?)<\/article>/g)];jpFeatures+=blocks.length;jpMedia+=blocks.filter(x=>x[1].includes('spot-feature-media')&&x[1].includes('data-hero-spot=')).length;
 if(t.includes('article-hero-media')){const section=t.split('article-hero-media',2)[1].split('</div>',1)[0];if(!section.includes('data-hero-spot='))bad.push(p);}
 if(t.includes('"/ data-hero'))bad.push(p+' malformed');
}
ok(jpFeatures>150&&jpFeatures===jpMedia,'all JP legacy spot features use spot hero media');
ok(bad.length===0,'all JP feature article heroes use a representative spot hero');
const hub=read('magazine/index.html');ok((hub.match(/article-card-media/g)||[]).length>20&&hub.includes('data-hero-spot='),'JP magazine hub cards use hero resolver');
const enHub=read('en/magazine/index.html');ok((enHub.match(/data-hero-spot=/g)||[]).length>=12,'EN magazine hub cards use hero resolver');
for(const p of ['magazine/index.html','en/magazine/index.html','en/magazine/comfortable-day/index.html'])ok(!read(p).includes('"/ data-hero'),p+' has valid hero img markup');
console.log('v20.19.2 checks complete');
