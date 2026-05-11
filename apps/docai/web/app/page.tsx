import { HomeExperience } from "@/components/home-experience";
import { DocAILandingPreExperience } from "@/components/landing-pre-experience";
import { DocAIFaq } from "@/components/docai-faq";
import { StickyLeadBadge } from "@bizlegal/themes";

/**
 * DocAI homepage — Daybreak voice (single-theme, light paper + dark ink).
 *
 * Section order (top → bottom):
 *   1. SiteShell nav            (from layout.tsx)
 *   2. DocAILandingPreExperience — hero + 3 role tiles + how-it-works
 *   3. HomeExperience           — #scan upload + #generate templates
 *   4. DocAIFaq                  — 6 user FAQ + trust-strip with all
 *                                  legal-shield + methodology links
 *   5. SiteShell footer         (from layout.tsx — 12 legal links)
 *   6. StickyLeadBadge          (bottom-right at 50% scroll)
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <>
      <DocAILandingPreExperience />
      <HomeExperience initialTemplateKey={resolvedSearchParams.template} />
      <DocAIFaq />
      <StickyLeadBadge href="/decision-tree" label="Run free DocAI privacy screen →" />
    </>
  );
}
