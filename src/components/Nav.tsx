import { NavLink } from 'react-router-dom'
import { useAuth } from '../stores/AuthContext'
import { useData } from '../stores/DataContext'

// Navigation tab configuration — each entry maps a label (used as the visible
// capitalized tab text) to its route path. `end` forces exact matching for
// the root route so "/today" doesn't also activate "/".
interface NavItem {
  label: string
  to: string
  end?: boolean
}
const NAV_ITEMS: readonly NavItem[] = [
  { label: 'dashboard', to: '/', end: true },
  { label: 'today', to: '/today' },
  { label: 'habits', to: '/habits' },
  { label: 'trackers', to: '/trackers' },
  { label: 'finance', to: '/finance' },
  { label: 'diet', to: '/diet' },
  { label: 'health', to: '/health' },
  { label: 'schedule', to: '/schedule' },
  { label: 'accountability', to: '/accountability' },
  { label: 'analytics', to: '/analytics' },
]

export default function Nav() {
  const { session, profile, signOut } = useAuth()
  const { partner, reactions } = useData()
  // Only unread reactions addressed to me feed the dot badge.
  const unread = reactions.filter((r) => !r.read && r.to_user === session?.user?.id).length

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
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              // NavLink passes { isActive } so we reproduce the prior
              // `view === v ? 'on' : ''` active-class behavior using the
              // same `.nav` / `.nav.on` CSS rules.
              className={({ isActive }) => 'nav' + (isActive ? ' on' : '')}
              style={{ position: 'relative', textDecoration: 'none' }}
            >
              {item.label}
              {item.label === 'accountability' && unread > 0 && (
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
            </NavLink>
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
            onClick={() => signOut()}
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
