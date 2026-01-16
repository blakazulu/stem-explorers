"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Icon } from "@/components/ui/Icon";
import type { Grade } from "@/types";
import {
  BookOpen,
  FileText,
  Image,
  PenTool,
  BarChart2,
  MessageSquare,
  HelpCircle,
  Key,
  Settings,
  Atom,
  Shield,
  GraduationCap,
  Heart,
  Rocket,
  ClipboardCheck,
} from "lucide-react";
import type { UserRole } from "@/types";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
  icon: LucideIcon;
}

// Base paths - will be prefixed with role
const navItems: NavItem[] = [
  { label: "מודל פדגוגי ומו\"פ", href: "/pedagogical", roles: ["admin", "teacher", "parent", "student"], icon: BookOpen },
  { label: "משאבי הוראה", href: "/teaching-resources", roles: ["admin", "teacher"], icon: FileText },
  { label: "תיעודים", href: "/documentation", roles: ["admin", "teacher", "parent", "student"], icon: Image },
  { label: "יומן חוקר", href: "/journal", roles: ["student"], icon: PenTool },
  { label: "דוחות", href: "/reports", roles: ["admin", "teacher", "parent"], icon: BarChart2 },
  { label: "תגובות תלמידים", href: "/responses", roles: ["admin", "teacher"], icon: ClipboardCheck },
  { label: "במה אישית", href: "/forum", roles: ["admin", "teacher"], icon: MessageSquare },
  { label: "שאלות", href: "/questions", roles: ["admin"], icon: HelpCircle },
  { label: "סיסמאות", href: "/passwords", roles: ["admin"], icon: Key },
  { label: "הגדרות", href: "/settings", roles: ["admin"], icon: Settings },
];

// ===== ROLE-SPECIFIC SIDEBAR THEMES =====
// Each role gets a distinct visual experience

interface SidebarTheme {
  // Container
  bg: string;
  border: string;
  // Header
  headerBg: string;
  headerBorder: string;
  logoBg: string;
  logoIcon: LucideIcon;
  logoColor: string;
  titleColor: string;
  subtitleColor: string;
  // Navigation
  navItemDefault: string;
  navItemHover: string;
  navItemActive: string;
  navItemActiveText: string;
  indicatorBg: string;
  // Section divider
  dividerColor: string;
  sectionLabelColor: string;
  // Footer
  footerBorder: string;
  footerIconColor: string;
}

