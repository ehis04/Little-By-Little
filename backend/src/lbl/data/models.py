"""SQLAlchemy models for the baseline schema (docs/04 section 2). Alembic owns the schema."""

from __future__ import annotations

import enum
import uuid
from datetime import date, datetime
from typing import Any

from geoalchemy2 import Geography
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    MetaData,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy import Enum as SAEnum
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from lbl.core.types import ExperienceKey

# Stable constraint names so migrations can refer to them.
NAMING_CONVENTION = {
    "ix": "ix_%(table_name)s_%(column_0_N_name)s",
    "uq": "uq_%(table_name)s_%(column_0_N_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


class PriceScope(enum.StrEnum):
    ONLINE_NATIONAL = "online_national"
    BRANCH = "branch"


class BranchFormat(enum.StrEnum):
    HYPER = "hyper"
    LARGE = "large"
    STANDARD = "standard"
    EXPRESS = "express"
    DISCOUNTER = "discounter"


class Source(enum.StrEnum):
    CURATED = "curated"
    CROWD = "crowd"
    OSM = "osm"
    RETAILER = "retailer"
    SUPPLIER = "supplier"
    RECEIPT = "receipt"


class Confidence(enum.StrEnum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class PriorSource(enum.StrEnum):
    CHAIN_FORMAT_PRIOR = "chain_format_prior"
    CURATED = "curated"
    CROWD = "crowd"


class PerishableClass(enum.StrEnum):
    FRESH = "fresh"
    CHILLED = "chilled"
    FROZEN = "frozen"
    AMBIENT = "ambient"
    HOUSEHOLD = "household"


class TravelOrigin(enum.StrEnum):
    CELL = "cell"
    BRANCH = "branch"


class TravelMode(enum.StrEnum):
    CAR = "car"
    WALK = "walk"
    BIKE = "bike"


class RunStatus(enum.StrEnum):
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    DEGRADED = "degraded"


def pg_enum(enum_cls: type[enum.Enum], name: str) -> SAEnum:
    """Postgres enum storing the enum *values* (not member names)."""
    return SAEnum(
        enum_cls,
        name=name,
        values_callable=lambda e: [m.value for m in e],
        create_type=False,
    )


def _uuid_pk() -> Mapped[uuid.UUID]:
    return mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )


def _created_at() -> Mapped[datetime]:
    return mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class Chain(Base):
    __tablename__ = "chains"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    display_name: Mapped[str] = mapped_column(Text)
    chip_hue: Mapped[int] = mapped_column(SmallInteger)
    memberships: Mapped[list[str]] = mapped_column(ARRAY(Text), server_default=text("'{}'::text[]"))
    price_scope: Mapped[PriceScope] = mapped_column(pg_enum(PriceScope, "price_scope"))
    created_at: Mapped[datetime] = _created_at()


class Branch(Base):
    __tablename__ = "branches"
    __table_args__ = (
        Index("ix_branches_geom", "geom", postgresql_using="gist"),
        Index("ix_branches_h3_cell", "h3_cell"),
    )

    id: Mapped[uuid.UUID] = _uuid_pk()
    chain_id: Mapped[str] = mapped_column(ForeignKey("chains.id"), index=True)
    name: Mapped[str] = mapped_column(Text)
    format: Mapped[BranchFormat] = mapped_column(pg_enum(BranchFormat, "branch_format"))
    address: Mapped[str] = mapped_column(Text)
    geom: Mapped[Any] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False)
    )
    h3_cell: Mapped[str] = mapped_column(Text)
    # NULL means unknown (never guessed).
    opening_hours: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    opening_hours_source: Mapped[Source | None] = mapped_column(
        pg_enum(Source, "source"), nullable=True
    )
    osm_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(server_default=text("true"))
    created_at: Mapped[datetime] = _created_at()
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class BranchAttribute(Base):
    __tablename__ = "branch_attributes"
    __table_args__ = (
        UniqueConstraint("branch_id", "key"),
        CheckConstraint(
            "key IN (" + ", ".join(f"'{k.value}'" for k in ExperienceKey) + ")",
            name="key_registry",
        ),
    )

    id: Mapped[uuid.UUID] = _uuid_pk()
    branch_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"))
    key: Mapped[str] = mapped_column(Text)
    value: Mapped[Any] = mapped_column(JSONB)
    source: Mapped[Source] = mapped_column(pg_enum(Source, "source"))
    confidence: Mapped[Confidence] = mapped_column(pg_enum(Confidence, "confidence"))
    verified_at: Mapped[date | None] = mapped_column(nullable=True)
    # NULL means "use the registry default for this key".
    reverify_after_days: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = _created_at()
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class BusynessEstimate(Base):
    __tablename__ = "busyness_estimates"
    __table_args__ = (
        CheckConstraint("dow BETWEEN 0 AND 6", name="dow_range"),
        CheckConstraint("hour BETWEEN 0 AND 23", name="hour_range"),
        CheckConstraint('"index" BETWEEN 0 AND 100', name="index_range"),
        CheckConstraint("n_reports >= 0", name="n_reports_nonneg"),
    )

    branch_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("branches.id", ondelete="CASCADE"), primary_key=True
    )
    dow: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    hour: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    index: Mapped[int] = mapped_column(SmallInteger)
    n_reports: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    prior_source: Mapped[PriorSource] = mapped_column(pg_enum(PriorSource, "prior_source"))
    confidence: Mapped[Confidence] = mapped_column(pg_enum(Confidence, "confidence"))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    parent_id: Mapped[str | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    display_name: Mapped[str] = mapped_column(Text)
    walk_order: Mapped[int] = mapped_column(SmallInteger)
    perishable_class: Mapped[PerishableClass] = mapped_column(
        pg_enum(PerishableClass, "perishable_class")
    )
    default_shelf_life_days: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    created_at: Mapped[datetime] = _created_at()


class GeoCell(Base):
    __tablename__ = "geo_cells"

    h3_cell: Mapped[str] = mapped_column(Text, primary_key=True)
    area_label: Mapped[str] = mapped_column(Text)
    centroid: Mapped[Any] = mapped_column(
        Geography(geometry_type="POINT", srid=4326, spatial_index=False)
    )
    created_at: Mapped[datetime] = _created_at()


class TravelTime(Base):
    __tablename__ = "travel_times"
    __table_args__ = (
        CheckConstraint("minutes >= 0", name="minutes_nonneg"),
        CheckConstraint("meters >= 0", name="meters_nonneg"),
    )

    from_kind: Mapped[TravelOrigin] = mapped_column(
        pg_enum(TravelOrigin, "travel_origin"), primary_key=True
    )
    from_id: Mapped[str] = mapped_column(Text, primary_key=True)
    to_branch_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("branches.id", ondelete="CASCADE"), primary_key=True
    )
    mode: Mapped[TravelMode] = mapped_column(pg_enum(TravelMode, "travel_mode"), primary_key=True)
    minutes: Mapped[int] = mapped_column(SmallInteger)
    meters: Mapped[int] = mapped_column(Integer)
    osrm_dataset: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = _created_at()


class SourceRun(Base):
    __tablename__ = "source_runs"
    __table_args__ = (Index("ix_source_runs_job_started_at", "job", "started_at"),)

    id: Mapped[uuid.UUID] = _uuid_pk()
    job: Mapped[str] = mapped_column(String)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[RunStatus] = mapped_column(pg_enum(RunStatus, "run_status"))
    records_in: Mapped[int | None] = mapped_column(Integer, nullable=True)
    records_written: Mapped[int | None] = mapped_column(Integer, nullable=True)
    errors: Mapped[Any | None] = mapped_column(JSONB, nullable=True)
    credits_used: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = _created_at()


class DataVersion(Base):
    """Single row. Bumped at the end of each successful ingest; the API reads it to bust caches."""

    __tablename__ = "data_version"
    __table_args__ = (CheckConstraint("id", name="single_row"),)

    id: Mapped[bool] = mapped_column(primary_key=True, server_default=text("true"))
    version: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
