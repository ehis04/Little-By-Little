#!/usr/bin/env bash
# CI check: validates the branch name and every commit message in the PR range.
# Usage: scripts/check-git-hygiene.sh <base-ref> <branch-name>
set -euo pipefail
base="${1:-origin/Development}"
branch="${2:-$(git rev-parse --abbrev-ref HEAD)}"
name_pattern='^(feat|fix|chore|refactor|perf|test|docs|ci|build|style|hotfix)/(m[0-9]+-[0-9]{2}-)?[a-z0-9]+(-[a-z0-9]+)*$'
if [[ "$branch" != "Development" && ! "$branch" =~ $name_pattern ]]; then
  echo "✖ Invalid branch name: $branch"; exit 1
fi
status=0
tmp="$(mktemp)"
for sha in $(git rev-list "$base"..HEAD); do
  git log -1 --format=%B "$sha" > "$tmp"
  if ! .githooks/commit-msg "$tmp" > /dev/null; then
    echo "✖ Commit $sha fails message rules:"; .githooks/commit-msg "$tmp" || true
    status=1
  fi
done
rm -f "$tmp"
exit $status
