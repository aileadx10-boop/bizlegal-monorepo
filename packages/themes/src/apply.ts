/**
 * applyTheme + storage helpers + FOUC-prevention inline script.
 *
 * The inline script runs synchronously in `<head>` before any
 * stylesheet, reads localStorage, and writes the chosen theme's CSS
 * vars to the document root before paint. Same pattern Moses already
 * uses for the existing `bl-theme` key — generalized here.
 */

import { THEMES, type ThemeId, type ThemeSpec } from './themes'

/**
 * Apply theme — write CSS custom properties to the target element's
 * inline `style` ONLY. We deliberately do NOT set `data-theme` /
 * `data-theme-mode` here, because some subdomains (LexAudit, BRAI,
 * DocAI, TRACR) already use a `data-theme=light|dark` system in their
 * existing theme-v2.css. Setting our own attribute would clobber theirs.
 *
 * Instead we use `data-bl-theme-v2` (parallel, non-colliding) for
 * callers that need to inspect the active landing theme from
 * CSS or DevTools.
 */
export function applyTheme(id: ThemeId, root: HTMLElement | null = null): void {
  if (typeof document === 'undefined') return
  const target = root ?? document.documentElement
  const spec = THEMES[id]
  if (!spec) return
  for (const [k, v] of Object.entries(spec.vars)) {
    target.style.setProperty(k, v)
  }
  target.style.setProperty('--lex-display', spec.displayFamily)
  target.style.setProperty('--lex-body', spec.bodyFamily)
  target.setAttribute('data-bl-theme-v2', id)
  target.setAttribute('data-bl-theme-v2-mode', spec.mode)
}

export function getStoredTheme(key: string): ThemeId | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const v = localStorage.getItem(key)
    if (v && v in THEMES) return v as ThemeId
  } catch {
    /* localStorage may be blocked in strict iframes / privacy modes */
  }
  return null
}

export function setStoredTheme(key: string, id: ThemeId): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(key, id)
  } catch {
    /* ignore */
  }
}

/**
 * Returns the inline-script body to run inside <head> ahead of any
 * stylesheet to prevent flash-of-unstyled-content on first paint.
 *
 * The script:
 *   1. Reads localStorage[storageKey]
 *   2. Validates against the {primary, alternate} pair
 *   3. Falls back to primary when missing/invalid
 *   4. Writes the theme's CSS vars to documentElement.style
 *   5. Sets data-theme + data-theme-mode for hydration matching
 *
 * Self-contained — does not import any module so the script can be
 * inlined as a single <script> tag.
 */
export function themeFOUCScript(args: {
  primary: ThemeId
  alternate: ThemeId | null
  storageKey: string
}): string {
  const { primary, alternate, storageKey } = args
  const allowed = alternate ? [primary, alternate] : [primary]
  // Whitelist the relevant themes' var bundles inline so no fetch/import
  // is required for the synchronous head-script to run.
  const bundle: Record<string, ThemeSpec> = {}
  for (const id of allowed) bundle[id] = THEMES[id]
  // Use single-quoted JSON string so embedding in HTML attribute is safe.
  // The closing </script> sequence cannot appear inside; we encode any
  // accidental occurrence defensively.
  const json = JSON.stringify(bundle).replace(/<\/script/gi, '<\\/script')
  return `(function(){try{
  var THEMES=${json};
  var primary=${JSON.stringify(primary)};
  var alt=${JSON.stringify(alternate ?? '')};
  var key=${JSON.stringify(storageKey)};
  var allowed=alt?[primary,alt]:[primary];
  var stored=null;try{stored=localStorage.getItem(key)}catch(e){}
  var pick=allowed.indexOf(stored)>-1?stored:primary;
  var spec=THEMES[pick];if(!spec)return;
  var root=document.documentElement;
  var vars=spec.vars;
  for(var k in vars){if(Object.prototype.hasOwnProperty.call(vars,k)){root.style.setProperty(k,vars[k])}}
  root.style.setProperty('--lex-display',spec.displayFamily);
  root.style.setProperty('--lex-body',spec.bodyFamily);
  /* parallel attribute so we don't clobber existing data-theme=light|dark systems */
  root.setAttribute('data-bl-theme-v2',pick);
  root.setAttribute('data-bl-theme-v2-mode',spec.mode);
}catch(e){/* never break first paint */}})();`
}
