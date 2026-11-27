"""Integration fixtures. Need Postgres + PostGIS: `make db-up`, or the CI service container.

Set TEST_DATABASE_URL (see backend/.env.example). Tests are skipped when it is unset or the
database is unreachable, so `make check` still works without Docker; CI always provides one.
"""

from __future__ import annotations

import os
import socket
from collections.abc import AsyncIterator, Iterator
from pathlib import Path
from urllib.parse import urlparse

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.pool import NullPool

from lbl.data.db import to_async_url

BACKEND_DIR = Path(__file__).resolve().parents[2]


def _reachable(url: str) -> bool:
    parsed = urlparse(url)
    try:
        with socket.create_connection((parsed.hostname or "localhost", parsed.port or 5432), 2):
            return True
    except OSError:
        return False


@pytest.fixture(scope="session")
def database_url() -> str:
    url = os.environ.get("TEST_DATABASE_URL")
    if not url:
        pytest.skip("TEST_DATABASE_URL is not set (run `make db-up`)")
    if not _reachable(url):
        if os.environ.get("CI"):
            pytest.fail("TEST_DATABASE_URL is set but the database is unreachable")
        pytest.skip("test database is not reachable (run `make db-up`)")
    return to_async_url(url)


@pytest.fixture(scope="session")
def alembic_config(database_url: str) -> Config:
    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
    cfg.set_main_option("sqlalchemy.url", database_url.replace("%", "%%"))
    return cfg


@pytest.fixture(scope="session")
def migrated_db(alembic_config: Config) -> Iterator[None]:
    """A database at the latest revision. Starts clean so stale local data cannot leak in."""
    command.downgrade(alembic_config, "base")
    command.upgrade(alembic_config, "head")
    yield


@pytest.fixture
async def engine(database_url: str, migrated_db: None) -> AsyncIterator[AsyncEngine]:
    eng = create_async_engine(database_url, poolclass=NullPool)
    try:
        yield eng
    finally:
        await eng.dispose()
