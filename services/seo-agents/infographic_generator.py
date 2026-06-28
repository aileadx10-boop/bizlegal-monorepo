#!/usr/bin/env python3
"""
infographic_generator.py — render 1200x630 citation-friendly infographics.

Designed to be cited by AI engines (Perplexity, ChatGPT search, Claude, Grok)
and shared on Reddit / LinkedIn / X / Substack.

Two modes:
  --type=og       1200x630 social card (default for blog hero)
  --type=stat     1080x1350 stat card (Pinterest/IG vertical)
  --type=compare  1200x630 comparison card (best for pillar 8)

Each card has:
  - Headline  (40-60 char, answer-first)
  - 3-5 key data points / bullets
  - Source attribution (date + "BizLegal AI" branding)
  - Last-updated date
  - Hex color palette optimized for accessibility (WCAG AA)

Uses Pillow (PIL) only — stdlib. No paid APIs.
Rendered images go to /opt/bizlegal/curator/services/seo-agents/infographics/

Usage:
  python3 infographic_generator.py --title "SOC 2 vs ISO 27001" --bullets "ISO: 93 controls" "SOC 2: 5 Trust Categories" --type=compare
  python3 infographic_generator.py --from-mdx /path/to/post.mdx --type=og
  python3 infographic_generator.py --batch --date 2026-07-15   # render today's blog post hero
"""
from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import pathlib
import re
import sys
import textwrap

# Suppress Pillow's DecompressionBombWarning for large canvases
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ---------- CONFIG ----------

COLORS = {
    "primary": "#0B2545",    # deep navy (BizLegal brand)
    "accent":  "#8DA9C4",    # steel blue
    "highlight":"#F4A261",  # warm orange (CTA)
    "text":    "#FFFFFF",
    "muted":   "#A8B5C2",
    "success": "#2A9D8F",
    "warn":    "#E76F51",
}

FONTS_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf",
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "C:/Windows/Fonts/arialbd.ttf",
    "C:/Windows/Fonts/arial.ttf",
]


def get_font(size: int, bold: bool = True):
    """Find an available bold or regular font. Returns a Pillow font."""
    for path in FONTS_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


# ---------- CORE RENDERERS ----------

