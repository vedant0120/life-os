import { supabase } from '../lib/supabase'
import type { Profile, Reaction } from '../types'

interface NavProps<V extends string = string> {
  view: V
  setView: (v: V) => void
  views: readonly V[]
  profile: Profile | null
  partner: Profile | null
  reactions: Reaction[]
}

export default function Nav<V extends string = string>({
  view,
  setView,
  views,
  profile,
  partner,
  reactions,
}: NavProps<V>) {
  const unread = reactions?.length || 0

  return (
    <div
      style={{
        borderBottom: '1px solid #1a1a2a',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        background: '#0a0a0f',
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 860,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 52,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: 'linear-gradient(135deg,#3b82f6,#818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
            }}
          >
            ◈
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: '#e8e6e1' }}>
              LIFE OS
            </div>
            {profile?.name && (
              <div style={{ fontSize: 8, color: '#444', letterSpacing: 1 }}>
                {profile.name.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            flex: 1,
            justifyContent: 'center',
            padding: '0 8px',
          }}
        >
          {views.map((v) => (
            <div
              key={v}
              className={'nav' + (view === v ? ' on' : '')}
              onClick={() => setView(v)}
              style={{ position: 'relative' }}
            >
              {v}
              {v === 'accountability' && unread > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#ef4444',
                  }}
                ></span>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {partner && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 8px',
                borderRadius: 6,
                background: '#1a1a2a',
                border: '1px solid #2a2a3a',
              }}
            >
              <div
                style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }}
              ></div>
              <span style={{ fontSize: 10, color: '#888' }}>
                {partner.name || partner.email?.split('@')[0]}
              </span>
            </div>
          )}
          <button
            className="btn"
            onClick={() => supabase.auth.signOut()}
            style={{
              background: '#1a1a2a',
              color: '#555',
              padding: '4px 10px',
              fontFamily: 'inherit',
              border: '1px solid #2a2a3a',
              fontSize: 11,
            }}
          >
            Out
          </button>
        </div>
      </div>
    </div>
  )
}
