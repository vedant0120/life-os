// ─── HABIT METADATA ──────────────────────────────────────────────────────────
export const HABIT_META = {
  'Interview Coding':           { cat:'Career',    col:'#3b82f6', icon:'💻', pri:1, note:'DSA: Striver + NeetCode · 2.5 hrs · 3-5 problems/day' },
  'SAVERS':                     { cat:'Mindset',   col:'#a855f7', icon:'🧘', pri:2, note:'Silence, Affirmation, Visualize, Exercise, Read, Scribe' },
  'Workout':                    { cat:'Fitness',   col:'#f97316', icon:'💪', pri:3, note:'Gym 5x/week · 400-550 kcal burn · skip on health flares' },
  '1500 Kcal Diet':             { cat:'Health',    col:'#22c55e', icon:'🥗', pri:4, note:'1500 kcal · gut-friendly · coconut aminos not soy sauce' },
  'Be Responsive not Reactive': { cat:'Mindset',   col:'#a855f7', icon:'🧠', pri:5, note:'Pause 3 sec before reacting to anything stressful' },
  'No eating junk':             { cat:'Health',    col:'#22c55e', icon:'🚫', pri:6, note:'Supports gut healing and fat loss' },
  'Food log':                   { cat:'Health',    col:'#22c55e', icon:'📋', pri:6, note:'Log everything — awareness is the first lever' },
  'Business Case study':        { cat:'Career',    col:'#3b82f6', icon:'💼', pri:7, note:'1 case/day · lunch break or commute' },
  'Skin and Hair-care Routine': { cat:'Self-Care', col:'#14b8a6', icon:'✨', pri:8, note:'Evening wind-down ritual' },
  'Photography':                { cat:'Creative',  col:'#ec4899', icon:'📸', pri:9, note:'Casual creative outlet · 2-3x/month' },
  'Laundry':                    { cat:'Life',      col:'#94a3b8', icon:'🧺', pri:10, note:'Sunday life admin' },
}

export const ANCHOR_HABITS = [
  'Interview Coding', 'SAVERS', 'Workout', '1500 Kcal Diet', 'Be Responsive not Reactive',
]

export const CAT_COLORS = {
  Career: '#3b82f6', Health: '#22c55e', Fitness: '#f97316', Mindset: '#a855f7',
  'Self-Care': '#14b8a6', Creative: '#ec4899', Life: '#94a3b8',
}

export const CATEGORIES = Object.keys(CAT_COLORS)

export function getMeta(h) {
  return HABIT_META[h] || { cat: 'Life', col: '#94a3b8', icon: '⭐', pri: 99, note: '' }
}

// ─── DSA ROADMAP ─────────────────────────────────────────────────────────────
export const DSA_MONTHS = [
  { label: 'Month 1 — Apr 2025', topics: ['Arrays & Hashing','Two Pointers','Sliding Window','Stack','Queue','Binary Search'], milestone: 'Blind 75 Part 1 done', target: '20-25 problems/week' },
  { label: 'Month 2 — May 2025', topics: ['Linked Lists','Trees BT + BST','Heaps','Intervals','Tries'], milestone: 'Core data structures solid', target: '20-25 problems/week' },
  { label: 'Month 3 — Jun 2025', topics: ['Graphs BFS + DFS','Backtracking','Greedy','Bit Manipulation'], milestone: 'Graphs + recursion fluent', target: '20-25 problems/week' },
  { label: 'Month 4 — Jul 2025', topics: ['DP 1D','DP 2D + Grid','DP on Strings','Advanced Trees'], milestone: 'DP patterns cracked', target: '20-25 problems/week' },
  { label: 'Month 5 — Aug 2025', topics: ['Advanced Graphs','Math + Geometry','Hard DP','Blind 75 full review'], milestone: 'Blind 75 complete', target: '15-20 hard problems/week' },
  { label: 'Month 6 — Sep 2025', topics: ['System Design basics','Distributed systems','Mock interviews 3x/week','Google/Netflix patterns'], milestone: 'Start applying Oct 2025', target: '10-15 + 3 mocks/week' },
]

