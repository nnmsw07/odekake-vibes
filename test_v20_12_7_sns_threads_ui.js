const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const audit=fs.readFileSync('sns-audit/audit.js','utf8');
const css=fs.readFileSync('sns-audit/audit.css','utf8');
const html=fs.readFileSync('sns-audit/index.html','utf8');
const plan=fs.readFileSync('sns-audit/plan.js','utf8');
const seedCode=fs.readFileSync('sns-audit-data.js','utf8');

assert(audit.includes("version:'20.12.7'"));
assert(audit.includes('Threads Draft'));
assert(audit.includes('data-copy-draft="threads"'));
assert(audit.includes("post.channel==='Threads'"));
assert(audit.includes("post.channel==='Instagram + Threads'"));
assert(audit.includes("threads_version='20.12.7'"));
assert(!audit.includes('<h3>X Draft</h3>'));
assert(audit.includes("slide.kind==='kibun-brand-cover'"));
assert(audit.includes('行き先を決める前に、<br><em>今日の気分</em>を決めよう。'));
assert(audit.includes('予定を詰めるより、その日の気分で決めたい日に。'));

assert(css.includes('v20.12.7 — Threads + fixed brand/UI intro'));
assert(css.includes('.ig-brand-cover'));
assert(css.includes('.ig-ui-mood-cards'));
assert(css.includes('.ig-ui-step3'));

assert(html.includes('audit.css?v=20127'));
assert(html.includes('../sns-audit-data.js?v=20127'));
assert(html.includes('audit.js?v=20127'));
assert(html.includes('Instagram / Threadsの原稿'));

assert(plan.includes('"version": "20.12.7"'));
assert(!plan.includes('Instagram + X'));
const combined=(plan.match(/Instagram \+ Threads/g)||[]).length;
assert.strictEqual(combined,30);

const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(seedCode,sandbox);
const seed=sandbox.window.KIBUN_SNS_AUDIT_SEED;
assert.strictEqual(seed.version,'20.12.7');
const intro=seed.posts.find(p=>p.id==='post_brand_intro_v20127');
const why=seed.posts.find(p=>p.id==='post_threads_why_v20127');
const how=seed.posts.find(p=>p.id==='post_threads_howto_v20127');
assert(intro&&why&&how);
assert.strictEqual(intro.channel,'Instagram + Threads');
assert.strictEqual(intro.draft.carousel.length,2);
assert.deepStrictEqual(Array.from(intro.draft.carousel,x=>x.kind),['kibun-brand-cover','kibun-intro']);
assert(intro.draft.instagram.includes('行き先を決める前に、今日の気分を決めよう。'));
assert(intro.draft.instagram.includes('#KibunTrip #東京おでかけ #神奈川おでかけ'));
assert(why.draft.threads.includes('休みの日くらい、その日の気分で決めたい。'));
assert(how.draft.threads.includes('① 誰と行く？'));
assert(how.draft.threads.includes('今日ちょうどいい3つ'));

console.log('v20.12.7 SNS Threads/UI tests passed');
