"""Maps every failure to the single error shape in docs/06-api-spec.md."""

from __future__ import annotations

from typing import Any

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from lbl.api.middleware import REQUEST_ID_HEADER, request_id_of
from lbl.api.schemas.errors import ErrorBody, ErrorResponse
from lbl.core.errors import LblError

log = structlog.get_logger("lbl.api")

_CODE_BY_STATUS = {
    400: "BAD_REQUEST",
    401: "UNAUTHENTICATED",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "VALIDATION_FAILED",
    429: "RATE_LIMITED",
    503: "DATA_UNAVAILABLE",
}


def error_response(
    request: Request,
    *,
    status_code: int,
    code: str,
    message: str,
    details: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    body = ErrorResponse(error=ErrorBody(code=code, message=message, details=details or {}))
    out = dict(headers or {})
    request_id = request_id_of(request.scope)
    if request_id:
        # Set here too so it is present on unhandled 500s, which bypass the middleware.
        out[REQUEST_ID_HEADER] = request_id
    return JSONResponse(body.model_dump(), status_code=status_code, headers=out)


async def handle_lbl_error(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, LblError)
    return error_response(
        request,
        status_code=exc.status_code,
        code=exc.code,
        message=exc.message,
        details=exc.details,
        headers=exc.headers,
    )


async def handle_http_exception(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, StarletteHTTPException)
    code = _CODE_BY_STATUS.get(exc.status_code)
    if code is None:
        code = "BAD_REQUEST" if exc.status_code < 500 else "INTERNAL_ERROR"
    message = "Not found." if exc.status_code == 404 else str(exc.detail)
    return error_response(
        request,
        status_code=exc.status_code,
        code=code,
        message=message,
        headers=dict(exc.headers or {}),
    )


async def handle_validation_error(request: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RequestValidationError)
    # Drop `input` and `ctx`: they can echo user data back and into logs.
    problems = [{"loc": list(e["loc"]), "msg": e["msg"], "type": e["type"]} for e in exc.errors()]
    if problems and all(p["type"] == "json_invalid" for p in problems):
        return error_response(
            request,
            status_code=400,
            code="BAD_REQUEST",
            message="The request body is not valid JSON.",
        )
    return error_response(
        request,
        status_code=422,
        code="VALIDATION_FAILED",
        message="The request is not valid.",
        details={"errors": problems},
    )


async def handle_unexpected(request: Request, exc: Exception) -> JSONResponse:
    # Full detail goes to the logs (with the request ID); the client gets nothing internal.
    log.error("unhandled_exception", exc_info=exc)
    return error_response(
        request,
        status_code=500,
        code="INTERNAL_ERROR",
        message="Something went wrong on our side.",
    )


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(LblError, handle_lbl_error)
    app.add_exception_handler(StarletteHTTPException, handle_http_exception)
    app.add_exception_handler(RequestValidationError, handle_validation_error)
    app.add_exception_handler(Exception, handle_unexpected)
