# Move the Totango account portfolio

Totango's main website now announces Odie. This guide is for an existing Totango account with the segment export documented in its help centre. It does not claim compatibility with an Odie export or API.

Sources checked 11 October 2026:

- [Export segment data](https://support.totango.com/hc/en-us/articles/10233417253652-Export-segment-data)
- [Understand segments](https://support.totango.com/hc/en-us/articles/208774826-Understand-segments)
- [Export tasks and touchpoints](https://support.totango.com/hc/en-us/articles/4404703957524-Export-a-local-data-file)
- [Totango identity announcement](https://www.totango.com/)

## Export and import

An authorised Totango operator opens an account segment, removes unwanted filters, selects the required columns, and uses the segment menu's Download CSV option. Totango says exported headings match the selected segment columns. Labels are configurable, so compare your file to the mapping below before import. The included fixture is synthetic, not a vendor-generated file.

```bash
npm run migrate
npm run success -- import totango --file=imports/accounts.csv --actor="Migration operator" --dry-run
npm run success -- import totango --file=imports/accounts.csv --actor="Migration operator"
```

Run against an empty production database, not the demo. Exact repeats skip. Any invalid row rolls back the complete import. A changed row with an existing source ID stops and requires reconciliation; the import will never silently overwrite local work.

| Selected heading | Destination | Requirement |
|---|---|---|
| Account ID | Stable source identifier | Required |
| Account Name | Account name | Required, unique ignoring case |
| Success Manager | Owner | Blank becomes Unassigned |
| Segment | Segment | Blank becomes standard |
| Contact | Contact note | Optional, minimise personal data |
| Contract Renewal Date | Active term renewal date | YYYY-MM-DD |
| Contract Value | Annual recurring amount | Nonnegative decimal, at most two places, no separators or symbols |
| Currency | Contract currency | Three uppercase letters |

The three contract fields must all be present or all absent. Contract Value must mean annual recurring revenue in your selected export. If your attribute contains monthly revenue or total multi-year contract value, select the annual attribute or reconcile it first. No automatic currency conversion or revenue annualisation occurs. An imported term starts 365 days before its renewal date as a documented placeholder, not recovered contract history. Correct it against the signed contract before relying on tenure. Raw source fields remain on the account.

Use --currency=NZD only for an export known to contain one currency; it fills missing currency cells. For renamed headings, create a private mapping file and add --mapping=imports/headings.json:

```json
{"id":"Account Id","name":"Name","owner":"CSM","arr":"Annual Contract Value"}
```

Allowed mapping keys: id, name, owner, segment, contact, renewal, arr, currency. The importer rejects unknown mapping keys. CSV supports quoted commas, multiline fields, doubled quotes, BOM and CRLF. Ambiguous dates, currency symbols and mixed decimal formats require normalisation before import.

## What still needs reconciliation

This imports accounts and the selected current contract facts in one command. It does not recreate Totango health profiles, historical usage, account hierarchy, SuccessPlays, objectives, tasks, touchpoints, attachments, user accounts, permissions or live integrations. Other source columns are preserved as raw account data, not operational records. Totango documents separate task and touchpoint exports; archive those files and map them as a separate migration job. The base commands can record verified usage, conversations, actions and outcomes once mapped.

Health starts unknown until current evidence is recorded. We do not turn an exported health label into proof. Compare account counts and current annual values by currency against the selected source segment. Review every excluded field and required connection. Run both systems through a renewal review and obtain the owner's cutover decision before cancelling anything.

## Take your records out

```bash
npm run success -- export --out=exports/customer-success.json
```

This produces a consistent JSON snapshot of all seven record sets, including raw import fields and activity. It refuses to overwrite a file. It is an interchange export, not a complete database restore. Back up the database separately and test restoration before production use.
