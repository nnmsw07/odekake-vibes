const fs=require('fs'),assert=require('assert'),vm=require('vm');
const html=fs.readFileSync('sns-audit/index.html','utf8');
const js=fs.readFileSync('sns-audit/audit.js','utf8');
const css=fs.readFileSync('sns-audit/audit.css','utf8');
const media=fs.readFileSync('magazine/magazine-media.js','utf8');
assert(html.includes('../media.js?v=20113'),'SNS Audit must load shared media resolver');
assert(!html.includes('../magazine/magazine-media.js?v=2112'),'SNS Audit should not depend on partial magazine hero map');
assert(js.includes('window.KibunMedia?.resolvePlacePhoto?.(spot)'),'SNS Audit must resolve through shared KibunMedia');
assert(js.includes("photo_index_override"),'SNS Audit should surface audited hero index');
assert(js.includes('coverSpotForSource'),'cover hero selector missing');
assert(js.includes('ig-cover-media'),'cover image markup missing');
assert(js.includes("imageMode=params.get('imageMode')==='audit'?'audit':'safe'"),'safe/audit image mode missing');
assert(js.includes('HERO PREVIEW · 権利確認'),'audit preview rights marker missing');
assert(css.includes('.ig-cover.has-cover-image'),'cover image CSS missing');
assert(css.includes('.capture-mode-switch'),'image mode switch CSS missing');

const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('data.js','utf8'),ctx);const spots=ctx.window.ODEKAKE_SEED.spots;
const byId=new Map(spots.map(s=>[s.spot_id,s]));
const mapMatch=media.match(/const HERO_SPOTS = (\{.*\});/);
assert(mapMatch,'magazine HERO_SPOTS map missing');
const heroMap=JSON.parse(mapMatch[1]);
for(const [id,m] of Object.entries(heroMap)){
  const s=byId.get(id);assert(s,`missing spot ${id}`);
  const expected=s.media_strategy?.google_places?.photo_index_override;
  assert.strictEqual(m.photoIndex,Number.isInteger(expected)?expected:null,`magazine hero audit index mismatch ${id}`);
  assert.strictEqual(m.placeId,s.media_strategy?.google_places?.place_id||'',`magazine hero place id mismatch ${id}`);
}
for(const p of fs.readdirSync('magazine',{withFileTypes:true})){
  if(!p.isDirectory())continue;
  const f=`magazine/${p.name}/index.html`;if(!fs.existsSync(f))continue;
  const t=fs.readFileSync(f,'utf8');
  if(t.includes('magazine-media.js?v='))assert(t.includes('magazine-media.js?v=2113'),`stale magazine-media cachebuster ${f}`);
}
console.log(`v20.11.3 SNS cover/hero checks passed (${Object.keys(heroMap).length} magazine heroes aligned)`);
