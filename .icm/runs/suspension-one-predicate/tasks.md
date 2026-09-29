# Tasks: suspension-one-predicate

The queue, with a definition of done per item. Ticked by the stage that finishes the item —
a human checkbox, never a script's. The definition of done is seeded from the spec's
acceptance criteria when the run is opened; the queue is Build's own, one line per commit-sized
step, so a resuming session can pick up the first unticked line.

## Definition of done

- [x] `grep -rniE "suspended_at" src --include=*.ts --include=*.tsx | grep -v "\.test\.tsx\?:"` matches only `src/lib/auth/suspension.ts`, `src/lib/admin/accounts.ts` and `src/db/schema.ts`.
- [x] `grep -rnE "is(Not)?Null\([A-Za-z]+\.suspendedAt\)|suspendedAt\}\s*is" src --include=*.ts --include=*.tsx` matches only `src/lib/admin/accounts.ts` and `src/db/schema.ts`.
- [x] `raterActive`, `answerRequest`, `decide`, `loadQueue`, `publicProfile`, `professionalsServing`, the priority notice, `acceptAnswer`'s facts and `messageNotice` each build their suspension condition from `notSuspended` or `suspended` in `src/lib/auth/suspension.ts`, on the id of the account being held out.
- [x] `messageNotice` no longer selects `suspendedAt`; it returns null when the recipient is suspended and the notice otherwise, as before.
- [x] `suspension-isolation.test.ts` passes on the branch and fails when `isNull(users.suspendedAt)` or a raw `suspended_at is not null` is added to any other file under `src/` (shown once locally or in CI, then removed).
- [x] The existing tests pass unchanged — `src/lib/auth/suspension.test.ts` (the emitted `not exists (…)` string), `src/lib/recherche/professionals.test.ts`, `src/lib/admin/*.test.ts`, and every other `*.test.ts` under `src/`.
- [ ] On the UAT preview, with a validated professional serving a commune: once a founder suspends her account, she is absent from the family's search and the commune page, her public profile and the family's view of her profile answer « introuvable », she cannot answer an open request, and no request e-mail or message e-mail reaches her; once reactivated, each of these is back.
- [ ] On the UAT preview: a professional whose file waits in the verification queue disappears from `/admin/dossiers` while suspended and returns when reactivated.

## Queue

- [x] `suspension.ts`: `suspended()` added, `notSuspended()` built on it (same emitted SQL)
- [x] raw-SQL readers: `raterActive`, `answerRequest`, `decide`
- [x] joined-`users` readers: `loadQueue`, `publicProfile`, `professionalsServing`, the priority notice; `acceptAnswer`'s facts on `suspended()`
- [x] `messageNotice`: recipient suspension read in SQL
- [x] `suspension-isolation.test.ts`
- [x] the advisory quality job green on the ready head (criterion 6)
