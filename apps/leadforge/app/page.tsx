import { LeadForgeLanding } from "@/components/leadforge/LeadForgeLanding";
import { LeadForgeLandingPreBanner } from "@/components/LandingPreBanner";
import { StickyLeadBadge } from "@bizlegal/themes";

/**
 * LeadForge homepage — Phase AA Subdomain Design Pass (rebrand-only).
 *
 * Keeps the existing <LeadForgeLanding /> intact (vendored component).
 * Adds:
 *   - <LeadForgeLandingPreBanner /> brief above (CTA → /decision-tree)
 *   - <StickyLeadBadge /> bottom-right (50% scroll)
 *
 * Theme: Daybreak only (no toggle). Wired in layout.tsx via FOUC script
 * + ThemeProvider + remapped --lead-* tokens in globals.css.
 */
export default function Page() {
  return (
    <>
      <LeadForgeLandingPreBanner />
      <LeadForgeLanding />
      <StickyLeadBadge href="/decision-tree" label="Run free LeadForge TCPA screen →" />
    </>
  );
}
