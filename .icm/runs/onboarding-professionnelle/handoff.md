# Handoff: onboarding-professionnelle

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smokes the preview https://berceo-git-claude-quirky-cannon-ta3dag-kodominio.vercel.app
   (a professional account on that preview's branch: the four steps, uploads, submission, the file
   page; an admin for `/admin`), then ticks **Ready to merge** on https://github.com/k0d0minio/berceo/pull/35.
2. `/pipeline release onboarding-professionnelle`.

## Blockers

- blocked on operator: tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/35 after the smoke.
- blocked on operator: Release stop class 3 re-asks `env.sh audit --changed`, which reports the five
  `DOCUMENTS_*` keys missing on Vercel Production. Production's store is the operator's (D41): a
  private `documents` bucket on production's Neon `main` branch, its CORS rule (PUT from
  `https://www.berceo.be`), a `storage:read`+`storage:write` credential, and the five variables on
  Vercel Production. Either set them before Release, or tell Release to record the gap as owed
  before the promotion.

## Do not

- Do not write to the production Neon project (`tiny-cell-08223046`) from a run (D41).
- Do not tick Ready to merge.
- Do not print or commit the storage credential; it lives only in Vercel (sensitive) and Neon.
- The acceptance line "uat.berceo.be applies the migration" is proven only once the merge deploys
  UAT; Release reads it.
