from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from lbl.api.app import create_app
from lbl.core.errors import RateLimited, ValidationFailed
from lbl.settings import AppEnv, Settings


@pytest.fixture
def app() -> FastAPI:
    app = create_app(Settings(app_env=AppEnv.TEST, database_url=None, _env_file=None))  # type: ignore[call-arg]

    @app.get("/_test/voucher")
    async def voucher() -> None:
        raise ValidationFailed(
            "Voucher discount can't exceed its spend threshold.",
            details={"field": "discount_cents"},
        ) from None

    @app.get("/_test/limited")
    async def limited() -> None:
        raise RateLimited("Slow down.", retry_after_seconds=7)

    @app.get("/_test/boom")
    async def boom() -> None:
        raise RuntimeError("secret SQL: SELECT * FROM users")

    @app.post("/_test/echo")
    async def echo(body: dict[str, int]) -> dict[str, int]:
        return body

    return app


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
