# لسان · Lisan

AI-powered language learning platform (Arabic RTL / English LTR, light design with optional dark mode).

**Status:** Phases 1–4 complete.
- **Phase 1:** visual identity, landing page, sign-up/sign-in, onboarding, profile, learning tracks, and a dashboard built on real data.
- **Phase 2:** adaptive placement test (EN/DE), lesson engine with 8 sections and 7 exercise types, and the first A1 lessons for English and German.
- **Phase 3:** AI tutor (5 personas, instant corrections, learner memory) and 10 role-play scenarios with reports, via Claude. Off until `ANTHROPIC_API_KEY` is set.
- **Phase 4:** listening and reading centres (tap-to-translate, saved words, graded questions), AI writing assistant, and pronunciation coach (Azure Speech; off until `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` are set).
See [`docs/plan/implementation-plan.md`](docs/plan/implementation-plan.md) for all phases and [`docs/research/`](docs/research) for the competitor research.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router, Cache Components, `proxy.ts`), React 19, TypeScript |
| UI | Tailwind CSS v4, IBM Plex Sans Arabic, lucide icons |
| Database | **PostgreSQL** (any host) via Drizzle ORM |
| Auth | better-auth: email + password, Google (optional), password reset via Resend (optional) |
| Tests | Vitest (DB integration), Playwright (E2E, desktop + mobile) |

No vendor lock-in: the database is a plain `DATABASE_URL`. That can be a local Postgres, Neon/Railway/Render free tiers, or your own server.

## Run locally

```bash
cp .env.example .env            # set DATABASE_URL and BETTER_AUTH_SECRET
npm install
npm run db:migrate && npm run db:seed
npm run dev                     # http://localhost:3000 → redirects to /ar or /en
```

## Checks

```bash
npm run typecheck && npm run lint
npm test                        # needs a lisan_test database (TEST_DATABASE_URL)
npm run build && npm run test:e2e
```

## Optional integrations (honest states)

Every external service is off until configured, and the UI says so:

- **Google sign-in:** set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (redirect URI: `<BETTER_AUTH_URL>/api/auth/callback/google`).
- **Email (password reset):** set `RESEND_API_KEY` and `EMAIL_FROM`.
- **AI tutor & role-play:** set `ANTHROPIC_API_KEY` (optionally `AI_MODEL`, `AI_EFFORT`, `AI_DAILY_MESSAGES_PER_USER`, `AI_MONTHLY_BUDGET_USD`).
- **Pronunciation assessment:** set `AZURE_SPEECH_KEY` + `AZURE_SPEECH_REGION`.
- **Payments:** a later phase, enabled only after owner approval.

## Layout

```
src/app/[lang]/        pages (landing, auth, onboarding, dashboard, profile)
src/app/api/auth/      better-auth handler
src/lib/db/            Drizzle schema, client, seed data (12 languages)
src/lib/learner/       user-scoped data access (every query filtered by userId)
src/lib/actions.ts     server actions (zod-validated)
src/lib/i18n/          ar/en dictionaries (en is type-checked against ar)
src/content/           placement banks + courses (answers stay server-side)
src/lib/placement/     adaptive placement engine
src/proxy.ts           locale redirect + optimistic auth redirect
drizzle/               SQL migrations
tests/unit, tests/e2e  test suites
```
