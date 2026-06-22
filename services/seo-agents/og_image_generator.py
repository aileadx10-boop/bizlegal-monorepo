#!/usr/bin/env python3
"""
og_image_generator.py
=====================
Build #2 of 10 — $10K MRR SEO Plan.

Reads .mdx blog posts (with YAML front matter) and generates 1200x630
OG images for each. Pillow is the only external dep.

Design language:
  - Dark navy background (#0B1F3A)
  - Gold accent (#D4AF37)
  - Pillar badge in the top-right corner
  - Title in 80px bold sans-serif (DejaVu fallback chain)
  - Tagline in 32px
  - Decorative geometric: gold circle, navy line grid

Usage:
  python3 og_image_generator.py --input DIR --output DIR
  python3 og_image_generator.py --once FILE --output DIR
  python3 og_image_generator.py --dry-run --input DIR

The script is idempotent: skips files where the PNG mtime is newer
than the MDX mtime.
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import pathlib
import re
import sys
from typing import Optional

try:
    from PIL import Image, ImageDraw, ImageFont  # type: ignore
except ImportError as e:
    print(f"  [fatal] Pillow is required: {e}", file=sys.stderr)
    print(f"          install with: pip install Pillow", file=sys.stderr)
    sys.exit(2)


# ---------------------------------------------------------------------------
# Design constants
# ---------------------------------------------------------------------------

W, H = 1200, 630
BG = (11, 31, 58)          # #0B1F3A
GOLD = (212, 175, 55)      # #D4AF37
WHITE = (245, 247, 250)
MUTED = (140, 158, 184)
PILLAR_COLORS = {
    "BOI": (212, 175, 55),
    "VARA": (94, 192, 196),
    "SOC2": (140, 199, 132),
    "GDPR": (191, 144, 226),
    "Crypto": (242, 169, 99),
    "PSP": (229, 137, 137),
    "Singapore": (137, 196, 244),
    "India": (255, 196, 110),
}


# ---------------------------------------------------------------------------
# Font fallback chain
# ---------------------------------------------------------------------------

_FONT_PATHS_BOLD = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "C:/Windows/Fonts/arialbd.ttf",
    "C:/Windows/Fonts/calibrib.ttf",
    "/c/Windows/Fonts/arialbd.ttf",
]
_FONT_PATHS_REG = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "C:/Windows/Fonts/arial.ttf",
    "/c/Windows/Fonts/arial.ttf",
]


def _load_font(size: int, bold: bool = True) -> ImageFont.ImageFont:
    paths = _FONT_PATHS_BOLD if bold else _FONT_PATHS_REG
    for p in paths:
        if pathlib.Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


# ---------------------------------------------------------------------------
# Front matter parsing (minimal YAML, no PyYAML)
# ---------------------------------------------------------------------------

_FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.DOTALL)


def parse_mdx(path: pathlib.Path) -> dict:
    """Parse a minimal subset of YAML front matter. Returns {slug, title, pillar, ...}."""
    text = path.read_text(encoding="utf-8")
    m = _FRONTMATTER_RE.match(text)
    if not m:
        return {"_raw": text, "_no_front_matter": True}
    fm, body = m.group(1), m.group(2)
    out: dict = {"_body": body}
    for line in fm.splitlines():
        if ":" not in line:
            continue
        key, _, val = line.partition(":")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        out[key] = val
    if "slug" not in out:
        out["slug"] = path.stem
    return out


# ---------------------------------------------------------------------------
# Drawing
# ---------------------------------------------------------------------------

def _wrap_text(text: str, font: ImageFont.ImageFont, max_w: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur: list[str] = []
    for w in words:
        candidate = " ".join(cur + [w])
        bbox = font.getbbox(candidate)
        if bbox[2] - bbox[0] <= max_w:
            cur.append(w)
        else:
            if cur:
                lines.append(" ".join(cur))
            cur = [w]
    if cur:
        lines.append(" ".join(cur))
    return lines


def _draw_decoration(draw: ImageDraw.ImageDraw) -> None:
    """Gold accent: a circle in the top-left, a grid of thin lines bottom-right."""
    # Top-left circle (gold ring)
    draw.ellipse([(40, 40), (40 + 100, 40 + 100)], outline=GOLD, width=4)
    # Top-left dot inside
    draw.ellipse([(80, 80), (100, 100)], fill=GOLD)
    # Bottom-right grid of thin gold lines
    for i in range(6):
        y = H - 60 + i * 6
        draw.line([(W - 200, y), (W - 40, y - 30)], fill=(40, 60, 100), width=1)
    # Diagonal gold slash
    draw.line([(W - 220, 80), (W - 60, 80)], fill=GOLD, width=2)


def _draw_pillar_badge(draw: ImageDraw.ImageDraw, pillar: str, font_sm: ImageFont.ImageFont) -> None:
    color = PILLAR_COLORS.get(pillar, GOLD)
    label = pillar.upper()
    bbox = draw.textbbox((0, 0), label, font=font_sm)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = 14
    box_w, box_h = tw + pad * 2, th + pad
    x0, y0 = W - box_w - 40, 40
    draw.rounded_rectangle([(x0, y0), (x0 + box_w, y0 + box_h)],
                           radius=box_h // 2, fill=color)
    draw.text((x0 + pad, y0 + (box_h - th) // 2 - 2), label,
              font=font_sm, fill=BG)


def _draw_text_block(draw: ImageDraw.ImageDraw, title: str, tagline: str) -> None:
    title_font = _load_font(72, bold=True)
    tag_font = _load_font(28, bold=False)
    brand_font = _load_font(22, bold=True)

    # Brand top-left
    draw.text((180, 60), "BIZLEGAL.AI", font=brand_font, fill=GOLD)

    # Title — wrapped, centered vertically in the bottom 2/3
    lines = _wrap_text(title, title_font, W - 160)[:3]  # cap at 3 lines
    line_h = 80
    total_h = line_h * len(lines)
    y = (H - total_h) // 2 + 20
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=title_font)
        tw = bbox[2] - bbox[0]
        x = (W - tw) // 2
        draw.text((x, y), line, font=title_font, fill=WHITE)
        y += line_h

    # Tagline at the bottom
    if tagline:
        tbbox = draw.textbbox((0, 0), tagline, font=tag_font)
        tw = tbbox[2] - tbbox[0]
        draw.text(((W - tw) // 2, H - 90), tagline, font=tag_font, fill=MUTED)


def render_image(title: str, pillar: str, tagline: str = "") -> Image.Image:
    img = Image.new("RGB", (W, H), color=BG)
    draw = ImageDraw.Draw(img)
    _draw_decoration(draw)
    _draw_pillar_badge(draw, pillar, _load_font(22, bold=True))
    _draw_text_block(draw, title, tagline or "Regulatory intelligence in 30 seconds.")
    return img


# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------

def _scan_mdx(input_dir: pathlib.Path) -> list[pathlib.Path]:
    if not input_dir.exists():
        return []
    return sorted(input_dir.rglob("*.mdx"))


def process_file(mdx_path: pathlib.Path, output_dir: pathlib.Path, *, force: bool = False) -> Optional[pathlib.Path]:
    meta = parse_mdx(mdx_path)
    if meta.get("_no_front_matter"):
        return None
    slug = meta.get("slug") or mdx_path.stem
    pillar = meta.get("pillar", "Blog")
    title = meta.get("title", slug.replace("-", " ").title())
    tagline = meta.get("tagline", "Regulatory intelligence in 30 seconds.")

    out_path = output_dir / f"{slug}.png"
    if out_path.exists() and not force:
        if out_path.stat().st_mtime >= mdx_path.stat().st_mtime:
            return None  # up-to-date

    img = render_image(title, pillar, tagline)
    output_dir.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    return out_path


def run(input_dir: pathlib.Path, output_dir: pathlib.Path, *, force: bool, dry_run: bool) -> int:
    files = _scan_mdx(input_dir)
    if not files:
        print(f"  [warn] no .mdx files found in {input_dir}", file=sys.stderr)
        return 1
    print(f"  scanning {len(files)} .mdx files in {input_dir}")
    manifest = []
    for mdx in files:
        meta = parse_mdx(mdx)
        if meta.get("_no_front_matter"):
            print(f"  [skip] {mdx.name} (no front matter)")
            continue
        slug = meta.get("slug") or mdx.stem
        out = output_dir / f"{slug}.png"
        if dry_run:
            print(f"  [dry-run] {mdx.name} -> {out.name}")
            manifest.append({"mdx": str(mdx), "png": str(out), "action": "would-render"})
            continue
        try:
            result = process_file(mdx, output_dir, force=force)
            if result:
                size = result.stat().st_size
                print(f"  [ok]   {mdx.name} -> {result.name}  ({size:,} bytes)")
                manifest.append({"mdx": str(mdx), "png": str(result), "bytes": size, "action": "rendered"})
            else:
                print(f"  [skip] {mdx.name} (up-to-date)")
                manifest.append({"mdx": str(mdx), "png": str(out), "action": "skipped"})
        except Exception as e:
            print(f"  [err]  {mdx.name}: {e}", file=sys.stderr)
            manifest.append({"mdx": str(mdx), "error": str(e), "action": "failed"})

    rendered = sum(1 for m in manifest if m.get("action") == "rendered")
    print(f"\n  rendered {rendered} of {len(manifest)}")
    if dry_run:
        print("  (dry-run — no files written)")
    return 0 if rendered > 0 or not files else 1


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--input", required=True,
                    help="Directory of .mdx files (recursive)")
    ap.add_argument("--output", required=True,
                    help="Directory to write PNGs to")
    ap.add_argument("--dry-run", action="store_true",
                    help="Show what would be done, do not write")
    ap.add_argument("--once", help="Process a single .mdx file")
    ap.add_argument("--force", action="store_true",
                    help="Re-render even if PNG is newer than MDX")
    args = ap.parse_args()

    if args.once:
        out_dir = pathlib.Path(args.output)
        out_dir.mkdir(parents=True, exist_ok=True)
        mdx = pathlib.Path(args.once)
        if not mdx.exists():
            print(f"  [fatal] {mdx} not found", file=sys.stderr)
            return 1
        result = process_file(mdx, out_dir, force=args.force)
        return 0 if result else 1

    return run(pathlib.Path(args.input), pathlib.Path(args.output),
               force=args.force, dry_run=args.dry_run)


if __name__ == "__main__":
    sys.exit(main())
