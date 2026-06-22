#!/usr/bin/env python3
"""
linkedin_dm_outreach.py - LinkedIn DM script generator for attorney partnerships.

NO AUTOMATED DM. This script only DRAFTS messages for Moses to send manually.
"""

import os, json, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

VAULT_PATH = Path('/opt/bizlegal/curator/.env')
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ydghhcuuopqzgqcicubg.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SECRET', os.getenv('SUPABASE_SERVICE_KEY', ''))
APIFY_TOKEN = os.getenv('APIFY_API_TOKEN', '')
REPORTS_DIR = Path('/opt/bizlegal/decisions')

TARGET_PROFILES = [
    {'jurisdiction': 'US (NY)', 'role': 'Securities lawyer (Reg D, crypto)', 'search_query': '"securities lawyer" OR "crypto attorney" AND "New York" OR "NY"', 'company_keywords': ['Latham', 'Cleary', 'Sullivan', 'Davis Polk', 'crypto fund', 'VASP'], 'pitch_focus': 'SEC enforcement + Reg D structuring', 'dm_limit_per_day': 5},
    {'jurisdiction': 'US (CA)', 'role': 'Crypto fund formation lawyer', 'search_query': '"crypto fund" OR "venture fund" AND "California" OR "CA" OR "San Francisco"', 'company_keywords': ['crypto fund', 'venture', 'Coinbase', 'a16z crypto', 'Paradigm'], 'pitch_focus': 'Fund formation + crypto regulatory', 'dm_limit_per_day': 5},
    {'jurisdiction': 'UAE (DIFC)', 'role': 'DIFC-licensed compliance counsel', 'search_query': '"DIFC" AND "lawyer" OR ("Dubai" AND "crypto" AND "compliance")', 'company_keywords': ['DIFC', 'ADGM', 'crypto', 'VARA'], 'pitch_focus': 'VASP licensing in DIFC', 'dm_limit_per_day': 3},
    {'jurisdiction': 'Singapore', 'role': 'MAS-licensed compliance counsel', 'search_query': '"Singapore" AND ("MAS" OR "PSA") AND "compliance"', 'company_keywords': ['Singapore', 'MAS', 'PSA', 'DPT', 'crypto'], 'pitch_focus': 'MAS PSA licensing + DPT services', 'dm_limit_per_day': 3},
    {'jurisdiction': 'US (TX/FL)', 'role': 'Small business attorney (BOI/formation)', 'search_query': '"business attorney" OR "formation lawyer" AND ("Texas" OR "Florida" OR "BOI")', 'company_keywords': ['formation', 'BOI', 'small business', 'LLC'], 'pitch_focus': 'BOI white-label service', 'dm_limit_per_day': 8},
    {'jurisdiction': 'US (IL)', 'role': 'Small business attorney (compliance)', 'search_query': '"Illinois" AND "business attorney"', 'company_keywords': ['business', 'compliance', 'BOI'], 'pitch_focus': 'BOI white-label service', 'dm_limit_per_day': 8},
]

DM_TEMPLATES = {
    'US (NY)': "Hi {first_name},\n\nFollowing your {recent_topic} post. Quick ask: I'm building OCI Deal Router -- we route pre-vetted crypto founders (NY-based) to specialist counsel for SEC enforcement defense + Reg D structuring. 10% rev share on close, avg deal $15K, you only get pre-qualified leads.\n\nWorth a 15-min intro this week?\n\n-- Moses",
    'US (CA)': 'Hi {first_name},\n\nFollowing your crypto fund work. I run OCI Deal Router -- we send pre-vetted crypto founders to specialist counsel in CA. 10% rev share on close, avg deal $15K, you only get qualified leads.\n\n15-min call this week?\n\n-- Moses',
    'UAE (DIFC)': 'Hi {first_name},\n\nFollowing your DIFC practice. I run OCI Deal Router -- we send qualified VASP founders to DIFC-licensed counsel. 8% rev share, avg deal $5K.\n\n15-min intro this week?\n\n-- Moses',
    'Singapore': 'Hi {first_name},\n\nFollowing your MAS work. I run OCI Deal Router -- we route qualified fintech founders to SG-licensed PSA counsel. 8% rev share, avg deal $8K.\n\nWorth a brief intro?\n\n-- Moses',
    'US (TX/FL)': 'Hi {first_name},\n\nFollowing your BOI practice. I built a white-label BOI scan service (forge.bizlegal-ai.com) you can offer under your brand. Charge your clients $300/scan, pay us $127. 10 free scans to start, then rev-share or flat $500/mo unlimited.\n\n15-min call?\n\n-- Moses',
    'US (IL)': 'Hi {first_name},\n\nFollowing your small business work. I built a white-label BOI scan + compliance service. Offer it under your brand -- charge $300/scan, pay us $127. 10 free scans to start.\n\n15-min call this week?\n\n-- Moses',
}

