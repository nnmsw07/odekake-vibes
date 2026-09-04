# HANDOFF v20.11.8

The v20.11.7 auto-open-photo resolver could choose an unrelated Commons image because it prioritized a safe license but did not enforce semantic/entity match strongly enough. A screenshot showed a William Shakespeare/Public Domain image under PLAY! PARK ERIC CARLE.

v20.11.8 adds strict venue-match gating:
- exact spot/alias match = strong
- token-only matches need location context
- Wikidata no longer falls back to `rows[0]`
- unrelated people/entities are rejected
- low-confidence Commons candidates cannot be adopted from IMAGE / RIGHTS

Fail-closed behavior: no reliable image => keep the designed no-photo SNS card.
