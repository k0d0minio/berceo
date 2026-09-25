# Spec: The professional's indicative availability

- slug: disponibilites-indicatives
- personas: professionnel, parent
- touches: src/db/schema.ts, drizzle/**, src/lib/disponibilites/**, src/app/(portail)/espace/professionnelle/disponibilites/**, src/app/(portail)/espace/professionnelle/page.tsx, src/app/(portail)/design-system/portail/page.tsx, src/components/disponibilites/**, src/components/shell/space-shell.tsx, src/content/disponibilites.ts, src/content/disponibilites.test.ts, src/content/comptes.ts, src/lib/auth/routing.test.ts, README.md, AGENTS.md
- complexity: standard

## Problem

A family reading a professional's profile cannot tell whether she is likely to be free next week,
and a professional has no way to say so short of a message. The founders asked for an indicative
calendar (D-12, overriding the annotation « Juste la localisation » on B-03 and C-01), and Surya's
guide gives it its words (« Les disponibilités »). It is the professional's side of the freedom
the guide promises her (« vous choisissez vos disponibilités, vos zones, les gardes que vous
acceptez ») and, for the family, an indication before publishing a request. It advances the
Plateforme Berceo V1 objective: a first usable version on uat.berceo.be before December 2026, for
a launch in January 2027.

No page shows a professional's profile to a family yet: the full profile comes with
candidature-et-reservation (« Voir le profil complet ») and the search cards with
recherche-et-fiches-publiques. This run builds the calendar, the stored nights, the family-facing
block and its data read; those two stubs mount the block (D-69).

## Proposed change

**A night.** A night is named by the date of its evening, the same date a care request carries in
`night_date` (demande-de-garde): the night of the 12th is the night from the 12th to the 13th.
Dates are calendar dates in Europe/Brussels, computed with the existing helpers of
`src/lib/demandes/rules.ts` (`brusselsNow`, `addDays`), never re-implemented.

**Two states (D-81).** A night is either marked available or not. « Disponible » marks it,
« Indisponible » clears the mark. Only available nights are stored; an unmarked night and a night
marked « Indisponible » are the same thing. Families only ever see available nights.

**The window (D-79).** A professional can mark any night from tonight to today + 56 days
included (57 nights), the same last day as a normal care request (`NORMAL_LAST_DAY`), so every
night a family can ask for can be marked. Tonight stays markable until midnight in Brussels. A
night before today is neither shown nor accepted; stored nights that fall behind today are ignored
by every read (no purge in this run).

**Who.** Only a professional whose profile status is `valide` uses the calendar: her profile is
the only kind a family can ever see (D-21). Any other status opening the page sees one line saying
the calendar opens once her profile is validated, and no calendar.

**« Mes disponibilités » — `/espace/professionnelle/disponibilites`**, guarded by
`requireAccess(SPACES.professionnel)`, `noindex`, `force-dynamic`. `SpaceShell` gains a
« Mes disponibilités » entry for the professional role, after « Demandes ». Her home
`/espace/professionnelle` links to it once her profile is `valide`, next to the requests link.
The page, top to bottom, in the guide's words verbatim:

- the title « Mes disponibilités »;
- the instructions « Indiquez les nuits où vous êtes disponible. Ces informations sont
  indicatives : vous restez libre d'accepter ou de refuser toute demande. »;
- the calendar: the 57 nights as week rows, Monday to Sunday, headed by their month where a month
  starts, days before tonight and after the last day shown empty and inert. Each night is a tap
  target of at least 44 × 44 px showing the day number; a marked night is visibly distinct from an
  unmarked one (the DA's sage fill), and the difference is also carried in text for screen
  readers (its accessible name says the date and whether it is marked). On a 360 px wide phone the
  whole week fits one row with no horizontal scroll;
- tapping nights selects them (a selected night is visibly distinct from a marked one, and
  tapping again deselects); two buttons, « Disponible » and « Indisponible », apply to the
  selection: one server action marks or clears every selected night, the calendar shows the new
  state and the selection empties. With nothing selected both buttons are disabled. The page works
  without a second screen or a confirmation dialog: marking a week is tapping seven nights and one
  button;
- the help message « Vos disponibilités ne sont pas contractuelles. Vous pouvez les modifier à
  tout moment et rester libre de refuser une demande même si vous avez indiqué être
  disponible. »;
- a preview headed « Ce que voient les familles » (`@relecture Surya`) showing the family-facing
  block below, fed by the same read the families' pages will use.

A save that fails (a date outside the window, a status no longer `valide`) changes nothing and
says why in a form message; the calendar keeps her selection.

**The family-facing block — « Prochaines disponibilités » (D-80).** A server component in
`src/components/disponibilites/` that takes the list of dates to show and renders:

- the heading « Prochaines disponibilités »;
- the next five available nights from tonight, in date order, each written as a night
  (« Nuit du lundi 12 au mardi 13 octobre », `@relecture Surya`), fewer when fewer are marked,
  never a night beyond the window;
- under the dates, the guide's line verbatim: « Ces disponibilités sont indicatives. La
  professionnelle confirmera lors de l'acceptation de votre demande. »;
- with no night marked, one line instead of the dates (`@relecture Surya`) that says she has not
  indicated any night yet and that a family can still send her a request, and no caveat. The block
  never says she is unavailable.

The read that feeds it, `nextAvailableNights(profileId, now)` in `src/lib/disponibilites/`,
returns at most five dates from today (Brussels) to today + 56 days, and returns none for a
profile whose status is not `valide`. candidature-et-reservation and recherche-et-fiches-publiques
call it and mount the block; nothing in this run mounts it on a family-facing page.

**Availability filters nothing and blocks nothing.** No care-request query, e-mail, digest or
list reads the availability table. A professional with no night marked, or not marked on a
request's night, sees and receives every request exactly as today; answering a request on a
night she did not mark is allowed (candidature-et-reservation adds no check on it).

**Who can read and write what.** All reads and writes of the new table go through
`src/lib/disponibilites/` (server-only). The server action takes only dates: the profile comes
from the session (`requireAccess` then her own profile), never from the form. Every submitted date
is validated server-side (ISO date, inside the window, at most 57 dates per save, duplicates
collapsed); an invalid set is refused whole.

**Data model (one migration, generated by drizzle-kit).** A new table
`professional_availability`:

- `profile_id` uuid, not null, → `professional_profiles.id` `on delete cascade`;
- `night_date` date, not null;
- `created_at` timestamptz, not null, default now;
- primary key `(profile_id, night_date)`, which is also the index the next-five read uses.

Marking a night already marked and clearing a night not marked are no-ops (insert on conflict do
nothing; delete).

**The rules module.** `src/lib/disponibilites/rules.ts` holds the window (first and last night
from `now`), the week grid of the calendar (57 nights padded to Monday–Sunday rows with their
month headings), the validation of a submitted set, and the count shown to families (5). The page,
the server action, the read and the tests share it.

**Words (D-19).** Every visible word lives in a new `src/content/disponibilites.ts` keyed by
locale, plus the navigation label in `src/content/comptes.ts`. Entries quoted from the guide
(« Les disponibilités » block) say so; every other entry carries `@relecture Surya`. Vouvoiement,
no `!`, `…` or `—`, no price, no insurance wording (D-8), no « diplômées » (D-7). A new
`src/content/disponibilites.test.ts` follows `demandes.test.ts`: the mechanical rules on every
entry, and the guide's lines verbatim.

**Look (D-9).** The DA's tokens and the retuned shadcn buttons; capsule buttons, 32 px card for
the family block, no shadow, no red or green (D-24: there is no confirmation dialog here). The
block is added to `/design-system/portail` with sample dates and in its empty state.

**Docs.** A README section « The professional's availability » (where the files live, the two
states, the window, the block and who mounts it) and the routing row in `AGENTS.md`.

## Acceptance criteria

- [ ] On a 360 px wide phone, a `valide` professional opens « Mes disponibilités » from the navigation, taps seven nights of one week and « Disponible », and the seven nights show as marked after the save, with no horizontal scroll and no other screen.
- [ ] Selecting marked nights and pressing « Indisponible » clears them; reloading the page shows the stored state.
- [ ] Both buttons are disabled with no night selected; tapping a selected night deselects it.
- [ ] The calendar shows exactly the nights from tonight to today + 56 days (Brussels) as tappable; earlier and later days are inert.
- [ ] The server action refuses, and stores nothing from, a set holding a date before today, a date after today + 56, a malformed date, or more than 57 dates; a forged profile id in the form is ignored.
- [ ] A professional whose profile is not `valide` sees the « opens once validated » line and no calendar, and the server action refuses her save.
- [ ] Each night's accessible name states its date and whether it is marked.
- [ ] The page shows the guide's title, instructions, button labels and help message verbatim.
- [ ] The « Ce que voient les familles » preview shows « Prochaines disponibilités » with her next five marked nights from tonight in date order, each as « Nuit du … au … », and the guide's caveat verbatim under them.
- [ ] With no marked night, the block shows the empty-state line, no dates and no caveat.
- [ ] `nextAvailableNights` returns at most five dates, none before today or after today + 56, and none for a profile that is not `valide`.
- [ ] The care-request list, the urgent e-mail and the digest are unchanged: a professional with no marked night still sees and receives every request in her communes (the existing demandes tests pass unchanged, and no file under `src/lib/demandes/` imports `src/lib/disponibilites/`).
- [ ] The migration adding `professional_availability` is generated by drizzle-kit, the journal test passes, and a preview build applies it to its own Neon branch with `db:verify` passing.
- [ ] Deleting a professional's profile deletes her availability (cascade).
- [ ] Unit tests cover the rules module: the window edges in Brussels time around midnight and across a daylight-saving change, the week grid (Monday start, month headings, padding), the validation of a submitted set, and the « Nuit du … au … » wording across a month end.
- [ ] Every visible word lives in `src/content/`; entries not quoted from the guide carry `@relecture Surya`; `src/content/disponibilites.test.ts` passes (no `!`, `…`, `—`, no price, no insurance wording, the guide's lines verbatim).
- [ ] `routing.test.ts` covers `/espace/professionnelle/disponibilites` (a parent is sent to her own space, a signed-out visitor to sign in).
- [ ] `/design-system/portail` shows the block with sample dates and in its empty state.
- [ ] README has a « The professional's availability » section and `AGENTS.md` a routing row.

## Out of scope

- Mounting « Prochaines disponibilités » on a family-facing page: the full profile is candidature-et-reservation's, the search cards and public pages recherche-et-fiches-publiques' (D-69). Their Define reads this spec and calls `nextAvailableNights`.
- Any filter, sort or match on availability: search results, the professional's request list, the e-mails (the guide and D-12: indicative only).
- Any binding booking from the calendar; a night marked available is never a commitment.
- Recurring patterns (« every Friday »), time ranges inside a night, daytime slots.
- A three-state night (« Indisponible » stored apart from unmarked) (D-81).
- Nights beyond today + 56 days; purging nights that fell behind today.
- Reminders to update the calendar, e-mails of any kind, calendar export or sync (iCal, Google).
- The calendar before validation, and availability in the admin back-office.
- Scope decisions this run neither builds nor changes: D-1, D-2, D-3, D-4, D-5, D-6, D-10, D-11, D-13, D-14, D-15, D-16, D-17, D-18, D-20, D-22, D-23, D-25, D-26, D-27.

## Open questions

- none. Non-blocking notes: the placement (D-69), the 56-day window (D-79), the five nights shown (D-80) and the two-state night (D-81) are the operator's answers in this Define session, 2026-09-25; `revise` changes them. messagerie may add a migration in parallel; the two must be generated one after the other on the merged tree. The decision ids D-69 to D-81 are the next free ones on `main`; a run defined in parallel that takes the same ids renumbers at its merge, as demande-de-garde did.

Context budget: read Surya's editorial guide (« Les disponibilités », « La recherche ») and the professional's space and `src/lib/demandes/rules.ts` beyond the Inputs table, to quote the guide exactly and to reuse the Brussels date helpers.
