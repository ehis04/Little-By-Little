"""ASGI entry point: `uvicorn lbl.main:app`."""

from __future__ import annotations

from lbl.api.app import create_app

app = create_app()
