import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const seed=JSON.parse(fs.readFileSync(path.join(root,'seed.json'),'utf8'));
const arg=process.argv.find(x=>x.startsWith('--date='));
const today=(arg?arg.slice(7):new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'}));
const DAY=86400000;
const dayMs=s=>new Date(`${s}T12:00:00+09:00`).getTime();
const generic=/営業時間.*公式|営業日.*公式|最新.*公式.*確認|入館時間.*公式/;
const rows=[];
for(const s of seed.spots){
  const snap=s.dynamic_snapshot||{};
  const flags=[];
  if(!snap.checked_at) flags.push('NO_CHECK_DATE');
  else {
    const age=Math.floor((dayMs(today)-dayMs(snap.checked_at))/DAY);
    if(age>14) flags.push(`STALE_${age}D`);
  }
  if(generic.test(snap.opening_hours_text||'')) flags.push('GENERIC_HOURS');
  const av=s.availability_constraints||{};
  const ranges=Array.isArray(av.available_ranges)?av.available_ranges:[];
  if(ranges.length && ranges.every(r=>r.until && r.until<today)) flags.push('SEASON_RANGE_EXPIRED');
  if(flags.length) rows.push({spot_id:s.spot_id,name:s.name,checked_at:snap.checked_at||'',flags:flags.join(','),hours:snap.opening_hours_text||''});
}
console.log(`Operating snapshot audit: ${seed.spots.length} spots / ${rows.length} flagged / date ${today}`);
for(const r of rows) console.log(`${r.spot_id}\t${r.name}\t${r.checked_at}\t${r.flags}\t${r.hours}`);
