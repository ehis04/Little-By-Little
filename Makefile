# Cross-stack commands. Stubs print a note until the stack they need exists.
.DEFAULT_GOAL := help
.PHONY: help setup dev db-up db-down check lint typecheck test test-hooks test-engine gen-api migrate seed

help:
	@echo "make setup        install dependencies and enable git hooks"
	@echo "make db-up        start local Postgres + PostGIS (Docker)"
	@echo "make db-down      stop local Postgres (data is kept)"
	@echo "make dev          run the API on :8000 (the app joins in M0-06)"
	@echo "make check        lint, typecheck and tests (run before every commit)"
	@echo "make test-hooks   test the git hooks and PR text check"
	@echo "make test-engine  engine unit and property tests"
	@echo "make gen-api      regenerate the typed API client (stub until M0-08)"
	@echo "make migrate      apply database migrations to DATABASE_URL"
	@echo "make seed         load curated seed data (stub until M5-01)"

setup:
	git config core.hooksPath .githooks
	corepack enable >/dev/null 2>&1 || true
	pnpm install
	cd backend && uv sync

db-up:
	docker compose up -d --wait db

db-down:
	docker compose down

dev:
	cd backend && uv run uvicorn lbl.main:app --reload --port 8000

lint:
	cd backend && uv run ruff check . && uv run ruff format --check .
	pnpm run lint

typecheck:
	cd backend && uv run mypy
	pnpm run typecheck

test: test-hooks
	cd backend && uv run pytest
	pnpm run test

test-hooks:
	scripts/test-git-hygiene.sh

check: lint typecheck test

test-engine:
	cd backend && uv run pytest tests/unit tests/property

gen-api:
	@echo "make gen-api: nothing to generate yet. Added by M0-08."

migrate:
	cd backend && uv run alembic upgrade head

seed:
	@echo "make seed: no seed data yet. Added by M5-01."
