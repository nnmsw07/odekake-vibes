import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const config = read('config.js');
const app = read('app.js');
const heroGuard = read('hero-audit-guard.js');
const plans = read('plans/index.html');

const checks = [
  ['STEP 1 full-bleed mood cards stay enabled', config.includes('kibun-ui-v201909') && config.includes('aspect-ratio:1.38/1!important')],
  ['STEP 1 supporting mood photo stays full-card', config.includes('.mood-card-secondary .mood-photo') && config.includes('inset:0!important')],
  ['Selected mood cards never restore the white text panel', config.includes('.mood-photo-card.selected .vibe-text') && config.includes('background:transparent!important') && config.includes('text-shadow:0 1px 10px rgba(0,0,0,.34)!important')],
  ['Family parent-day collection keeps dedicated class', config.includes('family-parent-day')],
  ['Family parent-day collection keeps approved hero path', config.includes("/assets/editorial/parents-eat-well.webp")],
  ['Family parent-day label still exists in collection data', app.includes('親も楽しい日に')],
  ['Approved parent-day hero asset exists', fs.existsSync(path.join(root, 'assets/editorial/parents-eat-well.webp'))],
  ['Plan hub links keep their navigation source', plans.includes('source=plan_library') && plans.includes('source=plan_mood_visual')],
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
