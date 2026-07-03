# SIG Lite — BizLegal AI Pre-filled Questionnaire

**Vendor:** BizLegal AI / DOR INNOVATIONS  
**Version:** 2026-07-03  
**Contact:** intelligence@bizlegal-ai.com  

This SIG Lite covers the standard questions asked during CISO/vendor security reviews. Pre-fill reduces review time from 6 weeks to ~2 weeks.

---

## A — Enterprise Risk Management

**A.1 Does your organization have a formal information security policy?**  
Yes. BizLegal AI maintains an Information Security Policy covering access control, data handling, incident response, and vendor management. Reviewed annually.

**A.2 Do you have a risk assessment process?**  
Yes. We conduct quarterly risk assessments covering technical, operational, and regulatory risks. Findings are tracked and remediated within defined SLAs.

**A.3 Do you have a business continuity plan?**  
Yes. See attached BCP document. RTO: 4 hours. RPO: 1 hour.

---

## B — Security Policy

**B.1 Is security policy documented and communicated?**  
Yes. Security policies are documented and all personnel acknowledge them on hire and annually.

**B.2 Are security policies reviewed and updated?**  
Yes. Annual review cycle, with out-of-cycle reviews triggered by material changes.

---

## C — Organizational Security

**C.1 Are security responsibilities defined?**  
Yes. Moses Dor (Founder) is the designated security officer. External legal counsel (IL) reviews material contractual matters.

**C.2 Do you conduct background checks?**  
Yes. Employment verification conducted for all personnel with access to customer data.

---

## D — Asset Management

**D.1 Do you maintain an asset inventory?**  
Yes. All systems processing customer data are inventoried and classified.

**D.2 Is data classified?**  
Yes. Three tiers: Public / Internal / Confidential. Customer contract data is classified Confidential.

---

## E — Human Resources Security

**E.1 Is security training provided?**  
Yes. Annual security awareness training for all personnel.

**E.2 Are termination procedures in place?**  
Yes. System access is revoked within 24 hours of separation.

---

## F — Physical and Environmental Security

**F.1 Is physical access to data centers controlled?**  
Yes. All infrastructure runs on Hetzner Cloud (Germany, ISO 27001 certified) and Vercel (SOC 2 Type II certified). No BizLegal-owned physical data center.

---

## G — Operations Security

**G.1 Do you have logging and monitoring?**  
Yes. All API access, authentication events, and data access are logged. Logs retained 90 days minimum.

**G.2 Do you have patch management?**  
Yes. Critical patches applied within 72 hours. Non-critical within 30 days.

**G.3 Do you have malware protection?**  
Yes. Endpoint protection on all development machines. Server infrastructure is containerized (no persistent OS-level malware surface).

---

## H — Access Control

**H.1 Is access to customer data restricted?**  
Yes. Principle of least privilege. Customer data is logically isolated by tenant (Supabase row-level security). No cross-tenant data access possible.

**H.2 Do you enforce MFA?**  
Yes. MFA required for all systems with access to production data (Supabase dashboard, Vercel, Hetzner).

**H.3 Do you have privileged access management?**  
Yes. SSH key-based access only to production servers. No password authentication enabled.

---

## I — Cryptography

**I.1 Is data encrypted at rest?**  
Yes. Supabase (PostgreSQL) encrypts all data at rest using AES-256.

**I.2 Is data encrypted in transit?**  
Yes. TLS 1.2+ enforced on all endpoints. HTTP redirected to HTTPS. HSTS enabled.

---

## J — Supplier / Subprocessor Management

| Subprocessor | Purpose | Location | Certification |
|---|---|---|---|
| Anthropic | AI inference (Claude models) | USA | SOC 2 Type II |
| Supabase | Database + auth | USA/EU | SOC 2 Type II |
| Vercel | Application hosting | Global (edge) | SOC 2 Type II |
| Firecrawl | Web data extraction | USA | SOC 2 in progress |
| Resend | Transactional email | USA | SOC 2 Type II |
| Hetzner | Server infrastructure | Germany | ISO 27001, ISO 27018 |
| Cloudflare | CDN + DNS + WAF | Global | SOC 2 Type II, ISO 27001 |

All subprocessors have executed Data Processing Agreements (DPAs). Customer data is shared only as necessary to deliver the contracted service.

---

## K — Incident Management

**K.1 Do you have an incident response plan?**  
Yes. Documented IRP with defined roles, notification timelines, and escalation path.

**K.2 Customer notification timeline for security incidents?**  
Within 72 hours of confirmed breach affecting customer data (GDPR Article 33 compliant).

---

## L — Business Continuity

**L.1 What is your RTO/RPO?**  
RTO: 4 hours. RPO: 1 hour. Achieved via Hetzner snapshots (hourly) and Supabase PITR (point-in-time recovery to 1-minute granularity).

---

## M — Compliance

**M.1 Are you GDPR compliant?**  
Yes. We act as Data Processor under GDPR Article 28. DPA available for signature.

**M.2 Do you have SOC 2?**  
SOC 2 Type I attestation in progress (expected Q4 2026). We can provide our security controls documentation and the pre-filled SIG Lite (this document) as interim evidence.

**M.3 Do you have a DPA available?**  
Yes. See attached DPA-TEMPLATE.md. Ready to redline.

---

*Document prepared by BizLegal AI / DOR INNOVATIONS. Valid for 12 months from issue date.*
