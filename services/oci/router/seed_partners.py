"""Interactive partner seed for the OCI router.

Run on Hetzner from /opt/bizlegal-monorepo/services/oci/router:

    SUPABASE_URL=... SUPABASE_SECRET=... python3 seed_partners.py

The script prompts for one partner at a time, validates input, and
inserts via the same Supabase REST helper the router uses at runtime
(storage.supabase_insert / supabase_get). Idempotent on email — if a
row with the same email already exists, it offers an UPDATE path
rather than a duplicate insert.

Schema (must already exist in Supabase):
    partners(id uuid pk, name text, email text unique, type text,
             jurisdictions text[], specialties text[], tier int,
             weekly_cap int, language_codes text[], active bool,
             current_week_count int default 0,
             current_week_start date)

Used by:
    services/oci/router/partners.py:select_partner

Phase AA D5 — Moses can run this once per partner once outreach
returns yes. Until then the placeholder partner (tier=5, type=placeholder)
catches all routes so the router never silently drops a lead.
"""
from __future__ import annotations

import os
import sys
from typing import Any

# Re-use the router's storage layer so credential handling stays in
# one place and matches production behaviour exactly.
try:
    from storage import supabase_get, supabase_insert, supabase_patch
except ImportError:
    sys.stderr.write(
        "[seed_partners] could not import storage.py — run from "
        "services/oci/router/ with SUPABASE_URL + SUPABASE_SECRET set\n"
    )
    raise

# Mirrors LAWYER_TYPES + REALTOR_TYPES in partners.py. Keep in sync.
VALID_TYPES = (
    "re_lawyer",
    "business_lawyer",
    "structuring_advisor",
    "family_office_advisor",
    "realtor",
    "placeholder",
)

# Jurisdictions the classifier currently recognises. Anything else is
# accepted but warned (a partner outside known jurisdictions will only
# match LEGAL_RISK_REPORT routes — confirm before saving).
KNOWN_JURISDICTIONS = ("UAE", "SG", "US", "EU", "UK", "CH", "AE", "DE", "IL")


def prompt(label: str, *, default: str | None = None, required: bool = True) -> str:
    """Prompt with optional default. Re-prompts if required and empty."""
    suffix = f" [{default}]" if default else ""
    while True:
        try:
            raw = input(f"{label}{suffix}: ").strip()
        except EOFError:
            print()
            sys.exit(1)
        if not raw and default is not None:
            return default
        if raw or not required:
            return raw
        print("  required — please enter a value")


def prompt_choice(label: str, choices: tuple[str, ...], *, default: str | None = None) -> str:
    """Prompt for one of a fixed set of choices."""
    while True:
        choice = prompt(f"{label} ({'/'.join(choices)})", default=default)
        if choice in choices:
            return choice
        print(f"  must be one of: {', '.join(choices)}")


def prompt_int(label: str, *, default: int | None = None, minimum: int = 1, maximum: int = 100) -> int:
    while True:
        raw = prompt(label, default=str(default) if default is not None else None)
        try:
            value = int(raw)
        except ValueError:
            print("  must be a whole number")
            continue
        if value < minimum or value > maximum:
            print(f"  must be between {minimum} and {maximum}")
            continue
        return value


def prompt_list(label: str, *, default: list[str] | None = None) -> list[str]:
    """Prompt for a comma-separated list. Trims + strips empties."""
    default_str = ",".join(default) if default else None
    raw = prompt(f"{label} (comma-separated)", default=default_str, required=False)
    if not raw:
        return []
    return [s.strip() for s in raw.split(",") if s.strip()]


def prompt_yes_no(label: str, *, default: bool = True) -> bool:
    suffix = "Y/n" if default else "y/N"
    while True:
        raw = prompt(f"{label} ({suffix})", default="", required=False).lower()
        if not raw:
            return default
        if raw in ("y", "yes"):
            return True
        if raw in ("n", "no"):
            return False
        print("  please answer y or n")


