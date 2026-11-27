from __future__ import annotations

from fastapi import FastAPI

from lbl.api.errors import register_error_handlers
from lbl.api.middleware import RequestIdMiddleware
from lbl.api.routers import health
from lbl.logging_config import configure_logging
from lbl.settings import Settings, get_settings


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings)

    app = FastAPI(title="Little by Little API", version="0.0.0")
    app.state.settings = settings
    app.add_middleware(RequestIdMiddleware)
    register_error_handlers(app)
    app.include_router(health.router, prefix="/v1")
    return app
