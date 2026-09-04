# APPLY v20.11.4

## Update ZIP
- `kibun-v20.11.4-update.zip`

## Codespaces apply commands
```bash
cd ~/odekake-vibes
unzip -o kibun-v20.11.4-update.zip
node --check sns-audit/audit.js
```

## Optional local preview
```bash
python3 -m http.server 8000
```
Then open the SNS Audit page in the browser preview / forwarded port.

## What to check
1. Open `kibuntrip.com/sns-audit/`
2. Open a screenshot page from an idea draft.
3. Confirm there are two modes:
   - `SNS投稿用`
   - `監査Hero確認`
4. In `SNS投稿用`, confirm:
   - cover slide can still show a hero image
   - spot slides no longer all repeat the same generated image
   - spots without a distinct safe image render as elegant text cards
5. In `監査Hero確認`, confirm the selected Google Places hero is previewed with the rights warning.
