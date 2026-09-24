# Handoff: profil-famille

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Once **Spec approved** is ticked on https://github.com/k0d0minio/berceo/pull/34, run
   `/pipeline build profil-famille` and follow `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/berceo/pull/34.

## Do not

- Do not start Build before the tick, and never tick a gate.
- Do not put the address on `users`, and do not build an e-mail change (Neon Auth cannot do it;
  it is parked in `.icm/intake/triage/famille-changement-email.md`).
- Do not generate this run's migration in parallel with onboarding-professionnelle's.
