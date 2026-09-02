const fs=require('fs');const assert=require('assert');const home=fs.readFileSync('index.html','utf8');const cfg=fs.readFileSync('affiliate-config.js','utf8');
// v20.5 is the post-approval successor to the preapproval build: review-safe copy remains, affiliate tooling is now intentionally live.
assert.ok(home.includes('affiliateAudit'),'post-approval home exposes private audit shortcut');
assert.ok(fs.existsSync('affiliate-audit/index.html'),'post-approval build restores affiliate audit');
assert.ok(cfg.includes('linkSwitch:'),'post-approval build contains LinkSwitch config');
assert.ok(home.includes('食べたい')||home.includes('MOOD FIRST'),'public-facing copy remains editorial/user-centered');
console.log('v20.4 preapproval transition test passed');
