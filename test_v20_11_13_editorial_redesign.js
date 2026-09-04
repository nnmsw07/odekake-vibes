const fs=require('fs');
const assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');
const audit=read('sns-audit/audit.js');
const css=read('sns-audit/audit.css');
const index=read('sns-audit/index.html');
const imageAudit=read('sns-audit/image-audit.js');

assert.ok(audit.includes("['statement','reasons','moment']"),'three editorial variants missing');
for(const cls of ['note-statement','note-reasons','note-moment']){
  assert.ok(audit.includes(cls),`audit missing ${cls}`);
  assert.ok(css.includes(`.${cls}`),`css missing ${cls}`);
}
for(const old of ['QUICK NOTE','MOOD CHECK','BEST FOR','KIBUN MOMENT','ig-note-fact-grid','ig-note-head']){
  assert.ok(!audit.includes(old),`old dashboard-like pattern remains: ${old}`);
}
assert.ok(css.includes('.ig-note-main')&&css.includes('.ig-note-reason-list'),'new editorial typography missing');
assert.ok(audit.includes("truncate(slide.body,38)"),'no-photo copy should be compact');
assert.ok(index.includes('audit.css?v=201113')&&index.includes('audit.js?v=201113')&&index.includes('image-audit.js?v=201113'),'v20.11.13 cache bust missing');
assert.ok(imageAudit.includes("const VERSION='20.11.13'"),'image audit version mismatch');
console.log('v20.11.13 editorial redesign: PASS');
