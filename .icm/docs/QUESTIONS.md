# Berceo — Discovery Questionnaire (master list)

Every question we should be able to answer before quoting — engineering,
commercial, legal and ethical. Deliberately exhaustive: the point is to pare
this down, not to send it as-is. Each question has a stable ID (`A1`, `B2`, …)
so a pared-down client version, call notes and answers can reference back here.

Sources: the cahier des charges + annotations, and the assessment in
[REPORT.md](REPORT.md). Questions marked **[BLOCKER]** are ones where, without
an answer, a responsible V1 quote (or launch) is not possible. Questions marked
**[LAWYER]** need a written answer from Berceo's own Belgian counsel — our
reading is analysis, not legal advice.

---

## The short list (if we only get one meeting)

1. **A1 / B1** — Who decides, and what is the real budget envelope?
2. **E1–E2** — Is the €100–300 slider final, and does care money *never* transit the platform?
3. **D2 [LAWYER]** — Does overnight in-home newborn care trigger ONE / Kind & Gezin licensing?
4. **H1** — Has the itsme sales conversation started? (Lead time ≈ 3 months, price unknown.)
5. **I3** — What are the actual subscription/fee/gift-card prices? (All currently TBD.)
6. **E4** — SEO-public profiles vs. subscriber-only profiles: which one wins?
7. **D1** — Is the legal entity incorporated, and who signs the contract?
8. **J1** — What happens, concretely, when something goes wrong at 3 a.m. during a garde?
9. **R1** — What launch date is expected, and what drives it?
10. **C2** — Will they accept a paid discovery sprint + day-rate/milestone model (not fixed-price full scope)?

---

## A. Vision, business & founders

- **A1.** Who is the decision-maker for scope, budget and acceptance? Is it one
  person or consensus among founders? **[BLOCKER]**
- **A2.** What is the elevator pitch in the founders' own words — what problem,
  for whom, and why does it need a platform rather than a Facebook group or an
  agency?
- **A3.** Why now? What triggered the project, and is there a hard external
  deadline (funding milestone, competitor move, personal runway)?
- **A4.** What are the founders' backgrounds (childcare, healthcare, business,
  tech)? Who among them will operate the platform day to day?
- **A5.** Is there a written business plan or financial model? Can we see it?
- **A6.** What does success look like at 6 and 18 months — number of bookings,
  revenue, registered professionals, geographic coverage?
- **A7.** How do they expect to make money, ranked: booking fees, family
  subscriptions, pro subscriptions, gift cards, other? What revenue split do
  they project?
- **A8.** Are they aware repeat bookings will largely leak off-platform (the
  disintermediation pattern documented for Care.com-style intro services)? Is
  the model priced to capture value on the *first* introduction?
- **A9.** Who do they see as competitors? Are they aware of Bsit (itsme +
  Stripe ID checks, subscriptions, 3,300+ sitters in Brussels), Care.com,
  Babysits, Yoopies, and the Flemish night-nanny agencies? What is Berceo's
  answer if Bsit adds night care?
- **A10.** How do they position against the *subsidised* baseline — INAMI-
  reimbursed midwife visits, mutualité doula interventions, Gezinsbond's
  €25/night service — when Berceo's range is €100–300/night?
- **A11.** What is the supply-side acquisition plan: where do the first 20–50
  professionals come from? Do they already have a network of night nannies /
  puéricultrices committed?
- **A12.** What is the demand-side plan: how do the first 100 families hear
  about Berceo? Is there a marketing budget separate from the build budget?
- **A13.** Chicken-and-egg strategy: which side do they seed first, and does
  the platform need to support a "concierge/manual matching" phase before full
  self-service?
- **A14.** Have they validated willingness to pay at €100–300/night with real
  parents (interviews, pre-orders, a waitlist)? Can we see the evidence?
- **A15.** Is there an existing brand/community (Instagram, waitlist, press)
  we should build on?
- **A16.** Are there other stakeholders — investors, advisors, a silent
  partner, an agency already involved — whose expectations we should know about?

## B. Budget & funding

- **B1.** What total budget is allocated to the build (design + development +
  third-party services), and what is the source (savings, investors, loan,
  subsidy)? **[BLOCKER]**
