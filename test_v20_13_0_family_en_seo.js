const fs=require('fs');
const path=require('path');
const {hardFilterReason}=require('./recommender.js');

function ok(cond,msg){if(!cond){console.error('FAIL:',msg);process.exit(1)} console.log('PASS:',msg)}
const seed=JSON.parse(fs.readFileSync('seed.json','utf8'));
const byId=Object.fromEntries(seed.spots.map(s=>[s.spot_id,s]));

ok(seed.metadata?.version==='0.20.13.0','dataset version is v20.13.0');
ok(Boolean(seed.metadata?.architecture?.layer_family_profile),'family-profile architecture layer exists');
ok((seed.metadata?.architecture?.layer_i18n||'').includes('i18n.en'),'i18n architecture layer exists');

const family=seed.spots.filter(s=>s.family_profile);
const english=seed.spots.filter(s=>s.i18n?.en?.name && s.i18n?.en?.public_copy);
ok(family.length>=15,`family attributes are present on ${family.length} spots`);
ok(english.length>=30,`English localization is present on ${english.length} spots`);
ok(byId.spot_287?.family_profile?.floor_seating===true,'chano-ma Yokohama is tagged for floor seating');
ok(byId.spot_287?.family_profile?.crawl_ok===true,'chano-ma Yokohama is tagged for baby crawl/rest use');
ok(byId.spot_295?.family_profile?.kids_space===true,'Belbel Park Yokohama Kannai is tagged for kids space');

const miraikan=byId.spot_286;
const range=miraikan?.availability_constraints?.unavailable_ranges?.[0];
ok(range?.from==='2026-10-01' && range?.until==='2027-04-22','Miraikan closure range is stored exactly');
const base={audience:'family',selectedVibes:[]};
ok(hardFilterReason(miraikan,{...base,currentDate:'2026-09-30T12:00:00+09:00'})===null,'Miraikan remains recommendable before closure');
ok(Boolean(hardFilterReason(miraikan,{...base,currentDate:'2026-10-01T12:00:00+09:00'})),'Miraikan is excluded on closure start date');
ok(Boolean(hardFilterReason(miraikan,{...base,currentDate:'2027-04-22T12:00:00+09:00'})),'Miraikan is excluded on closure end date');
ok(hardFilterReason(miraikan,{...base,currentDate:'2027-04-23T12:00:00+09:00'})===null,'Miraikan returns after closure');

const app=fs.readFileSync('app.js','utf8');
ok(app.includes("['floorseat','小上がり・座敷']") || (app.includes('floorseat')&&app.includes('小上がり・座敷')),'floor-seating browse filter is implemented');
ok(app.includes("['kidsspace','ベビースペース']") || (app.includes('kidsspace')&&app.includes('ベビースペース')),'baby/kids-space browse filter is implemented');
ok(app.includes('familySupportHtml'),'family support attributes are rendered in spot details');

ok(fs.existsSync('magazine/floor-seating-with-baby/index.html'),'Japanese floor-seating feature exists');
ok(fs.existsSync('magazine/baby-kids-space-cafes/index.html'),'Japanese baby/kids-space feature exists');

const enSpotPages=[];
for(const ent of fs.readdirSync('en/spots',{withFileTypes:true})){
  if(ent.isDirectory() && fs.existsSync(path.join('en/spots',ent.name,'index.html'))) enSpotPages.push(ent.name);
}
const enFeaturePages=[];
for(const ent of fs.readdirSync('en/magazine',{withFileTypes:true})){
  if(ent.isDirectory() && fs.existsSync(path.join('en/magazine',ent.name,'index.html'))) enFeaturePages.push(ent.name);
}
ok(enSpotPages.length>=30,`English spot pages exist (${enSpotPages.length})`);
ok(enFeaturePages.length>=5,`English feature pages exist (${enFeaturePages.length})`);
ok(fs.existsSync('en/plans/index.html'),'English plans page exists');

const root=fs.readFileSync('index.html','utf8');
ok(root.includes('hreflang="en"') && root.includes('https://kibuntrip.com/en/'),'Japanese root links to English version with hreflang');
const enRoot=fs.readFileSync('en/index.html','utf8');
ok(enRoot.includes('lang="en"') && enRoot.includes('hreflang="ja"') && enRoot.includes('hreflang="en"'),'English root has language and alternate links');
ok(enRoot.includes('href="/en/spots/"') && enRoot.includes('href="/en/magazine/"'),'English root links to spot and feature hubs');

const sitemap=fs.readFileSync('sitemap.xml','utf8');
const enUrls=(sitemap.match(/https:\/\/kibuntrip\.com\/en\//g)||[]).length;
ok(enUrls>=45,`sitemap contains English MVP URLs (${enUrls})`);
ok(sitemap.includes('/magazine/floor-seating-with-baby/'),'sitemap contains floor-seating feature');
ok(sitemap.includes('/magazine/baby-kids-space-cafes/'),'sitemap contains baby/kids-space feature');
