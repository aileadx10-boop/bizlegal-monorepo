# Workflow 07 — Monthly eBook / Digest Report

**Trigger**: First Monday of every month, 07:00 UTC  
**Owner**: n8n `newsletter.json` → Python → WeasyPrint  
**Agent**: Claude Sonnet (curated analysis) → gemma2:9b (formatting)  
**Output**: PDF report + email campaign + downloadable on /resources

---

## Purpose

Produce a monthly "Regulatory Intelligence Digest" — a branded PDF that aggregates the top regulatory events, risk scores, and compliance actions of the past month. Used as a lead magnet, subscriber reward, and authority signal.

---

## Report Structure

```
Cover Page
  → Logo + "BizLegal AI Regulatory Intelligence Digest"
  → Month + Year
  → "Prepared by BizLegal AI — Not Legal Advice"

Executive Summary (1 page)
  → 5 bullet points: biggest regulatory moves of the month
  → Risk environment score: 0–100 (average of all events)
  → Key jurisdictions impacted

Top 10 Regulatory Events (2 pages)
  → For each: title, category, risk_level bar, 2-sentence summary, source link

Jurisdiction Spotlight (1 page)
  → Deep-dive on highest-activity jurisdiction this month
  → Enforcement actions, new rules, licensing decisions

Product Intelligence (1 page)
  → TRACR: notable cases / enforcement actions tracked
  → BRAI: wallet risk trends
  → LexAudit: top compliance gaps detected

Risk Outlook (1 page)
  → Predicted regulatory hotspots for next 30 days
  → Top 3 watchlist items

CTA Page (1 page)
  → "Run Your Compliance Scan" → /forge
  → "Get Your Risk Score" → /risk-engine
  → "Contact for Enterprise" → /enterprise
```

---

## Process

```
1. n8n triggers on 1st Monday of month
2. Query Supabase:
   SELECT * FROM intelligence_items
   WHERE created_at >= (now() - interval '30 days')
   ORDER BY risk_level DESC
   LIMIT 100
3. judge_dedup.py → select top 10 by risk + recency
4. Claude Sonnet → write executive summary + spotlight analysis
5. gemma2:9b → format all sections into report template
6. WeasyPrint → render to PDF using templates/ebook.html + assets/
7. Save to: pdfs/digest-YYYY-MM.pdf
8. Upload to Supabase storage → public URL
9. Update Supabase resources table with new PDF URL
10. publisher_resend.py → send to all subscribers
11. Post to social (publisher_buffer.py): "New Digest: [month]"
```

---

## PDF Generation (WeasyPrint)

```bash
# On Hetzner CX32:
weasyprint templates/ebook.html pdfs/digest-$(date +%Y-%m).pdf \
  --stylesheet assets/ebook.css \
  --base-url https://bizlegal-ai.com
```

```html
<!-- templates/ebook.html (data injected via Jinja2) -->
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="assets/ebook.css">
</head>
<body>
  <div class="cover">
    <img src="assets/logo.png">
    <h1>{{ month_year }} Regulatory Intelligence Digest</h1>
  </div>
  {% for item in top_items %}
  <div class="event-card">
    <div class="risk-badge risk-{{ item.risk_class }}">{{ item.risk_level }}</div>
    <h2>{{ item.title }}</h2>
    <p>{{ item.summary }}</p>
  </div>
  {% endfor %}
</body>
</html>
```

---

## Email Campaign (Resend)

```python
# publisher_resend.py called with:
{
  "template": "monthly_digest",
  "subject": f"[BizLegal AI] {month_year} Regulatory Digest — {top_risk} risk events",
  "pdf_url": "https://[supabase-storage]/digest-YYYY-MM.pdf",
  "preview_text": "Top 10 regulatory events that could affect your business this month"
}
```

Email structure:
1. Hero: "Your Monthly Regulatory Digest is ready"
2. Top 3 events teaser (from report)
3. CTA: Download PDF
4. Product cross-sell (1 relevant product based on top category)
5. Footer: Unsubscribe + disclaimer

---

## Success Criteria

- PDF generated and uploaded by 09:00 UTC on trigger day
- Email sent to 100% of active subscribers
- Open rate > 40% (digest emails have higher baseline)
- PDF download rate > 25% of opens
- ≥ 1 product conversion attributed to digest send

---

## Learnings Log

| Date | Learning |
|---|---|
| — | Baseline |
