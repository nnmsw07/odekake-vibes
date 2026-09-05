const fs=require('fs');
const assert=require('assert');
const js=fs.readFileSync('sns-audit/audit.js','utf8');
const css=fs.readFileSync('sns-audit/audit.css','utf8');
const html=fs.readFileSync('sns-audit/index.html','utf8');
assert(js.includes("kind:'article-poster'"));
assert(js.includes("kind:'article-spots'"));
assert(js.includes("title:'気になる3つを、まずは保存。'"));
assert(js.includes('function spotCaptionBlurb(s,i)'));
assert(js.includes('function articleCaptionLead(i,poster)'));
assert(js.includes('2枚目は3スポットを紹介する保存用カード'));
assert(js.includes('2枚目 スポット紹介'));
assert(js.includes("'yokohama-family-cafe':'子連れでも、ちゃんとくつろぎたい。"));
assert(js.includes('captionSpotLine(s,idx)'));
assert(css.includes('.ig-article-spots'));
assert(css.includes('.ig-article-spots-grid'));
assert(css.includes('.ig-article-spot-card'));
assert(html.includes('audit.css?v=201122'));
assert(html.includes('audit.js?v=201122'));
for(const slug of ['tokyo-rainy-family','oyako-rest-indoor','yokohama-family-cafe','yokohama-small-holiday','art-and-cafe','hakone-stay-story','make-something','japanese-culture-experience','terrace-after-sunset','night-starts-after-five']){
  for(let n=1;n<=3;n++){
    const p=`assets/sns/article-spot-images/${slug}-${String(n).padStart(2,'0')}.webp`;
    assert(fs.existsSync(p),`missing ${p}`);
  }
}
console.log('v20.11.22 SNS article spot guide: PASS');
