const fs=require('fs');const assert=require('assert');
const media=fs.readFileSync('magazine/magazine-media.js','utf8');
for(const id of ['spot_085','spot_139','spot_470','spot_471','spot_472','spot_473']) assert(media.includes('"'+id+'"'));
assert(media.includes("img.dataset.heroState='ready'"));
const hub=fs.readFileSync('magazine/index.html','utf8');
for(const slug of ['dog-yokohama-waterside','dog-more-than-dogrun','dog-shopping-day','dog-terrace-food','dog-nature-reset']){
  const i=hub.indexOf('href="'+slug+'/"'); assert(i>=0); const chunk=hub.slice(i,i+650); assert(chunk.includes('data-hero-clean="1"'));
}
const css=fs.readFileSync('magazine/magazine.css','utf8');assert(css.includes('img[data-hero-clean="1"]'));
console.log('v20.12.5 magazine dog hero tests passed');
