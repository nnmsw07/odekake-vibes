import fs from 'node:fs';

const seed = JSON.parse(fs.readFileSync(new URL('../seed.json', import.meta.url), 'utf8'));
const spots = seed.spots || [];
const timeoutMs = 15000;
const concurrency = 8;

async function check(spot) {
  const url = spot.official_url;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; KibunTripLinkAudit/1.0; +https://kibuntrip.com)'
      }
    });
    let level = 'OK';
    if (res.status === 404 || res.status === 410) level = 'FAIL';
    else if (res.status === 403 || res.status === 429 || res.status >= 500) level = 'WARN';
    return {level, id: spot.spot_id, name: spot.name, status: res.status, url, finalUrl: res.url};
  } catch (err) {
    return {level: 'WARN', id: spot.spot_id, name: spot.name, status: 'ERR', url, finalUrl: '', error: err.name || String(err)};
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (let i = 0; i < spots.length; i += concurrency) {
  results.push(...await Promise.all(spots.slice(i, i + concurrency).map(check)));
}

for (const r of results) {
  const tail = r.finalUrl && r.finalUrl !== r.url ? ` -> ${r.finalUrl}` : '';
  console.log(`${r.level}\t${r.id}\t${r.status}\t${r.name}\t${r.url}${tail}`);
}

const failures = results.filter(r => r.level === 'FAIL');
const warnings = results.filter(r => r.level === 'WARN');
console.error(`\nChecked ${results.length}: FAIL=${failures.length}, WARN=${warnings.length}`);
if (failures.length) process.exitCode = 1;
