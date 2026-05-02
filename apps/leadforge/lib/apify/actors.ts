export type ActorVertical =
  | "commercial_lawyer"
  | "employment_lawyer"
  | "real_estate_agent";

export interface ActorDefinition {
  id: string;
  vertical: ActorVertical;
  name: string;
  shortLabel: string;
  description: string;
  sourceHighlights: string[];
  cadence: string;
  funnelUse: string;
}

export const APIFY_ACTORS: ActorDefinition[] = [
  {
    id: "leadforge-commercial-lawyer",
    vertical: "commercial_lawyer",
    name: "Commercial Litigation Sweep",
    shortLabel: "Commercial",
    description:
      "Maps contract disputes, UCC liens, and commercial filings into high-intent legal opportunities.",
    sourceHighlights: [
      "NY eCourts + PACER",
      "California county civil portals",
      "Texas Re:SearchTX",
    ],
    cadence: "Every 24 hours",
    funnelUse: "Turns public disputes into preview deals on the LeadForge landing funnel.",
  },
  {
    id: "leadforge-employment-lawyer",
    vertical: "employment_lawyer",
    name: "Employment Claims Monitor",
    shortLabel: "Employment",
    description:
      "Surfaces EEOC-style signals, wage-hour filings, and labor board activity for firms hunting active claims.",
    sourceHighlights: [
      "State labor board dockets",
      "Federal district court filings",
      "Wrongful termination signal clusters",
    ],
    cadence: "Twice daily",
    funnelUse: "Feeds scored legal opportunities into the main funnel and report previews.",
  },
  {
    id: "leadforge-real-estate-agent",
    vertical: "real_estate_agent",
    name: "Property Distress Radar",
    shortLabel: "Real Estate",
    description:
      "Matches probate, pre-foreclosure, and seller pressure signals with outreach-ready property opportunities.",
    sourceHighlights: [
      "Recorder notices",
      "Probate filings",
      "MLS expiration deltas",
    ],
    cadence: "Rolling sync",
    funnelUse: "Converts record-based signals into deal previews and upsell handoffs.",
  },
];

export const PIPEFORGE_FUNDS_SIGNALS = [
  {
    title: "Tax sale overages",
    detail: "County treasurer overages that often sit unclaimed until heirs or claimants are contacted.",
  },
  {
    title: "Escrow balances",
    detail: "Dormant utility, title, and closing balances that can be surfaced with minimal identity proof.",
  },
  {
    title: "Probate-linked refunds",
    detail: "Pipeforge focuses on estates, surplus proceeds, and dormant checks tied to property events.",
  },
];
