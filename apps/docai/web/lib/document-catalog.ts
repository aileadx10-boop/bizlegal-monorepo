export type VerticalKey = "realestate" | "fintech" | "smb" | "ecommerce";

export type DocumentField = {
  id: string;
  label: string;
  ph: string;
};

export type DocumentTemplate = {
  key: string;
  label: string;
  price: number;
  desc: string;
  vertical: VerticalKey;
  fields: DocumentField[];
};

export type BundleOffer = {
  label: string;
  price: number;
  keys: string[];
};

export const VERTICALS: Array<{
  key: VerticalKey;
  label: string;
  icon: string;
  marketLabel: string;
}> = [
  { key: "realestate", label: "Real Estate", icon: "RE", marketLabel: "Deals, syndications, acquisitions" },
  { key: "fintech", label: "FinTech", icon: "FT", marketLabel: "Payments, lending, data licenses" },
  { key: "smb", label: "Small Business", icon: "SMB", marketLabel: "Hiring, services, ownership" },
  { key: "ecommerce", label: "eCommerce", icon: "EC", marketLabel: "Supply chains, affiliates, 3PL" },
];

const realestate: DocumentTemplate[] = [
  {
    key: "jv",
    label: "Joint Venture Agreement",
    price: 79,
    desc: "Co-investment structure between two parties for a real estate deal.",
    vertical: "realestate",
    fields: [
      { id: "party_a", label: "Investor / Developer Name", ph: "ABC Capital LLC" },
      { id: "party_b", label: "Co-Investor / Operator Name", ph: "XYZ Properties Inc" },
      { id: "property", label: "Property Address or Description", ph: "123 Main St, New York" },
      { id: "deal_value", label: "Estimated Deal Value ($)", ph: "5,000,000" },
      { id: "split", label: "Profit Split", ph: "70/30" },
    ],
  },
  {
    key: "nda",
    label: "Non-Circumvention NDA",
    price: 49,
    desc: "Protect your deal sources and prevent being cut out.",
    vertical: "realestate",
    fields: [
      { id: "party_a", label: "Disclosing Party", ph: "Your Name / Company" },
      { id: "party_b", label: "Receiving Party", ph: "Counterparty Name" },
      { id: "deal_desc", label: "Deal Description", ph: "Commercial property acquisition" },
      { id: "term_yrs", label: "NDA Duration (years)", ph: "3" },
    ],
  },
  {
    key: "loi",
    label: "Letter of Intent",
    price: 49,
    desc: "Non-binding LOI to initiate a property acquisition.",
    vertical: "realestate",
    fields: [
      { id: "buyer", label: "Buyer Name / Entity", ph: "ABC Capital LLC" },
      { id: "seller", label: "Seller Name / Entity", ph: "Property Owner LLC" },
      { id: "property", label: "Property Address", ph: "456 Park Ave, NY" },
      { id: "price", label: "Offered Purchase Price ($)", ph: "2,500,000" },
      { id: "due_dilig", label: "Due Diligence Period (days)", ph: "30" },
    ],
  },
  {
    key: "commission",
    label: "Commission Protection",
    price: 49,
    desc: "Lock in your broker or finder fee before introducing a deal.",
    vertical: "realestate",
    fields: [
      { id: "broker", label: "Broker / Finder Name", ph: "John Smith" },
      { id: "client", label: "Client / Principal", ph: "Buyer Entity LLC" },
      { id: "property", label: "Property / Deal", ph: "Commercial building, Brooklyn" },
      { id: "commission", label: "Commission Rate", ph: "2% of purchase price" },
    ],
  },
  {
    key: "capital_call",
    label: "Capital Call Agreement",
    price: 69,
    desc: "Define capital contribution obligations for your fund.",
    vertical: "realestate",
    fields: [
      { id: "fund", label: "Fund / Entity Name", ph: "Main Street RE Fund I LLC" },
      { id: "gp", label: "General Partner", ph: "GP Management LLC" },
      { id: "lp", label: "Limited Partner(s)", ph: "Investor A, Investor B" },
      { id: "commitment", label: "Total LP Commitment ($)", ph: "10,000,000" },
      { id: "notice", label: "Call Notice Period (days)", ph: "10" },
    ],
  },
  {
    key: "property_mgmt",
    label: "Property Management",
    price: 59,
    desc: "Engage a property manager with defined scope and fees.",
    vertical: "realestate",
    fields: [
      { id: "owner", label: "Property Owner", ph: "Owner LLC" },
      { id: "manager", label: "Property Manager", ph: "Management Co LLC" },
      { id: "property", label: "Property Address", ph: "789 Broadway, NY" },
      { id: "mgmt_fee", label: "Management Fee", ph: "8% of gross rents" },
      { id: "term", label: "Agreement Term", ph: "1 year, auto-renew" },
    ],
  },
  {
    key: "subscription",
    label: "Investor Subscription",
    price: 79,
    desc: "Onboard investors into a fund or syndication.",
    vertical: "realestate",
    fields: [
      { id: "fund", label: "Fund / Issuer Name", ph: "RE Opportunity Fund LLC" },
      { id: "investor", label: "Investor Name", ph: "John & Jane Smith" },
      { id: "amount", label: "Subscription Amount ($)", ph: "250,000" },
      { id: "class", label: "Unit / Interest Class", ph: "Class A Preferred" },
    ],
  },
  {
    key: "guarantee",
    label: "Personal Guarantee",
    price: 49,
    desc: "Personal guarantee backing an entity obligation.",
    vertical: "realestate",
    fields: [
      { id: "guarantor", label: "Guarantor (Individual)", ph: "John Smith" },
      { id: "borrower", label: "Primary Obligor (Entity)", ph: "Smith RE LLC" },
      { id: "lender", label: "Beneficiary / Lender", ph: "First National Bank" },
      { id: "obligation", label: "Guaranteed Obligation", ph: "Commercial loan of $1,500,000" },
    ],
  },
];

