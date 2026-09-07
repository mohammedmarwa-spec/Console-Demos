# Website hero — isometric hive

Aiven.io hero copy and chrome, with a true isometric hive background: raised human/agent platforms linked by axis-routed paths, and glowing packets traveling between them.

## What this tests

Whether an isometric hive of **human** (radar/circle) and **agent** (chip/square) cells — with moving line traffic — can replace both the terminal collage and the Neon-style bar aurora while keeping Aiven brand colors and a readable left-side hero.

## Visual model

- **True 2:1 isometric grid** — cells sit on `(gx, gy, gz)` and project with classic iso math
- **Human cells** — raised cylindrical platforms with elliptical tops, rings, and crosshairs
- **Agent cells** — raised isometric boxes with side faces and pulsing grids on top
- **Links** — routes along isometric X/Y axes (or curves in world space), then projected
- **Traffic** — light packets travel those isometric paths
- Composition weighted to the right so headline copy stays clear on the left

## Colors

From the live aiven.io stylesheet: teal `#2ed0cd`, purple `#df56f2`, green `#5ffa74`, yellow `#fdcd12`, light blue `#59d2f4`, deep blue accents, black `#05080f`.

## Out of scope

- Real navigation, demo booking, or production APIs
- Three.js / WebGL (2D canvas is enough for this prototype)
- Pixel-perfect recreation of the reference still
