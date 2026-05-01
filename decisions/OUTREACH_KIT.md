# OUTREACH_KIT — Manual organic outreach playbook (Phase R5)

**Owner:** Moses
**Cadence target:** 3-5 manual posts/week per spear product (week 1-4)
**Voice rule:** lessons-learned + "I built this because" first-person. Never "buy my thing." HN/Reddit downrank sales-y posts; LinkedIn punishes over-promotion with reach throttling.

Spear products (locked 2026-04-30):

1. **PSP & MoR Risk Manager** — `/psp-risk` on hub
2. **DocAI SQA + DPA Negotiator** — `docai.bizlegal-ai.com/sqa` + `/dpa` (post-Phase P3)
3. **CTA-2024 BOI Tracker** — `/agents/boi-tracker` on hub

Plus: Forge BOI Kit `/boi` ($149), Forge Passport `/passport` ($297), Forge wallet scan `/scan` ($97). These are the **only currently-live revenue surfaces** until Phase P fixes the 5 down subdomains.

---

## Pre-flight checklist (before posting anywhere)

- [ ] Phase P3 done — `BIZLEGAL_INBOUND_SECRET` set everywhere so /ops shows event flow
- [ ] Phase P6-P10 done — all 5 down subdomains return 200 (especially docai)
- [ ] /ops/health page shows all green (subdomains + envs + HMAC self-loop)
- [ ] /ops Referrals pipeline card shows 0 / 0 / 0 / 0 / 0 (confirms aggregator works)
- [ ] Telegram revenue + error alerts arrive (test by manually firing /api/cron/ops-alerts)

If any of those fail, fix first. Posting before /ops is healthy means we miss the conversion data we'd be optimising on.

---

## Channel selection matrix

| Channel        | Spear fit                                | Tone                          | Cadence        | Best post hour (UTC) |
|----------------|------------------------------------------|-------------------------------|----------------|----------------------|
| Reddit r/SaaS  | DocAI SQA, PSP                           | First-person, technical       | 1-2/week       | 14:00 (US morning)   |
| Reddit r/Entrepreneur | PSP (frozen Stripe), BOI Tracker  | Founder pain                  | 1-2/week       | 13:00                |
| Reddit r/legaltech | DocAI DPA, BOI Tracker, LexAudit     | Practitioner, no jargon dump  | 1/week         | 14:00                |
| Reddit r/CryptoCurrency | TRACR, BRAI                       | Forensics + recovery angle    | 1/week         | 18:00 (peak)         |
| Reddit r/RealEstate | OCI referral funnel                  | Cross-jurisdiction deals      | 1/week         | 15:00                |
| LinkedIn       | All — repurpose blog as carousel + post | Authoritative, data-led       | 3/week         | 13:00 Tue/Wed/Thu    |
| X / Twitter    | TRACR (forensic findings), BRAI         | Hot takes + 1-image quote     | 4-5/week       | 14:00, 21:00         |
| HN             | DocAI SQA, BOI Tracker                  | Show HN: built this because…  | 1 per spear (max 1/wk total) | 13:00 Tue or 15:00 Wed |

Never post the same exact text to 3+ channels — each channel rewards a slightly different framing. Use the templates below as starting points, not copy-paste.

---

## Reddit templates

### Template R1 — `r/SaaS` — DocAI SQA

```
Title: Spent 3 hours every Friday answering customer SOC 2 questionnaires.
       Built a tool to draft them in 60s. What I learned about CAIQ vs SIG-Lite.

Body:
Sales engineer at a B2B SaaS here. Every customer big enough to matter
sent us a security questionnaire — usually CAIQ or a Lite-SIG variant.

I'd answer the same 200 questions over and over with slightly different
wording. Started building a draft generator that learns from our prior
answers. Not magic — just stops me retyping the same answer to "Do you
encrypt data at rest?" 47 times a quarter.

Three things that surprised me building this:

1. CAIQ + SIG-Lite share ~70% of question semantics but customers want
   the framework name on the page. The framework is theatre; the
   answers are the work.
2. Most "questionnaire" questions don't have one right answer — they
   have one right answer FOR YOUR ARCHITECTURE. A draft is the floor,
   not the ceiling.
3. The faster I returned questionnaires, the bigger the deals closed.
   Two weeks vs same-day was a real conversion lever.

Free first draft if anyone wants to throw a CAIQ at it.
[hub link to /agents redirecting to docai.bizlegal-ai.com/sqa]

Curious — what's everyone else's framework choice and why?
```

### Template R2 — `r/Entrepreneur` — PSP frozen account

