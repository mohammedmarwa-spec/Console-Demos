# BTAR — OpenSearch managed backups

First slice of the Backup to another region prototype, built on the current console Backup management screen for `os-50f7b82`.

## What this screen does

- OpenSearch service sidebar with **Backup management** selected.
- Backup configuration stats from the console screenshot.
- Five backup rows sampled from the top of that table.
- The Backup configuration header keeps only the "..." backup settings menu. The **Add backup** link under Not set opens the revised enable modal: backup-copy alert, a secondary region, and backup frequency fixed at the hourly plan default. The tertiary region is removed for now. The region shows storage, transfer, and a subtotal. The total cost estimate stays at the end of the card. How the estimate works stays collapsed until opened.
- **Add backup region** stays disabled until a secondary region is chosen. The table stays “Not set” after save.
## CCR - OpenSearch

Second OpenSearch entry point, from the console **Create follower** action on Cross cluster replication. This tab is only the popup.

- Title: Create follower for `os-50f7b82`.
- Existing service is selected. Project is `dev-sandbox`. The service list shows the OpenSearch icon, name, region, power state, and version. Service starts empty, so **Connect** stays disabled.
- After a service is chosen, the estimate splits fixed monthly (unchanged, $0) from usage-based replication (the amount that changes). New service hides that estimate.
- New service hides the project and service fields and changes the primary button to **Create service**.
- Cancel closes the popup. **Create follower** opens it again.

## BTAR(PostgreSQL · Managed)

Window for `orders-pg`. Title **Add secondary backup region**. Intro copy does not mention a tertiary copy. One region field, shown as the region plus its place name. The cost card is **Estimated extra cost**, then backup storage and transfer between regions, with the total cost estimate at the end. Primary action is **Add backup region**.

## Not in this slice

- Enabled card, disable, BYOC. The estimate numbers are placeholders.
- Connecting a follower or creating the new service.
