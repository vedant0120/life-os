# ◈ Life OS — Personal Operating System

A full-stack habit tracker, goal manager, and accountability partner app. Built with React + Vite + Supabase. Deploy for free in under 10 minutes.

---

## What it does

- **Habit tracking** — daily check-ins, streaks, heatmaps, success rates
- **Goal system** — DSA roadmap, startup milestones, fitness tracker, finance planner
- **Accountability partner** — link with your partner, see their habits in real time, send reactions (🔥 👀 🎉)
- **Health dashboard** — medical condition tracker, PCP visit checklist
- **Diet planner** — meal plan with protein/calorie breakdown
- **Schedule** — morning routine, weekday/weekend split
- **AI Coach** — personalized insights via Claude API

---

## Tech Stack

| Layer    | Tool                        | Cost  |
|----------|-----------------------------|-------|
| Frontend | React 18 + Vite             | Free  |
| Database | Supabase (PostgreSQL)       | Free  |
| Auth     | Supabase Auth               | Free  |
| Realtime | Supabase Realtime           | Free  |
| Hosting  | Vercel                      | Free  |

---

## Setup Guide

### Step 1 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/life-os.git
cd life-os
npm install
```

### Step 2 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** — give it a name, set a database password, choose a region
3. Wait ~2 minutes for it to spin up

### Step 3 — Run the database schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it in and click **Run**

This creates all tables, RLS policies, the auto-profile trigger, and the partner-linking function.

### Step 4 — Get your API keys

In your Supabase project → **Settings** → **API**:
- Copy **Project URL** → this is your `VITE_SUPABASE_URL`
- Copy **anon / public** key → this is your `VITE_SUPABASE_ANON_KEY`

### Step 5 — Create your .env file

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6 — Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Create your account, start logging.

---

## Deploy to Vercel (free, 2 minutes)

### Option A — Via GitHub (recommended)

1. Push your repo to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/life-os.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
3. Add environment variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**

Your app is live at `https://life-os-xxx.vercel.app`. Every `git push` auto-deploys.

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

---

## Setting Up the Accountability Partner Feature

1. **You** create your account at your deployed URL
2. **Your wife** creates her account at the same URL
3. In the **Accountability** tab, enter your wife's email to link
4. Once linked, you can see each other's habits in real time

Both accounts are fully independent — separate habits, goals, logs. The accountability view shows the other person's today progress.

---

## Adding Your Historical Habit Data

Your historical data (March–July 2025) needs to be seeded into Supabase. Run this in the Supabase SQL Editor after signing up:

```sql
-- First get your user ID
SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL';

-- Then insert habits (replace USER_ID with your actual ID)
INSERT INTO public.habits (user_id, name, category, color, icon, priority, note) VALUES
('USER_ID', 'Interview Coding', 'Career', '#3b82f6', '💻', 1, 'DSA: Striver + NeetCode · 2.5 hrs · 3-5 problems/day'),
('USER_ID', 'SAVERS', 'Mindset', '#a855f7', '🧘', 2, 'Silence, Affirmation, Visualize, Exercise, Read, Scribe'),
('USER_ID', 'Workout', 'Fitness', '#f97316', '💪', 3, 'Gym 5x/week · 400-550 kcal burn'),
('USER_ID', '1500 Kcal Diet', 'Health', '#22c55e', '🥗', 4, '1500 kcal · gut-friendly'),
('USER_ID', 'Be Responsive not Reactive', 'Mindset', '#a855f7', '🧠', 5, 'Pause 3 sec before reacting'),
('USER_ID', 'No eating junk', 'Health', '#22c55e', '🚫', 6, 'Supports gut healing'),
('USER_ID', 'Food log', 'Health', '#22c55e', '📋', 6, 'Log everything'),
('USER_ID', 'Business Case study', 'Career', '#3b82f6', '💼', 7, '1 case/day'),
('USER_ID', 'Skin and Hair-care Routine', 'Self-Care', '#14b8a6', '✨', 8, 'Evening wind-down'),
('USER_ID', 'Photography', 'Creative', '#ec4899', '📸', 9, 'Casual creative outlet'),
('USER_ID', 'Laundry', 'Life', '#94a3b8', '🧺', 10, 'Sunday life admin');
```

For the historical logs, a full seed file is available — ask Claude to generate `supabase/seed.sql` with all your March–July 2025 data.

---

## Project Structure

```
life-os/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── supabase/
│   └── schema.sql          # Full DB schema — run this first
└── src/
    ├── main.jsx
    ├── App.jsx              # Auth state + data loading + routing
    ├── index.css            # Global styles
    ├── lib/
    │   └── supabase.js      # Supabase client
    ├── data/
    │   └── constants.js     # All static data (habits, DSA, meals, etc.)
    └── components/
        ├── Auth.jsx         # Login / signup
        ├── Nav.jsx          # Navigation bar
        ├── shared.jsx       # Ring, LogRow, calcStats, helpers
        ├── Dashboard.jsx    # Overview + AI coach
        ├── Today.jsx        # Daily check-in
        ├── Habits.jsx       # All habits + detail view
        ├── Trackers.jsx     # DSA + Startup + Fitness
        ├── Finance.jsx      # Finance tracker
        ├── Diet.jsx         # Meal plan + nutrition
        ├── Health.jsx       # Medical condition monitor
        ├── Schedule.jsx     # Daily/weekly schedule
        ├── Analytics.jsx    # Performance analytics
        └── Accountability.jsx  # Partner linking + reactions
```

---

## Customising for Your Wife

When your wife signs up, she'll start with a clean slate. She can:
1. Add her own habits (Habits → + Add)
2. Her data is completely separate from yours
3. Once linked as partners, you'll see each other's progress

To pre-load habits for her, use the same SQL approach above with her user ID.

---

## Environment Variables

| Variable                | Description                          |
|-------------------------|--------------------------------------|
| `VITE_SUPABASE_URL`     | Your Supabase project URL            |
| `VITE_SUPABASE_ANON_KEY`| Your Supabase anon/public API key    |

Never commit your `.env` file. It's in `.gitignore` by default.

---

## License

MIT — use it however you want.
