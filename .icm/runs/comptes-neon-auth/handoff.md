# Handoff: comptes-neon-auth

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator: read `02_define/output/spec.md` on PR #22, edit it or `revise comptes-neon-auth "<change>"`, then tick **Spec approved**.
2. Then `build comptes-neon-auth` (executor: opus, complex spec), following `plan.md` pass by pass.
3. Before the founders test on uat.berceo.be: verify a sending domain on Resend, add SPF and DKIM at Infomaniak, set `EMAIL_FROM` on Vercel (D-28).

## Blockers

- none for Build. `EMAIL_FROM` blocks real e-mail on uat, not the build (plan.md → Risks).

## Do not

- Do not tick either gate checkbox.
- Do not write data to Neon `main` (production); only its auth configuration changes in plan pass 9.
- Do not add a Vercel protection bypass to make webhooks reach PR previews.
- Do not commit an e-mail address, the Resend key or the cookie secret.
