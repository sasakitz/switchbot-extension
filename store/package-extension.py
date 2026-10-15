#!/usr/bin/env python3
"""Package runtime files for Chrome Web Store and AMO; exclude listing assets and tools."""
import argparse
import json
import re
import zipfile
from pathlib import Path


def main():
    root = Path(__file__).resolve().parent.parent
    manifest = json.loads((root / 'manifest.json').read_text())
    version = manifest['version']
    if not re.fullmatch(r'\d+(?:\.\d+){0,3}', version):
        raise SystemExit(f'Invalid manifest version: {version}')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=root / 'store' / f'switchbot-controller-v{version}.zip')
    args = parser.parse_args()
    files = [root / 'manifest.json']
    for directory in ['popup', 'options', 'utils']:
        files.extend(sorted(p for p in (root / directory).rglob('*')
                            if p.is_file() and p.suffix in {'.js', '.html', '.css'}))
    files.extend(root / 'icons' / f'icon{size}.png' for size in [16, 32, 48, 128])
    files.append(root / 'icons' / 'icon.svg')
    # Fail if the manifest starts requiring files outside the current runtime set.
    packaged = {p.relative_to(root).as_posix() for p in files}
    required = [manifest['action']['default_popup'], manifest['options_ui']['page']]
    required.extend(manifest.get('icons', {}).values())
    required.extend(manifest['action'].get('default_icon', {}).values())
    background = manifest.get('background', {})
    required.extend(background.get('scripts', []))
    if background.get('service_worker'):
        required.append(background['service_worker'])
    for script in manifest.get('content_scripts', []):
        required.extend(script.get('js', []))
        required.extend(script.get('css', []))
    for name in required:
        if name not in packaged:
            raise SystemExit(f'Update the runtime file list before packaging: {name}')
    for path in files:
        if not path.is_file() or path.is_symlink():
            raise SystemExit(f'Missing file or unsupported symlink: {path}')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(args.output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for path in files:
            archive.write(path, path.relative_to(root).as_posix())
    with zipfile.ZipFile(args.output) as archive:
        if archive.testzip() is not None:
            raise SystemExit('ZIP validation failed')
    print(f'Packaged version {version}: {len(files)} files -> {args.output}')
    print('Verify that this version exceeds the published version in the Developer Dashboard.')


if __name__ == '__main__':
    main()
