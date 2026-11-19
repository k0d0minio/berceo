# Spec: berceo · the founders read every cancellation and credit, and grant a credit by hand

- ticket: JAM-248
- touches: src/db/schema.ts, drizzle/, src/lib/admin/lists.ts, src/lib/admin/journal.ts, src/lib/admin/paths.ts, src/lib/admin/rules.ts, src/lib/credits/, src/lib/gardes/, src/app/(portail)/admin/page.tsx, src/app/(portail)/admin/signalements/, src/app/(portail)/admin/credits/ (nouveau), src/app/(portail)/admin/reservations/, src/app/(portail)/admin/utilisateurs/[id]/, src/components/admin/, src/components/gardes/, src/content/admin.ts, src/content/gardes.ts, src/content/emails.ts, src/lib/email/, .icm/intake/annulations-credits/
- complexity: complex

## Problem

Les réponses [9.2] gardent « un historique de toutes les annulations » et laissent la force majeure et le litige au jugement des fondatrices. `/admin/signalements` liste les gardes annulées et les absences, avec le motif, la marque « Litige » et le statut des frais. Mais la ligne du tableau qui s'est appliquée n'y est pas, et aucun filtre ne montre les litiges. Rien ne liste les crédits. Les fondatrices ne peuvent ni accorder un crédit, ni annuler une garde pour Berceo.

Source : le stub `.icm/intake/annulations-credits/annulations-back-office.md` (épique `annulations-credits`, 5 sur 5, après `annulations-table`). Règle remplacée : aucune.

## Proposed change

**« Signalements ».** Chaque ligne montre le motif (existe), le délai qui s'est appliqué et le résultat pour les frais : crédit, frais conservés, remboursés, litige ou rien. Le délai est un fait : les heures entre l'annulation et le début de la nuit, puis « dans le délai » ou « hors délai » (Q1). Un troisième filtre « Litige » rejoint « À traiter » et « Tous » : toutes les gardes en litige, traitées ou non, les plus récentes d'abord.

**Accorder un crédit.** Sur une garde en litige, ou sur une garde dont les frais sont restés à Berceo (annulation tardive ou absence de la famille), un bouton « Accorder un crédit » ouvre une confirmation. La fondatrice écrit un motif (Q3). Le crédit vaut le montant des frais (`payments.amount_cents`), dure 24 mois, a l'origine `geste_berceo`, et garde la garde, les frais, la fondatrice et la note. Une seule fois par garde : le bouton disparaît quand la garde a un crédit vivant, et l'index `credits_booking_live_key` refuse un second clic. Pas de bouton si les frais sont remboursés ou n'existent pas. Sur un litige, le même acte marque le signalement traité (Q2). Une entrée de journal `credit_accorde` nomme la famille, la nuit et le montant.

**Annuler une garde pour Berceo.** Sur une garde confirmée pas encore terminée, à venir ou en cours, jusqu'à la fin de la nuit (Q5), un bouton « Annuler la garde » ouvre une confirmation (`confirm-dialog.tsx`). Le bouton est sur « Réservations » et dans la liste des gardes à venir ou en cours de la fiche d'un compte (Q7). La fondatrice écrit une note libre obligatoire, 500 caractères au plus (Q4). Seules les fondatrices la lisent, dans « Signalements » et dans le journal. La garde passe à « annulée par Berceo ». Les frais payés deviennent un crédit d'origine `annulation_berceo`, comme le dit déjà `outcomeOf`. Une entrée de journal `garde_annulee_berceo` nomme les deux personnes et la nuit. Les deux côtés lisent « Garde annulée par Berceo » sur la page de la garde et reçoivent l'e-mail d'annulation (Q6). La famille peut republier sa demande. La garde entre dans « Signalements » comme les autres annulations.

**« Crédits ».** Une nouvelle page `/admin/credits`, dans la navigation du back-office. Tous les crédits, les plus récents d'abord, 50 par page. Colonnes : la date, la famille (lien vers sa fiche), le montant, l'origine, la garde quand il y en a une, l'expiration, le montant utilisé, l'état (disponible, utilisé, annulé, expiré), et pour un geste la fondatrice et sa note. Une liste vide dit qu'aucun crédit n'existe encore.

