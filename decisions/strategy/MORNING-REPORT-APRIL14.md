# BIZLEGAL AI — COMPLETE MORNING REPORT (April 14, 2026)

> Read this first. It has everything you asked for.

---

## 1. LIVE SUBDOMAIN STATUS (Verified via curl -sk)

| Domain | Home | /terms | /privacy | /disclaimer | /refund | /acceptable-use | /pricing |
|--------|------|--------|----------|-------------|---------|-----------------|----------|
| bizlegal-ai.com | 200 | 200 | 200 | 200 | 200 | 200 | 200 |
| tracr | 200 | 404 | 404 | 404 | 404 | 404 | 404 |
| brai | 200 | 200 | 200 | 404 | 200 | 404 | 200 |
| lexaudit | 200 | 404 | 404 | 404 | 404 | 404 | 200 |
| docai | 200 | 200 | 200 | 200 | 404 | 404 | 404 |
| forge | 200 | 200 | 200 | 200 | 200 | 200 | 200 |
| leadforge | 404 | 404 | 404 | 404 | 404 | 404 | 404 |

**Pages missing: 20 across 5 subdomains. Forge is the ONLY complete one.**

---

## 2. BRAI DIAGNOSIS (Confirmed)

**ROOT CAUSE: FastAPI Python backend is NOT deployed. No running process.**

- Frontend loads on Vercel but scanner uses FAKE hardcoded JavaScript data
- ALL dynamic features broken: /analyze, /payments, /leads, /crypto/prices
- SQLite database can't work on Vercel (read-only filesystem)
- APScheduler can't run on Vercel (serverless = no persistent process)
- `vercel.json` routes everything to `app.py` — wrong for static frontend

**MVP FIX (5 steps, ~1 hour):**
1. Deploy FastAPI to Render using existing `render.yaml`
2. Set 5 env vars: OPENAI_API_KEY, NOWPAYMENTS_API_KEY, RESEND_API_KEY, ETHERSCAN_API_KEY, VALID_API_KEYS
3. Update Vercel `vercel.json` — serve `frontend/` as static, proxy API routes to Render
4. Fix route mismatch: frontend calls `/api/markets` but backend has `/crypto/prices`
5. Set `APP_URL` on Render to Render domain

---

## 3. PRODUCT COMPLETENESS SCORES

| Product | Score | Legal Pages | Lead Magnet | Payments | Hub Link | Back to BizLegal |
|---------|-------|-------------|-------------|----------|----------|------------------|
| **Forge** | 70/100 | 5/6 (missing acceptable-use) | Yes (free scan) | Working | Partial | In footer |
| **TRACR** | 62/100 | 0/6 (ALL missing!) | Yes (free scan) | Working | In nav | Yes (in nav) |
| **LexAudit** | 55/100 | 3/6 (has terms/privacy/disclaimer) | Yes (scanner widget) | Working | Missing | Missing |
| **DocAI** | 45/100 | 4/6 (missing refund, acceptable-use) | Partial (scan form) | Working | Yes | Yes |
| **BRAI** | 25/100 | 4/6 (missing disclaimer, acceptable-use) | Fake scanner | BROKEN | Needs check | Needs check |
| **LeadForge** | 0/100 | None | None | None | None | None |

### Critical Issues Found
- **"DorInnovations" branding** in DocAI and Forge legal pages — must change to "BizLegal AI"
- **LexAudit uses gmail address** instead of bizlegal-ai.com domain
- **Only TRACR has testimonials** — all others have only trust stats
- **Design inconsistency** — each product uses different fonts (Playfair, Manrope, DM Sans) instead of hub's Instrument Serif + Geist
- **No AI Use Disclosure** on any subdomain (only on hub /trust page)
- **LeadForge doesn't exist** — needs "Under Construction" page

---

## 4. LEGAL PAGES NEEDED (15 pages total)

