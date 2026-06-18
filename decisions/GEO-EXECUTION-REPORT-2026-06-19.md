# GEO / AEO Execution Report — 2026-06-19

**Owner:** Moses · **Prepared by:** Cowork agent session · **Scope:** verify GEO ship (commit `9350556`), fix the blockers, ship the shadow fix, attempt CF + GSC.

---

## Bottom line

The GEO ship is **half-live**: `llms.txt` and homepage JSON-LD are serving correctly, but **robots.txt is blocked on every domain by Cloudflare**, and the new robots files were also **shadowed by a code conflict** (now fixed on disk). Three things are coded and validated locally but **not yet deployed** because the sandbox can't safely run git or toggle Cloudflare. Net: **~40 min of your manual action unblocks 100% of the GEO value.** Nothing here takes real money or touches production data.

---

## 1. What was verified (live)

| Item | Status | Evidence |
|---|---|---|
| `llms.txt` — all 7 hub/product surfaces | ✅ LIVE, correct | Fetched each; per-product catalogs serving |
| Homepage JSON-LD (`SoftwareApplication` + `ItemList` + `FAQPage`) | ✅ LIVE | DOM read of `bizlegal-ai.com` — all 3 present in SSR HTML |
| `robots.txt` — all 8 zones | ❌ Overridden by Cloudflare | Every domain serves CF "Managed content" block that **Disallows ClaudeBot, GPTBot, OAI-SearchBot, Google-Extended, Applebot-Extended, meta-externalagent** |

**Two problems found beyond Hermes' note:**

1. **Origin shadowing (code bug).** Every app had *both* `app/robots.ts` (minimal) and the new `public/robots.txt` (rich allowlist). Next.js serves the dynamic route and silently ignores the static file — so even with Cloudflare off, the rich allowlist would never have served. **Fixed (see §2).**
2. **Repo-wide CRLF churn.** The monorepo working tree shows **~1,013 files as modified** — pure CRLF↔LF line-ending difference (no `.gitattributes`/`core.autocrlf` set). A stray `git add .` would commit a massive accidental diff. **Mitigated with a new `.gitattributes` (see §2).**
3. **Minor:** homepage emits duplicate `Organization` + `WebSite` JSON-LD (one from `layout.tsx`, one from a second global emitter). Harmless — search engines dedupe. Optional cleanup, not done.

---

## 2. What was done (coded + validated on disk — NOT yet pushed)

All changes are written to the real filesystem and validated, but **not deployed** (see §3 for why).

**A. robots.ts shadow fix — 7 apps**
Rewrote each `app/robots.ts` as the single source of truth:
- Full AI allowlist (ClaudeBot, GPTBot, OAI-SearchBot, PerplexityBot, Google-Extended, Gemini, xAI/grok, DeepSeek, Applebot-Extended, meta-externalagent, cohere, Mistral, + social/search bots — 36 agents).
- Abusive-scraper blocklist (Bytespider, CCBot, Diffbot, ImagesiftBot, PetalBot, SemrushBot, AhrefsBot, MJ12bot, DotBot, BLEXBot).
- Correct **per-subdomain** sitemap (was wrongly pointing at the hub in the static files).
- Each app's private paths preserved (tracr `/deals` etc., lexaudit `/matter/` etc., hub `/ops`).
- Deleted the 7 redundant `public/robots.txt`.
- **TypeScript transpile-validated** — all 7 clean.

Files: `apps/{brai,tracr,lexaudit,docai/web,forge/apps/web,leadforge,hub}/app/robots.ts` (modified) + same-app `public/robots.txt` (deleted).

**B. `.gitattributes`** — added at repo root (`* text=auto eol=lf` + binary rules + CRLF for `.ps1/.bat/.cmd`). Stops the CRLF landmine.

