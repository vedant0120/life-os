import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../stores/AuthContext'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import Sheet from './ui/Sheet'

interface TabItem {
  label: string
  to: string
  icon: string
  end?: boolean
}

const PRIMARY: readonly TabItem[] = [
  { label: 'Today', to: '/today', icon: '☀️' },
  { label: 'Habits', to: '/habits', icon: '✅' },
  { label: 'Trackers', to: '/trackers', icon: '📊' },
  { label: 'Analytics', to: '/analytics', icon: '📈' },
]

const MORE: readonly TabItem[] = [
  { label: 'Dashboard', to: '/', icon: '🏠', end: true },
  { label: 'Finance', to: '/finance', icon: '💰' },
  { label: 'Diet', to: '/diet', icon: '🥗' },
  { label: 'Health', to: '/health', icon: '🫀' },
  { label: 'Schedule', to: '/schedule', icon: '🗓️' },
  { label: 'Accountability', to: '/accountability', icon: '🤝' },
]

interface Props {
  className?: string
}

const tabCls = (isActive: boolean) =>
  `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] ${
    isActive ? 'text-brand' : 'text-muted hover:text-text'
  }`

export default function BottomTabs({ className = '' }: Props) {
  const [showMore, setShowMore] = useState(false)
  const { signOut } = useAuth()
  const { canInstall, promptInstall } = useInstallPrompt()

  const closeMore = () => setShowMore(false)

  return (
    <>
      <Sheet open={showMore} onClose={closeMore} title="More">
        <div className="grid grid-cols-3 gap-1">
          {MORE.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMore}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 rounded-lg text-xs ${
                  isActive ? 'bg-surface-2 text-brand' : 'text-muted hover:text-text'
                }`
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
          {canInstall && (
            <button
              onClick={() => {
                void promptInstall()
                closeMore()
              }}
              className="w-full px-3 py-2 rounded-lg text-xs bg-surface-2 text-brand"
            >
              Install app
            </button>
          )}
          <button
            onClick={() => {
              void signOut()
              closeMore()
            }}
            className="w-full px-3 py-2 rounded-lg text-xs bg-surface-2 text-muted hover:text-text"
          >
            Sign out
          </button>
        </div>
      </Sheet>

      <nav
        className={`${className} fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border flex items-stretch pb-[env(safe-area-inset-bottom)]`}
      >
        {PRIMARY.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => tabCls(isActive)}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={() => setShowMore((v) => !v)}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] ${
            showMore ? 'text-brand' : 'text-muted hover:text-text'
          }`}
          aria-expanded={showMore}
        >
          <span className="text-lg leading-none">⋯</span>
          <span>More</span>
        </button>
      </nav>
    </>
  )
}
