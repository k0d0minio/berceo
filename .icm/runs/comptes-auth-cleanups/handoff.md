# Handoff: comptes-auth-cleanups

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: read `02_define/output/spec.md` and tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/52.
2. Then `/pipeline build comptes-auth-cleanups` — first renumber D-144/D-145 in `decisions.md` and the spec to the next free ids on `main` (they collide with `reservations-reponse-suspendue`), then execute `plan.md` pass by pass.
3. The 10-branch cap on the `uat-berceo` Neon project was hit on 2026-09-26 (9 stale `preview/claude/*` branches, deleted that day). Every pushed branch gets a Neon preview branch, so it recurs as runs pile up: a preview failing in about 1 s with `Resource provisioning failed` means the cap again.

## Blockers

- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/52.

## Do not

- Do not tick either gate on the PR.
- Do not start `comptes-orphaned-auth-identity` or `comptes-welcome-email-no-retry` on this branch.
- Do not change `/admin` pages or `src/proxy.ts`.
