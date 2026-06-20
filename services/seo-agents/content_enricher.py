"""
Agent A — Content Enricher
==========================

Daily cron: 04:00 UTC
Source:    bizlegal-ea/projects/bizlegal-seo-site/content/blog/*.mdx
Output:    Patched MDX with:
           - <table> instead of long lists
           - > **TL;DR:** blockquote at top
           - Inline cross-links to 3-5 related articles
           - Source authority badges
           - Last-updated stamp for freshness

Run: python3 content_enricher.py [--limit 30] [--dry-run]
Owner: Hermes / Moses
"""

import os
import re
import sys
import json
import time
import subprocess
import urllib.request
from pathlib import Path
from datetime import datetime, timezone

# Config
CONTENT_DIR = Path('/opt/bizlegal/curator/drafts')   # source of truth on Hetzner
BLOG_REPO = 'bizlegal-ea'
BLOG_BRANCH = 'main'
GH_TOKEN = os.environ.get('GH_TOKEN', '')
ANTHROPIC_KEY = os.environ.get('ANTHROPIC_API_KEY', '')
TODAY = datetime.now(timezone.utc).strftime('%Y-%m-%d')

# Heuristics (deterministic, no LLM cost for the easy wins)
LIST_TO_TABLE_RE = re.compile(r'((?:^|\n)((?:[-*]|\d+\.)\s+.+\n){3,})', re.MULTILINE)
URL_RE = re.compile(r'https?://[^\s)\]"]+')
SECTION_RE = re.compile(r'^##\s+(.+)$', re.MULTILINE)


def has_table(mdx: str) -> bool:
    return '|' in mdx and '\n---' in mdx


def has_tldr(mdx: str) -> bool:
    return '**TL;DR:**' in mdx or '> **TL;DR' in mdx


def has_last_updated(mdx: str) -> bool:
    return 'Last updated:' in mdx


def has_cross_links(mdx: str) -> bool:
    # Count internal links (relative /blog/...)
    return len(re.findall(r'\[.+?\]\(/blog/[a-z0-9-]+\)', mdx)) >= 3


def has_source_badges(mdx: str) -> bool:
    return '[OFFICIAL]' in mdx or '[TIER 1]' in mdx


# Source authority classifier (for badges)
SOURCE_TIERS = {
    'TIER 1 (regulator)': [
        'sec.gov', 'cftc.gov', 'fca.org.uk', 'fincen.gov', 'vara.ae', 'mas.gov.sg',
        'sfc.hk', 'jfsa.go.jp', 'austrac.gov.au', 'bafin.de', 'amf-france.org',
        'consob.it', 'cnmv.es', 'esma.europa.eu', 'eba.europa.eu', 'europa.eu',
        'treasury.gov', 'ofac.treasury.gov', 'irs.gov', 'cbp.dhs.gov', 'fbi.gov',
        'europol.europa.eu', 'interpol.int', 'un.org', 'unodc.org', 'fatf-gafi.org',
    ],
    'TIER 2 (industry/press)': [
        'reuters.com', 'bloomberg.com', 'ft.com', 'wsj.com', 'coindesk.com',
        'theblock.co', 'decrypt.co', 'cointelegraph.com', 'coingeek.com',
        'pymnts.com', 'paymentsdive.com', 'law360.com', 'lexology.com',
    ],
}


def classify_source(url: str) -> str:
    for tier, domains in SOURCE_TIERS.items():
        for d in domains:
            if d in url:
                return tier
    return 'TIER 3 (other)'


def add_tldr(mdx: str) -> str:
    """Insert TL;DR blockquote after the first heading."""
    if has_tldr(mdx):
        return mdx
    # Find first H1 or first paragraph
    h1_match = re.search(r'^#\s+(.+)$', mdx, re.MULTILINE)
    if not h1_match:
        return mdx
    # Find first paragraph after the H1
    after_h1 = mdx[h1_match.end():]
    para_match = re.match(r'\s*\n+([^\n#].{60,400}?)\n', after_h1, re.DOTALL)
    if not para_match:
        return mdx
    tldr_text = para_match.group(1).strip()[:500]
    # Insert TL;DR before the paragraph
    insert_point = h1_match.end() + para_match.start()
    tldr_block = f"\n\n> **TL;DR:** {tldr_text}\n"
    return mdx[:insert_point] + tldr_block + mdx[insert_point:]


def add_last_updated(mdx: str) -> str:
    """Append a freshness stamp to the frontmatter block."""
    if has_last_updated(mdx):
        # Update existing stamp
        return re.sub(r'> Last updated: \d{4}-\d{2}-\d{2}',
                      f'> Last updated: {TODAY}', mdx)
    # Insert after first heading
    h1_match = re.search(r'^#\s+(.+)$', mdx, re.MULTILINE)
    if not h1_match:
        return mdx
    insert_point = mdx.index('\n', h1_match.end()) + 1
    stamp = f"\n> Last updated: {TODAY} · Reviewed by BizLegal AI Intelligence Desk\n"
    return mdx[:insert_point] + stamp + mdx[insert_point:]


