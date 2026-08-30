const assert = require('assert');
const fs = require('fs');
const R = require('./recommender.js');
const seed = JSON.parse(fs.readFileSync('seed.json','utf8'));
const byId = Object.fromEntries(seed.spots.map(s => [s.spot_id,s]));

assert.equal(seed.spots.length,241);
assert.ok(['0.19.5.4','0.19.6','0.19.7'].includes(seed.metadata.version));

// Operational copy / canonical naming.
assert.equal(byId.spot_199.name,'ガイソーウォーターパーク引地台');
assert.ok(byId.spot_199.aliases.includes('引地台温水プール'));
assert.ok(byId.spot_199.dynamic_snapshot.age_note.includes('おむつ'));
assert.ok(byId.spot_191.dynamic_snapshot.opening_hours_text.includes('第2火曜') || byId.spot_191.dynamic_snapshot.temporary_note.includes('第2火曜'));
assert.ok(byId.spot_211.dynamic_snapshot.opening_hours_text.includes('10:00〜18:00'));
assert.ok(byId.spot_168.dynamic_snapshot.opening_hours_text.includes('最終入館16:30'));
assert.equal(byId.spot_184.official_url,'https://www.kanagawa-park.or.jp/tujidou/pool.html');
assert.equal(byId.spot_198.official_url,'https://www.maholova-minds.com/kuapark/index.php');
assert.equal(byId.spot_002.dynamic_snapshot.temporary_note,null);
assert.equal(byId.spot_007.dynamic_snapshot.temporary_note,null);
assert.equal(byId.spot_190.dynamic_snapshot.temporary_note,null);

function excluded(id,date){
  const r=R.recommend(seed,{selectedVibes:[],audience:'family',childAgeMonths:15,weather:'any',availableMinutes:240,currentDate:`${date}T12:00:00+09:00`});
  return r.excluded.find(x=>x.spot_id===id);
}

// Existing long-term closure remains enforced.
assert.ok(excluded('spot_053','2026-08-29'));
assert.ok(!excluded('spot_053','2026-09-05'));

// Seasonal pools are not recommended outside their 2026 season.
assert.ok(!excluded('spot_183','2026-09-13'));
assert.ok(excluded('spot_183','2026-09-14'));
assert.ok(!excluded('spot_184','2026-09-13'));
assert.ok(excluded('spot_184','2026-09-14'));
assert.ok(excluded('spot_197','2026-09-01'));

// Known closure dates/ranges are hard-filtered.
assert.ok(excluded('spot_185','2026-09-03'));
assert.ok(excluded('spot_185','2026-09-08'));
assert.ok(!excluded('spot_185','2026-09-12'));
assert.ok(excluded('spot_187','2026-09-02'));
assert.ok(!excluded('spot_187','2026-09-05'));
assert.ok(excluded('spot_198','2026-09-02'));
assert.ok(excluded('spot_198','2026-09-05'));
assert.ok(!excluded('spot_198','2026-09-08'));
assert.ok(excluded('spot_196','2026-09-08'));
assert.ok(!excluded('spot_196','2026-09-09'));

// Split Honmoku season: Sep 7-11 closed, Sep 12-13 open.
assert.ok(excluded('spot_195','2026-09-08'));
assert.ok(!excluded('spot_195','2026-09-12'));

// Future maintenance dates are encoded.
assert.ok(excluded('spot_193','2026-12-10'));
assert.ok(!excluded('spot_193','2026-12-22'));
assert.ok(excluded('spot_194','2026-10-08'));
assert.ok(excluded('spot_194','2026-10-20'));
assert.ok(!excluded('spot_194','2026-11-02'));

console.log('V19.5.4 OPERATIONS PASS: names/hours + seasonal/closure hard filters');
