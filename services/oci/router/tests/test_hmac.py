import os

import pytest

from hmac_verify import expected_signature, verify_signature


@pytest.fixture(autouse=True)
def secret(monkeypatch):
    monkeypatch.setenv("BIZLEGAL_INBOUND_SECRET", "test-secret-123")


def test_signature_matches():
    body = b'{"text":"hello"}'
    sig = expected_signature(body, "test-secret-123")
    # Raw hex, no sha256= prefix (matches EA Worker + 6 product /api/inbound-lead)
    assert len(sig) == 64
    assert all(c in "0123456789abcdef" for c in sig)
    assert verify_signature(body, sig)


def test_signature_rejects_tamper():
    sig = expected_signature(b'{"text":"hello"}', "test-secret-123")
    assert not verify_signature(b'{"text":"hi"}', sig)


def test_missing_header_rejected():
    assert not verify_signature(b"x", None)
    assert not verify_signature(b"x", "")


def test_wrong_secret_rejected(monkeypatch):
    body = b"x"
    sig = expected_signature(body, "other-secret")
    assert not verify_signature(body, sig)
