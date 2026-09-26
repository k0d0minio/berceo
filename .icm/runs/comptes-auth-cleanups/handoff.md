# Handoff: comptes-auth-cleanups

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: read `02_define/output/spec.md` and tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/52.
2. Then `/pipeline build comptes-auth-cleanups` — execute `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/52.

## Do not

- Do not tick either gate on the PR.
- Do not start `comptes-orphaned-auth-identity` or `comptes-welcome-email-no-retry` on this branch.
- Do not change `/admin` pages or `src/proxy.ts`.
