import { useState } from 'react'
import { LogRow, calcStats, todayStr } from './shared'
import { getMeta } from '../data/constants'
import { useAuth } from '../stores/AuthContext'
import { useData } from '../stores/DataContext'
import type { HabitStats } from '../types'

export default function Accountability() {
  const { session } = useAuth()
  const {
    partner,
    partnerHabits,
    partnerLogs,
    reactions,
    sendReaction,
    linkPartner,
    habits,
    logs,
  } = useData()
  const [email, setEmail] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const today = todayStr()

  const partnerToday = partnerLogs?.filter((l) => l.d === today) || []
  const myToday = logs?.filter((l) => l.d === today) || []

  const partnerStatsMap: Record<string, HabitStats> = {}
  ;(partnerHabits || []).forEach((h) => {
    partnerStatsMap[h] = calcStats((partnerLogs || []).filter((l) => l.h === h))
  })

  const myStatsMap: Record<string, HabitStats> = {}
  ;(habits || []).forEach((h) => {
    myStatsMap[h] = calcStats((logs || []).filter((l) => l.h === h))
  })

  const partnerDone = (partnerHabits || []).filter((h) =>
    partnerToday.find((l) => l.h === h && l.s === 'success')
  ).length
  const myDone = (habits || []).filter((h) =>
    myToday.find((l) => l.h === h && l.s === 'success')
  ).length

  async function handleLink() {
    if (!email.trim()) return
    setLinking(true)
    setLinkError('')
    const result = await linkPartner(email.trim().toLowerCase())
    if (result.error) setLinkError(result.error)
    else setLinkSuccess(true)
    setLinking(false)
  }

  async function sendMessage() {
    if (!message.trim() || !partner) return
    setSending(true)
    await sendReaction('message', null, message)
    setMessage('')
    setSending(false)
  }

  const incomingReactions = reactions?.filter((r) => r.to_user === session?.userId) || []
  const outgoingReactions = reactions?.filter((r) => r.from_user === session?.userId) || []

  const reactionEmoji: Record<string, string> = {
    fire: '🔥',
    nudge: '👀',
    cheer: '🎉',
    message: '💬',
  }
  const reactionLabel: Record<string, string> = {
    fire: 'Cheered your habit',
    nudge: 'Nudged you on',
    cheer: 'Cheered',
    message: 'Sent a message',
  }

  if (!partner) {
    return (
      <div className="fade">
        <div style={{ marginBottom: 16 }}>
          <div className="st">Accountability Partner</div>
          <div className="pt">Link with your partner</div>
        </div>
        <div className="card" style={{ padding: 20, marginBottom: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🤝</div>
          <div style={{ fontSize: 14, color: '#e8e6e1', marginBottom: 6 }}>
            Connect with your accountability partner
          </div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 20, lineHeight: 1.6 }}>
            Once linked, you can see each other's daily progress in real time, send reactions, and
            stay accountable together.
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className="st" style={{ marginBottom: 5, textAlign: 'left' }}>
              Partner's Email Address
            </div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@email.com"
              onKeyDown={(e) => e.key === 'Enter' && handleLink()}
            />
          </div>
          {linkError && (
            <div
              style={{
                color: '#ef4444',
                fontSize: 11,
                marginBottom: 10,
                padding: '6px 10px',
                background: '#2a1010',
                borderRadius: 6,
              }}
            >
              {linkError}
            </div>
          )}
          {linkSuccess && (
            <div
              style={{
                color: '#22c55e',
                fontSize: 11,
                marginBottom: 10,
                padding: '6px 10px',
                background: '#16301a',
                borderRadius: 6,
              }}
            >
              ✓ Linked! Refresh the page to see your partner's progress.
            </div>
          )}
          <button
            className="btn"
            onClick={handleLink}
            disabled={linking}
            style={{
              background: '#3b82f6',
              color: '#fff',
              padding: '10px',
              width: '100%',
              fontFamily: 'inherit',
              fontSize: 13,
              opacity: linking ? 0.6 : 1,
            }}
          >
            {linking ? 'Linking...' : 'Link Partner'}
          </button>
          <div style={{ fontSize: 10, color: '#444', marginTop: 12 }}>
            Both of you must have accounts. They need to be registered first.
          </div>
        </div>

        <div className="card" style={{ padding: 14 }}>
          <div className="st" style={{ marginBottom: 10 }}>
            How It Works
          </div>
          {[
            {
              icon: '1️⃣',
              t: 'Both create accounts',
              n: 'You and your partner each sign up separately.',
            },
            { icon: '2️⃣', t: 'Link by email', n: "Enter your partner's email above to connect." },
            {
              icon: '3️⃣',
              t: 'See each other in real time',
              n: "Watch each other's habits update live.",
            },
            {
              icon: '4️⃣',
              t: 'React + nudge',
              n: '🔥 fire on wins, 👀 nudge on misses, 💬 send messages.',
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 10,
                marginBottom: 9,
                padding: '8px 10px',
                borderRadius: 7,
                background: '#0f0f18',
                border: '1px solid #1a1a2a',
              }}
            >
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: '#d4d0c8', fontWeight: 500 }}>{s.t}</div>
                <div style={{ fontSize: 9, color: '#555', marginTop: 1 }}>{s.n}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fade">
      <div style={{ marginBottom: 14 }}>
        <div className="st">Accountability</div>
        <div className="pt">You + {partner.name || partner.email?.split('@')[0]}</div>
      </div>

      {/* Head-to-head today */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div
          style={{
            background: '#09111e',
            border: '1px solid #1a2a4a',
            borderRadius: 10,
            padding: 12,
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: '#3b82f6',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 7,
              fontWeight: 700,
            }}
          >
            You
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6' }}>
            {myDone}
            <span style={{ fontSize: 12, color: '#555', fontWeight: 400 }}>
              /{habits?.length || 0}
            </span>
          </div>
          <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>habits done today</div>
        </div>
        <div
          style={{
            background: '#0a1a0a',
            border: '1px solid #1a3a1a',
            borderRadius: 10,
            padding: 12,
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: '#22c55e',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 7,
              fontWeight: 700,
            }}
          >
            {partner.name || 'Partner'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>
            {partnerDone}
            <span style={{ fontSize: 12, color: '#555', fontWeight: 400 }}>
              /{partnerHabits?.length || 0}
            </span>
          </div>
          <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>habits done today</div>
        </div>
      </div>

      {/* Partner's today */}
      <div className="card" style={{ padding: 13, marginBottom: 12 }}>
        <div
          style={{
            fontSize: 9,
            color: '#22c55e',
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: 10,
            fontWeight: 700,
          }}
        >
          {partner.name || 'Partner'}'s Today — React in real time
        </div>
        {(partnerHabits || []).length === 0 && (
          <div style={{ color: '#444', fontSize: 11 }}>Your partner hasn't added habits yet.</div>
        )}
        {(partnerHabits || []).map((h) => {
          const status = partnerToday.find((l) => l.h === h)?.s || null
          return (
            <LogRow
              key={h}
              habit={h}
              todayStatus={status}
              stats={partnerStatsMap[h]}
              showStats={true}
              isAnchor={false}
              isPartner={true}
              onReact={sendReaction}
            />
          )
        })}
      </div>

      {/* Send message */}
      <div className="card" style={{ padding: 13, marginBottom: 12 }}>
        <div className="st" style={{ marginBottom: 9 }}>
          Send a message
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Great job today! Keep going 💪"
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            className="btn"
            onClick={sendMessage}
            disabled={sending}
            style={{
              background: '#3b82f6',
              color: '#fff',
              padding: '8px 14px',
              fontFamily: 'inherit',
              flexShrink: 0,
            }}
          >
            Send
          </button>
        </div>
        <div style={{ display: 'flex', gap: 7, marginTop: 9 }}>
          {(
            [
              { type: 'fire', emoji: '🔥', label: 'Fire!' },
              { type: 'cheer', emoji: '🎉', label: 'Cheer' },
              { type: 'nudge', emoji: '👀', label: 'Nudge' },
            ] as const
          ).map((r) => (
            <button
              key={r.type}
              className="btn"
              onClick={() => sendReaction(r.type, null, '')}
              style={{
                background: '#1a1a2a',
                color: '#888',
                border: '1px solid #2a2a3a',
                padding: '5px 12px',
                fontFamily: 'inherit',
                fontSize: 12,
              }}
            >
              {r.emoji} {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reaction feed */}
      {(incomingReactions.length > 0 || outgoingReactions.length > 0) && (
        <div className="card" style={{ padding: 13 }}>
          <div className="st" style={{ marginBottom: 10 }}>
            Recent Activity
          </div>
          {reactions?.slice(0, 15).map((r, i) => {
            const isIncoming = r.to_user === session?.userId
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 8,
                  marginBottom: 8,
                  padding: '7px 9px',
                  borderRadius: 7,
                  background: isIncoming ? '#0a1408' : '#0a0f1a',
                  border: '1px solid ' + (isIncoming ? '#1a2a18' : '#1a1a2a'),
                }}
              >
                <span style={{ fontSize: 16 }}>{reactionEmoji[r.type] || '💬'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#c4c0d8' }}>
                    <span style={{ color: isIncoming ? '#22c55e' : '#3b82f6', fontWeight: 600 }}>
                      {isIncoming ? partner.name || 'Partner' : 'You'}
                    </span>{' '}
                    {isIncoming ? reactionLabel[r.type] : 'sent'}
                    {r.habit_name ? ` "${r.habit_name}"` : ''}
                  </div>
                  {r.message && (
                    <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{r.message}</div>
                  )}
                  <div style={{ fontSize: 8, color: '#444', marginTop: 2 }}>
                    {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Partner streak comparison — shared habits only */}
      <div className="card" style={{ padding: 13, marginTop: 12 }}>
        <div className="st" style={{ marginBottom: 10 }}>
          Streak Comparison
        </div>
        {(habits || [])
          .filter((h) => (partnerHabits || []).includes(h))
          .map((h) => {
            const myS = myStatsMap[h]?.current || 0
            const partnerS = partnerStatsMap[h]?.current || 0
            const leader = myS > partnerS ? 'you' : partnerS > myS ? 'partner' : 'tied'
            return (
              <div key={h} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <div style={{ fontSize: 10, color: '#c4c0d8' }}>
                    {getMeta(h).icon} {h}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color:
                        leader === 'you' ? '#3b82f6' : leader === 'partner' ? '#22c55e' : '#f59e0b',
                    }}
                  >
                    {leader === 'tied'
                      ? '🤝 tied'
                      : leader === 'you'
                        ? '🏆 you lead'
                        : '👑 partner leads'}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  <div>
                    <div style={{ fontSize: 8, color: '#3b82f6', marginBottom: 2 }}>YOU {myS}d</div>
                    <div className="bar">
                      <div
                        className="fill"
                        style={{
                          width:
                            Math.max(myS, partnerS) > 0
                              ? (myS / Math.max(myS, partnerS)) * 100 + '%'
                              : '0%',
                          background: '#3b82f6',
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 8, color: '#22c55e', marginBottom: 2 }}>
                      PARTNER {partnerS}d
                    </div>
                    <div className="bar">
                      <div
                        className="fill"
                        style={{
                          width:
                            Math.max(myS, partnerS) > 0
                              ? (partnerS / Math.max(myS, partnerS)) * 100 + '%'
                              : '0%',
                          background: '#22c55e',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        {(habits || []).filter((h) => (partnerHabits || []).includes(h)).length === 0 && (
          <div style={{ fontSize: 10, color: '#555' }}>
            No shared habits yet. Comparisons appear when you and your partner track the same
            habits.
          </div>
        )}
      </div>
    </div>
  )
}
