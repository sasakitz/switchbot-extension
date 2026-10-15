#!/usr/bin/env python3
"""Validate assets, copy submission copy, and create a local-only store-listing ZIP."""
import argparse
import hashlib
import json
import shutil
import zipfile
from pathlib import Path
from PIL import Image

store = Path(__file__).resolve().parent
kit = store / 'kit'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--include-review', action='store_true',
                    help='審査資料を含むローカル確認用ZIPを作成（公開用ではありません）')
args = parser.parse_args()
private_docs = {'listing.md', 'review-submission.md', 'submission-guide.md'}
for name in ['README.md', 'privacy-policy.html', *sorted(private_docs)]:
    if not (store / name).exists():
        if name in private_docs and not args.include_review:
            continue
        raise SystemExit(f'ローカル資料がありません: {store / name}')
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
for language in ['ja']:
    text = (kit / f'text/short-description-{language}.txt').read_text().strip()
    assert len(text) <= 132, (language, len(text))
    print(f'Short description ({language}): {len(text)} characters')

listing_files = set(expected) | {
    'README.md', 'privacy-policy.html', 'text/description-ja.txt',
    'text/short-description-ja.txt', 'text/release-notes-ja.txt', 'text/build-info.json',
    'icons/icon.svg', *{f'icons/icon{size}.png' for size in [16, 32, 48, 128]},
}
files = sorted(p for p in kit.rglob('*') if p.is_file() and 'source' not in p.relative_to(kit).parts
               and p.name not in ['assets-manifest.json', 'SHA256SUMS.txt']
               and (args.include_review or p.relative_to(kit).as_posix() in listing_files))
items = [{'file': str(p.relative_to(kit)), 'bytes': p.stat().st_size,
          'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
(kit / 'assets-manifest.json').write_text(json.dumps({'date': '2026-10-15', 'files': items}, indent=2) + '\n')
(kit / 'SHA256SUMS.txt').write_text(''.join(f"{item['sha256']}  {item['file']}\n" for item in items))
archive = store / ('switchbot-store-review-kit.zip' if args.include_review else 'switchbot-store-listing-kit.zip')
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as output:
    for p in [*files, kit / 'assets-manifest.json', kit / 'SHA256SUMS.txt']:
        output.write(p, str(p.relative_to(kit)))
with zipfile.ZipFile(archive) as output:
    assert output.testzip() is None
print(f'Validated {len(expected)} store images. Packaged {len(files) + 2} files: {archive}')
print('Local store-submission use only. Do not upload this ZIP to GitHub releases.')
