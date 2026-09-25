# Handoff: disponibilites-indicatives

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Once **Spec approved** is ticked on https://github.com/k0d0minio/berceo/pull/41, run
   `/pipeline build disponibilites-indicatives` and execute `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/41.

## Do not

- Do not tick either gate box, and do not start Build before the tick.
- Do not mount the block on a family-facing page or create one (D-69): that is
  candidature-et-reservation's and recherche-et-fiches-publiques'.
- Do not make any care-request query, e-mail or digest read availability (D-12).
- Do not hand-edit `drizzle/meta/_journal.json`; regenerate on the merged tree if another run's
  migration lands first.
