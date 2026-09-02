# v20.6 — Activity affiliate + overseas-ready foundation

- Affiliate Audit providers expanded to Asoview, Jalan Play/Experience, Activity Japan and KLOOK.
- Asoview, Jalan Play/Experience and KLOOK are enabled as LinkSwitch source-URL providers.
- Activity Japan is available in Audit with a manual-safe fallback until the account-side LinkSwitch capability is reconfirmed.
- Generic domestic leisure-ticket candidates are expanded into provider-specific candidates instead of one opaque ticket-ASP bucket.
- KLOOK is suggested for spots tagged as inbound-OTA candidates.
- Activity Japan is suggested selectively for workshops, crafts, outdoor activities, cruises and hands-on experiences.
- Affiliate config now has overseas provider priorities; KLOOK is first for overseas experiences.
- App display is country-aware. Existing JP records keep the current prefecture/city display; overseas records can use country_code/country/city.
- The Browse UI automatically exposes an Overseas region only after overseas spots are present, avoiding an empty tab today.