```
Title: Stripe froze our account 5 days before our first big customer
       payment. Here's the appeal-letter template that unfroze us.

Body:
True story. We had a $40K invoice landing on Friday. Got the email at
2am Wednesday: "Your Stripe account has been placed under review."
Funds frozen, payouts paused, customer-support form all you get.

Spent the next 36 hours figuring out:

- Which AUP clauses they were probably citing (turns out only 3 are
  load-bearing for fintech-adjacent SaaS)
- What proof they actually want (it's NOT what their portal asks for)
- The exact phrasing that gets a human to read the appeal vs auto-route
  it back to the queue

We got it unfrozen in 4 days. Could have been 30+ if I'd done it the
naive way.

I packaged the appeal-letter template + the AUP audit checklist into a
$299 thing because every founder I've shown it to has needed it
within 6 months. Not a SaaS — one-shot deliverable.
[hub link /psp-risk]

Anyone else been frozen and want to share the pattern?
```

### Template R3 — `r/legaltech` — BOI Tracker

```
Title: FinCEN amended the BOI rule mid-flight again. Here's what
       actually changed and the $500/day penalty math.

Body:
Quick PSA for anyone managing US LLCs. FinCEN's BOI implementation
keeps amending and most owners I talk to are tracking the wrong
deadline.

The $500/day penalty isn't theoretical — it accrues from the day you
miss the 30-day amendment window after a beneficial-owner change. A
single member admission triggers a refile.

The 3 changes I see people miss most:

- Foreign-entity threshold change (Q1 amendment)
- Reporting company exemption clarifications
- The 30-day clock on amendments vs the original 90/30 day initial-
  filing distinction

If anyone wants to track multiple entities, I built a $29/mo monitor
that pings on FinCEN amendments + your specific BO-change events.
First entity free for 7 days.
[hub link /agents/boi-tracker]

What's the most painful state-level wrinkle you've hit on top of BOI?
```

### Template R4 — `r/CryptoCurrency` — TRACR

```
Title: Got rugged for $80K. Here's what I learned tracing the wallet
       through the 3 mixers and what's actually recoverable.

Body:
Not legal advice. War story.

[Walks through forensic chain with redacted addresses, what tools
worked, what didn't, why you usually never recover but sometimes do.]

The ENS / KYC-mixer angle that surprises people: even Tornado-mixed
funds eventually touch a centralised off-ramp. The trace doesn't
have to be unbroken to be useful — it just has to give law
enforcement enough to subpoena the off-ramp.

Built a forensic-report tool that runs the same trace + KYC-touchpoint
analysis I did manually. Bronze ($149) for the wallet itself; Silver
($299) when you need court-ready prose for a freezing order.
[hub link /agents redirecting to tracr.bizlegal-ai.com]

Anyone got a recovery story worth sharing?
```

### Template R5 — `r/RealEstate` — OCI referral

```
Title: Cross-border real-estate deals — finder-fee splits with vetted
       jurisdictional partners (UAE, SG, IL, EU)

Body:
Brokering a deal that crosses borders? The single biggest cost isn't
fees — it's the broker on the other side who doesn't know the buyer's
jurisdictional obligations and quotes 3 weeks for what should be 5
days.

Running a finder-fee network: vetted licensed agents in UAE / SG / IL /
DIFC who close cross-border deals. We split [details]; you keep the
client; you stop losing deals because the buyer's jurisdiction is
opaque.

DM me if you've got an active cross-border lead and want a partner
who's already done your buyer's jurisdiction.
```

(For OCI: Moses cold-DMs the top 5 commenters on this post within 48h.)

---

## LinkedIn templates

### Template L1 — Carousel: "PSP rejection patterns"

10 slides:
1. Hook: "Your Stripe / PayPal / Mercury account got frozen. Here's the 7-clause AUP audit that gets it unfrozen."
2-8. One slide per AUP clause with the practical question to answer.
9. CTA: "Free 5-min audit at /psp-risk."
10. Disclosure + decision-support boilerplate.

Caption hook: "Spent the last 12 months pulling 3am 'we just got frozen' calls from founders. Here's the pattern."

### Template L2 — Long post: "I built X because Y"

```
Last quarter I watched 3 of my friends miss their BOI 30-day amendment
window. The penalty math is brutal — $500/day from the missed date,
not from when FinCEN notices.

So I built a tool that tracks multiple entities and pings on:
- FinCEN rule amendments (we hash + diff their guidance pages
  semantically — not just byte-level)
- Your own beneficial-owner changes when you log them
- 7-day pre-deadline reminders

$29/mo, first entity free for 7 days. Built for owner-managers, not
compliance officers — no jargon.

Link in comments. Curious how everyone else is currently tracking
this — spreadsheet? Calendar reminders? Hoping FinCEN emails you?
```

