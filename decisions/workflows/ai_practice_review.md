# Workflow — AI Practice Review (written, async, $200)

**Objective:** turn a reply to Moses's article/post into a paid, written review with zero live conversation. Every human-facing line here is a draft; Moses approves before anything is sent. This is the async twin of a consultation, and the first rung of the approved plan `~/.claude/plans/proud-drifting-wolf.md` (O-018).

**Binding rules:** hard rule 7 — only people who wrote to Moses first are ever written to · `decisions/PHASE-1-INTROVERT-FOUNDER.md` — no calls, draft-then-approve, async next steps only · liability rails in the plan §B.4 — no rule citations the agent cannot verify, "review of your intended setup, not advice on your matters", never "safe" or "compliant" as a promise · every legal-sounding claim routes through `agents/socials/skills/social-approval-routing/SKILL.md` (`requires_human_approval`).

**Inputs:** an inbound reply (LinkedIn comment/DM or email) · the article `content/blog/checks-before-an-ai-agent-touches-your-inbox.mdx` · the PayPal connector (`create_invoice`) · `payment_orders` (manual row after payment so `/ops/snapshot` stays honest).

**Tools:** Gmail connector (drafts only — Moses sends) · PayPal connector · this file's templates · the hub path (`/ai-practice-review`, SKUs `ai_practice_review` + `ai_teammate_kit`, built 2026-09-06 on the same branch as the F1 capture fix `680e2f6`; live once that branch deploys — until then, use the PayPal-invoice path below).

---

## Step 0 — The LinkedIn post (Moses posts it himself; one language, his choice)

> I run AI agents in my own practice. Before any of them was allowed near a client's name, I wrote four things down: what it knows, what it can touch, how each task ends, and where its log lives.
>
> Most of the risk I see in colleagues' setups isn't the AI. It's that those four pieces of paper don't exist.
>
> I've written up the checklist I actually use — including the five things I never automate (advice, sending, conflict decisions, filing deadlines, anything involving a court).
>
> Link in the first comment. Not legal advice; not a vendor recommendation. It's what I do in my own practice, written down.

First comment (Moses): the article URL, posted only after the deployment record for the article's commit exists (`gh api repos/aileadx10-boop/bizlegal-monorepo/deployments`).

Optional follow-up, 5–7 days later, only if the first post drew replies:

> A few people asked what the "written review" at the end of my checklist actually is. Five questions by email, one written memo back, no meeting. It reviews your intended setup against the checklist — it isn't advice on your matters. Details are at the bottom of the article.

## Step 1 — Reply to an inbound comment or message (agent drafts, Moses approves)

Use only for people who commented, messaged, or emailed first. Never initiate.

> Thanks for reading. If you're setting this up yourself, the written review is the simplest next step: I send five short questions, you reply when convenient, and I return a written memo checking your intended setup against the checklist. $200, delivered by email, no meeting. If you'd like the questions, reply here or write to moses@bizlegal-ai.com with the subject "AI practice review".

If the person asks a specific question about their own matter: do not answer it. Draft:

> That's a question about your specific situation, which I can't answer here. The review covers how you'd set the agents up, not the matters they'd touch.

## Step 2 — The five-question email (sent after they ask for it)

Subject: `AI practice review — five questions`

> Thank you for asking. Reply to this email with short answers to the five questions below — a sentence or two each is enough. When your answers arrive I'll send a PayPal invoice for $200; the memo follows within five working days of payment, by email.
>
> 1. **Context.** What tasks do you want an agent to do, and for which kinds of work (practice areas, not client names)?
> 2. **Connections.** Which accounts or systems would it connect to (email, calendar, document store, practice-management), and whose data do those hold?
> 3. **Capabilities.** For each task, what does "done" look like — a draft for you to review, or something sent or filed without you?
> 4. **Cadence.** How often would it run, who would read its output, and how would you stop it?
> 5. **Consent and vendor.** What do your engagement terms currently say about third-party tools processing client communications, and which product(s) are you considering?
>
> Two limits so we're clear from the start: the memo reviews your intended setup against my published checklist; it is not legal advice on your matters or your clients, and it does not recommend a vendor. Please don't include client names or matter details in your answers.
>
> Moses Dor, Adv.

