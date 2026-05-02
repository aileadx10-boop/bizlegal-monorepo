type FunnelType = "leadforge" | "pipeforge";

function sanitizeLocation(location: unknown) {
  if (typeof location !== "string") {
    return "";
  }

  return location.trim();
}

function buildLeadforgeDeals(location: string) {
  return [
    {
      id: "deal-001",
      title: `${location} distressed commercial lease dispute`,
      estimatedValue: 184000,
      urgency: "High",
      source: "County civil docket",
      buyerIntent: "Plaintiff counsel already searching for local representation",
    },
    {
      id: "deal-002",
      title: `${location} employment wage-hour class action lead`,
      estimatedValue: 267000,
      urgency: "Medium",
      source: "State labor claim intake",
      buyerIntent: "Multiple employees with matching filing dates",
    },
    {
      id: "deal-003",
      title: `${location} probate seller with pre-listing pressure`,
      estimatedValue: 912000,
      urgency: "High",
      source: "Recorder + probate matching",
      buyerIntent: "Property transfer window closes inside 21 days",
    },
  ];
}

function buildPipeforgeFunds(location: string) {
  return [
    {
      id: "fund-101",
      claimant: `${location} title overage reserve`,
      amount: 24100,
      status: "Open claim window",
      source: "County surplus proceeds bulletin",
    },
    {
      id: "fund-102",
      claimant: `${location} dormant utility escrow`,
      amount: 8600,
      status: "Needs proof-of-address",
      source: "State unclaimed property ledger",
    },
    {
      id: "fund-103",
      claimant: `${location} tax sale refund`,
      amount: 19350,
      status: "Executor outreach recommended",
      source: "Treasurer excess funds report",
    },
  ];
}

export async function POST(req: Request) {
  let body: { location?: unknown; type?: unknown };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const location = sanitizeLocation(body.location);
  const type = body.type as FunnelType | undefined;

  if (!location) {
    return Response.json({ error: "Location is required" }, { status: 400 });
  }

  if (type === "leadforge") {
    return Response.json({
      previewDeals: buildLeadforgeDeals(location),
      lockedCount: 20,
      location,
      reportType: "leadforge",
      generatedAt: new Date().toISOString(),
    });
  }

  if (type === "pipeforge") {
    return Response.json({
      funds: buildPipeforgeFunds(location),
      message: "Potential unclaimed funds detected",
      location,
      reportType: "pipeforge",
      generatedAt: new Date().toISOString(),
    });
  }

  return Response.json({ error: "Unknown funnel type" }, { status: 400 });
}
