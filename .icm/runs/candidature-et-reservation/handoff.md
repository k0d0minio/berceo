# Handoff: candidature-et-reservation

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads `02_define/output/spec.md` (or the PR's Spec block) and ticks **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/42; changes go through `revise candidature-et-reservation "<what>"`.
2. Then `/pipeline build candidature-et-reservation` on `opus` (complex spec): execute `plan.md` pass by pass, starting with the schema and its migration.

## Blockers

- blocked on operator: tick **Spec approved** on https://github.com/k0d0minio/berceo/pull/42.

## Do not

- Do not start Build before the tick; never tick a gate.
- Do not add a payment step, messaging, cancellation of a confirmed booking, time-driven statuses or ratings: stubs 9 to 12.
- Do not copy the family's address into `bookings` or read it outside `src/lib/famille/` (D-77).
- Do not generate this run's migration in parallel with another run's; regenerate it on the merged tree if `main` gains one first.

## Made in this run

- D-70 to D-78 — see `decisions.md` → Made in this run (republish, priority, phones both ways, withdrawal and the same-night rule, the frozen rate, the family's full-profile page and the photo, the edit lock, the address gate, the « Bonne nuit. » e-mail line).
