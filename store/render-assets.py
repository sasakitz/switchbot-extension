#!/usr/bin/env python3
"""Render local, self-contained store pages; normalize screenshots to RGB PNG."""
import argparse
import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw

parser = argparse.ArgumentParser()
parser.add_argument('--chrome', default=shutil.which('google-chrome') or '/opt/google/chrome/chrome')
args = parser.parse_args()
store = Path(__file__).resolve().parent
kit = store / 'kit'
jobs = json.loads((kit / 'source/render-manifest.json').read_text())
with tempfile.TemporaryDirectory(prefix='switchbot-store-render-') as profile:
    for job in jobs:
        output = kit / job['output']
        subprocess.run([
            args.chrome, '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
            '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
            '--host-resolver-rules=MAP * ~NOTFOUND', '--hide-scrollbars', '--allow-file-access-from-files',
            '--force-device-scale-factor=1', '--virtual-time-budget=1500', f'--user-data-dir={profile}',
            f"--window-size={job['width']},{job['height']}", f'--screenshot={output}',
            (kit / 'source' / job['source']).as_uri(),
        ], check=True, stdout=subprocess.DEVNULL)
        with Image.open(output) as im:
            assert im.size == (job['width'], job['height']), (output, im.size)
            im.convert('RGB').save(output, optimize=True)
        print(f"Rendered {job['output']}", flush=True)

# Store icon has the recommended transparent padding; toolbar icons stay legible at small sizes.
with Image.open(store.parent / 'icons/icon128.png') as im:
    artwork = im.convert('RGBA').crop((4, 4, 124, 124)).resize((96, 96), Image.Resampling.LANCZOS)
    icon = Image.new('RGBA', (128, 128), (0, 0, 0, 0))
    icon.paste(artwork, (16, 16))
    icon.save(kit / 'icons/store-icon-128x128.png', optimize=True)

# A review sheet, separate from the files uploaded to the store.
sheet = Image.new('RGB', (1320, 1220), '#e8efeb')
draw = ImageDraw.Draw(sheet)
for i, job in enumerate(jobs[:5]):
    with Image.open(kit / job['output']) as im:
        thumb = im.resize((640, 400), Image.Resampling.LANCZOS)
        x, y = 10 + (i % 2) * 660, 12 + (i // 2) * 350
        # Smaller previews allow five screenshots plus both promos on one sheet.
        thumb = thumb.resize((512, 320), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (x, y))
        draw.text((x, y + 325), job['output'], fill='#20332d')
with Image.open(kit / 'promotional/promo-tile-440x280.png') as im:
    sheet.paste(im.resize((330, 210), Image.Resampling.LANCZOS), (670, 712))
with Image.open(kit / 'promotional/marquee-1400x560.png') as im:
    sheet.paste(im.resize((630, 252), Image.Resampling.LANCZOS), (670, 940))
sheet.save(kit / 'contact-sheet.png', optimize=True)
print('Validated sizes; created padded store icon and contact-sheet.png')
