from __future__ import annotations

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy.pool import NullPool

pytestmark = pytest.mark.integration

TABLES = {
    "chains",
    "branches",
    "branch_attributes",
    "busyness_estimates",
    "categories",
    "geo_cells",
    "travel_times",
    "source_runs",
    "data_version",
}

LIST_TABLES = text(
    "SELECT table_name FROM information_schema.tables "
    "WHERE table_schema = 'public' AND table_name <> 'alembic_version' "
    "AND table_name <> 'spatial_ref_sys' AND table_type = 'BASE TABLE'"
)
LIST_ENUMS = text(
    "SELECT t.typname FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace "
    "WHERE n.nspname = 'public' AND t.typtype = 'e'"
)


async def _names(engine: AsyncEngine, query: object) -> set[str]:
    async with engine.connect() as conn:
        return {row[0] for row in await conn.execute(query)}  # type: ignore[arg-type]


async def test_upgrade_creates_all_tables(engine: AsyncEngine) -> None:
    assert await _names(engine, LIST_TABLES) == TABLES


async def test_downgrade_then_upgrade_is_clean(
    alembic_config: Config, database_url: str, migrated_db: None
) -> None:
    # Migrations run through their own async engine, so this test must not hold a loop-bound
    # connection of its own while they run; use short-lived engines for the checks.
    async def tables() -> set[str]:
        eng = create_async_engine(database_url, poolclass=NullPool)
        try:
            return await _names(eng, LIST_TABLES)
        finally:
            await eng.dispose()

    async def enums() -> set[str]:
        eng = create_async_engine(database_url, poolclass=NullPool)
        try:
            return await _names(eng, LIST_ENUMS)
        finally:
            await eng.dispose()

    try:
        await _run(command.downgrade, alembic_config, "base")
        assert await tables() == set()
        assert await enums() == set()
    finally:
        await _run(command.upgrade, alembic_config, "head")
    assert await tables() == TABLES
    assert len(await enums()) == 9


async def _run(fn: object, cfg: Config, rev: str) -> None:
    import asyncio

    # alembic's env.py calls asyncio.run, so it has to leave this event loop's thread.
    await asyncio.to_thread(fn, cfg, rev)  # type: ignore[operator]