const fintech: DocumentTemplate[] = [
  {
    key: "ft_payment",
    label: "Payment Processing Agreement",
    price: 79,
    desc: "PSP to merchant contract covering fees, chargebacks, and PCI compliance.",
    vertical: "fintech",
    fields: [
      { id: "psp", label: "Payment Service Provider", ph: "Stripe / Adyen / PSP Name" },
      { id: "merchant", label: "Merchant Name", ph: "ACME Corp" },
      { id: "tx_fee", label: "Transaction Fee Rate", ph: "2.9% + $0.30" },
      { id: "reserve", label: "Rolling Reserve %", ph: "5%" },
    ],
  },
  {
    key: "ft_mca",
    label: "Merchant Cash Advance",
    price: 89,
    desc: "Purchase of future receivables with factor-rate structure.",
    vertical: "fintech",
    fields: [
      { id: "funder", label: "Funder", ph: "Capital Now LLC" },
      { id: "merchant", label: "Merchant", ph: "Restaurant Group LLC" },
      { id: "advance", label: "Advance Amount ($)", ph: "50,000" },
      { id: "factor", label: "Factor Rate", ph: "1.35x" },
    ],
  },
  {
    key: "ft_loan",
    label: "Commercial Loan Agreement",
    price: 89,
    desc: "Fixed-term business loan with amortization schedule and covenants.",
    vertical: "fintech",
    fields: [
      { id: "lender", label: "Lender", ph: "Community Bank" },
      { id: "borrower", label: "Borrower", ph: "Tech Startup LLC" },
      { id: "amount", label: "Loan Amount ($)", ph: "500,000" },
      { id: "rate", label: "Interest Rate %", ph: "8.5%" },
    ],
  },
  {
    key: "ft_api",
    label: "Data Sharing & API License",
    price: 69,
    desc: "Governs API access, data rights, rate limits, and security obligations.",
    vertical: "fintech",
    fields: [
      { id: "provider", label: "Data Provider", ph: "DataCo Inc" },
      { id: "recipient", label: "Data Recipient", ph: "Analytics LLC" },
      { id: "use", label: "Permitted Use", ph: "Credit scoring model" },
      { id: "rate_limit", label: "API Rate Limit", ph: "1000 calls/min" },
    ],
  },
  {
    key: "ft_whitelabel",
    label: "White Label FinTech Agreement",
    price: 99,
    desc: "License to rebrand and resell a fintech platform in a defined territory.",
    vertical: "fintech",
    fields: [
      { id: "provider", label: "Platform Provider", ph: "PayTech Solutions" },
      { id: "partner", label: "White Label Partner", ph: "Regional Bank" },
      { id: "territory", label: "Territory", ph: "Southeast US" },
      { id: "split", label: "Revenue Split", ph: "70/30" },
    ],
  },
];

