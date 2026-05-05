import { HomeExperience } from "@/components/home-experience";
import { DocAILandingPreExperience } from "@/components/landing-pre-experience";
import { StickyLeadBadge } from "@bizlegal/themes";

/**
 * DocAI homepage — Phase AA Subdomain Design Pass (rebrand-only).
 *
 * Keeps the existing <HomeExperience /> Three.js scan flow intact. Adds:
 *   - <DocAILandingPreExperience /> brief above (CTA → /decision-tree)
 *   - <StickyLeadBadge /> bottom-right (50% scroll)
 *
 * Theme: royal-dark primary, royal-light alternate. Wired in layout.tsx.
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
      <StickyLeadBadge href="/decision-tree" label="Run free DocAI privacy screen →" />
    </>
  );
}
