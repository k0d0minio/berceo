# Handoff: premier-ecran

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator smoke-tests the branch preview (https://berceo-git-claude-jolly-allen-8umg8v-kodominio.vercel.app,
   behind Vercel login) at phone, tablet (1024) and desktop (1280+) widths on `/`, `/comment-ca-marche`,
   `/tarifs` and `/faq`, then ticks **Ready to merge** in the body of https://github.com/k0d0minio/berceo/pull/46.
2. Then `/pipeline release premier-ecran`.
3. To re-measure (after a change, or once Comodo replaces Fraunces): `03_build/output/measure.mjs` with a
   Vercel share URL (`node measure.mjs <share-url> [widths…]`, Playwright plus the Chromium at /opt/pw-browsers).

## Blockers

- blocked on operator: smoke the preview and tick **Ready to merge** on https://github.com/k0d0minio/berceo/pull/46

## Do not

- Do not tick any box in the PR body from a session.
- Do not edit the bands below the hero in `src/app/(public)/page.tsx`: blocs-accueil owns them.
- Do not move the hero's 22rem photo column narrower than it is without re-measuring the H1's 4 lines at 1280.
