import { HomeExperience } from "@/components/home-experience";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return <HomeExperience initialTemplateKey={resolvedSearchParams.template} />;
}
