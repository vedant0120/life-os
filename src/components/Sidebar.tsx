import { NavLink } from 'react-router-dom'
import {
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
  BookText,
  CalendarCheck,
  Settings as SettingsIcon,
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
      { label: 'Today', to: '/today', Icon: Sun, end: true },
      { label: 'Schedule', to: '/schedule', Icon: Calendar },
    ],
  },
  {
    label: 'Weekly',
    items: [
      { label: 'Review', to: '/review', Icon: CalendarCheck },
      { label: 'Journal', to: '/journal', Icon: BookText },
    ],
  },
  {
    label: 'Goals',
    items: [
      { label: 'Trackers', to: '/trackers', Icon: BarChart3 },
      { label: 'Habits', to: '/habits', Icon: CheckSquare },
      { label: 'Analytics', to: '/analytics', Icon: TrendingUp },
    ],
  },
  {
    label: 'Life areas',
    items: [
      { label: 'Health', to: '/health', Icon: Heart },
      { label: 'Diet', to: '/diet', Icon: Utensils },
      { label: 'Finance', to: '/finance', Icon: Wallet },
    ],
  },
  {
    label: 'Social',
    items: [{ label: 'Accountability', to: '/accountability', Icon: Users }],
  },
]

const navCls = (isActive: boolean) =>
  [
    'group h-10 px-3 rounded-lg flex items-center gap-3 text-[14px] font-medium transition-colors',
    isActive
      ? 'bg-brand/15 text-brand'
      : 'text-text/80 hover:text-text hover:bg-surface-2',
  ].join(' ')

export default function Sidebar() {
  const { session, profile, signOut } = useAuth()
  const { canInstall, promptInstall } = useInstallPrompt()
  const displayName = profile?.name || session?.email?.split('@')[0] || 'You'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U'

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-surface border-r border-border h-screen sticky top-0 px-4 py-6 gap-5">
      <div className="flex items-center gap-3 px-2">
        <div
          className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand to-brand-strong flex items-center justify-center text-black text-base font-semibold shrink-0"
          aria-hidden
        >
          {initial}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[13px] font-semibold tracking-[0.18em] text-text uppercase leading-none">
            Life OS
          </span>
          <span className="text-[13px] text-muted truncate mt-1">{displayName}</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-5 overflow-y-auto">
        {GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            <div className="px-3 mb-1 text-[12px] font-semibold tracking-[0.14em] uppercase text-muted">
              {group.label}
            </div>
            {group.items.map(({ label, to, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                title={label}
                className={({ isActive }) => navCls(isActive)}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      strokeWidth={2}
                      aria-hidden
                      className={
                        isActive
                          ? 'text-brand shrink-0'
                          : 'text-text/70 group-hover:text-text shrink-0'
                      }
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-border flex flex-col gap-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) => navCls(isActive)}
          title="Settings"
        >
          {({ isActive }) => (
            <>
              <SettingsIcon
                size={18}
                strokeWidth={2}
                aria-hidden
                className={isActive ? 'text-brand shrink-0' : 'text-text/70 shrink-0'}
              />
              <span>Settings</span>
            </>
          )}
        </NavLink>
        {canInstall && (
          <button
            type="button"
            onClick={() => void promptInstall()}
            title="Install app"
            className={navCls(false)}
          >
            <Download size={18} strokeWidth={2} className="shrink-0" aria-hidden />
            <span>Install app</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => void signOut()}
          title="Sign out"
          className={navCls(false)}
        >
          <LogOut size={18} strokeWidth={2} className="shrink-0" aria-hidden />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
