import { NavLink } from 'react-router-dom'
import {
  Home,
  Sun,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Wallet,
  Utensils,
  Heart,
  Calendar,
  Users,
  Download,
  LogOut,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../stores/AuthContext'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

interface NavItem {
  label: string
  to: string
  Icon: LucideIcon
  end?: boolean
}

interface NavGroup {
  label: string
  items: readonly NavItem[]
}

const GROUPS: readonly NavGroup[] = [
  {
    label: 'Daily',
    items: [
      { label: 'Dashboard', to: '/', Icon: Home, end: true },
      { label: 'Today', to: '/today', Icon: Sun },
    ],
  },
  {
    label: 'Build',
    items: [
      { label: 'Habits', to: '/habits', Icon: CheckSquare },
      { label: 'Trackers', to: '/trackers', Icon: BarChart3 },
      { label: 'Schedule', to: '/schedule', Icon: Calendar },
    ],
  },
  {
    label: 'Life',
    items: [
      { label: 'Finance', to: '/finance', Icon: Wallet },
      { label: 'Diet', to: '/diet', Icon: Utensils },
      { label: 'Health', to: '/health', Icon: Heart },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', to: '/analytics', Icon: TrendingUp },
      { label: 'Accountability', to: '/accountability', Icon: Users },
    ],
  },
]

const navCls = (isActive: boolean) =>
  [
    'group relative h-9 px-3 rounded-md flex items-center gap-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand/15 text-text'
      : 'text-muted hover:text-text hover:bg-surface-2',
  ].join(' ')

export default function Sidebar() {
  const { session, profile, signOut } = useAuth()
  const { canInstall, promptInstall } = useInstallPrompt()
  const displayName = profile?.name || session?.email?.split('@')[0] || 'You'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U'

  return (
    <aside className="hidden lg:flex flex-col w-60 lg:w-16 xl:w-60 shrink-0 bg-surface border-r border-border h-screen sticky top-0 px-3 xl:px-4 py-5 gap-5">
      <div className="flex items-center gap-3 px-1">
        <div
          className="w-9 h-9 rounded-md bg-gradient-to-br from-brand to-brand-strong flex items-center justify-center text-white text-sm font-semibold shrink-0"
          aria-hidden
        >
          {initial}
        </div>
        <div className="lg:hidden xl:flex flex-col min-w-0">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-muted uppercase leading-none">
            Life OS
          </span>
          <span className="text-sm font-medium text-text truncate mt-1">{displayName}</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-4 overflow-y-auto -mx-1 px-1">
        {GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <div className="hidden xl:block px-3 text-[10px] font-semibold tracking-[0.16em] text-muted/70 uppercase">
              {group.label}
            </div>
            {group.items.map(({ label, to, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={label}
                className={({ isActive }) =>
                  `${navCls(isActive)} lg:justify-center xl:justify-start`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-brand transition-opacity ${
                        isActive ? 'opacity-100' : 'opacity-0'
                      }`}
                      aria-hidden
                    />
                    <Icon
                      size={20}
                      strokeWidth={2}
                      aria-hidden
                      className={isActive ? 'text-brand' : 'text-text/70 group-hover:text-text'}
                    />
                    <span className="lg:hidden xl:inline">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-3 border-t border-border flex flex-col gap-1.5">
        {canInstall && (
          <button
            type="button"
            onClick={() => void promptInstall()}
            title="Install app"
            className={`${navCls(false)} lg:justify-center xl:justify-start`}
          >
            <Download size={20} strokeWidth={2} aria-hidden />
            <span className="lg:hidden xl:inline">Install app</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => void signOut()}
          title="Sign out"
          className={`${navCls(false)} lg:justify-center xl:justify-start`}
        >
          <LogOut size={20} strokeWidth={2} aria-hidden />
          <span className="lg:hidden xl:inline">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
