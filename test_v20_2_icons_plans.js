const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const path=require('path');

const app=fs.readFileSync('app.js','utf8');
const home=fs.readFileSync('index.html','utf8');
const plans=fs.readFileSync('plans/index.html','utf8');
const planCss=fs.readFileSync('plans/plans.css','utf8');

const vibes=['cool','nature','extraordinary','scenic','stroll','relax','shopping','food','culture','animals','creative','active','waterside'];
for(const key of vibes){
  const webp=path.join('assets','vibes',`${key}.webp`);
  const svg=path.join('assets','vibes',`${key}.svg`);
  assert.ok(fs.existsSync(webp)||fs.existsSync(svg),`missing mood icon ${key}`);
  assert.ok(app.includes(`assets/vibes/${key}.`),`app does not reference ${key} icon`);
}
for(const name of ['family-cafe.webp','waterfront-walk.webp','culture-cafe.webp']){
  assert.ok(fs.existsSync(path.join('assets','plans',name)),`missing plan image ${name}`);
  assert.ok(plans.includes(`../assets/plans/${name}`),`plans page does not use ${name}`);
}
assert.ok(app.includes('function renderBrowseFilters(){'),'browse filter renderer missing');
assert.ok(app.includes("trackEvent('browse_filter'"),'browse filter GA event missing');
assert.ok(!app.includes("['stage','🎭"),'legacy stage emoji remains');
assert.ok(!app.includes("['stay','🛏️"),'legacy stay emoji remains');
assert.ok(plans.includes('AI生成イメージ'),'AI image disclosure missing');
assert.ok(planCss.includes('.plan-mood-visuals'),'plan image layout CSS missing');
assert.ok(home.includes('assets/nav/article.svg')||app.includes('assets/nav/article.svg'),'bottom nav asset missing');

const sandbox={window:{}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data.js','utf8'),sandbox);
assert.ok(sandbox.window.ODEKAKE_SEED.spots.length>=306,'spot count regressed unexpectedly');
console.log('v20.2 icon + plan visual tests passed');
