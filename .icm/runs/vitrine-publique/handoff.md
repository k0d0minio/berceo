# Handoff: vitrine-publique

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: read `02_define/output/spec.md` (or edit it to steer Build), then tick
   **Spec approved** on PR #25.
2. Then `build vitrine-publique`, following `plan.md` pass by pass.

## Blockers

- none for Build. `comptes-neon-auth` is not merged: the two sign-up links will 404 on UAT until
  it is (Out of scope, by design).

## Do not

- Do not tick either gate box. Do not create `/inscription-famille` or
  `/inscription-professionnelle` (they belong to `comptes-neon-auth`).
- Do not write the founders' story or any legal text.
- Do not rewrite README.md/AGENTS.md's dark rule during Build: that happens at Release.
