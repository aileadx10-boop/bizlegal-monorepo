# Supabase Setup Guide

The unified DocAI app uses the BizLegal Supabase project:

- Project URL: `https://ydghhcuuopqzgqcicubg.supabase.co`
- Runtime client: [`web/lib/supabase.ts`](/C:/Users/Moshe%20Dor/Downloads/DOR-INNOVATION/docai-monorepo/web/lib/supabase.ts)

## Required Environment Variables

Use the App Router naming convention throughout the project. If you are copying values from `C:\Users\Moshe Dor\.env.bizlegal.txt`, map the legacy keys like this:

- `SUPABASE_URL` -> `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY` -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY` -> `SUPABASE_SERVICE_ROLE_KEY`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Tables Used By DocAI

The current unified app expects these existing BizLegal tables:

- `contract_scans`
- `leads`
- `newsletter_subscribers`

`contract_scans` stores the AI scan metadata, the payment state, and the full serialized `ai_content` report used by `/report/[scan_id]`.

## Notes

- Do not use the old `SUPABASE_URL`, `SUPABASE_ANON_KEY`, or `SUPABASE_SERVICE_KEY` names in this repo.
- Do not point the app at any Supabase project other than `ydghhcuuopqzgqcicubg`.