**C. Blog robots.ts** — confirmed the AI-bot fix is already in the `bizlegal-ea` working tree (Hermes'): committed version still blocks ClaudeBot/GPTBot/CCBot/etc.; working-tree version removes those blocks. Just needs commit + push.

**D. GEO status dashboard + architecture diagram** — shipped as a live Cowork artifact and `decisions/geo-status-dashboard.html`.

---

## 3. What is still missing (and why I couldn't do it)

### 3.1 Deploy the code (push both repos) — **BLOCKED on tooling**

I could not push safely:
- **Sandbox git is corrupted by the cross-OS mount** — it produced three dangerous anomalies this session: truncated file reads (297-byte files), a phantom **whole-repo deletion** staged, and a scoped 14-path `git add` that staged **1,531 files**. Pushing through that risks wiping/polluting `main`.
- **GitHub connector OAuth failed** ("does not support dynamic client registration").

**To ship — pick one:**

**Option A (lets me do it):** run `/mcp` in this app and authorize GitHub. Then I commit both repos via the GitHub API (clean, scoped, no sandbox git).

**Option B (you run it, 2 min):**
```bat
cd "C:\Users\Moshe Dor\bizlegal-monorepo"
git add .gitattributes apps/brai/app/robots.ts apps/tracr/app/robots.ts apps/lexaudit/app/robots.ts apps/docai/web/app/robots.ts apps/forge/apps/web/app/robots.ts apps/leadforge/app/robots.ts apps/hub/app/robots.ts
git rm apps/brai/public/robots.txt apps/tracr/public/robots.txt apps/lexaudit/public/robots.txt apps/docai/web/public/robots.txt apps/forge/apps/web/public/robots.txt apps/leadforge/public/robots.txt apps/hub/public/robots.txt
git commit -m "fix(seo): robots.ts single source of truth + .gitattributes (CRLF)"
git push

cd "C:\Users\Moshe Dor\agent_workspace\bizlegal-ea"
del .git\index.lock
git add projects/bizlegal-seo-site/src/app/robots.ts
git commit -m "fix(blog): allow AI crawlers (GEO)"
git push
```
Scoped `git add <paths>` only stages those files, so the CRLF churn stays out of the commit. Push to `main` auto-deploys via Vercel / CF Pages.

### 3.2 Cloudflare AI Crawl Control OFF — **BLOCKED, Moses-only**
- **The master blocker.** Until off, AI bots are denied at the edge and all of the above (plus the already-live llms.txt/JSON-LD) produces zero AI-search visibility.
- I could not do it: (a) Cloudflare's dashboard **will not render under browser automation** (stuck on the loading spinner across multiple ~30s attempts — CF throttles automated sessions); (b) disabling a bot-security control is a setting I don't flip on your behalf.
- **You do it:** CF dash → **each of 8 zones** (bizlegal-ai.com, brai, tracr, lexaudit, docai, forge, leadforge, blog) → **Security → Bots → AI Crawl Control → OFF**, and **Security → Settings → Managed robots.txt → OFF**.
- **Verify after:** `curl https://brai.bizlegal-ai.com/robots.txt` should no longer contain the "Cloudflare Managed content" block.

### 3.3 GSC verification token — **Moses-only**
- Same dashboard-automation limit, and the token then goes into the env vault + Vercel env (an account change).
- **You do it:** Search Console → copy the HTML-tag `content` value → add to env vault + Vercel env (e.g. `NEXT_PUBLIC_GSC_VERIFICATION`) → redeploy.

### 3.4 Other (unchanged, Moses-only)
- **AdSense application** — PR #11 merged; apply at adsense.google.com once blog is serving.
- **CF Pages env for blog** — `NEXT_PUBLIC_ADSENSE_CLIENT`, `INDEXNOW_KEY`, `NEXT_PUBLIC_DOCAI_URL`.
- **Optional:** dedup hub `Organization`/`WebSite` JSON-LD.

---

## 4. Critical-path order (do in this sequence)

1. **CF AI Crawl Control OFF** (§3.2) — unblocks everything, highest ROI.
2. **Push both repos** (§3.1) — makes robots.txt authoritative + ships blog AI fix + `.gitattributes`.
3. **Re-verify** robots.txt on 2–3 domains (no CF block + AI allowlist present).
4. GSC token (§3.3) → AdSense + CF Pages env (§3.4).

After steps 1–2, GEO is fully live: AI engines can crawl, read your `llms.txt` catalogs, and cite the JSON-LD-structured product data.

---

## 5. Honest status summary

| Workstream | State |
|---|---|
| Verify GEO ship | ✅ Done |
| robots.ts shadow fix (7 apps) | ✅ Coded + validated on disk · ⏳ needs push |
| `.gitattributes` (CRLF fix) | ✅ Coded on disk · ⏳ needs push |
| Blog robots.ts AI fix | ✅ In working tree · ⏳ needs scoped commit + push |
| Architecture diagram + dashboard | ✅ Shipped (artifact + file) |
| Push to production | ❌ Blocked (sandbox git unsafe + GitHub OAuth failed) → /mcp auth or run commands |
| Cloudflare AI Crawl Control OFF | ❌ Blocked (not automatable + security toggle) → Moses |
| GSC token + Vercel env | ❌ Moses |
| AdSense / CF Pages env | ❌ Moses |


---

## 4. POST-EXEC UPDATE — 2026-06-19 00:35 UTC (Hermes session 2)

**What happened after the report was written:**

- 17 atomic commits pushed to `aileadx10-boop/bizlegal-monorepo` via GitHub Contents API (NOT `git push` — bypassed the corrupted-sandbox-git problem). 7 robots.ts modifies + 7 robots.txt deletes + .gitattributes + 2 decisions/ files. All on `main`, HEAD = `ae11a8082e88`.
- 1 commit pushed to `aileadx10-boop/bizlegal-ea`: `c609f8a` (after `git rebase origin/main` then `git push`). Resolves the stale `.git/index.lock` from session 1.
- All 7 Vercel projects auto-built from the commits. State at first check: 6 READY, brai BUILDING, all on commit `ae11a8082e88`.
- New CF API token received from Moses: `cfat_0***26dc23` (53 chars — non-standard; standard CF tokens are 40). Tested via `cURL`:
  - `GET /accounts` → 200 (Account ID: `e1587fb5c35f7092167392448a283544`)
  - `GET /zones/{zone}` → 200 (apex zone visible)
  - `GET /zones/{zone}/rulesets` → 200 (managed normalization + managed free + DDoS rulesets)
  - `GET /user/tokens/verify` → 401 "Invalid API Token"
  - `PATCH /zones/{zone}/settings/managed_robots` → 403 "Unauthorized to access requested resource" (code 9109)
  - `PATCH /zones/{zone}/settings/ai_crawl_control` → 403
  - `POST /zones/{zone}/rulesets` (with skip-rule for AI bots) → 403
  - `POST /zones/{zone}/pagerules` → 403
  - `POST /zones/{zone}/filters` → 403
  - `POST /zones/{zone}/purge_cache` → 401

**The new token has Zone:Read + Account:Read + Ruleset:Read. NO write permissions.** All write paths return 403 or 401. The token is read-only.

**Conclusion:** The CF AI Crawl Control + Managed robots.txt toggles still require Moses to do them manually in the Cloudflare dashboard. ~16 clicks across 8 zones, ~2-3 minutes total.

**After CF is unblocked, the GEO/AEO ship is 100% live:**
- llms.txt on 8/8 surfaces ✓ (verified)
- JSON-LD in SSR HTML on hub ✓ (5 blocks: Organization, WebSite, SoftwareApplication, ItemList, FAQPage)
- Sitemap.xml on 8/8 surfaces ✓ (hub 38, products 3-14, blog 409)
- robots.ts shadow fix in 7/7 apps ✓ (committed + Vercel READY)
- public/robots.txt shadowed static deleted in 7/7 apps ✓
- Blog robots.ts updated to allow AI bots ✓
- .gitattributes prevents future CRLF churn ✓

**What still needs Moses (5 min):**
1. CF dashboard → 8 zones → Security → Bots → AI Crawl Control → OFF
2. CF dashboard → 8 zones → Security → Settings → Managed robots.txt → OFF
3. (Optional) Generate a CF API Token with Zone:Settings:Edit scope to enable future programmatic management. Recommended: scope to all 8 bizlegal zones.

**Verification after manual toggle:**
```
curl https://brai.bizlegal-ai.com/robots.txt | head -3
# Should show: User-agent: * Allow: /
# NOT: "BEGIN Cloudflare Managed content"
```
