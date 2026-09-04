# Handoff v20.11.14

The user preferred the generated 4:5 editorial graphics that group roughly three facilities per image and asked for two additions:

1. Clearly state that the visuals are generated-AI images.
2. Use slide 2 as a Kibun Trip introduction page.

Implementation:
- `ARTICLE_POSTERS` maps the ten currently generated article graphics.
- `draftForIdea()` returns a two-slide flow when an article has a mapped poster.
- `captureSourceById()` deliberately refreshes previously saved article drafts to that two-slide flow.
- Slide 1 gets both an `AIイメージ` badge and a bottom disclosure overlay.
- The caption also receives the disclosure automatically.
- Slide 2 is a branded 4:5 Kibun intro explaining `気分 × 同行者 × 時間 → 3つに絞って提案` and points to `kibuntrip.com`.

The remaining article slugs can be added later by dropping a new 4:5 WebP into `assets/sns/article-posters/` and adding one mapping entry.