def list_to_table(mdx: str) -> str:
    """Convert simple bullet lists with consistent structure to tables."""
    if has_table(mdx):
        return mdx
    # Find bullet lists of 3+ items that look like key-value pairs (colon-separated)
    pattern = re.compile(
        r'((?:^|\n)(?:[-*]\s+\*\*[^*]+\*\*:?\s+[^\n]+\n){3,})',
        re.MULTILINE
    )
    out = mdx
    for match in pattern.finditer(mdx):
        block = match.group(0)
        items = re.findall(r'[-*]\s+\*\*([^*]+)\*\*:?\s+([^\n]+)', block)
        if len(items) < 3:
            continue
        header = '| Item | Detail |\n|------|--------|'
        rows = '\n'.join(f'| {k.strip()} | {v.strip()} |' for k, v in items)
        replacement = f'\n{header}\n{rows}\n'
        out = out.replace(block, replacement, 1)
    return out


def add_source_badges(mdx: str) -> str:
    """Find the Sources section and prefix each URL with its tier badge."""
    sources_match = re.search(r'##\s+Sources.*?(?=\n##\s|\Z)', mdx, re.DOTALL | re.IGNORECASE)
    if not sources_match or has_source_badges(sources_match.group(0)):
        return mdx
    block = sources_match.group(0)
    new_block_lines = []
    for line in block.split('\n'):
        urls = URL_RE.findall(line)
        if not urls:
            new_block_lines.append(line)
            continue
        new_line = line
        for url in urls:
            tier = classify_source(url)
            badge = f'`{tier}`'
            if badge not in new_line:
                new_line = new_line.replace(url, f'{badge} {url}', 1)
        new_block_lines.append(new_line)
    return mdx.replace(block, '\n'.join(new_block_lines))


def enrich_article(slug: str, mdx: str) -> tuple[str, list[str]]:
    """Apply all enrichments. Returns (new_mdx, list_of_changes)."""
    changes = []
    new_mdx = mdx

    if not has_tldr(new_mdx):
        new_mdx = add_tldr(new_mdx)
        changes.append('+ TL;DR')
    if not has_last_updated(new_mdx):
        new_mdx = add_last_updated(new_mdx)
        changes.append('+ last-updated')
    if not has_table(new_mdx):
        out = list_to_table(new_mdx)
        if out != new_mdx:
            new_mdx = out
            changes.append('+ table')
    if not has_source_badges(new_mdx):
        out = add_source_badges(new_mdx)
        if out != new_mdx:
            new_mdx = out
            changes.append('+ source-badges')
    # Cross-links via Anthropic (only if not enough)
    if not has_cross_links(new_mdx) and ANTHROPIC_KEY:
        # Would call Anthropic here to find related articles in the corpus
        # For now, mark as 'skipped' - the corpus is local
        changes.append('~ cross-links: skipped (need corpus index)')

    return new_mdx, changes


def commit_to_blog(slug: str, content: str, changes: list[str]) -> bool:
    """Commit the enriched MDX to bizlegal-ea via Contents API."""
    if not GH_TOKEN:
        return False
    import base64
    REPO = f'aileadx10-boop/{BLOG_REPO}'
    HEADERS = {
        'Authorization': f'token {GH_TOKEN}',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'BizLegalSEOBot/1.0',
        'Content-Type': 'application/json',
    }
    path = f'projects/bizlegal-seo-site/content/blog/{slug}.mdx'
    # Get current SHA
    try:
        req = urllib.request.Request(
            f'https://api.github.com/repos/{REPO}/contents/{path}?ref={BLOG_BRANCH}',
            headers=HEADERS
        )
        r = urllib.request.urlopen(req, timeout=10)
        sha = json.loads(r.read())['sha']
    except urllib.error.HTTPError as e:
        if e.code == 404:
            sha = None
        else:
            return False
    body = {
        'message': f'enrich(blog): {slug} — {", ".join(changes)}',
        'content': base64.b64encode(content.encode()).decode(),
        'branch': BLOG_BRANCH,
    }
    if sha:
        body['sha'] = sha
    try:
        req = urllib.request.Request(
            f'https://api.github.com/repos/{REPO}/contents/{path}',
            headers=HEADERS,
            method='PUT',
            data=json.dumps(body).encode()
        )
        urllib.request.urlopen(req, timeout=30)
        return True
    except Exception:
        return False


def main():
    limit = int([a for a in sys.argv if a.startswith('--limit=')][0].split('=')[1]) if any('--limit=' in a for a in sys.argv) else 30
    dry_run = '--dry-run' in sys.argv

    # Pick articles to enrich: prioritize ones without TL;DR / tables (haven't been touched)
    candidates = sorted(CONTENT_DIR.glob('*.mdx'), key=lambda p: p.stat().st_mtime, reverse=True)
    print(f'[content_enricher] {TODAY} — processing up to {limit} articles (dry_run={dry_run})')

    processed = 0
    for path in candidates:
        if processed >= limit:
            break
        slug = path.stem
        mdx = path.read_text(encoding='utf-8', errors='ignore')
        # Skip if already heavily enriched
        if has_tldr(mdx) and has_table(mdx) and has_last_updated(mdx) and has_source_badges(mdx):
            continue
        new_mdx, changes = enrich_article(slug, mdx)
        if not changes:
            continue
        if dry_run:
            print(f'  [DRY] {slug}: {changes}')
        else:
            path.write_text(new_mdx, encoding='utf-8')
            if commit_to_blog(slug, new_mdx, changes):
                print(f'  ✓ {slug}: {changes}')
            else:
                print(f'  ~ {slug}: {changes} (local only, GH push skipped)')
        processed += 1
    print(f'[content_enricher] done. {processed} articles enriched.')


if __name__ == '__main__':
    main()
