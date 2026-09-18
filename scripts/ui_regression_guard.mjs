import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const config = read('config.js');
const app = read('app.js');
const styles = read('styles.css');
const heroGuard = read('hero-audit-guard.js');
const plans = read('plans/index.html');
const plansCss = read('plans/plans.css');
const magazineCss = read('magazine/magazine.css');

const checks = [
  ['STEP 1 full-bleed mood cards stay enabled', config.includes('kibun-ui-v201909') && config.includes('aspect-ratio:1.38/1!important')],
  ['STEP 1 supporting mood photo stays full-card', config.includes('.mood-card-secondary .mood-photo') && config.includes('inset:0!important')],
  ['Selected mood cards never restore the white text panel', config.includes('.mood-photo-card.selected .vibe-text') && config.includes('background:transparent!important') && config.includes('text-shadow:0 1px 10px rgba(0,0,0,.34)!important')],
  ['STEP 2 labels reserve the selection-control column', styles.includes('v20.19.5 — STEP 2 label/circle collision guard') && styles.includes('word-break:normal!important') && styles.includes('-webkit-line-clamp:2!important') && styles.includes('grid-column:3!important')],
  ['Family parent-day collection keeps dedicated class', config.includes('family-parent-day')],
  ['Family parent-day collection keeps approved hero path', config.includes("/assets/editorial/parents-eat-well.webp")],
  ['Family parent-day label still exists in collection data', app.includes('親も楽しい日に')],
  ['Approved parent-day hero asset exists', fs.existsSync(path.join(root, 'assets/editorial/parents-eat-well.webp'))],
  ['Plan hub links keep their navigation source', plans.includes('source=plan_library') && plans.includes('source=plan_mood_visual')],
  ['Plan and magazine trust footers stay readable on mobile', plansCss.includes('v20.19.7 — trust footer layout') && magazineCss.includes('v20.19.7 — trust footer layout') && plansCss.includes('grid-template-columns:1fr;') && magazineCss.includes('grid-template-columns:1fr;') && plansCss.includes('font-size:13px') && magazineCss.includes('font-size:13px')],
  ['Plans and Magazine use the canonical three-circle Kibun mark', plansCss.includes('v20.19.8 — canonical Kibun three-circle brand mark') && magazineCss.includes('v20.19.8 — canonical Kibun three-circle brand mark') && plansCss.includes('box-shadow:-12px 0 0 #7d9874,12px 0 0 #d7b24b') && magazineCss.includes('border-radius:50%')],
  ['Hero Audit spot dialog stays vertically scrollable', styles.includes('v20.19.8 — scrollable Hero Audit spot dialog') && styles.includes('overflow-y:auto!important') && styles.includes('touch-action:pan-y') && styles.includes('max-height:calc(100dvh - 228px)')],
  ['Plan close returns hub-origin deep links to /plans/', heroGuard.includes("PLAN_HUB_SOURCES=new Set(['plan_library','plan_mood_visual'])") && heroGuard.includes("location.assign('/plans/')")],
  ['Plan close preserves browser history when opened from plans hub', heroGuard.includes('cameFromPlansHub()&&history.length>1') && heroGuard.includes('history.back()')],
  ['Escape/cancel from hub-origin plan also returns to plans', heroGuard.includes("planDialog.addEventListener('cancel'") && heroGuard.includes('returnToPlans();')],
];

const failed = checks.filter(([, ok]) => !ok);
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
}

if (failed.length) {
  console.error(`\nUI regression guard failed: ${failed.length} check(s).`);
  process.exit(1);
}

console.log('\nKibun UI regression guard: PASS');
