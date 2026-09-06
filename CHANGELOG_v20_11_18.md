# Kibun v20.11.18 — Hero rescue hotfix

- Fixed the root cause behind the blank Hero with a floating `イメージ` badge: six new spots referenced `images/ai/cafe-interior.jpg`, which did not exist in the repository.
- Added a real bundled fallback asset for terrace / restaurant spots and switched the ANA hotel day-use fallback to an existing local image.
- Fixed the runtime race where a failed static fallback removed the `<img>` before Google Places could replace it.
- Manually audited `photo_index_override` values now work even when Google’s display name differs from Kibun’s editorial/event name. The bypass is only allowed when an explicit photo index is present.
- Shortened the Hilton Tokyo Places query to the actual facility name while retaining the selected Hero photo index `#1`.
- Added cache-busting for `media.js`, `app.js`, `data.js`, and `styles.css`.
- The update script now stages `media.js` and `worker/worker.js` and deploys the Cloudflare Worker before committing/pushing, so Worker fixes are not silently omitted again.
