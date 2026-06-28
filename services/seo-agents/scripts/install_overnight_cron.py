#!/usr/bin/env python3
"""
install_overnight_cron.py - install the FULL 12-job autonomous revenue pipeline.

Replaces install_autonomous_cron.py with the complete pipeline Moses needs
to drive $10K MRR by 2027-01-01.

Schedule (all UTC):
  00:30  cold_email_sender.py --stage 0 --limit 5     (initial outreach)
  02:00  seo_content_writer.py                          (write today's blog post)
  03:00  og_image_generator.py                          (1200x630 hero image)
  03:30  internal_linker.py                             (cross-link to products)
  06:00  page_audit.py                                  (audit 49 pages)
  06:30  enrich_page.py                                 (generate JSON-LD)
  07:00  daily_autonomous_seo.py                        (master orchestrator)
  09:30  infographic_generator.py --from-mdx           (infographic for today's post)
  10:00  oci_funnel.py                                  (route qualified leads)
  10:30  oci_deal_closer.py                             (auto-invoice inbound deals)
  12:00  content_distribution.py                        (Reddit/LinkedIn/X drafts)
  14:00  IndexNow ping
  14:30  publish_blog.py                                (commit to bizlegal-ea)
  16:00  lead_nurture.py --stage 1                      (Day-3 follow-up)
  19:00  daily_orchestrator.py --task 19               (daily report)
  19:30  ea_agent.py                                    (brain + Telegram summary)
  20:00  newsletter.py                                  (Resend broadcast)
  21:00  lead_nurture.py --stage 2                      (Day-7 follow-up)
  22:00  lead_nurture.py --stage 3                      (Day-14 follow-up)
  22:30  conversion_tracker.py                          (daily conversion funnel)
  23:00  analytics_dashboard.py                         (SVG trend)
  23:30  cleanup.py                                     (archive old reports)

Total: 22 cron jobs. All running daily.
"""
from __future__ import annotations
import subprocess

CURATOR = "/opt/bizlegal/curator"
SEO = f"{CURATOR}/services/seo-agents"
OUT = f"{CURATOR}/services/seo-agents"
OUTREACH = f"{CURATOR}/services/outreach"
LOG = "/var/log/seo-agents.log"
PY = "python3"

JOBS = [
    ("0",  "30", f"{PY} {OUTREACH}/cold_email_sender.py --stage 0 --limit 5"),
    ("0",  "0",  f"{PY} {SEO}/seo_content_writer.py"),
    ("2",  "0",  f"{PY} {SEO}/seo_content_writer.py --render-og"),
    ("3",  "0",  f"{PY} {SEO}/og_image_generator.py"),
    ("3",  "30", f"{PY} {SEO}/internal_linker.py"),
    ("6",  "0",  f"{PY} {SEO}/page_audit.py --no-supabase --output /opt/bizlegal/decisions"),
    ("6",  "30", f"{PY} {SEO}/enrich_page.py --output /opt/bizlegal/decisions"),
    ("7",  "0",  f"{PY} {SEO}/daily_autonomous_seo.py --output /opt/bizlegal/decisions"),
    ("9",  "30", f"{PY} {SEO}/infographic_generator.py --from-mdx $(ls -t {OUT}/blog_content/*.mdx 2>/dev/null | head -1)"),
    ("10", "0",  f"{PY} {OUTREACH}/oci_funnel.py --output /opt/bizlegal/decisions"),
    ("10", "30", f"{PY} {OUTREACH}/oci_deal_closer.py"),
    ("12", "0",  f"{PY} {SEO}/content_distribution.py --output /opt/bizlegal/decisions"),
    ("14", "0",  f"{PY} {SEO}/indexnow_pinger.py"),
    ("14", "30", f"{PY} {SEO}/publish_blog.py"),
    ("16", "0",  f"{PY} {OUTREACH}/lead_nurture.py --stage 1 --limit 10"),
    ("19", "0",  f"{PY} {SEO}/daily_orchestrator.py --task 19"),
    ("19", "30", f"{PY} {OUTREACH}/ea_agent.py"),
    ("20", "0",  f"{PY} {SEO}/newsletter.py --output /opt/bizlegal/decisions"),
    ("21", "0",  f"{PY} {OUTREACH}/lead_nurture.py --stage 2 --limit 10"),
    ("22", "0",  f"{PY} {OUTREACH}/lead_nurture.py --stage 3 --limit 10"),
    ("22", "30", f"{PY} {SEO}/conversion_tracker.py --output /opt/bizlegal/decisions"),
    ("23", "0",  f"{PY} {SEO}/analytics_dashboard.py"),
    ("23", "30", f"{PY} {SEO}/cleanup.py"),
]


def install():
    # Read current crontab
    r = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
    current = r.stdout if r.returncode == 0 else ""

    # Find existing bizlegal jobs (anything starting with the python3 prefix)
    new_lines = []
    added = 0
    for h, m, cmd in JOBS:
        full_cmd = f"{h} {m} * * * {cmd} >> {LOG} 2>&1"
        if any(full_cmd.strip() in line and "# bizlegal" in line for line in current.split("\n")):
            continue  # already installed
        new_lines.append(f"{full_cmd}  # bizlegal-overnight")
        added += 1

    if not new_lines:
        print(f"  all {len(JOBS)} jobs already installed")
        return

    updated = current.rstrip("\n") + "\n" + "\n".join(new_lines) + "\n"
    subprocess.run(["crontab", "-"], input=updated, text=True)
    print(f"  installed {added} new jobs (total: {len(JOBS)})")


if __name__ == "__main__":
    install()