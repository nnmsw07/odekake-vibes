const fs=require('fs');
const assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');

const index=read('sns-audit/index.html');
const js=read('sns-audit/audit.js');
const css=read('sns-audit/audit.css');

assert.ok(index.includes('audit.css?v=20114'),'cache bust for css missing');
assert.ok(index.includes('audit.js?v=20114'),'cache bust for js missing');
assert.ok(js.includes('SNS投稿用は、権利的に扱いやすい保存Heroだけを使います'),'safe mode explanation missing');
assert.ok(js.includes('function isSharedGenericHero'),'shared generic hero detection missing');
assert.ok(js.includes('function socialSafeHeroUrl'),'social safe hero helper missing');
assert.ok(js.includes('写真なしでも保存しやすいテキストカード'),'no-photo social card copy missing');
assert.ok(js.includes("ig-canvas ig-spot ${media?'has-media':'no-media'}"),'spot slide mode class switching missing');
assert.ok(css.includes('.ig-media-placeholder'),'placeholder social card css missing');
assert.ok(css.includes('.ig-facts'),'spot fact chip css missing');
console.log('v20.11.4 SNS capture safe mode: PASS');
