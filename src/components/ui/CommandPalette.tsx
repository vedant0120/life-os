import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  LogOut,
  Download,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../../stores/AuthContext'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import Sheet from './Sheet'

interface Command {
  id: string
  label: string
  Icon: LucideIcon
  action: () => void
}

const TABS: readonly { id: string; label: string; Icon: LucideIcon; to: string }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: Home, to: '/' },
  { id: 'today', label: 'Today', Icon: Sun, to: '/today' },
  { id: 'habits', label: 'Habits', Icon: CheckSquare, to: '/habits' },
  { id: 'trackers', label: 'Trackers', Icon: BarChart3, to: '/trackers' },
  { id: 'analytics', label: 'Analytics', Icon: TrendingUp, to: '/analytics' },
  { id: 'finance', label: 'Finance', Icon: Wallet, to: '/finance' },
  { id: 'diet', label: 'Diet', Icon: Utensils, to: '/diet' },
  { id: 'health', label: 'Health', Icon: Heart, to: '/health' },
  { id: 'schedule', label: 'Schedule', Icon: Calendar, to: '/schedule' },
  { id: 'accountability', label: 'Accountability', Icon: Users, to: '/accountability' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { canInstall, promptInstall } = useInstallPrompt()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands: Command[] = useMemo(() => {
    const list: Command[] = TABS.map((t) => ({
      id: `nav:${t.id}`,
      label: t.label,
      Icon: t.Icon,
      action: () => navigate(t.to),
    }))
    list.push({
      id: 'sign-out',
      label: 'Sign out',
      Icon: LogOut,
      action: () => {
        void signOut()
        navigate('/auth')
      },
    })
    if (canInstall) {
      list.push({
        id: 'install',
        label: 'Install app',
        Icon: Download,
        action: () => void promptInstall(),
      })
    }
    return list
  }, [navigate, signOut, canInstall, promptInstall])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => c.label.toLowerCase().includes(q))
  }, [commands, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected(0)
      const id = window.setTimeout(() => inputRef.current?.focus(), 0)
      return () => window.clearTimeout(id)
    }
  }, [open])

  useEffect(() => {
    setSelected(0)
  }, [query])

  const run = (cmd: Command) => {
    onClose()
    cmd.action()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => (filtered.length ? (s + 1) % filtered.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => (filtered.length ? (s - 1 + filtered.length) % filtered.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filtered[selected]
      if (cmd) run(cmd)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Quick jump">
      <div onKeyDown={onKeyDown}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type a command…"
          className="w-full px-3 py-2 rounded-md bg-surface-2 border border-border text-sm text-text placeholder:text-muted focus:outline-none focus:border-brand"
        />
        <ul className="mt-3 max-h-80 overflow-y-auto flex flex-col gap-0.5">
          {filtered.length === 0 && <li className="px-3 py-2 text-sm text-muted">No matches</li>}
          {filtered.map((cmd, i) => {
            const { Icon } = cmd
            return (
              <li
                key={cmd.id}
                onMouseEnter={() => setSelected(i)}
                onClick={() => run(cmd)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer ${
                  i === selected ? 'bg-surface-2 text-text' : 'text-muted'
                }`}
              >
                <Icon size={18} aria-hidden />
                <span>{cmd.label}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </Sheet>
  )
}
