-- Deal Intelligence — the fact and evidence spine.
--
-- The product question is "what is wrong with this deal?", which means comparing
-- the SAME fact as asserted by DIFFERENT documents. Nothing in the fleet could
-- express that: leaseparse_leases.extracted_json is one opaque blob per lease,
-- closeflow_transactions.documents_uploaded is an untyped jsonb array, and
-- docai's EvidenceRef {id, location, quote} has no document_id — so a quote
-- cannot be attributed to one of twenty uploaded files.
--
-- These four tables are that missing layer. deal_facts is the atom the
-- reconciliation engine operates on; every row must carry its source document
-- and page, because a finding without provenance is an opinion.

begin;

-- ── The ledger head ─────────────────────────────────────────────────────────
create table if not exists public.deals (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid references public.trio_properties(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete cascade,
  email         text,
  -- Which rule pack governs this deal. 'ae-dubai-residential' is the first and
  -- for now the only real one; the value is free-form so a pack can ship
  -- without a migration.
  jurisdiction  text not null default 'ae-dubai-residential',
  deal_type     text not null default 'residential_purchase',
  status        text not null default 'open'
                  check (status in ('open', 'audited', 'closed', 'abandoned')),
  created_at    timestamptz not null default now(),
  audited_at    timestamptz
);

create index if not exists idx_deals_email on public.deals (lower(email), created_at desc);
create index if not exists idx_deals_property on public.deals (property_id);

-- ── One row per uploaded file ───────────────────────────────────────────────
create table if not exists public.deal_documents (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references public.deals(id) on delete cascade,
  doc_type      text,                       -- 'spa' | 'title_deed' | 'noc' | 'form_f' | ...
  filename      text not null,
  storage_path  text,
  -- sha256 of the bytes. Re-uploading the same file must not create a second
  -- set of competing facts.
  sha256        text,
  page_count    int,
  -- Freshness: a title search or an NOC goes stale. expires_at drives the
  -- 'expired' finding kind; null means the pack defines no expiry.
  effective_at  date,
  expires_at    date,
  -- Amendments supersede originals. The reconciler must not report a conflict
  -- between a contract and its own addendum.
  supersedes    uuid references public.deal_documents(id) on delete set null,
  has_text_layer boolean,                   -- false => scanned, routed to the refund path
  uploaded_at   timestamptz not null default now(),
  unique (deal_id, sha256)
);

create index if not exists idx_deal_documents_deal on public.deal_documents (deal_id);

-- ── The atom reconciliation runs on ─────────────────────────────────────────
create table if not exists public.deal_facts (
  id                uuid primary key default gen_random_uuid(),
  deal_id           uuid not null references public.deals(id) on delete cascade,
  -- Dotted path into the deal ontology: 'contract.closing_date',
  -- 'financial.purchase_price', 'parties.seller.name'. Two documents asserting
  -- the same fact_key with different normalized_value is precisely a conflict.
  fact_key          text not null,
  raw_value         text,                   -- exactly as written in the document
  -- Canonicalised for comparison: ISO-8601 date, integer minor units, upper
  -- snake name. Comparison happens ONLY on this column — never on raw_value.
  normalized_value  text,
  unit              text,                   -- 'AED' | 'USD' | 'sqft' | 'sqm' | null
  -- Provenance. Not nullable by intent: a fact with no source document cannot
  -- be shown to a customer, so it must not be storable.
  source_document_id uuid not null references public.deal_documents(id) on delete cascade,
  page              int,
  quote             text not null,          -- verbatim span; no quote, no claim
  confidence        real check (confidence is null or (confidence >= 0 and confidence <= 1)),
  extracted_at      timestamptz not null default now()
);

create index if not exists idx_deal_facts_deal_key on public.deal_facts (deal_id, fact_key);
create index if not exists idx_deal_facts_document on public.deal_facts (source_document_id);

-- ── What the audit reports ──────────────────────────────────────────────────
create table if not exists public.deal_findings (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references public.deals(id) on delete cascade,
  -- 'conflict'            two documents disagree
  -- 'missing'             the pack requires it and no document supplies it
  -- 'expired'             supplied but stale at the closing date
  -- 'upcoming'            a deadline approaching
  -- 'insufficient_evidence' we could not verify — NOT a pass and NOT a conflict.
  --                       This is the honesty valve; it maps to lexaudit's
  --                       EvidenceStatus, which scores null and is excluded
  --                       from the denominator rather than silently penalised.
  kind          text not null check (kind in
                  ('conflict', 'missing', 'expired', 'upcoming', 'insufficient_evidence')),
  fact_key      text,
  severity      text not null default 'medium'
                  check (severity in ('critical', 'high', 'medium', 'low')),
  summary       text not null,
  -- Every document asserting a competing value, so the report can show the
  -- customer both sides rather than picking a winner.
  claimant_document_ids uuid[] not null default '{}',
  fact_ids      uuid[] not null default '{}',
  status        text not null default 'open'
                  check (status in ('open', 'resolved', 'dismissed')),
  resolved_by   text,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_deal_findings_deal on public.deal_findings (deal_id, status);

-- ── RLS: same shape as the trio tables ──────────────────────────────────────
alter table public.deals            enable row level security;
alter table public.deal_documents   enable row level security;
alter table public.deal_facts       enable row level security;
alter table public.deal_findings    enable row level security;

drop policy if exists "service_role deals" on public.deals;
create policy "service_role deals" on public.deals for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
drop policy if exists "own rows deals" on public.deals;
create policy "own rows deals" on public.deals for select using (auth.uid() = user_id);

drop policy if exists "service_role deal_documents" on public.deal_documents;
create policy "service_role deal_documents" on public.deal_documents for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role deal_facts" on public.deal_facts;
create policy "service_role deal_facts" on public.deal_facts for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "service_role deal_findings" on public.deal_findings;
create policy "service_role deal_findings" on public.deal_findings for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

comment on table public.deal_facts is
  'Atomic extracted facts with mandatory provenance (source_document_id + quote). Reconciliation compares normalized_value across documents sharing a fact_key. A fact with no source document is not storable by design.';

commit;
