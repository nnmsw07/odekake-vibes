const fs=require('fs'),vm=require('vm'),assert=require('assert');
// Legacy filename retained so v20.6 deployments are upgraded in-place. The product direction is now inbound Japan support, not overseas destination expansion.
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('affiliate-config.js','utf8'),ctx);const cfg=ctx.window.KIBUN_AFFILIATE_CONFIG;
for(const p of ['asoview','jalan_activity','activity_japan','klook'])assert.ok(cfg.linkSwitch.providers.includes(p),p);
assert.ok(cfg.providerPriority.inbound_experience.includes('klook'));assert.ok(!cfg.providerPriorityOverseas,'overseas provider routing removed');
const audit=fs.readFileSync('affiliate-audit/audit.js','utf8'),html=fs.readFileSync('affiliate-audit/index.html','utf8'),app=fs.readFileSync('app.js','utf8');
for(const p of ['jalan_activity','activity_japan','klook'])assert.ok(audit.includes(p),p);
assert.ok(html.includes('訪日・多言語向け'));assert.ok(app.includes("['inbound','日本文化・訪日向け']"));assert.ok(!app.includes("['overseas','海外']"));
console.log('v20.6 legacy migration test passed: overseas destination mode -> inbound Japan support');
