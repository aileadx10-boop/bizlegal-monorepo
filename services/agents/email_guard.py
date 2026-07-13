"""
email_guard.py — central validator for lead emails.

Built 2026-07-10 as part of the $5K-MRR plan Phase A.8.

Stops the spam machine from creating lead rows with fabricated
emails like `compliance@<github-username>.github.io` (28 such rows
were in the DB on 2026-07-10, all pre-halt, all score=95).

This module exports one function:
  is_valid_lead_email(email) -> bool

Returns False for:
  - Empty / None
  - No @ sign
  - Domain in FORBIDDEN_DOMAINS (github.io, github.com, etc.)
  - Domain contains FORBIDDEN_SUFFIXES (`.local`, `.test`, etc.)

Returns True for everything else. The function is intentionally
lenient — a real-looking email like `jane@acme.fintech` passes
even if the TLD is fake, because we want to allow new TLDs.
"""
from __future__ import annotations

# Domains that are NEVER real recipient addresses
FORBIDDEN_DOMAINS = {
    "github.io",
    "github.com",
    "example.com",
    "example.org",
    "example.net",
    "localhost",
}

# Substrings that signal a placeholder/fake email
FORBIDDEN_SUBSTRINGS = (
    "placeholder",
    "yourcompany",
    "your-domain",
    "yourdomain",
    "example.local",
)

# Domain suffixes that are obviously fake
FORBIDDEN_SUFFIXES = (
    ".local",
    ".test",
    ".invalid",
    ".example",
    "@localhost",
)


def is_valid_lead_email(email: str | None) -> bool:
    """Returns True if the email looks like a real recipient address.

    A real address must:
      - Not be None or empty
      - Contain exactly one @
      - Have a domain part with at least one dot
      - Not have a root domain in FORBIDDEN_DOMAINS
      - Not contain FORBIDDEN_SUBSTRINGS
      - Not end in FORBIDDEN_SUFFIXES
    """
    if not email or not isinstance(email, str):
        return False
    e = email.strip().lower()
    if not e or "@" not in e:
        return False
    parts = e.split("@")
    if len(parts) != 2:
        return False
    local, domain = parts
    if not local or not domain:
        return False
    if "." not in domain:
        return False
    # Match the ROOT domain (last 2 parts) so compliance@<anything>.github.io fails
    domain_parts = domain.split(".")
    if len(domain_parts) >= 2:
        root_domain = ".".join(domain_parts[-2:])
    else:
        root_domain = domain
    if root_domain in FORBIDDEN_DOMAINS:
        return False
    if any(s in e for s in FORBIDDEN_SUBSTRINGS):
        return False
    if any(e.endswith(suf) for suf in FORBIDDEN_SUFFIXES):
        return False
    return True


# Self-test when run directly
if __name__ == "__main__":
    test_cases = [
        # Should be REJECTED
        ("compliance@A-O-K1.github.io", False),
        ("compliance@circlefin.github.io", False),
        ("jane@placeholder.local", False),
        ("", False),
        (None, False),
        ("not-an-email", False),
        ("jane@github.com", False),
        ("jane@example.com", False),
        ("jane@acme.local", False),
        ("@example.com", False),
        ("jane@", False),
        ("jane@@acme.com", False),
        # Should be ACCEPTED
        ("jane@acme.fintech", True),
        ("compliance@coinbase.com", True),
        ("info@digifinex.com", True),
        ("team@microsoft.com", True),
        ("a@b.io", True),  # single-char local, real TLD
    ]
    failed = 0
    for email, expected in test_cases:
        result = is_valid_lead_email(email)
        status = "OK" if result == expected else "FAIL"
        if status == "FAIL":
            failed += 1
        print(f"  [{status:4}]  is_valid_lead_email({email!r:<40}) = {result}  (expected {expected})")
    print()
    if failed == 0:
        print(f"  All {len(test_cases)} test cases passed.")
    else:
        print(f"  {failed} test(s) FAILED.")
        import sys
        sys.exit(1)
