#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = process.cwd();
const SITE_ORIGIN = 'https://kibuntrip.com';
const indexPath = path.join(ROOT, 'index.html');
const GENERATED_REDIRECTS_BEGIN = '# BEGIN KIBUN SEO GENERATED ROUTES';
const GENERATED_REDIRECTS_END = '# END KIBUN SEO GENERATED ROUTES';

function fail(message) {
  console.error(`SEO generation failed: ${message}`);
  process.exit(1);
}
if (!fs.existsSync(indexPath)) fail('index.html が見つかりません。リポジトリ直下で実行してください。');

const htmlEscape = (value = '') => String(value)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const xmlEscape = (value = '') => htmlEscape(value);

function findSeedObject(value, seen = new Set(), depth = 0) {
  if (!value || typeof value !== 'object' || depth > 6 || seen.has(value)) return null;
  seen.add(value);
  if (Array.isArray(value.spots) && value.spots.length) return value;
  for (const item of Object.values(value)) {
    const found = findSeedObject(item, seen, depth + 1);
    if (found) return found;
  }
  return null;
}
function parseJsonCandidate(filePath) {
  try { return findSeedObject(JSON.parse(fs.readFileSync(filePath, 'utf8'))); } catch { return null; }
}
function parseJsCandidate(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  if (!/\bspots\b/.test(code)) return null;
  const names = [...new Set([...code.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/g)].map(m => m[1]))];
  const sandbox = { window: {}, console: { log() {}, warn() {}, error() {} }, setTimeout() {}, clearTimeout() {} };
  sandbox.globalThis = sandbox; sandbox.self = sandbox;
  const capture = names.map(name => `try{globalThis.__seoCandidates[${JSON.stringify(name)}]=${name}}catch{}`).join(';');
  try {
    vm.runInNewContext(`${code}\n;globalThis.__seoCandidates={};${capture};`, sandbox, { timeout: 4000, filename: path.basename(filePath) });
  } catch {}
  for (const candidate of [sandbox, sandbox.window, sandbox.__seoCandidates]) {
    const found = findSeedObject(candidate); if (found) return found;
  }
  return null;
}
function loadSeed() {
  const files = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isFile()).map(d => d.name)
    .filter(name => /\.(?:js|json)$/i.test(name))
    .filter(name => !/^(?:package-lock|manifest|site\.webmanifest)/i.test(name));
  files.sort((a, b) => {
    const score = n => /(seed|data|spot)/i.test(n) ? 0 : 1;
    return score(a) - score(b) || a.localeCompare(b);
  });
  for (const name of files) {
    const full = path.join(ROOT, name);
    const seed = name.endsWith('.json') ? parseJsonCandidate(full) : parseJsCandidate(full);
    if (seed) return { seed, source: name };
  }
  fail('spots 配列を含むデータファイルを検出できませんでした。');
}
function slugify(raw, fallback) {
  let s = String(raw || '').normalize('NFKC').trim().toLowerCase();
  s = s.replace(/^\/+|\/+$/g, '').replace(/[\\/?#%&=+\s]+/g, '-').replace(/-+/g, '-');
  s = s.replace(/^\.+|\.+$/g, '');
  return s || fallback;
}
function pickDescription(spot) {
  const candidates = [spot.seo_description, spot.public_copy, spot.description, spot.editorial_reason, spot.summary, spot.catchcopy, spot.short_description]
    .filter(Boolean).map(v => String(v).replace(/\s+/g, ' ').trim());
  let body = candidates[0] || `${spot.name}のおでかけ情報。`;
  const place = [spot.prefecture, spot.city].filter(Boolean).join('');
  const prefix = place && !body.includes(place) ? `${place}の${spot.name}。` : `${spot.name}。`;
  let out = `${prefix}${body} Kibun Tripで、今日の気分に合う過ごし方を見つけられます。`;
  if (out.length > 155) out = `${out.slice(0, 152).replace(/[、。\s]+$/,'')}…`;
  return out;
}
function absoluteUrl(raw) {
  if (!raw) return `${SITE_ORIGIN}/assets/og-kibuntrip.png`;
  try { return new URL(String(raw), `${SITE_ORIGIN}/`).href; }
  catch { return `${SITE_ORIGIN}/assets/og-kibuntrip.png`; }
}
function upsertTag(html, regex, replacement, before = '</head>') {
  if (regex.test(html)) return html.replace(regex, replacement);
  return html.replace(new RegExp(before, 'i'), `  ${replacement}\n${before}`);
}
function makeSpotPage(template, spot, slug) {
  const canonical = `${SITE_ORIGIN}/spots/${encodeURIComponent(slug)}/`;
  const title = `${spot.name}｜Kibun Trip`;
  const description = pickDescription(spot);
  const image = absoluteUrl(spot.hero_image?.url || spot.image?.url || spot.image_url || spot.media_strategy?.licensed_photo?.url);
  const placeText = [spot.prefecture, spot.city, spot.address].filter(Boolean).join(' ');
  const tags = [...new Set([...(spot.ui_tags || []), ...(spot.categories || []), spot.category_primary].filter(Boolean))].slice(0, 8);
  const bodyText = String(spot.public_copy || spot.editorial_reason || spot.description || spot.summary || description).replace(/\s+/g, ' ').trim();
  let html = template;
  if (!/<base\s/i.test(html)) html = html.replace(/<head([^>]*)>/i, '<head$1>\n  <base href="/" />');
  html = upsertTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${htmlEscape(title)}</title>`);
  html = upsertTag(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${htmlEscape(description)}" />`);
  html = upsertTag(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
  html = upsertTag(html, /<meta\s+property=["']og:type["'][^>]*>/i, '<meta property="og:type" content="article" />');
  html = upsertTag(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${htmlEscape(title)}" />`);
  html = upsertTag(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${htmlEscape(description)}" />`);
  html = upsertTag(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
  html = upsertTag(html, /<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${htmlEscape(image)}" />`);
  html = upsertTag(html, /<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow,max-image-preview:large" />');
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Place', name: spot.name, url: canonical, description,
    ...(spot.address ? { address: { '@type': 'PostalAddress', streetAddress: spot.address, addressRegion: spot.prefecture || undefined, addressLocality: spot.city || undefined, addressCountry: 'JP' } } : {}),
    ...(image ? { image: [image] } : {}), ...(spot.official_url ? { sameAs: [spot.official_url] } : {})
  };
  const boot = `<script id="kibun-seo-boot">(function(){var clean=location.pathname;var target='?spot=${encodeURIComponent(spot.spot_id)}&source=seo';if(!location.search.includes('spot=')){history.replaceState(history.state,'',clean+target);}addEventListener('load',function(){setTimeout(function(){history.replaceState(history.state,'',clean)},900)},{once:true});})();</script>`;
  html = html.replace(/<\/head>/i, `  <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>\n  ${boot}\n</head>`);
  const snapshot = `\n<section class="seo-spot-snapshot" aria-label="${htmlEscape(spot.name)}の概要"><div class="seo-spot-snapshot-inner"><p class="seo-spot-eyebrow">KIBUN SPOT</p><h1>${htmlEscape(spot.name)}</h1>${placeText ? `<p class="seo-spot-place">${htmlEscape(placeText)}</p>` : ''}<p>${htmlEscape(bodyText)}</p>${tags.length ? `<p class="seo-spot-tags">${tags.map(t => `<span>${htmlEscape(t)}</span>`).join('')}</p>` : ''}</div></section>\n<style>.seo-spot-snapshot{max-width:1180px;margin:32px auto 100px;padding:0 20px}.seo-spot-snapshot-inner{max-width:760px;padding:28px;border:1px solid rgba(31,31,31,.12);border-radius:24px;background:#fff}.seo-spot-eyebrow{font-size:11px;letter-spacing:.18em}.seo-spot-snapshot h1{font-size:clamp(28px,6vw,48px);line-height:1.15;margin:.25em 0}.seo-spot-place{opacity:.68}.seo-spot-tags{display:flex;gap:8px;flex-wrap:wrap}.seo-spot-tags span{padding:6px 10px;border:1px solid rgba(31,31,31,.12);border-radius:999px;font-size:12px}</style>`;
  html = html.replace(/<\/body>/i, `${snapshot}\n</body>`);
  return { html, canonical };
}
function discoverStaticContentUrls() {
  const dirs = ['magazine', 'plans', 'guide']; const urls = [];
  for (const dir of dirs) {
    const base = path.join(ROOT, dir); if (!fs.existsSync(base)) continue;
    const stack = [base];
    while (stack.length) {
      const current = stack.pop();
      for (const ent of fs.readdirSync(current, { withFileTypes: true })) {
        const full = path.join(current, ent.name);
        if (ent.isDirectory()) stack.push(full);
        else if (ent.isFile() && ent.name === 'index.html') {
          const rel = path.relative(ROOT, path.dirname(full)).split(path.sep).join('/'); urls.push(`${SITE_ORIGIN}/${rel}/`);
        }
      }
    }
  }
  return urls;
}
function replaceGeneratedBlock(existing, begin, end, block) {
  const start = existing.indexOf(begin); const finish = existing.indexOf(end);
  if (start !== -1 && finish !== -1 && finish > start) {
    return `${existing.slice(0, start).trimEnd()}\n\n${block}\n${existing.slice(finish + end.length).trimStart()}`.trim() + '\n';
  }
  return `${existing.trim()}${existing.trim() ? '\n\n' : ''}${block}\n`;
}

const { seed, source } = loadSeed();
const spots = seed.spots.filter(s => s && s.spot_id && s.name);
if (spots.length < 50) fail(`スポット数が少なすぎます (${spots.length})。誤ったデータを読んだ可能性があります。`);
const template = fs.readFileSync(indexPath, 'utf8');
const spotsRoot = path.join(ROOT, 'spots');
fs.rmSync(spotsRoot, { recursive: true, force: true }); fs.mkdirSync(spotsRoot, { recursive: true });
for (const name of fs.readdirSync(ROOT)) if (/^seo-spot-[A-Za-z0-9_.-]+\.html$/.test(name)) fs.rmSync(path.join(ROOT, name), { force: true });

const used = new Set(); const routeRows = [];
for (const spot of spots) {
  let slug = slugify(spot.slug, spot.spot_id);
  if (used.has(slug)) slug = `${slug}-${slugify(spot.spot_id, 'spot')}`;
  used.add(slug);
  const page = makeSpotPage(template, spot, slug);
  const dir = path.join(spotsRoot, slug); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page.html);
  const fallbackFile = `seo-spot-${slugify(spot.spot_id, 'spot')}.html`;
  fs.writeFileSync(path.join(ROOT, fallbackFile), page.html);
  routeRows.push({ spot_id: spot.spot_id, slug, name: spot.name, url: page.canonical, fallback_file: fallbackFile });
}

const listItems = routeRows.map(row => {
  const spot = spots.find(s => s.spot_id === row.spot_id);
  const place = [spot?.prefecture, spot?.city].filter(Boolean).join(' · ');
  return `<li><a href="/spots/${encodeURIComponent(row.slug)}/">${htmlEscape(row.name)}</a>${place ? `<small>${htmlEscape(place)}</small>` : ''}</li>`;
}).join('\n');
const spotsIndex = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>スポット一覧｜Kibun Trip</title><meta name="description" content="Kibun Tripに掲載しているおでかけスポット一覧。"><link rel="canonical" href="${SITE_ORIGIN}/spots/"><meta name="robots" content="index,follow"><style>body{font-family:system-ui,-apple-system,sans-serif;background:#f6f1e9;color:#222;margin:0}.wrap{max-width:900px;margin:auto;padding:40px 20px 80px}a{color:inherit;text-underline-offset:3px}ul{list-style:none;padding:0;display:grid;gap:10px}li{background:#fff;border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;gap:12px}small{opacity:.62}</style></head><body><main class="wrap"><p><a href="/">← Kibun</a></p><h1>スポット一覧</h1><p>${routeRows.length}スポット</p><ul>${listItems}</ul></main></body></html>`;
fs.writeFileSync(path.join(spotsRoot, 'index.html'), spotsIndex);
fs.writeFileSync(path.join(ROOT, 'spots-index.html'), spotsIndex);
fs.writeFileSync(path.join(spotsRoot, 'routes.json'), JSON.stringify({ generated_at: new Date().toISOString(), source, routes: routeRows }, null, 2));

const redirectLines = [
  GENERATED_REDIRECTS_BEGIN,
  '/spots /spots-index.html 200',
  '/spots/ /spots-index.html 200',
  ...routeRows.flatMap(r => [
    `/spots/${r.slug} /${r.fallback_file} 200`,
    `/spots/${r.slug}/ /${r.fallback_file} 200`,
  ]),
  GENERATED_REDIRECTS_END,
];
const redirectsPath = path.join(ROOT, '_redirects');
const existingRedirects = fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath, 'utf8') : '';
fs.writeFileSync(redirectsPath, replaceGeneratedBlock(existingRedirects, GENERATED_REDIRECTS_BEGIN, GENERATED_REDIRECTS_END, redirectLines.join('\n')));

const sitemapUrls = [...new Set([`${SITE_ORIGIN}/`, `${SITE_ORIGIN}/spots/`, ...routeRows.map(r => r.url), ...discoverStaticContentUrls()])].sort();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map(url => `  <url><loc>${xmlEscape(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
const robotsPath = path.join(ROOT, 'robots.txt');
let robots = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, 'utf8').trim() : 'User-agent: *\nAllow: /';
robots = robots.replace(/^Sitemap:\s*.*$/gim, '').trim(); robots += `\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`;
fs.writeFileSync(robotsPath, robots);

if (routeRows.length !== spots.length) fail('生成件数がスポット件数と一致しません。');
if (!fs.existsSync(path.join(ROOT, 'spots-index.html'))) fail('root fallback の spots-index.html がありません。');
if (!fs.existsSync(redirectsPath)) fail('_redirects がありません。');
for (const row of routeRows) {
  const nested = path.join(spotsRoot, row.slug, 'index.html'); const fallback = path.join(ROOT, row.fallback_file);
  if (!fs.existsSync(nested) || !fs.existsSync(fallback)) fail(`${row.spot_id}: SEO page generation failed.`);
  const page = fs.readFileSync(fallback, 'utf8');
  if (!page.includes(`<link rel="canonical" href="${row.url}"`)) fail(`${row.spot_id}: canonical が不正です。`);
  if (!page.includes(`spot=${encodeURIComponent(row.spot_id)}`)) fail(`${row.spot_id}: deep link 起動コードがありません。`);
  if (!fs.readFileSync(redirectsPath, 'utf8').includes(`/spots/${row.slug}/ /${row.fallback_file} 200`)) fail(`${row.spot_id}: redirect rewrite がありません。`);
}
const target257 = routeRows.find(r => r.spot_id === 'spot_257');
if (target257) console.log(`spot_257: ${target257.url} -> /${target257.fallback_file}`);
console.log(`SEO hotfix generated: ${routeRows.length} spots / ${sitemapUrls.length} sitemap URLs / source ${source}`);
