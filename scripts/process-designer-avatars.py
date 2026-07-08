#!/usr/bin/env python3
"""Process designer headshots: B&W circle portrait + Aquarium brand color in corners."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path.home() / '.cursor/projects/Users-elena-ivanova-dev-console-prototype-lab/assets'
OUT_DIR = ROOT / 'public' / 'designers'

OUTPUT_SIZE = 400

# https://aquarium.aiven.io/43ae72f19/p/369955-colors
AQUARIUM_BRAND_COLORS = {
    'aivenGreen': '#5FFA74',
    'teal': '#2ED0CD',
    'deepBlue': '#6F64FF',
    'lightBlue': '#59D2F4',
    'purple': '#DF56F2',
    'yellow': '#FFE55E',
    'red': '#F85149',
    'orange': '#FF965E',
}

DESIGNERS = [
    {
        'name': 'Brian',
        'source': 'image-33eec335-53a9-4bda-ad95-63176dc6023f.png',
        'frameColor': '#FFD60A',  # keep
    },
    {
        'name': 'Caio',
        'source': 'image-192e238f-2b9d-4854-8c0f-2c1e2ab75b20.png',
        'frameColor': AQUARIUM_BRAND_COLORS['aivenGreen'],
    },
    {
        'name': 'Elena',
        'source': 'image-ea71b4de-4835-412d-811f-0676a4b16b8b.png',
        'frameColor': '#7B61FF',  # keep
    },
    {
        'name': 'Ioan',
        'source': 'image-c0f8436e-67bb-4880-8e07-f450e7ed71da.png',
        'frameColor': AQUARIUM_BRAND_COLORS['orange'],
    },
    {
        'name': 'Irene',
        'source': 'image-b9a4de38-b397-4e9e-8b8e-5b368a368981.png',
        'frameColor': '#00C2FF',  # keep
    },
    {
        'name': 'Kate',
        'source': 'image-82d6c0dc-79d4-42c6-b665-4f99c7078eed.png',
        'frameColor': AQUARIUM_BRAND_COLORS['deepBlue'],
    },
    {
        'name': 'Marwa',
        'source': 'image-e6da053b-74f0-490b-8eb4-cb27836c2002.png',
        'frameColor': AQUARIUM_BRAND_COLORS['purple'],
    },
    {
        'name': 'Robin',
        'source': 'image-fd86d8f5-a4a9-4337-b321-f5d0c8dc1446.png',
        'frameColor': AQUARIUM_BRAND_COLORS['red'],
    },
    {
        'name': 'Yaesul',
        'source': 'image-8cf45819-d10e-423e-845e-2c8fd10c46bb.png',
        'frameColor': AQUARIUM_BRAND_COLORS['lightBlue'],
    },
]


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip('#')
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def center_square_crop(image: Image.Image) -> Image.Image:
    width, height = image.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return image.crop((left, top, left + side, top + side))


def circle_mask(size: int) -> Image.Image:
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size - 1, size - 1), fill=255)
    return mask


def process_photo(source: Path, frame_color: str) -> Image.Image:
    image = Image.open(source).convert('RGB')
    image = center_square_crop(image)
    image = image.resize((OUTPUT_SIZE, OUTPUT_SIZE), Image.Resampling.LANCZOS)
    grayscale = ImageOps.grayscale(image).convert('RGB')

    canvas = Image.new('RGB', (OUTPUT_SIZE, OUTPUT_SIZE), hex_to_rgb(frame_color))
    mask = circle_mask(OUTPUT_SIZE)
    canvas.paste(grayscale, (0, 0), mask)
    return canvas


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest: list[dict[str, str]] = []

    for designer in DESIGNERS:
        source = ASSETS / designer['source']
        if not source.exists():
            raise FileNotFoundError(f'Missing source image: {source}')

        output_name = f"{designer['name'].lower()}.png"
        output_path = OUT_DIR / output_name
        processed = process_photo(source, designer['frameColor'])
        processed.save(output_path, optimize=True)

        manifest.append(
            {
                'name': designer['name'],
                'file': f'/designers/{output_name}',
                'frameColor': designer['frameColor'],
            }
        )
        print(f"✓ {designer['name']} → {output_path.name} ({designer['frameColor']})")

    manifest_path = OUT_DIR / 'manifest.json'
    manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
    print(f'\nWrote {manifest_path}')


if __name__ == '__main__':
    main()
