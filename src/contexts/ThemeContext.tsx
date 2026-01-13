"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import type { UserRole } from "@/types";

interface ThemeContextType {
  role: UserRole | null;
  themeClass: string;
}

const ThemeContext = createContext<ThemeContextType>({
  role: null,
  themeClass: "",
});

export function useTheme() {
  return useContext(ThemeContext);
}

const themeClasses: Record<UserRole, string> = {
  admin: "theme-admin",
  teacher: "theme-teacher",
  parent: "theme-parent",
  student: "theme-student",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const role = session?.user.role || null;
  const themeClass = role ? themeClasses[role] : "";

  // Apply theme class to body
  useEffect(() => {
    // Remove all theme classes first
    document.body.classList.remove(
      "theme-admin",
      "theme-teacher",
      "theme-parent",
      "theme-student"
    );

    // Add new theme class
    if (themeClass) {
      document.body.classList.add(themeClass);
    }

    return () => {
      document.body.classList.remove(themeClass);
    };
  }, [themeClass]);

  return (
    <ThemeContext.Provider value={{ role, themeClass }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Role style configuration type
interface RoleStyleConfig {
  // Color classes
  accent: string;
  bg: string;
  bgLight: string;
  text: string;
  border: string;
  // Theme-aware classes (use CSS variables)
  cardClass: string;
  animationClass: string;
  // Semantic tokens
  headerStyle: "dense" | "balanced" | "warm" | "playful";
  iconStyle: "sharp" | "outlined" | "soft" | "filled";
  // Layout hints
  gridCols: string;
  contentWidth: string;
}

// Utility hook for role-specific styling
export function useRoleStyles(): RoleStyleConfig {
  const { role } = useTheme();

  const styles: Record<UserRole, RoleStyleConfig> = {
    admin: {
      // Colors
      accent: "role-admin",
      bg: "bg-role-admin",
      bgLight: "bg-role-admin/10",
      text: "text-role-admin",
      border: "border-role-admin",
      // Theme-aware (uses CSS variables that change per theme)
      cardClass: "rounded-theme shadow-theme",
      animationClass: "duration-theme ease-theme",
      // Semantic
      headerStyle: "dense",
      iconStyle: "sharp",
      // Layout
      gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      contentWidth: "max-w-theme",
    },
    teacher: {
      accent: "role-teacher",
      bg: "bg-role-teacher",
      bgLight: "bg-role-teacher/10",
      text: "text-role-teacher",
      border: "border-role-teacher",
      cardClass: "rounded-theme shadow-theme",
      animationClass: "duration-theme ease-theme",
      headerStyle: "balanced",
      iconStyle: "outlined",
      gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      contentWidth: "max-w-theme",
    },
    parent: {
      accent: "role-parent",
      bg: "bg-role-parent",
      bgLight: "bg-role-parent/10",
      text: "text-role-parent",
      border: "border-role-parent",
      cardClass: "rounded-theme shadow-theme",
      animationClass: "duration-theme ease-theme",
      headerStyle: "warm",
      iconStyle: "soft",
      gridCols: "grid-cols-1 sm:grid-cols-2",
      contentWidth: "max-w-theme",
    },
    student: {
      accent: "role-student",
      bg: "bg-role-student",
      bgLight: "bg-role-student/10",
      text: "text-role-student",
      border: "border-role-student",
      cardClass: "rounded-theme shadow-theme",
      animationClass: "duration-theme ease-theme",
      headerStyle: "playful",
      iconStyle: "filled",
      gridCols: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      contentWidth: "max-w-theme",
    },
  };

  return role ? styles[role] : styles.teacher;
}

// Check if current user is a student (for special animations/effects)
export function useIsStudent() {
  const { role } = useTheme();
  return role === "student";
}
