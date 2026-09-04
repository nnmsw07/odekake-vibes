# APPLY v20.11.8

Upload `kibun-v20.11.8.zip` to the repository root, then in Codespaces run:

```bash
git pull origin main && unzip -o kibun-v20.11.8.zip -d . && bash apply_update.sh
```

Tests were run before packaging. `apply_update.sh` only stages, commits, and pushes this update.
