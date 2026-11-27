from __future__ import annotations

import asyncio

import structlog
from fastapi import APIRouter, Request

from lbl.api.schemas.health import HealthResponse
from lbl.data.db import read_data_version

router = APIRouter(tags=["health"])
log = structlog.get_logger()

DB_TIMEOUT_SECONDS = 2


@router.get("/health", response_model=HealthResponse, summary="Liveness and data status")
async def health(request: Request) -> HealthResponse:
    engine = request.app.state.engine
    if engine is None:
        return HealthResponse(status="ok", db="not_configured", data_version=None)
    try:
        version = await asyncio.wait_for(read_data_version(engine), DB_TIMEOUT_SECONDS)
    except Exception:
        # Report unavailable, never ok without a successful query. Details stay out of the body.
        log.warning("health_db_unavailable", exc_info=True)
        return HealthResponse(status="ok", db="unavailable", data_version=None)
    return HealthResponse(status="ok", db="ok", data_version=version)
