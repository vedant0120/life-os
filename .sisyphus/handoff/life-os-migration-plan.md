# Life OS — Migration Plan (Supabase → Firebase + TS + Router + Zustand + CI)

Status: DRAFT · Target: ship each epic as one PR-sized unit, app buildable after every epic.
Deferred (NOT in scope): AI coach / Anthropic wiring.

---

## Executive summary

Rearchitect the Life OS React+Vite app off Supabase and onto Firebase Auth + Firestore (Spark tier), hosted on Vercel with GitHub auto-deploy. In parallel, harden the codebase: TypeScript, react-router-dom, Zustand stores, ESLint flat config + Prettier, GitHub Actions CI (lint/typecheck/build), lockfile commit, `.DS_Store` purge. All hardcoded personal data (HABIT_META, DSA_MONTHS, STARTUP_MONTHS, FITNESS_MILESTONES, MEALS, BUDGET, HEALTH_FLAGS, schedules, AI prompt fragments) is deleted from code — the app ships as a generic multi-user template; the owner re-seeds via the existing Onboarding wizard post-launch. Epics are ordered so every intermediate commit builds and the app remains functional (Supabase stays live until Epic 6 cut-over; Firebase is introduced behind a feature flag in Epic 5).

---

## Epic list (ordered)

| # | Epic | Complexity | Blocks |
|---|---|---|---|
| 0 | Repo hygiene: `.DS_Store`, `.gitignore`, lockfile | S | 1+ |
| 1 | Tooling: ESLint flat + Prettier + scripts | S | 2, 8 |
| 2 | TypeScript conversion (jsx→tsx, tsconfig, types) | L | 3, 4, 5 |
| 3 | react-router-dom: replace `view` switch | M | 4 |
| 4 | Zustand stores: extract state from App | M | 5 |
| 5 | Firebase client + feature-flagged data layer | L | 6 |
| 6 | Cut-over: remove Supabase, Firebase is default | M | 7, 9 |
| 7 | Strip hardcoded personal data + disable AI coach | M | — |
| 8 | GitHub Actions CI (lint + typecheck + build) | S | 10 |
| 9 | Vercel deploy + env wiring + README rewrite | S | — |
| 10 | Firestore security rules + composite indexes | M | — |

### Dependency graph

```
0 ─► 1 ─► 2 ─► 3 ─► 4 ─► 5 ─► 6 ─► 9
          │                   └► 7
          └─────────────────► 8 ─► 10 (deploy rules post-cutover)
```

Epic 7 may run in parallel with 5/6 but must merge after 6 to avoid re-introducing personal data. Epic 10 (rules) must deploy at/after Epic 6 so live traffic is governed the instant Firebase becomes the only backend.

---

## Epic details

### Epic 0 — Repo hygiene  · S
- Scope: strip committed `.DS_Store`; add `.DS_Store`, `.env*`, `dist/`, `build/`, `.vercel/`, `.firebase/`, `*.local` to `.gitignore`; run `npm install` once and commit `package-lock.json`.
- Files: `.gitignore`, `package-lock.json` (new), `git rm **/.DS_Store`.
- Acceptance: `git ls-files | grep -i ds_store` empty; lockfile checked in; `npm ci` works clean; `npm run build` still passes.
- Rollback: `git revert`. No runtime impact.

### Epic 1 — ESLint flat config + Prettier · S
- Scope: `eslint.config.js` (flat) with `@eslint/js`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `typescript-eslint` (dormant until Epic 2); `.prettierrc`, `.prettierignore`; `package.json` scripts: `lint`, `format`, `typecheck` (placeholder).
- Files: `eslint.config.js`, `.prettierrc`, `.prettierignore`, `package.json`.
- Acceptance: `npm run lint` passes on current JSX; `npm run format -- --check` passes after initial format commit.
- Rollback: delete configs + revert `package.json`.

