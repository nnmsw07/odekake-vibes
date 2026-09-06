const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const code=fs.readFileSync('sns-audit/image-audit.js','utf8');
const audit=fs.readFileSync('sns-audit/audit.js','utf8');
const ctx={
  window:{ODEKAKE_SEED:{spots:[]}},
  document:{readyState:'complete',getElementById(){return null},querySelectorAll(){return[]},createElement(){return {addEventListener(){},classList:{add(){},remove(){}}}},addEventListener(){}},
  localStorage:{getItem(){return null},setItem(){},removeItem(){}},
  URL,Blob,fetch:async()=>{throw new Error('network not used')},setTimeout,clearTimeout,console,prompt(){return null}
};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(code,ctx,{filename:'image-audit.js'});
const api=ctx.KibunSnsImages;
const play={name:'PLAY! PARK ERIC CARLE',city:'世田谷区',prefecture:'東京都'};
const wrong={file_title:'File:Eric Carle portrait.jpg',description:'Eric Carle American author and illustrator',rights_status:'safe'};
const right={file_title:'File:PLAY PARK ERIC CARLE Tokyo.jpg',description:'PLAY! PARK ERIC CARLE in Setagaya Tokyo',rights_status:'safe'};
assert.ok(api.candidateRelevance(play,wrong)<62,'person portrait must remain rejected');
assert.ok(api.candidateRelevance(play,right)>=62,'exact venue image should remain accepted');
assert.equal(api.wikidataHitRelevant(play,{label:'Eric Carle',description:'American author and illustrator'}),false,'person Wikidata item must stay rejected');
assert.ok(audit.includes("'kibun-sns-audit-v20111-editors'"),'previous SNS Audit local state migration missing');
console.log('v20.11.12 image/state regression: PASS');
