# Workflow 04 — Page Builder

**Trigger**: Manual (Claude Code session) or from 08_strategy_brain  
**Owner**: Claude Code (Sonnet)  
**Agent**: Claude Code  
**Output**: Committed Next.js page(s) pushed to dev branch

---

## Purpose

Build, update, and maintain all Next.js pages for bizlegal-ai.com and product subdomains. Every page must follow the Quantum DNA design system exactly. This workflow governs when and how pages are built.

---

## Pre-Build Checklist (run BEFORE writing any code)

```
□ Read CLAUDE.md → confirm design tokens and component patterns
□ Read the relevant workflow .md (what does this page do?)
□ Check existing components → reuse before creating new
□ Confirm product data-product accent color
□ Define page sections and their content order
□ Identify data sources (Supabase table / static data / API)
```

---

## Page Types & Templates

### 1. Hub Page (bizlegal-ai.com)
- File: `app/page.tsx`
- Sections: Hero (mesh) → Trust band → Products grid → Intelligence feed → Metrics → Trust section → CTA
- Special: `'use client'` for counter animations

### 2. Product Landing Page
- File: `app/[product]/page.tsx`
- Sections: Hero (data-product accent) → Features → Pricing → How it works → CTA
- Must include: `data-product="{product}"` on root wrapper
- Links to: `/api/products/[product]/create-order`

### 3. Intelligence Article
- File: `app/posts/[slug]/page.tsx`
- Data from: Supabase `posts` table or MDX file
- Must include: Risk score badge, category tag, product CTAs

### 4. Legal Page
- File: `app/[legal-route]/page.tsx`
- Pattern: DM Mono eyebrow → Instrument Serif H1 → sections with H2 → nav links
- No SiteHeader/SiteFooter wrappers (uses global layout)

### 5. Tool Page
- File: `app/tools/[slug]/page.tsx`
- Must include: CommandCenterInput or form, result display, product upsell

---

## Build Standards

### Component Creation Rules
```
REUSE first:
  glass-card       → always for card containers
  quantum-h1/h2/h3 → always for headlines
  eyebrow-pill     → always for section tags
  quantum-section  → always for section wrappers
  quantum-container → always for max-width containers
  btn-quantum      → primary CTA buttons
  btn-ghost-quantum → secondary CTA buttons
  quantum-label    → DM Mono uppercase section labels

CREATE new component only if:
  - Used in 3+ places, OR
  - Contains complex logic that belongs in a component
```

### Animation Rules
```
Scroll reveal → <Reveal> component (framer-motion whileInView)
Hero entry    → motion.div animate={{ opacity:1, y:0 }} on mount
Counters      → <Counter end={N} suffix="+" /> client component
Hover states  → CSS transitions on glass-card, btn-quantum
No GSAP       → use framer-motion only (lighter, SSR compatible)
```

### Data Fetching Rules
```
Static data   → Define in page.tsx as const arrays
Supabase data → Server component fetch (no useEffect on server)
Client data   → SWR or React state with loading skeleton
API routes    → /api/* for mutations, webhooks, payments
```

---

## Deployment

```bash
# After building:
git add app/[changed-files]
git commit -m "feat: [page name] — [what it does]"
git push -u origin claude/automate-github-setup-8Yd6U
# Vercel auto-deploys preview → check URL
```

---

## Quality Gates

Before marking a page complete:
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] Mobile responsive (check at 375px width)
- [ ] All links resolve (no 404s)
- [ ] Correct `data-product` attribute on product pages
- [ ] Quantum DNA applied (dark bg, glass cards, correct fonts)
- [ ] Page title and meta description set via `export const metadata`

---

## Learnings Log

| Date | Learning |
|---|---|
| — | Baseline |
