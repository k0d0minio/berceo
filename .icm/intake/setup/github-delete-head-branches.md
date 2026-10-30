# Setup: GitHub deletes the head branch after a merge

- setup-slug: github-delete-head-branches
- needs: database neon
- where: GitHub → the repository → Settings → General → Pull Requests

## Why

The integration deletes a preview's Neon branch when its git branch is deleted. A head branch
that stays after the merge keeps its Neon branch, and the project fills up with branches.

## Steps

1. Open Settings → General.
2. Under Pull Requests, turn on "Automatically delete head branches".

## Done when

- [x] After a merge, the head branch is gone from GitHub.
- [ ] Its Neon branch `preview/<git branch>` is gone from the Neon project.

## Notes

2026-10-30: `gh api repos/k0d0minio/berceo --jq '.delete_branch_on_merge'` returns `true`,
so the GitHub half of this setting is already on (Settings → General → Pull Requests →
"Automatically delete head branches"). No change was needed, and this bullet is ticked
from that read.
The second bullet depends on the Vercel-Neon Storage integration deleting a preview's
Neon branch when its git branch goes (setup stub `neon-vercel-integration`, still open,
see its notes). `neonctl branches list --project-id dawn-scene-70949411` (`uat-berceo`)
shows only the default `main` branch today: no `preview/*` branch exists to check, because
no feature pull request is open right now (only the release-please pull request #93).
This bullet cannot be confirmed until `neon-vercel-integration` is confirmed and a real
preview branch's deletion is observed after a merge. Jamie: watch the next merge's cleanup,
or confirm the integration's "delete branch on git branch deletion" toggle in Vercel →
Storage by hand.
