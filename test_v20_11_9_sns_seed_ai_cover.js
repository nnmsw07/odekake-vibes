const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');

const index=read('sns-audit/index.html');
const audit=read('sns-audit/audit.js');
const imageAudit=read('sns-audit/image-audit.js');
const seed=read('sns-image-audit-seed.js');

assert.ok(index.includes('../sns-image-audit-seed.js?v=20119'),'SNS image seed not loaded');
assert.ok(index.includes('image-audit.js?v=20119')&&index.includes('audit.js?v=20119'),'v20.11.9 cache bust missing');
assert.ok(audit.includes('function coverThemeImage(source)'),'AI cover resolver missing');
assert.ok(audit.includes("imageMode==='safe'?coverThemeImage(source)"),'safe cover is not AI themed');
assert.ok(audit.includes('1枚目をKibunの生成AIイメージ'),'safe mode explanation missing');
assert.ok(!audit.includes("if(imageMode==='safe')resolveAutoSnsImages(document);"),'unapproved auto images still injected into publish capture');
assert.ok(imageAudit.includes("const VERSION='20.11.9'"),'image audit version missing');

const elements={};
const doc={
  readyState:'complete',
  getElementById:id=>elements[id]||null,
  querySelectorAll:()=>[],
  createElement:()=>({innerHTML:'',textContent:'',innerText:'',click(){},style:{}}),
  addEventListener(){}
};
const storage={m:{},getItem(k){return this.m[k]||null},setItem(k,v){this.m[k]=v},removeItem(k){delete this.m[k]}};
const ctx={window:{},document:doc,localStorage:storage,console,URL,Blob,setTimeout,clearTimeout,fetch:async()=>{throw new Error('fetch should not be called');},prompt:()=>null};
ctx.window=ctx;
vm.createContext(ctx);
vm.runInContext(seed,ctx,{filename:'sns-image-audit-seed.js'});
ctx.ODEKAKE_SEED={spots:[]};
vm.runInContext(imageAudit,ctx,{filename:'image-audit.js'});
const all=ctx.KibunSnsImages.all();
assert.strictEqual(Object.keys(all).length,9,'seed image count mismatch');
assert.ok(ctx.KibunSnsImages.getSafe('spot_051'),'safe selected image not available');
assert.strictEqual(ctx.KibunSnsImages.getSafe('spot_214'),null,'needs_review image must not be used as safe');
assert.strictEqual(all.spot_441.license,'CC0','seed detail missing');
console.log('v20.11.9 SNS selected-image seed + AI cover: PASS');