export const DSA_REVISION = [
  { layer: 'Same-day (15 min)', desc: 'After each session: write the pattern + key insight in 2 lines in your pattern journal.', icon: '📝', timing: 'Daily' },
  { layer: 'Next-day re-solve (15 min)', desc: 'Re-attempt yesterday\'s hardest problem completely blind. If stuck after 10 min, review and note what you missed.', icon: '🔁', timing: 'Daily warm-up' },
  { layer: 'Weekly review (30 min)', desc: 'Every Sunday: re-solve 5 problems from the past week blind. Time yourself.', icon: '📅', timing: 'Sunday' },
  { layer: 'Topic cheat sheet', desc: 'After finishing each topic: write a single page summary of every pattern with pseudocode.', icon: '📄', timing: 'End of topic' },
  { layer: 'Bi-weekly mock (90 min)', desc: 'Every 2 weeks: timed — 2 mediums + 1 hard. No help. Treat it like a real interview.', icon: '🎯', timing: 'Every 2 weeks' },
]

// ─── STARTUP MILESTONES ───────────────────────────────────────────────────────
export const STARTUP_MONTHS = [
  { label: 'Month 1 — Apr 2025', phase: 'Validate', tasks: ['10 customer discovery interviews','Define core problem clearly','Competitor + market analysis','Document key insights + ICP'] },
  { label: 'Month 2 — May 2025', phase: 'Design', tasks: ['Lock MVP scope (max 3 features)','Wireframes + lo-fi mockups','Choose tech stack','Set up repo + dev environment'] },
  { label: 'Month 3 — Jun 2025', phase: 'Build I', tasks: ['Core feature 1 built + tested','Auth + database working','Basic API structure','Internal dogfooding'] },
  { label: 'Month 4 — Jul 2025', phase: 'Build II', tasks: ['Core feature 2 complete','Full MVP functional','UI polished','Stripe payment integration'] },
  { label: 'Month 5 — Aug 2025', phase: 'Beta', tasks: ['5-10 beta users onboarded','Structured feedback collected','Critical bugs fixed','Pricing model validated'] },
  { label: 'Month 6 — Sep 2025', phase: 'Launch 🚀', tasks: ['ProductHunt launch','First paying customer','Analytics + monitoring','Iterate on feedback'] },
]

// ─── FITNESS ─────────────────────────────────────────────────────────────────
export const FITNESS_MILESTONES = [
  { month: 'Apr 2025', weight: 100, bf: 22 },
  { month: 'Jun 2025', weight: 97, bf: 21 },
  { month: 'Aug 2025', weight: 93, bf: 19 },
  { month: 'Oct 2025', weight: 89, bf: 17 },
  { month: 'Dec 2025', weight: 85, bf: 16 },
  { month: 'Feb 2026', weight: 81, bf: 14 },
  { month: 'Apr 2026', weight: 78, bf: 13 },
]

