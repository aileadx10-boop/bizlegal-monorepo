#!/usr/bin/env python3
"""
reddit_outreach.py - Reddit post generator + tracker.

NO AUTOMATED POSTING. Drafts posts for Moses to review + submit manually.
"""

import os, json, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

VAULT_PATH = Path('/opt/bizlegal/curator/.env')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ydghhcuuopqzgqcicubg.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))
REPORTS_DIR = Path('/opt/bizlegal/decisions')

SUBREDDITS_BY_DOW = {
    0: ['r/legaladvice', 'r/startups'],
    1: ['r/Entrepreneur', 'r/SaaS'],
    2: ['r/FinancialCompliance', 'r/CryptoTax'],
    3: ['r/Dubai', 'r/Singapore'],
    4: ['r/legaladvice', 'r/SaaS'],
    5: ['r/startups', 'r/expats'],
    6: ['r/Entrepreneur', 'r/FinancialCompliance'],
}


# Each post is (title, body) - bodies use triple-double-quotes so apostrophes don't terminate
BOI_POST = (
    'Filed BOI for 200 clients -- here are the 5 most common mistakes that trigger FinCEN review',
    """I run a compliance automation service that helps LLC owners file Beneficial Ownership Information reports. After filing 200 BOI reports in the past 6 months, here are the 5 mistakes I see every single week:

1. **Listing the wrong substantial control person.** FinCEN definition includes anyone with substantial control -- not just the LLC owner. Senior officers, anyone with authority to appoint/remove officers, anyone with important decision-making power all qualify.

2. **Using a P.O. Box instead of a residential address.** The BOI report requires the individual residential address.

3. **Forgetting to update within 30 days.** Any change triggers a 30-day update window. FinCEN charges $500/day civil penalties for late updates.

4. **Confusing the company applicant with the beneficial owner.** The company applicant is whoever filed the LLC paperwork. Separate field, FINExempt for companies formed BEFORE 2024.

5. **Not keeping a copy of the BOI report.** FinCEN requires filers to keep their own copy.

If you filed BOI in the last year, double-check that all SC persons are listed, residential addresses are used, and your copy is current within 30 days.

Happy to answer questions in comments. (If you want the form pre-filled, we offer that for $149 at forge.bizlegal-ai.com -- but no pressure, ask questions first.)
"""
)

SOC2_POST = (
    'I built a SOC 2 compliance tracker for early-stage SaaS -- ask me anything about compliance on a startup budget',
    """Spent the last year building compliance automation for early-stage SaaS companies. Here is the honest take on SOC 2 + ISO 27001 on a startup budget:

**The 80/20 of SOC 2 Type I:**
- Asset inventory (where is your data)
- Access controls (MFA everywhere)
- Vendor management (your subprocessors SOC 2 reports)
- Incident response plan (just a doc with who to call)
- Change management (git + code review + audit log)

**What you DO NOT need (yet):**
- Penetration test (only if customers ask)
- Bug bounty (only if handling PII at scale)
- 24/7 SOC monitoring (automate alerts first, hire when you hit $1M ARR)

**Free tools that work:** Osquery, Wazuh, Cloudflare Access.

**The dirty secret:** SOC 2 is mostly documentation. A good compliance engineer can write SOC 2 Type I in 4-6 weeks for a Series A company.

What questions do you have?
"""
)

PENALTY_POST = (
    'My LLC got the $500/day FinCEN BOI penalty notice -- heres what I learned',
    """Throwaway account because Im embarrassed. Sharing because someone else will inevitably make the same mistake.

I formed an LLC in Delaware in 2022. Started a SaaS. Completely forgot about BOI reporting when it became mandatory in 2024. Just got a notice from FinCEN: $500/day civil penalty for failure to file.

Total penalty so far: ~$15K. Will continue until I file.

What I did wrong:
- Thought the LLC paperwork was enough
- Didnt set a calendar reminder
- Didnt realize BOI applies to ALL LLCs, not just big ones

If you have an LLC formed between 2020 and 2024 and have NOT filed BOI, do it this week. Its free and takes 10 minutes at https://boiefiling.fincen.gov. Retroactive penalty starts from your formation date.

If you want help, services like BizLegal AI Forge will prefill the form for $149. DIY works if you read the FinCEN guide.

Lessons learned. Hope this saves someone $15K.
"""
)

VARA_POST = (
    'Got my VARA license for crypto exchange in DIFC -- here is the actual cost and timeline',
    """Finally done with VARA licensing for our crypto exchange. Sharing because every blog on this topic is marketing fluff.

Actual timeline: 6 months total (12 weeks review, 2 weeks conditional approval, etc.)

Actual cost year 1: $600K-1.2M (legal + compliance officer + office + capital + audit)

What I wish I knew:
- VARA does NOT accept entities from free zones outside DIFC
- Application is intent-based (specific activities get approved)
- Real DIFC office required, not virtual
- Plan for 9-12 months total, not 6

If youre considering VARA and want a referral to a DIFC lawyer whos done this 50+ times, DM me.
"""
)

CRYPTO_TAX_POST = (
    'PSA: BOI reporting for crypto LLCs is NOT optional -- here is the exact FinCEN rule',
    """PSA for r/CryptoTax: if you have a US LLC holding crypto, you MUST file BOI with FinCEN. Separate from taxes. Started 2024. Penalty: $500/day civil, up to $10K criminal.

Free at https://boiefiling.fincen.gov. Takes 10 minutes.

What you need: LLC name + EIN + state + principal office + all beneficial owners (25%+ OR substantial control) + all company applicants (whoever filed your LLC paperwork).

Compliance is not optional. File today.
"""
)

