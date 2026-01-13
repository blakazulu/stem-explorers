import { LucideIcon } from "lucide-react";
import {
  // STEM themed icons
  Atom,
  Lightbulb,
  Cog,
  FlaskConical,
  Rocket,
  Brain,
  Puzzle,
  Star,
  Sparkles,
  Zap,
  // Navigation icons
  Home,
  BookOpen,
  FileText,
  Image,
  PenTool,
  MessageSquare,
  Settings,
  Key,
  Users,
  BarChart2,
  HelpCircle,
  // Action icons
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  Edit,
  Trash2,
  Upload,
  Download,
  Copy,
  Search,
  Filter,
  // Status icons
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  // User icons
  User,
  UserCircle,
  GraduationCap,
  School,
} from "lucide-react";

// Icon name to component mapping
const iconMap = {
  // STEM themed
  atom: Atom,
  lightbulb: Lightbulb,
  cog: Cog,
  flask: FlaskConical,
  rocket: Rocket,
  brain: Brain,
  puzzle: Puzzle,
  star: Star,
  sparkles: Sparkles,
  zap: Zap,
  // Navigation
  home: Home,
  "book-open": BookOpen,
  "file-text": FileText,
  image: Image,
  "pen-tool": PenTool,
  "message-square": MessageSquare,
  settings: Settings,
  key: Key,
  users: Users,
  "bar-chart": BarChart2,
  "help-circle": HelpCircle,
  // Actions
  plus: Plus,
  x: X,
  check: Check,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  menu: Menu,
  "log-out": LogOut,
  edit: Edit,
  trash: Trash2,
  upload: Upload,
  download: Download,
  copy: Copy,
  search: Search,
  filter: Filter,
  // Status
  "alert-circle": AlertCircle,
  "alert-triangle": AlertTriangle,
  info: Info,
  "check-circle": CheckCircle,
  "x-circle": XCircle,
  loader: Loader2,
  // Users
  user: User,
  "user-circle": UserCircle,
  "graduation-cap": GraduationCap,
  school: School,
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps {
  name: IconName;
  size?: number | "sm" | "md" | "lg" | "xl";
  className?: string;
  strokeWidth?: number;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export function Icon({ name, size = "md", className = "", strokeWidth = 2 }: IconProps) {
  const IconComponent = iconMap[name];
  const pixelSize = typeof size === "number" ? size : sizeMap[size];

  return (
    <IconComponent
      size={pixelSize}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}

// Export individual icons for direct use
export {
  Atom,
  Lightbulb,
  Cog,
  FlaskConical,
  Rocket,
  Brain,
  Puzzle,
  Star,
  Sparkles,
  Zap,
  Home,
  BookOpen,
  FileText,
  Image,
  PenTool,
  MessageSquare,
  Settings,
  Key,
  Users,
  BarChart2,
  HelpCircle,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Menu,
  LogOut,
  Edit,
  Trash2,
  Upload,
  Download,
  Copy,
  Search,
  Filter,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  UserCircle,
  GraduationCap,
  School,
};

// Export icon type for external use
export type { LucideIcon };

// STEM icon set for random selection
export const stemIcons: IconName[] = ["atom", "lightbulb", "cog", "flask", "rocket", "brain", "puzzle", "zap"];

// Get a random STEM icon
export function getRandomStemIcon(): IconName {
  return stemIcons[Math.floor(Math.random() * stemIcons.length)];
}

// Get a deterministic STEM icon based on string hash
export function getStemIconForId(id: string): IconName {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  return stemIcons[Math.abs(hash) % stemIcons.length];
}