def find_partner_by_email(email: str) -> dict[str, Any] | None:
    rows = supabase_get(
        "partners",
        params={
            "email": f"eq.{email}",
            "select": "*",
            "limit": "1",
        },
    )
    return rows[0] if rows else None


def collect_partner() -> dict[str, Any]:
    """Drive the prompts and return a validated partner record."""
    print()
    print("─" * 60)
    print("New partner")
    print("─" * 60)

    name = prompt("Name (firm or person)")
    email = prompt("Contact email").lower()

    existing = find_partner_by_email(email)
    if existing:
        print(f"\n  existing partner found: id={existing['id']} name={existing['name']!r} active={existing.get('active')}")
        if not prompt_yes_no("Update this partner instead?", default=True):
            print("  aborting — pick a different email or rerun and skip this partner")
            sys.exit(2)

    ptype = prompt_choice("Partner type", VALID_TYPES, default="business_lawyer")
    jurisdictions = prompt_list(
        f"Jurisdictions (known: {', '.join(KNOWN_JURISDICTIONS)})",
        default=["US"] if not existing else (existing.get("jurisdictions") or []),
    )
    if not jurisdictions:
        print("  WARNING: empty jurisdictions list — partner will only match jurisdiction-agnostic routes")

    specialties = prompt_list(
        "Specialties (e.g. real_estate, fund_formation, sanctions)",
        default=existing.get("specialties") if existing else None,
    )
    languages = prompt_list(
        "Language codes (ISO-639-1, e.g. en,ar,fr)",
        default=existing.get("language_codes") if existing else ["en"],
    )

    tier = prompt_int(
        "Tier (1=top priority, 5=fallback)",
        default=existing.get("tier") if existing else 2,
        minimum=1,
        maximum=5,
    )
    weekly_cap = prompt_int(
        "Weekly lead cap (max referrals per ISO week)",
        default=existing.get("weekly_cap") if existing else 5,
        minimum=1,
        maximum=100,
    )
    active = prompt_yes_no("Active immediately?", default=True)

    record = {
        "name": name,
        "email": email,
        "type": ptype,
        "jurisdictions": jurisdictions,
        "specialties": specialties,
        "language_codes": languages,
        "tier": tier,
        "weekly_cap": weekly_cap,
        "active": active,
    }

    print()
    print("Review:")
    for key, value in record.items():
        print(f"  {key:18s} {value!r}")
    print()
    if not prompt_yes_no("Save this partner?", default=True):
        print("  skipped")
        return {}

    if existing:
        rows = supabase_patch(
            "partners",
            params={"id": f"eq.{existing['id']}"},
            body=record,
        )
        action = "updated"
    else:
        rows = supabase_insert("partners", record)
        action = "inserted"
    if not rows:
        sys.stderr.write("  ERROR: write returned no row — partner may not be saved\n")
        return {}
    saved = rows[0]
    print(f"  ✓ {action} partner id={saved['id']} name={saved['name']!r}")
    return saved


def main() -> int:
    if "SUPABASE_URL" not in os.environ or "SUPABASE_SECRET" not in os.environ:
        sys.stderr.write(
            "[seed_partners] SUPABASE_URL and SUPABASE_SECRET must be set in env\n"
        )
        return 1

    print("OCI partner seed — interactive")
    print("(press Ctrl+D or empty name to stop)")
    saved_count = 0
    while True:
        try:
            partner = collect_partner()
        except SystemExit:
            raise
        except KeyboardInterrupt:
            print("\n  interrupted")
            break
        if partner:
            saved_count += 1
        if not prompt_yes_no("Add another partner?", default=False):
            break

    print()
    print(f"Done. {saved_count} partner(s) saved this session.")
    print("Verify with: select id,name,type,tier,active from partners order by tier;")
    return 0


if __name__ == "__main__":
    sys.exit(main())
