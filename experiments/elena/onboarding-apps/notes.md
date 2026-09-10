# Onboarding (Vertical sections)

Copy of `elena/onboarding-v2` with a single-column onboarding layout.

## What changed

- Removed the sticky service sidebar
- Plan, price, service name, and Create service sit after the build-target picker
- Application path uses that same section for the Aiven Runtime price card
- **Basic details** is the last section
- Content column is 75% of the shell width
- Service cards: PostgreSQL, Kafka, ClickHouse, OpenSearch, then Valkey, MySQL, Grafana
- Entrance animation is twice as slow
- Plan and price cards show skeleton placeholders until they enter
- Dev tools footer is hidden
- Service name is 50% width
- Create service sits at the bottom, under Basic details

## Flow

1. What would you like to build?
2. Selected service summary, or Aiven Runtime
3. Basic details
