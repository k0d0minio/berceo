# Handoff: comptes-welcome-email-no-retry

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Once **Spec approved** is ticked on https://github.com/k0d0minio/berceo/pull/64, run `/pipeline build comptes-welcome-email-no-retry` and follow `plan.md` pass by pass.

## Blockers

- blocked on operator: free a Neon branch in `uat-berceo` (10/10 — the previews of closed-out runs, e.g. `preview/claude/gifted-hypatia-k309zu`, `preview/claude/zealous-pascal-smhcx4`, once their PRs are merged), then redeploy this branch's preview from Vercel; until then every preview here fails with "Resource provisioning failed" (see `error.log`).
- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/64.

## Do not

- Do not tick the gate, and do not start Build before it is ticked.
- Do not touch `comptes-orphaned-auth-identity` (its own run on `claude/wizardly-darwin-dk0jc8`) — it changes signUp / signIn in `src/app/(auth)/actions.ts`, not this run's files.
- Do not reuse D-153/D-154: other open runs hold them; this run's ids are D-165 and D-166.
