"""Async database engine and connectivity check. No business logic lives here."""

from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine


def to_async_url(url: str) -> str:
    """Accept the plain URLs hosts hand out (`postgres://`, `postgresql://`) and use asyncpg."""
    for prefix in ("postgresql://", "postgres://"):
        if url.startswith(prefix):
            return "postgresql+asyncpg://" + url[len(prefix) :]
    return url


def create_engine(database_url: str) -> AsyncEngine:
    return create_async_engine(to_async_url(database_url), pool_pre_ping=True)


async def read_data_version(engine: AsyncEngine) -> str | None:
    """Return the current data version, or None when no ingest has run yet.

    Raises if the database cannot be reached.
    """
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT version FROM data_version"))
        return result.scalar_one_or_none()
