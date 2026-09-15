"""
page_factory_prompt.py — the probabilistic half's contract.

Everything about talking to the model lives here: the system prompt, the JSON
shape, the per-family brief, deterministic assembly of the returned sections
into markdown, and the tolerant JSON parse. The caller (page_factory.py) only
has to hand this module a row and take back a page dict.

Design note (root CLAUDE.md §2): STRUCTURE IS CODE, PROSE IS THE MODEL'S. The
model returns a lede plus a list of {h2, body_md} sections; assemble_body()
emits the markdown and appends the disclaimer verbatim. That turns three
recurring gate failures — too few H2s, a stray H1, a missing or paraphrased
disclaimer — into things that cannot happen rather than things the model has
to remember.
"""
from __future__ import annotations

import json
import re
from typing import Any

SYSTEM_PROMPT = (
    "You are a compliance research writer for BizLegal AI, which is regulatory research "
    "SOFTWARE and explicitly NOT a law firm. You write factual, specific, source-anchored "
    "reference pages for compliance and legal-operations teams.\n"
    "Absolute rules:\n"
    "1. Cite ONLY from the SOURCES list given to you. Copy the url and section strings "
    "verbatim. Never invent, guess, shorten or 'improve' a URL. If you cannot support a "
    "claim from those sources, do not make the claim.\n"
    "2. Never state a specific penalty amount, deadline, date or threshold unless it is "
    "general and uncontested; prefer 'check the cited source for the current figure'.\n"
    "3. Never promise an outcome. The words guarantee, ensures compliance, will pass, "
    "fully compliant, 100% compliant are forbidden.\n"
    "4. Never give legal advice or address the reader as a client.\n"
    "5. Link ONLY to paths from the INTERNAL LINKS list, verbatim.\n"
    "6. No marketing filler. No phrases like 'in this article we will', 'delve into', "
    "'navigating the landscape', 'ever-evolving', 'in conclusion', 'moreover', "
    "'furthermore', 'it's important to note'.\n"
    "7. Output ONE JSON object and nothing else. No prose before or after, no code fences."
)

JSON_SHAPE = (
    '{"lede": "2-3 sentence direct answer, markdown", '
    '"sections": [{"h2": "section heading", "body_md": "markdown paragraphs"}], '
    '"faq": [{"q": "...", "a": "..."}], '
    '"key_dates": [{"label": "...", "detail": "..."}], '
    '"citations": [{"regulation": "...", "section": "...", "url": "..."}], '
    '"internal_links": ["/path", "..."]}'
)

MIN_SECTIONS = 5


def assemble_body(doc: dict[str, Any], disclaimer: str) -> str:
    """Structure is code, prose is the model's (root CLAUDE.md §2).

    The model returns a lede and a list of sections; Python emits the markdown.
    That makes the H2 count, the absence of an H1 and the verbatim disclaimer
    structural guarantees instead of things the model has to remember — three
    gate failures that simply cannot happen any more.
    """
    parts: list[str] = []
    lede = str(doc.get("lede") or "").strip()
    if lede:
        parts.append(lede)
    for sec in doc.get("sections") or []:
        if not isinstance(sec, dict):
            continue
        h2 = str(sec.get("h2") or "").strip().lstrip("#").strip()
        body = str(sec.get("body_md") or "").strip()
        if not h2 or not body:
            continue
        parts.append(f"## {h2}\n\n{body}")
    # Legacy single-blob shape, still accepted if a model ignores `sections`.
    legacy = str(doc.get("body_md") or "").strip()
    if legacy and len(parts) <= 1:
        parts.append(re.sub(r"^#\s+[^\n]*\n+", "", legacy))
    body_md = "\n\n".join(parts).strip()
    if disclaimer.strip().lower() not in body_md.lower():
        body_md = f"{body_md}\n\n{disclaimer}"
    return body_md


def _banned_line() -> str:
    """The gate's own banned list, fed back into the prompt verbatim, so the
    two can never disagree about what 'boilerplate' means."""
    try:
        from page_quality_gate import BANNED_PHRASES
    except Exception:  # noqa: BLE001 — prompt must still build without the gate
        return "furthermore, moreover, in conclusion, delve into, it's important to note"
    return ", ".join(f'"{p.strip().rstrip(",")}"' for p in BANNED_PHRASES)


BANNED_LINE = _banned_line()


