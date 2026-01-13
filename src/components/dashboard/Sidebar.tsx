"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: "מודל פדגוגי", href: "/pedagogical", roles: ["admin", "teacher", "parent", "student"] },
  { label: "תוכניות עבודה", href: "/work-plans", roles: ["admin", "teacher"] },
  { label: "תיעודים", href: "/documentation", roles: ["admin", "teacher", "parent", "student"] },
  { label: "יומן חוקר", href: "/journal", roles: ["student"] },
  { label: "דוחות", href: "/reports", roles: ["admin", "teacher", "parent"] },
  { label: "פורום", href: "/forum", roles: ["admin", "teacher"] },
  { label: "שאלות", href: "/questions", roles: ["admin"] },
  { label: "סיסמאות", href: "/passwords", roles: ["admin"] },
  { label: "הגדרות", href: "/admin", roles: ["admin"] },
];

export function Sidebar() {
  const { session } = useAuth();
  const role = session?.user.role;

  const visibleItems = navItems.filter((item) => role && item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-l border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-rubik font-bold text-primary">חוקרי STEM</h2>
      </div>
      <nav className="px-4">
        <ul className="space-y-1">
          {visibleItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-2 rounded-lg text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
