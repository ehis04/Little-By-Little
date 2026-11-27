"""Domain errors. Pure: no web framework imports. The API maps them to HTTP responses."""

from __future__ import annotations

from typing import Any, ClassVar


class LblError(Exception):
    """Base class. Subclasses set a stable `code` and the HTTP status the API maps it to."""

    code: ClassVar[str] = "INTERNAL_ERROR"
    status_code: ClassVar[int] = 500

    def __init__(
        self,
        message: str,
        *,
        details: dict[str, Any] | None = None,
        headers: dict[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.details: dict[str, Any] = details or {}
        self.headers: dict[str, str] = headers or {}


class BadRequest(LblError):
    code = "BAD_REQUEST"
    status_code = 400


class Unauthenticated(LblError):
    code = "UNAUTHENTICATED"
    status_code = 401


class NotFound(LblError):
    code = "NOT_FOUND"
    status_code = 404


class Conflict(LblError):
    code = "CONFLICT"
    status_code = 409


class ValidationFailed(LblError):
    code = "VALIDATION_FAILED"
    status_code = 422


class RateLimited(LblError):
    code = "RATE_LIMITED"
    status_code = 429

    def __init__(self, message: str, *, retry_after_seconds: int) -> None:
        super().__init__(
            message,
            details={"retry_after_seconds": retry_after_seconds},
            headers={"Retry-After": str(retry_after_seconds)},
        )


class DataUnavailable(LblError):
    code = "DATA_UNAVAILABLE"
    status_code = 503
