# @bizlegal/themes

Single source of truth for the 4 BizLegal-AI subdomain themes (Twilight Violet, Daybreak, Royal Blue Dark, Royal Blue Bright) plus the `<ThemeProvider>` + `<ThemeToggleButton>` + FOUC-prevention inline script + the shared `<StickyLeadBadge>` component + the full-template `<LandingV2>` page used by LexAudit / BRAI / TRACR.

Phase AA Subdomain Design Pass — 2026-05-06.

## Themes

| `ThemeId` | Name | Mode | Used by |
|---|---|---|---|
| `twilight` | Twilight Violet | dark | LexAudit primary |
| `daybreak` | Daybreak | light | LexAudit alternate; LeadForge + Forge primary |
| `royal-dark` | Royal Blue on Black | dark | DocAI / BRAI / TRACR primary |
| `royal-light` | Royal Blue Bright | light | DocAI / BRAI / TRACR alternate (derived; royal-blue brand kept) |

Each theme is a flat record of CSS custom properties (`--ink`, `--brand`, `--paper`, `--hero-bg`, …) applied to `documentElement.style`. Sections + components in `LandingV2` reference these vars; switching themes restyles the page without re-rendering React.

## Install

```jsonc
// apps/<subdomain>/package.json
{
  "dependencies": {
    "@bizlegal/themes": "workspace:*"
  }
}
```

## Use

### Layout (server-rendered)

```tsx
// apps/lexaudit/app/layout.tsx
import { themeFOUCScript, ThemeProvider } from '@bizlegal/themes'

const FOUC = themeFOUCScript({
  primary: 'twilight',
  alternate: 'daybreak',
  storageKey: 'lex-theme',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* FOUC-prevention: synchronous head script applies the persisted
            theme before any stylesheet, so first paint matches user choice. */}
        <script dangerouslySetInnerHTML={{ __html: FOUC }} />
      </head>
      <body>
        <ThemeProvider primary="twilight" alternate="daybreak" storageKey="lex-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Page (client component)

```tsx
'use client'
import { LandingV2, type LandingV2Content, StickyLeadBadge } from '@bizlegal/themes'

const content: LandingV2Content = { /* per-subdomain copy + audits + tiers */ }

async function onLeadSubmit({ email, name, scenario, source }: { email: string; name?: string; scenario?: string; source: string }) {
  const res = await fetch('/api/decision-tree/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email,
      verdict: 'standard_review',          // placeholder; per-vertical valid value
      answers: { name, scenario },
    }),
  })
  return { ok: res.ok }
}

export default function Page() {
  return (
    <>
      <LandingV2 content={content} onLeadSubmit={onLeadSubmit} />
      <StickyLeadBadge href="/decision-tree" label="Run free 60-second screen →" />
    </>
  )
}
```

### Toggle button (anywhere)

```tsx
import { ThemeToggleButton } from '@bizlegal/themes'

// Renders `null` when the active provider has no `alternate`.
<ThemeToggleButton />
```

## FOUC prevention

`themeFOUCScript({ primary, alternate, storageKey })` returns the body of an inline `<script>` tag. Run synchronously in `<head>` ahead of any stylesheet. The script:

1. Reads `localStorage[storageKey]`.
2. Validates against the `{primary, alternate}` pair.
3. Falls back to `primary` when missing or invalid.
4. Writes the theme's CSS vars to `documentElement.style.setProperty`.
5. Sets `data-theme` + `data-theme-mode` on `<html>` so React hydration matches.

The bundled vars (only the relevant theme records) are inlined in the script string so no fetch/import is required at first paint.

## Lead-magnet placement

The shared `<StickyLeadBadge>` is the recommended bottom-right pill that slides in after 50% scroll. It's dismissible (24h localStorage). Drop it once at the bottom of every homepage:

```tsx
<StickyLeadBadge href="/decision-tree" />
```

## Reduced motion

All animations in `LandingV2` and `StickyLeadBadge` honor `@media (prefers-reduced-motion: reduce)` — the shared CSS bundle in `lexCSSv2` includes the fallback rules. No extra config needed.

## Contributing

- Theme values are CSS custom properties only; no Tailwind tokens or hardcoded colors in component markup. New variants = new entry in `themes.ts`.
- The full-template `<LandingV2>` is used by 3 of 6 subdomains (LexAudit, BRAI, TRACR). DocAI / LeadForge / Forge keep their existing homepages and get rebrand-only treatment via the same theme vars + `<StickyLeadBadge>`.
- Do not duplicate theme values into per-app stylesheets. If a subdomain needs a tweak, override the var locally; don't fork the theme record.