const sidebarThemes: Record<UserRole, SidebarTheme> = {
  // Admin: Dark slate command center - professional, efficient
  admin: {
    bg: "bg-slate-900",
    border: "border-slate-800",
    headerBg: "bg-slate-800/50",
    headerBorder: "border-slate-700",
    logoBg: "bg-role-admin/20",
    logoIcon: Shield,
    logoColor: "text-role-admin",
    titleColor: "text-white",
    subtitleColor: "text-slate-400",
    navItemDefault: "text-slate-300",
    navItemHover: "hover:bg-slate-800 hover:text-white",
    navItemActive: "bg-role-admin/20",
    navItemActiveText: "text-role-admin font-medium",
    indicatorBg: "bg-role-admin",
    dividerColor: "border-slate-700",
    sectionLabelColor: "text-slate-500",
    footerBorder: "border-slate-800",
    footerIconColor: "text-slate-600",
  },
  // Teacher: Light blue tint - calm, organized, scholarly
  teacher: {
    bg: "bg-gradient-to-b from-blue-50 to-white",
    border: "border-blue-100",
    headerBg: "bg-white/80",
    headerBorder: "border-blue-100",
    logoBg: "bg-role-teacher/10",
    logoIcon: GraduationCap,
    logoColor: "text-role-teacher",
    titleColor: "text-foreground",
    subtitleColor: "text-gray-400",
    navItemDefault: "text-gray-600",
    navItemHover: "hover:bg-blue-50 hover:text-role-teacher",
    navItemActive: "bg-role-teacher/10",
    navItemActiveText: "text-role-teacher font-medium",
    indicatorBg: "bg-role-teacher",
    dividerColor: "border-blue-100",
    sectionLabelColor: "text-gray-400",
    footerBorder: "border-blue-100",
    footerIconColor: "text-blue-200",
  },
  // Parent: Warm cream/amber - welcoming, family-friendly
  parent: {
    bg: "bg-gradient-to-b from-amber-50/80 to-orange-50/30",
    border: "border-amber-100",
    headerBg: "bg-white/60",
    headerBorder: "border-amber-100",
    logoBg: "bg-role-parent/15",
    logoIcon: Heart,
    logoColor: "text-role-parent",
    titleColor: "text-foreground",
    subtitleColor: "text-amber-600/60",
    navItemDefault: "text-gray-600",
    navItemHover: "hover:bg-amber-100/50 hover:text-role-parent",
    navItemActive: "bg-role-parent/15",
    navItemActiveText: "text-role-parent font-medium",
    indicatorBg: "bg-role-parent",
    dividerColor: "border-amber-100",
    sectionLabelColor: "text-amber-600/50",
    footerBorder: "border-amber-100",
    footerIconColor: "text-amber-200",
  },
  // Student: Emerald playful - fun, engaging, adventurous
  student: {
    bg: "bg-gradient-to-b from-emerald-50 to-teal-50/30",
    border: "border-emerald-200",
    headerBg: "bg-white/70",
    headerBorder: "border-emerald-100",
    logoBg: "bg-role-student/15",
    logoIcon: Rocket,
    logoColor: "text-role-student",
    titleColor: "text-foreground",
    subtitleColor: "text-emerald-600/60",
    navItemDefault: "text-gray-600",
    navItemHover: "hover:bg-emerald-100/50 hover:text-role-student",
    navItemActive: "bg-role-student/20",
    navItemActiveText: "text-role-student font-medium",
    indicatorBg: "bg-role-student",
    dividerColor: "border-emerald-100",
    sectionLabelColor: "text-emerald-600/50",
    footerBorder: "border-emerald-100",
    footerIconColor: "text-emerald-200",
  },
};

// Default theme fallback
const defaultTheme = sidebarThemes.teacher;

interface SidebarProps {
  onClose?: () => void;
}

// Sections that support grade in URL
const GRADE_SECTIONS = [
  "teaching-resources",
  "questions",
  "documentation",
  "pedagogical",
  "reports",
  "responses",
];

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
const STORED_GRADE_KEY = "stem-explorers-selected-grade";
const GRADE_CHANGE_EVENT = "stem-explorers-grade-change";

