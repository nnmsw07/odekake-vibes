const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=__dirname;
const text=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(text(p));
const ja=text('index.html');
const en=text('en/index.html');
const css=text('styles.css');
const encss=text('en/styles.css');
const app=text('app.js');
const enapp=text('en/app.js');
const plans=text('plans.js');
const planModule=require('./plans.js');
const jaMag=text('magazine/index.html');
const enMag=text('en/magazine/index.html');
const jaPlans=text('plans/index.html');
const enPlans=text('en/plans/index.html');
const overrides=json('HERO_OVERRIDES_v20_19_0.json');
const seed=json('seed.json');
const spot=id=>seed.spots.find(s=>s.spot_id===id);
const count=(s,re)=>(s.match(re)||[]).length;
const requiredArticles=['comfortable-day','stage-day','whats-on-weekend','books-and-architecture','indoor-adult-day','yokohama-after-curtain'];
const requiredPlans=['stage_hatsudai_ballet','stage_shibuya_orb_sky','stage_yokohama_kaat_harbor','stage_yokohama_classical_art','stage_ikebukuro_theatre_park','stage_ginza_kabuki_art','stage_ariake_musical_smallworlds','stage_billboard_hammerhead'];
const checks=[
  ['JA v20.19 cache',ja.includes('styles.css?v=201901')&&ja.includes('app.js?v=201900')],
  ['EN v20.19 cache',en.includes('/styles.css?v=201901')&&en.includes('/en/styles.css?v=201901')&&en.includes('/en/app.js?v=201900')],
  ['header favorite removed JA',!ja.includes('id="favoritesBtn"')&&!ja.includes('favorites-count')],
  ['header favorite removed EN',!en.includes('id="favoritesBtn"')&&!en.includes('favorites-count')],
  ['language only header action JA',ja.includes('class="lang-switch refined-lang"')&&ja.includes('>EN<')],
  ['language only header action EN',en.includes('class="lang-switch refined-lang"')&&en.includes('>JA<')],
  ['comfortable mood JA',app.includes("comfortable:['assets/vibes/comfortable.svg','心地よく過ごしたい','その季節にちょうどいい一日']")],
  ['comfortable seasonal mapping JA',app.includes("v==='comfortable'?comfortVibeForToday():v")],
  ['comfortable mood EN',enapp.includes("comfortable:{name:'Feel comfortable',desc:'A day that fits the season'")],
  ['comfortable seasonal mapping EN',enapp.includes("v==='comfortable'?comfort:v")],
  ['approved mood composition CSS',css.includes('one editorial hero mood + two supporting moods')&&css.includes('.mood-card-primary{grid-column:1/-1;height:172px!important}')],
  ['approved mobile fidelity pass',css.includes('fidelity pass — stay close to the approved mobile mock')&&css.includes('.audience-picker{display:flex!important')&&css.includes('content:"おすすめ"')&&css.includes('.hero>.eyebrow,.hero>h1,.hero>.hero-copy{display:none!important}')],
  ['progress labels JA',ja.includes('class="mood-progress-labels"')&&ja.includes('>やりたいこと<')],
  ['progress labels EN',en.includes('class="mood-progress-labels"')&&en.includes('>Things to do<')],
  ['two-column activity rows CSS',css.includes('STEP 2: two-column rows with icon, copy and a selection circle')&&css.includes('.vibe-group-activity .vibe-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important')],
  ['English composition parity CSS',encss.includes('v20.19.0 — English shares the approved mood-first mobile composition')&&encss.includes('.en-site .vibe-group-activity .vibe-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important')],
  ['paw icon JA',app.includes("dog:'<svg viewBox=\"0 0 24 24\"><circle cx=\"7\" cy=\"7.2\"")],
  ['paw icon EN',enapp.includes("dog:'<circle cx=\"7\" cy=\"7.2\"")],
  ['new mood image directory used JA',app.includes("assets/mood-v201900/comfortable.webp")],
  ['new mood image directory used EN',enapp.includes('/assets/mood-v201900/${key}.webp')],
  ['all mood images exist',['comfortable','extraordinary','relax'].every(x=>fs.existsSync(path.join(root,'assets/mood-v201900',`${x}.webp`)))],
  ['refreshed vibe icons exist',['comfortable','nature','scenic','stroll','shopping','food','culture','animals','creative','active','waterside','extraordinary','relax'].every(x=>fs.existsSync(path.join(root,'assets/vibes',`${x}.svg`)))],
  ['refreshed nav icons exist',['article','plan','spot','mood'].every(x=>fs.existsSync(path.join(root,'assets/nav',`${x}.svg`)))],
  ['six new JA features',requiredArticles.every(slug=>jaMag.includes(`href="${slug}/"`))],
  ['six new EN features',requiredArticles.every(slug=>enMag.includes(`/en/magazine/${slug}/`))],
  ['JA feature hub expanded',count(jaMag,/class="article-card"/g)>=40],
  ['EN feature hub expanded',count(enMag,/class="magazine-preview-card /g)>=12],
  ['eight stage plans in data',requiredPlans.every(id=>plans.includes(`id:'${id}'`))],
  ['eight stage plans render from current seed',requiredPlans.every(id=>{const p=planModule.curatedPlanPreview(seed,id);return p&&p.curated_id===id&&p.spot_ids.length>=1;})],
  ['JA plan hub expanded',count(jaPlans,/class="plan-library-card"/g)>=52],
  ['EN plan hub expanded',count(enPlans,/class="en-plan-card"/g)>=14],
  ['latest photo override count',Object.keys(overrides.photo_index_overrides||{}).length===211],
  ['latest place override count',Object.keys(overrides.place_overrides||{}).length===18],
  ['spot_489 photo override',overrides.photo_index_overrides.spot_489===0],
  ['spot_459 place override',overrides.place_overrides.spot_459?.place_id==='ChIJq_fYt4iLGGARrOojmQ4IMyE'],
  ['spot_460 place override',overrides.place_overrides.spot_460?.place_id==='ChIJBQMIIgWLGGARUDNpuFwJYEQ'],
  ['spot_459 override propagated',spot('spot_459')?.media_strategy?.google_places?.place_id==='ChIJq_fYt4iLGGARrOojmQ4IMyE'&&spot('spot_459')?.media_strategy?.google_places?.photo_index_override===0],
  ['spot_460 override propagated',spot('spot_460')?.media_strategy?.google_places?.place_id==='ChIJBQMIIgWLGGARUDNpuFwJYEQ'&&spot('spot_460')?.media_strategy?.google_places?.photo_index_override===0],
  ['spot_489 photo propagated',spot('spot_489')?.media_strategy?.google_places?.photo_index_override===0],
  ['seed metadata version',seed.metadata?.version==='0.20.19.0'],
];
const failed=checks.filter(([,ok])=>!ok);
if(failed.length){
  console.error('v20.19.0 FAIL');
  failed.forEach(([name])=>console.error(' - '+name));
  process.exit(1);
}
console.log(`v20.19.0 PASS: ${checks.length} UI/content/override checks`);