export const WORKOUT_DAYS = [
  { day: 'Monday', focus: 'Upper Push', muscles: 'Chest · Shoulders · Triceps', burn: '~450 kcal', exercises: [{ name: 'Bench Press', sets: '4×8-10' },{ name: 'Incline DB Press', sets: '3×10-12' },{ name: 'Overhead Press', sets: '3×10' },{ name: 'Lateral Raises', sets: '3×15' },{ name: 'Tricep Pushdowns', sets: '3×12' }] },
  { day: 'Tuesday', focus: 'Lower Body', muscles: 'Quads · Hamstrings · Glutes', burn: '~500 kcal', exercises: [{ name: 'Barbell Squats', sets: '4×8-10' },{ name: 'Romanian Deadlift', sets: '3×10' },{ name: 'Leg Press', sets: '3×12' },{ name: 'Walking Lunges', sets: '3×12' },{ name: 'Calf Raises', sets: '4×20' }] },
  { day: 'Wednesday', focus: 'Boxing + HIIT', muscles: 'Full body · Cardio', burn: '~550 kcal', exercises: [{ name: 'Shadowboxing warmup', sets: '3 rounds' },{ name: 'Heavy bag', sets: '5 rounds' },{ name: 'Combos + footwork', sets: '3 rounds' },{ name: 'HIIT finisher', sets: '10 min' }] },
  { day: 'Thursday', focus: 'Upper Pull', muscles: 'Back · Biceps · Rear delts', burn: '~420 kcal', exercises: [{ name: 'Deadlift', sets: '4×6-8' },{ name: 'Lat Pulldown', sets: '3×10' },{ name: 'Cable Rows', sets: '3×12' },{ name: 'Face Pulls', sets: '3×15' },{ name: 'Bicep Curls', sets: '3×12' }] },
  { day: 'Friday', focus: 'Full Body + Core', muscles: 'Compound + Core', burn: '~460 kcal', exercises: [{ name: 'Barbell Squats', sets: '3×8' },{ name: 'DB Rows', sets: '3×10 each' },{ name: 'Push-ups', sets: '3×15' },{ name: 'Plank', sets: '3×45 sec' },{ name: 'Mountain Climbers', sets: '3×30' }] },
  { day: 'Saturday', focus: 'Hike or Walk', muscles: 'Cardio · Active recovery', burn: '~400 kcal', exercises: [{ name: 'Outdoor walk/hike', sets: '60-90 min' }] },
  { day: 'Sunday', focus: 'Rest + Meal Prep', muscles: 'Recovery', burn: '~0 kcal', exercises: [{ name: 'Full rest', sets: 'Let muscles repair' },{ name: 'Meal prep', sets: '2-3 hrs' }] },
]

// ─── DIET / NUTRITION ─────────────────────────────────────────────────────────
export const MEALS = [
  { time: '9:20am', label: 'Breakfast', icon: '🥣', total: { protein: 45, kcal: 407 }, note: 'Post-workout. Blend or overnight oats.', items: [{ food: 'Whey isolate 1.5 scoops', protein: 37, kcal: 165 },{ food: 'Oats 40g dry', protein: 5, kcal: 152 },{ food: 'Chia seeds 1 tbsp', protein: 2, kcal: 60 },{ food: 'Almond milk 200ml', protein: 1, kcal: 30 }] },
  { time: '1:00pm', label: 'Lunch (existing)', icon: '🍱', total: { protein: 40, kcal: 780 }, note: 'Swap soy sauce → coconut aminos (same taste, no soy/gluten).', items: [{ food: 'Paneer 150g', protein: 27, kcal: 397 },{ food: 'Stir-fried veggies (carrot, capsicum, cabbage)', protein: 4, kcal: 80 },{ food: 'Rice 120g cooked', protein: 3, kcal: 156 },{ food: 'Butter 5g + coconut aminos', protein: 0, kcal: 37 },{ food: 'Hemp seeds 2 tbsp (on top)', protein: 6, kcal: 110 }] },
  { time: '4:00pm', label: 'Snack', icon: '🌱', total: { protein: 17, kcal: 350 }, note: 'High protein, satisfying, gut-friendly.', items: [{ food: 'Roasted pumpkin seeds 30g', protein: 9, kcal: 170 },{ food: 'Roasted chickpeas 50g', protein: 8, kcal: 180 }] },
  { time: '7:30pm', label: 'Evening Soup (existing + lentils)', icon: '🍵', total: { protein: 11, kcal: 196 }, note: 'Lentils dissolve into the soup — no texture change. Excellent for gut motility.', items: [{ food: 'Bottle gourd soup with ginger, fenugreek, jeera', protein: 2, kcal: 60 },{ food: 'Red lentils 40g dry (add while cooking)', protein: 9, kcal: 136 }] },
  { time: '9:30pm', label: 'Pre-bed', icon: '🌙', total: { protein: 5, kcal: 140 }, note: 'Soluble fiber helps morning bowel movement.', items: [{ food: 'Chia pudding — 2 tbsp chia + almond milk + cinnamon', protein: 5, kcal: 140 }] },
]