def build_user_prompt(row: dict[str, Any], m: dict[str, Any], cites: list[dict[str, str]],
                      links: list[str], disclaimer: str) -> str:
    keys = row.get("matrix_keys") or {}
    family = row.get("matrix_family") or ""
    brief = _family_brief(family, keys, m)
    src = "\n".join(f'- regulation="{c["regulation"]}" section="{c["section"]}" url="{c["url"]}"' for c in cites)
    lk = "\n".join(f"- {u}" for u in links)
    return (
        f"PAGE TITLE: {row.get('title', '')}\n"
        f"PAGE KIND: {family}\n"
        f"{brief}\n\n"
        f"SOURCES (the only citations you may use):\n{src}\n\n"
        f"INTERNAL LINKS (the only hub paths you may link to):\n{lk}\n\n"
        f"FORBIDDEN WORDS AND PHRASES (a single occurrence rejects the page):\n{BANNED_LINE}\n\n"
        "WRITE the page as JSON with exactly this shape:\n"
        f"{JSON_SHAPE}\n\n"
        "Requirements:\n"
        f"- sections: EXACTLY {MIN_SECTIONS} to 7 entries. This is the hard requirement; a "
        f"response with fewer than {MIN_SECTIONS} sections is rejected outright. Each h2 is a "
        "specific claim or question, never a generic label like 'Overview' or 'Conclusion'. "
        "Each section body is 3-4 substantive paragraphs (150-250 words). Do NOT put '#' or "
        "'##' inside a body — the site renders the headings.\n"
        "- Total prose across lede + sections must exceed 900 words. Under 700 is REJECTED.\n"
        "- Put at least one markdown table inside one section body, where a table genuinely helps.\n"
        "- At least 5 inline markdown links across the section bodies. Copy each path "
        "CHARACTER-FOR-CHARACTER from the INTERNAL LINKS list, e.g. "
        "[record of processing](/glossary/record-of-processing-activities). Never shorten a "
        "path to its parent section (/glossary, /tools, /compliance are NOT valid targets) "
        "and never invent a path that is not on the list.\n"
        "- faq: 4 to 6 distinct questions a buyer or auditor actually asks. Each answer "
        "40-90 words. No question may restate the page title.\n"
        "- key_dates: 0-4 entries; leave the array empty rather than inventing a date.\n"
        "- citations: at least 3 entries copied verbatim from SOURCES.\n"
        "- internal_links: the paths you used, copied verbatim from INTERNAL LINKS.\n"
        "- Do not write a disclaimer; the site appends it.\n"
    )


def _family_brief(family: str, keys: dict[str, Any], m: dict[str, Any]) -> str:
    def find(coll: str, slug: str) -> dict[str, Any]:
        return next((x for x in m.get(coll, []) if x.get("slug") == slug), {})

    if family == "regulation_jurisdiction":
        reg = find("regulations", keys.get("regulation", ""))
        jur = find("jurisdictions", keys.get("jurisdiction", ""))
        return (
            f"SUBJECT: how {reg.get('name', '')} ({reg.get('short', '')}), supervised by "
            f"{reg.get('authority', '')}, reaches organisations established in or selling into "
            f"{jur.get('name', '')} ({jur.get('region', '')}).\n"
            "COVER: the extraterritorial/scope test in plain terms; who in that market is "
            "typically caught and who is not; the obligations that follow; how a team there "
            "should evidence compliance; what is genuinely uncertain and must be checked "
            "against the primary source or local counsel."
        )
    if family == "tool_industry":
        tool = find("tools", keys.get("tool", ""))
        ind = find("industries", keys.get("industry", ""))
        return (
            f"SUBJECT: how {ind.get('name', '')} use the BizLegal {tool.get('title', '')} "
            f"(https://bizlegal-ai.com/tools/{tool.get('slug', '')}).\n"
            "COVER: the sector-specific inputs that change the answer; a worked reading of the "
            "output; the regulatory obligation the output maps to; the limits of the tool "
            "(it is a deterministic calculator, not a determination)."
        )
    if family == "glossary":
        term = next((t for t in m.get("glossary_terms", []) if t.get("slug") == keys.get("term")), {})
        return (
            f"SUBJECT: the compliance term \"{term.get('term', '')}\".\n"
            "COVER: a one-paragraph definition; where the definition comes from; the test for "
            "whether it applies; what changes once it does; the two or three mistakes teams "
            "most often make with it; adjacent terms it is confused with."
        )
    if family == "guide_variant":
        return (
            f"SUBJECT: a {keys.get('variant', '')} companion to the hub guide "
            f"/guides/{keys.get('guide', '')}.\n"
            "COVER: "
            + {
                "checklist": "a numbered implementation checklist, each item with the evidence that closes it.",
                "faq": "the questions buyers, auditors and regulators actually ask, answered directly.",
                "template": "the document structure this topic requires, section by section, with what belongs in each field.",
            }.get(str(keys.get("variant")), "the practical companion material.")
            + " Do not duplicate the guide; link to it and add the operational layer."
        )
    return "SUBJECT: a compliance reference page."


# Sentence-initial filler connectives. Deleting one never changes a sentence's
# meaning, so this is a deterministic cleanup applied to the text we STORE — not
# a way to sneak boilerplate past the gate. The gate then runs on the cleaned
# text, unchanged and still authoritative; anything it still finds is a real
# problem with the draft.
_LEAD_FILLER_RE = re.compile(
    r"(^|\n|(?<=[.!?]\s))(Furthermore|Moreover|Additionally|In conclusion|In summary),\s+(\w)"
)


def strip_lead_connectives(text: str) -> tuple[str, int]:
    count = 0

    def repl(m: re.Match[str]) -> str:
        nonlocal count
        count += 1
        return f"{m.group(1)}{m.group(3).upper()}"

    return _LEAD_FILLER_RE.sub(repl, text), count


def parse_json_block(text: str) -> dict[str, Any] | None:
    t = (text or "").strip()
    t = re.sub(r"^```(?:json)?\s*", "", t)
    t = re.sub(r"\s*```$", "", t)
    start, end = t.find("{"), t.rfind("}")
    if start < 0 or end <= start:
        return None
    try:
        return json.loads(t[start : end + 1])
    except json.JSONDecodeError:
        return None
