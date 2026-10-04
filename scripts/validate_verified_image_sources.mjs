import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'verified-image-sources.json');
const seedPath = path.join(root, 'seed.json');
const allowedTypes = new Set(['owned', 'official_permission', 'wikimedia_commons', 'open_license']);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const spotIds = new Set((seed.spots || []).map(s => s.spot_id));
const errors = [];
const seen = new Set();

if (!Array.isArray(manifest)) errors.push('manifest must be a JSON array');

for (const [index, item] of (Array.isArray(manifest) ? manifest : []).entries()) {
  const at = `entry[${index}]${item?.spot_id ? ` ${item.spot_id}` : ''}`;
  if (!item || typeof item !== 'object' || Array.isArray(item)) { errors.push(`${at}: must be an object`); continue; }
  if (!item.spot_id || !spotIds.has(item.spot_id)) errors.push(`${at}: unknown or missing spot_id`);
  if (seen.has(item.spot_id)) errors.push(`${at}: duplicate spot_id`);
  seen.add(item.spot_id);
  if (!allowedTypes.has(item.source_type)) errors.push(`${at}: source_type must be one of ${[...allowedTypes].join(', ')}`);
  if (item.exact_spot !== true) errors.push(`${at}: exact_spot must be true for a spot Hero`);
  if (!/^https:\/\//.test(String(item.source_url || ''))) errors.push(`${at}: source_url must be https://`);
  if (!String(item.license || '').trim()) errors.push(`${at}: license is required`);
  if (!String(item.rights_basis || '').trim()) errors.push(`${at}: rights_basis is required`);
  if (typeof item.author !== 'string') errors.push(`${at}: author must be a string (empty is allowed when genuinely not required)`);
  if (typeof item.attribution !== 'string') errors.push(`${at}: attribution must be a string (empty is allowed when genuinely not required)`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(item.verified_at || ''))) errors.push(`${at}: verified_at must be YYYY-MM-DD`);
  const asset = String(item.local_asset || '').replace(/^\//, '');
  if (!asset.startsWith('assets/') || asset.includes('..') || /^https?:\/\//.test(asset)) {
    errors.push(`${at}: local_asset must be a local assets/... path`);
  } else if (!fs.existsSync(path.join(root, asset))) {
    errors.push(`${at}: local_asset does not exist: ${asset}`);
  }
}

if (errors.length) {
  console.error(`Image source validation failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Image source validation OK: ${manifest.length} verified entries`);
}