### Template L3 — Quote-card: "Sources cite themselves"

Single image with a 2-sentence quote (extract from a recent blog post).
Background: dark navy, accent gold. Caption explains in 80 words why
this matters and links to the underlying post.

Use SeoCrawler-Q1 enriched posts — the regulator quotes give credibility.

---

## X / Twitter thread templates

### Template X1 — "How a regulator hides the real deadline"

```
1/ Regulators bury the actual deadline in clause (3)(b)(iv) of a
schedule that nobody reads.

Here's how to find it before you miss it. 🧵

2/ [specific clause example from a recent enforcement action]

…

8/ Built a tool that tracks deadline language across 6 regulators
(FinCEN, SEC, FCA, EU, MAS, VARA) and pings when language changes.
$99/mo, free 14-day trial.

End: [link]
```

### Template X2 — Single quote-tweet

```
[Quote a regulator's own X post about a rule change.]

What this clause buries: [practical operational consequence].

If you're touching this market, the 30-day clock starts the day this
hits the Federal Register. Tracking these in [hub /agents].
```

---

## HN — Show HN templates (use sparingly)

### Show HN: BizLegal-AI BOI Tracker — $29/mo CTA-2024 monitor

Title: "Show HN: BizLegal-AI — $29/mo BOI tracker for US LLC owners"

Top comment (by Moses, posted 5 minutes after submission):

```
Hi HN — built this because three founders I know missed their BOI
30-day amendment window in the last quarter and ate $500/day penalties.

The differentiator vs spreadsheet:
- Semantic monitoring of FinCEN guidance (Firecrawl + Sonnet, not
  byte-level hash diffs that fire on cosmetic edits)
- Your beneficial-owner change events tied to a 30-day clock
- Pre-deadline reminders that escalate (email -> SMS -> Telegram on
  enterprise tier)

Architecture: Vercel + Supabase + Resend, daily cron diffs the
canonical FinCEN pages, Sonnet 4.6 summarises material changes only
(skips pure cosmetic). Source code TBD on whether to open it.

Happy to answer questions about the diff-detection pipeline — that
was the hard part.
```

Time the post for Tuesday 13:00 UTC (best HN window per HN frontpage analytics).

---

## Cadence (week 1)

| Day  | Channel                                          | Spear              |
|------|--------------------------------------------------|--------------------|
| Mon  | LinkedIn carousel (L1)                           | PSP                |
| Tue  | Reddit r/SaaS (R1) + LinkedIn (L2)               | DocAI / BOI        |
| Wed  | HN: Show HN (BOI Tracker) + X thread (X1)        | BOI                |
| Thu  | Reddit r/Entrepreneur (R2) + LinkedIn (L3)       | PSP                |
| Fri  | Reddit r/CryptoCurrency (R4) + X quote (X2)      | TRACR              |
| Sat  | (rest — measure /ops Referrals card + payments)  | —                  |
| Sun  | Reddit r/RealEstate (R5) + cold-outbound 5 OCI partner DMs | OCI |

After each post: check /ops at +30min, +2h, +24h. Record on a row in `/ops?t=...` what landed:
- Visitors (proxy: lead.inbound + risk.assessment + agent.checkout events)
- Conversions (payment.intent → payment.confirmed)

Adjust the next week's cadence based on which channels actually moved /ops needles.

---

## Red lines (DO NOT do these)

- Don't post the exact same body to 3+ subreddits same day. Reddit's anti-spam fingerprint will shadow-ban.
- Don't link to the same hub URL from 5+ posts in 24h — Google sees this and devalues the destination.
- Don't post anything to LinkedIn Premium Inbox without context — they punish cold outreach hard.
- Don't DM cold on X without warming first (like + reply on 2-3 of their posts over 48h).
- Don't quote actual SEC / FTC enforcement actions by company name without checking the docket is public — you can get sued for misstating an open matter.
- Don't ever paste the leaked Firecrawl API key in a public channel again.

---

## Phase V (V1 + V2) additions — 2 new spear products

After V1 (AI-Act Risk Classifier) and V2 (Privacy Auto-Refresh) ship in Phase V, add these channel templates to the rotation. Both reuse the "lessons-learned + I built this because" voice rule.

### Template R6 — `r/SaaS` — AI-Act Risk Classifier

