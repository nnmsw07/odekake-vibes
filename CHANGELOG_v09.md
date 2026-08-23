# CHANGELOG v0.9

## Instagram / Reel prototype
- Added `social_embeds` data for 11 spots with verified official Instagram accounts.
- Detail dialog now shows **「この場所の雰囲気をのぞく」**.
- When `reel_url` is present, Kibun renders the official Instagram Embed on demand.
- When no individual Reel URL is registered yet, Kibun shows a lightweight link card to the official Instagram profile.
- Instagram is never loaded on list/result cards, keeping the main browsing experience light.
- Videos and thumbnails are not downloaded or re-hosted by Kibun.

## Data model
Each supported spot may have:
```json
{
  "social_embeds": [{
    "platform": "instagram",
    "type": "reel",
    "reel_url": null,
    "account_url": "https://www.instagram.com/.../",
    "account_handle": "@...",
    "source_type": "official",
    "permission_status": "official_embed_candidate"
  }]
}
```

To turn a profile link into an embedded Reel later, set `reel_url` to the exact public Reel permalink. No UI code change is needed.
