const fs=require('fs');
const assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');
const audit=read('sns-audit/audit.js');
const imageAudit=read('sns-audit/image-audit.js');
const index=read('sns-audit/index.html');
const seed=read('sns-image-audit-seed.js');

assert.ok(audit.includes("if(imageMode==='safe')resolveAutoSnsImages(document);"),'safe capture does not trigger auto SNS image resolution');
assert.ok(audit.includes('施設一致度90以上'),'capture explanation missing strict threshold wording');
assert.ok(imageAudit.includes("const VERSION='20.11.10'"),'image audit version missing');
assert.ok((imageAudit.match(/relevantSafeCandidate\(spot,rows,90\)/g)||[]).length>=2,'strict relevance threshold not applied to auto paths');
assert.ok(index.includes('image-audit.js?v=201110')&&index.includes('audit.js?v=201110'),'cache bust missing');
assert.ok(seed.includes('spot_012')&&seed.includes('spot_441'),'existing selected image seed unexpectedly removed');
console.log('v20.11.10 strict auto-safe images: PASS');
