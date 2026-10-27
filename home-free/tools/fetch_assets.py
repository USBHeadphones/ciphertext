#!/usr/bin/env python3
"""Download the CC0 Poly Haven models and texture sets listed in assets.json into ../assets.

Models land in assets/models/<id>/<id>.gltf with their .bin and textures beside them.
Texture sets land in assets/tex/<id>_{diff,nor,arm}.jpg (colour, OpenGL normal, AO/rough/metal).
Re-running skips files that are already present.
"""
import hashlib
import json
import os
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'assets')
API = 'https://api.polyhaven.com/files/'
SHRUNK = os.path.join(OUT, '.shrunk.json')


def shrunk():
    return set(json.load(open(SHRUNK))) if os.path.exists(SHRUNK) else set()


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'home-free-asset-fetch/1.0'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def save(url, path, size=None, md5=None):
    """Download url to path unless a verified copy is already there; retries on short reads."""
    def ok(p):
        if not os.path.exists(p) or os.path.getsize(p) == 0:
            return False
        if os.path.relpath(p, OUT) in shrunk():
            return True
        if size is not None and os.path.getsize(p) != size:
            return False
        return md5 is None or hashlib.md5(open(p, 'rb').read()).hexdigest() == md5
    if ok(path):
        return 0
    os.makedirs(os.path.dirname(path), exist_ok=True)
    for attempt in range(4):
        data = get(url)
        with open(path, 'wb') as f:
            f.write(data)
        if ok(path):
            return len(data)
        print('  retrying', os.path.basename(path), file=sys.stderr)
    raise RuntimeError('could not download a complete copy of ' + url)


def main():
    manifest = json.load(open(os.path.join(HERE, 'assets.json')))
    res = manifest['resolution']
    total = 0
    for mid in manifest['models']:
        files = json.loads(get(API + mid))
        g = files['gltf'][res]['gltf']
        base = os.path.join(OUT, 'models', mid)
        total += save(g['url'], os.path.join(base, mid + '.gltf'), g.get('size'), g.get('md5'))
        for rel, inc in g['include'].items():
            total += save(inc['url'], os.path.join(base, rel), inc.get('size'), inc.get('md5'))
        print('model', mid, file=sys.stderr)
    # scanned trees ship film-resolution geometry; keep only their bark and twig textures
    for mid in manifest.get('texture_only_models', []):
        files = json.loads(get(API + mid))
        for rel, inc in files['gltf'][res]['gltf']['include'].items():
            if rel.startswith('textures/'):
                total += save(inc['url'], os.path.join(OUT, 'models', mid, rel), inc.get('size'), inc.get('md5'))
        print('textures of', mid, file=sys.stderr)
    for tid in manifest['textures']:
        files = json.loads(get(API + tid))
        for key, short in (('Diffuse', 'diff'), ('nor_gl', 'nor'), ('arm', 'arm')):
            if key not in files:
                print('  missing', tid, key, file=sys.stderr)
                continue
            fj = files[key][res]['jpg']
            total += save(fj['url'], os.path.join(OUT, 'tex', f'{tid}_{short}.jpg'), fj.get('size'), fj.get('md5'))
        print('texture', tid, file=sys.stderr)
    shrink_small_props(manifest)
    with open(os.path.join(OUT, 'manifest.json'), 'w') as f:
        json.dump({'models': manifest['models'], 'textures': manifest['textures']}, f)
    print(f'downloaded {total / 1e6:.1f} MB', file=sys.stderr)


def shrink_small_props(manifest):
    """Hand-sized props never fill more than a few hundred pixels on screen; halve their textures."""
    try:
        from PIL import Image
    except ImportError:
        print('Pillow not installed; leaving prop textures at full size', file=sys.stderr)
        return
    info = json.loads(get('https://api.polyhaven.com/assets?t=models'))
    px = manifest['small_props_texture_px']
    done = shrunk()
    for mid in manifest['models']:
        if max(info[mid]['dimensions']) >= manifest['small_props_max_mm']:
            continue
        tdir = os.path.join(OUT, 'models', mid, 'textures')
        for name in os.listdir(tdir):
            p = os.path.join(tdir, name)
            im = Image.open(p)
            if im.width > px:
                im.resize((px, px), Image.LANCZOS).save(p, quality=88)
                done.add(os.path.relpath(p, OUT))
    with open(SHRUNK, 'w') as f:
        json.dump(sorted(done), f)


if __name__ == '__main__':
    main()
