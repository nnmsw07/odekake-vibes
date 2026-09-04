const fs=require('fs');
const assert=require('assert');

const html=fs.readFileSync('sns-audit/index.html','utf8');
const js=fs.readFileSync('sns-audit/audit.js','utf8');
const css=fs.readFileSync('sns-audit/audit.css','utf8');
const mm=fs.readFileSync('magazine/magazine-media.js','utf8');

assert(html.includes('../config.js?v=2110'),'sns audit should load config.js');
assert(html.includes('../magazine/magazine-media.js?v=2112'),'sns audit should load hero override map');
assert(js.includes('function resolveHeroImages'),'hero resolver missing');
assert(js.includes('function renderCaptureMode'),'capture mode renderer missing');
assert(js.includes('href="./?capture=${encodeURIComponent(i.id)}"'),'idea capture link missing');
assert(js.includes('href="./?capture=${encodeURIComponent(post.id)}"'),'operations capture link missing');
assert(css.includes('.capture-page'),'capture mode css missing');
assert(css.includes('.ig-canvas'),'instagram slide css missing');
assert(mm.includes('window.KIBUN_HERO_SPOTS = HERO_SPOTS;'),'hero override export missing');
console.log('v20.11.2 sns capture checks passed');