### Epic 2 — TypeScript conversion · L
- Scope: add `typescript`, `@types/react`, `@types/react-dom`; `tsconfig.json` (strict, `moduleResolution: bundler`, `jsx: react-jsx`, `allowJs: true` during transition); rename all `.jsx` → `.tsx`, `.js` → `.ts` (except Vite config stays `.js`); add minimal domain types in `src/types.ts` (`Habit`, `HabitLog`, `Profile`, `Reaction`, `FitnessLog`, `Status`); update `vite.config.js` → `vite.config.ts`.
- Files: `tsconfig.json`, `src/**/*.tsx`, `src/**/*.ts`, `src/types.ts`, `vite.config.ts`, `package.json`.
- Acceptance: `npm run typecheck` (`tsc --noEmit`) clean; `npm run build` produces working bundle; `npm run dev` loads app.
- Rollback: revert branch. Supabase still wired so runtime unaffected.
- Safety: do conversion in one PR but commit logically (config, then rename, then type fixes) to aid review.

### Epic 3 — react-router-dom · M
- Scope: install `react-router-dom@6`; create `src/router.tsx` with routes for `/`, `/today`, `/habits`, `/trackers`, `/finance`, `/diet`, `/health`, `/schedule`, `/accountability`, `/analytics`, `/onboarding`, `/auth`; `App.tsx` becomes auth-gate + `<Outlet/>`; `Nav.tsx` swaps `setView` for `<NavLink>`.
- Files: `src/main.tsx`, `src/App.tsx`, `src/router.tsx` (new), `src/components/Nav.tsx`.
- Acceptance: every old `view` string has a route; deep links work; browser back/forward works; unauthenticated users redirected to `/auth`; onboarding redirect intact.
- Rollback: revert PR.

### Epic 4 — Zustand stores · M
- Scope: install `zustand`; create `src/stores/authStore.ts` (session, profile), `src/stores/dataStore.ts` (habits, logs, partner*, dsa, startup, fitness, reactions + loader actions), `src/stores/uiStore.ts` (onboarding flag, loading). Keep current Supabase calls inside store actions (no backend change yet). `App.tsx` becomes a thin orchestrator.
- Files: `src/stores/*.ts`, `src/App.tsx`, every consumer component (swap `sharedProps` for store hooks).
- Acceptance: App renders identically; `App.tsx` <80 lines; no `useState` for domain data in App; re-renders scoped via selectors.
- Rollback: revert PR. Stores are additive until consumers migrate; keep one commit per wave.

### Epic 5 — Firebase client + feature-flagged data layer · L
- Scope: install `firebase@10`; add `src/lib/firebase.ts` (initializeApp, getAuth, getFirestore); create `src/lib/db/` adapter with a `DataClient` interface implemented twice: `supabaseClient.ts` (current code, lifted verbatim) and `firebaseClient.ts` (new). Store actions consume `DataClient` via a single `getClient()` selector driven by `VITE_BACKEND=supabase|firebase` (default `supabase`). Implement Firestore reads with `onSnapshot` for: own habits, own logs (last 500 by date desc), partner habits, partner logs, reactions where `to_uid == me`. Writes via `setDoc`/`addDoc`/`updateDoc`. Auth: email/password + `onAuthStateChanged`.
- Files: `src/lib/firebase.ts`, `src/lib/db/index.ts`, `src/lib/db/supabaseClient.ts`, `src/lib/db/firebaseClient.ts`, `src/stores/*`, `.env.example`.
- Acceptance: with `VITE_BACKEND=supabase` app behaves as before; with `VITE_BACKEND=firebase` + valid Firebase creds, sign-up → onboarding → habit check-in → heatmap → partner link → reactions all work against Firestore.
- Rollback: flip `VITE_BACKEND` back to `supabase`. Both clients shipped side-by-side.
- Safety: NO Supabase code deleted this epic.

