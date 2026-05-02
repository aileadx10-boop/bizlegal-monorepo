# LexAudit

**AI Compliance Certificates for Lawyers.**
Defensibility-as-a-Service — tamper-evident audit trails for AI-assisted legal work.

---

## Deploy in 4 Steps

### Step 1 — Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Dashboard → SQL Editor → paste the entire contents of `supabase-migration.sql` → Run
3. Settings → API → copy `Project URL` and `anon public` key

### Step 2 — Environment Variables

```bash
cp .env.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase dashboard
- `ANTHROPIC_API_KEY` — from console.anthropic.com

### Step 3 — Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or push to GitHub and connect repo at vercel.com.

Add the same environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

### Step 4 — Subdomain (Namecheap)

In Namecheap DNS for `bizlegal-ai.com`, add:

| Type | Host | Value |
|------|------|-------|
| CNAME | lexaudit | cname.vercel-dns.com |

In Vercel → Project → Settings → Domains → Add `lexaudit.bizlegal-ai.com`

---

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Auth (Supabase) |
| `/dashboard` | Matter list |
| `/matter/[id]` | AI log + certificate generation |
| `/certificate/[id]` | Full printable certificate |
| `/pricing` | Pricing tiers |
| `/security` | Security & privacy |
| `/legal/terms` | Terms of service |
| `/legal/privacy` | Privacy policy |
| `/legal/disclaimer` | Legal disclaimer |

---

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Database**: Supabase (Postgres + RLS)
- **Auth**: Supabase Auth
- **AI**: Claude API (Anthropic)
- **Deploy**: Vercel
- **Domain**: lexaudit.bizlegal-ai.com

---

## Contact

ai.leadx10@gmail.com
