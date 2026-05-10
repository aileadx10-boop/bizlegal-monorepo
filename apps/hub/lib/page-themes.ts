/**
 * Hub apex page-theme alternation.
 *
 * Every public route on bizlegal-ai.com defaults to one of two LIGHT
 * themes — daybreak (warm cream paper) or ultraviolet (pale lavender
 * paper). Both keep the brand contrast contract: body copy is ALWAYS
 * darker than its background. The site never goes dark on apex.
 *
 * Page assignment is deterministic per route (same path → same theme
 * across reloads, important for SEO + repeat-visitor recognition):
 *
 *   1. Explicit override (PAGE_THEME_OVERRIDES) wins for marquee
 *      surfaces where a specific tone is part of the brief
 *      (e.g. /contact = ultraviolet for sleek conversion).
 *   2. Otherwise hash the pathname; even hash → daybreak, odd → ultraviolet.
 *      Roughly 50/50 split across the long tail without a hand-curated map.
 *
 * User toggle preference (localStorage[bizlegal-theme]) trumps the
 * page default — once the user picks a side, it sticks.
 */

export type HubPageTheme = 'daybreak' | 'ultraviolet'

/**
 * Marquee-route overrides. Editorial calls only — high-traffic surfaces
 * where the theme tone is part of the brand voice and shouldn't be left
 * to a hash. Lowercase paths, no trailing slash (matches normaliseHubPath
 * output).
 */
const PAGE_THEME_OVERRIDES: Readonly<Record<string, HubPageTheme>> = {
  // Top-of-funnel / brand-warm
  '/': 'daybreak',
  '/about': 'daybreak',
  '/trust': 'daybreak',
  '/snapshot': 'daybreak',
  '/realestate': 'daybreak',

  // Conversion / sleek
  '/contact': 'ultraviolet',
  '/pricing': 'ultraviolet',
  '/risk-engine': 'ultraviolet',
  '/agents': 'ultraviolet',

  // Reference / methodology — ultraviolet leans technical
  '/methodology': 'ultraviolet',
  '/methodology-library': 'ultraviolet',
  '/regulations': 'ultraviolet',
  '/data-sources': 'ultraviolet',

  // Subdomain-redirect landings (they immediately bounce to subdomains
  // anyway, but keep the apex preview branded warm)
  '/tracr': 'daybreak',
  '/brai': 'daybreak',
  '/lexaudit': 'daybreak',
  '/docai': 'daybreak',
  '/forge': 'daybreak',
  '/leadforge': 'daybreak',

  // Flow terminators
  '/contact/thank-you': 'ultraviolet',

  // Legal — keep daybreak (warm, approachable, contrast-clear)
  '/terms': 'daybreak',
  '/privacy': 'daybreak',
  '/refund': 'daybreak',
  '/disclaimer': 'daybreak',
  '/acceptable-use': 'daybreak',
  '/accessibility': 'daybreak',
}

/** Normalise a pathname to the form used as a map key. */
function normaliseHubPath(pathname: string): string {
  if (!pathname) return '/'
  // Strip query / hash defensively (window.location.pathname doesn't
  // include them, but be paranoid for SSR contexts).
  const noHash = pathname.split('#')[0]
  const noQuery = noHash.split('?')[0]
  // Drop trailing slash except for root.
  const trimmed = noQuery.length > 1 && noQuery.endsWith('/') ? noQuery.slice(0, -1) : noQuery
  return trimmed.toLowerCase() || '/'
}

/**
 * Hash a string to a small integer. Implements djb2-style hash —
 * deterministic, distribution sufficient for a 50/50 binary classifier.
 * Inlined (not imported from a hash lib) so the FOUC script can embed
 * the same logic without a runtime dependency.
 */
function hashPath(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i)
  }
  return h >>> 0 // unsigned
}

/**
 * Resolve a pathname to its default theme. Same path → same theme,
 * always. Used both server-side (Metadata) and client-side (FOUC).
 *
 * Note: this does NOT consider user preference — that's layered on top
 * by the FOUC script. This is purely the page-default.
 */
export function getPageTheme(pathname: string): HubPageTheme {
  const path = normaliseHubPath(pathname)
  const override = PAGE_THEME_OVERRIDES[path]
  if (override) return override
  // Long-tail: hash + parity. Same path → same theme deterministically.
  return hashPath(path) % 2 === 0 ? 'daybreak' : 'ultraviolet'
}

/**
 * Inline FOUC script body. Returns a JS string suitable for
 * `<script dangerouslySetInnerHTML={{ __html: pageThemeFOUCScript() }} />`.
 *
 * Runs synchronously in <head>:
 *   1. Reads localStorage[bizlegal-theme] for explicit user choice.
 *   2. If set + valid, applies that.
 *   3. Otherwise computes the page-default from window.location.pathname
 *      using the same djb2 hash + override map as the server-side
 *      getPageTheme().
 *   4. Sets <html data-bl-theme-v2="daybreak"|"ultraviolet"> before
 *      first paint.
 *
 * Embedded (not imported) so the script has no runtime deps. The
 * override list is duplicated as a JSON literal — sync manually if
 * PAGE_THEME_OVERRIDES changes. Keep both lists short or move to a
 * codegen step if drift becomes a maintenance burden.
 */
export function pageThemeFOUCScript(storageKey = 'bizlegal-theme'): string {
  const overridesJson = JSON.stringify(PAGE_THEME_OVERRIDES)
  return [
    '(function(){try{',
    `var O=${overridesJson};`,
    'function H(s){var h=5381;for(var i=0;i<s.length;i++){h=((h*33)^s.charCodeAt(i));}return h>>>0;}',
    'var p=(location.pathname||"/").split("#")[0].split("?")[0];',
    'p=(p.length>1&&p.charAt(p.length-1)==="/")?p.slice(0,-1):p;',
    'p=p.toLowerCase()||"/";',
    'var pt=O[p]||((H(p)%2===0)?"daybreak":"ultraviolet");',
    `var u=localStorage.getItem(${JSON.stringify(storageKey)});`,
    'var f=(u==="daybreak"||u==="ultraviolet")?u:pt;',
    'document.documentElement.setAttribute("data-bl-theme-v2",f);',
    'document.documentElement.setAttribute("data-page-theme",pt);',
    '}catch(e){document.documentElement.setAttribute("data-bl-theme-v2","daybreak");}})();',
  ].join('')
}