// ─── FINANCE ─────────────────────────────────────────────────────────────────
export const BUDGET = [
  { cat: 'Housing / Rent',         amount: 2500, type: 'expense', color: '#ef4444' },
  { cat: 'Food + Vegan Cafes',     amount: 400,  type: 'expense', color: '#f97316' },
  { cat: 'Transport',              amount: 200,  type: 'expense', color: '#f59e0b' },
  { cat: 'Utilities + Subs',       amount: 200,  type: 'expense', color: '#a855f7' },
  { cat: 'Personal + Lifestyle',   amount: 300,  type: 'expense', color: '#ec4899' },
  { cat: 'Index Funds (S&P 500)',  amount: 2000, type: 'invest',  color: '#22c55e' },
  { cat: 'Startup War Chest',      amount: 500,  type: 'invest',  color: '#f59e0b' },
  { cat: 'Emergency Buffer',       amount: 400,  type: 'invest',  color: '#3b82f6' },
  { cat: 'Flexible',               amount: 1000, type: 'flex',    color: '#818cf8' },
]

export const MONTHLY_INCOME = 7500

export const SAVINGS_DEPLOYMENT = [
  { cat: 'Index Funds/ETFs — DCA $12k/month over 6 months', amount: '$70,000', note: 'S&P 500, Total Market. Compound interest starts now.', color: '#22c55e', pct: 70 },
  { cat: 'Emergency Fund — liquid HYSA',                     amount: '$20,000', note: 'Keep accessible. Target 4-5% interest rate.',             color: '#3b82f6', pct: 20 },
  { cat: 'Startup Budget — reserved',                        amount: '$10,000', note: 'MVP dev tools, hosting, marketing at launch.',             color: '#f59e0b', pct: 10 },
]

export const YEARLY_FINANCE_TARGETS = [
  { l: 'Net worth',       from: '$100k',  to: '$148k+',      c: '#22c55e' },
  { l: 'Monthly invest',  from: '$0',     to: '$2,000/mo',   c: '#f59e0b' },
  { l: 'Startup fund',    from: '$0',     to: '$6k saved',   c: '#f97316' },
  { l: 'Savings rate',    from: '—',      to: '52%+ income', c: '#818cf8' },
]

// ─── HEALTH FLAGS ─────────────────────────────────────────────────────────────
export const HEALTH_FLAGS = [
  { flag: '⚠️ Soy sauce in lunch',          severity: 'medium', action: 'Swap to coconut aminos — same taste, no soy/gluten. Critical for gut inflammation.' },
  { flag: '💊 Levosulpiride side effects',   severity: 'high',   action: 'Levosulpiride raises prolactin → suppresses testosterone + libido. Symptom timeline matches Feb start. Raise this specifically with your PCP.' },
  { flag: '🩸 B12 at 327 — suboptimal',      severity: 'medium', action: 'Optimal is 500-900 for energy + neurological function. With gut motility issues, oral absorption is impaired. Ask for sublingual methylcobalamin 1000mcg.' },
  { flag: '🧪 Ferritin never tested',        severity: 'high',   action: 'Fatigue + brain fog + dizziness = classic iron deficiency pattern even with normal CBC. This is urgent — request ferritin + full iron panel.' },
  { flag: '🏋️ Workouts during flare-ups',   severity: 'high',   action: 'On days with brain fog, dizziness, extreme fatigue: NO GYM. Gentle 20-30 min walk only. Pushing through worsens gut inflammation.' },
  { flag: '🥗 Calories during illness',      severity: 'medium', action: 'On bad days: eat 1800-2000 kcal. Underfeeding while exhausted deepens fatigue and slows gut healing.' },
]

