"""
Content Agent — AI Marketing Team (Blog + LinkedIn + Image + Video script).

Job: Produce 1 SEO blog post + 1 LinkedIn post + 1 hero image + 1 video script
per day, AI-citation-ready.

Stack: Tavily/Perplexity for research, Claude Sonnet 4.5 for writing,
DALL-E 3 / Flux for hero images, ElevenLabs / Vapi for video voice.

Output: Markdown blog -> content/blog/*.md, LinkedIn post -> content/socials/linkedin/*.json,
image -> CDN, video script -> content/video/*.json.

Schedule: 06:00 UTC daily.

Usage:
  from services.agents.content_agent import run
  result = run({"topic": "MiCA compliance for EU stablecoin issuers"})
"""
from __future__ import annotations
import json, os, time, uuid
from datetime import datetime, timezone
from pathlib import Path
import sys as _sys
_sys.path.insert(0, str(Path(__file__).resolve().parent))
import _env
try:
    from orchestrator import heartbeat as _heartbeat
except Exception:
    _heartbeat = None

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")
except Exception:
    pass

SUPABASE_URL, SUPABASE_KEY = _env.get_supabase()
ANTHROPIC = _env.get_anthropic_key()
TAVILY = _env.get_tavily_key()


def _headers() -> dict:
    return {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"}


def _post_json(url, headers, body, timeout=30):
    import urllib.request
    raw = json.dumps(body).encode()
    req = urllib.request.Request(url, data=raw, headers=headers, method="POST")
    r = urllib.request.urlopen(req, timeout=timeout)
    return json.loads(r.read())


def _call_claude(prompt, system="", model="claude-sonnet-4-6", max_tokens=2048):
    """Call Claude with a prompt. Returns the text content."""
    if not ANTHROPIC:
        return "[skipped: no anthropic key]"
    try:
        resp = _post_json(
            "https://api.anthropic.com/v1/messages",
            {"x-api-key": ANTHROPIC, "anthropic-version": "2023-06-01", "content-type": "application/json"},
            {"model": model, "max_tokens": max_tokens, "system": system,
             "messages": [{"role": "user", "content": prompt}]},
            timeout=60,
        )
        return resp["content"][0]["text"]
    except Exception as e:
        return f"[error: {e}]"


def _tavily_research(query):
    """Search the web via Tavily. Returns top 5 results as text excerpts."""
    if not TAVILY:
        return ""
    try:
        return _post_json(
            "https://api.tavily.com/search",
            {"Content-Type": "application/json"},
            {"api_key": TAVILY, "query": query, "max_results": 5, "include_answer": True},
            timeout=30,
        )
    except Exception:
        return {}


def _pick_topic():
    """Pick today's topic from a rotating queue of AI-citation-ready subjects.
    These are drawn from the Austin Armstrong 5 frameworks run in session 3."""
    queue = [
        "MiCA Article 23 CASP application for EU crypto issuers",
        "Travel Rule compliance for stablecoin issuers in 2026",
        "OFAC sanctions screening for DeFi protocols",
        "EU AI Act fines: a compliance officer's guide",
        "VARA virtual asset regulation in Dubai 2026",
        "MiFID II for tokenized securities",
        "Crypto wallet forensics for AML investigations",
        "FATF Travel Rule implementation comparison (US vs EU vs Singapore)",
        "BoI (Beneficial Ownership Information) reporting for crypto entities",
        "GDPR + crypto: balancing privacy with blockchain transparency",
        "SEC v. Coinbase: what it means for US crypto compliance",
        "AI agent compliance under EU AI Act Article 6",
        "CFPB oversight of crypto consumer products",
        "Cross-border crypto enforcement: OFAC + EU sanctions",
        "BitLicense application process for crypto exchanges",
        "MAS Payment Services Act for crypto in Singapore",
        "TRACR forensics: tracing funds across 50+ blockchains",
        "BRAI wallet risk scoring methodology explained",
        "DocAI: AI-generated jurisdiction-aware legal documents",
        "LexAudit SOC 2 readiness for crypto SaaS",
    ]
    # Use day-of-year to rotate
    import datetime
    day = datetime.date.today().toordinal()
    return queue[day % len(queue)]


def _generate_blog(topic, research):
    """Write a 1,500-2,000 word blog post in AI-citation-ready format.
    Structure: H1 + question H2s + 40-60 word direct answers + supporting detail + JSON-LD."""
    research_text = ""
    if isinstance(research, dict):
        if research.get("answer"):
            research_text = f"\n\nWeb answer: {research['answer']}\n\n"
        for r in (research.get("results") or [])[:5]:
            research_text += f"- {r.get('title','')}: {r.get('content','')[:200]}\n"

    system = (
        "You are a senior crypto compliance writer for BizLegal-AI. "
        "Write in inverted-pyramid style: direct answer first, then supporting detail. "
        "Every H2 must be a literal question. Every question H2 must be followed by a "
        "40-60 word direct answer in the FIRST paragraph under that H2. "
        "Target 1,500-2,000 words. Add a 5-item FAQ at the end. "
        "Reference specific regulations (MiCA, VARA, OFAC, SEC, etc.) with citations. "
        "Output the article as markdown. Do NOT include frontmatter or JSON-LD in the body."
    )
    prompt = (
        f"Write an SEO blog post on this topic: {topic}\n\n"
        f"Research context:{research_text}\n\n"
        "Structure:\n"
        f"# [Statement headline that includes the topic]\n\n"
        "[200-word intro that defines the problem and previews the answer]\n\n"
        "## [Question 1]\n[40-60 word direct answer][supporting detail]\n\n"
        "## [Question 2]\n[40-60 word direct answer][supporting detail]\n\n"
        "## [Question 3]\n[40-60 word direct answer][supporting detail]\n\n"
        "## [Question 4]\n[40-60 word direct answer][supporting detail]\n\n"
        "## [Question 5]\n[40-60 word direct answer][supporting detail]\n\n"
        "## FAQ\n[5 Q&A pairs, 2-3 sentences each]\n\n"
        "## Conclusion\n[100-word wrap with specific next step for compliance officers]"
    )
    return _call_claude(prompt, system=system, model="claude-sonnet-4-6", max_tokens=4096)


def _generate_linkedin(topic, blog_excerpt):
    """Write a 150-200 word LinkedIn post that hooks + teaches + CTA."""
    system = (
        "You are a crypto compliance thought leader on LinkedIn. "
        "Write 150-200 words. Hook in first line (no clickbait, no emoji spam). "
        "One concrete insight per line. End with a soft CTA to a BizLegal-AI tool."
    )
    prompt = (
        f"Topic: {topic}\n\nBlog excerpt: {blog_excerpt[:800]}\n\n"
        "Write a LinkedIn post. Format:\n"
        "[Hook - 1 sentence that names a specific pain]\n\n"
        "[3-5 short paragraphs with one specific insight each]\n\n"
        "[Soft CTA - 1 sentence mentioning DocAI scan or LexAudit cert]\n\n"
        "[3-5 hashtags]"
    )
    return _call_claude(prompt, system=system, model="claude-haiku-4-5", max_tokens=600)


def _generate_image_prompt(topic):
    """Return a DALL-E 3 / Flux prompt for the hero image."""
    system = "You write DALL-E 3 prompts for compliance/SaaS hero images. Be specific about subject, lighting, mood."
    prompt = (
        f"Write a DALL-E 3 prompt for a hero image about: {topic}\n"
        "Style: modern, abstract, deep navy + electric green, professional, "
        "minimal text, suitable for B2B compliance SaaS landing page. "
        "Output ONE prompt, 1-2 sentences, no quotes."
    )
    return _call_claude(prompt, system=system, model="claude-haiku-4-5", max_tokens=200)


def _generate_video_script(topic):
    """60-90 second video script for short-form (Reels, TikTok, LinkedIn video)."""
    system = "You write 60-90 second video scripts for short-form B2B compliance content. Punchy, specific, no fluff."
    prompt = (
        f"Write a 60-90 second video script about: {topic}\n\n"
        "Format:\n"
        "HOOK (3 sec): [one sentence that creates urgency]\n\n"
        "PROBLEM (10 sec): [the specific pain point]\n\n"
        "INSIGHT (30 sec): [the one thing most people get wrong]\n\n"
        "SOLUTION (20 sec): [how BizLegal-AI solves it - name specific product]\n\n"
        "CTA (5 sec): [one sentence next step]\n\n"
        "ON-SCREEN TEXT: [3 lines of text to overlay]"
    )
    return _call_claude(prompt, system=system, model="claude-haiku-4-5", max_tokens=600)


def _save_outputs(topic, blog, linkedin, image_prompt, video_script, run_id, dry_run):
    """Save outputs to disk and Supabase."""
    out_dir = Path(__file__).resolve().parents[2] / "content" / "blog" / datetime.now().strftime("%Y-%m")
    out_dir.mkdir(parents=True, exist_ok=True)
    slug = topic.lower().replace(" ", "-")[:50]
    paths = {}
    if blog:
        p = out_dir / f"{slug}.md"
        if not dry_run:
            p.write_text(blog, encoding="utf-8")
        paths["blog"] = str(p)
    socials_dir = Path(__file__).resolve().parents[2] / "content" / "socials" / "linkedin"
    socials_dir.mkdir(parents=True, exist_ok=True)
    if linkedin:
        p = socials_dir / f"{slug}.json"
        if not dry_run:
            p.write_text(json.dumps({"topic": topic, "body": linkedin, "created_at": datetime.now(timezone.utc).isoformat()}, indent=2), encoding="utf-8")
        paths["linkedin"] = str(p)
    video_dir = Path(__file__).resolve().parents[2] / "content" / "video"
    video_dir.mkdir(parents=True, exist_ok=True)
    if video_script:
        p = video_dir / f"{slug}.json"
        if not dry_run:
            p.write_text(json.dumps({"topic": topic, "script": video_script, "created_at": datetime.now(timezone.utc).isoformat()}, indent=2), encoding="utf-8")
        paths["video"] = str(p)
    return paths


def run(ctx=None):
    ctx = ctx or {}
    dry_run = bool(ctx.get("dry_run", False))
    started = time.time()
    topic = ctx.get("topic") or _pick_topic()

    research = _tavily_research(topic) if not ctx.get("skip_research") else {}
    blog = _generate_blog(topic, research)
    linkedin = _generate_linkedin(topic, blog if isinstance(blog, str) else "")
    image_prompt = _generate_image_prompt(topic)
    video_script = _generate_video_script(topic)

    paths = _save_outputs(topic, blog, linkedin, image_prompt, video_script, str(uuid.uuid4()), dry_run)

    return {
        "ok": True,
        "agent": "content",
        "topic": topic,
        "blog_chars": len(blog) if isinstance(blog, str) else 0,
        "linkedin_chars": len(linkedin) if isinstance(linkedin, str) else 0,
        "image_prompt_chars": len(image_prompt) if isinstance(image_prompt, str) else 0,
        "video_script_chars": len(video_script) if isinstance(video_script, str) else 0,
        "paths": paths,
        "duration_ms": int((time.time() - started) * 1000),
        "dry_run": dry_run,
    }


if __name__ == "__main__":
    import sys
    args = {}
    i = 1
    while i < len(sys.argv):
        a = sys.argv[i]
        if a.startswith("--"):
            k, _, v = a[2:].partition("=")
            if v:
                args[k] = v
            elif i + 1 < len(sys.argv) and not sys.argv[i+1].startswith("--"):
                args[k] = sys.argv[i+1]
                i += 1
            else:
                args[k] = True
        i += 1
    print(json.dumps(run(args), indent=2))