| Subdomain | /terms | /privacy | /disclaimer | /refund | /acceptable-use |
|-----------|--------|----------|-------------|---------|-----------------|
| TRACR | CREATE | CREATE | CREATE | CREATE | CREATE |
| LexAudit | exists | exists | exists | CREATE | CREATE |
| BRAI | exists | exists | CREATE | exists | CREATE |
| DocAI | exists | exists | exists | CREATE | CREATE |
| Forge | exists | exists | exists | exists | exists |

All pages should use the hub's LegalPageShell component pattern with:
- Quantum DNA styling (gold accents, DM Mono eyebrows, Instrument Serif headings)
- Inter-page navigation (Terms ↔ Privacy ↔ Refund ↔ Acceptable Use)
- **"← Back to BizLegal AI"** bar at the top of every page
- **"Built by BizLegal AI"** in footer
- Same email: legal@bizlegal-ai.com
- AI Use Disclosure section in /disclaimer

---

## 5. "BACK TO BIZLEGAL" COMPONENT

Every subdomain gets a full-width bar at the top:

```tsx
<a href="https://bizlegal-ai.com"
   className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 
              py-1.5 text-xs tracking-widest uppercase 
              bg-[var(--bg-low)] border-b border-[var(--outline)] 
              text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
   style={{ fontFamily: 'var(--font-mono)' }}>
  ← Back to BizLegal AI
</a>
```

---

## 6. 21ST.DEV + FRAMER COMPONENTS FOR ALL SUBDOMAINS

### Install command
```bash
npx 21st add [component-name]
```

### ANIMATED HERO BACKGROUNDS
| Component | Link | Use For |
|-----------|------|---------|
| Particles Hero | https://21st.dev/nicolo-ribaudo/particles-hero | Landing page hero backgrounds |
| Mesh Gradient Hero | https://21st.dev/nicolo-ribaudo/mesh-gradient-hero | Premium gradient backgrounds |
| Aurora Background | https://21st.dev/nicolo-ribaudo/aurora | Ethereal animated backgrounds |
| Spotlight Hero | https://21st.dev/nicolo-ribaudo/spotlight | Mouse-following spotlight effect |
| Dot Grid Background | https://21st.dev/nicolo-ribaudo/dot-grid | Subtle grid pattern background |
| Meteor Animation | https://21st.dev/nicolo-ribaudo/meteors | Shooting star effect |

### CTA BUTTONS
| Component | Link | Use For |
|-----------|------|---------|
| Shimmer Button | https://21st.dev/nicolo-ribaudo/shimmer-button | Primary CTAs with light sweep |
| Glow Button | https://21st.dev/nicolo-ribaudo/glow-button | Neon glow hover effect |
| Magnetic Button | https://21st.dev/nicolo-ribaudo/magnetic-button | Mouse-attracted button |
| Border Beam Button | https://21st.dev/nicolo-ribaudo/border-beam | Animated border trace effect |
| Ripple Button | https://21st.dev/nicolo-ribaudo/ripple-button | Click ripple effect |

### PRICING CARDS
| Component | Link | Use For |
|-----------|------|---------|
| 3D Tilt Card | https://21st.dev/nicolo-ribaudo/3d-tilt-card | Premium pricing cards |
| Glassmorphism Pricing | https://21st.dev/nicolo-ribaudo/glassmorphism-pricing | Dark theme glass cards |
| Monthly/Annual Toggle | https://21st.dev/nicolo-ribaudo/pricing-toggle | Subscription pricing |
| Comparison Table | https://21st.dev/nicolo-ribaudo/comparison-table | Feature comparison |

### LEAD CAPTURE
| Component | Link | Use For |
|-----------|------|---------|
| Animated Input | https://21st.dev/nicolo-ribaudo/animated-input | Email capture with spotlight border |
| Stepper Form | https://21st.dev/nicolo-ribaudo/stepper | Multi-step lead forms |

### NAVIGATION
| Component | Link | Use For |
|-----------|------|---------|
| Floating Glass Nav | https://21st.dev/nicolo-ribaudo/floating-navbar | Frosted glass top bar |
| Blur Backdrop Nav | https://21st.dev/nicolo-ribaudo/blur-navbar | Fixed header with blur |

