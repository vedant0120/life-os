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

const ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', to: '/', Icon: Home, end: true },
  { label: 'Today', to: '/today', Icon: Sun },
  { label: 'Habits', to: '/habits', Icon: CheckSquare },
  { label: 'Trackers', to: '/trackers', Icon: BarChart3 },
  { label: 'Analytics', to: '/analytics', Icon: TrendingUp },
  { label: 'Finance', to: '/finance', Icon: Wallet },
  { label: 'Diet', to: '/diet', Icon: Utensils },
  { label: 'Health', to: '/health', Icon: Heart },
  { label: 'Schedule', to: '/schedule', Icon: Calendar },
  { label: 'Accountability', to: '/accountability', Icon: Users },
]

const navCls = (isActive: boolean) =>
  `h-10 px-3 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand/10 text-brand' : 'text-muted hover:text-text hover:bg-surface-2'
  }`

export default function Sidebar() {
  const { signOut } = useAuth()
  const { canInstall, promptInstall } = useInstallPrompt()

  return (
    <aside className="hidden lg:flex flex-col w-60 lg:w-16 xl:w-60 shrink-0 bg-surface border-r border-border h-screen sticky top-0 p-5 gap-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-brand shrink-0" aria-hidden />
        <span className="text-base font-semibold tracking-wider text-text lg:hidden xl:inline">
          LIFE OS
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-2.5">
        {ITEMS.map(({ label, to, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            className={({ isActive }) =>
              `${navCls(isActive)} lg:justify-center xl:justify-start`
            }
          >
            <Icon size={18} aria-hidden />
            <span className="lg:hidden xl:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-border flex flex-col gap-2.5">
        {canInstall && (
          <button
            type="button"
            onClick={() => void promptInstall()}
            title="Install app"
            className={`${navCls(false)} lg:justify-center xl:justify-start`}
          >
            <Download size={18} aria-hidden />
            <span className="lg:hidden xl:inline">Install app</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => void signOut()}
          title="Sign out"
          className={`${navCls(false)} lg:justify-center xl:justify-start`}
        >
          <LogOut size={18} aria-hidden />
          <span className="lg:hidden xl:inline">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
