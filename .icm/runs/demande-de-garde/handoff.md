# Handoff: demande-de-garde

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smoke-tests the preview https://berceo-git-claude-eloquent-mayer-rgaufe-kodominio.vercel.app
   (Vercel login): as a family with a commune, publish a normal request and an urgent one, edit,
   cancel; as a professional whose profile is set to `valide` by hand on the preview's Neon branch
   and who serves that commune, see the cards.
2. Once **Ready to merge** is ticked on https://github.com/k0d0minio/berceo/pull/40: `/pipeline release demande-de-garde`.

## Blockers

- blocked on operator: tick **Ready to merge** in the body of https://github.com/k0d0minio/berceo/pull/40 after the smoke
- `CRON_SECRET` is not set on Vercel (`env.sh audit --changed` → GAPS 1); Release re-asks it as stop class 3. blocked on operator: set `CRON_SECRET` on the Vercel project `berceo` for Production and for the `uat` / Preview environments.

## Do not

- Do not tick either gate checkbox.
- Do not add a code shortcut to make a professional `valide`; set it on the preview's Neon branch.
- Do not switch the digest to Vercel Cron: it never runs on the `uat` environment (D-52).
- Do not regenerate `0004_care_requests` by hand; if main gains a migration first, regenerate on the merged tree.
