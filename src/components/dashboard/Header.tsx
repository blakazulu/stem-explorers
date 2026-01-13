"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button, IconButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  LogOut,
  Menu,
  User,
  GraduationCap,
  School,
  Settings,
} from "lucide-react";
import type { UserRole } from "@/types";
import type { LucideIcon } from "lucide-react";

const roleLabels: Record<UserRole, string> = {
  admin: "מנהל",
  teacher: "מורה",
  parent: "הורה",
  student: "תלמיד",
};

const roleIcons: Record<UserRole, LucideIcon> = {
  admin: Settings,
  teacher: School,
  parent: User,
  student: GraduationCap,
};

const roleColors: Record<UserRole, string> = {
  admin: "bg-role-admin/10 text-role-admin border-role-admin/20",
  teacher: "bg-role-teacher/10 text-role-teacher border-role-teacher/20",
  parent: "bg-role-parent/10 text-role-parent border-role-parent/20",
  student: "bg-role-student/10 text-role-student border-role-student/20",
};

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { session, logout } = useAuth();
  const role = session?.user.role;
  const RoleIcon = role ? roleIcons[role] : User;
  const roleColorClasses = role ? roleColors[role] : "bg-gray-100 text-gray-600";

  return (
    <header className="bg-surface-0 border-b border-surface-2 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
          aria-label="תפריט"
        >
          <Menu size={24} />
        </button>

        {/* User greeting and role badge */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="hidden sm:block">
            <span className="text-gray-500">שלום, </span>
            <span className="font-medium text-foreground">{session?.user.name}</span>
          </div>

          {/* Role badge */}
          {role && (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${roleColorClasses}`}
            >
              <RoleIcon size={14} />
              <span>{roleLabels[role]}</span>
              {session?.user.grade && (
                <span className="opacity-70">כיתה {session.user.grade}</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile: show name */}
          <span className="sm:hidden text-sm font-medium text-foreground truncate max-w-[100px]">
            {session?.user.name}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            leftIcon={LogOut}
            className="hidden sm:inline-flex"
          >
            התנתק
          </Button>

          {/* Mobile logout button */}
          <IconButton
            icon={LogOut}
            label="התנתק"
            variant="ghost"
            size="sm"
            onClick={logout}
            className="sm:hidden"
          />
        </div>
      </div>
    </header>
  );
}
