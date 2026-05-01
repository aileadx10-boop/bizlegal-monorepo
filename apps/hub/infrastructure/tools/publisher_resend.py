#!/usr/bin/env python3
"""
publisher_resend.py — Email Publisher via Resend API
Sends newsletters, digest emails, lead welcome sequences, and transactional alerts.

Usage:
  python3 publisher_resend.py --template newsletter --date 2026-04-12
  python3 publisher_resend.py --template welcome --email user@example.com --product tracr
  python3 publisher_resend.py --template digest_pdf --pdf-url https://...
"""

import json
import sys
import os
import argparse
import logging
from datetime import date
from pathlib import Path
import requests

LOG_PATH = Path("/opt/bizlegal/logs/email.log")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [resend] %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(LOG_PATH, mode="a"),
        logging.StreamHandler(sys.stderr),
    ],
)
log = logging.getLogger("resend")

RESEND_API = "https://api.resend.com"
RESEND_KEY = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL = "BizLegal AI <intelligence@bizlegal-ai.com>"
REPLY_TO = "support@bizlegal-ai.com"
SITE_URL = "https://bizlegal-ai.com"


# ── HTML Templates ───────────────────────────────────────────
def base_html(body: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body {{ font-family: 'Geist', system-ui, -apple-system, sans-serif; background: #08080f; color: #e8eaf6; margin: 0; padding: 0; }}
  .wrapper {{ max-width: 600px; margin: 0 auto; padding: 40px 24px; }}
  .logo {{ font-size: 20px; color: #f0f2ff; margin-bottom: 32px; }}
  .logo span {{ color: #d4a853; }}
  h1 {{ font-size: 26px; color: #f0f2ff; line-height: 1.2; margin: 0 0 16px; font-weight: 400; }}
  p {{ color: #9fa3c0; font-size: 14px; line-height: 1.7; margin: 0 0 16px; }}
  .btn {{ display: inline-block; background: #a5b4fc; color: #08080f; padding: 12px 24px; text-decoration: none; font-weight: 600; font-size: 14px; border-radius: 8px; margin: 8px 0; }}
  .card {{ background: rgba(13,13,26,0.8); border: 1px solid rgba(165,180,252,0.1); border-radius: 12px; padding: 20px; margin: 16px 0; }}
  .risk-badge {{ display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 500; }}
  .risk-high {{ background: rgba(248,113,113,0.15); color: #f87171; border: 1px solid rgba(248,113,113,0.3); }}
  .risk-med {{ background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }}
  .risk-low {{ background: rgba(74,222,128,0.15); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }}
  .divider {{ height: 1px; background: rgba(165,180,252,0.1); margin: 24px 0; }}
  .footer {{ font-size: 11px; color: #636680; margin-top: 40px; }}
  .footer a {{ color: #636680; }}
</style>
</head>
<body>
<div class="wrapper">
  <div class="logo">BizLegal<span>●</span>AI</div>
  {body}
  <div class="divider"></div>
  <div class="footer">
    <p>BizLegal AI · Regulatory Intelligence Platform<br>
    <a href="{SITE_URL}/unsubscribe?email={{{{email}}}}">Unsubscribe</a> ·
    <a href="{SITE_URL}/privacy">Privacy Policy</a></p>
    <p>Not legal advice. AI-powered regulatory intelligence.</p>
  </div>
</div>
</body>
</html>"""


def newsletter_html(items: list[dict]) -> str:
    items_html = ""
    for item in items[:5]:
        risk = item.get("risk_level", 50)
        risk_class = "high" if risk >= 70 else "med" if risk >= 50 else "low"
        items_html += f"""
    <div class="card">
      <span class="risk-badge risk-{risk_class}">{item.get('category', 'REG')} — Risk {risk}</span>
      <h3 style="color:#f0f2ff;font-size:15px;margin:10px 0 8px;">{item.get('title', '')}</h3>
      <p style="margin:0 0 12px;">{item.get('summary', '')[:200]}...</p>
      <a href="{SITE_URL}/posts/{item.get('slug', '')}" style="color:#a5b4fc;font-size:13px;">Read full analysis →</a>
    </div>"""

    body = f"""
    <h1>This Week in Regulatory Intelligence</h1>
    <p>Top regulatory developments for fintech and crypto executives — curated by BizLegal AI.</p>
    {items_html}
    <div class="divider"></div>
    <p>Get deeper analysis with our compliance tools:</p>
    <a class="btn" href="{SITE_URL}/risk-engine">Run Free Risk Assessment</a>
    """
    return base_html(body)


def welcome_html(product: str) -> str:
    product_guides = {
        "tracr": ("TRACR Blockchain Forensics", "/tracr", "Court-grade blockchain transaction reports for legal proceedings."),
        "brai": ("BRAI Wallet Risk Intelligence", "/brai", "Real-time wallet risk scoring across 50+ blockchains."),
        "lexaudit": ("LexAudit Compliance Certificates", "/lexaudit", "Instant AI-powered compliance certificates."),
        "docai": ("DocAI Contract Generation", "/docai", "Jurisdiction-aware legal document generation."),
        "forge": ("Forge Compliance Scanner", "/forge", "Automated compliance gap reports for your business."),
        "leadforge": ("LeadForge Legal Leads", "/leadforge", "Verified compliance-intent leads for legal services."),
    }
    name, href, desc = product_guides.get(product, ("BizLegal AI", "/", "Global regulatory intelligence."))

    body = f"""
    <h1>Welcome to {name}</h1>
    <p>{desc}</p>
    <p>Here's how to get started:</p>
    <div class="card">
      <p style="margin:0;">1. <a href="{SITE_URL}{href}" style="color:#a5b4fc;">Access your product →</a></p>
    </div>
    <div class="card">
      <p style="margin:0;">2. <a href="{SITE_URL}/risk-engine" style="color:#a5b4fc;">Run a free risk assessment →</a></p>
    </div>
    <div class="card">
      <p style="margin:0;">3. <a href="{SITE_URL}/posts" style="color:#a5b4fc;">Browse the Intelligence Feed →</a></p>
    </div>
    <br>
    <a class="btn" href="{SITE_URL}{href}">Get Started Now</a>
    """
    return base_html(body)


def digest_pdf_html(pdf_url: str, month_label: str) -> str:
    body = f"""
    <h1>{month_label} Regulatory Intelligence Digest</h1>
    <p>Your monthly roundup of the most significant regulatory events, risk scores, and compliance actions is ready.</p>
    <div class="card">
      <p style="margin:0 0 12px;">This month's digest covers:</p>
      <p style="margin:0;">→ Top 10 regulatory events by risk score<br>
      → Jurisdiction spotlight analysis<br>
      → Product intelligence: TRACR, BRAI, LexAudit<br>
      → Risk outlook for next 30 days</p>
    </div>
    <br>
    <a class="btn" href="{pdf_url}">Download PDF Digest</a>
    <br><br>
    <a class="btn" href="{SITE_URL}/risk-engine" style="background:transparent;color:#a5b4fc;border:1px solid rgba(165,180,252,0.3);">Run Your Risk Assessment</a>
    """
    return base_html(body)


# ── Resend API ───────────────────────────────────────────────
def send_email(to: str | list, subject: str, html: str, tags: list = None) -> bool:
    if not RESEND_KEY:
        log.error("RESEND_API_KEY not set")
        return False

    if isinstance(to, str):
        to = [to]

    payload = {
        "from": FROM_EMAIL,
        "to": to,
        "reply_to": REPLY_TO,
        "subject": subject,
        "html": html,
        "tags": tags or [{"name": "source", "value": "bizlegal-pipeline"}],
    }

    try:
        r = requests.post(
            f"{RESEND_API}/emails",
            headers={"Authorization": f"Bearer {RESEND_KEY}", "Content-Type": "application/json"},
            json=payload,
            timeout=20,
        )
        r.raise_for_status()
        result = r.json()
        log.info(f"  ✓ Sent to {to}: {result.get('id', 'ok')}")
        return True
    except Exception as e:
        log.error(f"  ✗ Send failed to {to}: {e}")
        return False


def get_subscriber_list() -> list[str]:
    """Fetch active subscribers from Resend audience or Supabase."""
    # In production: query Supabase `newsletter_subscribers` table
    # or Resend audience API
    audience_id = os.environ.get("RESEND_AUDIENCE_ID", "")
    if not audience_id:
        log.warning("RESEND_AUDIENCE_ID not set — no subscribers fetched")
        return []

    try:
        r = requests.get(
            f"{RESEND_API}/audiences/{audience_id}/contacts",
            headers={"Authorization": f"Bearer {RESEND_KEY}"},
            timeout=15,
        )
        r.raise_for_status()
        contacts = r.json().get("data", [])
        return [c["email"] for c in contacts if not c.get("unsubscribed")]
    except Exception as e:
        log.error(f"Failed to fetch subscribers: {e}")
        return []


# ── CLI ──────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="BizLegal Email Publisher (Resend)")
    parser.add_argument("--template", required=True,
                        choices=["newsletter", "welcome", "digest_pdf"],
                        help="Email template to use")
    parser.add_argument("--email", type=str, help="Single recipient email")
    parser.add_argument("--product", type=str, default="hub", help="Product slug for welcome email")
    parser.add_argument("--pdf-url", type=str, help="PDF URL for digest email")
    parser.add_argument("--date", type=str, default=date.today().isoformat())
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.template == "welcome":
        if not args.email:
            log.error("--email required for welcome template")
            sys.exit(1)
        html = welcome_html(args.product)
        subject = f"Welcome to BizLegal AI — {args.product.upper()}"
        if args.dry_run:
            print(subject)
            print(html[:500])
        else:
            send_email(args.email, subject, html, [{"name": "template", "value": "welcome"}])

    elif args.template == "newsletter":
        # Load recent approved items from gaps/
        today = args.date
        qa_path = Path(f"/opt/bizlegal/gaps/qa-{today}.json")
        items = []
        if qa_path.exists():
            with open(qa_path) as f:
                data = json.load(f)
            items = data.get("approved", [])

        html = newsletter_html(items)
        month = date.today().strftime("%B %Y")
        subject = f"[BizLegal AI] Regulatory Intelligence Digest — {month}"

        subscribers = get_subscriber_list() if not args.email else [args.email]
        log.info(f"Sending newsletter to {len(subscribers)} subscribers")

        if args.dry_run:
            print(f"Subject: {subject}")
            print(f"Recipients: {len(subscribers)}")
            return

        sent = sum(1 for s in subscribers if send_email(s, subject, html))
        log.info(f"Newsletter sent: {sent}/{len(subscribers)}")

    elif args.template == "digest_pdf":
        if not args.pdf_url:
            log.error("--pdf-url required for digest_pdf template")
            sys.exit(1)
        month_label = date.today().strftime("%B %Y")
        html = digest_pdf_html(args.pdf_url, month_label)
        subject = f"[BizLegal AI] {month_label} Regulatory Intelligence Digest — Download Now"

        subscribers = get_subscriber_list() if not args.email else [args.email]
        log.info(f"Sending digest to {len(subscribers)} subscribers")

        if args.dry_run:
            print(f"Subject: {subject}")
            print(f"PDF: {args.pdf_url}")
            return

        sent = sum(1 for s in subscribers if send_email(s, subject, html))
        log.info(f"Digest sent: {sent}/{len(subscribers)}")


if __name__ == "__main__":
    main()
