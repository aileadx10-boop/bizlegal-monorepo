# Workflow — authoring a `/learn` lesson

**Surface:** `apps/hub/app/learn/` · **Content:** `apps/hub/lib/academy/content/`
**Created:** 2026-07-30 (Nifty Haven Phase 0)

Two tracks, two different authoring methods, because they have two different
sources of authority. Using the wrong method on the wrong track is the failure
mode this SOP exists to prevent.

| Track | Slug | Authority comes from | Method |
|---|---|---|---|
| Real Estate | `real-estate` | Moses is a practising real-estate lawyer | **Interview-first** (§1) |
| Founders | `founders` | The 66-guide library already published | **Guide-synthesis** (§2) |

---

## 0 — Hard constraints (both tracks)

These are enforced by `lib/academy/types.ts` and by review. Do not work around them.

1. **No CLE / CPE / credit claims.** Anywhere. Not in copy, not in metadata, not
   in a certificate. Completion is not accreditation. Every page carries
   `NOT_ADVICE` and the no-credit line.
2. **No invented case studies.** A `founderNote` renders visibly as
   `FOUNDER_NOTE_LABEL` ("Case study to be added by the author") until Moses
   supplies a real matter. An invented case destroys the only asset the
   real-estate track has.
3. **No fabricated statistics.** A number in a lesson needs a source, or it does
   not go in.
4. **`sourceGuide` must be a real href in `lib/guides.ts`.** Verify by grep, not
   by memory. A dead cross-link is worse than no cross-link.
5. **CTAs point only at live surfaces.** DocAI ($97 scan), Forge (BOI $149),
   LexAudit ($99/mo), `/pricing`. Never PropSignal / LeaseParse / CloseFlow —
   their checkout is dark.
6. **Prose lives in double-quoted strings.** `tsc` tolerates an apostrophe
   inside single quotes; SWC / `next build` does not. This has broken the hub
   build before.
7. **Gated lessons render headings only.** Never ship a body behind a
   client-side check — there would be a paywall to defeat.

---

## 1 — Interview-first (Real Estate track)

The founder has the material; the agent's job is extraction and structure, not
invention.

### Inputs
- One transaction type or obligation Moses names (e.g. "what a non-resident buyer
  gets wrong about the deposit").
- 10 answers from the interview below. **No answers → no lesson.**

### The ten questions
1. What is the transaction or document?
2. Who is the reader — buyer, seller, agent, investor?
3. What do they believe going in that is wrong?
4. What does the document actually oblige them to do?
5. What is the deadline, and what happens when it slips?
6. Which clause do people sign without reading?
7. What is the cheapest way to find the problem early?
8. Where does this differ across jurisdictions?
9. When must they stop and get counsel?
10. A real matter — anonymised — where this went wrong.

### Steps
1. Moses answers 1–10 in text. Async, no call. Answer 10 may be deferred; the
   lesson then ships with a visible `founderNote` placeholder.
2. Draft the lesson with `runEaTask` (`apps/hub/lib/agents/ea-runner.ts`) using
   only those answers as source. No web research, no filler.
3. Shape it as `sections[]` — 3 to 5 headings, 2 to 4 paragraphs each, bullets
   only for genuine lists. Target the declared `minutes` at ~200 wpm.
4. Moses reads the draft and edits. **This review is the E-E-A-T.** It is not
   optional and it is not delegable.
5. Append to `lib/academy/content/real-estate.ts`.
6. Gate: `cd apps/hub && VERCEL=1 CI=1 npx next build` → exit 0 **and** the new
   route appears in the route table. Never trust the exit code alone.

### Do not
- Do not fill answer 10 yourself.
- Do not add a `sourceGuide` — the guide library is compliance-led and has no
  property content. There is nothing honest to cite yet.

---

## 2 — Guide-synthesis (Founders track)

The material is already written and already reviewed. This is compression, not
authorship.

### Steps
1. Pick a guide from `lib/guides.ts` that maps to a founder obligation.
2. Read the full guide. Extract the 3–5 things a non-lawyer founder must
   actually do, and the point at which they need counsel.
3. Draft ~10–13 minutes of reading. The lesson is the orientation; the guide
   stays the reference and is linked as "Go deeper" via `sourceGuide`.
4. Set `cta` to the product the guide already recommends — do not invent a new
   pairing.
5. Moses reviews for accuracy. Lighter than §1 (the guide was already reviewed)
   but not skipped.
6. Append to `lib/academy/content/founders.ts`, then run the build gate.

### Do not
- Do not restate the guide at length. If the lesson is as long as the guide,
  delete the lesson and link the guide.
- Do not cite a guide you have not opened this session.

---

## 3 — Free vs gated

- **Free** = readable in full, sitemapped, indexable. Every track opens with
  enough free material to judge the writing before paying.
- **Gated** = outline only, `robots: { index: false }`, not sitemapped, waitlist
  form instead of a body.

Flipping a lesson to free is a one-line change (`free: true`) plus a build. That
is the intended path once a track proves demand.

---

## 4 — Selling a track

Checkout is **dark on purpose**. `academy_realestate_annual` ($240/yr) and
`academy_founders_annual` ($180/yr) exist in `packages/payment/src/products.ts`,
but `/learn` has no accounts and no gated-lesson delivery — a paying subscriber
could not be let in. `/learn` captures double-opt-in email via
`POST /api/newsletter` only.

Before any buy button ships, in this order:
1. A delivery mechanism (magic-link or emailed lessons — no new auth system).
2. `payment_orders` → entitlement lookup on the gated route.
3. A refund path consistent with `/refund`.

Until then the honest offer is a waitlist, and that is what is live.
