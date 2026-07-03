# Business Continuity Plan (BCP)

**BizLegal AI / DOR INNOVATIONS**  
**Version:** 2026-07-03 | Review: Annual

---

## 1. Purpose

This BCP ensures BizLegal AI can maintain or rapidly restore service delivery to customers following a disruptive event.

---

## 2. Recovery Objectives

| Metric | Target |
|---|---|
| Recovery Time Objective (RTO) | 4 hours |
| Recovery Point Objective (RPO) | 1 hour |
| Maximum Tolerable Downtime (MTD) | 24 hours |

---

## 3. Critical Services and Dependencies

| Service | Provider | Backup |
|---|---|---|
| Application hosting | Vercel (global CDN) | Vercel auto-redeploys from GitHub on infra failure |
| Database | Supabase (PostgreSQL) | PITR enabled (1-minute granularity, 7-day window) |
| Server (Hetzner curator) | Hetzner CX33, Frankfurt | Hourly snapshots; new CX33 provisions in <10 min |
| AI inference | Anthropic API | No direct fallback; graceful degradation to queued processing |
| CDN / WAF | Cloudflare | Automatic failover to origin on Cloudflare outage |
| Email delivery | Resend | Logs retained; retry on recovery |

---

## 4. Incident Classification

| Level | Description | Response time |
|---|---|---|
| P1 | Customer data inaccessible or breached | 1 hour |
| P2 | Core application down (>50% of customers affected) | 2 hours |
| P3 | Partial outage or degraded performance | 4 hours |
| P4 | Non-critical service disruption | Next business day |

---

## 5. Response Procedures

### 5.1 P1 — Data breach or total data loss

1. Immediately revoke all active API keys and sessions
2. Notify affected customers within 72 hours (GDPR Article 33)
3. Preserve logs for forensic review
4. Restore from Supabase PITR to last known clean snapshot
5. Engage external security counsel for breach assessment
6. Submit GDPR notification to relevant supervisory authority if required

### 5.2 P2 — Application down

1. Verify Vercel deployment status at vercel.com/status
2. If Vercel issue: monitor status page; Vercel SLA guarantees 99.99% uptime
3. If code issue: rollback to last known good deployment via `vercel rollback` in <5 min
4. If database issue: restore from Supabase PITR (1-hour RPO)

### 5.3 Hetzner server failure (curator pipeline)

1. Provision new Hetzner CX33 from snapshot (<10 min)
2. Restore `/opt/bizlegal/curator/` from latest snapshot
3. Reinstall systemd units and restart services
4. Verify crontab with `crontab -l | grep curator`

---

## 6. Communication Plan

| Stakeholder | Channel | Timing |
|---|---|---|
| Customers (P1/P2) | Email (Resend) + Telegram (BizLegal bot) | Within 2 hours of confirmed incident |
| Customers (P3) | Status page update + email | Within 4 hours |
| Regulatory authorities (if data breach) | Official notification | Within 72 hours |

Status page: bizlegal-ai.com/ops/health (token-gated) — internal only.

---

## 7. Testing

BCP is tested annually:
- Quarterly: database restore drill (PITR restore to staging)
- Annual: full failover simulation (Hetzner server destroyed and rebuilt from snapshot)

---

## 8. Plan Owner

Moses Dor (Founder & CEO)  
intelligence@bizlegal-ai.com  

---

*Last tested: [DATE]. Next review: 2027-07-03.*
