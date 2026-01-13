"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Icon, IconName } from "@/components/ui/Icon";
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
} from "lucide-react";
import type { UserRole } from "@/types";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "מודל פדגוגי", href: "/pedagogical", roles: ["admin", "teacher", "parent", "student"], icon: BookOpen },
  { label: "תוכניות עבודה", href: "/work-plans", roles: ["admin", "teacher"], icon: FileText },
  { label: "תיעודים", href: "/documentation", roles: ["admin", "teacher", "parent", "student"], icon: Image },
  { label: "יומן חוקר", href: "/journal", roles: ["student"], icon: PenTool },
  { label: "דוחות", href: "/reports", roles: ["admin", "teacher", "parent"], icon: BarChart2 },
  { label: "פורום", href: "/forum", roles: ["admin", "teacher"], icon: MessageSquare },
  { label: "שאלות", href: "/questions", roles: ["admin"], icon: HelpCircle },
  { label: "סיסמאות", href: "/passwords", roles: ["admin"], icon: Key },
  { label: "הגדרות", href: "/admin", roles: ["admin"], icon: Settings },
];

// Role-specific accent colors
const roleColors: Record<UserRole, string> = {
  admin: "text-role-admin",
  teacher: "text-role-teacher",
  parent: "text-role-parent",
  student: "text-role-student",
};

const roleBgColors: Record<UserRole, string> = {
  admin: "bg-role-admin/10",
  teacher: "bg-role-teacher/10",
  parent: "bg-role-parent/10",
  student: "bg-role-student/10",
};

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { session } = useAuth();
  const pathname = usePathname();
  const role = session?.user.role;

  const visibleItems = navItems.filter((item) => role && item.roles.includes(role));

  // Group items for admin view
  const mainItems = visibleItems.filter(
    (item) => !["questions", "passwords", "admin"].includes(item.href.slice(1))
  );
  const adminItems = visibleItems.filter((item) =>
    ["questions", "passwords", "admin"].includes(item.href.slice(1))
  );

  const roleColor = role ? roleColors[role] : "text-primary";
  const roleBgColor = role ? roleBgColors[role] : "bg-primary/10";

  return (
    <aside className="w-64 bg-surface-0 border-l border-surface-2 min-h-screen flex flex-col">
      {/* Logo Header */}
      <div className="p-6 border-b border-surface-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group cursor-pointer"
          onClick={onClose}
        >
          <div className={`p-2 rounded-xl ${roleBgColor} transition-all duration-200 group-hover:scale-105`}>
            <Atom className={`w-6 h-6 ${roleColor}`} />
          </div>
          <div>
            <h2 className="text-lg font-rubik font-bold text-foreground">
              חוקרי STEM
            </h2>
            <p className="text-xs text-gray-400">מרחב למידה</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {/* Main Navigation Items */}
        <ul className="space-y-1">
          {mainItems.map((item) => {
            const isActive = pathname === item.href;
            const ItemIcon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer relative group ${
                    isActive
                      ? `${roleBgColor} ${roleColor} font-medium`
                      : "text-foreground hover:bg-surface-2"
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span
                      className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full ${roleColor.replace("text-", "bg-")}`}
                    />
                  )}
                  <ItemIcon
                    size={20}
                    className={`shrink-0 transition-transform duration-200 ${
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
            <div className="my-4 border-t border-surface-2" />
            <p className="px-4 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              ניהול
            </p>
            <ul className="space-y-1">
              {adminItems.map((item) => {
                const isActive = pathname === item.href;
                const ItemIcon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer relative group ${
                        isActive
                          ? `${roleBgColor} ${roleColor} font-medium`
                          : "text-foreground hover:bg-surface-2"
                      }`}
                    >
                      {isActive && (
                        <span
                          className={`absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-l-full ${roleColor.replace("text-", "bg-")}`}
                        />
                      )}
                      <ItemIcon
                        size={20}
                        className={`shrink-0 transition-transform duration-200 ${
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
      <div className="p-4 border-t border-surface-2">
        <div className="flex items-center justify-center gap-2 text-gray-300">
          <Icon name="flask" size="sm" />
          <Icon name="lightbulb" size="sm" />
          <Icon name="cog" size="sm" />
          <Icon name="rocket" size="sm" />
        </div>
      </div>
    </aside>
  );
}
