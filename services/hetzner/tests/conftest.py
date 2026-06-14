"""Shared fixtures for hetzner curator tests."""
from __future__ import annotations

import pytest


GOOD_MDX_BODY = """\
# MiCA Article 6 Disclosure Requirements: What Crypto Issuers Must Do Now

The Markets in Crypto-Assets Regulation entered application on December 30, 2024.
Issuers who cannot answer "what does Article 6 require?" in the next 90 days
will face market suspension, not merely a fine.

## TL;DR

- Article 6 mandates a crypto-asset white paper for all public offers over 1 million euros.
- The white paper must be approved by the issuer's home-member-state NCA before launch.
- Failure to file triggers a publication ban, not just a monetary penalty.
- First-time issuers should budget 90 days for the full approval cycle, not the statutory 20 days.
- ESMA published binding Q&As in June 2024 that expand Article 6 obligations for stablecoin issuers.

## What MiCA Article 6 Requires

Under Article 6, any entity offering crypto-assets to the public in the EU must publish a
crypto-asset white paper before the first offer. The requirement applies to offers where the
total consideration from all investors exceeds one million euros calculated over 12 months.
Token issuers, DAOs with delegate governance structures, and third-party offering platforms
all fall within scope depending on the distribution chain.

### White Paper Content

The white paper must include the issuer's identity, the rights and obligations attached to
the crypto-asset, the principal risks, and the technology underlying it. Annex I of MiCA
lists the mandatory disclosure items. A checklist approach is insufficient. The ESMA Q&As
from June 2024 clarify that issuers must include a risk-factor section that names specific
smart-contract audit findings and describes mitigation steps taken.

### Approval Timeline

NCAs have 20 working days to approve or raise an objection. In practice, the CSSF in
Luxembourg and the AMF in France have both confirmed that the 20-day clock starts only
when they consider the application complete. Incomplete applications are returned without
starting the statutory clock.

### Passporting Rights

Once approved by a home-member-state NCA, the white paper can be passported across all
27 EU member states via an ESMA notification. The issuer must publish the notification
on ESMA's register and on its own website before expanding into other member states.

## What This Means for Your Company

If you are issuing stablecoins or utility tokens to EU retail investors, you need a
compliant white paper on file before launch. This is not a post-launch registration like
a GDPR record-of-processing activity. The white paper must be approved before the first
euro of consideration changes hands.

In practice, most issuers underestimate the NCA review queue. We have seen approval
timelines stretch to 30-35 working days in Q1 2025 at the BaFin and CSSF, because both
regulators published internal guidance requiring a second technical review for issuers
using novel consensus mechanisms. Budget 90 days minimum for the first application.

Exchanges and trading platforms that list tokens are also subject to MiCA obligations.
Article 51 requires platforms to verify that a valid white paper exists and is accessible
to investors before admitting a token to trading. This shifts liability if an issuer
submits a deficient white paper and the platform lists the token anyway.

## How to Operationalize

1. Map your offering against Annex I checklist items before engaging outside counsel.
   This one step typically saves two billable hours per outside counsel engagement.
2. Engage outside counsel familiar with ESMA Q&As, not simply the regulation text.
   The ESMA June 2024 guidance is not reflected in the plain text of MiCA.
3. Submit 60 days before planned launch to buffer for NCA feedback rounds.
4. Maintain a live version-control log of white paper revisions with timestamps.
   NCA review staff compare submitted versions against prior drafts during review.
5. If passporting to additional member states, notify ESMA at least 20 working days
   before making the offer in the new jurisdiction.

## Common Mistakes and How to Avoid Them

The most common error is treating MiCA like GDPR and assuming a privacy lawyer
can cover both practice areas. Crypto-specific legal expertise is materially
different from data-protection expertise, and the overlap is small.

Watch out: NCAs have issued formal deficiency notices for white papers drafted
by general-practice firms with no MiCA track record. The AMF issued 14 such
notices in Q1 2025 for issuers who submitted white papers that lacked the
Annex I technical section covering smart-contract audit findings.

A second common mistake is relying on the statutory 20-day clock and planning
a launch date around it. Because NCAs reset the clock on incomplete submissions,
issuers have launched too early and then had to suspend offers mid-campaign.
One UK-based issuer that expanded into the EU in February 2025 faced an emergency
suspension after the BaFin found their smart-contract audit section did not address
a known re-entrancy vulnerability documented in the public audit report.

## FAQ

**Q: Does Article 6 apply to NFTs?**
A: Generally no. NFTs are typically excluded under Article 2(3) unless they
are fungible in practice. ESMA's June 2024 guidance clarifies the fungibility
test: tokens that are interchangeable on secondary markets and traded in bulk
lots are treated as fungible regardless of the issuer's labeling.

**Q: What happens if we offer without an approved white paper?**
A: The NCA can issue a public notice prohibiting the offer, which is effectively
a market suspension. Fines can reach 5 million euros or 3% of annual turnover,
whichever is higher. For larger issuers, the fine scale escalates further under
Article 111.

**Q: Can we use a white paper approved in one member state across the EU?**
A: Yes. Passport notification to ESMA allows the approved white paper to cover
all 27 EU member states without re-approval in each jurisdiction. The notification
must be submitted through ESMA's official passporting portal and takes effect
20 working days after receipt.

## Sources

- https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1114
- https://www.esma.europa.eu/press-news/esma-news/esma-publishes-first-guidance-mica
- https://www.esma.europa.eu/sites/default/files/2024-06/ESMA75-453128700-1372.pdf

## Disclaimer

This content is regulatory intelligence, not legal advice. Consult qualified
counsel before making compliance decisions. BizLegal-AI v1.0.0-p1.
"""

GOOD_DRAFT: dict = {
    "title": "MiCA Article 6 Disclosure Requirements: What Crypto Issuers Must Do Now",
    "slug": "mica-article-6-disclosure-requirements",
    "description": "MiCA Article 6 mandates crypto-asset white papers for EU public offers. Here's what compliance officers need to do before December 2025.",
    "category": "regulation",
    "jurisdiction": "EU",
    "regulation_tag": "MiCA",
    "tags": ["mica", "crypto", "eu", "white-paper", "compliance"],
    "primary_keyword": "MiCA Article 6",
    "secondary_keywords": ["crypto-asset white paper", "EU crypto regulation"],
    "target": "blog",
    "mdx_body": GOOD_MDX_BODY,
    "mermaid": ["flowchart TD\n  A[Issuer] --> B[Draft White Paper]\n  B --> C[NCA Review]\n  C --> D{Approved?}\n  D -->|Yes| E[Publish Offer]\n  D -->|No| F[Revise]"],
    "faqs": [
        {"q": "Does Article 6 apply to NFTs?", "a": "Generally no."},
        {"q": "What happens without approval?", "a": "Market suspension."},
        {"q": "Can we passport across EU?", "a": "Yes, via ESMA notification."},
    ],
    "hero_prompt": "Editorial hero: EU regulatory compliance, navy and gold palette, no robots",
    "sources": [
        "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1114",
        "https://www.esma.europa.eu/press-news/esma-news/esma-publishes-first-guidance-mica",
        "https://www.esma.europa.eu/sites/default/files/2024-06/ESMA75-453128700-1372.pdf",
    ],
}