- **B2.** Is the budget a hard cap or a starting point with reserves for a
  V1.1?
- **B3.** Separately from the build: what *monthly run budget* is acceptable
  post-launch (hosting, Stripe fees, itsme/KYC per-check costs, maps, email,
  monitoring, support tooling)?
- **B4.** Is there budget for the non-code essentials: lawyer, accountant,
  insurance premiums, itsme contract, content/translation, photography?
- **B5.** Have they applied (or will they) for Walloon/Brussels startup
  subsidies or incubators, and does that impose timeline or reporting
  constraints?
- **B6.** What happens if the budget runs out mid-build — pause, descope, or
  raise? Who decides?

## C. Working relationship & engagement terms

- **C1.** What engagement shape do they expect: fixed price for the whole
  cahier des charges, day rate, milestones, retainer? (Our position: paid
  discovery sprint, then day-rate/milestone V1 — never fixed-price full
  scope.) **[BLOCKER]**
- **C2.** Will they fund a 5–8 day paid discovery/architecture sprint whose
  output is the resolved scope + a fixed V1 quote?
- **C3.** How available are they: weekly call cadence, feedback turnaround on
  questions (24h? a week?), and who is the single point of contact?
- **C4.** How will they give feedback and acceptance — written sign-off per
  milestone, or informal?
