/**
 * Track V1 — Real Estate. Founder-authored.
 *
 * This track carries real authority because Moses is a practicing real estate
 * lawyer. That is also the constraint: the lessons here teach STRUCTURE — how a
 * transaction actually fails, what a clause is load-bearing for, where AI helps
 * and where it must not be trusted. They do NOT contain case studies, because
 * inventing one would destroy the only thing that makes this track worth buying.
 *
 * `founderNote` marks each spot where Moses drops in a real matter from his own
 * practice. It renders as a visible editorial placeholder until he does.
 *
 * Note: no `sourceGuide` on these lessons. The /guides library is compliance-led
 * (SaaS, fintech, crypto) and has no property content, so there is nothing
 * honest to cite. Do not attach unrelated guides just to fill the field.
 */
import type { Track } from '../types'

export const REAL_ESTATE: Track = {
  slug: 'real-estate',
  name: 'AI for Real Estate Transactions',
  audience: 'Agents, brokers, and investors who move deals to closing',
  promise:
    "Understand what actually breaks a deal between contract and closing, and how to use AI on the paperwork without getting burned by it.",
  productId: 'academy_realestate_annual',
  priceUsd: 240,
  lessons: [
    {
      slug: 'what-kills-deals-between-contract-and-closing',
      title: 'What Actually Kills a Deal Between Contract and Closing',
      summary:
        "The signature is not the finish line. Most deals that die, die in the gap between contract and closing, and they die from a short list of causes that repeat.",
      minutes: 9,
      free: true,
      sections: [
        {
          heading: 'The gap is where the risk lives',
          paragraphs: [
            "A signed purchase contract is not a completed sale. It is a conditional promise with a set of deadlines attached, and most of those conditions are the buyer's or seller's to satisfy. Between signature and closing there is a period — often 30 to 60 days, sometimes far longer on commercial deals — where obligations come due one after another.",
            "Deals rarely collapse because someone changed their mind. They collapse because a condition went unsatisfied, a deadline passed unnoticed, or a defect surfaced that nobody had gone looking for. Each of those is preventable by someone tracking the file. That is the job this lesson is about.",
          ],
        },
        {
          heading: 'The recurring causes',
          paragraphs: [
            "Across jurisdictions and deal types, the failure modes repeat. The specific legal consequence of each one depends entirely on your contract and your jurisdiction — but the pattern of what to watch does not.",
          ],
          bullets: [
            "Title defects — a lien, judgment, unreleased mortgage, or break in the chain of title that surfaces on the title search rather than before it.",
            "Financing falling through — an appraisal below contract price, a loan condition the buyer cannot satisfy, or a rate lock expiring during a delay.",
            "A contingency deadline passing unnoticed — inspection, financing, or due diligence periods that lapse and silently convert a conditional obligation into an unconditional one, or forfeit a right to walk.",
            "Survey and boundary problems — encroachments, easements nobody disclosed, or a footprint that does not match what the parties assumed they were trading.",
            "Undisclosed condition — physical defects, unpermitted work, or open code violations found late.",
            "Association and estoppel issues — unpaid dues, pending special assessments, or transfer restrictions from an HOA or condo board that only appear when the estoppel certificate arrives.",
            "Entity and authority problems — the person signing lacks the authority to bind the owner, or the selling entity is not in good standing.",
          ],
        },
        {
          heading: 'Why the deadline failures are the ones worth automating',
          paragraphs: [
            "Look at that list again and separate it into two kinds of problem. Title defects, survey issues, and undisclosed conditions are discovery problems — you find them by ordering the right search and reading the result. They need expertise, not tracking.",
            "Contingency lapses are a different animal. Nothing was hidden. The information was in the contract from day one. The deal died because a date arrived and no one acted on it. That is a tracking failure, and tracking failures are exactly what software is good at eliminating.",
            "This is the single highest-leverage place to point AI in a real estate practice, and it is where the rest of this track focuses. Not on judgment — on never losing a date again.",
          ],
        },
      ],
      founderNote:
        "A deal from my own practice that died in the gap — which cause, what the early signal was, and what would have caught it.",
      cta: {
        label: 'See how contract review surfaces obligations',
        href: 'https://docai.bizlegal-ai.com',
        note:
          "The next lesson is about reading a contract for its deadlines. If you want to see a machine do that pass on a real document first, this is the tool that does it.",
      },
    },

    {
      slug: 'reading-a-purchase-contract-for-its-deadlines',
      title: 'Reading a Purchase Contract Like the Lawyer Who Will Litigate It',
      summary:
        "Most people read a contract for the price. The parts that decide whether you win a dispute are the contingencies, the deadlines, and the remedies.",
      minutes: 12,
      free: true,
      sections: [
        {
          heading: 'The price is the least interesting term',
          paragraphs: [
            "When a transaction goes wrong, nobody argues about the purchase price. It is written plainly and both sides agree on it. The fight is always about whether a condition was satisfied, whether notice was given in time, and what the other side is now entitled to.",
            "So when you read a purchase contract, read it in the order a dispute would attack it. That means starting with the structural terms, not the commercial ones.",
          ],
        },
        {
          heading: 'The four things to extract from any purchase contract',
          paragraphs: [
            "Whatever the form, whatever the jurisdiction, you are looking for the same four categories. Get these onto one page and you understand the deal.",
          ],
          bullets: [
            "Conditions — what has to be true or happen for each side to be obligated to close. Inspection satisfaction, financing approval, clear title, board consent, permit issuance.",
            "Deadlines — the date each condition expires, and critically, what happens on expiry. Some contracts terminate the right. Others waive the condition and leave you bound. These are opposite outcomes from the same silence.",
            "Notice mechanics — who must be told, in what form, at what address, by when. A right exercised late, or by email when the contract required written notice to counsel, may not have been exercised at all.",
            "Remedies — what each side actually gets on the other's default. Deposit forfeiture, specific performance, termination and refund, damages. This is the term that decides how much the deadlines matter.",
          ],
        },
        {
          heading: 'Deadlines that are silent are the dangerous ones',
          paragraphs: [
            "The most common expensive mistake is assuming a contingency deadline protects you by default. It often does the reverse. A financing contingency that expires without the buyer terminating can leave the buyer obligated to close without financing — and exposed on the deposit.",
            "So for every deadline you extract, write down the consequence of doing nothing. If the answer is that a right disappears or an obligation hardens, that date belongs on a calendar with a reminder well before it, not just a note in the file.",
          ],
        },
        {
          heading: 'Where the contract is not the whole picture',
          paragraphs: [
            "A purchase contract sits on top of other documents that can override or complicate it: the title commitment and its exceptions, the survey, association governing documents, existing leases if the property is tenanted, and any loan commitment.",
            "Extracting the contract cleanly is step one, not the whole job. When a term in one of those documents conflicts with your reading of the contract, that is a question for counsel in the relevant jurisdiction — not something to resolve from the contract alone.",
          ],
        },
      ],
      founderNote:
        "A contingency clause I have seen drafted badly, what it actually did to the party relying on it, and how it should have read.",
      cta: {
        label: 'Run a contract through an automated review',
        href: 'https://docai.bizlegal-ai.com',
        note:
          "This is the extraction pass described above, run by machine: conditions, dates, obligations, and unusual terms pulled out of the document so you can check them rather than hunt for them.",
      },
    },

    {
      slug: 'using-ai-on-transaction-documents-without-trusting-it-blindly',
      title: 'Using AI on Transaction Documents Without Trusting It Blindly',
      summary:
        "AI is genuinely good at extraction and genuinely unreliable at judgment. Knowing which is which is the whole skill.",
      minutes: 14,
      free: false,
      sections: [
        {
          heading: 'Two different jobs, two different reliability profiles',
          paragraphs: [
            "Almost every mistake people make with AI on legal documents comes from treating one capability as if it were the other.",
            "Extraction is finding what the document says: pulling out dates, parties, defined terms, obligations, notice addresses, dollar amounts. The answer exists in the text, and the model can point at where. This is where current tools are strong and where the time savings are real.",
            "Judgment is deciding what the text means and what to do about it: whether a clause is enforceable, whether a condition was satisfied, whether the deal is worth doing on these terms. The answer is not in the document — it depends on jurisdiction, case law, the other documents, and facts outside the file. This is where models produce confident, fluent, wrong answers.",
          ],
        },
        {
          heading: 'The verification discipline',
          paragraphs: [
            "The workflow that works treats AI output as a draft index of the document, never as a conclusion. Four rules make that safe.",
          ],
          bullets: [
            "Demand a citation for every extracted item. If the tool cannot point to the clause it came from, treat the item as unverified. An extraction you cannot trace is a guess with good grammar.",
            "Human-check anything that creates a deadline, waives a right, or moves money. These are the items where an error is expensive and irreversible, and they are a small fraction of the total — so checking them all is actually feasible.",
            "Never let a model answer a question the document does not contain. Enforceability, jurisdictional effect, and whether a term is market are all outside what extraction can tell you.",
            "Watch for omissions, not just errors. Models are far more likely to miss a clause than to invent one, and a missing deadline is invisible in the output. Reconcile the extracted date list against the contract's own structure.",
          ],
        },
        {
          heading: 'A practical division of labour',
          paragraphs: [
            "In practice this produces a clean split. The machine reads the whole document and produces the obligation and date inventory. You spend your attention on the handful of items that carry consequence, and on the questions that require knowing the law rather than knowing the document.",
            "That is a large time saving on a task that is mostly mechanical, without handing off the part where being wrong actually costs something. It is also why the output of a good tool looks like a checklist with citations rather than a memo with conclusions.",
          ],
        },
      ],
      founderNote:
        "A document where an automated pass missed something material, what it missed, and the check that caught it.",
      cta: {
        label: 'See a cited, checklist-style contract review',
        href: 'https://docai.bizlegal-ai.com',
        note:
          "Built to the discipline in this lesson: extraction with clause references, flagged obligations and dates, and no conclusions about enforceability.",
      },
    },

    {
      slug: 'cross-border-buyers-the-compliance-layer',
      title: 'Cross-Border Buyers: The Compliance Layer Most Deals Ignore',
      summary:
        "When the buyer is a foreign person or entity, a second set of obligations attaches to the deal that has nothing to do with the property.",
      minutes: 13,
      free: false,
      sections: [
        {
          heading: 'A second file runs alongside the property file',
          paragraphs: [
            "A domestic cash purchase between two individuals has one workstream: the property. Once a party is a foreign person, or the buyer is an entity with layered ownership, a parallel workstream appears — identity, ownership, funds, and sanctions — and it can delay or kill a closing entirely independently of anything about the property.",
            "Agents and brokers are usually the first to encounter this and the last to be briefed on it. The point of this lesson is to recognise the categories early enough that they get handled in parallel rather than discovered at closing.",
          ],
        },
        {
          heading: 'The four categories to raise early',
          paragraphs: [
            "The specific rules depend heavily on where the property is, where the money is coming from, and what kind of entity is buying. What follows is the map of what to ask about, not a statement of any jurisdiction's requirements.",
          ],
          bullets: [
            "Entity and ownership structure — who ultimately owns the buying entity. Many jurisdictions now require beneficial ownership to be identified and, in some cases, reported to a government registry. Layered or foreign-parent structures take real time to document.",
            "Source of funds — where the purchase money originates and whether that can be evidenced. Banks, title companies, and escrow agents apply their own standards here, and an unevidenced international transfer can stall a closing regardless of the contract.",
            "Sanctions and screening — whether any party, owner, or controlling person appears on an applicable sanctions or restricted-party list. This is a hard stop, not a paperwork delay, and it applies to the people behind the entity, not only the named buyer.",
            "Tax obligations on the transaction — several jurisdictions impose withholding or reporting duties when a foreign person disposes of, or acquires, real property. Who is responsible for withholding, and at what point, is jurisdiction-specific and needs local tax and legal input on the actual deal.",
          ],
        },
        {
          heading: 'Sequence it, or it becomes the critical path',
          paragraphs: [
            "None of the four categories is fast. Documenting beneficial ownership through a foreign parent, obtaining bank evidence for a cross-border transfer, and getting a tax determination all take time measured in weeks, and they are largely independent of each other.",
            "So start them at contract, not at closing. The failure pattern is uniform: the property side runs on schedule, the compliance side starts late because nobody owned it, and the closing moves. Assigning that workstream to someone on day one is most of the fix.",
            "Which specific obligations attach to your deal is a question for counsel and tax advisers in the relevant jurisdiction. This lesson is a map of what to ask, so that the questions get asked while there is still time to answer them.",
          ],
        },
      ],
      founderNote:
        "A cross-border purchase I handled — which of the four categories became the critical path, and how far it moved the closing.",
      cta: {
        label: 'Beneficial ownership reporting, handled',
        href: 'https://forge.bizlegal-ai.com',
        note:
          "If the buying entity has a beneficial ownership reporting obligation, this is the filing kit for it — the first of the four workstreams above that you can simply take off the table.",
      },
    },
  ],
}
