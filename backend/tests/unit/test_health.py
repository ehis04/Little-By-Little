from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_ok(client: TestClient) -> None:
    r = client.get("/v1/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "db": "not_configured", "data_version": None}


def test_health_needs_no_auth_and_returns_request_id(client: TestClient) -> None:
    r = client.get("/v1/health")
    assert len(r.headers["X-Request-ID"]) >= 8


def test_health_reports_unavailable_when_database_is_down() -> None:
    from lbl.api.app import create_app
    from lbl.settings import AppEnv, Settings

    # Nothing listens on port 1, so the connection is refused straight away.
    settings = Settings(
        app_env=AppEnv.TEST,
        database_url="postgresql://lbl:lbl@127.0.0.1:1/lbl",
        _env_file=None,  # type: ignore[call-arg]
    )
    with TestClient(create_app(settings)) as c:
        r = c.get("/v1/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "db": "unavailable", "data_version": None}