### Epic 6 — Cut-over to Firebase · M
- Scope: delete `supabaseClient.ts`, `src/lib/supabase.js`, `supabase/` directory, `@supabase/supabase-js` dep, `VITE_SUPABASE_*` envs; remove `VITE_BACKEND` flag; `getClient()` always returns Firebase.
- Files: deletions above + `src/lib/db/index.ts`, `.env.example`, `README.md` snippet.
- Acceptance: `grep -ri supabase src/` empty; build + typecheck green; full smoke test on deployed preview against real Firebase project.
- Rollback: within 24h: `git revert` to Epic 5 state — both backends were live there. After 24h: forward-fix only.
- Safety: do NOT delete the Supabase project itself for 7 days; keep data exportable.

### Epic 7 — Strip personal data + disable AI coach · M
- Scope: gut `src/data/constants.js` — delete `HABIT_META`, `DSA_MONTHS`, `DSA_REVISION`, `STARTUP_MONTHS`, `FITNESS_MILESTONES`, `WORKOUT_DAYS`, `MEALS`, `BUDGET`, `MONTHLY_INCOME`, `SAVINGS_DEPLOYMENT`, `YEARLY_FINANCE_TARGETS`, `HEALTH_FLAGS`, `PCP_BULLETS`, `WEEKDAY_SCHEDULE`, `SAT_SCHEDULE`, `SUN_SCHEDULE`. Keep only generic lookups (category colors default, status enums). Components that rendered these arrays now read from Firestore (`dsa_progress`, `startup_progress`, `goal_progress`, etc.) OR render empty-state CTAs pointing to Onboarding / "Add your own". Rip the hardcoded user-context template out of `Dashboard.tsx` `getAI()`; replace AI coach tile with a disabled placeholder card labelled "AI Coach — coming soon" (no fetch call, no Anthropic import, no API key reference).
- Files: `src/data/constants.(js|ts)`, `src/components/Dashboard.tsx`, `Diet.tsx`, `Health.tsx`, `Schedule.tsx`, `Trackers.tsx`, `Finance.tsx`.
- Acceptance: `grep -ri "Interview Coding\|SAVERS\|Rifaximin\|Prucalopride\|Google/Netflix/HRT\|78 kg"` returns zero in `src/`; app renders empty-state flows for new accounts; AI card renders disabled, no network call.
- Rollback: revert PR; personal data stays archived in the steering file only.

### Epic 8 — GitHub Actions CI · S
- Scope: `.github/workflows/ci.yml` runs on `pull_request` and `push` to `main`: `actions/checkout`, `actions/setup-node@v4` (node 20), `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`. Matrix not needed.
- Files: `.github/workflows/ci.yml`.
- Acceptance: PR shows green CI check; failing lint/typecheck/build blocks merge (branch protection toggled in GitHub UI — documented, not automated).
- Rollback: delete workflow file.