SEARCH_TIPS = """LinkedIn search tips:
1. Search by job title + location
2. Filter by Active in last 30 days
3. Look for profiles with recent posts (shows engagement)
4. Check About section for practice areas
5. Note the person first name and one recent topic/post for personalization

When personalizing DMs:
- {first_name} = their first name
- {recent_topic} = their latest post or article
- {specific_intro} = something specific from their profile

DO NOT:
- Send the same DM to multiple people (LinkedIn flags this)
- Include links in the first message (low reply rate)
- Use AI-generated flattery (people can tell)
- Mention BizLegal AI or any company name in the first DM
- Send more than 10 DMs per day from your account
"""


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
    rotation = ['US (NY)', 'US (CA)', 'UAE (DIFC)', 'Singapore', 'US (TX/FL)', 'US (IL)', 'US (NY)']
    today_jur = rotation[dow]

    print('[' + today_str + '] linkedin_dm_outreach: focus = ' + today_jur)

    md = '# LinkedIn DM Outreach -- ' + today_str + '\n\n'
    md += 'Today focus: ' + today_jur + '\n'
    md += 'Day of week: ' + today.strftime('%A') + '\n\n'
    md += 'INSTRUCTIONS FOR MOSES:\n'
    md += '1. Open LinkedIn. Search the query below.\n'
    md += '2. Find 5-10 active profiles.\n'
    md += '3. Send the personalized DM template.\n'
    md += '4. Replace {first_name}, {recent_topic}, {specific_intro} with real values.\n'
    md += '5. After 24h, if no reply, send 1 follow-up.\n'
    md += '6. Track replies in Supabase deal_router_partners table.\n\n'
    md += 'Daily limits: 5/day to NY/CA, 3/day to DIFC/SG, 8/day to TX/FL/IL.\n\n---\n\n'
    md += '## Today Target: ' + today_jur + '\n\n'

    profile = next(t for t in TARGET_PROFILES if t['jurisdiction'] == today_jur)
    md += 'Search query:\n```\n' + profile['search_query'] + '\n```\n\n'
    md += 'Company keywords to filter by: ' + ', '.join(profile['company_keywords']) + '\n\n'
    md += 'Pitch focus: ' + profile['pitch_focus'] + '\n\n'
    md += 'DM limit today: ' + str(profile['dm_limit_per_day']) + '\n\n'
    md += 'DM template:\n```\n' + DM_TEMPLATES[today_jur] + '\n```\n\n'
    md += '---\n\n## All Jurisdictions Reference\n\n'
    for jur, tmpl in DM_TEMPLATES.items():
        md += '### ' + jur + '\n```\n' + tmpl + '\n```\n\n'
    md += '---\n\n## ' + SEARCH_TIPS + '\n'

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / ('linkedin-outreach-' + today_str + '.md')
    out.write_text(md)

    try:
        req = urllib.request.Request(
            SUPABASE_URL + '/rest/v1/agent_runs',
            data=json.dumps([{
                'agent_name': 'linkedin_dm_outreach',
                'workflow_id': 'daily-revenue-pipeline',
                'action': 'draft_dms',
                'status': 'success',
                'details': {'focus_jurisdiction': today_jur, 'dm_limit': profile['dm_limit_per_day']},
            }]).encode(),
            headers={'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal'},
            method='POST',
        )
        urllib.request.urlopen(req, timeout=15)
    except Exception as e:
        print('  [supabase log] ' + str(e))

    print('  DM template drafted -> ' + str(out))


if __name__ == '__main__':
    main()
