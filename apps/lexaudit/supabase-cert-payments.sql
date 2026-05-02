-- LexAudit: Certificate Payment Tables
-- Run in Supabase SQL Editor after supabase-migration.sql

-- cert_payment_intents: stores data needed by webhook to generate cert
create table if not exists cert_payment_intents (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  cert_id text not null,          -- pre-generated, e.g. LA-A3F9B2
  matter_id uuid references matters(id) on delete cascade,
  form_data jsonb not null,       -- lawyer, partner, prompt, edits, ai_tool
  payment_status text default 'pending',
  nowpayments_payment_id text,
  created_at timestamptz default now()
);

-- Add payment tracking to certificates
alter table certificates
  add column if not exists payment_status text default 'paid',
  add column if not exists payment_id text,
  add column if not exists amount_paid integer; -- cents
