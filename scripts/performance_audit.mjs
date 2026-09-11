#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const seed=JSON.parse(fs.readFileSync(path.join(root,'seed.json'),'utf8'));
const data=JSON.parse(fs.readFileSync(path.join(root,'performances.json'),'utf8'));
const spots=new Map(seed.spots.map(s=>[s.spot_id,s]));
const allowed=new Set(['ballet','opera','musical','theater','kabuki','noh_kyogen','classical','dance','live','family']);
const errors=[],warnings=[],ids=new Set();
const iso=/^\d{4}-\d{2}-\d{2}$/;
for(const p of data.performances||[]){
  if(!p.performance_id||ids.has(p.performance_id))errors.push(`duplicate/missing performance_id: ${p.performance_id||'(missing)'}`);ids.add(p.performance_id);
  if(!spots.has(p.venue_spot_id))errors.push(`${p.performance_id}: unknown venue ${p.venue_spot_id}`);
  if(!allowed.has(p.genre))errors.push(`${p.performance_id}: unsupported genre ${p.genre}`);
  if(!iso.test(p.start_date||'')||!iso.test(p.end_date||''))errors.push(`${p.performance_id}: invalid date`);
  if((p.end_date||'')<(p.start_date||''))errors.push(`${p.performance_id}: end before start`);
  if(!/^https:\/\//.test(p.official_url||''))errors.push(`${p.performance_id}: official_url must use https`);
  if(!iso.test(p.checked_at||''))errors.push(`${p.performance_id}: checked_at missing/invalid`);
}
const profiles=seed.spots.filter(s=>s.performance_profile);
for(const s of profiles){
  if(!/^https:\/\//.test(s.performance_profile.schedule_source_url||''))errors.push(`${s.spot_id}: performance schedule source missing`);
  if(!iso.test(s.performance_profile.checked_at||''))errors.push(`${s.spot_id}: performance checked_at missing/invalid`);
  if(!data.performances.some(p=>p.venue_spot_id===s.spot_id))warnings.push(`${s.spot_id}: performance profile has no events`);
}
const required=['ballet','opera','musical','theater','kabuki','noh_kyogen','classical','dance','live','family'];
for(const g of required)if(!data.performances.some(p=>p.genre===g))errors.push(`genre missing: ${g}`);
const today=new Date().toISOString().slice(0,10);const upcoming=(data.performances||[]).filter(p=>(p.end_date||p.start_date)>=today);
if(upcoming.length<20)warnings.push(`only ${upcoming.length} upcoming performances remain; refresh line-up soon`);
const summary={version:data.metadata?.version,venues:profiles.length,performances:(data.performances||[]).length,upcoming:upcoming.length,errors,warnings,ok:errors.length===0};
console.log(`Performance audit ${summary.ok?'PASS':'FAIL'}: ${summary.venues} venues / ${summary.performances} performances / ${summary.upcoming} upcoming / ${errors.length} errors / ${warnings.length} warnings`);
for(const x of errors)console.error('ERROR',x);for(const x of warnings)console.warn('WARN ',x);
if(errors.length)process.exit(1);
