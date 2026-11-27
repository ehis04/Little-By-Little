"""baseline reference data

Revision ID: 0001
Revises:
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from geoalchemy2 import Geography
from sqlalchemy.dialects import postgresql as pg

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

# Enum definitions are frozen here on purpose: migrations must not import app models.
ENUMS: dict[str, tuple[str, ...]] = {
    "price_scope": ("online_national", "branch"),
    "branch_format": ("hyper", "large", "standard", "express", "discounter"),
    "source": ("curated", "crowd", "osm", "retailer", "supplier", "receipt"),
    "confidence": ("high", "medium", "low"),
    "prior_source": ("chain_format_prior", "curated", "crowd"),
    "perishable_class": ("fresh", "chilled", "frozen", "ambient", "household"),
    "travel_origin": ("cell", "branch"),
    "travel_mode": ("car", "walk", "bike"),
    "run_status": ("running", "succeeded", "failed", "degraded"),
}

EXPERIENCE_KEYS = (
    "parking",
    "trolleys",
    "self_scan",
    "checkout_lanes",
    "quiet_hours",
    "accessibility",
    "return_machine",
    "click_collect",
    "fresh_delivery",
    "in_store_bakery",
    "ev_charging",
)

TABLES_REVERSE = (
    "data_version",
    "source_runs",
    "travel_times",
    "geo_cells",
    "busyness_estimates",
    "branch_attributes",
    "branches",
    "categories",
    "chains",
)


def _enum(name: str) -> pg.ENUM:
    return pg.ENUM(*ENUMS[name], name=name, create_type=False)


def _created_at() -> sa.Column[sa.DateTime]:
    return sa.Column(
        "created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
    )


def _updated_at() -> sa.Column[sa.DateTime]:
    return sa.Column(
        "updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()
    )


def _uuid_id() -> sa.Column[object]:
    return sa.Column(
        "id", pg.UUID(as_uuid=True), nullable=False, server_default=sa.text("gen_random_uuid()")
    )


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    for name, values in ENUMS.items():
        pg.ENUM(*values, name=name).create(op.get_bind(), checkfirst=False)

    op.create_table(
        "chains",
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("display_name", sa.Text(), nullable=False),
        sa.Column("chip_hue", sa.SmallInteger(), nullable=False),
        sa.Column(
            "memberships",
            pg.ARRAY(sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::text[]"),
        ),
        sa.Column("price_scope", _enum("price_scope"), nullable=False),
        _created_at(),
        sa.PrimaryKeyConstraint("id", name="pk_chains"),
    )

    op.create_table(
        "categories",
        sa.Column("id", sa.Text(), nullable=False),
        sa.Column("parent_id", sa.Text(), nullable=True),
        sa.Column("display_name", sa.Text(), nullable=False),
        sa.Column("walk_order", sa.SmallInteger(), nullable=False),
        sa.Column("perishable_class", _enum("perishable_class"), nullable=False),
        sa.Column("default_shelf_life_days", sa.SmallInteger(), nullable=True),
        _created_at(),
        sa.PrimaryKeyConstraint("id", name="pk_categories"),
        sa.ForeignKeyConstraint(
            ["parent_id"], ["categories.id"], name="fk_categories_parent_id_categories"
        ),
    )

    op.create_table(
        "branches",
        _uuid_id(),
        sa.Column("chain_id", sa.Text(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("format", _enum("branch_format"), nullable=False),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column(
            "geom", Geography(geometry_type="POINT", srid=4326, spatial_index=False), nullable=False
        ),
        sa.Column("h3_cell", sa.Text(), nullable=False),
        sa.Column("opening_hours", pg.JSONB(), nullable=True),
        sa.Column("opening_hours_source", _enum("source"), nullable=True),
        sa.Column("osm_id", sa.Text(), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        _created_at(),
        _updated_at(),
        sa.PrimaryKeyConstraint("id", name="pk_branches"),
        sa.ForeignKeyConstraint(["chain_id"], ["chains.id"], name="fk_branches_chain_id_chains"),
    )
    op.create_index("ix_branches_chain_id", "branches", ["chain_id"])
    op.create_index("ix_branches_h3_cell", "branches", ["h3_cell"])
    op.create_index("ix_branches_geom", "branches", ["geom"], postgresql_using="gist")

    key_list = ", ".join(f"'{k}'" for k in EXPERIENCE_KEYS)
    op.create_table(
        "branch_attributes",
        _uuid_id(),
        sa.Column("branch_id", pg.UUID(as_uuid=True), nullable=False),
        sa.Column("key", sa.Text(), nullable=False),
        sa.Column("value", pg.JSONB(), nullable=False),
        sa.Column("source", _enum("source"), nullable=False),
        sa.Column("confidence", _enum("confidence"), nullable=False),
        sa.Column("verified_at", sa.Date(), nullable=True),
        sa.Column("reverify_after_days", sa.SmallInteger(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        _created_at(),
        _updated_at(),
        sa.PrimaryKeyConstraint("id", name="pk_branch_attributes"),
        sa.ForeignKeyConstraint(
            ["branch_id"],
            ["branches.id"],
            name="fk_branch_attributes_branch_id_branches",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint("branch_id", "key", name="uq_branch_attributes_branch_id_key"),
        sa.CheckConstraint(f"key IN ({key_list})", name="ck_branch_attributes_key_registry"),
    )

    op.create_table(
        "busyness_estimates",
        sa.Column("branch_id", pg.UUID(as_uuid=True), nullable=False),
        sa.Column("dow", sa.SmallInteger(), nullable=False),
        sa.Column("hour", sa.SmallInteger(), nullable=False),
        sa.Column("index", sa.SmallInteger(), nullable=False),
        sa.Column("n_reports", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("prior_source", _enum("prior_source"), nullable=False),
        sa.Column("confidence", _enum("confidence"), nullable=False),
        _updated_at(),
        sa.PrimaryKeyConstraint("branch_id", "dow", "hour", name="pk_busyness_estimates"),
        sa.ForeignKeyConstraint(
            ["branch_id"],
            ["branches.id"],
            name="fk_busyness_estimates_branch_id_branches",
            ondelete="CASCADE",
        ),
        sa.CheckConstraint("dow BETWEEN 0 AND 6", name="ck_busyness_estimates_dow_range"),
        sa.CheckConstraint("hour BETWEEN 0 AND 23", name="ck_busyness_estimates_hour_range"),
        sa.CheckConstraint('"index" BETWEEN 0 AND 100', name="ck_busyness_estimates_index_range"),
        sa.CheckConstraint("n_reports >= 0", name="ck_busyness_estimates_n_reports_nonneg"),
    )

    op.create_table(
        "geo_cells",
        sa.Column("h3_cell", sa.Text(), nullable=False),
        sa.Column("area_label", sa.Text(), nullable=False),
        sa.Column(
            "centroid",
            Geography(geometry_type="POINT", srid=4326, spatial_index=False),
            nullable=False,
        ),
        _created_at(),
        sa.PrimaryKeyConstraint("h3_cell", name="pk_geo_cells"),
    )

    op.create_table(
        "travel_times",
        sa.Column("from_kind", _enum("travel_origin"), nullable=False),
        sa.Column("from_id", sa.Text(), nullable=False),
        sa.Column("to_branch_id", pg.UUID(as_uuid=True), nullable=False),
        sa.Column("mode", _enum("travel_mode"), nullable=False),
        sa.Column("minutes", sa.SmallInteger(), nullable=False),
        sa.Column("meters", sa.Integer(), nullable=False),
        sa.Column("osrm_dataset", sa.Text(), nullable=False),
        _created_at(),
        sa.PrimaryKeyConstraint(
            "from_kind", "from_id", "to_branch_id", "mode", name="pk_travel_times"
        ),
        sa.ForeignKeyConstraint(
            ["to_branch_id"],
            ["branches.id"],
            name="fk_travel_times_to_branch_id_branches",
            ondelete="CASCADE",
        ),
        sa.CheckConstraint("minutes >= 0", name="ck_travel_times_minutes_nonneg"),
        sa.CheckConstraint("meters >= 0", name="ck_travel_times_meters_nonneg"),
    )

    op.create_table(
        "source_runs",
        _uuid_id(),
        sa.Column("job", sa.String(), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", _enum("run_status"), nullable=False),
        sa.Column("records_in", sa.Integer(), nullable=True),
        sa.Column("records_written", sa.Integer(), nullable=True),
        sa.Column("errors", pg.JSONB(), nullable=True),
        sa.Column("credits_used", sa.Integer(), nullable=True),
        _created_at(),
        sa.PrimaryKeyConstraint("id", name="pk_source_runs"),
    )
    op.create_index("ix_source_runs_job_started_at", "source_runs", ["job", "started_at"])

    op.create_table(
        "data_version",
        sa.Column("id", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("version", sa.Text(), nullable=False),
        _updated_at(),
        sa.PrimaryKeyConstraint("id", name="pk_data_version"),
        sa.CheckConstraint("id", name="ck_data_version_single_row"),
    )


def downgrade() -> None:
    for table in TABLES_REVERSE:
        op.drop_table(table)
    for name in reversed(ENUMS):
        pg.ENUM(name=name).drop(op.get_bind(), checkfirst=False)
    # The postgis extension is left installed: it is shared infrastructure, not part of our schema.
