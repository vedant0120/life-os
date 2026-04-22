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
  MoreHorizontal,
  Settings,
  Command,
  Search,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit3,
  LogOut,
  Download,
  Activity,
  Route,
  LineChart,
  ListTodo,
  NotebookPen,
  Briefcase,
  Dumbbell,
  Brain,
  Sparkles,
  Camera,
  CircleDashed,
  type LucideIcon,
} from 'lucide-react'

// String → lucide component map. Lets Firestore / domain data store icon
// names as plain strings and have components resolve them at render time.
// Unknown names fall back to `CircleDashed` so nothing crashes if the data
// drifts ahead of this registry.
const REGISTRY: Record<string, LucideIcon> = {
  home: Home,
  sun: Sun,
  'check-square': CheckSquare,
  'bar-chart-3': BarChart3,
  'trending-up': TrendingUp,
  wallet: Wallet,
  utensils: Utensils,
  heart: Heart,
  calendar: Calendar,
  users: Users,
  'more-horizontal': MoreHorizontal,
  settings: Settings,
  command: Command,
  search: Search,
  plus: Plus,
  x: X,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'trash-2': Trash2,
  'edit-3': Edit3,
  'log-out': LogOut,
  download: Download,
  activity: Activity,
  route: Route,
  'line-chart': LineChart,
  'list-todo': ListTodo,
  'notebook-pen': NotebookPen,
  briefcase: Briefcase,
  dumbbell: Dumbbell,
  brain: Brain,
  sparkles: Sparkles,
  camera: Camera,
  'circle-dashed': CircleDashed,
}

interface IconProps {
  name: string
  size?: number
  className?: string
  strokeWidth?: number
  'aria-hidden'?: boolean
}

export default function Icon({
  name,
  size = 18,
  className,
  strokeWidth = 2,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  const Comp = REGISTRY[name] ?? CircleDashed
  return <Comp size={size} className={className} strokeWidth={strokeWidth} aria-hidden={ariaHidden} />
}