- **C5.** Who owns the code, the repositories, and all third-party accounts
  (Stripe, Supabase, Vercel, domain, itsme)? (Recommended: accounts in the
  company's name from day one, engineer as invited admin.)
- **C6.** What are the payment terms — deposit up front, invoicing rhythm,
  days-to-pay, late-payment interest? In whose name is the contract (see D1)?
- **C7.** Do they expect exclusivity or full-time availability, or is this
  compatible with other client work?
- **C8.** Is an NDA expected? Any restriction on naming Berceo as a portfolio
  reference?
- **C9.** What liability do they expect the engineer to carry? (We need a
  liability cap in the contract and our own RC professionnelle; we are not
  underwriting the platform's regulatory or safety risk.)
- **C10.** Termination terms: notice period, what happens to work in progress,
  handover obligations?
- **C11.** Who bears schedule risk for third-party delays (itsme contract,
  legal opinions, missing content/prices)? (Proposed: client-side blockers
  pause the clock, not the invoicing of completed work.)
- **C12.** Post-launch: do they want a maintenance retainer, and what response
  times do they imagine for production incidents?
- **C13.** Do they expect the engineer to also handle DevOps, support tooling,
  analytics, and data requests, or will anyone else technical be involved —
  now or later (hiring plans)?
- **C14.** If the collaboration works, what does the longer arc look like —
  fractional CTO, equity conversation, or strictly contractual?

## D. Legal entity, counsel & regulatory posture

- **D1.** Is the company incorporated (form, KBO number)? If not, when — and
  who signs our contract in the meantime? (Also gates itsme: OV/EV
  certificates require a verified legal entity.) **[BLOCKER]**
- **D2.** **[LAWYER] [BLOCKER]** Does facilitating regular overnight in-home
  care of 0–12s trigger ONE prior declaration / Code de Qualité (francophone)
  or Kind & Gezin/Opgroeien notification (Flanders) — for the *professionals*,
  for the *platform*, or neither? A written legal opinion is a launch
  precondition.
- **D3.** **[LAWYER]** Employment status: are the professionals genuinely
  self-employed? How does the €100–300 price *bounding* and the matching logic
  interact with the EU Platform Work Directive's presumption of employment
  (transposition due 2 Dec 2026)? What features must we avoid (algorithmic
  dispatch, sanctions, tight price control) to keep the presumption rebuttable?
- **D4.** **[LAWYER]** Confirm: does cash-off-platform settlement disqualify
  Berceo from the économie collaborative regime (agrément + ~10.7% withholding,
  €7,890 ceiling in 2026)? Do they *want* to restructure payments to qualify?
- **D5.** **[LAWYER]** DAC7: with off-platform payment, is Berceo outside the
  reporting duty (listing-only exemption), and are they comfortable with the
  optics of engineering around it?
- **D6.** **[LAWYER]** Undeclared-work exposure: what is counsel's view of the
  platform's liability if it knowingly surfaces supply/demand settled in cash
  with no reporting? What disclaimers, pro obligations (self-employment
  attestation, VAT/company number capture) or design changes do they require?
- **D7.** Who drafts the CGU/CGV, privacy policy, cookie policy and the
  professional/family contracts? (Not the engineer. Is a lawyer already
  engaged? Budgeted?)
- **D8.** **[LAWYER]** Consumer law: how do the 14-day withdrawal right and
  Belgian consumer-protection rules apply to booking fees, subscriptions and
  gift cards (expiry rules for vouchers)? What must the cancellation flow
  implement?
- **D9.** **[LAWYER]** Digital Services Act: as an online platform, what are
  Berceo's notice-and-action, complaint-handling, trader-traceability (KYBC)
  and transparency obligations, and what must the product implement (report
  content button, statement of reasons on suspensions, ToS transparency)?
- **D10.** **[LAWYER]** Platform-to-Business Regulation (2019/1150): the
  professionals are business users — do P2B ranking-transparency, ToS-change
  notice and internal-complaint requirements apply, and what must the product
  ship for them?
- **D11.** **[LAWYER]** European Accessibility Act (applies to e-commerce
  services since June 2025): does Berceo fall in scope, and what accessibility
  level must the site meet (practically: WCAG 2.1 AA)?
- **D12.** Insurance: will Berceo carry platform RC/professional liability?
  Will it require families to hold "Gens de Maison" insurance (as Bsit does)
  and pros to prove their own RC professionnelle? Has an insurer or broker
  been approached — and is per-booking insurance (Bsit-style) on the table?
- **D13.** **[LAWYER]** Are there sector rules on titles (puéricultrice,
  infirmière, sage-femme are regulated titles): may the platform display them,
  and what proof must it hold to do so?
- **D14.** Tax/accounting: who is the accountant, is the company VAT-
  registered, and who will own OSS registration for cross-border VAT on
  digital services?

## E. Spec contradictions to resolve (all ten, from the annotations)

Each of these changes the architecture, the estimate, or both.

- **E1.** Pricing: is the €100–300/night slider final and are "automatic
  tariffs by profile type" deleted? Can the bounds change per profile type or
  region later? **[BLOCKER]**
- **E2.** Payment flow: confirmed that *no money for the care itself* ever
  transits the platform — no escrow, no Connect, no mission-start code, no
  release validation? (Biggest architectural + legal consequence.) **[BLOCKER]**
- **E3.** Verification: definitively IN for V1 (itsme + ID fallback + manual
  diploma review + sworn declarations + transparency disclaimer)? Who performs
  the manual review and within what turnaround promise?
- **E4.** Profile visibility: public SEO-indexable profiles and
  subscriber-only profiles are mutually exclusive. Which wins? (Proposed:
  public teaser/anonymised cards + per-commune landing pages; full profile and
  contact behind subscription.) **[BLOCKER]**
- **E5.** Subscriptions: confirmed wanted at launch? Exact tier structure and
  prices (see I3) — or do we carve subscriptions/gift cards out of V1?
- **E6.** Profile data: V1 = location only (plus the verified documents), no
  preferences/availability calendar? What is the exact V1 field list for both
  roles?
- **E7.** Matching: which single mode ships in V1 — (a) request listing +
  applications, or (b) map browse + direct request? The other goes to V1.1.
- **E8.** Messaging: confirm the lifecycle — thread opens when?, auto-closes
  after the garde ends, read-only history after. Any re-open rules?
- **E9.** Ratings: stars only on 3–4 criteria (which criteria exactly?),
  dual-sided, no free text in V1? When do ratings become visible (after both
  rate? immediately)?
- **E10.** Disputes: routed to founders' email in V1 — what response-time
  expectation do we publish, and what does the pro/family see in-app?

## F. Product — families (demand side)

- **F1.** Who is the V1 family persona: newborn only, or 0–12 as in the
  licensing texts? Is there an infant age cap (e.g. 0–12 months)?
- **F2.** Exact signup fields for families — and can we keep them to the
  minimum (no health data — see L4)?
- **F3.** Does a family need identity verification too, or only an account +
  payment method? (Pros arriving at a stranger's home at night have a safety
  interest in this — see J6.)
- **F4.** What does a care request contain: date(s), time window, address (at
  what precision, when revealed?), number of children, ages, special notes?
  Are free-text notes allowed (moderation + GDPR implications)?
- **F5.** Single-night requests only in V1, or recurring/multi-night series?
- **F6.** How far ahead can bookings be made, and what is the minimum notice?
  Any same-night/urgent flow?
- **F7.** Cancellation policy: who can cancel, until when, and what happens to
  the booking fee at each stage (retain vs refund)? Exact matrix needed for
  Stripe logic. **[BLOCKER for the payments module]**
- **F8.** No-show handling (either side): status, refund, penalty, record?
- **F9.** Can families shortlist/favourite pros and rebook the same pro (which
  fuels leakage — do we care)?
- **F10.** What does the family see about a pro before subscribing/paying:
  photo? first name? distance? rating? verified badges?
- **F11.** Accessibility & languages: French-only V1 confirmed? When are NL/EN
  planned (affects i18n architecture now)?
- **F12.** Do families ever input data about *the child* beyond age (allergies,
  medical needs)? (Strong recommendation: not in V1 — Art. 9 GDPR.)

## G. Product — professionals (supply side)

- **G1.** Who qualifies as a "gardienne de nuit": which diplomas/certificates
  are accepted (puéricultrice, infirmière, sage-femme, CAP AEPE-equivalents,
  experience-only)? Is there a definitive accepted-credentials list? **[BLOCKER
  for verification design]**
- **G2.** Are profile "types" (levels/badges) derived from credentials, and do
  they affect the allowed price range or only display?
- **G3.** Exact onboarding flow: which steps are hard gates (identity,
  diploma, insurance proof, sworn declarations) vs. optional?
- **G4.** Do pros set availability in V1 or is every request negotiated in
  messaging? (Annotation says location only — confirm no calendar.)
- **G5.** What does a pro pay and when: annual subscription before visibility?
  Free until first booking? (Supply-side pricing shapes cold-start.)
- **G6.** Can a pro decline without penalty? Are acceptance-rate metrics
  tracked, and are they ever used in ranking? (PWD "control" signal — see D3.)
- **G7.** What ranking/ordering is used in search results and on the map, and
  will we publish it (P2B — see D10)?
- **G8.** Service radius: set by the pro, by the platform, or both? Max radius?
- **G9.** What proof of self-employed status / enterprise number do we collect
  from pros (also our answer to D6)?
- **G10.** Re-verification: do documents expire (insurance annually, casier
  judiciaire — see H8)? Who chases renewals?
- **G11.** What can a pro see about a family before accepting (name, exact
  address, children's ages)? At what stage is the exact address revealed?
- **G12.** Offboarding: what happens to a suspended/banned pro's profile,
  ratings, and pending bookings — and what notice/appeal do they get (DSA/P2B)?

## H. Identity, verification & vetting

- **H1.** itsme: has the sales conversation started? Who owns it? (Lead time
  realistically ~3 months, price unpublished, requires the entity + OV/EV
  certificate.) If not started this week, V1 launches on ID-card + manual
  review. **[BLOCKER]**
- **H2.** Direct itsme OIDC integration or via an aggregator (Signicat,
  Onegini/Onewelcome, Azure AD B2C connector)? Cost vs. friction decision —
  who decides?
- **H3.** Fallback KYC: is a per-check vendor (Stripe Identity ~$1.50, Veriff,
  Sumsub) acceptable, or is founder-manual ID review the V1 fallback? Who pays
  per-check costs?
- **H4.** Is itsme/KYC required for pros only, or for families too (see F3)?
- **H5.** Diploma verification: what does "verified" mean exactly — document
  looks authentic? issuer confirmed? register checked? (No KYC vendor verifies
  diplomas; this is manual.) What is the documented review procedure and
  rejection criteria?
- **H6.** Is AI-assisted triage of diplomas (extract issuer/name/date, flag
  anomalies, human decides) wanted in V1 or V1.1? Are founders comfortable
  with documents transiting an AI provider (GDPR — needs DPA + EU processing)?
- **H7.** Sworn declarations: exact list and wording (who writes it — lawyer),
  and how are they stored (versioned, timestamped)?
- **H8.** Criminal-record check: will Berceo require an *extrait de casier
  judiciaire modèle 596-2* (activities involving minors)? How often renewed,
  how stored, and what disqualifies? **[LAWYER]** for whether we may require
  and retain it — but ethically central for overnight infant care.
- **H9.** References: are professional references collected/checked in V1?
- **H10.** The transparency disclaimer ("we verify documents; we do not
  guarantee") — who drafts it, and where must it appear (profile, booking,
  CGU)? Does marketing copy stay consistent with it (FTC/Care.com lesson)?
- **H11.** What is the verification turnaround promise to a pro who signs up,
  and who staffs it (founders? hours/week)?
- **H12.** EUDI Wallet: agreed that it's a 2027+ addition, not a V1 dependency?

## I. Payments, pricing & money

- **I1.** Booking service fee: exact amount (fixed € or %), charged to the
  family, the pro, or both? Charged at request, at acceptance, or at
  confirmation? **[BLOCKER]**
- **I2.** Refund matrix for the fee (ties to F7): cancellation windows, no-
  shows, disputes, force majeure.
- **I3.** Subscriptions: exact tier names, contents, prices, billing periods
  for the 4 family tiers + the pro annual sub. Free trial? Discounts?
  (Currently ALL TBD — cannot build or quote billing without numbers.)
  **[BLOCKER]**
- **I4.** What exactly does a family subscription gate: seeing full profiles,
  contacting, booking, number of requests/month?
- **I5.** Gift cards: purchase flow, denominations, what they redeem against
  (subscriptions only? fees?), expiry (Belgian voucher rules — D8), and are
  founders OK with a custom credit-ledger implementation?
- **I6.** Payment methods: Bancontact + cards confirmed? SEPA debit for
  subscriptions? Apple/Google Pay?
- **I7.** Does Berceo have a Stripe account and a bank account in the company
  name? Who is the Stripe account owner/admin?
- **I8.** Failed payments & dunning: retry policy, grace period, when access
  is cut.
- **I9.** Invoicing: do families/pros need proper invoices (VAT) for fees and
  subscriptions? Generated by Stripe or by us?
- **I10.** VAT: rate/position on the fee and subscriptions, OSS registration,
  enable Stripe Tax from day one? (With the accountant — D14.)
- **I11.** Off-platform settlement UX: does the platform *display* the agreed
  €/night anywhere, suggest payment methods (cash/QR/transfer), or stay
  entirely silent? (Interacts directly with D4–D6 — the more we orchestrate,
  the worse the legal position.)
- **I12.** Will the platform ever want to process care payments later (escrow,
  Connect)? (Decides whether we keep the data model payment-ready.)
- **I13.** Currency and market: EUR-only, Belgium-only at launch? Any France
  ambition that changes VAT/legal analysis?
- **I14.** Promo codes / referral credits in V1?

## J. Trust, safety & incidents

- **J1.** The 3 a.m. scenario: a family or pro needs help mid-garde
  (emergency, conflict, no-show). What does Berceo offer — emergency contact,
  on-call founder, published protocol, or explicitly nothing beyond 112?
  Whatever the answer, it must be written and consistent with marketing.
  **[BLOCKER for CGU + product copy]**
- **J2.** Incident reporting: how does either side report a safety incident
  after a garde, what is the triage process, who investigates, and what are
  the possible outcomes (warning, suspension, ban, report to authorities)?
- **J3.** Under what conditions does Berceo proactively contact authorities
  (ONE, police) — and who decides?
- **J4.** Safeguarding stance: beyond legal minimums, what does Berceo commit
  to for infant safety (casier judiciaire H8, references H9, first-night
  check-in call, feedback review)? What did comparable services get wrong that
  we must not (Care.com vetting scandals)?
- **J5.** Moderation of free text (messages, request notes): reactive only
  (report button), keyword screening, or none? Who moderates and when?
- **J6.** Pro-side safety: pros enter strangers' homes at night. Do we verify
  families (F3), share family ratings with pros, provide a check-in/out
  mechanism, or an escalation line for pros?
- **J7.** Contact-info leakage: do we detect/block phone numbers & emails in
  messages before booking (anti-disintermediation + safety), or accept
  leakage?
- **J8.** Harassment/discrimination: complaint channel, response commitment,
  and grounds for removal — both directions.
- **J9.** Do we allow photos of children anywhere (profiles, requests,
  messages)? (Recommendation: no in V1 — GDPR minors' data + safety.)
- **J10.** Account takeover protection: is 2FA required for pros/admins given
  the sensitivity of the data?
- **J11.** What is the admin "kill switch" set: suspend profile, freeze
  bookings, force re-verification — and the audit trail behind each action?

## K. Ethics (for the team to answer honestly, internally)

- **K1.** Are we comfortable building a platform whose settlement design means
  care income is largely invisible to tax and labour authorities? Where is our
  personal line — and what mitigations (I11, G9, D6) make it acceptable?
- **K2.** Is the "verified" badge honest? Manual document review is not a
  guarantee of competence or safety. Will marketing resist overclaiming
  (H10), and will we walk away if asked to overclaim?
- **K3.** Overnight infant care is a life-safety domain. Do we require (not
  merely suggest) the casier judiciaire check H8 and an incident protocol J1–J2
  as conditions of *our* participation in the build?
- **K4.** Worker fairness: the price slider, ranking and any acceptance-rate
  tracking shape pros' livelihoods. What do we owe them — transparency of
  ranking (G7), appeal on suspension (G12), no dark-pattern lock-in?
- **K5.** Disintermediation: will the platform punish users for taking
  relationships off-platform (contact-info policing J7, bans)? How aggressive
  is acceptable toward people exercising a normal economic choice?
- **K6.** Data ethics: we hold identity documents, diplomas, home addresses of
  families with newborns, and possibly criminal-record extracts. Are retention
  minimalism (L6), EU residency (N4) and access controls non-negotiable even
  if they cost budget?
- **K7.** Accessibility & inclusion: do we build to WCAG AA even if the EAA
  analysis (D11) says we could skip it? Do matching/filters permit
  discriminatory selection (by name, origin), and do we design against it?
- **K8.** Honest advice: the market analysis (declining births, subsidised
  competitors, thin niche) suggests real failure risk. Have we told the
  founders clearly, in writing, before taking their money? (This document +
  REPORT.md is part of that answer.)
- **K9.** If counsel flags launch-blocking issues (D2, D6) and the founders
  want to launch anyway — do we continue, descope (directory-only pivot), or
  exit? Decide the line before it's tested.
- **K10.** Dual-quality bar: would we let this platform match a nanny to *our
  own* newborn? If not, what's missing — that gap is the real V1 scope.

## L. Data protection & privacy (GDPR)

- **L1.** Who is the data controller (entity — D1), and who inside Berceo owns
  GDPR (a founder, a DPO, external counsel)? Is a DPO legally required or
  voluntarily appointed?
- **L2.** Will they commission a DPIA? (Likely warranted: systematic
  processing of sensitive documents, vulnerable data subjects — infants,
  possibly criminal-record data H8, location data.) **[LAWYER]**
- **L3.** Data-residency requirement: is "EU-hosted" a hard constraint
  (affects Vercel/Supabase region choice and every subprocessor — N4), and is
  US CLOUD-Act exposure via US-owned providers acceptable to them?
- **L4.** Special-category data: confirmed that V1 collects NO health data
  about infants or adults (F12)? If any field risks it, who signs off on the
  Art. 9 basis?
- **L5.** Lawful bases per processing purpose (contract, legitimate interest,
  consent) — who documents the register of processing activities?
- **L6.** Retention: exact periods for identity docs, diplomas, casier
  extracts (if any — shortest possible), messages, ratings, payment records,
  deleted-account residue — and the deletion workflow for each. **[BLOCKER for
  storage design]**
- **L7.** Data-subject rights: expected turnaround for access/erasure
  requests, and do founders handle them with admin tooling we build, or
  manually?
- **L8.** Consent engineering: versioned CGU/privacy with per-user timestamp +
  version stored — confirmed requirement? Who owns publishing new versions and
  re-consent flows?
- **L9.** Subprocessors: DPAs needed with Supabase, Vercel, Stripe, itsme/KYC
  vendor, email provider, maps provider, analytics, any AI vendor (H6) — who
  collects and files them?
- **L10.** Cookies & analytics: preference for a consent-free EU analytics
  (Plausible/Matomo) vs. Google Analytics + consent banner? Marketing pixels
  planned (Meta/Google Ads) — each adds consent complexity?
- **L11.** Location privacy: agreed that home locations are always fuzzed
  (circle/offset centroid) until booking confirmation, including in map tiles
  and APIs (no exact coordinates in responses)?
- **L12.** Breach response: who is on the notification decision (72h to the
  APD/GBA), and do they want an incident-response runbook as a deliverable?
- **L13.** Children's data: the child is a data subject (age, first name?).
  What is the absolute minimum child data the product needs, and does anything
  require parental-consent mechanics beyond the parent being the user?
- **L14.** Marketing communications: transactional vs. marketing email
  separation, opt-in rules, and which provider (EU residency — N8)?

## M. Platform-regulation product requirements

(The product features that D9–D11 answers will force — asked here so they get
into scope and estimate.)

- **M1.** DSA: do we ship in V1 — a report-content mechanism, a statement of
  reasons on every suspension/removal, an internal complaint channel, a
  published ToS summary? (Small-platform exemptions exist — counsel confirms
  which apply.)
- **M2.** KYBC/trader traceability: what business information must we collect
  and *display* for professional traders (name, enterprise number, address)?
  Interacts with G9.
- **M3.** P2B: ranking-parameters disclosure text, 15-day ToS-change notice
  mechanism, complaint log — in V1 or not?
- **M4.** Accessibility target: WCAG 2.1 AA as the build standard (D11, K7) —
  confirmed, and is an accessibility statement page wanted?
- **M5.** Geo-blocking / cross-border: is the service restricted to Belgium at
  launch (I13), and do we technically restrict signup by country?
- **M6.** Terms acceptance UX: click-wrap standards, separate acceptance for
  CGU vs. privacy vs. sworn declarations — what does counsel require?

## N. Technical scope & infrastructure

- **N1.** Do they agree with the recommended stack (Next.js App Router +
  Supabase Postgres/Auth/RLS/Storage + PostGIS, Stripe, Resend/Brevo,
  Mapbox/MapLibre)? Any constraints, preferences, or existing assets that
  override it?
- **N2.** Web-first V1 confirmed — responsive web app, no native app? What is
  the trigger for a native app later (affects API design now)?
- **N3.** Domain(s): owned? By whom? DNS access? Email domain for
  transactional mail (SPF/DKIM setup)?
- **N4.** Hosting/residency decision (ties to L3): Vercel+Supabase EU regions
  (pragmatic) vs. EU-owned providers (Scaleway/Hetzner, more ops)? Who accepts
  the trade-off?
- **N5.** Environments: staging + production, seed data, who gets access?
  Preview deployments acceptable given noindex/privacy?
- **N6.** Maps: Mapbox (free tier likely sufficient) vs. MapLibre+MapTiler —
  and geocoding via free Belgian BeSt Address data? Who signs vendor ToS?
- **N7.** Search/geosearch expectations: radius search only, or
  filters/sorting beyond distance in V1 (rating, price, type)?
- **N8.** Email provider preference with EU processing (Brevo EU / Resend /
  Postmark) — and which notifications are in V1 scope (booking events, message
  received, verification status, subscription receipts, digests)?
- **N9.** SMS/WhatsApp notifications wanted in V1 or email-only? (Cost +
  consent implications.)
- **N10.** Realtime: is "refresh to see new messages" acceptable for V1, or is
  live updating (Supabase Realtime) expected?
- **N11.** Admin back-office scope (non-deferrable): user management,
  verification queue, suspend/reactivate with audit log, payments/refunds
  view, dispute inbox, feedback review, basic content editing — anything else
  the founders expect to do themselves?
- **N12.** CMS: do founders need to edit marketing pages/FAQ themselves (Sanity
  /Payload/MDX decision), or is dev-edited content fine for V1?
- **N13.** Analytics & KPIs: which product metrics do founders want on a
  dashboard from day one (signups, verifications, requests, matches, fee
  revenue, churn)?
- **N14.** Observability: error tracking (Sentry EU), uptime monitoring,
  alerting to whom? What uptime expectation is realistic and who is on call
  (see C12)?
- **N15.** Backups & continuity: RPO/RTO expectations, and who owns the
  restore runbook?
- **N16.** Rate limiting, bot/spam protection (fake pro signups, scraping of
  pro profiles), CAPTCHA tolerance?
- **N17.** Audit logging: which actions need immutable logs (verification
  decisions, admin actions, consent events, suspensions) — for GDPR and
  disputes?
- **N18.** Testing & quality bar: what CI gates do we commit to (type checks,
  lint, e2e on critical flows: signup, verification, booking, payment)? Any
  client expectation of formal test coverage or external pen-test before
  launch?
- **N19.** Data model future-proofing: multi-language, multi-country,
  payment-processing-later (I12), second matching mode (E7) — which do we
  architect for now vs. ignore?
- **N20.** Any existing code, database, prototype (Bubble?), or prior agency
  work we must reuse or migrate — or is this greenfield?

## O. Design, content & brand

- **O1.** Brand: logo, palette, typography — final and delivered in what
  format (Figma, files)? Who created it and do they remain involved?
- **O2.** Are there UI designs/wireframes, or does the engineer design from
  components (shadcn) with founder review? Is a designer budgeted (B4)?
- **O3.** Who writes all product copy (FR): onboarding, emails, error states,
  FAQ, safety pages? Founders, a copywriter, or drafted-by-engineer-and-
  reviewed?
- **O4.** Tone of voice and naming glossary ("garde", "gardienne",
  "professionnel(le)"? gendered terms — inclusive-language stance?).
- **O5.** Photography/illustration: stock, custom, or none? (Real photos of
  real pros raise consent + safety questions — J9.)
- **O6.** Legal pages content (D7) delivery date — these gate launch.
- **O7.** Is the vitrine/marketing site part of this build or separate? Who
  maintains it?

## P. SEO & growth mechanics

- **P1.** Resolve E4 first; then: which pages ARE public — homepage, how-it-
  works, pricing, per-commune landing pages, blog?
- **P2.** Per-commune programmatic pages: which communes at launch, what
  content makes them non-thin (Google helpful-content risk), who supplies it?
- **P3.** Blog/content marketing in scope? Who writes, where hosted (N12)?
- **P4.** Are paid channels planned (Meta/Google Ads) — landing pages,
  conversion tracking, and the consent implications (L10)?
- **P5.** Referral/word-of-mouth mechanics in V1 (I14) or later?
- **P6.** App-store-free growth accepted (no native app V1 — N2)?

## Q. Operations & post-launch

- **Q1.** Who staffs support, in which hours, through which channel (email
  only? in-app form?) — and what response time is *published*?
- **Q2.** Verification queue staffing (H11) and dispute handling (E10): hours
  per week the founders realistically commit?
- **Q3.** What operational runbooks do they want from us (verification
  procedure, incident response J1–J3, refund handling, GDPR requests L7)?
- **Q4.** Maintenance: retainer scope (C12) — security updates, dependency
  bumps, Stripe/API deprecations, small fixes vs. new features?
- **Q5.** Handover expectation if the engagement ends: documentation level,
  hiring support, code walkthrough?
- **Q6.** Legal-watch: who monitors the moving targets (PWD transposition Dec
  2026, EUDI Wallet Dec 2026, DSA guidance) — counsel, founders, or are we
  expected to flag them?

## R. Timeline, launch & success

- **R1.** Expected launch date and what drives it (season? funding? nothing
  firm)? Note: itsme (~3 months), legal opinions and pricing decisions gate
  launch independently of build speed. **[BLOCKER]**
- **R2.** Is a closed beta (invite-only, one commune, concierge matching)
  acceptable before public launch?
- **R3.** Launch geography: which communes/arrondissements first?
- **R4.** What are the V1 acceptance criteria — the checklist that means
  "done" and triggers final payment?
- **R5.** What single metric decides in month 3 whether V1.1 gets funded?
- **R6.** If the three client-side blockers (itsme contract, legal opinion,
  pricing) are still open when the build finishes — do we launch a degraded V1
  (ID-card-only, no subscriptions), or hold?

---

*Master list v1 — Août 2026. Pare down per audience: founders get a curated
subset of A–J + R in French; counsel gets the [LAWYER] set; K stays internal.*
