"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { HeaderGradeSelector } from "@/components/ui/HeaderGradeSelector";
import { RefreshModal } from "@/components/ui/RefreshModal";
import { useGradeNavigation } from "@/hooks/useGradeNavigation";
import {
  LogOut,
  Menu,
  Shield,
  GraduationCap,
  Heart,
  Rocket,
  RefreshCw,
} from "lucide-react";
import type { UserRole } from "@/types";
import type { LucideIcon } from "lucide-react";
import packageJson from "../../../package.json";

const roleLabels: Record<UserRole, string> = {
  admin: "מנהל",
  teacher: "מורה",
  parent: "הורה",
  student: "תלמיד",
};

// ===== ROLE-SPECIFIC HEADER THEMES =====
// Matching sidebar themes for visual consistency

interface HeaderTheme {
  // Container
  bg: string;
  border: string;
  // Text
  greetingColor: string;
  nameColor: string;
  // Badge
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  badgeIcon: LucideIcon;
  // Menu button
  menuBtnHover: string;
  menuBtnText: string;
  // Logout button
  logoutHover: string;
  logoutText: string;
}

const headerThemes: Record<UserRole, HeaderTheme> = {
  // Admin: Dark header matching dark sidebar
  admin: {
    bg: "bg-slate-800",
    border: "border-slate-700",
    greetingColor: "text-slate-400",
    nameColor: "text-white",
    badgeBg: "bg-role-admin/20",
    badgeText: "text-role-admin",
    badgeBorder: "border-role-admin/30",
    badgeIcon: Shield,
    menuBtnHover: "hover:bg-slate-700",
    menuBtnText: "text-slate-300",
    logoutHover: "hover:bg-slate-700 hover:text-white",
    logoutText: "text-slate-300",
  },
  // Teacher: Light blue tint
  teacher: {
    bg: "bg-gradient-to-l from-blue-50/80 to-white",
    border: "border-blue-100",
    greetingColor: "text-gray-500",
    nameColor: "text-foreground",
    badgeBg: "bg-role-teacher/10",
    badgeText: "text-role-teacher",
    badgeBorder: "border-role-teacher/20",
    badgeIcon: GraduationCap,
    menuBtnHover: "hover:bg-blue-100",
    menuBtnText: "text-gray-600",
    logoutHover: "hover:bg-blue-50 hover:text-role-teacher",
    logoutText: "text-gray-600",
  },
  // Parent: Warm amber
  parent: {
    bg: "bg-gradient-to-l from-amber-50/60 to-white",
    border: "border-amber-100",
    greetingColor: "text-gray-500",
    nameColor: "text-foreground",
    badgeBg: "bg-role-parent/15",
    badgeText: "text-role-parent",
    badgeBorder: "border-role-parent/20",
    badgeIcon: Heart,
    menuBtnHover: "hover:bg-amber-100/50",
    menuBtnText: "text-gray-600",
    logoutHover: "hover:bg-amber-50 hover:text-role-parent",
    logoutText: "text-gray-600",
  },
  // Student: Emerald playful
  student: {
    bg: "bg-gradient-to-l from-emerald-50/60 to-white",
    border: "border-emerald-100",
    greetingColor: "text-gray-500",
    nameColor: "text-foreground",
    badgeBg: "bg-role-student/15",
    badgeText: "text-role-student",
    badgeBorder: "border-role-student/20",
    badgeIcon: Rocket,
    menuBtnHover: "hover:bg-emerald-100/50",
    menuBtnText: "text-gray-600",
    logoutHover: "hover:bg-emerald-50 hover:text-role-student",
    logoutText: "text-gray-600",
  },
};

const defaultTheme = headerThemes.teacher;

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { session, logout } = useAuth();
  const router = useRouter();
  const role = session?.user.role;
  const { showGradeSelector, selectedGrade, navigateToGrade } = useGradeNavigation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get role-specific theme
  const theme = role ? headerThemes[role] : defaultTheme;
  const BadgeIcon = theme.badgeIcon;

  // Admin can select any grade; users with assigned grade cannot
  const canSelectGrade = role === "admin" || (role === "teacher" && !session?.user.grade);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
  }, []);

  const handleRefreshComplete = useCallback(() => {
    setIsRefreshing(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    router.push("/");
  }, [logout, router]);

  return (
    <header className={`${theme.bg} border-b ${theme.border} px-4 md:px-6 py-3 transition-colors duration-theme`}>
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className={`md:hidden p-2 rounded-theme ${theme.menuBtnHover} ${theme.menuBtnText} transition-colors duration-theme cursor-pointer`}
          aria-label="תפריט"
        >
          <Menu size={24} />
        </button>

        {/* User greeting and role badge */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="hidden sm:block">
            <span className={theme.greetingColor}>שלום, </span>
            <span className={`font-medium ${theme.nameColor}`}>{session?.user.name}</span>
          </div>

          {/* Role badge */}
          {role && (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
            >
              <BadgeIcon size={14} />
              <span>{roleLabels[role]}</span>
              {/* Show user's assigned grade in badge only when grade selector is NOT shown */}
              {session?.user.grade && !showGradeSelector && (
                <span className="opacity-70">כיתה {session.user.grade}</span>
              )}
            </div>
          )}
        </div>

        {/* Grade selector - shown on grade-relevant pages */}
        {showGradeSelector && (
          <HeaderGradeSelector
            selectedGrade={selectedGrade}
            onSelect={navigateToGrade}
            canSelect={canSelectGrade}
            isAdminTheme={role === "admin"}
          />
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile: show name */}
          <span className={`sm:hidden text-sm font-medium ${theme.nameColor} truncate max-w-[100px]`}>
            {session?.user.name}
          </span>

          {/* Version number - desktop only */}
          <span className={`hidden sm:block text-xs ${role === "admin" ? "text-slate-500" : "text-gray-400"}`}>
            v{packageJson.version}
          </span>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-theme ${theme.logoutText} ${theme.logoutHover} transition-all duration-theme cursor-pointer`}
            aria-label="רענן אפליקציה"
            title="רענן אפליקציה"
          >
            <RefreshCw size={16} className="sm:w-4 sm:h-4 w-5 h-5" />
          </button>

          <button
            onClick={handleLogout}
            className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-theme text-sm font-medium ${theme.logoutText} ${theme.logoutHover} transition-all duration-theme cursor-pointer`}
          >
            <LogOut size={16} />
            התנתק
          </button>

          {/* Mobile logout button */}
          <button
            onClick={handleLogout}
            className={`sm:hidden p-2 rounded-theme ${theme.logoutText} ${theme.logoutHover} transition-all duration-theme cursor-pointer`}
            aria-label="התנתק"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Refresh Modal */}
      <RefreshModal isOpen={isRefreshing} onComplete={handleRefreshComplete} />
    </header>
  );
}
