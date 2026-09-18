const fs=require('fs');const assert=require('assert');
const app=fs.readFileSync('app.js','utf8');
const index=fs.readFileSync('index.html','utf8');
assert(index.includes("G-M99DNGD18F"),'GA4 measurement ID missing');
for(const event of ["kibun_start","recommendation_generate","select_content","spot_outbound_click"]){
  assert(app.includes("'"+event+"'"),event+" tracking missing");
}
assert(app.includes("available_minutes:displayMinutes"),'recommendation duration param missing');
assert(app.includes("vibe_keys:selectedVibes.join('|')"),'recommendation vibe param missing');
assert(app.includes("link_type:'official'"),'official outbound tracking missing');
assert(app.includes("link_type:'affiliate'"),'affiliate outbound tracking missing');
for(const legacy of ["spot_open","external_link_click","affiliate_click"]){
  assert(app.includes("'"+legacy+"'"),legacy+" legacy event must remain");
}
console.log('paid-social GA4 funnel tracking: OK');
