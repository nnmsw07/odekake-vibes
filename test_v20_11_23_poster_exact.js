const fs=require('fs');
const assert=require('assert');
const js=fs.readFileSync('sns-audit/audit.js','utf8');
const css=fs.readFileSync('sns-audit/audit.css','utf8');
const html=fs.readFileSync('sns-audit/index.html','utf8');

assert(js.includes('class="ig-poster-link"'));
assert(js.includes('target="_blank"'));
assert(js.includes('aria-label="1枚目を原寸で開く"'));
const posterBranch=js.slice(js.indexOf("if(slide.kind==='article-poster')"), js.indexOf("if(slide.kind==='article-spots')"));
assert(!posterBranch.includes('ig-poster-count'), 'poster count overlay should be removed');
assert(!posterBranch.includes('ig-poster-footer'), 'poster footer overlay should be removed');
assert(css.includes('.ig-poster-link .ig-poster-image'));
assert(css.includes('object-fit:contain'));
assert(css.includes('transform:none'));
assert(html.includes('audit.css?v=201123'));
assert(html.includes('audit.js?v=201123'));
console.log('v20.11.23 poster exact display: PASS');
