# Tasks: candidature-et-reservation

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] A `valide` professional serving a request's commune sees its card with « <her rate> € pour la garde de nuit » and « Je suis disponible pour cette garde »; pressing it shows the guide's confirmation verbatim and the card then shows « Vous avez répondu » and « Retirer ma disponibilité ».
- [ ] The server refuses an answer from a professional who is not `valide`, on a request that is not `ouverte` or whose night has started, on a commune she does not serve (unless the request was sent to her in priority), after she was declined on it, or on a night she is already booked for.
- [ ] Each answer sends the family the guide's « [Prénom] a répondu à votre demande » e-mail, with the professional's prénom, profession and the night's date, and a button to her full profile opened from that request; a failed send is logged and the answer stays.
- [ ] Two professionals answer the same request; the family's request page lists both under « Les professionnelles qui ont répondu à votre demande » with photo, prénom, profession, answered rate, « Voir le profil complet » and « Accepter et réserver »; « Mes demandes » shows « 2 réponses » on that request.
- [ ] A professional changes her profile rate after answering; the family still sees, and the booking still carries, the rate she answered at.
- [ ] A professional withdraws her answer; she disappears from the family's list at once, no e-mail leaves, and she can answer again while the request is open.
- [ ] « Accepter et réserver » shows « Récapitulatif de votre garde » with date, hours, « 11 heures », prénom, profession, rate and the pay-directly line, no insurance wording; confirming creates one booking, moves the request to « Attribuée », sets the chosen answer `retenue` and the other `non_retenue`.
- [ ] After confirmation the family and the chosen professional each receive their guide confirmation e-mail (the family's without its insurance sentence, the professional's ending « Bonne nuit. »), and the other applicant receives the « not retained » e-mail.
- [ ] Two acceptances of the same request racing produce exactly one booking; the second is refused with a plain message.
- [ ] A professional booked for a night has her other pending answers for that night set to `retiree` and hidden from those families, cannot answer another request for that night, and a second booking for her on that night is refused by the database.
- [ ] A family whose profile has no street and house number cannot open the accept dialog and is sent to complete her address.
- [ ] Before confirmation, no page, card, list, e-mail or query a professional reaches selects the family's name, address, phone or e-mail; after confirmation, her own booking page shows the family's full name, full address and phone, and another professional's booking id answers not found.
- [ ] The family's booking page shows the professional's phone and never her surname; another family's booking id answers not found.
- [ ] `/espace/famille/professionnelles/[id]` shows a `valide` profile (photo, prénom, profession, « Profil vérifié par Berceo », communes, spécialisations, experience, bio, rate) and never her surname, e-mail, phone, INAMI or documents; a profile that is not `valide`, or an unknown id, answers not found.
- [ ] `/api/fichiers/[id]` serves a `valide` professional's photo to a signed-in parent, and still answers 404 to a parent for her documents, for the photo of a profile that is not `valide`, and to a signed-out visitor.
- [ ] From a professional's full profile, « Lui envoyer ma demande en priorité » shows the guide's explanatory message verbatim and lets the family choose one of her open requests without a priority professional, or publish a new normal or urgent request, that then carries her as its priority.
- [ ] A priority request reaches the chosen professional by e-mail at once and sits first on her list marked « Demande prioritaire », even when she does not serve its commune, and she can answer it; the other professionals serving the commune still see it and are notified exactly as for any request.
- [ ] A request's priority professional cannot be set twice or changed.
- [ ] « Republier ma demande » on an open request with pending answers declines each of them (each professional e-mailed « not retained », none can answer it again) and re-announces it: an urgent request e-mails the serving professionals again at once, a normal one is carried by the next digest.
- [ ] A request with a pending answer cannot be edited; once republished it can. Cancelling a request with pending answers e-mails each of those professionals « not retained ».
- [ ] An `attribuee` request can no longer be edited, cancelled or republished, shows « Attribuée » with a link to its booking, and is gone from every professional's list.
- [ ] « Mes réservations » lists the family's bookings; a booking's récapitulatif links to the professional's full profile and offers « Lui envoyer une nouvelle demande en priorité ».
- [ ] « Mes gardes » lists the professional's bookings and links to each one.
- [ ] The migration adding `attribuee`, the priority columns, `care_request_applications` and `bookings` is generated by drizzle-kit, the journal test passes, and a preview build applies it to its own Neon branch with `db:verify` passing.
- [ ] Deleting a family's user row deletes her requests, their answers and her bookings; deleting a professional's profile deletes her answers and bookings and clears her as a priority professional.
- [ ] Unit tests cover the rules module: who may answer (each refusal above), the same-night rule, the accept transition, the republish transition, the edit lock with pending answers, and the récapitulatif's hours and duration.
- [ ] Every visible word, e-mails included, lives in `src/content/`; entries not quoted from the guide or the DA carry `@relecture Surya`; the catalogue tests pass on the new and changed files (no `!`, `…`, `—`, no insurance wording).
- [ ] `routing.test.ts` covers the new family and professional paths (the wrong role is sent to its own space, a signed-out visitor to sign in).
- [ ] README has a « The answer and the booking » section and `AGENTS.md` a routing row.

## Queue

- [x] 1. Schema: `attribuee`, priority columns, `application_status`, `care_request_applications`, `bookings`; drizzle-kit migration; applied to `run/candidature-et-reservation`
- [ ] 2. Rules: `src/lib/reservations/rules.ts` + tests; the edit lock in `src/lib/demandes/rules.ts`; `canReadFile` photo case + tests
- [ ] 3. Data: `src/lib/reservations/` (answer, withdraw, answers, accept batch, republish, bookings, full profile), `src/lib/demandes/` (list, priority, cancel), `src/lib/famille/` (booking address reader) + column tests
- [ ] 4. E-mails: five new templates, the urgent key's republish count, template tests
- [ ] 5. Words: `src/content/reservations.ts`, `demandes.ts` additions, catalogue tests
- [ ] 6. Professional pages: list card actions, « Mes gardes » and a booking, nav, home link
- [ ] 7. Family pages: answers, accept, republish, full profile, priority, « Mes réservations », file route, nav, routing test
- [ ] 8. Docs: README section, AGENTS.md row
- [ ] 9. Notes, pre-flip check, merge main, flip ready, full verdict
