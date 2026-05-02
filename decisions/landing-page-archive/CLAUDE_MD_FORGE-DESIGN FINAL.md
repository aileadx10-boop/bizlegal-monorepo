# claude.md — Forge Compliance Platform

> Drop this file in your VS Code project root before running Claude Code.
> This acts as the system prompt for every Claude Code session.

## Core Rules
- Always invoke the frontend-design skill before writing any front-end code every session, no exceptions
- Use brand tokens from `brand_assets/tokens.css` for all color/font decisions
- Follow Forge brand: Inter 900 headings, Inter 400/500 body, #b91c1c or #1a1aff or #5b21b6 or #1a5c38 accent
- Test all changes on localhost before pushing to GitHub
- Never push API keys, Supabase credentials, PayPal client IDs, or Resend keys

## Design System (Hypersonic Structure)
Replicate this section order exactly:
1. Fixed nav (glass blur, logo + links + CTA)
2. Hero (full-height, tag + h1 + sub + 2 CTAs + social proof cluster)
3. Ticker (auto-scroll regulatory frameworks, pause on hover)
4. Process (01/02/03 numbered steps, large faded numbers)
5. Services Bento (2-col grid, wide cards span full width, mock UI inside)
6. Benefits (3x2 panel grid, icon + title + copy)
7. About (2-col: copy+stats left, credential card right)
8. Plans (3-col pricing, center card "Most Popular" with accent border)
9. Testimonials (4-col grid, stars + quote + avatar)
10. FAQ (accordion, + rotates to x on open)
11. Final CTA (big box with radial glow or accent background)
12. Footer (brand + 4-col links + copyright)

## Screenshot Workflow
After building each section:
1. Use Puppeteer to take screenshots: hero, ticker, process, services, benefits, about, plans, testi, faq, cta, footer
2. Do 2-pass screenshot review and polish
3. Fix visual issues before moving to next section
4. Screenshot folder: temp-screenshots/

## Deployment Rules
- All changes tested on localhost first
- Only push to GitHub when explicitly told: "Push this to GitHub"  
- Target repo: forge repo on BizLegal AI GitHub org
- Vercel project: forge.bizlegal-ai.com
- Never auto-push — wait for explicit approval

## Brand Tokens
```css
/* Swap ONE line to change the entire site theme */
/* V1 Midnight Blue:  --accent: #1a1aff; --bg: #ffffff; */
/* V2 Forest Green:   --accent: #1a5c38; --bg: #faf9f6; */
/* V3 Electric Violet: --accent: #5b21b6; --bg: #f8f7ff; */
/* V4 Crimson:        --accent: #b91c1c; --bg: #f6f6f6; */
/* V0 Dark:           --accent: #c8ff00; --bg: #0d0d0d; */
```

## Content Tokens (real data only — no fake stats)
- Reports delivered: 177+
- Jurisdictions: 4 (US, EU, UAE, Singapore)
- Attorney: Moses Dor, LLB LLM, Israel Bar, DIFC Registered
- Products: BOI $149 · Web Scanner Free · Reg Passport $1,500 · Intel Feed Free
- Penalty: $500/day BOI non-compliance
- Delivery: 24h standard, 12h priority

## Component Sources
- Animations: GSAP 3.12.5 + ScrollTrigger (CDN)
- Icons: Lucide or emoji (no AI image generation)
- Fonts: Inter (weights 400/500/600/700/800/900) via Google Fonts
- Optional serif: Instrument Serif italic for hero h1 accent (V2 only)
- Components: 21st.dev for shaders/backgrounds (disable screenshot loop for animated elements)
