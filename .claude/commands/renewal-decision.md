---
description: Record a renewal or cancellation decision.
---

Read CLAUDE.md. Record a renewal or cancellation decision.

```bash
npm run success -- renewal-decision --contract="Annual agreement" --outcome=renewed --next-renewal=2028-10-01 --arr=26000 --evidence="Signed agreement reference" --actor="Operator"
```

Read the affected account or record first. Use the operator identity for --actor. Replace example values with confirmed facts. Report the saved identifier and any follow-up. Never invent evidence.

All commands support --json. Dates are YYYY-MM-DD. Ambiguous names list candidates and exit 1. Never send, publish or delete from this recipe.
