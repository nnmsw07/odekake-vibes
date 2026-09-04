const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=p=>fs.readFileSync(p,'utf8');
const index=read('sns-audit/index.html'),js=read('sns-audit/audit.js'),css=read('sns-audit/audit.css'),editorial=read('sns-editorial-data.js'),seedFile=read('sns-audit-data.js');
assert(index.includes('KIBUN EDITORS')&&index.includes('IDEA / DRAFT')&&index.includes('PUBLISH / LEARN'),'Editors UI missing');
assert(index.includes('sns-editorial-data.js?v=20111')&&index.includes('sns-audit-data.js?v=20111'),'cache bust/version wiring missing');
assert(js.includes('buildIdeas')&&js.includes('draftForIdea')&&js.includes('mergeSeedPosts'),'editor workflow or seed merge missing');
assert(js.includes('kibun-sns-audit-v20111-editors')&&js.includes('kibun-sns-audit-v20101')&&js.includes('kibun-sns-audit-v2091'),'storage migration missing');
assert(css.includes('.idea-card')&&css.includes('.carousel-grid')&&css.includes('.idea-dialog'),'Editors styles missing');
for(const slug of ['terrace-after-sunset','night-starts-after-five','hotel-without-staying','parents-eat-well','seasonal-harvest'])assert(editorial.includes(slug),`editorial missing ${slug}`);
assert(seedFile.includes('"version": "20.11.0"')&&seedFile.includes('post_v20110_05'),'v20.11.0 seed posts were overwritten');
class El{constructor(id){this.id=id;this.value='';this.innerHTML='';this.textContent='';this.hidden=false;this.dataset={};this.open=false;this.classList={toggle(){},add(){},remove(){}};}addEventListener(){}setAttribute(){}querySelectorAll(){return []}querySelector(){return null}showModal(){this.open=true}close(){this.open=false}}
const ids=['ideaSummary','ideaTextFilter','ideaTypeFilter','ideaAudienceFilter','ideaAreaFilter','ideaSourceFilter','ideaList','ideaDialog','ideaDialogClose','ideaDetail','summary','addPost','copyJson','downloadJson','importJson','resetLocal','textFilter','statusFilter','auditList','flash'];
const els=Object.fromEntries(ids.map(id=>[id,new El(id)])); for(const id of ['ideaTypeFilter','ideaAudienceFilter','ideaAreaFilter','ideaSourceFilter'])els[id].value='all'; els.statusFilter.value='planned';
const ctx={window:{},document:{getElementById:id=>els[id]||(els[id]=new El(id)),querySelectorAll:()=>[],createElement:()=>new El('tmp'),body:{appendChild(){}}},localStorage:{m:{},getItem(k){return this.m[k]||null},setItem(k,v){this.m[k]=v},removeItem(k){delete this.m[k]}},navigator:{clipboard:{writeText:async()=>{}}},confirm:()=>true,setTimeout,clearTimeout,URL,Blob,console};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['data.js','sns-editorial-data.js','sns-audit-data.js'])vm.runInContext(read(f),ctx,{filename:f});ctx.window.KIBUN_AFFILIATE_CONFIG={};ctx.window.KIBUN_AFFILIATE_AUDIT_STATUS={spots:{}};vm.runInContext(js,ctx,{filename:'sns-audit/audit.js'});
const ideas=ctx.window.KIBUN_SNS_IDEAS;assert(Array.isArray(ideas)&&ideas.length>=50,`too few ideas ${ideas?.length}`);for(const slug of ['terrace-after-sunset','night-starts-after-five','hotel-without-staying','parents-eat-well','seasonal-harvest'])assert(ideas.some(i=>i.id===`article_${slug}`),`idea missing ${slug}`);
assert(ctx.window.KIBUN_SNS_DRAFT_FOR_IDEA(ideas[0]).slides.length>=4,'draft generation failed');
console.log(`v20.11.1 SNS Editors restore: PASS (${ideas.length} ideas)`);
