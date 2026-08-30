const fs=require('fs');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
if(seed.spots.length!==241) throw new Error(`expected 241 spots, got ${seed.spots.length}`);
const expectedMood=['cool','extraordinary','relax'];
for(const k of expectedMood){if(!(k in seed.vibe_definitions)) throw new Error(`missing vibe ${k}`)}
const staticPhotos=seed.spots.filter(s=>s.hero_image?.type==='photo' && s.media_strategy?.current_provider!=='official_permission');
if(staticPhotos.length) throw new Error(`CC/static photo fallback remains: ${staticPhotos.map(s=>s.spot_id).join(',')}`);
const indexed=seed.spots.filter(s=>Number.isInteger(s.media_strategy?.google_places?.photo_index_override));
const places=seed.spots.filter(s=>s.media_strategy?.google_places?.place_id);
if(indexed.length<73) throw new Error(`expected at least 73 photo overrides, got ${indexed.length}`);
if(places.length<10) throw new Error(`expected at least 10 place overrides, got ${places.length}`);
console.log(`V17.1 PASS: ${seed.spots.length} spots, ${indexed.length} photo overrides, ${places.length} place IDs, Google Places -> AI fallback`);
