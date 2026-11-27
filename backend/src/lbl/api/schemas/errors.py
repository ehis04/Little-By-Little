from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ErrorBody(BaseModel):
    code: str = Field(examples=["VOUCHER_INVALID"])
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """The one error shape used by every endpoint (docs/06-api-spec.md)."""

    error: ErrorBody
