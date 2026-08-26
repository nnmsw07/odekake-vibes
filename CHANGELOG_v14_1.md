# V0.14.1 — Hero audit cache fix

- Static JS/CSS references now include `?v=14.1` to bypass stale mobile browser/GitHub Pages caches.
- Hero audit activation is more robust: `?heroAudit=1` enables and persists audit mode on that device.
- `?heroAudit=0` disables the persisted audit mode.
- Audit dock shows `v14.1` so the loaded version is visually verifiable.
- No seed, recommendation, Google Places, or Worker behavior changes.
