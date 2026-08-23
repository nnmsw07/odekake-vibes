# CHANGELOG v0.10

## Instagram Reel pilot

Added the first two manually selected Reel permalinks to the existing Instagram detail-card implementation.

- 長井海の手公園 ソレイユの丘
  - `https://www.instagram.com/reel/DYGf0FYxCXT/`
- teamLab Planets TOKYO
  - `https://www.instagram.com/reel/DaaKQXZDBxp/`

The shared `igsi` query parameters were intentionally removed. Kibun stores the canonical public Reel permalink only.

No UI logic change is required: detail pages already switch from the Instagram profile card to an official Instagram Embed whenever `reel_url` is populated.
