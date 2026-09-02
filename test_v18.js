
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('seed.json','utf8'));
if (data.spots.length < 291) throw new Error(`expected current seed >=291 spots, got ${data.spots.length}`);
const ids = new Set(data.spots.map(s => s.spot_id));
for (let i=96;i<=165;i++){
  const id = `spot_${String(i).padStart(3,'0')}`;
  if(!ids.has(id)) throw new Error(`missing ${id}`);
}
const vibes = ['cool','nature','extraordinary','scenic','stroll','relax','shopping','food','culture','animals','creative','active','waterside'];
for(const s of data.spots){
  for(const v of vibes){
    if(!(v in s.vibes_seed)) throw new Error(`${s.spot_id} missing vibe ${v}`);
  }
  for(const a of ['family','partner','solo','friends']){
    if(!(a in s.audience_fit)) throw new Error(`${s.spot_id} missing audience ${a}`);
  }
}
console.log('V18 seed validation PASS: current seed 291 spots');
