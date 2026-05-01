# Workflow 08 — Strategy Brain

**Trigger**: Weekly Sunday 20:00 UTC + on-demand (Claude Opus session)  
**Owner**: Claude Opus (claude.ai) for reasoning; n8n for data gathering  
**Agent**: Claude Opus 4.6 (strategy), Claude Code (implementation)  
**Output**: Weekly strategy document + priority queue update + CLAUDE.md amendments

---

## Purpose

This is the meta-workflow — it reviews everything that happened in the past week, identifies what's working, updates priorities, and produces actionable instructions for the next week's Claude Code sessions.

This is the only workflow where Opus is the primary agent. Code runs AFTER Opus reasons.

---

## Weekly Strategy Review

### Data Inputs (auto-gathered by n8n on Sunday)

```
1. Intelligence volume → How many items scouted this week?
2. Content published → How many posts went live?
3. Traffic metrics → Vercel Analytics summary
4. Product conversions → Supabase orders this week
5. Social performance → Buffer analytics (engagement, reach)
6. Email metrics → Resend open/click rates
7. BizBot logs → Top intents, escalations, lead captures
8. Error logs → Any failed pipeline runs
```

### Opus Strategy Prompt

```
You are the strategy brain for BizLegal AI. Review the weekly data:

[PASTE DATA]

Answer:
1. What is working? (top 3 signals)
2. What is broken or underperforming? (top 3 issues)
3. What should Claude Code build/fix this week? (prioritized task list)
4. Are there any CLAUDE.md updates needed?
5. Any new automation opportunities?

Output format: structured markdown with task priority [HIGH/MED/LOW]
```

---

## Output: Weekly Priority Queue

Produced each Sunday, consumed by Claude Code sessions Mon–Fri:

```markdown
# Week of [DATE] — Priority Queue

## HIGH (do first)
- [ ] [Task A] — [Why it matters] — [Workflow ref]
- [ ] [Task B] — [Why it matters] — [Workflow ref]

## MEDIUM
- [ ] [Task C]
- [ ] [Task D]

## LOW (if time allows)
- [ ] [Task E]

## Automation wins this week
- [n8n workflow to add/fix]

## CLAUDE.md amendments
- [Any rule changes]
```

File: `logs/strategy-YYYY-WW.md`

---

## Product Roadmap Alignment

Each product has a 90-day target. Opus checks progress weekly:

| Product | 90-Day Target | Current Status |
|---|---|---|
| TRACR | 50 paid reports | Track orders count |
| BRAI | 500 wallet scans | Track API calls |
| LexAudit | 100 certificates | Track completions |
| DocAI | 200 documents | Track downloads |
| Forge | 30 compliance scans | Track submissions |
| LeadForge | 500 leads delivered | Track lead exports |

---

## Competitive Intelligence

Monthly (not weekly): Opus reviews competitor moves:

```
Monitored competitors:
  - Chainalysis (forensics / wallet risk)
  - ComplyAdvantage (AML screening)
  - Hummingbird (compliance workflows)
  - Elliptic (blockchain analytics)
  - Sumsub (KYC/KYB)

Signals to watch:
  - New product launches
  - Pricing changes
  - Regulatory certifications
  - Funding rounds
  - Content gaps we can fill
```

---

## CLAUDE.md Governance

The Strategy Brain is the ONLY workflow with authority to modify `CLAUDE.md`.

Modification rules:
1. Opus proposes change in strategy doc
2. Human reviews and approves
3. Claude Code implements the CLAUDE.md edit
4. Commit: `docs: update CLAUDE.md — [what changed and why]`

Never modify CLAUDE.md reactively during a build session without strategy brain approval.

---

## Monthly OKR Review

First Sunday of each month: deeper review

```
OKRs for BizLegal AI Q2 2026:

O1: Become the #1 regulatory intelligence platform for crypto/fintech
  KR1: 10,000 monthly organic visitors
  KR2: 500 paying customers across all products
  KR3: 50+ media mentions / backlinks

O2: Automate 80% of content production
  KR1: Daily scout pipeline running with < 5% human intervention
  KR2: 3+ posts per week published automatically
  KR3: Monthly digest fully automated

O3: Achieve product-market fit for TRACR
  KR1: 50 paid reports delivered
  KR2: Net Promoter Score > 8
  KR3: 3 enterprise case studies published
```

---

## Success Criteria

- Weekly priority queue produced by Monday 06:00 UTC
- At least 1 actionable insight per week from data review
- CLAUDE.md stays current (no stale rules)
- 90-day product targets tracked and visible

---

## Learnings Log

| Date | Learning |
|---|---|
| — | Baseline — strategy brain initialised |
