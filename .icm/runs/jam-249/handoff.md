# Handoff jam-249

## Next action

L'opérateur teste le changement sur la preview Vercel, puis coche **Ready to merge** sur
https://github.com/k0d0minio/berceo/pull/128. Ensuite `release JAM-249` ferme le run et
fusionne.

Preview : https://berceo-git-contact-jam-249-berceo-the-public-p-18b34a-kodominio.vercel.app

## How to test

1. Ouvrez `/faq` sur la preview et lisez la réponse à « Faut-il créer un compte ? » : elle dit
   que le compte famille se crée avec un abonnement, et que l'abonnement donne accès aux
   profils complets, au contact et à la publication des demandes.
2. Ouvrez une page de commune (`/garde-de-nuit/<commune>`) : le texte de l'appel final dit
   « Créez votre compte famille et choisissez votre abonnement ».
3. Depuis cette page, ouvrez la page publique d'une professionnelle : l'appel dit « Avec un
   abonnement, vous voyez son profil complet » et le bouton dit « M'abonner pour voir son
   profil complet ».

## What changed

- `src/content/faq.ts` : la réponse à « Faut-il créer un compte ? ». Elle porte maintenant sa
  propre étiquette `@relecture`.
- `src/content/recherche.ts` : `fiche.ctaTexte`, `fiche.ctaBouton` et `commune.ctaTexte`. Les
  trois gardent leur étiquette `@relecture`.
- Le stub `.icm/intake/triage/vitrine-compte-gratuit-profils-complets.md` est dans `_done/`.
- Recherche : le mot « gratuit » n'est plus dans `src/content/`. Aucune ligne ne dit qu'un
  compte gratuit ouvre un profil complet ou une demande.

## Not verified

- La preview est protégée par Vercel : la session n'a pas lu les pages. Seul le CI est lu
  (GREEN sur `11ad1fc`).
- Le lien de la FAQ garde son libellé « Créer un compte famille », et `fiche.ctaTitre` et
  `commune.ctaBouton` ne changent pas : le ticket ne les nomme pas.

## Blockers

- none

## Do not touch

- none
