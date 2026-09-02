const assert=require('assert');
const fs=require('fs');
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const added=seed.spots.filter(s=>/^spot_16[6-9]$|^spot_17[0-4]$/.test(s.spot_id));
assert.equal(added.length,9,'V19.2 must contain 9 new spots');
for(const name of ['檜原 森のおもちゃ美術館','UE FANTASIA＋','魔法の文学館','The Library Lounge','BAR PANORAMA','渋谷区ふれあい植物センター','ワーナー ブラザース スタジオツアー東京','夢の島熱帯植物館','RÊVE DES LUMIÈRES']){
  const s=seed.spots.find(x=>x.name===name);
  assert.ok(s,`missing spot: ${name}`);
  assert.ok(s.media_strategy?.google_places?.query,`${name}: missing Google Places query`);
  assert.equal(s.media_strategy?.current_provider,'ai',`${name}: AI fallback must remain current provider`);
}
console.log('V19.2 additions PASS: 9 Instagram-inspired spots added');
