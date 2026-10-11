# Command reference

All 32 commands support --json. Mutation commands require --actor. Names match without case; UUID prefixes must be unique. An ambiguous match lists candidates and exits 1. Unknown flags and positional arguments fail.

## accounts

List account owners and segments.

`npm run success -- accounts`

Accepted flags: none beyond --json.

## contracts

Read the contract register.

`npm run success -- contracts`

Accepted flags: none beyond --json.

## risk-review

Explain account health from recorded evidence.

`npm run success -- risk-review`

Accepted flags: none beyond --json.

## renewals-due

Review overdue and upcoming renewals.

`npm run success -- renewals-due`

Accepted flags: none beyond --json.

## adoption-review

Review active users and evidence freshness.

`npm run success -- adoption-review`

Accepted flags: none beyond --json.

## customer-chase

Find accounts without a recent conversation.

`npm run success -- customer-chase`

Accepted flags: none beyond --json.

## attention

Find risk, unknown health and overdue renewals.

`npm run success -- attention`

Accepted flags: none beyond --json.

## actions

Read follow-up ownership and due dates.

`npm run success -- actions`

Accepted flags: none beyond --json.

## objectives

Review customer outcomes and supporting evidence.

`npm run success -- objectives`

Accepted flags: none beyond --json.

## touchpoints

Read the conversation history.

`npm run success -- touchpoints`

Accepted flags: none beyond --json.

## usage

Read usage observations and their sources.

`npm run success -- usage`

Accepted flags: none beyond --json.

## owner-load

Compare account and overdue-action workload.

`npm run success -- owner-load`

Accepted flags: none beyond --json.

## revenue-review

Review agreed annual amounts by currency.

`npm run success -- revenue-review`

Accepted flags: none beyond --json.

## compliance

Review privacy evidence reminders.

`npm run success -- compliance`

Accepted flags: none beyond --json.

## history

Read the operator activity record.

`npm run success -- history`

Accepted flags: none beyond --json.

## help

Show commands and accepted flags.

`npm run success -- help`

Accepted flags: none beyond --json.

## weekly-review

Combine renewals, attention and privacy evidence.

`npm run success -- weekly-review`

Accepted flags: none beyond --json.

## qbr

Read the quarterly customer review.

`npm run success -- qbr --account="Harbour Analytics"`

Accepted flags: --account.

## add-account

Register an account and its owner.

`npm run success -- add-account --name="Customer name" --owner="Account lead" --actor="Operator"`

Accepted flags: --name, --owner, --segment, --contact, --actor.

## add-contract

Record the current annual agreement.

`npm run success -- add-contract --account="Customer name" --name="Annual agreement" --start=2026-10-01 --renewal=2027-10-01 --arr=24000 --currency=NZD --actor="Operator"`

Accepted flags: --account, --name, --start, --renewal, --arr, --currency, --actor.

## log-touch

Record a customer conversation.

`npm run success -- log-touch --account="Customer name" --note="What the customer said" --date=2026-10-11 --sentiment=neutral --actor="Operator"`

Accepted flags: --account, --note, --date, --sentiment, --actor.

## record-usage

Record a dated usage observation.

`npm run success -- record-usage --account="Customer name" --date=2026-10-11 --active=8 --licensed=10 --evidence="Source report reference" --actor="Operator"`

Accepted flags: --account, --date, --active, --licensed, --evidence, --actor.

## add-action

Assign a dated follow-up.

`npm run success -- add-action --account="Customer name" --name="Call sponsor" --owner="Account lead" --due=2026-10-18 --actor="Operator"`

Accepted flags: --account, --name, --owner, --due, --actor.

## finish-action

Close a follow-up with evidence.

`npm run success -- finish-action --action="Call sponsor" --evidence="Completed call note" --actor="Operator"`

Accepted flags: --action, --evidence, --actor.

## add-objective

Record an agreed customer outcome.

`npm run success -- add-objective --account="Customer name" --name="Reporting adopted" --due=2026-11-01 --actor="Operator"`

Accepted flags: --account, --name, --due, --actor.

## close-objective

Close an outcome with evidence.

`npm run success -- close-objective --objective="Reporting adopted" --outcome=achieved --evidence="Customer acceptance reference" --actor="Operator"`

Accepted flags: --objective, --outcome, --evidence, --actor.

## renewal-decision

Record a renewal or cancellation decision.

`npm run success -- renewal-decision --contract="Annual agreement" --outcome=renewed --next-renewal=2028-10-01 --arr=26000 --evidence="Signed agreement reference" --actor="Operator"`

Accepted flags: --contract, --outcome, --next-renewal, --arr, --evidence, --actor.

## review-privacy

Record the privacy notice assessment and review dates.

`npm run success -- review-privacy --account="Customer name" --notice="Collection basis and notice assessment" --retention=2027-01-01 --security=2027-01-01 --actor="Operator"`

Accepted flags: --account, --notice, --retention, --security, --actor.

## import

Import the selected Totango account segment.

`npm run success -- import totango --file=imports/accounts.csv --dry-run --actor="Operator"`

Accepted flags: --file, --mapping, --currency, --dry-run, --actor.

## export

Export all records to a new JSON file.

`npm run success -- export --out=exports/customer-success.json`

Accepted flags: --out.

## draft-qbr

Draft a quarterly review for internal review.

`npm run success -- draft-qbr --account="Harbour Analytics"`

Accepted flags: --account.

## draft-renewal

Draft an internal renewal preparation note.

`npm run success -- draft-renewal --account="Harbour Analytics"`

Accepted flags: --account.

For renewal-decision, --outcome=churned accepts no next term or amount. A renewed contract closes the old term and creates the next agreed term atomically. The register immediately shows the agreed next term, including when signed early; revenue-review is contracted annual value, not earned revenue or a billing ledger.

Usage dates and conversation dates cannot be future dates. Active users cannot exceed licensed users. An observation date can occur once per account. Historical evidence corrections need a reviewed migration, never a silent overwrite.
