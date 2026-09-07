# Workflow — Israeli second-hand residential sale: milestones, deadlines, ownership, dependencies

**Authored by Moses (practising Israeli real-estate lawyer), 2026-09-08.** This is the practitioner review the DEAL44 template was waiting for, and it supersedes the agent-drafted version entirely.

Assumption: a second-hand residential apartment registered in the Land Registry (Tabu), the buyer financing part of the consideration with a mortgage, both sides represented by counsel.

---

## The classification every deadline must carry

| Kind | Meaning |
|---|---|
| **Statutory** | Fixed by statute or regulations. |
| **Contractual** | Fixed by the sale agreement. |
| **Operational** | A customary period for doing something. Not a legal obligation. |
| **Third-party** | Derived from a bank, an authority, a management company, the ILA. |
| **Judgment** | Cannot be fixed without reading the agreement, the circumstances or the applicable law. |

Implemented as `TaskSpec.source` in `packages/closing-engine/src/tasks.ts`. It is required on every task, because the counting rule follows the source and nothing else.

---

## 1 — Milestone order

**A sale is not one linear process.** After signing, four tracks run in parallel: contract, tax, mortgage, registration.

**Before signing:** current title extract; identify owner and rights; check mortgages, attachments, caveats and restrictions; check the state of registration and whether the apartment matches the registered rights; seller's documents; the seller's existing mortgage if any; the buyer's ability to obtain finance; agree the payment mechanism, handover and registration documents.

> A title extract reflects the legal state of rights **at the moment it was issued**. Never rely on a historic extract for a substantive step.

**Immediately after signing, at minimum:** report the transaction to Real Estate Taxation; register the buyer's caveat; open or complete the buyer's mortgage process; deliver the bank's documents to the seller and their counsel; deal with the seller's existing mortgage; begin collecting the registration documents and clearances.

**Then, in parallel:** mortgage approval; valuation; completing the bank file; the seller's signatures on the bank's documents; the bank's caveat or undertaking; tax reporting and payment; tax clearances; municipal clearance; discharge of the seller's mortgage; the consideration payments; handover; delivery of registration documents; registration of ownership; registration of the mortgage; a final title extract, checked for conformity.

**Do not build a template of twenty fixed tasks. Build a dynamic workflow that generates tasks from the characteristics of the deal.**

## 2 — Tax

Both seller and buyer must declare **within 30 days of the sale date** (s.73). That is the one clock the system computes.

**Payment is a different obligation from declaration.** Purchase tax runs under s.90 and the self-assessment rules, and special provisions apply in some cases. **There is no universal "60 days from signing"** — the agent's draft invented that and it is gone. The same separation applies to capital gains tax: route, assessment and circumstances govern.

Alert wording is neutral and names no sum: a fine is computed under the law and the amounts in force at the relevant time, never hardcoded.

## 3 — Business days vs calendar days

There is **no uniform Israeli rule** that everything in a real-estate transaction counts in business days.

- **Statutory:** count per the Interpretation Law and the specific statute. **Never convert "days" to "business days" automatically.**
- **Contractual:** follow the agreement's own wording. If it says ימים, it does not mean ימי עסקים.
- **Friday, Saturday, holidays:** examine the source of the obligation, how the statute defines the period, whether the last day is a statutory day of rest, whether the statute has a special provision, and whether the agreement has a postponement mechanism. **No blanket rule that a Friday deadline moves to Sunday.**

## 4 — Which days stop the clock

**There is no single holiday calendar.** Court dates, Land Registry, banks, the ILA and operational steps each keep their own. That an institution is closed does not mean the day does not count in law.

Never auto-exclude: Friday · erev chag · chol hamoed · Purim · fast days · short working days. Shabbat and statutory rest days: examine under the applicable law.

## 5 — The caveat

No universal statutory "X days after signing". As risk management, open the task at signing and register as soon as the documents allow. Usually the buyer's counsel, but ownership follows the agreement.

**The bank's caveat or undertaking is a separate task, not a sub-task of the buyer's.** It depends on the bank's requirements, the seller's signatures, and what the registry permits.

## 6 — Mortgage

Separate the bank's requirements from the parties' contractual obligations. Requirements are not uniform between banks and must not be presented as a statutory list.

| Action | Primary owner |
|---|---|
| Approval in principle | Buyer |
| Completing the mortgage file | Buyer / bank |
| Valuation | Buyer / bank |
| Delivering the bank's documents to the seller | Buyer's counsel |
| Seller's signature | Seller |
| Authenticating signatures | Per the bank's requirement |
| Registering the bank's security | Buyer's counsel, where so agreed |
| Payoff letter for the seller's mortgage | Seller / seller's counsel |
| Discharging the seller's mortgage | Seller |
| Registering the new mortgage | Buyer / buyer's counsel |

**A bank's handling time is an estimate, never a legal deadline.**

## 7 — Registration routes

Separate templates, at minimum: Tabu · ILA (רמ"י) · management company (חברה משכנת) · ILA + management company · property outside the ordinary register.

The reason is not filing tidiness: the source of the right, the body administering it and the documents required all differ, and the ILA route adds conditions about lease validity, arrears and whether the transfer can be effected at all.

A transaction in land is completed by registration; until then it is an undertaking to carry out a transaction.

**DEAL44 must never run the Tabu checklist against an ILA or management-company property.** Implemented in `packages/closing-engine/src/templates/il-registration.ts`.

## 8 — The payment schedule

Contractual, always. Never templated. Extract from the agreement: number of instalments, each amount, each date, any condition precedent, documents that condition a payment, the component discharging the seller's mortgage, the mortgage-funded component, any sum held in trust, the final payment date, the handover conditions.

Two, three, four or more instalments are all possible. **Do not define "final payment = possession".** The final payment follows the mechanism in the agreement, subject to its conditions for handover and delivery of the registration documents.

## 9 — Vocabulary

Hebrew and English labels live in `apps/deal44/lib/i18n/{he,en}.ts`, keyed `task.il.*`. "Review with your counsel" appears where the step or its date requires interpreting the agreement, the law or the state of title — **not** on every administrative action.

## 10 — What AI may not date

**Never auto-dated:** the consideration payments · the final payment · handover of possession · the mortgage transfer · discharge of the seller's mortgage · delivery of a document the agreement ties to another event · final registration where an authority controls it · completion of the ILA process · completion of the management-company process · anything whose trigger is not unambiguous.

**May be computed:** statutory reporting deadlines · internal alerts · follow-ups · operational targets · a date derived directly from an unambiguous contractual clause.

Every computed date stores **Trigger → Rule → Duration → Calendar → Result → Source**, not just the final date. Implemented as `DateProvenance`, persisted to `deal_tasks.provenance`.

Enforcement: `TaskSpec.autoDate` defaults to **false**. Only two tasks in the Israeli template opt in — the buyer's and the seller's declarations. A test asserts exactly that list.

---

## Why this shape

The point of failure in a sale is rarely a single statutory date. Operationally the common ones are completing the mortgage documents, discharging an existing mortgage, obtaining tax and municipal clearances, and assembling the registration package.

So the system is not a calculator of twenty dates. It manages a legal critical path:

**signing → reporting → caveat → finance → security → tax → registration clearances → payments → handover → final registration**

Each milestone carries source · trigger · owner · deadline · dependency · document · calendar · status · escalation.

That is what prevents the central failure of legal AI systems: presenting a computed date as a settled legal fact when it actually depends on the agreement, a document not yet received, a third party, or a question of interpretation.