## Step 3 — PayPal invoice (agent creates via the PayPal connector; Moses confirms before it is sent)

- Item: `AI practice review — written memo` · $200 USD · quantity 1
- Note on invoice: *"Written review of your intended AI-agent setup against the published checklist. Not legal advice; not a review of any client matter; delivered by email within five working days of payment. Non-refundable once the memo is delivered."*
- Issued under Moses's own name/account, not the hub checkout (plan §B.4 — the hub footer says "not a law firm").
- After payment: insert a `payment_orders` row by hand (`product = 'ai_practice_review'` as a free-text placeholder until a SKU exists, `amount_cents = 20000`, `gateway = 'paypal'`, `status = 'active'`, `source = 'manual_invoice'`, the buyer's email) so `/ops/snapshot` counts it. This row is the **demand proof** (G1-demand). O-017's $20 FirmCited buy remains the **pipeline proof**.

## Step 4 — The memo (agent drafts from the template; Moses edits and signs)

Length 2–4 pages. Plain language. No citations to bar rules, statutes or regulators unless Moses adds them himself. Structure:

```
AI PRACTICE REVIEW — [Firm / name], [date]
Prepared by Moses Dor, Adv.

Scope. This memo reviews the AI-agent setup you described in your answers of
[date] against the checklist published at [article URL]. It is not legal advice,
does not address any client matter, and does not recommend a vendor. Your
professional obligations depend on your jurisdiction and your clients; verify
them before acting.

1. What you told me (restated in one paragraph, so you can correct it)

2. Context — what the agent will know
   What is well-scoped · what is too broad · one concrete rewrite of the agent
   description

3. Connections — what it will touch
   Accounts listed vs. whose data they hold · read/write status · the consent
   clause: present / absent / unclear · the two vendor data questions:
   answered / unanswered

4. Capabilities — how each task ends
   For each task: draft-only or send/file · the two verification lines present
   or not · the "never automate" list checked against your tasks

5. Cadence — schedule, log, off switch
   Frequency vs. review capacity · where the log lives · the stop test

6. The three changes I would make first (numbered, each one doable alone in
   under an hour)

7. What I could not assess from your answers (explicit list — never silently
   passed)

Signed, Moses Dor, Adv.
[disclosure footer from decisions/BYLINE-TEMPLATE-2026-07-13.md]
```

Delivery email (draft):

> Your review is attached. Section 6 is the part to act on first; section 7 lists what I couldn't assess from the answers, so nothing there should be read as a pass. If you want a second pass after you've made the changes, reply to this email — same format, no meeting.

## Step 5 — After memo #2: the kit

Only once two memos have been written does the $49 kit get drafted (plan §B.2 rung 2), because the memos reveal what people actually ask. Contents are fixed at eight items in the plan; do not expand.

## Edge cases

- **Someone asks for a call.** Draft: *"I work in writing — it lets me be precise and gives you something you can keep. The review is delivered by email; if that doesn't suit, no problem at all."* Never book one.
- **Someone sends client details.** Do not process them. Draft a reply asking them to resend without client names or matter facts; delete the original from any agent context.
- **Someone asks whether their setup is "compliant" or "safe".** The memo never says either word. Section 7 says what was not assessed.
- **Payment arrives before answers.** Send the five questions again; the five-day clock starts at answers, not payment — say so.
- **Zero replies in 14 days.** That is the fallback in the plan: the slow inbound path (free lesson flip, guides, O-017). Do not add outbound.

## Acceptance (per O-018)

- One PayPal transaction from a non-Moses email within 14 days of the post, recorded in `payment_orders`.
- No message sent to anyone who did not write first; no call offered anywhere.
- Every memo carries the scope paragraph and section 7.

---

## Hebrew variants (Moses picks ONE language per post; the agent drafts, Moses posts)

### Step 0 — the post (HE)

> אני מפעיל סוכני AI במשרד שלי. לפני שאיזשהו סוכן התקרב לשם של לקוח, כתבתי ארבעה דברים: מה הוא יודע, למה יש לו גישה, איך כל משימה מסתיימת, ואיפה נשמר הלוג שלו.
>
> רוב הסיכון שאני רואה אצל קולגות הוא לא ה-AI. זה שארבעת הדפים האלה פשוט לא קיימים.
>
> כתבתי את רשימת הבדיקות שאני באמת משתמש בה, כולל חמשת הדברים שאני אף פעם לא נותן לאוטומציה לעשות: ייעוץ, שליחה, החלטות על ניגוד עניינים, מועדי הגשה, וכל דבר שנוגע לבית משפט.
>
> הקישור בתגובה הראשונה. זה לא ייעוץ משפטי ולא המלצה על ספק. זה מה שאני עושה במשרד שלי, כתוב.

### Optional follow-up (HE, 5–7 days later, only if the first post drew replies)

> כמה אנשים שאלו מה זו "הסקירה הכתובה" שבסוף הרשימה. חמש שאלות במייל, מזכר כתוב אחד בחזרה, בלי פגישה. הסקירה בודקת את ההגדרה שאתם מתכננים מול הרשימה. היא לא ייעוץ בתיקים שלכם. הפרטים בתחתית המאמר.

### Step 1 — reply to an inbound comment or message (HE)

> תודה שקראת. אם אתה מקים את זה בעצמך, הסקירה הכתובה היא הצעד הפשוט הבא: אני שולח חמש שאלות קצרות, אתה עונה כשנוח לך, ואני מחזיר מזכר כתוב שבודק את ההגדרה המתוכננת מול הרשימה. 200 דולר, במייל, בלי פגישה. אם תרצה את השאלות, ענה כאן או כתוב ל-moses@bizlegal-ai.com עם הנושא "AI practice review".

If the person asks about their own matter (HE):

> זו שאלה על המצב הספציפי שלך, ואני לא יכול לענות עליה כאן. הסקירה עוסקת באיך מגדירים את הסוכנים, לא בתיקים שהם ייגעו בהם.

### Someone asks for a call (HE)

> אני עובד בכתב. זה מאפשר לי לדייק ומשאיר לך משהו שאפשר לשמור. הסקירה נמסרת במייל; אם זה לא מתאים, אין שום בעיה.

---

## Hub path (built 2026-09-06, ships with the F1 capture fix on this branch)

Both products can also be bought self-serve at `https://bizlegal-ai.com/ai-practice-review` (PayPal card or NOWPayments crypto via `/api/pay/start`). On `payment.confirmed`, `apps/hub/lib/payments/practice-grant.ts`:
- **review** → emails the buyer the five questions above (transactional, reply-to `moses@bizlegal-ai.com`) and pings Moses on Telegram with the order id and email. The memo is still written by Moses (agent drafts from the template in Step 4).
- **kit** → emails the buyer a private link `https://bizlegal-ai.com/kit?order=<id>` (readable, printable to PDF) plus `/api/kit/download?order=<id>` (Markdown), and pings Moses.

The PayPal-invoice path in Step 3 remains the route for replies that arrive by message rather than through the page. Either way the row lands in `payment_orders`; only the manual-invoice path needs the row inserted by hand.

A rendered PDF of the kit for manual delivery (attach to a reply, or hand to a PayPal-invoice buyer) is at `content/kits/ai-teammate-kit-1.0.pdf`; regenerate after edits with `cd apps/hub && node scripts/kit-pdf.mjs`.
