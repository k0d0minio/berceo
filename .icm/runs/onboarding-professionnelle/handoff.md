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
- Production's store, as of 2026-09-24: the private `documents` bucket on production's `main`
  branch (`br-long-brook-b2qw6uzd`) and all five `DOCUMENTS_*` variables on Vercel Production (the
  credential set by the operator); `env.sh audit --changed` → OK. Still owed before the promotion,
  not before this merge: the bucket's CORS rule allowing PUT from `https://www.berceo.be` (S3
  `PutBucketCors`, which needs that credential). Without it, uploads on www.berceo.be fail in the
  browser; nothing else is affected.

## Do not

- Do not write to the production Neon project (`tiny-cell-08223046`) from a run (D41).
- Do not tick Ready to merge.
- Do not print or commit the storage credential; it lives only in Vercel (sensitive) and Neon.
- The acceptance line "uat.berceo.be applies the migration" is proven only once the merge deploys
  UAT; Release reads it.
