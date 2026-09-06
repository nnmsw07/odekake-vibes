const fs=require('fs'); const assert=require('assert');
const index=fs.readFileSync('index.html','utf8');
assert(index.includes('class="mood-progress"'),'SNS/UI mood progress missing');
assert(index.includes('Kibun Trip'),'brand update missing');
const slugs=['baby-first-outing','yokohama-rainy-day','ride-and-transport','science-for-everyone','waterfront-reset','green-breathing-room','small-museums-big-day','solo-reset','factory-tour','animals-close'];
const hub=fs.readFileSync('magazine/index.html','utf8'); const media=fs.readFileSync('magazine/magazine-media.js','utf8'); const map=fs.readFileSync('sitemap.xml','utf8');
for(const slug of slugs){
  assert(fs.existsSync(`magazine/${slug}/index.html`),slug+' page missing');
  assert(hub.includes(`href="${slug}/"`),slug+' hub card missing');
  assert(map.includes(`/magazine/${slug}/`),slug+' sitemap missing');
  const h=fs.readFileSync(`magazine/${slug}/index.html`,'utf8');
  assert(h.includes(`assets/og-v201125/${slug}-v201125.jpg`),slug+' fresh OGP URL missing');
  assert(h.includes('og:image:width'),slug+' OGP dimensions missing');
  assert(fs.existsSync(`assets/og-v201125/${slug}-v201125.jpg`),slug+' OGP asset missing');
}
for(const spot of ['spot_109','spot_018','spot_103','spot_117','spot_053','spot_155','spot_428']) assert(media.includes(spot),spot+' hero mapping missing');
console.log('v20.12.1 integrated SNS + Magazine: PASS');
