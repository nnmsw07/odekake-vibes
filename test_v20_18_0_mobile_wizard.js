const fs=require('fs');
const path=require('path');
const root=__dirname;
const text=p=>fs.readFileSync(path.join(root,p),'utf8');
const ja=text('index.html');
const en=text('en/index.html');
const css=text('styles.css');
const encss=text('en/styles.css');
const app=text('app.js');
const enapp=text('en/app.js');
const checks=[
  ['JA CSS cache bump',ja.includes('styles.css?v=201800')],
  ['EN shared CSS cache bump',en.includes('/styles.css?v=201800')],
  ['EN CSS cache bump',en.includes('/en/styles.css?v=201800')],
  ['JA app cache bump',ja.includes('app.js?v=201800')],
  ['EN app cache bump',en.includes('/en/app.js?v=201800')],
  ['JA mobile CTA dock',ja.includes('id="mobileRecommendDock"')&&ja.includes('id="mobileRecommendBtn"')],
  ['EN mobile CTA dock',en.includes('id="mobileRecommendDock"')&&en.includes('id="mobileRecommendBtn"')],
  ['overflow guard',css.includes('html,body{max-width:100%;overflow-x:clip}')],
  ['mood rows replace carousel',/v20\.18\.0[\s\S]*?\.vibe-group-mood \.vibe-grid\{[\s\S]*?grid-template-columns:1fr!important[\s\S]*?overflow:visible!important/.test(css)],
  ['mood row full width',/\.vibe-group-mood \.mood-photo-card\{[\s\S]*?width:100%!important[\s\S]*?grid-template-columns:112px minmax\(0,1fr\)!important/.test(css)],
  ['activity compact two columns',/\.vibe-group-activity \.vibe-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/.test(css)],
  ['activity descriptions hidden mobile',css.includes('.activity-list-card .vibe-desc,.activity-list-card .activity-arrow{display:none!important}')],
  ['progressive step lock CSS',css.includes('.vibe-group-activity.mobile-step-locked{display:none}')],
  ['optional conditions hidden initially',css.includes('.hero:not(.wizard-has-selection) .selection-row')&&css.includes('.hero:not(.wizard-has-selection) .conditions')],
  ['fixed CTA safely above nav',/\.mobile-recommend-dock\{[^}]*bottom:84px/.test(css)],
  ['JA progressive step logic',app.includes("mobile-step-locked")&&app.includes("wizard-has-selection")&&app.includes("mobileRecommendBtn")],
  ['EN progressive step logic',enapp.includes("mobile-step-locked")&&enapp.includes("wizard-has-selection")&&enapp.includes("mobileRecommendBtn")],
  ['JA one mood at a time',app.includes("selectedVibes=[k,...selectedVibes.filter(v=>!moodKeys.includes(v))].slice(0,3)")],
  ['EN one mood at a time',enapp.includes("selectedVibes=[key,...selectedVibes.filter(x=>!MOOD_KEYS.includes(x))].slice(0,3)")],
  ['EN wizard CSS alignment',encss.includes('v20.18.0 — shared mobile wizard alignment')],
];
const failed=checks.filter(([,ok])=>!ok);
if(failed.length){console.error('v20.18.0 FAIL');failed.forEach(([name])=>console.error(' - '+name));process.exit(1);}
console.log(`v20.18.0 PASS: ${checks.length} mobile wizard checks`);
