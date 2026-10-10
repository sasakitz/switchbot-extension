#!/usr/bin/env python3
"""Validate assets, copy submission copy, and create a store-listing ZIP."""
import hashlib
import json
import shutil
import zipfile
from pathlib import Path
from PIL import Image

store = Path(__file__).resolve().parent
kit = store / 'kit'
for name in ['README.md', 'listing.md', 'review-submission.md', 'submission-guide.md', 'privacy-policy.html']:
    shutil.copyfile(store / name, kit / name)

expected = {**{f'screenshots/{name}': (1280, 800) for name in [
    '01-device-list.png', '02-climate-control.png', '03-sensor-monitoring.png',
    '04-search-and-filter.png', '05-credentials-setup.png',
]}, 'promotional/promo-tile-440x280.png': (440, 280),
    'promotional/marquee-1400x560.png': (1400, 560),
    'icons/store-icon-128x128.png': (128, 128)}
for name, size in expected.items():
    with Image.open(kit / name) as image:
        assert image.size == size, (name, image.size)
        assert image.format == 'PNG'
        assert image.mode == ('RGBA' if name.startswith('icons/') else 'RGB'), (name, image.mode)
        if name.startswith('icons/'):
            assert image.getchannel('A').getbbox() == (16, 16, 112, 112), image.getchannel('A').getbbox()
for language in ['ja', 'en']:
    text = (kit / f'text/short-description-{language}.txt').read_text().strip()
    assert len(text) <= 132, (language, len(text))
    print(f'Short description ({language}): {len(text)} characters')

files = sorted(p for p in kit.rglob('*') if p.is_file() and 'source' not in p.relative_to(kit).parts
               and p.name not in ['assets-manifest.json', 'SHA256SUMS.txt'])
items = [{'file': str(p.relative_to(kit)), 'bytes': p.stat().st_size,
          'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
(kit / 'assets-manifest.json').write_text(json.dumps({'date': '2026-10-11', 'files': items}, indent=2) + '\n')
(kit / 'SHA256SUMS.txt').write_text(''.join(f"{item['sha256']}  {item['file']}\n" for item in items))
archive = store / 'switchbot-store-listing-kit.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as output:
    for p in [*files, kit / 'assets-manifest.json', kit / 'SHA256SUMS.txt']:
        output.write(p, str(p.relative_to(kit)))
with zipfile.ZipFile(archive) as output:
    assert output.testzip() is None
print(f'Validated {len(expected)} store images. Packaged {len(files) + 2} files: {archive}')