const smb: DocumentTemplate[] = [
  {
    key: "smb_partner",
    label: "Business Partnership Agreement",
    price: 79,
    desc: "Ownership split, profit distribution, decision-making, and buyout terms.",
    vertical: "smb",
    fields: [
      { id: "partner_a", label: "Partner A", ph: "John Smith" },
      { id: "partner_b", label: "Partner B", ph: "Jane Doe" },
      { id: "biz_name", label: "Business Name", ph: "Smith & Doe Consulting" },
      { id: "split_a", label: "Partner A Ownership %", ph: "60%" },
      { id: "split_b", label: "Partner B Ownership %", ph: "40%" },
    ],
  },
  {
    key: "smb_contractor",
    label: "Independent Contractor Agreement",
    price: 49,
    desc: "Scope, payment, IP assignment, and 1099 status.",
    vertical: "smb",
    fields: [
      { id: "client", label: "Client / Company", ph: "ACME Corp" },
      { id: "contractor", label: "Contractor", ph: "Freelance Dev LLC" },
      { id: "services", label: "Services Description", ph: "Web development" },
      { id: "rate", label: "Rate", ph: "$150/hr or flat $10,000" },
      { id: "term", label: "Project Term", ph: "3 months" },
    ],
  },
  {
    key: "smb_lease",
    label: "Commercial Lease",
    price: 79,
    desc: "Office or retail lease with TI allowance, escalation, and subletting rights.",
    vertical: "smb",
    fields: [
      { id: "landlord", label: "Landlord", ph: "Building Owner LLC" },
      { id: "tenant", label: "Tenant", ph: "Your Company" },
      { id: "address", label: "Premises Address", ph: "123 Main St, Suite 200" },
      { id: "rent", label: "Monthly Rent ($)", ph: "5,000" },
      { id: "term", label: "Lease Term", ph: "3 years" },
    ],
  },
  {
    key: "smb_service",
    label: "B2B Service Agreement",
    price: 49,
    desc: "Scope of work, milestones, payment, IP, warranty, and liability limits.",
    vertical: "smb",
    fields: [
      { id: "provider", label: "Service Provider", ph: "Agency LLC" },
      { id: "client", label: "Client", ph: "Corp Inc" },
      { id: "services", label: "Services", ph: "Brand redesign + website" },
      { id: "fee", label: "Total Fee ($)", ph: "25,000" },
    ],
  },
  {
    key: "smb_shareholders",
    label: "Shareholders Agreement",
    price: 99,
    desc: "ROFR, drag-along, tag-along, board composition, and deadlock resolution.",
    vertical: "smb",
    fields: [
      { id: "company", label: "Company Name", ph: "Startup Inc" },
      { id: "shareholder_a", label: "Shareholder A", ph: "Founder 1" },
      { id: "pct_a", label: "Shareholder A %", ph: "51%" },
      { id: "shareholder_b", label: "Shareholder B", ph: "Investor LLC" },
    ],
  },
];

const ecommerce: DocumentTemplate[] = [
  {
    key: "ec_supplier",
    label: "Supplier & Vendor Agreement",
    price: 69,
    desc: "MOQs, pricing, payment terms, quality standards, and chargebacks.",
    vertical: "ecommerce",
    fields: [
      { id: "buyer", label: "Buyer / Retailer", ph: "Online Store LLC" },
      { id: "supplier", label: "Supplier", ph: "Factory Direct Co" },
      { id: "products", label: "Product Categories", ph: "Electronics, Accessories" },
      { id: "payment", label: "Payment Terms", ph: "Net 30" },
    ],
  },
  {
    key: "ec_dropship",
    label: "Drop-Shipping Agreement",
    price: 59,
    desc: "Blind-ship arrangement with inventory feeds and packing-slip branding.",
    vertical: "ecommerce",
    fields: [
      { id: "retailer", label: "Retailer", ph: "My Store LLC" },
      { id: "supplier", label: "Drop-Shipper", ph: "Wholesale Co" },
      { id: "products", label: "Product Range", ph: "Home goods" },
      { id: "margin", label: "Retailer Margin %", ph: "40%" },
    ],
  },
  {
    key: "ec_affiliate",
    label: "Affiliate Marketing Agreement",
    price: 49,
    desc: "Commission structure, FTC disclosures, and prohibited traffic rules.",
    vertical: "ecommerce",
    fields: [
      { id: "merchant", label: "Merchant", ph: "Brand Store" },
      { id: "affiliate", label: "Affiliate", ph: "Blog Publisher" },
      { id: "commission", label: "Commission Rate", ph: "10% of net sale" },
      { id: "cookie", label: "Cookie Duration (days)", ph: "30" },
    ],
  },
  {
    key: "ec_3pl",
    label: "Warehouse & 3PL Agreement",
    price: 79,
    desc: "Storage fees, pick-and-pack SLAs, accuracy guarantees, and insurance.",
    vertical: "ecommerce",
    fields: [
      { id: "warehouse", label: "3PL Provider", ph: "FastFulfill LLC" },
      { id: "client", label: "Client / Merchant", ph: "Brand LLC" },
      { id: "storage", label: "Storage Rate ($/pallet/mo)", ph: "25" },
      { id: "pick_pack", label: "Pick & Pack Rate ($/order)", ph: "2.50" },
    ],
  },
  {
    key: "ec_platform",
    label: "eCommerce Platform License",
    price: 79,
    desc: "SaaS license with uptime SLA, data ownership, fees, and exit rights.",
    vertical: "ecommerce",
    fields: [
      { id: "provider", label: "Platform Provider", ph: "ShopEngine Inc" },
      { id: "merchant", label: "Merchant", ph: "Brand Store LLC" },
      { id: "monthly_fee", label: "Monthly Fee ($)", ph: "299" },
      { id: "tx_fee", label: "Transaction Fee %", ph: "0.5%" },
    ],
  },
];

