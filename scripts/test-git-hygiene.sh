#!/usr/bin/env bash
# Self-test for the git hooks and PR text check. Run: make test-hooks
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"

fail=0
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

expect() { # expect <accept|reject> <label> <command...>
  local want="$1" label="$2"; shift 2
  if "$@" >/dev/null 2>&1; then got=accept; else got=reject; fi
  if [[ "$got" == "$want" ]]; then echo "ok   $label"; else echo "FAIL $label (wanted $want)"; fail=1; fi
}

commit_msg() { printf '%b' "$1" > "$tmp/msg"; .githooks/commit-msg "$tmp/msg"; }

# commit-msg hook
expect accept "commit: good message"            commit_msg 'feat(engine): add pack solver\n\nRefs: M1-03\n'
expect accept "commit: no scope"                commit_msg 'chore: update tooling\n'
expect accept "commit: merge message"           commit_msg 'Merge branch main into x\n'
expect reject "commit: no type"                 commit_msg 'Fixed stuff\n'
expect reject "commit: capitalised past tense"  commit_msg 'feat: Added Voucher Logic.\n'
expect reject "commit: full stop"               commit_msg 'feat(engine): add allocation.\n'
expect reject "commit: too long"                commit_msg "feat(engine): $(printf 'a%.0s' {1..80})\n"
expect reject "commit: co-author trailer"       commit_msg 'feat(engine): add allocation\n\nCo-authored-by: Someone <a@b.c>\n'
expect reject "commit: session trailer"         commit_msg 'feat(engine): add allocation\n\nClaude-Session: abc\n'
expect reject "commit: generated with footer"   commit_msg 'feat(engine): add allocation\n\nGenerated with a tool\n'

# pre-push hook
push() { printf 'refs/heads/x abc %s abc\n' "$1" | .githooks/pre-push; }
expect reject "push: Development blocked"       push refs/heads/Development
expect reject "push: main blocked"              push refs/heads/main
expect reject "push: bad branch name"           push refs/heads/My-Branch
expect accept "push: good branch name"          push refs/heads/chore/m0-02-git-hygiene
expect accept "push: tag allowed"               push refs/tags/v0.1.0

# PR text check
expect accept "pr: good title and body"         scripts/check-pr-text.sh 'feat(plan): show best time' $'## What and why\nAdds it.\n\nRefs: M4-07'
expect reject "pr: bad title"                   scripts/check-pr-text.sh 'Added things' 'body'
expect reject "pr: attribution in body"         scripts/check-pr-text.sh 'feat(plan): show best time' 'Generated with a tool'
expect reject "pr: session link in body"        scripts/check-pr-text.sh 'feat(plan): show best time' 'see https://claude.ai/code/session_1'
expect reject "pr: tool name in title"          scripts/check-pr-text.sh 'feat(plan): ask copilot' 'body'

# Forbidden patterns must match between the hook and the PR check.
hook_pat="$(grep -E "^forbidden=" .githooks/commit-msg)"
pr_pat="$(grep -E "^forbidden=" scripts/check-pr-text.sh)"
if [[ "$hook_pat" == "$pr_pat" ]]; then echo "ok   forbidden patterns in sync"; else echo "FAIL forbidden patterns differ"; fail=1; fi

# Setup wiring
if grep -q 'core.hooksPath .githooks' Makefile; then echo "ok   make setup sets hooksPath"; else echo "FAIL make setup does not set hooksPath"; fail=1; fi
for f in .githooks/commit-msg .githooks/pre-push scripts/check-git-hygiene.sh scripts/check-pr-text.sh; do
  if [[ -x "$f" ]]; then echo "ok   executable: $f"; else echo "FAIL not executable: $f"; fail=1; fi
done

exit $fail
