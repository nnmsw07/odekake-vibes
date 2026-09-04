const fs=require('fs');
const path=require('path');
const assert=require('assert');
const audit=fs.readFileSync('sns-audit/audit.js','utf8');
const css=fs.readFileSync('sns-audit/audit.css','utf8');
const index=fs.readFileSync('sns-audit/index.html','utf8');
const imageAudit=fs.readFileSync('sns-audit/image-audit.js','utf8');

const slugs=[
  'tokyo-rainy-family','oyako-rest-indoor','yokohama-family-cafe','yokohama-small-holiday','art-and-cafe',
  'hakone-stay-story','make-something','japanese-culture-experience','terrace-after-sunset','night-starts-after-five'
];
for(const slug of slugs){
  const f=path.join('assets','sns','article-posters',`${slug}.webp`);
  assert.ok(fs.existsSync(f),`poster asset missing: ${slug}`);
  assert.ok(fs.statSync(f).size>100000,`poster asset unexpectedly small: ${slug}`);
  assert.ok(audit.includes(`'${slug}'`),`poster mapping missing: ${slug}`);
}
assert.ok(audit.includes("kind:'article-poster'"),'article poster slide kind missing');
assert.ok(audit.includes("kind:'kibun-intro'"),'Kibun intro second slide missing');
assert.ok(audit.includes('AI_DISCLOSURE'),'AI disclosure constant missing');
assert.ok(audit.includes('AIイメージ'),'AI image badge missing');
assert.ok(audit.includes('実際の施設・景観とは異なる場合があります'),'AI disclosure wording missing');
assert.ok(audit.includes('プロフィールのリンクから'),'Kibun intro CTA missing');
assert.ok(audit.includes('3つに絞って提案'),'Kibun product explanation missing');
assert.ok(audit.includes('forceEditorial'),'saved posts should refresh to new editorial flow');
for(const cls of ['.ig-poster-slide','.ig-ai-badge','.ig-ai-disclosure','.ig-kibun-intro','.ig-kibun-flow','.ig-kibun-bottom']){
  assert.ok(css.includes(cls),`CSS missing ${cls}`);
}
assert.ok(index.includes('audit.css?v=201114')&&index.includes('audit.js?v=201114')&&index.includes('image-audit.js?v=201114'),'v20.11.14 cache bust missing');
assert.ok(imageAudit.includes("const VERSION='20.11.14'"),'image audit version mismatch');
assert.ok(audit.includes("const KEY='kibun-sns-audit-v20114-editors'"),'state key not updated');
assert.ok(audit.includes("'kibun-sns-audit-v20112-editors'"),'v20.11.12 state migration missing');
console.log('v20.11.14 article poster + Kibun intro: PASS');
