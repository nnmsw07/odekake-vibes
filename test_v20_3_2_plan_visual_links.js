const fs=require('fs');
const html=fs.readFileSync('plans/index.html','utf8');
const css=fs.readFileSync('plans/plans.css','utf8');
const expected=[
  'family_umi_no_koen_sea_cafe',
  'partner_yokohama_art_walk_food',
  'family_hayama_art_garden_cafe'
];
for(const id of expected){if(!html.includes(`?plan=${id}&amp;source=plan_mood_visual`)) throw new Error(`missing mood visual plan link: ${id}`)}
if((html.match(/class="plan-mood-link/g)||[]).length!==3) throw new Error('expected 3 plan-mood-link anchors');
if(!css.includes('.plan-mood-link')) throw new Error('missing plan-mood-link css');
console.log('v20.3.2 plan visual links tests passed');
