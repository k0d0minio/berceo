# Tasks: back-office-admin

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] `/admin` shows « Vue d'ensemble » with the four blocks, each a number and a link; for each block, the number equals the row count of the list it links to, on seeded data covering every state.
- [ ] The verification queue and the students switch work unchanged at `/admin/dossiers`; `/admin/absences` redirects to `/admin/signalements`; every admin page carries the navigation and is a 404 to a signed-out visitor, a family and a professional.
- [ ] A founder finds any active or suspended account in one search by first name, last name, full name, e-mail or phone in any of the three notations; a deleted account is never found.
- [ ] The profile view shows the account's identity, state, related lists and journal entries, never a family's address, and shows no action on an admin account.
- [ ] Suspending asks for confirmation naming the person, lists the upcoming gardes if any, and on confirmation withdraws her waiting answers, cancels her open requests, leaves her confirmed gardes as they were, and writes `compte_suspendu` with the administrator's name.
- [ ] A suspended professional is absent from the search, the public and per-commune pages, the sitemap, the family's professional view, the priority candidates and the urgent and digest recipients; a Checkout completing after her suspension is refunded as « booking no longer possible ».
- [ ] A suspended account's sign-in is refused with the suspension message, and an already-open session lands on that message at its next page load or action.
- [ ] Reactivating asks for confirmation naming the person, restores sign-in and, for a `valide` professional, her presence in search and on her public page, and writes `compte_reactive`.
- [ ] Deletion is refused on an active account and on one with an upcoming garde; on a suspended account without one, after typing the last name, the account is anonymised as specified, her documents are gone from the bucket, her Neon Auth identity is gone, her bookings, payments and ratings remain under « Compte supprimé », and `compte_supprime` is written.
- [ ] « Contacter l'utilisateur » sends the e-mail with Reply-To set to the sending founder's address and writes `utilisateur_contacte` with the subject; a failed send writes nothing.
- [ ] `/admin/demandes` and `/admin/reservations` list every request and booking with their states and filters; `/admin/signalements` lists cancellations and absences, and « Marquer comme traité » removes the row from « À traiter » and from the dashboard count and writes `signalement_traite`.
- [ ] Every admin action of this run (suspend, reactivate, delete, contact, mark handled) appears in `/admin/journal` with the date, time, action, account and administrator's name, and the journal still refuses update and delete.
- [ ] Every new word is in the content catalogue, passes the catalogue tests, and the pages keep the DA (no shadow, red and green only in the confirmation dialogs, D-24).

## Queue

- [ ] <task — small enough for one commit; name the file or area>