function getStoredGradeFromStorage(): Grade | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORED_GRADE_KEY);
    if (stored && VALID_GRADES.includes(stored as Grade)) {
      return stored as Grade;
    }
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
  }
  return null;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { session } = useAuth();
  const pathname = usePathname();
  const role = session?.user.role;
  const userAssignedGrade = session?.user.grade || null;
  const [storedGrade, setStoredGrade] = useState<Grade | null>(null);

  // Load stored grade and listen for changes (no polling - use custom event)
  useEffect(() => {
    // Initial load
    setStoredGrade(getStoredGradeFromStorage());

    // Listen for storage changes (from other tabs)
    const handleStorageChange = () => {
      setStoredGrade(getStoredGradeFromStorage());
    };

    // Listen for custom event (from same tab - dispatched by useGradeNavigation)
    const handleGradeChange = () => {
      setStoredGrade(getStoredGradeFromStorage());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(GRADE_CHANGE_EVENT, handleGradeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(GRADE_CHANGE_EVENT, handleGradeChange);
    };
  }, []);

  // Get role-specific theme
  const theme = role ? sidebarThemes[role] : defaultTheme;
  const LogoIcon = theme.logoIcon;

  const visibleItems = navItems.filter((item) => role && item.roles.includes(role));

  // Group items for admin view
  const mainItems = visibleItems.filter(
    (item) => !["questions", "passwords", "settings"].includes(item.href.slice(1))
  );
  const adminItems = visibleItems.filter((item) =>
    ["questions", "passwords", "settings"].includes(item.href.slice(1))
  );

  // Get full href with role prefix, preserving grade for grade-relevant sections
  const getFullHref = (baseHref: string) => {
    const section = baseHref.slice(1); // Remove leading /
    const baseUrl = `/${role}${baseHref}`;

    if (!GRADE_SECTIONS.includes(section)) {
      return baseUrl;
    }

    // Priority: user's assigned grade > stored grade (for admins/teachers without grade)
    // Users with assigned grades should ALWAYS use their grade, not the stored one
    if (userAssignedGrade) {
      return `${baseUrl}/${encodeURIComponent(userAssignedGrade)}`;
    }

    // Only use stored grade for users without assigned grades (admins, teachers without grade)
    if (storedGrade) {
      return `${baseUrl}/${encodeURIComponent(storedGrade)}`;
    }

    return baseUrl;
  };

  // Check if path is active (starts with the full href)
  const isPathActive = (baseHref: string) => {
    const fullHref = `/${role}${baseHref}`;
    return pathname === fullHref || pathname.startsWith(fullHref + "/");
  };

  return (
    <aside className={`w-64 ${theme.bg} border-l ${theme.border} min-h-screen flex flex-col transition-colors duration-theme`}>
      {/* Logo Header */}
      <div className={`p-6 border-b ${theme.headerBorder} ${theme.headerBg}`}>
        <Link
          href={role ? `/${role}` : "/"}
          className="flex items-center gap-3 group cursor-pointer"
          onClick={onClose}
        >
          <div className={`p-2 rounded-theme ${theme.logoBg} transition-all duration-theme group-hover:scale-105`}>
            <LogoIcon className={`w-6 h-6 ${theme.logoColor}`} />
          </div>
          <div>
            <h2 className={`text-lg font-rubik font-bold ${theme.titleColor}`}>
              חוקרי STEM
            </h2>
            <p className={`text-xs ${theme.subtitleColor}`}>מרחב למידה</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto" aria-label="תפריט ראשי">
        {/* Main Navigation Items */}
        <ul className="space-y-1" role="list">
          {mainItems.map((item) => {
            const isActive = isPathActive(item.href);
            const ItemIcon = item.icon;
            const fullHref = getFullHref(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={fullHref}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-theme transition-all duration-theme cursor-pointer relative group ${
                    isActive
                      ? `${theme.navItemActive} ${theme.navItemActiveText}`
                      : `${theme.navItemDefault} ${theme.navItemHover}`
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full ${theme.indicatorBg}`}
                    />
                  )}
                  <ItemIcon
                    aria-hidden="true"
                    size={20}
                    className={`shrink-0 transition-transform duration-theme ${
                      isActive ? "" : "group-hover:scale-110"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Admin Section */}
        {adminItems.length > 0 && (
          <>
            <div className={`my-4 border-t ${theme.dividerColor}`} />
            <p className={`px-4 mb-2 text-xs font-medium ${theme.sectionLabelColor} uppercase tracking-wider`}>
              ניהול
            </p>
            <ul className="space-y-1" role="list">
              {adminItems.map((item) => {
                const isActive = isPathActive(item.href);
                const ItemIcon = item.icon;
                const fullHref = getFullHref(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={fullHref}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-theme transition-all duration-theme cursor-pointer relative group ${
                        isActive
                          ? `${theme.navItemActive} ${theme.navItemActiveText}`
                          : `${theme.navItemDefault} ${theme.navItemHover}`
                      }`}
                    >
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full ${theme.indicatorBg}`}
                        />
                      )}
                      <ItemIcon
                        aria-hidden="true"
                        size={20}
                        className={`shrink-0 transition-transform duration-theme ${
                          isActive ? "" : "group-hover:scale-110"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </nav>

      {/* Footer with STEM decoration */}
      <div className={`p-4 border-t ${theme.footerBorder}`}>
        <div className={`flex items-center justify-center gap-2 ${theme.footerIconColor}`}>
          <Icon name="flask" size="sm" />
          <Icon name="lightbulb" size="sm" />
          <Icon name="cog" size="sm" />
          <Icon name="rocket" size="sm" />
        </div>
      </div>
    </aside>
  );
}
