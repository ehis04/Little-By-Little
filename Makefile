# Cross-stack commands. Stubs print a note until the stack they need exists.
.DEFAULT_GOAL := help
.PHONY: help setup dev check lint typecheck test test-engine gen-api migrate seed

help:
	@echo "make setup        install dependencies and enable git hooks"
	@echo "make dev          run Postgres, API and Expo (stub until M0-04 to M0-06)"
	@echo "make check        lint, typecheck and tests (run before every commit)"
	@echo "make test-engine  engine unit and property tests"
	@echo "make gen-api      regenerate the typed API client (stub until M0-08)"
	@echo "make migrate      apply database migrations (stub until M0-05)"
	@echo "make seed         load curated seed data (stub until M5-01)"

setup:
	git config core.hooksPath .githooks
	corepack enable >/dev/null 2>&1 || true
	pnpm install
	cd backend && uv sync

dev:
	@echo "make dev: nothing to run yet. Added by M0-04 (API), M0-05 (database) and M0-06 (app)."

lint:
	cd backend && uv run ruff check . && uv run ruff format --check .
	pnpm run lint

typecheck:
	cd backend && uv run mypy
	pnpm run typecheck

test:
	cd backend && uv run pytest
	pnpm run test

check: lint typecheck test

test-engine:
	cd backend && uv run pytest tests/unit tests/property

gen-api:
	@echo "make gen-api: nothing to generate yet. Added by M0-08."

migrate:
	@echo "make migrate: no migrations yet. Added by M0-05."

seed:
	@echo "make seed: no seed data yet. Added by M5-01."
