#!/usr/bin/env node

const CANONICAL = 'https://kibuntrip.com/';
const LEGACY_GITHUB_PAGES = 'https://nnmsw07.github.io/odekake-vibes/';

async function request(url, redirect = 'manual') {
  return fetch(url, {
    redirect,
    signal: AbortSignal.timeout(12000),
    headers: { 'user-agent': 'Kibun-Deployment-Origin-Audit/1.0' },
  });
}

function resolvedLocation(response, sourceUrl) {
  const location = response.headers.get('location');
  if (!location) return null;
  try {
    return new URL(location, sourceUrl).href;
  } catch {
    return null;
  }
}

const errors = [];
const warnings = [];

try {
  const canonical = await request(CANONICAL, 'follow');
  if (canonical.status !== 200) {
    errors.push(`canonical origin must return 200: ${CANONICAL} -> ${canonical.status}`);
  } else {
    const html = await canonical.text();
    if (!/<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*href=["']https:\/\/kibuntrip\.com\/["']/i.test(html)
      && !/<link\b[^>]*href=["']https:\/\/kibuntrip\.com\/["'][^>]*rel=["'][^"']*canonical[^"']*["']/i.test(html)) {
      errors.push('canonical origin root is missing self-canonical https://kibuntrip.com/');
    }
  }
} catch (error) {
  errors.push(`canonical origin request failed: ${error.message}`);
}

try {
  const legacy = await request(LEGACY_GITHUB_PAGES, 'manual');
  const location = resolvedLocation(legacy, LEGACY_GITHUB_PAGES);

  if (legacy.status === 301 || legacy.status === 308) {
    if (!location || !location.startsWith(CANONICAL)) {
      errors.push(`legacy GitHub Pages redirects to unexpected origin: ${legacy.status} ${location || '(missing Location)'}`);
    }
  } else if (legacy.status === 302 || legacy.status === 303 || legacy.status === 307) {
    warnings.push(`legacy GitHub Pages uses temporary redirect ${legacy.status}; prefer 301/308 to ${CANONICAL}`);
  } else if (legacy.status === 200) {
    errors.push(`legacy GitHub Pages still serves a 200 copy at ${LEGACY_GITHUB_PAGES}; this can create a duplicate public origin`);
  } else if (legacy.status === 404 || legacy.status === 410) {
    warnings.push(`legacy GitHub Pages is retired (${legacy.status}). This is acceptable after migration, but old links no longer pass through a permanent redirect.`);
  } else {
    warnings.push(`legacy GitHub Pages returned ${legacy.status}${location ? ` -> ${location}` : ''}`);
  }
} catch (error) {
  warnings.push(`legacy GitHub Pages request failed: ${error.message}`);
}

for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const error of errors) console.error(`ERROR ${error}`);
console.log(`Deployment origin audit ${errors.length ? 'FAIL' : 'PASS'}: ${errors.length} errors / ${warnings.length} warnings`);

if (errors.length) process.exit(1);
