from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_ok(client: TestClient) -> None:
    r = client.get("/v1/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "db": "not_configured", "data_version": None}


def test_health_needs_no_auth_and_returns_request_id(client: TestClient) -> None:
    r = client.get("/v1/health")
    assert len(r.headers["X-Request-ID"]) >= 8
