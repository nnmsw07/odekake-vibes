#!/usr/bin/env node
import fs from 'node:fs';
const events=JSON.parse(fs.readFileSync('events.json','utf8'));
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const ids=new Set(seed.spots.map(s=>s.spot_id));
const errors=[],warnings=[];const seen=new Set();
const req=(ok,msg)=>{if(!ok)errors.push(msg)};const warn=(ok,msg)=>{if(!ok)warnings.push(msg)};
const types=new Set(Object.keys(events.metadata?.types||{}));
for(const e of events.events||[]){
 req(e.event_id,`event_id missing: ${e.title||'unknown'}`);req(!seen.has(e.event_id),`duplicate event_id: ${e.event_id}`);seen.add(e.event_id);
 req(ids.has(e.venue_spot_id),`${e.event_id}: unknown venue ${e.venue_spot_id}`);req(types.has(e.event_type),`${e.event_id}: unknown type ${e.event_type}`);
 req(/^\d{4}-\d{2}-\d{2}$/.test(e.start_date||''),`${e.event_id}: bad start_date`);req(/^\d{4}-\d{2}-\d{2}$/.test(e.end_date||''),`${e.event_id}: bad end_date`);req((e.end_date||'')>=(e.start_date||''),`${e.event_id}: end before start`);
 req(/^https:\/\//.test(e.official_url||''),`${e.event_id}: official_url must be https`);req(e.checked_at===events.metadata.checked_at,`${e.event_id}: checked_at mismatch`);
 warn(Boolean(e.title_en),`${e.event_id}: missing English title`);warn(Boolean(e.schedule_summary_en),`${e.event_id}: missing English summary`);
 if(e.availability==='specific_dates')req(Array.isArray(e.specific_dates)&&e.specific_dates.length>0,`${e.event_id}: specific_dates required`);
}
const today=new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'});const upcoming=(events.events||[]).filter(e=>(e.end_date||e.start_date)>=today);
warn(upcoming.length>=15,`Only ${upcoming.length} upcoming events remain; refresh WHAT'S ON data.`);
console.log(`Event audit ${errors.length?'FAIL':'PASS'}: ${(events.events||[]).length} events / ${types.size} types / ${upcoming.length} upcoming / ${errors.length} errors / ${warnings.length} warnings`);
for(const x of errors)console.error('ERROR',x);for(const x of warnings)console.warn('WARN ',x);if(errors.length)process.exit(1);
