#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const warnings = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
const warn = (ok, message) => { if (!ok) warnings.push(message); };
const exists = file => fs.existsSync(path.join(root, file));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const requiredFiles = [
  'index.html', '404.html', 'privacy.html', 'terms.html',
  'sitemap.xml', 'robots.txt', 'app.js', 'config.js',
  'scripts/ui_regression_guard.mjs', 'scripts/seo_audit.mjs'
];
for (const file of requiredFiles) check(exists(file), `required file missing: ${file}`);

if (errors.length === 0) {
  const index = read('index.html');
  const app = read('app.js');
  const config = read('config.js');
  const privacy = read('privacy.html');
  const terms = read('terms.html');
  const notFound = read('404.html');

  check(index.includes('https://kibuntrip.com/'), 'home canonical origin is missing');
  check(/<link[^>]+rel=["']canonical["'][^>]+href=["']https:\/\/kibuntrip\.com\//i.test(index), 'home self-canonical is missing');
  check(index.includes('og:image'), 'home OGP image metadata is missing');
  check(index.includes('application/ld+json'), 'home structured data is missing');
  check(index.includes('G-M99DNGD18F'), 'GA4 measurement ID is missing from home');

  const requiredEvents = [
    'recommendation_generate',
    'spot_open',
    'plan_open',
    'external_link_click',
    'affiliate_click'
  ];
  for (const eventName of requiredEvents) {
    check(app.includes(`'${eventName}'`) || app.includes(`"${eventName}"`), `GA4 funnel event missing: ${eventName}`);
  }
  check(app.includes('audience:selectedAudience'), 'recommendation event does not include audience');
  check(app.includes('vibe_count:selectedVibes.length'), 'recommendation event does not include vibe selection count');

  check(privacy.includes('Google Analytics'), 'privacy policy does not disclose analytics');
  check(privacy.includes('位置情報'), 'privacy policy does not disclose location handling');
  check(terms.includes('アフィリエイト'), 'terms do not disclose affiliate links');
  check(terms.includes('hello@kibuntrip.com'), 'public contact email is missing from terms');
  check(notFound.trim().length > 200, '404 page looks unexpectedly small');

  const sources = [index, app, config];
  const assetRefs = new Set();
  const assetPattern = /(?:^|[\s'"(=:`])\/?(assets\/[A-Za-z0-9_./-]+\.(?:png|webp|jpg|jpeg|svg|gif|avif))/g;
  for (const source of sources) {
    for (const match of source.matchAll(assetPattern)) assetRefs.add(match[1]);
  }
  for (const ref of assetRefs) check(exists(ref), `local asset reference is missing: ${ref}`);
  warn(assetRefs.size >= 10, `only ${assetRefs.size} local asset references were discovered; asset scan may be too narrow`);

  const sitemap = read('sitemap.xml');
  check(sitemap.includes('https://kibuntrip.com/'), 'sitemap canonical origin is missing');
  check(!sitemap.includes('github.io'), 'legacy github.io origin remains in sitemap');
}

console.log(`RC1 release readiness: ${errors.length ? 'FAIL' : 'PASS'} / ${errors.length} errors / ${warnings.length} warnings`);
for (const item of errors) console.error('ERROR', item);
for (const item of warnings) console.warn('WARN ', item);
if (errors.length) process.exit(1);
