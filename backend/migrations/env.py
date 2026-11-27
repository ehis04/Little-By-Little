"""Alembic environment. Runs migrations through the async engine (asyncpg)."""

from __future__ import annotations

import asyncio

from alembic import context
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from lbl.data.db import to_async_url
from lbl.data.models import Base
from lbl.settings import get_settings

config = context.config
target_metadata = Base.metadata


def _database_url() -> str:
    # Tests and tooling may set the URL on the config; otherwise use DATABASE_URL.
    url = config.get_main_option("sqlalchemy.url") or get_settings().database_url
    if not url:
        raise RuntimeError("DATABASE_URL is not set. See backend/.env.example.")
    return to_async_url(url)


def _configure(connection: Connection | None, url: str | None = None) -> None:
    context.configure(
        connection=connection,
        url=url,
        target_metadata=target_metadata,
        literal_binds=connection is None,
        compare_type=True,
        # PostGIS owns spatial_ref_sys and friends; keep them out of comparisons.
        include_object=lambda _obj, name, type_, _reflected, _compare: (
            not (type_ == "table" and name == "spatial_ref_sys")
        ),
    )


def run_migrations_offline() -> None:
    _configure(None, url=_database_url())
    with context.begin_transaction():
        context.run_migrations()


def _run_sync(connection: Connection) -> None:
    _configure(connection)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    engine = create_async_engine(_database_url())
    try:
        async with engine.connect() as connection:
            await connection.run_sync(_run_sync)
    finally:
        await engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
