# BTAR — OpenSearch managed backups

First slice of the Backup to another region prototype, built on the current console Backup management screen for `os-50f7b82`.

## What this screen does

- OpenSearch service sidebar with **Backup management** selected.
- Backup configuration stats from the console screenshot.
- Five backup rows sampled from the top of that table.
- The Backup configuration header keeps only the "..." backup settings menu. The **Add** link under Not set opens the revised enable modal: backup-copy alert, a secondary region, and backup frequency fixed at the hourly plan default. The tertiary region is removed for now. The region shows storage, transfer, and a subtotal. The total cost estimate stays at the end of the card. How the estimate works stays collapsed until opened.
- **Add backup location** stays disabled until a secondary region is chosen. The table stays “Not set” after save.

## Backup management (simplified)

Same OpenSearch page, but the add window is identical to the PostgreSQL one: the same alert, one Secondary backup location field, and the rates-only **Additional costs** card. It has no primary location line, frequency line, estimated amounts, or How the estimate works section. Both services charge the same rates, so the window is shared.

## CCR - OpenSearch

Second OpenSearch entry point, from the console **Create follower** action on Cross cluster replication. This tab is only the popup.

- Title: Create follower for `os-50f7b82`.
- Existing service is selected. Project is `dev-sandbox`. The service list shows the OpenSearch icon, name, region, power state, and version. Service starts empty, so **Create follower** stays disabled.
- After a service is chosen, a rates-only cost card in the same style as Backup management (simplified) shows: no new compute charge, then a **Monthly estimate** with the replication rate ($0.03 per GB on the same continent, $0.15 to a different continent). There's no GB input and no computed amount. New service hides that card.
- New service hides the project and service fields. The primary button is **Create follower** for both options.
- Cancel closes the popup. **Create follower** opens it again.

## BTAR(PostgreSQL · Managed)

Backups page for `pg-3da40008`, replicating the PostgreSQL console: service header, Backups title with Fork service, Backup configuration, and the backups table. The **Add** link under Secondary backup location, Not set, opens the add window. Window title **Add secondary backup location**. Intro copy explains the second copy, with a Learn more link. One **Secondary backup location** field, shown as the region plus same or different continent. The **Additional costs** card shows rates only, no estimated amounts: backup storage at $0.10 per GB-month, and backup transfer at $0.03 per GB transferred on the same continent ($0.15 to a different continent, which the card switches to when that region is chosen). Primary action is **Add backup location**.

## Not in this slice

- Enabled card, disable, BYOC. The estimate numbers are placeholders.
- Connecting a follower or creating the new service.
