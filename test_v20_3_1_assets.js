const fs = require('fs');
const required = [
  'assets/editorial/cafe.webp',
  'assets/editorial/culture.webp',
  'assets/editorial/scenic.webp',
  'assets/editorial/special.webp',
  'assets/editorial/relax.webp',
  'assets/plans/family-cafe.webp',
  'assets/plans/waterfront-walk.webp',
  'assets/plans/culture-cafe.webp',
];
const missing = required.filter(p => !fs.existsSync(p));
if (missing.length) {
  console.error('Missing assets:', missing.join(', '));
  process.exit(1);
}
console.log('v20.3.1 magazine/plan asset audit passed');
