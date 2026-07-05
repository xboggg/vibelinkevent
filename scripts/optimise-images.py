#!/usr/bin/env python3
"""
Optimise hero images before shipping.

Any image in src/assets/hero-*.png|jpg|jpeg|webp or src/assets/service-*.png|jpg|jpeg|webp
that's larger than TARGET_MAX_KB gets:
  - resized to at most MAX_WIDTH px wide (aspect preserved)
  - re-encoded as JPG at QUALITY, progressive, optimised
  - saved with .jpg extension (if source was .png, the .png is removed
    and every "@/assets/<name>.png" import is auto-flipped to .jpg
    across src/**)

Run:
  python3 scripts/optimise-images.py

Requires Pillow: pip install Pillow  (already installed on this box).
"""
import os
import re
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow not installed. Run:  pip install Pillow")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "src" / "assets"
SRC = ROOT / "src"

MAX_WIDTH = 1600           # px — matches the widest hero the pages use
QUALITY = 85               # JPG quality — visual/size sweet spot
TARGET_MAX_KB = 500        # skip files already at or below this
PATTERNS = ("hero-", "service-")
EXTS = (".png", ".jpg", ".jpeg", ".webp")


def flip_png_imports(old_png_name: str, new_jpg_name: str) -> int:
    """Update every `@/assets/<old>` import across src/**/*.tsx|ts to point
    at the new .jpg. Returns the number of files patched."""
    patched = 0
    old_ref = f'@/assets/{old_png_name}'
    new_ref = f'@/assets/{new_jpg_name}'
    for path in SRC.rglob("*"):
        if not path.is_file() or path.suffix not in (".tsx", ".ts", ".jsx", ".js"):
            continue
        text = path.read_text(encoding="utf-8")
        if old_ref not in text:
            continue
        path.write_text(text.replace(old_ref, new_ref), encoding="utf-8")
        patched += 1
        print(f"    patched import in {path.relative_to(ROOT)}")
    return patched


def optimise(src_path: Path) -> tuple[int, int]:
    orig_size = src_path.stat().st_size

    if orig_size < TARGET_MAX_KB * 1024 and src_path.suffix.lower() in (".jpg", ".jpeg"):
        return orig_size, orig_size  # already lean

    img = Image.open(src_path)
    orig_w, orig_h = img.size

    # Flatten RGBA/P onto white for JPG output
    if img.mode in ("RGBA", "P"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        bg.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")

    # Resize width down (never up)
    if orig_w > MAX_WIDTH:
        new_h = int(orig_h * MAX_WIDTH / orig_w)
        img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)

    # Always save as .jpg
    out_name = src_path.stem + ".jpg"
    out_path = src_path.parent / out_name
    img.save(out_path, "JPEG", quality=QUALITY, optimize=True, progressive=True)

    if src_path.suffix.lower() != ".jpg" and out_path != src_path:
        src_path.unlink()
        patched = flip_png_imports(src_path.name, out_name)
        if patched:
            print(f"    flipped {patched} import(s) from {src_path.name} to {out_name}")

    return orig_size, out_path.stat().st_size


def main() -> None:
    if not ASSETS.exists():
        print(f"assets folder not found: {ASSETS}")
        sys.exit(1)

    candidates = [
        p for p in ASSETS.iterdir()
        if p.is_file()
        and p.suffix.lower() in EXTS
        and any(p.name.startswith(prefix) for prefix in PATTERNS)
    ]
    if not candidates:
        print("no hero-* / service-* images to optimise")
        return

    print(f"scanning {len(candidates)} image(s) in {ASSETS.relative_to(ROOT)}\n")
    total_before = total_after = 0

    for path in sorted(candidates):
        before, after = optimise(path)
        total_before += before
        total_after += after
        delta = (1 - after / before) * 100 if before else 0
        marker = "OK " if after < before else "-- "
        print(f"  {marker} {path.stem+'.jpg':30s} {before//1024:5d} KB -> {after//1024:5d} KB  ({delta:+.0f}%)")

    total_delta = (1 - total_after / total_before) * 100 if total_before else 0
    print(f"\ntotal: {total_before//1024} KB -> {total_after//1024} KB  ({total_delta:+.0f}%)")


if __name__ == "__main__":
    main()
