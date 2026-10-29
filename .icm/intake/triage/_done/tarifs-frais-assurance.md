# Stub: « Tarifs » says the service fee pays for the platform and the insurance

- lane: tweak
- found-by: the founders' feedback round 1 (Drive, `feedback-round-1.pdf`, section « Dans tarif »), confirmed by Jamie on 2026-10-29 · 2026-10-29
- complexity: low
- priority: P1

## Problem

The founders asked for « des frais de service de 3 % qui paient le bon fonctionnement de la
plateforme et l'assurance ». `tarifs-abonnements` wrote « Ils couvrent le bon fonctionnement de
la plateforme » under D-8, which keeps every insurance wording out until a contract exists.
Jamie decided on 2026-10-29 to write what the founders asked. D-8 is superseded for this one
sentence.

## Proposed change

The fee paragraph on `/tarifs` reads « Des frais de service de 3 % sont prélevés à la
confirmation de chaque réservation. Ils couvrent le bon fonctionnement de la plateforme et
l'assurance. » `src/content/vitrine.test.ts` allows the word on this line and nowhere else.
`README.md` → The vitrine and `CLAUDE.md` → Rules record the exception.

## Acceptance criteria

- [ ] `/tarifs` names the insurance in the fee sentence, as the founders wrote it.
- [ ] No other page names an insurance, and `src/content/vitrine.test.ts` holds that.
- [ ] `README.md` and `CLAUDE.md` record that D-8 is superseded for the fee sentence (Jamie, 2026-10-29).

## Notes

- Question, with a default: does the FAQ's fee answer say it too? Default: no, `/tarifs` only.
- The sentence is the founders' text. Tag it `@relecture Surya — texte des fondatrices`.
- Files: `src/content/tarifs.ts`, `src/content/vitrine.test.ts`, `README.md`, `CLAUDE.md`.
