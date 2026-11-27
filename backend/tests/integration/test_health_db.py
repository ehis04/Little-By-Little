from __future__ import annotations

from collections.abc import AsyncIterator

import httpx
import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine

from lbl.api.app import create_app
from lbl.settings import AppEnv, Settings

pytestmark = pytest.mark.integration


@pytest.fixture
async def client(database_url: str, engine: AsyncEngine) -> AsyncIterator[httpx.AsyncClient]:
    settings = Settings(app_env=AppEnv.TEST, database_url=database_url, _env_file=None)  # type: ignore[call-arg]
    app = create_app(settings)
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            yield c


async def test_health_reports_db_ok_and_unknown_data_version(client: httpx.AsyncClient) -> None:
    r = await client.get("/v1/health")
    assert r.json() == {"status": "ok", "db": "ok", "data_version": None}


async def test_health_reports_data_version(client: httpx.AsyncClient, engine: AsyncEngine) -> None:
    async with engine.begin() as conn:
        await conn.execute(text("DELETE FROM data_version"))
        await conn.execute(text("INSERT INTO data_version (version) VALUES ('2026-11-27T03:00Z')"))
    try:
        r = await client.get("/v1/health")
        assert r.json()["data_version"] == "2026-11-27T03:00Z"
    finally:
        async with engine.begin() as conn:
            await conn.execute(text("DELETE FROM data_version"))
