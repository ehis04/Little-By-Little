from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from lbl.api.errors import register_error_handlers
from lbl.api.middleware import RequestIdMiddleware
from lbl.api.routers import health
from lbl.data.db import create_engine
from lbl.logging_config import configure_logging
from lbl.settings import Settings, get_settings


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or get_settings()
    configure_logging(settings)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        # Connections are opened lazily, so a database that is down never blocks startup.
        engine = create_engine(settings.database_url) if settings.database_url else None
        app.state.engine = engine
        try:
            yield
        finally:
            if engine is not None:
                await engine.dispose()

    app = FastAPI(title="Little by Little API", version="0.0.0", lifespan=lifespan)
    app.state.settings = settings
    app.state.engine = None
    app.add_middleware(RequestIdMiddleware)
    register_error_handlers(app)
    app.include_router(health.router, prefix="/v1")
    return app
