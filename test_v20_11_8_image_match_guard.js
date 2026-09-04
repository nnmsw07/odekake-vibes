const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const code=fs.readFileSync('sns-audit/image-audit.js','utf8');
const index=fs.readFileSync('sns-audit/index.html','utf8');
const audit=fs.readFileSync('sns-audit/audit.js','utf8');
const dummyEl=()=>({innerHTML:'',textContent:'',value:'',addEventListener(){},querySelectorAll(){return[]},querySelector(){return null},classList:{add(){},remove(){},toggle(){}}});
const ctx={
  window:{ODEKAKE_SEED:{spots:[]}},
  document:{readyState:'complete',getElementById(){return null},querySelectorAll(){return[]},createElement(){return dummyEl()},addEventListener(){}},
  localStorage:{getItem(){return null},setItem(){},removeItem(){}},
  URL,Blob,fetch:async()=>{throw new Error('network not used')},setTimeout,clearTimeout,console,prompt(){return null}
};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(code,ctx,{filename:'image-audit.js'});
const api=ctx.KibunSnsImages;
assert.equal(api.version,'20.11.8');
assert.ok(index.includes('image-audit.js?v=20118'),'image audit cache bust missing');
assert.ok(index.includes('audit.js?v=20118'),'capture cache bust missing');
assert.ok(code.includes('async function autoFindSafe'),'auto open photo resolver regressed');
assert.ok(audit.includes('resolveAutoSnsImages'),'capture auto injection regressed');

const play={name:'PLAY! PARK ERIC CARLE',city:'世田谷区',prefecture:'東京都'};
const wrong={file_title:'File:Eric Carle portrait.jpg',description:'Eric Carle American author and illustrator',rights_status:'safe'};
const right={file_title:'File:PLAY PARK ERIC CARLE Tokyo.jpg',description:'PLAY! PARK ERIC CARLE in Setagaya Tokyo',rights_status:'safe'};
assert.ok(api.candidateRelevance(play,wrong)<62,'person portrait must not pass venue match');
assert.ok(api.candidateRelevance(play,right)>=62,'exact venue image should pass');
assert.equal(api.wikidataHitRelevant(play,{label:'Eric Carle',description:'American author and illustrator'}),false,'person Wikidata item must not match venue');
assert.equal(api.wikidataHitRelevant(play,{label:'PLAY! PARK ERIC CARLE',description:'indoor playground in Tokyo'}),true,'exact venue Wikidata item should match');

const miraikan={name:'日本科学未来館',city:'江東区',prefecture:'東京都'};
const miraikanImg={file_title:'File:Miraikan Tokyo 2024.jpg',description:'National Museum of Emerging Science and Innovation, Tokyo',rights_status:'safe'};
assert.ok(api.candidateRelevance(miraikan,miraikanImg)>=62,'known alias should match Miraikan');
console.log('v20.11.8 image match guard: PASS');
