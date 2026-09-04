# APPLY v20.11.9

The package is already syntax/regression tested before delivery.

After uploading `kibun-v20.11.9.zip` to the repository root, run one command in Codespaces:

```bash
git pull origin main && unzip -o kibun-v20.11.9.zip -d . && bash apply_update.sh
```

`apply_update.sh` stages, commits, and pushes the update. It intentionally does not rerun the full test suite in Codespaces because this package is tested before delivery.
