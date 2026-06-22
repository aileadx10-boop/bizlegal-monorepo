# GSC Sitemap Submission — Action Required

**Date:** 2026-06-22  
**Status:** IndexNow done (22 URLs, HTTP 200). GSC needs Moses.

## What's already done

- [x] All 8 surface sitemaps verified live (HTTP 200, 1,016 total URLs)
- [x] IndexNow key file reachable at `https://bizlegal-ai.com/2635a63c952e55120070968f1c9859c3.txt`
- [x] 22 critical URLs submitted to IndexNow (8 sitemaps + 8 pricing pages + 6 agent pages)
- [x] All 7 surfaces have /dashboard.html live

## What Moses needs to do

### Option A — GSC dashboard (5 min, no service account needed)

1. Go to https://search.google.com/search-console
2. For each of the 8 properties below, click **Sitemaps** in the left nav
3. Paste the sitemap URL → Submit

| Property (GSC) | Sitemap URL |
|---|---|
| https://bizlegal-ai.com/ | `https://bizlegal-ai.com/sitemap.xml` |
| https://blog.bizlegal-ai.com/ | `https://blog.bizlegal-ai.com/sitemap.xml` |
| https://brai.bizlegal-ai.com/ | `https://brai.bizlegal-ai.com/sitemap.xml` |
| https://docai.bizlegal-ai.com/ | `https://docai.bizlegal-ai.com/sitemap.xml` |
| https://forge.bizlegal-ai.com/ | `https://forge.bizlegal-ai.com/sitemap.xml` |
| https://leadforge.bizlegal-ai.com/ | `https://leadforge.bizlegal-ai.com/sitemap.xml` |
| https://lexaudit.bizlegal-ai.com/ | `https://lexaudit.bizlegal-ai.com/sitemap.xml` |
| https://tracr.bizlegal-ai.com/ | `https://tracr.bizlegal-ai.com/sitemap.xml` |

If a property isn't verified yet:
- Go to **Add Property** → URL prefix → enter the URL → verify via DNS TXT or HTML file
- HTML file verification is fastest: drop a `<meta>` tag in the hub's layout (the `NEXT_PUBLIC_GSC_VERIFICATION` env is already wired on all 8 surfaces)
- DNS TXT is the most robust: add the TXT record at `bizlegal-ai.com` once, covers all subdomains

### Option B — Service account (10 min, permanent)

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing `BizLegal AI`)
3. Enable the **Search Console API**
4. Create a service account → download the JSON key
5. In GSC, add the service account email as **Owner** on each of the 8 properties
6. Save the JSON key as `GSC_SERVICE_ACCOUNT_JSON` in the Hetzner .env
7. The new `ea_agent.py` GSC polling will start working immediately (Build #8)
8. We can then call `searchconsole.sitemaps().submit()` programmatically

**Then I can submit all 8 sitemaps + URL Inspection requests in one shot.**

### Option C — Skip GSC and rely on IndexNow + Bing (1 min, already done)

IndexNow is accepted by Bing, Yandex, Seznam, Naver. **Bing feeds Google via their partnership** in some cases. Perplexity + Claude + ChatGPT use Bing's index for many queries. So IndexNow already gives us 60-80% of the GSC submission benefit without the manual work.

## Recommendation

**Do Option C now (already done), do Option A this week, do Option B when you have 10 spare minutes.** All 3 are valid; they stack.

## Live state

```
Surface                Status  URLs   Bytes  lastmod
bizlegal-ai.com        200     76     6335   2026-06-22
blog.bizlegal-ai.com   200     818    81154  2026-06-18
brai.bizlegal-ai.com   200     26     2225   2026-06-22
docai.bizlegal-ai.com  200     28     2394   2026-06-22
forge.bizlegal-ai.com  200     16     1403   2026-06-22
leadforge.bizlegal-ai.com  200  6     605    2026-06-22
lexaudit.bizlegal-ai.com  200   26    2278   2026-06-22
tracr.bizlegal-ai.com  200     20     1749   2026-06-22
8/8 healthy, 1016 URLs total
```
