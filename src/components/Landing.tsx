export default function Landing({
  onSignup,
  onLogin,
}: {
  onSignup: () => void
  onLogin: () => void
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#e8e6e1',
        fontFamily: 'Georgia, serif',
      }}
    >
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .hero-fade { animation: fadeUp 0.6s ease both; }
        .hero-fade-2 { animation: fadeUp 0.6s 0.15s ease both; }
        .hero-fade-3 { animation: fadeUp 0.6s 0.3s ease both; }
        .feature-card { background:#13131a; border:1px solid #1e1e2e; border-radius:12px; padding:20px; transition:border-color 0.2s; }
        .feature-card:hover { border-color:#3b82f644; }
        .cta-btn { cursor:pointer; border:none; border-radius:8px; font-family:inherit; transition:all 0.15s; font-size:14px; padding:12px 28px; font-weight:600; }
        .cta-btn:hover { filter:brightness(1.1); transform:translateY(-2px); }
        .cta-btn-secondary { background:transparent; border:1px solid #2a2a4a; color:#818cf8; cursor:pointer; border-radius:8px; font-family:inherit; font-size:13px; padding:10px 20px; transition:all 0.15s; }
        .cta-btn-secondary:hover { background:#1a1a3a; }
      `}</style>

      {/* Nav */}
      <div style={{ borderBottom: '1px solid #1a1a2a', padding: '0 24px' }}>
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'linear-gradient(135deg,#3b82f6,#818cf8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              ◈
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>LIFE OS</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="cta-btn-secondary" onClick={onLogin}>
              Log in
            </button>
            <button
              className="cta-btn"
              onClick={onSignup}
              style={{ background: '#3b82f6', color: '#fff' }}
            >
              Get started free
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div
        style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}
      >
        <div
          className="hero-fade"
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: 20,
            background: '#1a1a3a',
            border: '1px solid #2a2a5a',
            fontSize: 11,
            color: '#818cf8',
            letterSpacing: 1,
            marginBottom: 24,
          }}
        >
          FREE DURING BETA
        </div>
        <h1
          className="hero-fade-2"
          style={{
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: 20,
            color: '#e8e6e1',
            letterSpacing: -1,
          }}
        >
          Your personal
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg,#3b82f6,#818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            operating system
          </span>
        </h1>
        <p
          className="hero-fade-3"
          style={{
            fontSize: 16,
            color: '#888',
            maxWidth: 560,
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}
        >
          Your personal OS. Habits, goals, and accountability — all in one place. Track what
          matters, build consistency, and stay honest with someone who cares.
        </p>
        <div
          className="hero-fade-3"
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <button
            className="cta-btn"
            onClick={onSignup}
            style={{
              background: 'linear-gradient(135deg,#3b82f6,#818cf8)',
              color: '#fff',
              fontSize: 15,
              padding: '14px 36px',
            }}
          >
            Start for free →
          </button>
          <button
            className="cta-btn-secondary"
            onClick={onLogin}
            style={{ fontSize: 14, padding: '14px 24px' }}
          >
            I have an account
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#444', marginTop: 14 }}>
          No credit card required · Free forever on basic plan
        </p>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              fontSize: 11,
              color: '#444',
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Everything in one place
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>Built for people serious about growth</div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 16,
            marginBottom: 16,
          }}
        >
          {[
            {
              icon: '💻',
              title: 'Interview Prep',
              desc: 'Track your study roadmap with built-in revision. Works for interview prep, certifications, or any long-horizon study plan.',
              color: '#3b82f6',
            },
            {
              icon: '🤝',
              title: 'Accountability Partner',
              desc: 'Link with someone who matters. See their habits update in real time. Send fire 🔥 on wins, nudge 👀 on misses. Compete on streaks.',
              color: '#22c55e',
            },
            {
              icon: '🚀',
              title: 'Startup Milestone Tracker',
              desc: 'From idea to launch in 6 months. Track validation, build, beta, and launch milestones. Never lose sight of where you are.',
              color: '#f59e0b',
            },
            {
              icon: '💪',
              title: 'Fitness & Weight Tracking',
              desc: 'Log weight, calories, workouts. Milestone-based goals. Calorie targets calculated for your specific body composition goal.',
              color: '#f97316',
            },
            {
              icon: '💰',
              title: 'Personal Finance Planner',
              desc: "Monthly budget breakdown, investment tracking, savings rate. Know exactly where every dollar goes and where you're heading.",
              color: '#a855f7',
            },
            {
              icon: '🧘',
              title: 'Morning Routine & Schedule',
              desc: 'Design a morning routine that sticks. Block out deep work, workouts, and wind-down rituals — structured into a sustainable daily system.',
              color: '#14b8a6',
            },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: f.color + '22',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  marginBottom: 14,
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e8e6e1', marginBottom: 8 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div
        style={{
          borderTop: '1px solid #1a1a2a',
          borderBottom: '1px solid #1a1a2a',
          padding: '64px 24px',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              fontSize: 11,
              color: '#444',
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Setup in 5 minutes
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 40 }}>How it works</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
            {[
              {
                step: '01',
                title: 'Set your goals',
                desc: "Tell us what you're working toward — career switch, fitness, startup, finance. We build your system.",
              },
              {
                step: '02',
                title: 'Build your habits',
                desc: 'Choose from templates or create your own. Your daily non-negotiables, organised by priority.',
              },
              {
                step: '03',
                title: 'Link your partner',
                desc: "Invite someone to keep you accountable. Watch each other's progress live. React, message, compete.",
              },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#2a2a4a', marginBottom: 10 }}>
                  {s.step}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e6e1', marginBottom: 8 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              fontSize: 11,
              color: '#444',
              letterSpacing: 3,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Simple pricing
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>Free to start, Pro when you're ready</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            {
              name: 'Free',
              price: '$0',
              period: 'forever',
              color: '#818cf8',
              features: [
                'Up to 10 habits',
                'DSA roadmap tracker',
                'Startup milestone tracker',
                'Basic analytics',
                '1 accountability partner',
              ],
              cta: 'Get started',
              primary: false,
            },
            {
              name: 'Pro',
              price: '$7',
              period: 'per month',
              color: '#3b82f6',
              features: [
                'Unlimited habits',
                'Everything in Free',
                'AI Coach insights',
                'Finance planner',
                'Advanced analytics',
                'Priority support',
              ],
              cta: 'Start Pro free',
              primary: true,
            },
          ].map((p, i) => (
            <div
              key={i}
              style={{
                background: p.primary ? 'linear-gradient(135deg,#0a1428,#0f1a38)' : '#13131a',
                border: '1px solid ' + (p.primary ? '#3b82f644' : '#1e1e2e'),
                borderRadius: 14,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: p.color, marginBottom: 12 }}>
                {p.name}
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#e8e6e1', marginBottom: 2 }}>
                {p.price}
              </div>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 20 }}>{p.period}</div>
              <div style={{ marginBottom: 24 }}>
                {p.features.map((f, j) => (
                  <div
                    key={j}
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginBottom: 8,
                      fontSize: 12,
                      color: '#888',
                    }}
                  >
                    <span style={{ color: p.color }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <button
                className="cta-btn"
                onClick={onSignup}
                style={{
                  background: p.primary ? '#3b82f6' : '#1a1a2a',
                  color: p.primary ? '#fff' : '#818cf8',
                  border: p.primary ? 'none' : '1px solid #2a2a4a',
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                {p.cta} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ borderTop: '1px solid #1a1a2a', padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
            Build the life you planned for.
          </div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 28, lineHeight: 1.7 }}>
            Join people who are serious about their goals, consistent with their habits, and
            accountable to someone who matters.
          </div>
          <button
            className="cta-btn"
            onClick={onSignup}
            style={{
              background: 'linear-gradient(135deg,#3b82f6,#818cf8)',
              color: '#fff',
              fontSize: 15,
              padding: '14px 40px',
            }}
          >
            Start building today →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #1a1a2a', padding: '20px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#333' }}>
          © 2025 Life OS · Built for people serious about growth
        </div>
      </div>
    </div>
  )
}