### Epic 9 — Vercel deploy + README rewrite · S
- Scope: Vercel project wired to GitHub repo, `main` → production, PRs → preview. Env vars in Vercel UI: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`. `vercel.json` (optional) with SPA rewrite `/* → /index.html`. Rewrite `README.md` top-to-bottom for new stack.
- Files: `vercel.json`, `README.md`, `.env.example`.
- Acceptance: push to `main` triggers production deploy; PR comment from Vercel shows preview URL; preview URL loads and auths against Firebase.
- Rollback: disconnect Vercel project; app still runs locally.

### Epic 10 — Firestore security rules + indexes · M
- Scope: author `firestore.rules` per §"Security rules" below; deploy via Firebase Console (no Cloud Functions, no CLI-in-CI required). Create composite indexes as Firestore prompts: `users/{uid}/habit_logs` on `(date desc)`; `accountability_reactions` on `(to_uid, created_at desc)` and `(from_uid, created_at desc)`.
- Files: `firestore.rules` (committed for review, deployed manually), `firestore.indexes.json` (committed).
- Acceptance: rules simulator tests pass for: owner read/write own; partner read habits+logs; partner denied writes; non-partner denied any access; reactions insert constrained to `from_uid == auth.uid`.
- Rollback: redeploy previous ruleset (Firebase Console keeps history).
- Safety: deploy rules BEFORE announcing app to any partner-test user.

---

## Environment / account setup

Run once, before Epic 5:

1. **GitHub repo**: create `life-os` (private). Push current `main`. Enable branch protection on `main` requiring CI green + 0 approvals (solo owner).
2. **Firebase project**: console.firebase.google.com → "Add project" → name `life-os-prod` → disable Analytics → Spark plan.
   - Auth → Sign-in method → enable **Email/Password**.
   - Firestore → Create database → **Native mode** → region `nam5` (multi-region US) or nearest single-region → **Start in production mode** (locked rules; Epic 10 replaces them).
   - Project Settings → General → Your apps → Web app → register "life-os" → copy config into local `.env`.
3. **Vercel project**: vercel.com → Add New → Project → import GitHub repo → framework `Vite` → add all `VITE_FIREBASE_*` env vars for Production + Preview + Development → Deploy.
4. **Env wiring**: `.env.example` committed with placeholder keys; real `.env` local-only; Vercel holds prod values.
5. **GitHub → Vercel auto-deploy**: automatic once Vercel project is linked to the repo. Every `main` push → prod; every PR → preview URL commented on the PR.

---

## Firestore data model

Rationale summary: keep per-user writes inside `users/{uid}/...` subcollections — rules become trivial (`request.auth.uid == uid`), and `today-view` / heatmap queries stay single-collection scoped. Reactions are top-level because they span two users.

| Old Postgres table | New Firestore path | Doc shape | Notes |
|---|---|---|---|
| `profiles` | `users/{uid}` | `{ name, email, avatarColor, partnerUid, partnerEmail, partnerStatus, onboardingData, aiContextPrompt, createdAt }` | `uid === auth.uid`. `aiContextPrompt` stays null this round. |
| `habits` | `users/{uid}/habits/{habitId}` | `{ name, category, color, icon, priority, note, active, createdAt }` | Subcollection. Query: `where('active','==',true)`, `orderBy('priority')`. |
| `habit_logs` | `users/{uid}/habit_logs/{logId}` | `{ habitName, date (YYYY-MM-DD string), status, createdAt }`; `logId = ${habitName}_${date}` | **Top-level under user, NOT nested under habit.** Preserves existing query: `orderBy('date','desc').limit(500)` — one index, feeds today-view + heatmap + partner view. Nesting under habit would force N queries to render the heatmap. Deterministic ID gives free upsert. |
| `dsa_progress` | `users/{uid}/dsa_progress/{topicKey}` | `{ completed, updatedAt }` | Doc id = `topicKey` → free upsert. |
| `startup_progress` | `users/{uid}/startup_progress/{taskKey}` | `{ completed, updatedAt }` | Same pattern. |
| `fitness_logs` | `users/{uid}/fitness_logs/{logId}` | `{ date, weight, caloriesEaten, caloriesBurned, note, createdAt }` | `orderBy('date')`. |
| `goal_progress` | `users/{uid}/goal_progress/{goalId}` | `{ progress, updatedAt }` | |
| `accountability_reactions` | `accountability_reactions/{id}` (top-level) | `{ fromUid, toUid, type, message, habitName, date, read, createdAt }` | Top-level because it spans two users. Indexed on `(toUid, createdAt desc)` and `(fromUid, createdAt desc)`. |

Query-pattern preservation:
- **Today view**: `users/{me}/habit_logs` `where('date','==', today)` — single query.
- **Heatmap (90d)**: `users/{me}/habit_logs` `orderBy('date','desc').limit(500)` — unchanged from current Supabase call.
- **Partner view (realtime)**: `onSnapshot(users/{partnerUid}/habit_logs orderBy date desc limit 200)` + `onSnapshot(users/{partnerUid}/habits where active==true)`.
- **Reactions (realtime)**: `onSnapshot(accountability_reactions where toUid==me orderBy createdAt desc limit 50)`.

Partner linking: client-side two-write transaction — read `users` where `email == partnerEmail`, then `writeBatch` sets `partnerUid`+`partnerStatus='linked'` on both docs. No Cloud Function. Protected by rules (see below).

---

## Firestore security rules (outline)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {

    function isSignedIn()       { return request.auth != null; }
    function isOwner(uid)       { return isSignedIn() && request.auth.uid == uid; }
    function myPartnerUid()     { return get(/databases/$(db)/documents/users/$(request.auth.uid)).data.partnerUid; }
    function isMyPartner(uid)   { return isSignedIn() && myPartnerUid() == uid; }

    // USER PROFILE
    match /users/{uid} {
      allow read:   if isOwner(uid) || isMyPartner(uid);
      allow create: if isOwner(uid);
      // Owner can update own; partner link flow allows a peer to set partnerUid on the OTHER doc
      // iff that other doc's email matches the requesting user's email input (enforced client-side;
      // rules constrain fields):
      allow update: if isOwner(uid)
        || (isSignedIn()
            && request.resource.data.diff(resource.data).affectedKeys()
                 .hasOnly(['partnerUid','partnerEmail','partnerStatus'])
            && request.resource.data.partnerUid == request.auth.uid);
      allow delete: if false;

      // OWN subcollections: habits, habit_logs, dsa_progress, startup_progress,
      // fitness_logs, goal_progress
      match /habits/{doc}       { allow read: if isOwner(uid) || isMyPartner(uid);
                                  allow write: if isOwner(uid); }
      match /habit_logs/{doc}   { allow read: if isOwner(uid) || isMyPartner(uid);
                                  allow write: if isOwner(uid); }
      match /fitness_logs/{doc} { allow read: if isOwner(uid) || isMyPartner(uid);
                                  allow write: if isOwner(uid); }
      match /dsa_progress/{doc}     { allow read, write: if isOwner(uid); }
      match /startup_progress/{doc} { allow read, write: if isOwner(uid); }
      match /goal_progress/{doc}    { allow read, write: if isOwner(uid); }
    }

    // REACTIONS
    match /accountability_reactions/{id} {
      allow create: if isSignedIn()
                    && request.resource.data.fromUid == request.auth.uid
                    && request.resource.data.toUid == myPartnerUid();
      allow read:   if isSignedIn()
                    && (resource.data.toUid == request.auth.uid
                        || resource.data.fromUid == request.auth.uid);
      allow update: if isSignedIn()
                    && resource.data.toUid == request.auth.uid
                    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']);
      allow delete: if false;
    }
  }
}
```

Invariants enforced: (a) owner full read/write on own subtree; (b) partner READ-ONLY on `habits`, `habit_logs`, `fitness_logs`, and profile; (c) no cross-user access outside partner link; (d) reactions: sender must be self and recipient must be self's current partner; recipient can only toggle `read`.

---

## Post-migration manual steps (owner)

1. Sign up on the deployed Vercel URL with your real email.
2. Complete the Onboarding wizard — add the 11 personal habits (names/colors/icons/notes per the steering file §2).
3. Have wife sign up; link partners from the Accountability tab.
4. Optional: run a local dev-only seed script (Node + firebase-admin with a service-account key kept OUT of the repo) to bulk-insert March–July 2025 `habit_logs` for your own uid only. Do NOT commit the service-account key.
5. When ready for AI coach (separate future epic): populate `users/{myUid}.aiContextPrompt` via a profile-edit screen, add a Vercel serverless route `/api/coach` that reads the prompt + proxies to Anthropic with `ANTHROPIC_API_KEY` (Vercel env var, server-side only), and re-enable the Dashboard AI card.
6. Decommission Supabase project ~7 days after Epic 6 ships cleanly.

---

## Global safety notes

- Every epic must leave `npm run build` + `npm run typecheck` (from Epic 2 onward) green. CI (Epic 8) enforces this for everyone else.
- Never commit `.env`, Firebase service-account JSON, or any key.
- Firebase Spark has free quotas — monitor usage in console; a rogue `onSnapshot` in a render loop will burn reads fast.
- Rules deploy is manual via Firebase Console; always run the Rules Playground against the three personas (owner, linked partner, stranger) before publishing.
