const fs=require('fs');
const assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');
const audit=read('sns-audit/audit.js');
const css=read('sns-audit/audit.css');
const index=read('sns-audit/index.html');
const imageAudit=read('sns-audit/image-audit.js');

assert.ok(audit.includes("['quote','metrics','best','moment','facts']"),'five note variants missing');
assert.ok(audit.includes('function noteCardHtml(spot,idx,imageMode)'),'note renderer missing');
assert.ok(audit.includes("noteCardHtml(slide.spot,idx,imageMode)"),'no-photo slides are not using varied notes');
for(const cls of ['note-quote','note-metrics','note-best','note-moment','note-facts']){
  assert.ok(audit.includes(cls),`audit missing ${cls}`);
  assert.ok(css.includes(`.${cls}`),`css missing ${cls}`);
}
for(const label of ['EDITOR\'S PICK','MOOD CHECK','BEST FOR','KIBUN MOMENT','QUICK NOTE']){
  assert.ok(audit.includes(label),`label missing ${label}`);
}
assert.ok(audit.includes("'note-quote','note-metrics','note-best','note-moment','note-facts'"),'auto-image cleanup for variant classes missing');
assert.ok(index.includes('audit.css?v=201112')&&index.includes('audit.js?v=201112')&&index.includes('image-audit.js?v=201112'),'v20.11.12 cache bust missing');
assert.ok(imageAudit.includes("const VERSION='20.11.12'"),'image audit version mismatch');
assert.ok(audit.includes("const bodyText=media?slide.body:truncate(slide.body,48)"),'compact no-photo description regression');
console.log('v20.11.12 note variety: PASS');
