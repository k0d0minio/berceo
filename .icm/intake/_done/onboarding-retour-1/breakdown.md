# Breakdown: The professional's file after feedback round 1

- epic-slug: onboarding-retour-1
- source: the founders' feedback round 1 (Drive, `feedback-round-1.pdf`, 2026-10-23), section « Du côté inscription de la professionnelle » and the « Charte des professionnelles Berceo »

## What I understood

The founders went through the professional's sign-up on UAT. The profession list must name the
third-year and the fourth-year midwifery student as two entries. « Spécialisations » becomes
« Formations complémentaires », a free field, because hundreds of trainings exist. The zone must
carry the kilometres she accepts around it. The night rate has a floor and no ceiling. « Mon
expérience » goes. When « Continuer » blocks, the blocking field must show in red. The documents
stay what they are: the diploma for midwives, nurses and childcare workers, the attendance
certificate for students. The INAMI number must never block, because not every midwife has one.
The last declaration starts with « Je déclare et certifie », and a new one commits her to tell
Berceo of any change that stops her working on the platform. A charter of 17 commitments becomes
part of the declarations, and parents can read it from their side. Jamie decided on 2026-10-23
that a feedback request supersedes an earlier requirement: D-4 (100 to 300 €), D-11 (communes,
no radius) and D-24 (red only in dialogs) bend where a stub below says so. The floor is 130 €
(the answers [4.1], Jamie 2026-10-23). The radius is a research stub with the gate.

Questions for Jamie, with a default each:

1. Existing profiles with a night rate under 130 €: raise them to 130 € in the migration?
   Default: yes. UAT holds test data only.
2. Validated professionals and the new declarations: do they re-accept on their next sign-in?
   Default: yes, before anything else, and their profile stays `valide`.
3. The charter page: public and indexed? Default: public at `/charte-des-professionnelles`,
   indexed.

## Build order

1. profil-professions-inami — two student entries, the INAMI number optional for everyone — depends-on: none
2. profil-formations-sans-experience — « Formations complémentaires » as free text, « Mon expérience » removed — depends-on: none
3. profil-tarifs — the night rate from 130 € with no ceiling, and the hourly rate for extra hours — depends-on: none
4. declarations-charte — « Je déclare et certifie », the change-of-situation declaration, the charter accepted at step 4 — depends-on: none
5. charte-cote-parents — the parents read the charter from their side — depends-on: declarations-charte
6. profil-erreurs-en-rouge — the blocking field shows in red with its message — depends-on: none
7. profil-zone-rayon — a radius in kilometres around the zone: research, then a cut — depends-on: none
8. communes-centres — the official centre of each commune, from NGI-IGN AdminVector, and the distance between communes — depends-on: profil-zone-rayon
9. profil-zone-rayon-saisie — the radius field on her profile step, and her reached communes stored on each save — depends-on: communes-centres
10. zone-rayon-lecture — her list, her answer, the e-mails and the search read the reach. Her pages show the radius — depends-on: profil-zone-rayon-saisie

## Out of scope

- Identity checks, 2FA, references (D-5 and the devis' exclusions).
- The wording of the charter and the declarations beyond what the founders wrote. Surya reviews
  through `@relecture`.
- The extra hours on the request: `demande-retour-1/demande-heures-supplementaires`.
