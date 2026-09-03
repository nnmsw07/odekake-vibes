const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');

const index=read('sns-audit/index.html');
const js=read('sns-audit/audit.js');
const css=read('sns-audit/audit.css');
const editorial=read('sns-editorial-data.js');

assert.ok(index.includes('KIBUN EDITORS')&&index.includes('IDEA / DRAFT')&&index.includes('PUBLISH / LEARN'),'Editors workspaces missing');
assert.ok(index.includes('投稿タイプ')&&index.includes('企画元')&&index.includes('ideaDialog'),'idea filters/detail dialog missing');
assert.ok(index.includes('../sns-editorial-data.js?v=20101'),'editorial catalog not loaded');
assert.ok(js.includes('buildIdeas')&&js.includes('draftForIdea')&&js.includes('priority')&&js.includes('運用に追加'),'idea generation/draft workflow missing');
assert.ok(js.includes('kibun-sns-audit-v20101')&&js.includes('kibun-sns-audit-v2091'),'new persistence + v20.9.1 migration missing');
assert.ok(css.includes('.idea-card')&&css.includes('.carousel-grid')&&css.includes('.idea-dialog'),'Editors UI CSS missing');
assert.ok(editorial.includes('tokyo-rainy-family')&&editorial.includes('family_yokohama_art_play_food'),'article/plan catalog incomplete');

class El{constructor(id){this.id=id;this.value='';this.innerHTML='';this.textContent='';this.hidden=false;this.dataset={};this.open=false;this.classList={toggle(){},add(){},remove(){}};}addEventListener(){}setAttribute(){}querySelectorAll(){return []}querySelector(){return null}showModal(){this.open=true}close(){this.open=false}}
const ids=['ideaSummary','ideaTextFilter','ideaTypeFilter','ideaAudienceFilter','ideaAreaFilter','ideaSourceFilter','ideaList','ideaDialog','ideaDialogClose','ideaDetail','summary','addPost','copyJson','downloadJson','importJson','resetLocal','textFilter','statusFilter','auditList','flash'];
const els=Object.fromEntries(ids.map(id=>[id,new El(id)]));
for(const id of ['ideaTypeFilter','ideaAudienceFilter','ideaAreaFilter','ideaSourceFilter'])els[id].value='all';
els.statusFilter.value='planned';
const ctx={window:{},document:{getElementById:id=>els[id]||(els[id]=new El(id)),querySelectorAll:()=>[],createElement:()=>new El('tmp'),body:{appendChild(){}}},localStorage:{m:{},getItem(k){return this.m[k]||null},setItem(k,v){this.m[k]=v},removeItem(k){delete this.m[k]}},navigator:{clipboard:{writeText:async()=>{}}},confirm:()=>true,setTimeout,clearTimeout,URL,Blob,console};
ctx.window=ctx;vm.createContext(ctx);
for(const f of ['data.js','sns-editorial-data.js','sns-audit-data.js'])vm.runInContext(read(f),ctx,{filename:f});
ctx.window.KIBUN_AFFILIATE_CONFIG={};ctx.window.KIBUN_AFFILIATE_AUDIT_STATUS={spots:{}};
vm.runInContext(js,ctx,{filename:'sns-audit/audit.js'});
const ideas=ctx.window.KIBUN_SNS_IDEAS;
assert.ok(Array.isArray(ideas)&&ideas.length>=45,`too few ideas: ${ideas?.length}`);
assert.ok(ideas.filter(i=>i.source==='generated').length>=12,'generated editorial ideas missing');
assert.ok(ideas.some(i=>i.source==='article')&&ideas.some(i=>i.source==='plan'),'article/plan ideas missing');
assert.ok(ideas.every(i=>i.spotIds.length>=2),'idea with insufficient spots');
const rain=ideas.find(i=>i.id==='idea_rain-yokohama');
assert.ok(rain&&rain.spotIds.length===5,'Yokohama rainy idea missing');
const rainNames=rain.spotIds.map(id=>ctx.window.ODEKAKE_SEED.spots.find(s=>s.spot_id===id)?.name||'');
assert.ok(!rainNames.some(n=>/スターバックス|bills|100本のスプーン/.test(n)),'rainy kids idea polluted by generic cafes');
const draft=ctx.window.KIBUN_SNS_DRAFT_FOR_IDEA(rain);
assert.ok(draft.slides.length>=8&&draft.instagram.includes('プロフィールのKibun')&&draft.x.length>60,'social draft generation incomplete');
console.log(`v20.10.1 SNS Editors: PASS (${ideas.length} ideas)`);
