# Customer Success for Claude Code

Own the renewal review. Account health, customer outcomes, usage evidence and follow-ups in one Postgres database, operated through Claude Code, Codex, OpenCode or Cursor.

## Three ways to run it

- **Do it yourself.** MIT-licensed and free. Install, import and operate your own system. Hosting and agent subscriptions are separate.
- **We customise it.** Enterprise DNA maps your Totango records, adds your fields, health rules and documents, and builds a web front end or uses another stack if required. One setup fee, then a retainer for ongoing work.
- **We run it for you.** Installed, connected and operated through Omni by Enterprise DNA. One setup fee, then a monthly retainer. [Book a call](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=totango&utm_medium=readme).

## Run the demo

Node 20 or newer. No database account needed.

```bash
npm install
npm run demo
npm test
npm run success -- weekly-review
npm run view
npm run docs
```

The fictional portfolio includes Harbour Analytics with weak adoption and overdue promises, Kauri Software with recent positive evidence, and Southern Data with an overdue renewal and stale observations. Dates are relative to first seed. Repeating the seed preserves existing records.

PGlite stores data in .data/db unless DATA_DIR is set. Set DATABASE_URL to use shared Postgres. UTC is used for dates. A production database starts with npm run migrate and your own records, not the demo seed.

## Five weekly jobs

1. /renewals-due: review overdue terms and the next 90 days.
2. /risk-review: explain the evidence behind account health.
3. /adoption-review: compare active and licensed users, with freshness dates.
4. /customer-chase: find accounts without recent conversations.
5. /qbr: prepare customer outcomes, evidence and next actions.

/weekly-review combines renewal, attention and compliance outputs. 32 CLI commands and 34 slash recipes ship. [Full reference](docs/cli.md).

## Health means evidence

Negative last sentiment, an overdue action, or fresh adoption below 40 percent flags at risk. Missing usage or usage older than 14 days, and missing conversations or conversations older than 30 days, otherwise produce unknown. Fresh adoption below 70 percent or an overdue customer outcome produces watch. Healthy requires recent evidence and none of those conditions. Known risk takes priority over unknown evidence; the reasons retain both. These thresholds are local defaults, not Totango's scoring formula.

A renewal or cancellation needs evidence. Renewal closes the old contract and records the agreed next term in one transaction. Failed decisions roll back. There is one active agreed contract per account, with currency kept on the contract. An early renewal immediately changes the agreed contract register; this is not a revenue recognition or billing system.

## Ten questions for the retention meeting

These are questions this build answers today. Totango documents custom segments, health profiles and reporting, so this is not a claim that its product cannot answer comparable questions. You own the definitions here.

| Question | Command |
|---|---|
| Which renewals are overdue or due within 90 days? | renewals-due |
| Which customers have negative conversations and overdue promises? | risk-review |
| Which apparently strong accounts have stale usage evidence? | adoption-review |
| Which customers have gone a month without a conversation? | customer-chase |
| Who owns the unresolved follow-ups? | actions |
| Which agreed customer outcomes are overdue? | objectives |
| How much contracted annual value is at risk in each currency? | revenue-review |
| Which account lead has the largest overdue workload? | owner-load |
| Which accounts need a privacy evidence review? | compliance |
| What should we discuss at the next quarterly customer review? | qbr |

## Your first hour: ten things to ask for

1. Put our business name and colours on every review pack.
2. Find the next quarter's renewals.
3. Explain Harbour's risk flag.
4. Show accounts with stale usage.
5. Show annual values separately for each currency.
6. Draft a quarterly review for Kauri.
7. Find every overdue promise.
8. Test our Totango export without saving it.
9. Add our account region through /customise.
10. Add an owner-specific dashboard through /new-view.

## Bring the account portfolio

```bash
npm run success -- import totango --file=imports/accounts.csv --actor="Migration operator" --dry-run
npm run success -- import totango --file=imports/accounts.csv --actor="Migration operator"
```

One command imports the selected account segment and optional current annual contract facts. It validates the entire file, preserves raw source fields, skips exact repeats and rejects changed source IDs. Configure custom headings with --mapping. [Export steps, exact mapping and exclusions](docs/replace-totango.md). The fixture is synthetic. Imported health remains unknown until fresh evidence is recorded.

Totango's site now announces Odie. This importer targets the documented Totango account-segment CSV, not Odie. Tasks, conversations, historic usage, health rules and connections need separate mapping. Validate those needs before a cutover.

## Documents and views

Edit brand.json once. npm run docs renders a quarterly review, renewal brief and success plan per account as branded HTML. npm run view renders weekly and privacy reviews. Files are private, read-only and printable. OUTPUT_DIR changes the output root. /draft-qbr and /draft-renewal write internal notes to drafts/ and never send.

/compliance flags notice assessments and security or retention review dates against [cited NZ privacy principles](docs/compliance.md). These reminders do not certify compliance. [What screens provide](docs/why-no-front-end.md).

## Verification and operation

The suite uses a temporary database, migrates, seeds twice and exercises every command. It checks evidence gates, renewal rollback, currency separation, unknown health, import rollback and repeat handling, column mapping, malformed CSV, dates, ambiguity, exports, HTML escaping, documents and drafts. CI is configured for Windows and Linux on Node 20 and 22, plus Postgres 17. TEST_DATABASE_URL must name a fresh disposable database.

RLS is enabled without public policies. This is a trusted-operator base, not a public multi-tenant service. Shared use needs authenticated access, restricted roles, private storage, backups and a restore rehearsal. Activity is attributable but not tamper-proof. JSON export is an interchange snapshot, not a restore mechanism.

No front end, background telemetry, live integrations, email delivery or predictive scoring is included. MIT licence. Not affiliated with Totango, Odie or Anthropic.
