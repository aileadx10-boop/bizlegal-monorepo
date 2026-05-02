"""Eval harness: replay leads.jsonl through classify() and score accuracy.

Usage (from inside router/):
    python eval.py examples/leads.jsonl

Output: per-classification breakdown + overall accuracy + hallucination check.
"""
from __future__ import annotations

import argparse
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

from llm import classify

HALLUCINATION_TOKENS = ("$", "AED", "AUM", "USD")  # rough check for fabricated figures


def _normalize(value: str | None) -> str:
    return (value or "").strip().upper()


def _hallucination_check(raw_text: str, output: dict[str, object]) -> list[str]:
    """Flag if rationale contains figures not present in input."""
    rationale = str(output.get("one_sentence_rationale") or "")
    flags: list[str] = []
    for token in HALLUCINATION_TOKENS:
        if token in rationale and token not in raw_text:
            flags.append(f"rationale mentions {token!r} not in input")
    return flags


def run(path: Path) -> int:
    cases = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    total = len(cases)
    correct_class = 0
    correct_action = 0
    correct_priority = 0
    by_class: dict[str, Counter] = defaultdict(Counter)
    hallucinations: list[tuple[str, list[str]]] = []
    confusion: list[dict[str, str]] = []

    for case in cases:
        lead_id = case["id"]
        text = case["text"]
        exp_class = _normalize(case.get("expected_classification"))
        exp_action = _normalize(case.get("expected_action"))
        exp_priority = _normalize(case.get("expected_priority"))

        try:
            parsed = classify(text)
        except Exception as exc:
            print(f"[{lead_id}] LLM call failed: {exc}", file=sys.stderr)
            confusion.append({"id": lead_id, "error": str(exc)})
            continue

        output = parsed.get("output") or {}
        got_class = _normalize(output.get("classification"))
        got_action = _normalize(output.get("action"))
        got_priority = _normalize(output.get("priority"))

        ok_class = got_class == exp_class
        ok_action = got_action == exp_action
        ok_priority = got_priority == exp_priority

        if ok_class:
            correct_class += 1
        if ok_action:
            correct_action += 1
        if ok_priority:
            correct_priority += 1
        by_class[exp_class][got_class] += 1

        flags = _hallucination_check(text, output)
        if flags:
            hallucinations.append((lead_id, flags))

        if not (ok_class and ok_action and ok_priority):
            confusion.append({
                "id": lead_id,
                "expected": f"{exp_class}/{exp_action}/{exp_priority}",
                "got": f"{got_class}/{got_action}/{got_priority}",
            })

    print(f"\n=== Eval results ({total} cases) ===")
    print(f"Classification accuracy: {correct_class}/{total} = {correct_class/total:.1%}")
    print(f"Action accuracy        : {correct_action}/{total} = {correct_action/total:.1%}")
    print(f"Priority accuracy      : {correct_priority}/{total} = {correct_priority/total:.1%}")

    print("\nPer-class breakdown (expected -> got -> count):")
    for exp_cls, got_counts in sorted(by_class.items()):
        for got_cls, count in got_counts.most_common():
            mark = "OK" if got_cls == exp_cls else "MISS"
            print(f"  [{mark}] {exp_cls} -> {got_cls}: {count}")

    if hallucinations:
        print(f"\nPotential hallucinations ({len(hallucinations)}):")
        for lid, flags in hallucinations:
            print(f"  {lid}: {'; '.join(flags)}")
    else:
        print("\nNo hallucination flags raised.")

    if confusion:
        print(f"\nMismatches ({len(confusion)}):")
        for c in confusion:
            print(f"  {c}")

    accuracy = correct_class / total if total else 0
    return 0 if accuracy >= 0.9 else 1


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("path", type=Path, nargs="?", default=Path(__file__).parent / "examples" / "leads.jsonl")
    args = ap.parse_args()
    return run(args.path)


if __name__ == "__main__":
    raise SystemExit(main())
