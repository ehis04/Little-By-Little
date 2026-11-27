from __future__ import annotations

from fastapi import APIRouter

from lbl.api.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse, summary="Liveness and data status")
async def health() -> HealthResponse:
    return HealthResponse(status="ok", db="not_configured", data_version=None)