def render_og(title: str, subtitle: str, bullets: list[str], date: str = "",
              source: str = "bizlegal-ai.com", out_path: str = "") -> str:
    """Render a 1200x630 OG/social card."""
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), COLORS["primary"])
    draw = ImageDraw.Draw(img)

    # Accent stripe top
    draw.rectangle([0, 0, W, 16], fill=COLORS["highlight"])
    # Bottom bar
    draw.rectangle([0, H-50, W, H], fill="#000814")

    # Title (auto-shrink to fit)
    title_font_size = 64
    title_font = get_font(title_font_size, bold=True)
    while draw.textlength(title, font=title_font) > W - 80 and title_font_size > 32:
        title_font_size -= 4
        title_font = get_font(title_font_size, bold=True)

    # Word-wrap title to 3 lines
    wrapped = textwrap.wrap(title, width=28)
    if len(wrapped) > 4:
        wrapped = wrapped[:3] + [wrapped[3] + "..."]
    y = 100
    for line in wrapped[:4]:
        bbox = draw.textbbox((0, 0), line, font=title_font)
        tw = bbox[2] - bbox[0]
        draw.text(((W - tw) // 2, y), line, font=title_font, fill=COLORS["text"])
        y += title_font_size + 8

    # Subtitle (italic, smaller)
    if subtitle:
        sub_font = get_font(28, bold=False)
        wrapped_sub = textwrap.wrap(subtitle, width=60)
        y += 20
        for line in wrapped_sub[:2]:
            bbox = draw.textbbox((0, 0), line, font=sub_font)
            tw = bbox[2] - bbox[0]
            draw.text(((W - tw) // 2, y), line, font=sub_font, fill=COLORS["accent"])
            y += 36

    # Bullets (3-5 data points)
    if bullets:
        y += 30
        bullet_font = get_font(24, bold=False)
        for b in bullets[:5]:
            line = f"• {b}"
            wrapped = textwrap.wrap(line, width=55)
            for ln in wrapped[:2]:
                bbox = draw.textbbox((0, 0), ln, font=bullet_font)
                tw = bbox[2] - bbox[0]
                draw.text(((W - tw) // 2, y), ln, font=bullet_font, fill=COLORS["muted"])
                y += 32
            y += 4

    # Footer: source + date
    footer_font = get_font(20, bold=False)
    footer = f"{source}"
    if date:
        footer += f"  ·  {date}"
    bbox = draw.textbbox((0, 0), footer, font=footer_font)
    draw.text((40, H - 35), footer, font=footer_font, fill=COLORS["muted"])

    if not out_path:
        out_path = f"/tmp/infographic-og-{_dt.datetime.now().strftime('%Y%m%d-%H%M%S')}.png"
    pathlib.Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    return out_path


def render_compare(title: str, left: dict, right: dict, date: str = "",
                   source: str = "bizlegal-ai.com", out_path: str = "") -> str:
    """Render a 1200x630 comparison card (best for pillar 8 GEO citations)."""
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), COLORS["primary"])
    draw = ImageDraw.Draw(img)

    # Header bar
    draw.rectangle([0, 0, W, 12], fill=COLORS["highlight"])

    # Title
    title_font = get_font(52, bold=True)
    wrapped = textwrap.wrap(title, width=32)
    if len(wrapped) > 2:
        wrapped = wrapped[:1] + [wrapped[1] + "..."]
    y = 40
    for line in wrapped[:2]:
        bbox = draw.textbbox((0, 0), line, font=title_font)
        tw = bbox[2] - bbox[0]
        draw.text(((W - tw) // 2, y), line, font=title_font, fill=COLORS["text"])
        y += 64

    # Two columns
    col_w = (W - 80) // 2
    col_y = 160
    col_h = H - col_y - 80
    # Left column background
    draw.rounded_rectangle([40, col_y, 40 + col_w, col_y + col_h], radius=16, fill="#14253D")
    # Right column background
    draw.rounded_rectangle([60 + col_w, col_y, 60 + 2*col_w, col_y + col_h], radius=16, fill="#14253D")

    # Column headers
    head_font = get_font(32, bold=True)
    for i, side in enumerate([left, right]):
        cx = 60 + i * (col_w + 20) + col_w // 2
        name = side.get("name", "")
        bbox = draw.textbbox((0, 0), name, font=head_font)
        tw = bbox[2] - bbox[0]
        draw.text((cx - tw // 2, col_y + 16), name, font=head_font,
                  fill=COLORS["highlight"] if i == 0 else COLORS["success"])

    # Column rows
    row_font = get_font(20, bold=False)
    row_y = col_y + 70
    max_rows = min(len(left.get("rows", [])), len(right.get("rows", [])))
    for i in range(max_rows):
        for j, side in enumerate([left, right]):
            row = side["rows"][i] if i < len(side.get("rows", [])) else ""
            wrapped_row = textwrap.wrap(row, width=22)
            cx = 60 + j * (col_w + 20) + col_w // 2
            for ln in wrapped_row[:2]:
                bbox = draw.textbbox((0, 0), ln, font=row_font)
                tw = bbox[2] - bbox[0]
                draw.text((cx - tw // 2, row_y), ln, font=row_font, fill=COLORS["text"])
                row_y_j = row_y
            row_y = row_y_j  # keep alignment
        row_y += 50

    # Footer
    footer_font = get_font(20, bold=False)
    footer = f"{source}"
    if date:
        footer += f"  ·  {date}"
    draw.text((40, H - 35), footer, font=footer_font, fill=COLORS["muted"])

    if not out_path:
        out_path = f"/tmp/infographic-compare-{_dt.datetime.now().strftime('%Y%m%d-%H%M%S')}.png"
    pathlib.Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    return out_path


def render_stat(title: str, big_number: str, unit: str, caption: str,
                date: str = "", source: str = "bizlegal-ai.com", out_path: str = "") -> str:
    """Render a 1080x1350 stat card for Pinterest/IG vertical."""
    W, H = 1080, 1350
    img = Image.new("RGB", (W, H), COLORS["primary"])
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, W, 20], fill=COLORS["highlight"])

    # Title (top)
    title_font = get_font(56, bold=True)
    wrapped = textwrap.wrap(title, width=22)
    y = 80
    for line in wrapped[:3]:
        bbox = draw.textbbox((0, 0), line, font=title_font)
        tw = bbox[2] - bbox[0]
        draw.text(((W - tw) // 2, y), line, font=title_font, fill=COLORS["text"])
        y += 72

    # Big number (center)
    y += 60
    num_font = get_font(180, bold=True)
    bbox = draw.textbbox((0, 0), big_number, font=num_font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text(((W - tw) // 2, y), big_number, font=num_font, fill=COLORS["highlight"])
    y += th + 20

    # Unit
    if unit:
        unit_font = get_font(40, bold=False)
        bbox = draw.textbbox((0, 0), unit, font=unit_font)
        tw = bbox[2] - bbox[0]
        draw.text(((W - tw) // 2, y), unit, font=unit_font, fill=COLORS["accent"])
        y += 60

    # Caption (bottom)
    if caption:
        cap_font = get_font(28, bold=False)
        wrapped = textwrap.wrap(caption, width=38)
        for line in wrapped[:4]:
            bbox = draw.textbbox((0, 0), line, font=cap_font)
            tw = bbox[2] - bbox[0]
            draw.text(((W - tw) // 2, y), line, font=cap_font, fill=COLORS["text"])
            y += 40

    # Footer
    footer_font = get_font(22, bold=False)
    footer = f"{source}"
    if date:
        footer += f"  ·  {date}"
    bbox = draw.textbbox((0, 0), footer, font=footer_font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, H - 60), footer, font=footer_font, fill=COLORS["muted"])

    if not out_path:
        out_path = f"/tmp/infographic-stat-{_dt.datetime.now().strftime('%Y%m%d-%H%M%S')}.png"
    pathlib.Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    return out_path


def extract_bullets_from_mdx(mdx_path: str, max_bullets: int = 5) -> tuple[str, str, list[str]]:
    """Pull title + first bullets from a .mdx file."""
    text = pathlib.Path(mdx_path).read_text(encoding="utf-8")
    # Strip frontmatter
    if text.startswith("---"):
        text = re.sub(r"^---\n.*?\n---\n", "", text, count=1, flags=re.S)
    # Title
    title_m = re.search(r"^#\s+(.+)$", text, re.M)
    title = title_m.group(1).strip() if title_m else pathlib.Path(mdx_path).stem.replace("-", " ").title()
    # Subtitle = first paragraph
    sub_m = re.search(r"\n\n([^\n#].{40,200}?)\n\n", text, re.S)
    subtitle = sub_m.group(1).strip() if sub_m else ""
    # Bullets = ## or ### + next paragraph
    bullets = []
    for m in re.finditer(r"^##\s+(.+)$\n+([^\n#].{20,200})", text, re.M):
        bullets.append(f"{m.group(1).strip()}: {m.group(2).strip()[:80]}")
        if len(bullets) >= max_bullets:
            break
    return title, subtitle, bullets


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--type", choices=["og", "stat", "compare"], default="og")
    ap.add_argument("--title", help="headline")
    ap.add_argument("--subtitle", default="")
    ap.add_argument("--bullets", nargs="*", default=[])
    ap.add_argument("--from-mdx", help="render infographic from a .mdx post")
    ap.add_argument("--outdir", default="/opt/bizlegal/curator/services/seo-agents/infographics")
    ap.add_argument("--date", default=_dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d"))
    # compare-mode options
    ap.add_argument("--left-name", default="Option A")
    ap.add_argument("--right-name", default="Option B")
    ap.add_argument("--left-rows", nargs="*", default=[])
    ap.add_argument("--right-rows", nargs="*", default=[])
    # stat-mode options
    ap.add_argument("--big-number", default="")
    ap.add_argument("--unit", default="")
    ap.add_argument("--caption", default="")
    args = ap.parse_args()

    pathlib.Path(args.outdir).mkdir(parents=True, exist_ok=True)

    if args.from_mdx:
        title, subtitle, bullets = extract_bullets_from_mdx(args.from_mdx)
    else:
        title = args.title or "BizLegal AI"
        subtitle = args.subtitle
        bullets = args.bullets

    if args.type == "og":
        out = render_og(title, subtitle, bullets, date=args.date,
                        out_path=f"{args.outdir}/og-{_dt.datetime.now().strftime('%Y%m%d-%H%M%S')}.png")
    elif args.type == "compare":
        out = render_compare(title,
                             {"name": args.left_name, "rows": args.left_rows or ["N/A"]},
                             {"name": args.right_name, "rows": args.right_rows or ["N/A"]},
                             date=args.date,
                             out_path=f"{args.outdir}/compare-{_dt.datetime.now().strftime('%Y%m%d-%H%M%S')}.png")
    elif args.type == "stat":
        out = render_stat(title, args.big_number or "10K", args.unit, args.caption,
                          date=args.date,
                          out_path=f"{args.outdir}/stat-{_dt.datetime.now().strftime('%Y%m%d-%H%M%S')}.png")
    print(out)


if __name__ == "__main__":
    main()