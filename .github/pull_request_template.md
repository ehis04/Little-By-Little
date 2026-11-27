## What and why

<!-- One or two sentences: what changed and why. Title must be a conventional commit summary, e.g. feat(plan): show best time on plan detail -->

Refs: <!-- ticket ID, e.g. M4-07 -->

## How it was tested

- [ ] `make check` passes
- [ ] New or updated tests: <!-- list -->
- [ ] Manual checks: <!-- devices, flows -->

## Screenshots / recordings (UI changes)

<!-- Light and dark; phone and web. Delete this section if not UI. -->

## Checklist

- [ ] Only the ticket's scope (no unrelated changes)
- [ ] Money in integer cents, durations in seconds, unknown data shown as unknown
- [ ] No business logic in components or routers; engine still has no IO
- [ ] All UI states handled (loading, empty, error, offline, stale, partial) and accessibility checked
- [ ] API changed → client regenerated · schema changed → reversible migration · behaviour changed → docs updated
- [ ] Performance budgets respected (numbers below if relevant)
- [ ] Commit messages and branch name follow docs/08-git-workflow.md

## Follow-ups

<!-- Problems noticed outside this ticket's scope -->
