/**
 * Track V2 — Founder Legal & Compliance Literacy. Guide-synthesized.
 *
 * Audience is non-lawyer founders and operators. The job is literacy: knowing
 * which obligations attach to you, how to read a document someone sends you,
 * and — most importantly — when to stop and get a lawyer.
 *
 * Every lesson carries a `sourceGuide` pointing at a real page in lib/guides.ts,
 * because that is where the depth is. The lesson is the orientation; the guide is
 * the reference. Verify any href you add here against GUIDES before shipping —
 * a broken sourceGuide is a broken promise to the reader.
 */
import type { Track } from '../types'

export const FOUNDERS: Track = {
  slug: 'founders',
  name: 'Legal & Compliance Literacy for Founders',
  audience: 'Non-lawyer founders and operators running a company without in-house counsel',
  promise:
    "Know which obligations actually attach to your company, how to read the documents people send you, and when the answer is to stop and call a lawyer.",
  productId: 'academy_founders_annual',
  priceUsd: 180,
  lessons: [
    {
      slug: 'the-obligations-that-attach-to-every-new-company',
      title: 'The Obligations That Attach to Every New Company',
      summary:
        "Incorporating creates duties immediately, most of them recurring, and none of them announced. Here is the standing list.",
      minutes: 10,
      free: true,
      sections: [
        {
          heading: 'Nobody sends you the list',
          paragraphs: [
            "Forming a company is a single transaction, but it switches on a set of continuing obligations. No authority sends a founder a consolidated list of them, and most are enforced by penalty rather than reminder. The result is a predictable pattern: a company operates for a year or two, then discovers it has been non-compliant with something the whole time.",
            "The categories below are stable across most jurisdictions. What varies is the specific filing, the deadline, and the penalty — which is why each one ends in a question you need answered for your own jurisdiction rather than a rule you can apply from here.",
          ],
        },
        {
          heading: 'The four standing categories',
          paragraphs: [
            "Nearly everything a small company gets wrong falls into one of these.",
          ],
          bullets: [
            "Entity maintenance — the recurring filings that keep the company in good standing: annual reports or confirmation statements, registered agent or office, and keeping the registry's record of directors and address current. Cheap to do, disproportionately damaging to miss, because a company not in good standing can lose the ability to contract or enforce.",
            "Ownership transparency — a growing number of jurisdictions require companies to identify the real humans who own or control them, and to report that to a registry and keep it updated when it changes. This is separate from the entity filing and is often missed entirely.",
            "Tax and employment registration — tax registrations, payroll registration and withholding once anyone is paid, and the classification question of whether the people working for you are employees or contractors. Misclassification is assessed retroactively, which is what makes it expensive.",
            "Data obligations — if you handle personal data about identifiable people, duties attach based on where those people are, not where you are. This one surprises founders most because it is triggered by the users you serve, not by anything you filed.",
          ],
        },
        {
          heading: 'Turn it into a calendar, not a project',
          paragraphs: [
            "The useful move is not to solve all four at once. It is to convert each into a dated recurring item with an owner. Most of these obligations are annual and mechanical; the damage comes from them being invisible, not from them being hard.",
            "Write down, for each category: what the filing is, when it is due, who does it, and what the penalty is for missing it. If you cannot answer the deadline for one of them, that is your most urgent unknown.",
          ],
        },
      ],
      sourceGuide: '/guides/startup-compliance-program-guide',
      cta: {
        label: 'Get a compliance baseline for your company',
        href: 'https://lexaudit.bizlegal-ai.com',
        note:
          "Produces a scored view of where the gaps are across these categories, which is a faster way to find your unknowns than working through them one at a time.",
      },
    },

    {
      slug: 'how-to-read-a-contract-someone-sends-you',
      title: 'How to Read a Contract Someone Sends You',
      summary:
        "You will not out-lawyer their lawyer. You do not need to. You need to find the five terms that decide what happens when things go wrong.",
      minutes: 12,
      free: true,
      sections: [
        {
          heading: 'Read for consequences, not for comprehension',
          paragraphs: [
            "A contract someone sends you was drafted by their side, for their side. Reading it front to back looking for anything objectionable is slow and does not work, because the terms that hurt are rarely the ones that read as aggressive.",
            "Read instead for a specific short list. Every term below answers the question: if this relationship goes badly, what happens to me?",
          ],
        },
        {
          heading: 'The five terms that carry the risk',
          paragraphs: [
            "Find these five, in this order, and you understand your exposure even if you understand nothing else in the document.",
          ],
          bullets: [
            "Liability — is your exposure capped, and at what number? An uncapped liability clause, or a cap set at a multiple of fees rather than a fixed sum, is the single most consequential term in most commercial contracts.",
            "Indemnity — what are you promising to cover on their behalf, and is it mutual? A one-way indemnity for broad categories of claim can dwarf the value of the deal.",
            "Term and termination — how long are you bound, does it auto-renew, how much notice must you give, and can you exit for convenience or only for cause? Auto-renewal with a long notice window is how a cancelled service keeps billing.",
            "Intellectual property — who owns what is created, and what licence are you granting in anything you put into their system? Watch for grants broader than the service requires.",
            "Data — what happens to your data or your users' data: where it goes, who processes it, whether it is used to train anything, and what happens to it on termination.",
          ],
        },
        {
          heading: 'What to do with what you find',
          paragraphs: [
            "Finding a bad term does not mean you cannot sign. Most of these are negotiable, and asking for a liability cap or a mutual indemnity is routine rather than hostile. The failure mode is signing without knowing which of the five you conceded.",
            "The line for escalating to a lawyer is worth setting in advance: uncapped liability, a broad IP assignment, or anything where the downside exceeds what the company can absorb. Below that line, informed self-service is reasonable. Above it, the review costs less than the term does.",
          ],
        },
      ],
      sourceGuide: '/guides/contract-risk-analysis-guide',
      cta: {
        label: 'Run a contract through an automated risk scan',
        href: 'https://docai.bizlegal-ai.com',
        note:
          "Does exactly the pass above on a document you upload: locates the liability, indemnity, term, IP, and data clauses and flags the unusual ones so you know what you are conceding.",
      },
    },

    {
      slug: 'when-you-need-a-lawyer-and-when-you-dont',
      title: 'When You Need a Lawyer and When You Do Not',
      summary:
        "The expensive mistake is not using lawyers too little or too much. It is using them on the wrong things.",
      minutes: 11,
      free: false,
      sections: [
        {
          heading: 'Cost is the wrong axis',
          paragraphs: [
            "Founders tend to decide legal spend by price: do it yourself if it seems cheap, hire someone if it seems expensive. That produces both failure modes at once — paying for routine document work while making irreversible decisions unadvised.",
            "The better axis is reversibility. How hard is this to undo if it turns out wrong?",
          ],
        },
        {
          heading: 'Sort the work by how reversible it is',
          paragraphs: [
            "Almost every legal task sorts cleanly into three tiers, and the tier tells you who should do it.",
          ],
          bullets: [
            "Reversible and mechanical — annual filings, registered agent, standard registrations, keeping records current. Do these yourself or automate them. A mistake here is corrected by refiling.",
            "Reversible but consequential — reviewing an inbound vendor contract, a standard NDA, a routine customer agreement. Do the first pass yourself using the five-term read, escalate the specific term you are unsure about. You are buying a targeted answer, not a full review.",
            "Hard to reverse — anything touching equity and ownership, founder departures, employee-versus-contractor classification at scale, regulated activity, and any dispute where a deadline has started running. Get advice before acting, not after. These are the decisions where the cost of being wrong is not measured in fees.",
          ],
        },
        {
          heading: 'How to buy a small amount of legal help well',
          paragraphs: [
            "The most useful thing you can do is arrive with a specific question and the relevant documents, rather than a general worry. Cost tracks how much of the work the adviser has to do to understand your situation.",
            "It is also worth deciding in advance whether your need is episodic or continuous. If legal and compliance questions arrive weekly, per-matter engagement gets expensive and slow, and a standing arrangement usually costs less than the same volume billed piecemeal. If they arrive twice a year, it does not.",
            "Either way, the reversibility test tells you when to stop reading and pick up the phone — and that is the single judgement this lesson is trying to install.",
          ],
        },
      ],
      sourceGuide: '/guides/fractional-cco-vs-compliance-retainer',
      cta: {
        label: 'Compare ongoing support against per-matter fees',
        href: '/pricing',
        note:
          "Relevant only if your questions arrive continuously rather than occasionally — the guide behind this lesson works through which of the two you actually are.",
      },
    },

    {
      slug: 'personal-data-the-obligation-you-did-not-opt-into',
      title: 'Personal Data: The Obligation You Did Not Opt Into',
      summary:
        "Data duties attach based on whose data you hold, not where your company is. That is why founders miss them.",
      minutes: 13,
      free: false,
      sections: [
        {
          heading: 'Triggered by your users, not your filings',
          paragraphs: [
            "Every other obligation in this track is triggered by something you did: you incorporated, you hired, you registered. Data protection is different. It attaches because of who your users are and where they are, which means you can acquire the obligation by signing up a customer.",
            "The practical consequence is that a small company serving users in several regions can be subject to several regimes at once, without having taken any deliberate step to come within any of them.",
          ],
        },
        {
          heading: 'The four questions that define your position',
          paragraphs: [
            "You do not need to know the detail of every regime. You need to be able to answer these four, because every regime asks versions of them.",
          ],
          bullets: [
            "What personal data do you hold, and where does it live? A current inventory is the foundation. Without it, no other question can be answered honestly, and most companies discover their inventory is larger than they assumed.",
            "On what basis do you hold it? Every regime requires a lawful reason to process personal data, and consent is only one of them — often not the strongest. Getting this wrong invalidates the processing, not just the paperwork.",
            "Who else touches it? Every vendor that processes personal data on your behalf sits inside your compliance perimeter, usually requires a written data processing agreement, and remains your responsibility. Your analytics, support desk, and AI tooling all count.",
            "What rights do your users have, and can you actually honour them? Access, correction, deletion, and export requests come with deadlines. A right you cannot technically deliver is a compliance gap that only becomes visible when someone asks.",
          ],
        },
        {
          heading: 'Where AI tooling quietly changes the answer',
          paragraphs: [
            "Adding an AI vendor to your stack is a data decision, not only a product decision. If personal data flows into it, that vendor is a processor: it needs to be in your inventory, covered by an agreement, and diligenced on where data goes and whether it is used for training.",
            "This is the most common new gap in otherwise reasonable programmes, because AI tools get adopted by individual teams without going through vendor review. Worth auditing specifically rather than assuming it is covered.",
            "As with everything in this track, which regime applies to you and what it requires is a question for counsel who knows your jurisdiction and your data flows. The four questions above are what you should be able to answer before that conversation, so that it is short.",
          ],
        },
      ],
      sourceGuide: '/guides/gdpr-compliance-checklist-saas',
      cta: {
        label: 'Score your data compliance position',
        href: 'https://lexaudit.bizlegal-ai.com',
        note:
          "Turns the four questions above into a scored gap list, including the vendor and processor coverage that is usually the weakest part.",
      },
    },
  ],
}
