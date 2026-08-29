const assert = require('assert');
const fs = require('fs');
const seed = JSON.parse(fs.readFileSync('seed.json','utf8'));
assert.equal(seed.spots.length, 211);
assert.equal(seed.metadata.version, '0.19.5.4');
const byId = Object.fromEntries(seed.spots.map(s => [s.spot_id, s]));
const expected = {
  spot_047:'https://www.kanagawa-park.or.jp/kannonzaki/',
  spot_056:'https://www.kanagawa-park.or.jp/shikinomori/',
  spot_057:'https://www.kanagawa-park.or.jp/sagamihara/',
  spot_067:'https://www.tfd.metro.tokyo.lg.jp/taiken/hkkan/',
  spot_090:'https://rise.sc/',
  spot_110:'https://www.aqua-park.jp/aqua/',
  spot_122:'https://metsa-hanno.com/',
  spot_125:'https://www.tokyo-zoo.net/inokashira/',
  spot_134:'https://www.shijou.metro.tokyo.lg.jp/info/0/kenngaku/kenngaku1',
  spot_170:'https://www.cinemasunshine.co.jp/pages/gdcs/',
  spot_188:'https://www.mikazuki.co.jp/ryugujo/yutoasobi/pool/garden/',
  spot_189:'https://sunsetbeachpark.jp/activity/pool/',
  spot_209:'https://www.gotokyo.org/jp/spot/1090/index.html'
};
for (const [id,url] of Object.entries(expected)) assert.equal(byId[id].official_url,url,`${id} URL`);
for (const s of seed.spots) {
  assert.ok(/^https:\/\//.test(s.official_url), `${s.spot_id} official_url must be HTTPS: ${s.official_url}`);
}
assert.ok(fs.existsSync('scripts/check_official_urls.mjs'));
console.log('V19.5.3 URL PASS: 211 HTTPS official URLs + 13 canonical fixes + audit script');
