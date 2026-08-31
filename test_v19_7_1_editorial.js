const fs=require('fs'),vm=require('vm'),assert=require('assert');
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('data.js','utf8'),ctx);
const seed=ctx.window.ODEKAKE_SEED, edited=seed.spots.filter(s=>s.editorial?.title&&s.editorial?.lead);
assert.equal(seed.spots.length,291);assert.ok(/^0\.19\.(?:7(?:\.\d+)?|8(?:\.\d+)?|9)$/.test(seed.metadata.version));assert.ok(edited.length>=10);
for(const s of edited){assert(s.editorial.title.length>=10);assert(s.editorial.lead.length>=25);assert(s.editorial.moment);assert(s.editorial.collection);assert(Array.isArray(s.editorial.best_for)&&s.editorial.best_for.length>=2);}
const app=fs.readFileSync('app.js','utf8'),index=fs.readFileSync('index.html','utf8');
assert(app.includes('editorial_story_open'));assert(app.includes('renderEditorial'));assert(index.includes('KIBUN STORIES'));assert(index.includes('editorialGrid'));
console.log('V19.7.1 EDITORIAL PASS: 291 spots + 10 editorial stories + home magazine layer');
