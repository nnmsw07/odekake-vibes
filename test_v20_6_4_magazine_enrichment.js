const fs=require('fs'),assert=require('assert'),path=require('path');
const root=__dirname;
const hub=fs.readFileSync(path.join(root,'magazine/index.html'),'utf8');
assert(!hub.includes('href="shibuya-with-kids/"'),'Shibuya should not remain an article card');
assert(!hub.includes('href="shinjuku-family-day/"'),'Shinjuku should not remain an article card');
assert(hub.includes('family_shibuya_green_cafe'),'Shibuya plan preview missing');
assert(hub.includes('family_shinjuku_green_play_cafe'),'Shinjuku plan preview missing');
assert(hub.includes('japanese-culture-experience/'),'Japanese culture article missing');
for(const legacy of ['shibuya-with-kids','shinjuku-family-day']){
 const html=fs.readFileSync(path.join(root,'magazine',legacy,'index.html'),'utf8');
 assert(html.includes('noindex,follow'),legacy+' legacy page should be noindex');
 assert(html.includes('location.replace'),legacy+' legacy page should redirect to plan');
}
const live=['yokohama-afternoon-tea','yokohama-family-cafe','yokohama-small-holiday','tokyo-rainy-family','art-and-cafe','hakone-stay-story','make-something','oyako-rest-indoor'];
for(const slug of live){
 const html=fs.readFileSync(path.join(root,'magazine',slug,'index.html'),'utf8');
 assert(html.includes('article-guide'),slug+' guide missing');
 assert(html.includes('article-editorial'),slug+' editorial note missing');
 assert(html.length>5000,slug+' should have meaningful editorial depth');
}
const jp=fs.readFileSync(path.join(root,'magazine/japanese-culture-experience/index.html'),'utf8');
for(const id of ['spot_318','spot_319','spot_320','spot_249','spot_252','spot_253','spot_242']) assert(jp.includes(id),'culture article missing '+id);
assert(jp.includes('予約')&&jp.includes('現地'),'inbound language distinction missing');
const sm=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
assert(sm.includes('/magazine/japanese-culture-experience/'),'new article sitemap missing');
assert(!sm.includes('/magazine/shibuya-with-kids/'),'legacy Shibuya should be removed from sitemap');
assert(!sm.includes('/magazine/shinjuku-family-day/'),'legacy Shinjuku should be removed from sitemap');
console.log('v20.6.4 magazine enrichment: OK');
