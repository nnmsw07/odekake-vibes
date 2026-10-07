import fs from 'node:fs';

const seed = JSON.parse(fs.readFileSync(new URL('../seed.json', import.meta.url), 'utf8'));
const spots = Array.isArray(seed.spots) ? seed.spots : [];
const timeoutMs = 12000;
const concurrency = 4;
const outputPath = new URL('../official-image-contact-candidates.json', import.meta.url);

const CONTACT_WORDS = /(?:contact|inquiry|inquiries|press|media|pr|取材|広報|問い合わせ|お問い合わせ|お問合せ)/i;
const EMAIL_OK = /^(?!.*(?:noreply|no-reply|privacy|recruit|career|reservation|reserve|support@google))[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function decodeBasicEntities(s='') {
  return String(s).replace(/&amp;/g, '&').replace(/&#38;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function sameOrg(base, candidate) {
  try {
    const a = new URL(base).hostname.replace(/^www\./, '').split('.').slice(-2).join('.');
    const b = new URL(candidate).hostname.replace(/^www\./, '').split('.').slice(-2).join('.');
    return a === b;
  } catch { return false; }
}
function extract(html, finalUrl) {
  const emails = [];
  for (const m of html.matchAll(/mailto:([^"'?#>\s]+)/gi)) {
    const email = decodeURIComponent(decodeBasicEntities(m[1])).trim().toLowerCase();
    if (EMAIL_OK.test(email)) emails.push(email);
  }
  // Also allow visible press/media email addresses, but not arbitrary page emails unless they look relevant.
  for (const m of html.matchAll(/(?:press|media|pr)[\w.+-]*@[a-z0-9.-]+\.[a-z]{2,}/gi)) {
    const email = m[0].toLowerCase();
    if (EMAIL_OK.test(email)) emails.push(email);
  }
  const links = [];
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = decodeBasicEntities(m[1]);
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!CONTACT_WORDS.test(`${href} ${text}`)) continue;
    try {
      const url = new URL(href, finalUrl).href;
      if (/^https?:/i.test(url) && sameOrg(finalUrl, url)) links.push(url);
    } catch {}
  }
  return { emails: unique(emails).slice(0, 5), contact_urls: unique(links).slice(0, 8) };
}

async function discover(spot) {
  const url = String(spot.official_url || '').trim();
  if (!/^https?:\/\//i.test(url)) return null;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; KibunTripImageContactAudit/1.0; +https://kibuntrip.com)' }
    });
    if (!res.ok) return { spot_id: spot.spot_id, name: spot.name, official_url: url, status: res.status, emails: [], contact_urls: [] };
    const type = res.headers.get('content-type') || '';
    if (!/text\/html/i.test(type)) return null;
    const html = await res.text();
    const found = extract(html.slice(0, 2_000_000), res.url || url);
    return { spot_id: spot.spot_id, name: spot.name, official_url: url, final_url: res.url || url, status: res.status, ...found };
  } catch (error) {
    return { spot_id: spot.spot_id, name: spot.name, official_url: url, status: 'ERR', error: String(error?.name || error), emails: [], contact_urls: [] };
  } finally { clearTimeout(timer); }
}

const only = process.argv.includes('--only-actionable');
const results = [];
for (let i = 0; i < spots.length; i += concurrency) {
  const batch = await Promise.all(spots.slice(i, i + concurrency).map(discover));
  for (const row of batch) if (row && (!only || row.emails.length || row.contact_urls.length)) results.push(row);
  if (i + concurrency < spots.length) await new Promise(r => setTimeout(r, 250));
}

const actionable = results.filter(r => r.emails?.length || r.contact_urls?.length);
const payload = { generated_at: new Date().toISOString(), total_checked: results.length, actionable: actionable.length, contacts: only ? actionable : results };
fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2) + '\n');
console.log(`Official image contact discovery: checked=${results.length}, actionable=${actionable.length}`);
console.log(`Wrote ${outputPath.pathname}`);