export const DOCS_BY_VERTICAL: Record<VerticalKey, DocumentTemplate[]> = {
  realestate,
  fintech,
  smb,
  ecommerce,
};

export const ALL_TEMPLATES = Object.values(DOCS_BY_VERTICAL).flat();

export const BUNDLES: Record<VerticalKey, BundleOffer> = {
  realestate: { label: "Full Real Estate Library", price: 297, keys: realestate.map((template) => template.key) },
  fintech: { label: "FinTech Full Library", price: 397, keys: fintech.map((template) => template.key) },
  smb: { label: "Small Business Full Library", price: 297, keys: smb.map((template) => template.key) },
  ecommerce: { label: "eCommerce Full Library", price: 297, keys: ecommerce.map((template) => template.key) },
};

const DOCSTACK_KEYWORDS: Array<{ key: string; patterns: string[] }> = [
  { key: "jv", patterns: ["joint venture", "syndication", "operating agreement"] },
  { key: "nda", patterns: ["nda", "non-disclosure", "confidentiality", "non circumvention"] },
  { key: "loi", patterns: ["letter of intent", "loi"] },
  { key: "commission", patterns: ["commission", "broker", "finder fee"] },
  { key: "capital_call", patterns: ["capital call"] },
  { key: "property_mgmt", patterns: ["property management", "management agreement"] },
  { key: "subscription", patterns: ["subscription", "investor subscription"] },
  { key: "guarantee", patterns: ["guarantee", "personal guarantee"] },
  { key: "ft_payment", patterns: ["payment processing", "merchant agreement"] },
  { key: "ft_mca", patterns: ["merchant cash advance"] },
  { key: "ft_loan", patterns: ["commercial loan", "loan agreement"] },
  { key: "ft_api", patterns: ["api license", "data sharing"] },
  { key: "smb_service", patterns: ["service agreement", "msa", "master service"] },
  { key: "smb_partner", patterns: ["partnership agreement"] },
  { key: "smb_shareholders", patterns: ["shareholders agreement"] },
  { key: "ec_supplier", patterns: ["vendor agreement", "supplier agreement"] },
  { key: "ec_dropship", patterns: ["drop shipping", "dropship"] },
];

export function findTemplateByKey(key: string) {
  return ALL_TEMPLATES.find((template) => template.key === key);
}

export function inferDocStackTemplateKey(contractType = "") {
  const normalized = contractType.toLowerCase();
  const matched = DOCSTACK_KEYWORDS.find((entry) =>
    entry.patterns.some((pattern) => normalized.includes(pattern)),
  );

  return matched?.key ?? "smb_service";
}

export function buildDocStackHref(contractType = "") {
  const key = inferDocStackTemplateKey(contractType);
  return `/?template=${encodeURIComponent(key)}#documents`;
}

export function inferPartiesFromKeyTerms(keyTerms: Record<string, string>) {
  const entries = Object.entries(keyTerms);
  const findValue = (...candidateKeys: string[]) =>
    entries.find(([key]) => candidateKeys.some((candidate) => key.includes(candidate)))?.[1] ?? "";

  return {
    party_a:
      findValue("party_a", "buyer", "client", "owner", "company_a", "provider", "merchant", "brand", "advisor") ||
      "Party A",
    party_b:
      findValue("party_b", "seller", "contractor", "manager", "company_b", "recipient", "supplier", "influencer", "client") ||
      "Party B",
  };
}

export function formatKeyTermsForPrompt(keyTerms: Record<string, string>) {
  return Object.entries(keyTerms)
    .filter(([, value]) => value)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
}
