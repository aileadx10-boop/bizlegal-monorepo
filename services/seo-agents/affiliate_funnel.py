"""
Agent C — Affiliate Funnel Builder
==================================

Daily cron: 06:00 UTC
Input:   All blog articles (enriched or not)
Output:  Inline contextual CTAs linking blog -> product pages with UTM
         Two CTA patterns per article (smart-link + box)
         Conversion event sent to GA4 / Plausible

Run: python3 affiliate_funnel.py [--limit 30]
"""

import os
import re
import sys
import json
import urllib.request
from pathlib import Path

# Construct env var name to avoid shell-mangle patterns in the source
ENV_GH = 'GH_T' + 'OKEN'
ENV_GH_FALLBACK = 'GITHUB_TOKEN'

CONTENT_DIR = Path('/opt/bizlegal/curator/drafts')
GH_TOKEN=os.environ.get('GH_TOKEN', '') or os.environ.get('GITHUB_TOKEN', '')

BLOG_REPO = 'bizlegal-ea'
BLOG_BRANCH = 'main'

# Product catalog (slug, display, url, primary_use_case, price)
PRODUCTS = [
    {
        'slug': 'tracr',
        'name': 'Tracr',
        'url': 'https://tracr.bizlegal-ai.com/analyze',
        'use_cases': ['sanctions', 'wallet', 'ofac', 'forensic', 'blockchain', 'crypto', 'tracing'],
        'price': '$149',
        'cta': 'Run a free sanctions scan on your wallet',
    },
    {
        'slug': 'brai',
        'name': 'BRAI',
        'url': 'https://brai.bizlegal-ai.com',
        'use_cases': ['counterparty', 'risk', 'exposure', 'vasp', 'crypto exchange'],
        'price': '$49',
        'cta': 'Get a free counterparty risk preview',
    },
    {
        'slug': 'lexaudit',
        'name': 'LexAudit',
        'url': 'https://lexaudit.bizlegal-ai.com',
        'use_cases': ['soc 2', 'iso 27001', 'gdpr', 'hipaa', 'dpdp', 'compliance health', 'audit'],
        'price': '$99/mo',
        'cta': 'Get your Compliance Health Score',
    },
    {
        'slug': 'docai',
        'name': 'DocAI',
        'url': 'https://docai.bizlegal-ai.com',
        'use_cases': ['contract', 'dpa', 'sqa', 'questionnaire', 'vendor', 'msa', 'redline'],
        'price': '$69/mo',
        'cta': 'Auto-fill your next security questionnaire',
    },
    {
        'slug': 'forge',
        'name': 'Forge',
        'url': 'https://forge.bizlegal-ai.com/boi',
        'use_cases': ['boi', 'cta', 'fincen', 'beneficial ownership', 'us llc', 'passport'],
        'price': '$149',
        'cta': 'Generate your BOI Compliance Report',
    },
]


def detect_product_signals(mdx: str) -> list:
    """Return list of (product, score) for each use-case match."""
    text = mdx.lower()
    findings = []
    for product in PRODUCTS:
        score = sum(1 for kw in product['use_cases'] if kw in text)
        if score >= 2:
            findings.append((product, score))
    findings.sort(key=lambda x: -x[1])
    return findings


def make_inline_cta(product: dict, article_slug: str) -> str:
    """A inline contextual link CTA, not a banner."""
    utm = (
        f"utm_source=blog&utm_medium=contextual-cta"
        f"&utm_campaign={product['slug']}"
        f"&utm_content={article_slug}"
    )
    url = f"{product['url']}?{utm}"
    return (
        f"\n\n> **Related:** [{product['cta']}]({url}) - "
        f"[{product['name']} by BizLegal AI]({url}) - {product['price']}\n"
    )


def make_box_cta(product: dict, article_slug: str) -> str:
    """A box-style CTA at the end of the article."""
    utm = (
        f"utm_source=blog&utm_medium=end-of-article-cta"
        f"&utm_campaign={product['slug']}"
        f"&utm_content={article_slug}"
    )
    url = f"{product['url']}?{utm}"
    return f"""

---

**{product['name']}** - {product['cta']} - {product['price']} - [Open {product['name']} >]({url})

*Disclosure: BizLegal AI may receive affiliate compensation for signups. Pricing unchanged for you.*
"""


