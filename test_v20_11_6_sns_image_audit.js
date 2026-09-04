const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');

const index=read('sns-audit/index.html');
const audit=read('sns-audit/audit.js');
const imageAudit=read('sns-audit/image-audit.js');
const css=read('sns-audit/audit.css');

assert.ok(index.includes('IMAGE / RIGHTS'),'IMAGE / RIGHTS workspace tab missing');
assert.ok(index.includes('SNS IMAGE AUDIT')&&index.includes('imageAuditList'),'image audit workspace missing');
assert.ok(index.includes('image-audit.js?v=20116'),'image audit script missing');
assert.ok(index.includes('audit.js?v=20116')&&index.includes('audit.css?v=20116'),'v20.11.6 cache bust missing');
assert.ok(imageAudit.includes('commons.wikimedia.org/w/api.php'),'Wikimedia Commons API endpoint missing');
assert.ok(imageAudit.includes("origin:'*'")&&imageAudit.includes("iiprop:'url|extmetadata'"),'Commons metadata/CORS query missing');
assert.ok(imageAudit.includes('LicenseShortName')&&imageAudit.includes('LicenseUrl')&&imageAudit.includes('Artist'),'license metadata parsing missing');
assert.ok(imageAudit.includes('kibun-sns-image-audit-v20116'),'image audit persistence key missing');
assert.ok(audit.includes('KibunSnsImages?.getSafe'),'SNS capture does not prioritize selected reusable image');
assert.ok(audit.includes('Photo credits'),'caption photo credits missing');
assert.ok(audit.includes('SNS IMAGE'),'selected-image visual marker missing');
assert.ok(css.includes('.image-audit-list')&&css.includes('.image-candidate'),'image audit UI CSS missing');
assert.ok(css.includes('.sns-image-credit'),'SNS image attribution CSS missing');

class El{
  constructor(){this.value='';this.innerHTML='';this.textContent='';this.files=[];this.style={};}
  addEventListener(){} querySelectorAll(){return []} querySelector(){return null}
}
const storage={};
const ctx={
  window:{ODEKAKE_SEED:{spots:[]}},
  document:{readyState:'loading',addEventListener(){},getElementById(){return null},createElement(){return new El()}},
  localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=v,removeItem:k=>delete storage[k]},
  URL,URLSearchParams,Blob,fetch:async()=>{throw new Error('not called')},prompt:()=>'',setTimeout,clearTimeout,console
};
ctx.window=Object.assign(ctx.window,ctx);
vm.createContext(ctx);
vm.runInContext(imageAudit,ctx,{filename:'image-audit.js'});
const classify=ctx.window.KibunSnsImages.licenseStatus;
assert.equal(classify('CC BY 4.0').status,'safe');
assert.equal(classify('CC0 1.0').status,'safe');
assert.equal(classify('Public domain').status,'safe');
assert.equal(classify('CC BY-SA 4.0').status,'needs_review');
assert.equal(classify('CC BY-NC 4.0').status,'blocked');
console.log('v20.11.6 SNS Image Audit: PASS');
