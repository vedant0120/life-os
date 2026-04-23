import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Sun,
  CheckSquare,
  BarChart3,
  TrendingUp,
  MoreHorizontal,
  Home,
  Wallet,
  Utensils,
  Heart,
  Calendar,
  Users,
  Download,
  LogOut,
  BookText,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../stores/AuthContext'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import Sheet from './ui/Sheet'

interface TabItem {
  label: string
  to: string
  Icon: LucideIcon
  end?: boolean
}

const PRIMARY: readonly TabItem[] = [
  { label: 'Today', to: '/today', Icon: Sun },
  { label: 'Habits', to: '/habits', Icon: CheckSquare },
  { label: 'Trackers', to: '/trackers', Icon: BarChart3 },
  { label: 'Analytics', to: '/analytics', Icon: TrendingUp },
]

const MORE: readonly TabItem[] = [
  { label: 'Dashboard', to: '/', Icon: Home, end: true },
  { label: 'Journal', to: '/journal', Icon: BookText },
  { label: 'Finance', to: '/finance', Icon: Wallet },
  { label: 'Diet', to: '/diet', Icon: Utensils },
  { label: 'Health', to: '/health', Icon: Heart },
  { label: 'Schedule', to: '/schedule', Icon: Calendar },
  { label: 'Accountability', to: '/accountability', Icon: Users },
]

const slotCls = (isActive: boolean) =>
  `flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
    isActive ? 'text-brand' : 'text-muted'
  }`

export default function BottomTabs() {
  const [showMore, setShowMore] = useState(false)
  const { signOut } = useAuth()
  const { canInstall, promptInstall } = useInstallPrompt()

  const closeMore = () => setShowMore(false)

  return (
    <>
      <Sheet open={showMore} onClose={closeMore} title="More">
        <div className="grid grid-cols-3 gap-2">
          {MORE.map(({ label, to, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMore}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 rounded-md text-xs font-medium ${
                  isActive ? 'bg-brand/10 text-brand' : 'text-muted hover:text-text'
                }`
              }
            >
              <Icon size={20} aria-hidden />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
          {canInstall && (
            <button
              type="button"
              onClick={() => {
                void promptInstall()
                closeMore()
              }}
              className="w-full h-10 px-3 rounded-md text-sm font-medium text-muted hover:text-text hover:bg-surface-2 flex items-center gap-3"
            >
              <Download size={18} aria-hidden />
              <span>Install app</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              void signOut()
              closeMore()
            }}
            className="w-full h-10 px-3 rounded-md text-sm font-medium text-muted hover:text-text hover:bg-surface-2 flex items-center gap-3"
          >
            <LogOut size={18} aria-hidden />
            <span>Sign out</span>
          </button>
        </div>
      </Sheet>

      <nav className="lg:hidden fixed inset-x-0 bottom-0 h-14 bg-surface border-t border-border flex items-stretch pb-[env(safe-area-inset-bottom)] z-40">
        {PRIMARY.map(({ label, to, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => slotCls(isActive)}>
            <Icon size={20} aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className={slotCls(showMore)}
          aria-expanded={showMore}
        >
          <MoreHorizontal size={20} aria-hidden />
          <span>More</span>
        </button>
      </nav>
    </>
  )
}
