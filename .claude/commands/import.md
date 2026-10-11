---
description: Import the selected Totango account segment.
---

Read CLAUDE.md. Import the selected Totango account segment.

```bash
npm run success -- import totango --file=imports/accounts.csv --dry-run --actor="Operator"
```

Read the affected account or record first. Use the operator identity for --actor. Replace example values with confirmed facts. Report the saved identifier and any follow-up. Never invent evidence.

Start with --dry-run and read docs/replace-totango.md. Confirm the source column meanings and currency before removing --dry-run.

All commands support --json. Dates are YYYY-MM-DD. Ambiguous names list candidates and exit 1. Never send, publish or delete from this recipe.