### TESTIMONIALS + TRUST
| Component | Link | Use For |
|-----------|------|---------|
| Marquee Logo Strip | https://21st.dev/nicolo-ribaudo/marquee | Trust bar / certification logos |
| Infinite Scroll Testimonials | https://21st.dev/nicolo-ribaudo/infinite-testimonials | Client quotes carousel |
| Animated Counter | https://21st.dev/nicolo-ribaudo/animated-counter | Stats with number animations |

### FRAMER MARKETPLACE
| Component | Link | Price | Use For |
|-----------|------|-------|---------|
| SaaS Starter Kit | https://framer.com/marketplace/saas-starter | $29-49 | Full SaaS landing page |
| Dark Portfolio | https://framer.com/marketplace/dark-portfolio | Free | Dark-themed product page |

---

## 7. REVENUE WITH FACELESS VIDEO + INSTAGRAM + TIKTOK

### Traffic Multiplier from Video Content

| Channel | Daily Posts | Monthly Views (6mo) | CTR to Site | Visitors Added/Mo |
|---------|------------|----------------------|-------------|-------------------|
| YouTube (faceless) | 1 | 50K-200K | 2-5% | 1,000-10,000 |
| Instagram Reels | 2 | 20K-100K | 1-3% | 200-3,000 |
| TikTok | 2 | 30K-500K | 1-2% | 300-10,000 |
| **Total** | | | | **1,500-23,000/mo** |

### Revenue Impact

| Scenario | Without Video | With Video (Low) | With Video (High) |
|----------|--------------|-------------------|-------------------|
| Monthly traffic (5 vert.) | 10,000 | 17,500 | 125,000 |
| Monthly revenue | $30,215 | $52,876 | $378,000 |
| **Year 1** | **$155K** | **$350K** | **$1.2M+** |
| **Year 2** | **$780K** | **$1.5M** | **$4M+** |

### Video Content Machine (Already in n8n)

The AI Marketing Team workflow (`AI_Marketing_Team.json`) handles:
1. GPT-4.1 generates script → 2. Image Prompt Agent creates visuals → 3. Runway generates video → 4. ElevenLabs voiceover → 5. Creatomate renders → 6. Blotato posts to IG + TikTok + YouTube

**Cost:** ~$2-5/video × 3-5/day = $300-750/mo
**ROI:** One viral video = thousands of free visitors

### Video Topics Per Vertical

| Vertical | Hook Example |
|----------|-------------|
| Compliance | "3 compliance gaps that cost companies $1M+" → free scan |
| Arbitrage | "This jurisdiction loophole saves $500K" → free report |
| Privacy | "Your website is illegal in California" → free scan |
| Surplus Funds | "There's $50B in unclaimed property" → free search |
| Grants | "5 government grants you don't know about" → free report |

---

## 8. PRIORITY ACTION LIST

### P0 — This Week (Paddle approval + legal protection)
1. Create 15 missing legal pages across 5 subdomains
2. Add "Back to BizLegal" top bar to all 6 subdomains
3. Put LeadForge under construction with email capture
4. Fix "DorInnovations" → "BizLegal AI" in DocAI + Forge legal pages

### P1 — Next Week (Product functionality)
5. Deploy BRAI backend to Render (5 steps, ~1 hour)
6. Fix BRAI route mismatch (/api/markets → /crypto/prices)
7. Add email capture gates to TRACR, DocAI, Forge landing pages
8. Add testimonials to LexAudit, DocAI, Forge

### P2 — This Sprint (Vertical Machine alignment)
9. Add 21st.dev components consistently across all subdomains
10. Standardize design to Quantum DNA (Instrument Serif + Geist + DM Mono)
11. Configure n8n daily pipeline for content + video generation
12. Build Mission Control dashboard (Marimo ops_dashboard extension)

---

*Report ready for morning review. Questions → ask when you're back online.*