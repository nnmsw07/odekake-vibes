import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const config = read('config.js');
const app = read('app.js');

const checks = [
  ['STEP 1 full-bleed mood cards stay enabled', config.includes('kibun-ui-v201909') && config.includes('aspect-ratio:1.38/1!important')],
  ['STEP 1 supporting mood photo stays full-card', config.includes('.mood-card-secondary .mood-photo') && config.includes('inset:0!important')],
  ['Family parent-day collection keeps dedicated class', config.includes('family-parent-day')],
  ['Family parent-day collection keeps approved hero path', config.includes("/assets/editorial/parents-eat-well.webp")],
  ['Family parent-day label still exists in collection data', app.includes('親も楽しい日に')],
  ['Approved parent-day hero asset exists', fs.existsSync(path.join(root, 'assets/editorial/parents-eat-well.webp'))],
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
