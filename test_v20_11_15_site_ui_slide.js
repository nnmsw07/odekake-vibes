const fs=require('fs');
const assert=require('assert');
const audit=fs.readFileSync('sns-audit/audit.js','utf8');
const css=fs.readFileSync('sns-audit/audit.css','utf8');
const index=fs.readFileSync('sns-audit/index.html','utf8');

assert.ok(audit.includes("kind:'article-poster'"),'article poster slide missing');
assert.ok(audit.includes("kind:'kibun-intro'"),'second slide missing');
assert.ok(audit.includes("label:'SITE UI'"),'second slide should be SITE UI');
assert.ok(audit.includes('サイトの実際のUIに近い見せ方'),'site UI intent copy missing');
assert.ok(audit.includes('MOOD FIRST. PLACE SECOND.'),'site hero eyebrow missing');
assert.ok(audit.includes('今日は、<em>どんな気分？</em>'),'site hero copy missing');
assert.ok(audit.includes('誰と過ごす？'),'audience UI missing');
assert.ok(audit.includes('今日を組み立てる'),'vibe UI missing');
assert.ok(audit.includes('半日くらい'),'time UI missing');
assert.ok(audit.includes('今日の過ごし方を見る'),'site CTA missing');
assert.ok(audit.includes("TODAY'S PLANS"),'results UI missing');
assert.ok(audit.includes('今日のあなたなら、こんな3つ。'),'three-results preview missing');
assert.ok(audit.includes('2枚目 サイトUI'),'capture meta not updated');

assert.ok(audit.includes('ig-poster-footer'),'real brand overlay missing');
assert.ok(audit.includes('../favicon.svg'),'real Kibun brand icon missing');
assert.ok(audit.includes('AIイメージ'),'AI badge missing');
assert.ok(audit.includes('実際の施設・景観とは異なる場合があります'),'AI disclosure missing');

for(const cls of ['.ig-poster-footer','.ig-real-brand','.ig-ai-meta','.ig-kibun-ui','.ig-ui-window','.ig-ui-chip-row','.ig-ui-vibes','.ig-ui-button','.ig-ui-results']){
  assert.ok(css.includes(cls),`CSS missing ${cls}`);
}
assert.ok(index.includes('audit.css?v=201115'),'CSS cache bust missing');
assert.ok(index.includes('audit.js?v=201115'),'audit JS cache bust missing');
assert.ok(index.includes('image-audit.js?v=201115'),'image audit cache bust missing');

console.log('v20.11.15 real brand + site UI second slide: PASS');
