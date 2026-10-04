import fs from 'node:fs';

const seedUrl = new URL('../seed.json', import.meta.url);
const manifestUrl = new URL('../verified-image-sources.json', import.meta.url);
const seed = JSON.parse(fs.readFileSync(seedUrl, 'utf8'));
const manifest = fs.existsSync(manifestUrl) ? JSON.parse(fs.readFileSync(manifestUrl, 'utf8')) : [];
const spots = Array.isArray(seed.spots) ? seed.spots : [];
const verified = new Map(manifest.map(x => [x.spot_id, x]));
const staticProviders = new Set(['owned', 'official_permission', 'wikimedia_commons', 'open_license']);

function providerOf(spot) {
  return String(spot?.media_strategy?.current_provider || spot?.hero_image?.type || 'unknown');
}
function hasPinnedPlace(spot) {
  return Boolean(String(spot?.media_strategy?.google_places?.place_id || '').trim());
}
function searchUrls(spot) {
  const q = `${spot.name || ''} ${spot.address || ''}`.trim();
  const encoded = encodeURIComponent(q);
  return {
    official: spot.official_url || null,
    wikimedia_commons: `https://commons.wikimedia.org/w/index.php?search=${encoded}&title=Special:MediaSearch&type=image`,
    openverse: `https://openverse.org/search/image?q=${encoded}`
  };
}
function classify(spot) {
  const entry = verified.get(spot.spot_id);
  const provider = providerOf(spot);
  const exact = spot?.hero_image?.exact_spot;
  if (entry) return {status: 'verified_static', priority: 0, provider: entry.source_type};
  if (staticProviders.has(provider) && exact !== false) return {status: 'existing_static', priority: 0, provider};
  if (hasPinnedPlace(spot)) return {status: 'google_pinned', priority: 2, provider};
  return {status: 'needs_static_source', priority: 1, provider};
}

const rows = spots.map(spot => {
  const c = classify(spot);
  return {
    priority: c.priority,
    status: c.status,
    spot_id: spot.spot_id,
    name: spot.name,
    area: spot.area || spot.region || '',
    provider: c.provider,
    exact_spot: spot?.hero_image?.exact_spot ?? null,
    has_pinned_place: hasPinnedPlace(spot),
    ...searchUrls(spot)
  };
}).sort((a, b) => a.priority - b.priority || String(a.name).localeCompare(String(b.name), 'ja'));

const counts = rows.reduce((acc, row) => {
  acc[row.status] = (acc[row.status] || 0) + 1;
  return acc;
}, {});

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({total: rows.length, counts, spots: rows}, null, 2));
  process.exit(0);
}

console.log(`Kibun image-source audit: ${rows.length} spots`);
for (const [status, count] of Object.entries(counts).sort()) console.log(`${status}: ${count}`);

const showAll = process.argv.includes('--all');
const candidates = rows.filter(r => r.status === 'needs_static_source' || r.status === 'google_pinned');
const shown = showAll ? candidates : candidates.slice(0, 40);
console.log(`\nReplacement candidates: ${candidates.length}${showAll ? '' : ` (showing ${shown.length}; use --all for all)`}`);
for (const r of shown) {
  console.log(`\n${r.status}\t${r.spot_id}\t${r.name}`);
  if (r.official) console.log(`  official: ${r.official}`);
  console.log(`  commons:  ${r.wikimedia_commons}`);
  console.log(`  openverse:${r.openverse}`);
}

console.log('\nCandidate links are discovery aids only. Verify the exact facility, commercial reuse rights, attribution requirements, and source page before registering an image.');
