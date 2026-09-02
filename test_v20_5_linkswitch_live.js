const fs=require('fs'),vm=require('vm'),assert=require('assert');const read=f=>fs.readFileSync(__dirname+'/'+f,'utf8');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(read('affiliate-config.js'),ctx);const cfg=ctx.window.KIBUN_AFFILIATE_CONFIG;
assert.strictEqual(cfg.linkSwitch.enabled,true);assert.strictEqual(cfg.linkSwitch.tagInstalled,true);assert.ok(cfg.sourceLinks.spot_307.length);assert.ok(cfg.providerPriority.food.includes('ikyu_restaurant'));assert.ok(cfg.providerPriority.experience.includes('asoview'));
const affiliate=read('affiliate.js');assert.ok(/mountLinkSwitchSeeds/.test(affiliate));assert.ok(/resolvedSourceUrl/.test(affiliate));
const idx=read('index.html');assert.ok(idx.indexOf('affiliate.js?v=2050')<idx.indexOf('aml.valuecommerce.com/vcdal.js'),'seed anchors mount before LinkSwitch loader');assert.ok(/var vc_pid = "892690966"/.test(idx));
const audit=read('affiliate-audit/index.html');assert.ok(/変換テスト/.test(audit));assert.ok(/892690966/.test(audit));
console.log('v20.5 LinkSwitch live wiring passed');
