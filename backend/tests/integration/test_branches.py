from __future__ import annotations

import uuid

import pytest
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from lbl.core.types import ExperienceKey
from lbl.data.models import (
    Branch,
    BranchAttribute,
    BranchFormat,
    Chain,
    Confidence,
    PriceScope,
    Source,
)

pytestmark = pytest.mark.integration

# Lidl Finglas, Dublin (longitude, latitude).
FINGLAS = (-6.2996, 53.3921)


async def _seed(session: AsyncSession) -> uuid.UUID:
    session.add(
        Chain(id="lidl", display_name="Lidl", chip_hue=3, price_scope=PriceScope.ONLINE_NATIONAL)
    )
    await session.flush()  # no ORM relationships, so order the inserts ourselves
    branch_id = uuid.uuid4()
    session.add(
        Branch(
            id=branch_id,
            chain_id="lidl",
            name="Lidl Finglas",
            format=BranchFormat.DISCOUNTER,
            address="Finglas, Dublin",
            geom=f"SRID=4326;POINT({FINGLAS[0]} {FINGLAS[1]})",
            h3_cell="88a1d4a6a1fffff",
        )
    )
    await session.flush()
    return branch_id


async def test_insert_and_read_branch_with_geography_point(engine: AsyncEngine) -> None:
    async with AsyncSession(engine) as session, session.begin():
        branch_id = await _seed(session)
        session.expire_all()

        branch = (await session.execute(select(Branch).where(Branch.id == branch_id))).scalar_one()
        assert branch.geom is not None  # geography value round-trips through the ORM
        wkt = await session.scalar(
            select(func.ST_AsText(Branch.geom)).where(Branch.id == branch_id)
        )
        assert wkt == f"POINT({FINGLAS[0]} {FINGLAS[1]})"
        assert branch.active is True
        # Unknown stays unknown.
        assert branch.opening_hours is None
        assert branch.opening_hours_source is None

        # PostGIS can answer a distance query on the geography column (metres).
        near = await session.scalar(
            select(func.count())
            .select_from(Branch)
            .where(
                func.ST_DWithin(
                    Branch.geom, func.ST_GeogFromText(f"POINT({FINGLAS[0]} {FINGLAS[1]})"), 100
                )
            )
        )
        assert near == 1
        await session.rollback()


async def test_branch_attribute_key_is_a_closed_registry(engine: AsyncEngine) -> None:
    async with AsyncSession(engine) as session, session.begin():
        branch_id = await _seed(session)
        session.add(
            BranchAttribute(
                branch_id=branch_id,
                key=ExperienceKey.PARKING.value,
                value={"type": "free_carpark", "spaces": "medium"},
                source=Source.CURATED,
                confidence=Confidence.HIGH,
            )
        )
        await session.flush()
        await session.rollback()

    async with AsyncSession(engine) as session, session.begin():
        branch_id = await _seed(session)
        session.add(
            BranchAttribute(
                branch_id=branch_id,
                key="made_up_key",
                value={},
                source=Source.CURATED,
                confidence=Confidence.LOW,
            )
        )
        with pytest.raises(IntegrityError):
            await session.flush()
        await session.rollback()


async def test_data_version_is_a_single_row(engine: AsyncEngine) -> None:
    async with AsyncSession(engine) as session, session.begin():
        await session.execute(text("INSERT INTO data_version (version) VALUES ('2026-11-27')"))
        with pytest.raises(IntegrityError):
            await session.execute(text("INSERT INTO data_version (version) VALUES ('again')"))
        await session.rollback()
