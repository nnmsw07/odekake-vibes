const fs=require('fs'),vm=require('vm'),assert=require('assert');
const app=fs.readFileSync(__dirname+'/app.js','utf8');
const idx=fs.readFileSync(__dirname+'/index.html','utf8');
assert(app.includes('https://www.instagram.com/popular/${encodeURIComponent(q)}/'),'new Instagram popular URL missing');
assert(app.includes('site:instagram.com'),'Google Instagram fallback missing');
assert(app.includes('data-instagram-search-fallback'),'fallback CTA missing');
assert(!app.includes('https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(q)}'),'legacy generated search URL remains');
assert(/app\.js\?v=(?:2081|2090|2091)/.test(idx));assert(/data\.js\?v=(?:2081|2082)/.test(idx));assert(/styles\.css\?v=(?:2081|2083|2091)/.test(idx));
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/data.js','utf8'),ctx);
const seed=ctx.window.ODEKAKE_SEED;assert.ok(['0.20.8.1','0.20.8.2'].includes(seed.metadata.version));assert.strictEqual(seed.spots.length,431);
for(const s of seed.spots){assert(!String(s.official_url||'').includes('/explore/search/keyword/'),`${s.spot_id} legacy official_url`);const raw=JSON.stringify(s);assert(!raw.includes('/explore/search/keyword/'),`${s.spot_id} legacy Instagram search URL`);}
console.log('v20.8.1 Instagram link fix checks: OK');
