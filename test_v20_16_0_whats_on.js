const fs=require('fs'),path=require('path'),assert=require('assert');
const root=__dirname,text=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
const seed=JSON.parse(text('seed.json')),events=JSON.parse(text('events.json')),perfs=JSON.parse(text('performances.json'));
assert.strictEqual(seed.metadata.version,'0.20.16.0');
assert.strictEqual(events.metadata.version,'0.20.16.0');
assert(events.events.length>=24,`expected >=24 events, got ${events.events.length}`);
const spotIds=new Set(seed.spots.map(s=>s.spot_id)),ids=new Set(),types=new Set();
for(const e of events.events){assert(e.event_id&&!ids.has(e.event_id),`unique id ${e.event_id}`);ids.add(e.event_id);assert(spotIds.has(e.venue_spot_id),`${e.event_id} venue exists`);assert(/^https:\/\//.test(e.official_url),`${e.event_id} official url`);assert(/^\d{4}-\d{2}-\d{2}$/.test(e.start_date),`${e.event_id} start`);assert(/^\d{4}-\d{2}-\d{2}$/.test(e.end_date),`${e.event_id} end`);assert(e.title_en,`${e.event_id} EN title`);types.add(e.event_type)}
for(const t of ['exhibition','seasonal','family','workshop','festival','experience','show']) assert(types.has(t),`type coverage ${t}`);
for(const f of ['whats-on/index.html','whats-on/app.js','en/whats-on/index.html','en/whats-on/app.js','events.js','scripts/event_audit.mjs'])assert(exists(f),`${f} exists`);
for(const f of ['whats-on/index.html','en/whats-on/index.html']){const h=text(f);for(const id of ['whatsOnTypeFilters','whatsOnAreaFilters','whatsOnWhenFilters','whatsOnAudienceFilters','whatsOnSearch','whatsOnGrid'])assert(h.includes(id),`${f}: ${id}`);assert(h.includes('events.js?v=201600'),`${f}: events data loaded`)}
const home=text('index.html'),enHome=text('en/index.html'),app=text('app.js'),enApp=text('en/app.js');
assert(home.includes('whats-on/'), 'JP home links unified hub');assert(enHome.includes('/en/whats-on/'),'EN home links unified hub');assert(home.includes('events.js?v=201600'),'JP home loads events');assert(enHome.includes('events.js?v=201600'),'EN home loads events');
assert(app.includes('eventSectionHtml'),'JP spot detail event section');assert(enApp.includes('eventSectionHtml'),'EN spot detail event section');assert(app.includes('window.KIBUN_EVENTS'),'JP preview uses events');assert(enApp.includes('window.KIBUN_EVENTS'),'EN preview uses events');
const samples=[['evt_nact_louvre','spot_152'],['evt_yma_marie','spot_101'],['evt_aquapark_momiji','spot_110'],['evt_redbrick_oktoberfest','spot_084'],['evt_asobono_synapushu','spot_032'],['evt_grosso_gavan','spot_147']];for(const [id,spot] of samples){const e=events.events.find(x=>x.event_id===id);assert(e&&e.venue_spot_id===spot,`${id} sample`)}
assert(perfs.performances.length>=60,'performance layer preserved');
const generator=text('scripts/generate_en_pages.mjs');assert(generator.includes("events.json"),'EN generator loads events');assert(generator.includes('eventSection(s)'),'EN generated spot pages include events');
const nactEn=text('en/spots/national-art-center-tokyo/index.html');assert(nactEn.includes('Louvre Museum Exhibition'),'generated EN NACT page includes current exhibition');
const seoGen=text('scripts/generate_seo_pages.mjs'),seoAudit=text('scripts/seo_audit.mjs');assert(seoGen.includes("'whats-on'"),'SEO generator includes whats-on');assert(seoAudit.includes("'whats-on'"),'SEO audit includes whats-on');
console.log(`v20.16.0 PASS: ${events.events.length} events / ${types.size} event types / ${perfs.performances.length} performances / ${seed.spots.length} spots`);
