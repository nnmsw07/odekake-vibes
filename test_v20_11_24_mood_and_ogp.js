const fs=require('fs');
const assert=require('assert');
const index=fs.readFileSync('index.html','utf8');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const mag=fs.readFileSync('magazine/index.html','utf8');
assert(index.includes('id="selectedVibeTags"'));
assert(app.includes('selected-vibe-tag'));
assert(app.includes('vibe-order'));
assert(css.includes('v20.11.24: mood selector polish'));
assert(css.includes('.setup-panel'));
assert(mag.includes('assets/og-kibun-magazine.png'));
assert(mag.includes('twitter:image'));
for(const slug of ['art-and-cafe','yokohama-family-cafe','night-starts-after-five','tokyo-rainy-family','japanese-culture-experience','yokohama-small-holiday','terrace-after-sunset','make-something','hakone-stay-story','oyako-rest-indoor']){
  const html=fs.readFileSync(`magazine/${slug}/index.html`,'utf8');
  assert(html.includes(`assets/sns/article-posters/${slug}.webp`), slug+' poster OGP missing');
  assert(html.includes('twitter:image'), slug+' twitter:image missing');
}
console.log('v20.11.24 mood/ogp test: PASS');
