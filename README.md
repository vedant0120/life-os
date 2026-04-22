# Life OS

[![CI](https://github.com/vedant0120/life-os/actions/workflows/ci.yml/badge.svg)](https://github.com/vedant0120/life-os/actions/workflows/ci.yml)

A personal operating system — habit tracker, goal manager, analytics, and daily
check-ins. Fork it, sign up, and make it your own.

## What it is

Life OS is a generic, multi-user template for building a personal OS in the
browser. Each user gets their own private space with:

- Daily check-ins and habit tracking (streaks, heatmaps, success rates)
- Custom habits, goals, and trackers (DSA, fitness, finance, diet — whatever you want)
- Analytics dashboard over your own historical data
- Optional accountability partner (link with another user by email)
- An AI coach slot (placeholder for now — wire your own provider later)

Nothing is hardcoded to a specific person; everything is seeded through an
in-app onboarding flow.

## Tech stack

| Layer      | Tool                                          |
| ---------- | --------------------------------------------- |
| Frontend   | React 18 + Vite + TypeScript                  |
| Routing    | react-router-dom v6                           |
| State      | React Context + `useReducer`                  |
| Auth       | Firebase Authentication (Email/Password + Google) |
| Database   | Cloud Firestore                               |
| Hosting    | Vercel                                        |
| CI         | GitHub Actions (lint + typecheck + build)     |

## Quick start (local dev)

```bash
git clone https://github.com/vedant0120/life-os.git
cd life-os
npm install
cp .env.example .env        # then fill in your Firebase config
npm run dev                 # open http://localhost:5173
```

You need a Firebase project (see below) before `npm run dev` will do anything
useful — the app boots to a sign-in screen that talks to Firebase.

## Firebase setup

1. **Create a Firebase project**
   - Go to <https://console.firebase.google.com> → **Add project**.
   - Name it (e.g. `my-life-os`), accept defaults, create.

2. **Enable auth providers**
   - Build → **Authentication** → **Get started**.
   - Sign-in method tab → enable **Email/Password**.
   - Enable **Google** (pick a support email).

3. **Create Firestore**
   - Build → **Firestore Database** → **Create database**.
   - Choose **Production mode** (rules live in `firestore.rules` in this repo).
   - Pick a region close to your users.

4. **Register a web app**
   - Project settings (gear icon) → **Your apps** → **Web** (`</>`) icon.
   - Give it a nickname, skip Hosting, click **Register**.
   - Copy the `firebaseConfig` values into your `.env`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Security rules are defined in `firestore.rules` and enforce per-user data
isolation. Deploy them with the Firebase CLI (`firebase deploy --only firestore:rules`)
before real users sign up.

## Deploy to Vercel

1. Push your fork to GitHub.
2. <https://vercel.com> → **Add New → Project** → import your repo.
3. In **Environment Variables**, add all six `VITE_FIREBASE_*` keys from your
   `.env` (scope: Production + Preview + Development).
4. Click **Deploy**. Every push to `main` will auto-deploy.
5. After the first deploy, copy the Vercel domain (e.g.
   `your-app.vercel.app`) and add it to Firebase Console → Authentication →
   **Settings → Authorized domains**. Otherwise sign-in will fail in
   production.

## Project structure

```
life-os/
├── .github/workflows/ci.yml     # Lint, typecheck, build on PR + push
├── firestore.rules              # Firestore security rules
├── index.html
├── vite.config.ts
├── tsconfig.json
├── .env.example
└── src/
    ├── main.tsx                 # Entry point
    ├── App.tsx                  # Router + providers
    ├── types.ts                 # Shared domain types
    ├── index.css                # Global styles
    ├── data/
    │   └── constants.ts         # Generic app constants (no personal data)
    ├── lib/
    │   ├── firebase.ts          # Firebase SDK init
    │   └── db/                  # Firestore client + typed helpers
    ├── stores/
    │   ├── AuthContext.tsx      # Auth state (Firebase user)
    │   └── DataContext.tsx      # App data (Context + useReducer)
    └── components/
        ├── Landing.tsx          # Public landing page
        ├── Auth.tsx             # Sign in / sign up
        ├── AuthedShell.tsx      # Authed layout wrapper
        ├── Onboarding.tsx       # First-run habit/goal seeding
        ├── Nav.tsx
        ├── Dashboard.tsx        # Overview (AI coach slot — placeholder)
        ├── Today.tsx            # Daily check-in
        ├── Habits.tsx
        ├── Trackers.tsx
        ├── Analytics.tsx
        ├── Accountability.tsx
        ├── Finance.tsx, Diet.tsx, Health.tsx, Schedule.tsx
        └── shared.tsx           # Ring, LogRow, stats helpers
```

## Scripts

| Script                 | What it does                              |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start Vite dev server on `:5173`          |
| `npm run build`        | Type-check + production build to `dist/`  |
| `npm run preview`      | Preview the built app locally             |
| `npm run lint`         | ESLint over `src/`                        |
| `npm run lint:fix`     | ESLint with `--fix`                       |
| `npm run format`       | Prettier write over `src/`                |
| `npm run format:check` | Prettier check (fails CI on drift)        |
| `npm run typecheck`    | `tsc --noEmit`                            |

## CI

`.github/workflows/ci.yml` runs on every push and pull request:

1. `npm ci`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run build`

Keep these green before merging to `main`. Vercel deploys from `main`
automatically.

## Notes

- The **AI coach** panel on the Dashboard is currently a placeholder.
  Wire it to any LLM provider you like — nothing is committed to a specific
  vendor.
- All personal data (habits, goals, logs) lives in Firestore per-user;
  no content is baked into the codebase.

## License

MIT.

---

<sub>Author's live instance: <https://life-os-alpha-one.vercel.app> — feel free to ignore.</sub>
