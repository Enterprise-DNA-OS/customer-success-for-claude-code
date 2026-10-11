# Customer Success for Claude Code

Operate customer retention, account reviews and renewal decisions from recorded evidence. The demonstration business is Harbour Retention Studio. Replace its name in brand.json and record the operating owner before production use.

## Working rules

- Read the account before writing. Every factual answer starts with the CLI.
- Run npm run success -- help for the accepted commands and flags.
- Draft only. Never email, publish, delete or make a renewal commitment.
- Record only confirmed evidence. Actor labels are attribution, not authentication.
- Keep personal information, exports and generated HTML private.
- A health label is a transparent local rule, not a churn prediction or customer approval.
- Never sum different currencies. Contracted annual values are not recognised revenue.
- Use versioned migrations for changes and run npm test.

## Routing

| Request | Recipe |
|---|---|
| List account owners and segments | /accounts |
| Read the contract register | /contracts |
| Explain account health from recorded evidence | /risk-review |
| Review overdue and upcoming renewals | /renewals-due |
| Review active users and evidence freshness | /adoption-review |
| Find accounts without a recent conversation | /customer-chase |
| Find risk, unknown health and overdue renewals | /attention |
| Read follow-up ownership and due dates | /actions |
| Review customer outcomes and supporting evidence | /objectives |
| Read the conversation history | /touchpoints |
| Read usage observations and their sources | /usage |
| Compare account and overdue-action workload | /owner-load |
| Review agreed annual amounts by currency | /revenue-review |
| Review privacy evidence reminders | /compliance |
| Read the operator activity record | /history |
| Show commands and accepted flags | /help |
| Combine renewals, attention and privacy evidence | /weekly-review |
| Read the quarterly customer review | /qbr |
| Register an account and its owner | /add-account |
| Record the current annual agreement | /add-contract |
| Record a customer conversation | /log-touch |
| Record a dated usage observation | /record-usage |
| Assign a dated follow-up | /add-action |
| Close a follow-up with evidence | /finish-action |
| Record an agreed customer outcome | /add-objective |
| Close an outcome with evidence | /close-objective |
| Record a renewal or cancellation decision | /renewal-decision |
| Record the privacy notice assessment and review dates | /review-privacy |
| Import the selected Totango account segment | /import |
| Export all records to a new JSON file | /export |
| Draft a quarterly review for internal review | /draft-qbr |
| Draft an internal renewal preparation note | /draft-renewal |
| Change fields or health rules | /customise |
| Add a read-only report | /new-view |

The CLI is scripts/success.mjs. Migrations live in supabase/migrations. DATABASE_URL selects shared Postgres; without it PGlite uses DATA_DIR or .data/db. npm run demo seeds fictional data and is for demonstration only. Run only migrations and the verified import for a fresh production database.

Review docs/compliance.md and docs/replace-totango.md before importing contacts. Read docs/why-no-front-end.md before promising live connections or a portal.

Built and run for your business through Omni by Enterprise DNA: https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=totango&utm_medium=readme
