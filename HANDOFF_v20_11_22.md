# Handoff v20.11.22

SNS Audit article flow is now intentionally simple:

1. `article-poster` — AI image + title
2. `article-spots` — first 3 article spots with AI visuals + concise editorial blurbs

The old `kibun-intro` renderer is left in place for backwards compatibility with stored local drafts, but new article drafts no longer use it.

Caption generation: `articleCaptionLead()` + 3 × `spotCaptionBlurb()` + CTA + AI disclosure + hashtags.

Do not replace the 3-spot slide with one-spot-per-slide unless a specific post needs a deeper feature.