export const PCP_BULLETS = [
  'H. pylori treated Aug 2025 · Post-treatment gut motility disorder diagnosed',
  'On Rifaximin 400mg + Prucalopride 1mg + Sompraz-L (Esomeprazole 40mg + Levosulpiride 75mg) from mid-Feb 2026',
  'Symptoms: whole-body exhaustion, brain fog, dizziness, bloating, constipation, decreased libido since Feb 2026',
  'Request: Ferritin + full iron panel · Prolactin + testosterone · Repeat CRP + CBC',
  'Request: Referral to GI specialist + CECT Enterography (advised by Dr. Raj Vigna Venugopal, Manipal Hospital)',
  'Concern: Levosulpiride raises prolactin → may be suppressing testosterone + causing libido issues',
]

// ─── SCHEDULE ────────────────────────────────────────────────────────────────
export const WEEKDAY_SCHEDULE = [
  { time: '5:30', task: 'Wake + Warm Lemon Water', icon: '💧', note: 'Gut motility starter. Non-negotiable.', dur: '10m', anchor: false },
  { time: '5:40', task: 'SAVERS Routine', icon: '🧘', note: 'Silence → Affirmations → Visualize → Read → Scribe', dur: '25m', anchor: false },
  { time: '6:05', task: 'DSA — Interview Coding', icon: '💻', note: '15min re-solve old problem → 105min new problems → 30min editorial + pattern journal', dur: '2.5h', anchor: true },
  { time: '8:35', task: 'Workout', icon: '💪', note: 'Push / Pull / Legs / Boxing / Full Body. Skip if brain fog or dizziness.', dur: '45m', anchor: false },
  { time: '9:20', task: 'Breakfast + Food Log', icon: '🥣', note: 'Whey + oats + hemp seeds. Log everything.', dur: '20m', anchor: false },
  { time: '10:00', task: 'Work begins', icon: '💼', note: 'Business case study on lunch break.', dur: '—', anchor: false },
  { time: 'Evening', task: 'Skin + Hair-care + Reading', icon: '✨', note: 'Wind-down. 20min philosophy/self-dev reading.', dur: '30m', anchor: false },
  { time: '9:30pm', task: 'Chia pudding + Pre-bed', icon: '🌙', note: 'Gut fiber. Sleep by 10:30pm.', dur: '10m', anchor: false },
]

export const SAT_SCHEDULE = [
  { time: 'Morning', task: 'Walk or Hike', icon: '🥾', note: '60-90 min outdoors. ~400 kcal burn.', dur: '90m' },
  { time: 'Midday', task: 'Vegan Café Lunch', icon: '🌿', note: 'Treat yourself. Nourishing and joyful.', dur: '60m' },
  { time: 'Afternoon', task: 'Photography / Reading / Social', icon: '📸', note: 'Creative time. No agenda. Recharge.', dur: 'Free' },
  { time: 'Evening', task: 'Skin + Hair Routine', icon: '✨', note: 'Same wind-down ritual.', dur: '20m' },
]

export const SUN_SCHEDULE = [
  { time: 'Morning', task: 'Meal Prep', icon: '🥦', note: 'Prep all 5 lunches. Batch-cook lentil soup add-ins.', dur: '2-3h' },
  { time: 'Afternoon', task: 'House Cleaning + Laundry', icon: '🧺', note: 'Clean environment = clear mind.', dur: '2h' },
  { time: 'Evening', task: 'Weekly Review', icon: '📊', note: 'Review DSA progress, habits, plan next week\'s topics + job apps.', dur: '45m' },
  { time: 'Evening', task: 'Startup Work Session', icon: '🚀', note: '3-5 hrs/week on current milestone.', dur: '2h' },
]
