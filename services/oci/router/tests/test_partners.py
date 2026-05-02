import datetime as dt

import partners as partners_mod


SAMPLE_PARTNERS = [
    {
        "id": "p-realtor-1",
        "name": "Realtor One",
        "email": "r1@example.com",
        "type": "realtor",
        "jurisdictions": ["UAE"],
        "tier": 1,
        "weekly_cap": 5,
        "current_week_count": 0,
        "current_week_start": None,
        "active": True,
    },
    {
        "id": "p-lawyer-1",
        "name": "Lawyer One",
        "email": "l1@example.com",
        "type": "re_lawyer",
        "jurisdictions": ["UAE", "SG"],
        "tier": 2,
        "weekly_cap": 5,
        "current_week_count": 0,
        "current_week_start": None,
        "active": True,
    },
    {
        "id": "p-placeholder",
        "name": "Placeholder",
        "email": "team@bizlegal-ai.com",
        "type": "placeholder",
        "jurisdictions": ["UAE", "SG", "US", "EU", "IL", "GB"],
        "tier": 5,
        "weekly_cap": 100,
        "current_week_count": 0,
        "current_week_start": None,
        "active": True,
    },
]


def _patched(monkeypatch, partners_list):
    monkeypatch.setattr(partners_mod, "supabase_get", lambda *_a, **_k: partners_list)
    monkeypatch.setattr(partners_mod, "supabase_patch", lambda *_a, **_k: [])


def test_realtor_lawyer_routes_to_realtor_first(monkeypatch):
    _patched(monkeypatch, SAMPLE_PARTNERS)
    chosen = partners_mod.select_partner("UAE_REAL_ESTATE", "realtor + lawyer", today=dt.date(2026, 4, 27))
    assert chosen is not None
    # both eligible; tier 1 realtor wins
    assert chosen["type"] == "realtor"


def test_lawyer_only_routes_to_lawyer(monkeypatch):
    _patched(monkeypatch, SAMPLE_PARTNERS)
    chosen = partners_mod.select_partner("SG_BUSINESS_SETUP", "lawyer", today=dt.date(2026, 4, 27))
    assert chosen is not None
    assert chosen["type"] == "re_lawyer"


def test_falls_back_to_placeholder_when_no_real(monkeypatch):
    only_placeholder = [SAMPLE_PARTNERS[2]]
    _patched(monkeypatch, only_placeholder)
    chosen = partners_mod.select_partner("UAE_REAL_ESTATE", "lawyer", today=dt.date(2026, 4, 27))
    assert chosen is not None
    assert chosen["type"] == "placeholder"


def test_skips_when_at_weekly_cap(monkeypatch):
    monday = dt.date(2026, 4, 27)  # Monday
    capped = [{**SAMPLE_PARTNERS[0], "current_week_count": 5, "current_week_start": monday.isoformat()}]
    _patched(monkeypatch, capped + [SAMPLE_PARTNERS[2]])
    chosen = partners_mod.select_partner("UAE_REAL_ESTATE", "realtor", today=monday)
    assert chosen is not None
    # capped realtor skipped; falls through to placeholder
    assert chosen["type"] == "placeholder"


def test_jurisdiction_filter_excludes_mismatch(monkeypatch):
    _patched(monkeypatch, SAMPLE_PARTNERS)
    # SG realtor doesn't exist in sample → falls through to placeholder
    chosen = partners_mod.select_partner("SG_BUSINESS_SETUP", "realtor", today=dt.date(2026, 4, 27))
    assert chosen is not None
    assert chosen["type"] == "placeholder"