```
Title: EU AI Act applies 2026-08-02. Spent two days reading Article 6
       and Annex III; here's the 5-question test that gets you to a
       defensible classification in under 10 minutes.

Body:
B2B SaaS founder here with an AI-powered onboarding feature. Realised
last week that 2026-08-02 is the date GP-AI obligations become
applicable, and our system probably falls under Annex III(4) — but
the line between "limited" and "high" risk turns on whether the
feature makes "consequential decisions" without meaningful human
review. Specific.

Five questions that actually move the classification:

1. Does the system process biometric data (face, voice, fingerprint)?
   → Article 5 territory.
2. Does it make consequential automated decisions about people without
   meaningful human review? → Annex III(5–8).
3. Used in education, vocational training, or employment? → Annex III(3–4).
4. Used in law enforcement, migration, or judicial context? → III(6–7).
5. Foundation LLM or multi-purpose API? → Article 55 obligations.

If you answer "yes" to any of (1)–(4), you're high-risk. If (5), Article
55 transparency obligations kick in regardless of tier.

Built a free classifier that asks these 5 + a free-form description and
returns a tier with cited Article numbers. Free preview at
[hub link /agents/ai-act]. Decision support, not a legal opinion —
review with EU counsel before relying on it.

What did your team decide for your AI feature?
```

Hook on r/MachineLearning, r/Eurolaw, r/SaaS. Mid-week, 14:00 UTC.

### Template R7 — `r/legaltech` / `r/SaaS` — Privacy Auto-Refresh

```
Title: Most B2B SaaS privacy policies are 6-24 months stale.
       Here's the 7-framework checklist enforcement actions cite.

Body:
"Policy did not reflect current data flows" — 4 GDPR enforcement
actions cited that exact phrase in 2025. Translation: enforcement
authorities can find you out of compliance just because your policy
hasn't been re-pointed at your actual data flows since the last time
the rules amended.

Frameworks moving most this year:
- Quebec Law 25 — Sept 2024 amendment on AI-driven decisioning notice
- Texas DPSA — Jan 2026 effective; sensitive-data class expansion
- Colorado CPA — quarterly Universal Opt-Out Mechanism (UOOM) updates
- CPRA — Article 1798.140 sensitive-data list grew Q1
- GDPR — DPO designation rules clarified by EDPB Jan 2026

Built a free 7-framework redline tool. You paste your policy URL,
Sonnet runs a substring-checked redline against current canonical text
of GDPR / CCPA / CPRA / Q-Law25 / CO / CT / TX, returns findings each
with a verbatim quote from your policy + suggested replacement.

Free first audit, $29/mo for daily monitoring with material-change
alerts (not cosmetic-edit noise). [hub link /agents/policy-refresh]

What's the framework you're least confident about?
```

Hook on r/legaltech, r/SaaS, r/B2B. Tue/Thu 13:00 UTC.

### Template L4 — LinkedIn carousel: "Stop publishing a stale privacy policy"

8 slides:
1. Hook — "Most B2B SaaS privacy policies are 6-24 months stale"
2-7. One slide per framework with one verbatim quote of recent enforcement-action language citing stale notices
8. CTA: "Free 7-framework audit at /agents/policy-refresh"

### Template X3 — X thread: AI-Act 2026-08-02 deadline countdown

```
1/ 2026-08-02 is the date EU AI Act general-purpose obligations
become applicable. Penalty: up to €35M or 7% of global turnover.

If you ship AI in Europe, you have ~3 months to classify
your system. Here's the test in 5 questions. 🧵

[…]

8/ Free classifier with cited Article 6 + Annex III references at
   /agents/ai-act. Decision support, not legal advice.
```

### Cadence delta (week 2-3 after V1+V2 deploy)

| Day  | Channel                                          | Spear              |
|------|--------------------------------------------------|--------------------|
| Mon  | LinkedIn carousel L4 (Privacy Refresh)           | V2                 |
| Tue  | Reddit r/SaaS R6 (AI-Act) + LinkedIn L2          | V1 / DocAI         |
| Wed  | HN: Show HN (Privacy Auto-Refresh) + X X3        | V2 / V1            |
| Thu  | Reddit r/legaltech R7 (Policy)                   | V2                 |
| Fri  | Reddit r/CryptoCurrency R4                       | TRACR              |

---

## Success criteria for week 1

- 12-18 manual posts shipped across the 7 channels
- /ops Referrals card shows ≥ 1 `referral.received` event
- /ops feed shows non-zero `risk.assessment` + `lead.inbound` traffic
- 1+ paying customer (most likely Forge BOI Kit $149 or BOI Tracker $29 or PSP $299)
- Funnel data on which post types converted vs which were noise

If week 1 hits 0 paying customers across 12+ posts, the message-market fit is broken on the spear product page itself — not on the channels. Iterate the landing copy before adding more channels.
