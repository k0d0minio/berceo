# Tasks: comptes-welcome-email-no-retry

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [ ] A family's first click on the verification link redirects without awaiting the welcome: the confirmer schedules `sendWelcomeIfDue` through `after()` and no longer awaits it in the request.
- [ ] When the confirmer's `users` read throws, the response is a redirect to `/connexion?verifie=1` that still carries every `Set-Cookie` Neon answered with, and one `console.error` line with the `[comptes]` prefix and the `authUserId` is logged; no 500.
- [ ] The existing confirmer behaviours are unchanged and still tested: the way back to a full profile (D-129) and its cookie cleared, a professional to her space, a missing row to `/connexion?erreur=compte`, an invalid or reused token to `/connexion?lien=invalide` / `?verifie=1`.
- [ ] A signed-in family opening `/espace/famille` with `welcome_sent_at` null has the welcome attempted after the response; with `welcome_sent_at` set, nothing is scheduled. The page renders the same either way.
- [ ] A professional opening her space never triggers a welcome attempt (the role rule in `sendWelcomeIfDue` holds on the new path).
- [ ] A unit test covers the new retry path: scheduled for a parent with no `welcome_sent_at`, not scheduled when it is set, not scheduled for a professional, the origin read before the deferred work.
- [ ] Two concurrent attempts for one family still send at most one e-mail (the conditional UPDATE claim is unchanged), and a failed send still releases the claim.
- [ ] On the UAT preview: signing up as a family and clicking the verification link lands in the space signed in and the welcome e-mail arrives, with its link pointing at the UAT address.

## Queue

- [x] `src/lib/auth/welcome.ts`: `scheduleWelcomeIfDue` (parent + null only, `after()`), with `welcome.test.ts`
- [x] confirmer route: guarded `users` read → `/connexion?verifie=1` with the session cookies; welcome scheduled, not awaited; `route.test.ts` extended
- [x] `/espace/famille`: schedule the welcome with `siteOrigin()` after `requireAccess`
- [x] ready flip, full verdict on the post-flip head