**« Vue d'ensemble ».** Un bloc « Crédits » montre le nombre de crédits disponibles (ni utilisés, ni annulés, ni expirés) et leur reste total en euros, avec un lien vers la liste. Le compte et la liste lisent la même condition (D-133).

**Côté famille.** Un crédit accordé ou né d'une annulation par Berceo se lit dans « Mes crédits » avec son origine, « Offert par Berceo » ou « Garde annulée par Berceo » (les mots existent dans `src/content/credits.ts`). Un crédit accordé envoie à la famille un e-mail court (Q8) : le montant, l'expiration, « Offert par Berceo » et un lien vers « Mes crédits ». L'e-mail ne contient pas la note des fondatrices. Ses mots portent `@relecture`.

**Le modèle.** La migration ajoute à `admin_action` les actions `credit_accorde` et `garde_annulee_berceo`, une façon de dire que Berceo a annulé (Build choisit : une valeur `berceo` sur le côté, ou une colonne), et la note d'une annulation par Berceo. `src/lib/credits/` reste le seul à écrire `credits`. `src/lib/gardes/` reste le seul à écrire le statut d'une garde. La promotion en production demande `migrate-production.yml` avant `promote.sh run` (`.icm/local/database.md`).

**Le stub.** La pull request déplace `.icm/intake/annulations-credits/annulations-back-office.md` dans `.icm/intake/annulations-credits/_done/` (`.icm/local/ROUTES.md`).

## Acceptance criteria

- [ ] Sur `/admin/signalements`, chaque annulation montre son motif, les heures avant le début avec « dans le délai » ou « hors délai », et le résultat des frais. Chaque absence montre le résultat des frais. (verify: operator)
- [ ] Le filtre « Litige » de `/admin/signalements` montre seulement les gardes en litige, traitées ou non. (verify: CI)
- [ ] `/admin/credits` liste tous les crédits, les plus récents d'abord, 50 par page, avec la famille, le montant, l'origine, l'expiration, le montant utilisé et l'état. (verify: operator)
- [ ] Le bloc « Crédits » de « Vue d'ensemble » montre le même nombre de crédits disponibles que la liste. (verify: CI)
- [ ] Une fondatrice accorde un crédit du montant des frais sur une garde en litige ou aux frais conservés, après une confirmation et un motif. Une entrée `credit_accorde` est au journal. (verify: operator)
- [ ] Un second crédit sur la même garde est refusé, et le bouton n'est pas proposé sur des frais remboursés ou sur une garde sans frais. (verify: CI)
- [ ] Le crédit accordé se lit dans « Mes crédits » de la famille avec l'origine « Offert par Berceo », et la famille reçoit un e-mail court sans la note des fondatrices. (verify: operator)
- [ ] Une fondatrice annule une garde confirmée à venir ou en cours, jusqu'à la fin de la nuit, après une confirmation et une note obligatoire. La garde est « annulée par Berceo », une entrée `garde_annulee_berceo` est au journal, et les frais payés deviennent un crédit d'origine `annulation_berceo`. (verify: operator)
- [ ] Une garde terminée ou déjà annulée ne peut pas être annulée pour Berceo, et une note vide est refusée. (verify: CI)
- [ ] Seul un compte admin atteint `/admin/credits` et les deux actions. Un autre compte reçoit une 404 (D-33). (verify: CI)
- [ ] Le stub `annulations-back-office.md` est dans `.icm/intake/annulations-credits/_done/`. (verify: agent)

## Out of scope

- Modifier ou supprimer un crédit.
- Un crédit d'un montant libre.
- Un remboursement à Stripe depuis cette page (il reste sur `/admin/paiements`).
- Des filtres ou une recherche sur `/admin/credits`.
- Annuler une garde terminée, ou une demande sans garde.
- Annuler les gardes d'un compte en même temps que sa suspension.

## Open questions

- Q1 à Q8 ont une réponse de Jamie (2026-11-19). Q4, Q5 et Q8 diffèrent du défaut : une note libre obligatoire pour une annulation par Berceo, l'annulation possible jusqu'à la fin de la nuit, un e-mail pour un crédit accordé.
