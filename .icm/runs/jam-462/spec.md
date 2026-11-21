# Spec: berceo · a local demo database: every role and a full, realistic data set

- ticket: JAM-462
- touches: src/lib/demo/, src/app/api/demo/connexion/route.ts, src/lib/auth/current-user.ts, src/proxy.ts, src/app/(auth)/actions.ts, src/app/(auth)/connexion/suspendu/route.ts, src/app/api/fichiers/[id]/route.ts, src/lib/email/send.ts, scripts/demo/, package.json, README.md, CLAUDE.md, .icm/local/database.md
- complexity: complex

## Problem

J tourne un film de démonstration du serveur local pour les fondatrices. La partie connectée ne
se filme pas : publier une demande exige un abonnement payé par Stripe, l'inscription exige un
lien par e-mail, et une professionnelle ou une fondatrice se connecte avec un code envoyé par
e-mail. Le serveur local lit la base de UAT.

## Proposed change

Le serveur local de démonstration lit sa propre base, la branche Neon `local/demo` du projet
`uat-berceo`. Une commande la crée, la migre et la remplit d'un jeu de données français complet
et inventé. Une autre la remet à zéro. `npm run demo:dev` sert le site sur cette base. Un lien
local connecte chaque compte de démonstration sans boîte mail, sans mot de passe et sans code.

## Acceptance criteria

- [ ] `npm run demo:db:make` crée la branche `local/demo`, écrit `.env.demo.local`, migre et remplit la base et `npm run demo:seed` la remet à zéro. (verify: operator)
- [ ] Le seed refuse une base sans la marque de démonstration, donc UAT et la production, et refuse dans un build Vercel ou de production. (verify: CI)
- [ ] La base contient des fondatrices, des familles avec chaque abonnement et une Une nuit, des professionnelles validées dans plusieurs communes avec photos et tarifs, des demandes simples et régulières, des horaires adaptés, des réponses, des conversations, des gardes dans chaque état, des annulations, des crédits et des documents et personnes inventées seulement. (verify: operator)
- [ ] Chaque compte a une adresse `test+<nom>@jamienisbet.com`, et le seed imprime quel compte a quel rôle. (verify: operator)
- [ ] `/api/demo/connexion?compte=<nom>` connecte le compte sur le serveur local de démonstration, et répond 404 sur UAT, sur une preview et en production, et quand l'interrupteur `BERCEO_LOCAL_DEMO` est éteint. (verify: CI)
- [ ] Le seed et la connexion de démonstration n'appellent ni Stripe, ni Resend, ni Neon Auth et aucun e-mail ne part en démonstration. (verify: CI)
- [ ] `.icm/local/database.md` et le README disent comment créer, remplir et remettre à zéro la base de démonstration. (verify: operator)

## Out of scope

- Un clic de démonstration qui ouvre un Checkout ou le portail Stripe appelle toujours la clé Stripe de `.env.local`.
- Le changement du nom ou du mot de passe d'une famille passe par Neon Auth : il ne marche pas en démonstration.
- Aucun changement sur UAT, la production ou les previews : l'interrupteur n'y est jamais allumé.

## Open questions

- none
