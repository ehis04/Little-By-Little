from __future__ import annotations

from fastapi.testclient import TestClient


def _shape(body: dict[str, object]) -> None:
    assert set(body) == {"error"}
    error = body["error"]
    assert isinstance(error, dict)
    assert set(error) == {"code", "message", "details"}


def test_domain_error_uses_documented_shape(client: TestClient) -> None:
    r = client.get("/_test/voucher")
    assert r.status_code == 422
    _shape(r.json())
    assert r.json()["error"] == {
        "code": "VALIDATION_FAILED",
        "message": "Voucher discount can't exceed its spend threshold.",
        "details": {"field": "discount_cents"},
    }


def test_rate_limited_sets_retry_after(client: TestClient) -> None:
    r = client.get("/_test/limited")
    assert r.status_code == 429
    assert r.headers["Retry-After"] == "7"
    assert r.json()["error"]["code"] == "RATE_LIMITED"


def test_unknown_route_is_not_found(client: TestClient) -> None:
    r = client.get("/v1/nope")
    assert r.status_code == 404
    _shape(r.json())
    assert r.json()["error"]["code"] == "NOT_FOUND"


def test_invalid_body_is_422_without_echoing_input(client: TestClient) -> None:
    r = client.post("/_test/echo", json={"a": "my-private-value"})
    assert r.status_code == 422
    _shape(r.json())
    assert r.json()["error"]["code"] == "VALIDATION_FAILED"
    assert "my-private-value" not in r.text


def test_malformed_json_is_400(client: TestClient) -> None:
    r = client.post(
        "/_test/echo", content="{not json", headers={"Content-Type": "application/json"}
    )
    assert r.status_code == 400
    assert r.json()["error"]["code"] == "BAD_REQUEST"


def test_unexpected_error_never_leaks_and_keeps_request_id(client: TestClient) -> None:
    r = client.get("/_test/boom", headers={"X-Request-ID": "req-12345678"})
    assert r.status_code == 500
    _shape(r.json())
    assert r.json()["error"]["code"] == "INTERNAL_ERROR"
    assert "SELECT" not in r.text
    assert r.headers["X-Request-ID"] == "req-12345678"


def test_request_id_is_kept_or_replaced(client: TestClient) -> None:
    kept = client.get("/v1/health", headers={"X-Request-ID": "abc-12345678"})
    assert kept.headers["X-Request-ID"] == "abc-12345678"
    replaced = client.get("/v1/health", headers={"X-Request-ID": "bad id!"})
    assert replaced.headers["X-Request-ID"] != "bad id!"
