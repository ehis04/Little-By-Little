# Little by Little

An independent grocery planner for Irish households. One Expo app (iOS, Android, web) and a Python FastAPI service with a deterministic planning engine.

## Requirements

- Node 22 (see `.nvmrc`) with corepack (`corepack enable`)
- Python 3.12 via [uv](https://docs.astral.sh/uv/) (uv fetches the interpreter)
- Docker (from M0-05, for Postgres with PostGIS)
- make

## Setup

```bash
make setup    # installs dependencies and enables the git hooks
make check    # lint, typecheck and tests
```

`make dev` runs the API. `make dev-app` starts the Expo app (web, iOS simulator, Android emulator).

## Layout

```
apps/app/          Expo app (routes in app/, code in src/)
packages/          shared packages (generated API client)
backend/           FastAPI service; pure engine in src/lbl/core
data/              seed data and test fixtures
tools/             travel-time tooling
scripts/           CI checks
.githooks/         commit and push rules
```

## Git workflow

Work branches are cut from `Development` and merged back by pull request. Commits follow Conventional Commits with a `Refs:` footer. `make setup` enables the hooks that enforce this.
