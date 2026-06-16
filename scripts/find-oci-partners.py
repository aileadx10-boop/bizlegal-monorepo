"""OCI partner finder — uses Firecrawl to discover + scrape candidate referral
partners (cross-border real-estate brokers, business-setup firms, RE lawyers),
extract public contact emails, rank by cross-border fit, and write a CSV.

Reads FIRECRAWL_API_KEY from env or the canonical vault. Uses curl (TLS-safe on
this box). Output: Downloads/oci_partner_leads.csv

Usage:  python scripts/find-oci-partners.py [--limit-scrape 15]
"""
import os, re, csv, json, subprocess, sys

VAULT = r"C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt"
OUT = r"C:/Users/Moshe Dor/Downloads/oci_partner_leads.csv"

QUERIES = [
    "Dubai cross-border real estate brokerage international buyers contact",
    "DIFC company formation business setup firm contact email",
    "UAE real estate lawyer foreign investor property SPV contact",
    "Singapore relocation business incorporation firm international clients contact",
    "Dubai golden visa property investment advisory firm contact",
]
SIGNALS = ["cross-border", "international", "foreign", "non-resident", "offshore",
           "spv", "golden visa", "relocation", "overseas", "expat", "free zone",
           "difc", "rera", "incorporation", "company formation"]
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}")
JUNK = ("example.com", "sentry", "wixpress", "wordpress", "godaddy", "@2x",
        ".png", ".jpg", ".webp", "your-email", "email@", "domain.com")

def fc_key():
    k = os.environ.get("FIRECRAWL_API_KEY")
    if k:
        return k.strip()
    for l in open(VAULT, encoding="utf-8", errors="replace"):
        if l.startswith("FIRECRAWL_API_KEY="):
            return l.split("=", 1)[1].strip()
    return ""

def curl_json(url, payload, key):
    p = subprocess.run(
        ["curl", "-sS", "--ssl-no-revoke", "-m", "70", "-X", "POST", url,
         "-H", f"Authorization: Bearer {key}", "-H", "Content-Type: application/json",
         "-d", json.dumps(payload)],
        capture_output=True)
    try:
        return json.loads(p.stdout.decode("utf-8", "replace"))
    except Exception:
        return {}

def search(q, key):
    d = curl_json("https://api.firecrawl.dev/v1/search", {"query": q, "limit": 6}, key)
    return d.get("data") or d.get("results") or []

def scrape(url, key):
    d = curl_json("https://api.firecrawl.dev/v1/scrape",
                  {"url": url, "formats": ["markdown"]}, key)
    data = d.get("data") or {}
    return (data.get("markdown") or "") + " " + json.dumps(data.get("metadata") or {})

def clean_emails(text):
    out = set()
    for e in EMAIL_RE.findall(text or ""):
        el = e.lower()
        if any(j in el for j in JUNK):
            continue
        out.add(el)
    return sorted(out)

def main():
    limit = 15
    if "--limit-scrape" in sys.argv:
        try: limit = int(sys.argv[sys.argv.index("--limit-scrape") + 1])
        except Exception: pass
    key = fc_key()
    if not key:
        print("FIRECRAWL_API_KEY missing"); return 1

    # 1) discover candidate URLs
    seen, cands = set(), []
    for q in QUERIES:
        for r in search(q, key):
            u = r.get("url") or ""
            if not u or u in seen:
                continue
            # skip pure social/aggregator noise for partner outreach
            if any(s in u for s in ("instagram.com", "facebook.com", "youtube.com", "tiktok.com")):
                continue
            seen.add(u)
            cands.append({"title": (r.get("title") or "")[:120], "url": u})
    print(f"[discover] {len(cands)} candidate firm URLs")

    # 2) scrape for emails + signals (bounded)
    rows = []
    for c in cands[:limit]:
        text = scrape(c["url"], key)
        emails = clean_emails(text)
        tl = (text or "").lower()
        score = sum(1 for s in SIGNALS if s in tl) + (3 if emails else 0)
        rows.append({"title": c["title"], "url": c["url"],
                     "emails": "; ".join(emails[:4]), "signal_score": score})
        print(f"  - score={score} emails={len(emails)} | {c['title'][:55]}")

    rows.sort(key=lambda r: r["signal_score"], reverse=True)
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["signal_score", "title", "emails", "url"])
        w.writeheader()
        for r in rows:
            w.writerow(r)
    print(f"\n[done] wrote {len(rows)} rows -> {OUT}")
    print("\nTop partners with emails:")
    for r in [x for x in rows if x["emails"]][:10]:
        print(f"  [{r['signal_score']}] {r['title'][:50]} | {r['emails']} | {r['url']}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
