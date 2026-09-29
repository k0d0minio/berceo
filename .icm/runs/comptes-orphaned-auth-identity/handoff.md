# Handoff: comptes-orphaned-auth-identity

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Once **Spec approved** is ticked on https://github.com/k0d0minio/berceo/pull/62: `/pipeline build comptes-orphaned-auth-identity`, executing `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/62.

A blocking operator act is written here **and** in the stop report's `Operator:` list; a
non-blocking one lives only in that list, never here (`_shared/output.md` → Split by actor).

## Do not

- Tick any gate box.
- Touch `src/app/(auth)/verification-email/confirmer/route.ts`: it is `comptes-welcome-email-no-retry`'s.
- Rebuild a `users` row from what the Neon identity carries (D-161).
