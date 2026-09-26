import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const exists=file=>fs.existsSync(path.join(root,file));

const app=read('app.js');
const styles=read('styles.css');
const index=read('index.html');
const guideHub=read('guide/index.html');
const sitemap=read('sitemap.xml');

const guideSlugs=[
  'minatomirai-afternoon-kids',
  'yokohama-1yo-rainy',
  'yokohama-koagari-family-cafe',
  'yokohama-today-kids',
  'yokohama-walkin-kids'
];
const articlePaths=[
  'magazine/yokohama-family-cafe/index.html',
  'magazine/tokyo-rainy-family/index.html',
  'magazine/make-something/index.html',
  'magazine/yokohama-small-holiday/index.html'
];

const shareStart=app.indexOf('function candidateShareUrl');
const shareEnd=app.indexOf('async function shareCandidates',shareStart);
const shareFn=shareStart>=0&&shareEnd>shareStart?app.slice(shareStart,shareEnd):'';

const checks=[
  ['SEO preset parser exists',app.includes('function applyAcquisitionPreset(params)')&&app.includes("params.get('preset')!=='1'")],
  ['Preset recommendations use scoped seed',app.includes('function scopedSeedForAcquisition()')&&app.includes('lastResult=recommend(scopedSeed,ctx)')&&app.includes('buildPlans(scopedSeed,lastResult,ctx')],
  ['Preset autostart is supported',app.includes("initialParams.get('autostart')==='1'" )],
  ['Manual edits release acquisition scope',app.includes('function clearAcquisitionScope')&&app.includes("clearAcquisitionScope('edit_conditions')")&&app.includes("clearAcquisitionScope('vibe')")&&app.includes("activePresetSpotIds=null")],
  ['Candidate sharing exists',app.includes('function candidateShareUrl(items)')&&app.includes("trackEvent('candidate_share'")],
  ['Shared candidate landing exists',app.includes('function renderSharedCandidates(params)')&&app.includes("trackEvent('shared_candidates_open'")],
  ['Share URL contains only candidate IDs and campaign tags',shareFn.includes("u.searchParams.set('shared'")&&shareFn.includes("utm_source")&&!/currentOrigin|latitude|longitude|\blat\b|\blng\b/.test(shareFn)],
  ['Share UI explains location privacy',app.includes('現在地や入力した場所は共有URLに含まれません')],
  ['Share loop styles exist',styles.includes('v20.20 — acquisition share loop')&&styles.includes('.candidate-share-box')&&styles.includes('.shared-candidate-card')],
  ['Home cache keys include acquisition update',index.includes('styles.css?v=202000')&&index.includes('app.js?v=202001')],
  ['Guide hub links all new intent guides',guideSlugs.every(slug=>guideHub.includes(`href="${slug}/"`))],
  ['Sitemap lists all new intent guides',guideSlugs.every(slug=>sitemap.includes(`https://kibuntrip.com/guide/${slug}/`))],
  ['All new guide files exist',guideSlugs.every(slug=>exists(`guide/${slug}/index.html`))],
  ['All new guide pages have canonical and preset CTA',guideSlugs.every(slug=>{const html=read(`guide/${slug}/index.html`);return html.includes(`https://kibuntrip.com/guide/${slug}/`)&&html.includes('preset=1')&&html.includes('autostart=1')&&html.includes('seo_guide_cta');})],
  ['Existing high-opportunity articles point to preset flow',articlePaths.every(file=>{const html=read(file);return html.includes('preset=1')&&html.includes('autostart=1')&&html.includes('seo_article_cta');})],
];

const failed=checks.filter(([,ok])=>!ok);
for(const [name,ok] of checks)console.log(`${ok?'PASS':'FAIL'}  ${name}`);
if(failed.length){
  console.error(`\nAcquisition regression guard failed: ${failed.length} check(s).`);
  process.exit(1);
}
console.log('\nKibun acquisition regression guard: PASS');