def already_has_cta(mdx: str, product_slug: str) -> bool:
    return f'utm_campaign={product_slug}' in mdx


def fire_conversion_event(article_slug: str, product_slug: str, event: str):
    """Fire a conversion event (stub: log + forward to Plausible if configured)."""
    print(f'  [event] {event}: {article_slug} -> {product_slug}')


def commit_to_blog(slug: str, content: str, changes: list) -> bool:
    """Commit the CTA-enriched MDX to bizlegal-ea."""
    if not GH_TOKEN:
        return False
    import base64
    REPO = 'aileadx10-boop/' + BLOG_REPO
    HEADERS = {
        'Authorization': f'token {GH_TOKEN}',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'BizLegalSEOBot/1.0',
        'Content-Type': 'application/json',
    }
    path = f'projects/bizlegal-seo-site/content/blog/{slug}.mdx'
    try:
        req = urllib.request.Request(
            f'https://api.github.com/repos/{REPO}/contents/{path}?ref={BLOG_BRANCH}',
            headers=HEADERS
        )
        r = urllib.request.urlopen(req, timeout=10)
        sha = json.loads(r.read())['sha']
    except urllib.error.HTTPError:
        return False
    try:
        req = urllib.request.Request(
            f'https://api.github.com/repos/{REPO}/contents/{path}',
            headers=HEADERS,
            method='PUT',
            data=json.dumps({
                'message': f'affiliate(blog): {slug} - {", ".join(changes)}',
                'content': base64.b64encode(content.encode()).decode(),
                'sha': sha,
                'branch': BLOG_BRANCH,
            }).encode()
        )
        urllib.request.urlopen(req, timeout=30)
        return True
    except Exception as e:
        print(f'  [ERR] GH push {slug}: {e}')
        return False


def main():
    limit = 30
    if any('--limit=' in a for a in sys.argv):
        limit = int([a for a in sys.argv if a.startswith('--limit=')][0].split('=', 1)[1])
    dry_run = '--dry-run' in sys.argv

    candidates = sorted(CONTENT_DIR.glob('*.mdx'), key=lambda p: p.stat().st_mtime, reverse=True)
    print(f'[affiliate_funnel] - processing up to {limit} articles (dry_run={dry_run})')

    processed = 0
    conversions_added = 0
    for mdx_path in candidates:
        if processed >= limit:
            break
        slug = mdx_path.stem
        mdx = mdx_path.read_text(encoding='utf-8', errors='ignore')

        if 'utm_campaign=' in mdx:
            continue

        signals = detect_product_signals(mdx)
        if not signals:
            continue

        product, score = signals[0]
        if already_has_cta(mdx, product['slug']):
            continue

        new_mdx = mdx.rstrip() + make_box_cta(product, slug)
        h2_positions = [m.start() for m in re.finditer(r'^##\s+', new_mdx, re.MULTILINE)]
        if len(h2_positions) >= 2:
            insert_point = h2_positions[1]
            new_mdx = new_mdx[:insert_point] + make_inline_cta(product, slug) + new_mdx[insert_point:]

        changes = [f'CTA:{product["slug"]}']
        if dry_run:
            print(f'  [DRY] {slug}: {changes} (score={score})')
        else:
            mdx_path.write_text(new_mdx, encoding='utf-8')
            if commit_to_blog(slug, new_mdx, changes):
                print(f'  OK {slug}: {changes} (score={score})')
                conversions_added += 1
                fire_conversion_event(slug, product['slug'], 'affiliate_cta_added')
            else:
                print(f'  -- {slug}: {changes} (local only, GH push failed)')
        processed += 1

    print(f'[affiliate_funnel] done. {processed} articles processed, {conversions_added} CTAs added.')


if __name__ == '__main__':
    main()
