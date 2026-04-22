import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../stores/AuthContext'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import Sheet from './Sheet'

interface Command {
  id: string
  label: string
  icon?: string
  action: () => void
}

interface Props {
  open: boolean
  onClose: () => void
}

const TABS: readonly { id: string; label: string; icon: string; to: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', to: '/' },
  { id: 'today', label: 'Today', icon: '☀️', to: '/today' },
  { id: 'habits', label: 'Habits', icon: '✅', to: '/habits' },
  { id: 'trackers', label: 'Trackers', icon: '📊', to: '/trackers' },
  { id: 'analytics', label: 'Analytics', icon: '📈', to: '/analytics' },
  { id: 'finance', label: 'Finance', icon: '💰', to: '/finance' },
  { id: 'diet', label: 'Diet', icon: '🥗', to: '/diet' },
  { id: 'health', label: 'Health', icon: '🫀', to: '/health' },
  { id: 'schedule', label: 'Schedule', icon: '🗓️', to: '/schedule' },
  { id: 'accountability', label: 'Accountability', icon: '🤝', to: '/accountability' },
]

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
      icon: t.icon,
      action: () => navigate(t.to),
    }))
    list.push({
      id: 'sign-out',
      label: 'Sign out',
      icon: '🚪',
      action: () => {
        void signOut()
        navigate('/auth')
      },
    })
    if (canInstall) {
      list.push({
        id: 'install',
        label: 'Install app',
        icon: '⬇️',
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
          className="w-full px-3 py-2 rounded-lg bg-surface-2 border border-border text-sm text-text placeholder:text-muted focus:outline-none focus:border-brand"
        />
        <ul className="mt-3 max-h-80 overflow-y-auto flex flex-col gap-0.5">
          {filtered.length === 0 && <li className="px-3 py-2 text-sm text-muted">No matches</li>}
          {filtered.map((cmd, i) => (
            <li
              key={cmd.id}
              onMouseEnter={() => setSelected(i)}
              onClick={() => run(cmd)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer ${
                i === selected ? 'bg-surface-2 text-text' : 'text-muted'
              }`}
            >
              {cmd.icon && <span className="text-base leading-none">{cmd.icon}</span>}
              <span>{cmd.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </Sheet>
  )
}
