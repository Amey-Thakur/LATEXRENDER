#!/usr/bin/env python3
"""Rebuild the CSS and JavaScript bundles the application actually loads.

`index.html` loads `css/dist/bundle.css` and `js/dist/bundle.js`. Those are
concatenations of the files under `css/` and `js/`, and until this script
existed they were assembled by hand. That is a trap: editing a source file
changed nothing that ran, and nothing detected the drift.

    python scripts/build_bundles.py           # rebuild both bundles
    python scripts/build_bundles.py --check   # fail if either is out of date

The order below is load-bearing. These are plain scripts sharing globals, not
modules, so a file must come after everything it depends on at load time.

Standard library only.
"""

from __future__ import annotations

import argparse
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "Source Code"

# Dependency order, not alphabetical. utils first, app last.
JS_ORDER = [
    "js/utils.js",
    "js/toast.js",
    "js/modal.js",
    "js/settings.js",
    "js/share.js",
    "js/history.js",
    "js/tooltips.js",
    "js/toolbar.js",
    "js/capture.js",
    "js/formats/raster.js",
    "js/formats/document.js",
    "js/formats/vector.js",
    "js/formats/icon.js",
    "js/formats/metafile.js",
    "js/exporter.js",
    "js/layout.js",
    "js/editor.js",
    "js/renderer.js",
    "js/app.js",
]

# main.css first so its custom properties exist for everything after it.
CSS_ORDER = [
    "css/main.css",
    "css/animations.css",
    "css/controls.css",
    "css/editor.css",
    "css/history.css",
    "css/modal.css",
    "css/preview.css",
    "css/toast.css",
    "css/layout.css",
    "css/toolbar.css",
    "css/tooltips.css",
]

TARGETS = [
    ("js/dist/bundle.js", JS_ORDER),
    ("css/dist/bundle.css", CSS_ORDER),
]


def compose(parts: list[str]) -> str:
    chunks = []
    for rel in parts:
        path = SRC / rel
        if not path.exists():
            raise SystemExit(f"missing source file: {rel}")
        chunks.append(path.read_text(encoding="utf-8").strip())
    return "\n\n".join(chunks) + "\n"


SW = SRC / "sw.js"
BUILD_ID_LINE = re.compile(r"^const BUILD_ID = '([0-9a-f]+)';$", re.M)


def build_id(bundles: dict[str, str]) -> str:
    """A short hash of the built output and the page that loads it.

    The service worker names its caches after this. Deriving it means the cache
    name changes exactly when the application changes, so a returning visitor
    gets the new release and the old caches are dropped. Maintaining a version
    by hand is the failure this replaces: the previous worker used a fixed
    name, so its caches were never invalidated and updates never shipped.

    Everything is normalised to LF before hashing. Reading raw bytes made the
    identifier depend on the checkout's line endings, so a Windows working copy
    and a Linux CI runner disagreed about the same commit.
    """
    h = hashlib.sha256()
    for name in sorted(bundles):
        h.update(name.encode())
        h.update(bundles[name].replace("\r\n", "\n").encode())
    index = (SRC / "index.html").read_text(encoding="utf-8").replace("\r\n", "\n")
    h.update(index.encode())
    return h.hexdigest()[:8]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--check", action="store_true",
                    help="report drift and change nothing")
    args = ap.parse_args()

    stale = []
    built_map = {}
    for out_rel, parts in TARGETS:
        built = compose(parts)
        built_map[out_rel] = built
        out = SRC / out_rel
        current = out.read_text(encoding="utf-8") if out.exists() else None

        if current == built:
            print(f"  up to date  {out_rel}  ({len(built):,} bytes, {len(parts)} files)")
            continue

        stale.append(out_rel)
        if args.check:
            print(f"  STALE       {out_rel}")
        else:
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_text(built, encoding="utf-8")
            print(f"  rebuilt     {out_rel}  ({len(built):,} bytes, {len(parts)} files)")

    # Stamp the service worker's cache version.
    want = build_id(built_map)
    sw_text = SW.read_text(encoding="utf-8")
    match = BUILD_ID_LINE.search(sw_text)
    if not match:
        print("  WARNING     sw.js has no BUILD_ID line to stamp")
    elif match.group(1) == want:
        print(f"  up to date  sw.js BUILD_ID {want}")
    else:
        stale.append("sw.js BUILD_ID")
        if args.check:
            print(f"  STALE       sw.js BUILD_ID is {match.group(1)}, should be {want}")
        else:
            SW.write_text(BUILD_ID_LINE.sub(f"const BUILD_ID = '{want}';", sw_text, count=1),
                          encoding="utf-8")
            print(f"  stamped     sw.js BUILD_ID {match.group(1)} -> {want}")

    if args.check and stale:
        print(f"\n{len(stale)} item(s) out of date.")
        print("Run: python scripts/build_bundles.py")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
