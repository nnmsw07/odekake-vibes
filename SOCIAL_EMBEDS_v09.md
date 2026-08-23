# Social embeds v0.9

## Current behavior
- Hero/result cards: no Instagram content is loaded.
- Spot detail: shows one social section at most.
- `reel_url == null`: official Instagram profile link.
- `reel_url != null`: Instagram official Embed, loaded only when the detail is opened.

## Why profile fallback exists
Instagram does not expose individual Reel permalinks reliably through ordinary public search. Kibun does not guess Reel URLs. Once an exact public Reel is selected manually, paste it into `social_embeds[0].reel_url`.

## Rights rule
Do not download or re-upload Reel videos/screenshots. Keep content on Instagram using the official embed/link. For UGC from non-official accounts, obtain explicit permission before adding it to Kibun.


## v0.10 pilot Reels

The first two exact Reel permalinks are now registered:

- ソレイユの丘 — `https://www.instagram.com/reel/DYGf0FYxCXT/`
- teamLab Planets TOKYO — `https://www.instagram.com/reel/DaaKQXZDBxp/`

Tracking-style `?igsi=...` parameters are not stored.
