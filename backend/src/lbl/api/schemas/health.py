from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]
    # "not_configured" when DATABASE_URL is unset; "ok" only after a successful query.
    db: Literal["ok", "unavailable", "not_configured"]
    # Unknown stays unknown: null until a data version exists.
    data_version: str | None