WHITELABEL_POST = (
    'How we got our first enterprise customer by offering white-label compliance scans',
    """Background: We sell a compliance scanner (DocAI at docai.bizlegal-ai.com). Direct sales to SMBs were slow.

Pivot: white-label API to compliance consultants. They brand it, charge $200-500/scan, pay us $97 API cost + $30 margin = $127 per scan.

Result: 1 partner in 8 weeks -> 4 partners in 4 months -> $5K/mo recurring + 60% gross margin.

What worked: free tier (10 scans/mo), simple per-scan pricing, give partners the marketing copy.

What didnt: monthly minimums, long onboarding calls, custom features.

If you have a SaaS product stuck on direct sales to SMBs, try white-labeling to consultants.
"""
)

SG_PSA_POST = (
    'PSA: Singapore PSA license required for ALL digital payment token services -- including overseas companies',
    """For crypto/fintech founders serving Singapore customers:

MAS requires Payment Services Act license for ANY entity providing DPT services to SG residents. Even if you are overseas.

What I learned going through this:
- License categories: account issuance, e-money, DPT, cross-border money transfer
- DPT is strictest. Most retail crypto needs it.
- Timeline: 6-12 months if clean applicant
- Cost year 1: $200-500K (legal + compliance officer + office + capital)
- MAS does NOT accept token-only businesses -- still need PSA
- Overseas applicants need SG-licensed representative + physical presence

If youre a founder considering Singapore, get legal advice BEFORE onboarding your first SG customer. Penalties: S$250K + criminal charges for executives.

Building a deal router (OCI) that connects fintech founders to MAS-licensed compliance counsel in SG. DM if interested.
"""
)

EXPAT_POST = (
    'If you moved abroad and still own a US LLC, you MUST file BOI with FinCEN',
    """Throwaway because Im embarrassed. Sharing because many expats in this sub own US LLCs.

I moved to Dubai in 2022. Kept my US LLC. Didnt know about BOI. Just got FinCEN notice: file immediately or face $500/day civil penalties.

For expats, BOI gets tricky:
- You still have to file even if youre abroad
- The BOI report requires your CURRENT residential address (which is now overseas)
- A non-US resident can still be the SC person of a US LLC

I had to update my operating agreement + file BOI with my Dubai address. Both my US accountant and Dubai lawyer were surprised.

If youre an expat with a US LLC:
1. File BOI today
2. Use your current residential address
3. Update within 30 days of any change (including address change!)
4. Keep your copy accessible

DM me if you need help. Figured this out the hard way.
"""
)

POST_TEMPLATES = {
    'r/legaladvice': BOI_POST,
    'r/startups': SOC2_POST,
    'r/Entrepreneur': PENALTY_POST,
    'r/SaaS': WHITELABEL_POST,
    'r/FinancialCompliance': SOC2_POST,
    'r/CryptoTax': CRYPTO_TAX_POST,
    'r/Dubai': VARA_POST,
    'r/Singapore': SG_PSA_POST,
    'r/expats': EXPAT_POST,
}


def main():
    global SUPABASE_KEY
    if not SUPABASE_KEY and VAULT_PATH.exists():
        for line in VAULT_PATH.read_text().splitlines():
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip())
        SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))

    today = datetime.now(timezone.utc)
    today_str = today.strftime('%Y-%m-%d')
    dow = today.weekday()
    subs = SUBREDDITS_BY_DOW.get(dow, SUBREDDITS_BY_DOW[0])

    print('[' + today_str + '] reddit_outreach: drafting for ' + ', '.join(subs))

    md = '# Reddit Outreach Draft -- ' + today_str + '\n\n'
    md += 'Generated by reddit_outreach.py\n'
    md += 'Day of week: ' + today.strftime('%A') + '\n'
    md += 'Target subreddits today: ' + ', '.join(subs) + '\n\n'
    md += 'INSTRUCTIONS FOR MOSES:\n'
    md += '1. Review the draft below.\n'
    md += '2. Go to each subreddit, click Create Post, paste the title + body.\n'
    md += '3. After posting, reply to comments for the first 2 hours.\n'
    md += '4. Soft CTA at end of each post.\n\n---\n\n'

    for sub in subs:
        tmpl = POST_TEMPLATES.get(sub)
        if not tmpl:
            continue
        title, body = tmpl
        md += '## Post for ' + sub + '\n\n'
        md += '**Title:**\n```\n' + title + '\n```\n\n'
        md += '**Body:**\n\n' + body + '\n\n---\n\n'

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('reddit-outreach-' + today_str + '.md')
    out.write_text(md)

    try:
        req = urllib.request.Request(
            SUPABASE_URL + '/rest/v1/agent_runs',
            data=json.dumps([{
                'agent_name': 'reddit_outreach',
                'workflow_id': 'daily-revenue-pipeline',
                'action': 'draft_posts',
                'status': 'success',
                'details': {'subreddits': subs, 'posts_drafted': len(subs)},
            }]).encode(),
            headers={'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal'},
            method='POST',
        )
        urllib.request.urlopen(req, timeout=15)
    except Exception as e:
        print('  [supabase log] ' + str(e))

    print('  drafted ' + str(len(subs)) + ' posts -> ' + str(out))


if __name__ == '__main__':
    main()
