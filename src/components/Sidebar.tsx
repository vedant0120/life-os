import { NavLink } from 'react-router-dom'
import { useAuth } from '../stores/AuthContext'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

interface NavItem {
  label: string
  to: string
  icon: string
  end?: boolean
}

const ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', to: '/', icon: '🏠', end: true },
  { label: 'Today', to: '/today', icon: '☀️' },
  { label: 'Habits', to: '/habits', icon: '✅' },
  { label: 'Trackers', to: '/trackers', icon: '📊' },
  { label: 'Analytics', to: '/analytics', icon: '📈' },
  { label: 'Finance', to: '/finance', icon: '💰' },
  { label: 'Diet', to: '/diet', icon: '🥗' },
  { label: 'Health', to: '/health', icon: '🫀' },
  { label: 'Schedule', to: '/schedule', icon: '🗓️' },
  { label: 'Accountability', to: '/accountability', icon: '🤝' },
]

interface Props {
  className?: string
}

export default function Sidebar({ className = '' }: Props) {
  const { profile, signOut } = useAuth()
  const { canInstall, promptInstall } = useInstallPrompt()

  return (
    <aside
      className={`${className} flex-col md:w-56 xl:w-64 shrink-0 bg-surface border-r border-border h-screen sticky top-0`}
    >
      <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
        <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center text-sm text-white">
          ◈
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold tracking-wider text-text">LIFE OS</div>
          {profile?.name && (
            <div className="text-[10px] text-muted truncate uppercase tracking-wider">
              {profile.name}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-0.5">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-surface-2 text-brand font-medium'
                  : 'text-muted hover:text-text hover:bg-surface-2'
              }`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3 flex flex-col gap-2">
        {canInstall && (
          <button
            onClick={() => void promptInstall()}
            className="w-full px-3 py-2 rounded-lg text-xs bg-surface-2 text-brand hover:bg-brand hover:text-white transition-colors"
          >
            Install app
          </button>
        )}
        <button
          onClick={() => void signOut()}
          className="w-full px-3 py-2 rounded-lg text-xs bg-surface-2 text-muted hover:text-text transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
