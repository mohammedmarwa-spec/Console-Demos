#!/usr/bin/env bash
# Re-download service icons from Figma MCP asset URLs, then run process-service-icons.mjs
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)/src/assets/service-icons"
cd "$DIR"

download() { curl -sfL -o "$1" "$2"; }

# dark (white logomark) | light / blk (black logomark)
download kafka.png            "https://www.figma.com/api/mcp/asset/7211f32b-bf23-445a-96f5-dd9cb7087454"
download kafka-blk.png        "https://www.figma.com/api/mcp/asset/a75c0802-9c39-4b0b-9d49-421f3f1c975c"
download postgresql.png       "https://www.figma.com/api/mcp/asset/941dd90c-3232-4379-b2ec-369c9b198068"
download postgresql-blk.png   "https://www.figma.com/api/mcp/asset/92d05434-cedf-4704-a52d-a5aed65bc501"
download clickhouse.png       "https://www.figma.com/api/mcp/asset/a06ddeba-e961-44d5-a7bd-06300e007f48"
download clickhouse-blk.png   "https://www.figma.com/api/mcp/asset/1df51132-e2ce-4a48-8ccd-8dd42dade79d"
download opensearch.png       "https://www.figma.com/api/mcp/asset/260a6991-fc6d-4bf0-a0cc-69ffbdfb552d"
download opensearch-blk.png   "https://www.figma.com/api/mcp/asset/a3e34046-ee5e-49f6-adcf-b24200c1df21"
download valkey.png           "https://www.figma.com/api/mcp/asset/d3de34da-1196-4794-8843-896128bbf785"
download valkey-blk.png       "https://www.figma.com/api/mcp/asset/450c442e-3192-4d64-b5ee-bc8a41853e61"
download mysql.png            "https://www.figma.com/api/mcp/asset/afba1cb0-5107-4dc4-a233-792ecf3a0111"
download mysql-blk.png        "https://www.figma.com/api/mcp/asset/a40cd77f-dfa1-45b8-a642-02c070e8e0c4"
download metrics.png          "https://www.figma.com/api/mcp/asset/f6aa0cfb-ccbf-413c-baa3-35daffc62d7e"
download metrics-blk.png      "https://www.figma.com/api/mcp/asset/a4f40ce4-f250-4140-9595-86b846736cc2"
download grafana.png          "https://www.figma.com/api/mcp/asset/fe662794-686e-4f8f-afe1-3281c4bf8d92"
download grafana-blk.png      "https://www.figma.com/api/mcp/asset/f703b128-d546-4ee1-8c4d-75ab05b79774"
download datahub.png          "https://www.figma.com/api/mcp/asset/b8859df5-453e-4b90-955c-28d74e1ad064"
download datahub-blk.png      "https://www.figma.com/api/mcp/asset/5e64d154-fc96-4268-b11e-36a576670a3c"
download aiven-apps.png       "https://www.figma.com/api/mcp/asset/e96669f9-0f7a-4461-96d0-b5eed0044e83"
download aiven-apps-blk.png   "https://www.figma.com/api/mcp/asset/64fb98e3-2316-4f10-b747-33f3f160914f"
download generic.png          "https://www.figma.com/api/mcp/asset/44f2a8c8-068b-4751-b645-bafa95c36e91"
download generic-blk.png      "https://www.figma.com/api/mcp/asset/89276c5b-db28-4a7c-bbbe-0e0601278586"

cd "$(dirname "$0")/.."
node scripts/process-service-icons.mjs dark \
  kafka.png postgresql.png clickhouse.png opensearch.png valkey.png \
  mysql.png metrics.png grafana.png datahub.png aiven-apps.png generic.png
node scripts/process-service-icons.mjs light \
  kafka-blk.png postgresql-blk.png clickhouse-blk.png opensearch-blk.png valkey-blk.png \
  mysql-blk.png metrics-blk.png grafana-blk.png datahub-blk.png aiven-apps-blk.png generic-blk.png
