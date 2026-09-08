/**
 * AI Teammate Kit for Law Practices — O-018 (2026-09-06).
 *
 * The $49 written kit sold at /ai-practice-review. Bundled as a module (not
 * read from disk) so the gated page and the markdown download work on Vercel
 * without file tracing. Content is authored by Moses Dor, Adv. in his personal
 * capacity; it is procedural and carries no citations to bar rules, statutes
 * or regulators — those are added only after Moses verifies them himself
 * (plan: ~/.claude/plans/proud-drifting-wolf.md §B.4).
 *
 * Nate Herk's Skool materials informed the structure only; nothing here is
 * repackaged from them.
 */

export const KIT_TITLE = 'AI Teammate Kit for Law Practices'
export const KIT_VERSION = '1.0 (2026-09-06)'
export const KIT_AUTHOR = 'Moses Dor, Adv.'

export const KIT_MARKDOWN = `
# AI Teammate Kit for Law Practices

*Version 1.0 · September 2026 · Written by Moses Dor, Adv., practising commercial and real-estate attorney, in his personal capacity. For licensed practitioners only. Adapt every clause and checklist with counsel in your own jurisdiction. This kit is not legal advice, does not create an attorney-client relationship, and does not recommend any vendor.*

## How to use this kit

This is the paperwork I keep next to the agents I run in my own practice. It is eight short parts. Work through them in order, once, for one agent doing one task. Do not try to set up three agents on the first pass. The whole point is that four things exist in writing before an agent touches anything with a client's name on it: what it knows, what it can touch, how each task ends, and where its log lives.

Every part ends with a "done when" line. If you cannot honestly write that line, the agent waits.

---

## Part 1 — Pre-flight confidentiality checklist

Answer each question in writing before connecting anything. A "no" or "don't know" on any of them stops the setup.

1. Have I written down, in one paragraph, what this agent is for and what "done" looks like?
2. Does the agent's standing description avoid every client name, matter number and deal term?
3. Is the agent doing one job? (If it triages intake and drafts client updates, it is two agents.)
4. Do I know which accounts it will connect to and whose data each one holds?
5. Does it start read-only?
6. Have I read the vendor's terms for the two questions that matter: do my inputs train their models, and where is the data stored?
7. Is the vendor's product out of beta and on business terms? (Consumer terms of service disqualify a connection to anything client-facing.)
8. Do my engagement terms tell clients, in plain language, that a third-party tool may process their communications, with a way to opt out?
9. Does every recipe end with the two verification lines from Part 4?
10. Is there a log, and does it exist before the first run?
11. Is there an off switch, and have I tested it?
12. Have I decided, in writing, what the agent will never do? (Part 7.)

**Done when:** all twelve answers are written and none is "no" or "don't know".

---

## Part 2 — Engagement-letter clause and client-consent clause

Both clauses are drafts for a licensed practitioner to adapt. They are written in plain language on purpose; a client should be able to read them without a lawyer. Check them against your bar's rules on confidentiality, cloud tools and client communication before use, and against any data-protection law that applies to your clients.

**Engagement-letter clause (technology and third-party tools):**

> In providing our services we use software tools, including tools that use artificial intelligence, to help us organise, draft and review documents and correspondence. Some of these tools are provided by third parties and may process information you send us on servers operated by those providers. We choose tools whose terms do not permit the provider to use your information to train its models, and we do not give any tool the ability to send correspondence or make decisions on your matter without a lawyer reviewing it first. A current list of the categories of tools we use is available on request. If you do not want your matter handled with the assistance of third-party tools, tell us in writing and we will make arrangements that do not use them; this may affect timing and cost, which we will discuss with you before proceeding.

**Client-consent clause (for a specific tool or a change in tools):**

> We propose to use [tool category, e.g. "an email-triage assistant"] provided by [provider] in connection with your matter. The tool will [read incoming correspondence and prepare draft summaries / extract dates and deadlines from documents you send us]. It will not send correspondence, file documents or make any decision on your matter; every output is reviewed by a lawyer before it is used. Information processed by the tool is stored in [region] and is not used by the provider to train its models. You may withdraw this consent at any time by writing to us. Please reply to confirm that you agree.

**Done when:** both clauses are adapted, reviewed, and the engagement-letter version is in your current template.

---

## Part 3 — Agent role card (the Four Cs on one page)

Fill one card per agent. Keep the completed card with the log.

| Field | Your answer |
|---|---|
| Agent name | |
| One-sentence job | |
| **Context** — what it knows (no client names) | |
| **Connections** — accounts it can read; accounts it can write to | Read: / Write: |
| Whose data each account holds | |
| **Capabilities** — the recipes it runs (Part 4) | |
| **Cadence** — schedule, who reads the output, how to stop it | |
| Log location | |
| Never-do list (Part 7) acknowledged | Yes / No |
| Reviewed by (lawyer) and date | |

**Done when:** every field is filled and the card is stored where the log is.

---

## Part 4 — Three recipes (draft-only, verify-before-send)

A recipe is the written sequence of steps an agent follows for one recurring task. Write it for a bright temp on their first day, not for a trusted associate. Every recipe in this kit ends with the same two lines. Copy them verbatim.

> **Verification line:** Before delivering, re-check every date, name and number against the source document. List anything you could not verify.
>
> **Draft-only line:** Do not send, file, calendar or delete anything. Leave the draft for review.

**Recipe A — Intake triage**

1. Read each new enquiry received since the last run.
2. For each, extract: who is writing, what they are asking for, any date or deadline mentioned, and every party name for a conflict check.
3. Rank enquiries by urgency: stated deadline within seven days first; then anything mentioning a court, a regulator or a signed document; then everything else.
4. Draft a holding reply for each, in the firm's standard wording, acknowledging receipt and stating when a lawyer will respond. Do not answer the question asked.
5. Produce a table: enquiry, extracted facts, rank, draft reply link.
6. Verification line. Draft-only line.

**Recipe B — Deadline digest**

1. Read all correspondence and documents received in the last 24 hours.
2. List every date, deadline, notice period or time limit mentioned, with the exact sentence it came from and the document it came from.
3. Mark each as "stated" (the document says it) or "inferred" (you calculated it). Inferred dates are flagged, never presented as fact.
4. Produce the list sorted by date, nearest first.
5. Verification line. Draft-only line. (Nothing is calendared without a lawyer's confirmation, and no deadline lives only in this digest.)

**Recipe C — Client-update draft**

1. For the matter named by the lawyer, read only the documents the lawyer has placed in the working folder for this task.
2. Draft the weekly status note in the firm's format: what happened, what is next, what we need from the client.
3. Mark every sentence that is inferred rather than read from a document.
4. Do not state any legal conclusion or recommendation; leave a placeholder where the lawyer will add one.
5. Verification line. Draft-only line.

**Done when:** each recipe you use ends with both lines, and the agent has run in draft-only mode for a week with every output read by a lawyer.

---

## Part 5 — Activity-log template

One line per run. A spreadsheet is enough. The log exists before the first run, not after the first question.

| Timestamp | Agent | Recipe | What it read (source names, not contents) | What it produced | Where the draft is | Reviewed by | Action taken |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

Rules: the log is append-only; nobody edits a past line; the agent writes its own line at the end of every run; a lawyer initials the "reviewed by" column before any draft is used.

**Done when:** the log has a line for every run of the trial week and every line has initials.

---

## Part 6 — Ten questions to ask any vendor before connecting

Write down the answers. "It's in the privacy policy" is not an answer; the answer is.

1. Are my inputs, or my clients' data, used to train or improve your models? Where is that written?
2. Where is data stored and processed, by country or region?
3. Is the product generally available, or in beta? Under consumer terms or business terms?
4. Can I sign a data-processing agreement with you? Send it.
5. How do I delete everything you hold for my account, and how long does deletion take?
6. Which sub-processors handle my data?
7. Can I restrict the agent to read-only access per account?
8. Is there a complete log of what the agent did, exportable by me?
9. What is the spend cap, and what happens when it is reached?
10. What is your notice period for changes to the terms, and how are customers told?

**Done when:** all ten are answered in writing for every connected vendor, and the answers are stored with the role card.

---

## Part 7 — Five things never to automate

Post this where the agents are configured.

1. **Advice.** Anything that tells a client what to do goes through a lawyer, unassisted, every time.
2. **Sending.** No agent has send rights on client correspondence.
3. **Conflict decisions.** An agent can surface a name match. It never decides whether a conflict exists.
4. **Filing deadlines.** An agent can list them. It never calendars them without confirmation, and it is never the only place a deadline lives.
5. **Anything involving a vulnerable party or a court.** The stakes are asymmetric and the agent does not know it.

**Done when:** the list is acknowledged on every role card.

---

## Part 8 — 30-day rollout

| Week | Do | Do not |
|---|---|---|
| 1 | Complete Parts 1–3 for one agent, one task. Connect one account, read-only. Run in draft-only mode. Read every output. | Connect a second account. Give write access. Tell clients the setup is finished. |
| 2 | Keep the log daily. Rewrite the recipe once, based on what the outputs got wrong. Answer the ten vendor questions. | Add a second agent. |
| 3 | Adapt and adopt the engagement-letter clause. Decide, in writing, whether the agent earned write access to one narrow action, and to what. | Grant send rights. |
| 4 | Review the month's log with a colleague. Decide whether to continue, narrow, or stop. Only then consider a second agent, starting again at Part 1. | Skip the review. |

**Done when:** the month-end review is written and the decision is recorded on the role card.

---

*Questions about this kit: reply to the email that delivered it. I answer in writing.*

*This kit is written by Moses Dor, Adv., in his personal capacity as a practising attorney and is for general information only. It is not legal advice, does not create an attorney-client relationship, and does not recommend any vendor or product. Every clause and checklist must be adapted and reviewed by a licensed practitioner in your own jurisdiction. BizLegal AI (DOR INNOVATIONS), which processes payment and delivery, is a software company, not a law firm.*
`.trim()
