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

// Utility hook for role-specific styling
export function useRoleStyles() {
  const { role } = useTheme();

  const colors = {
    admin: {
      accent: "role-admin",
      bg: "bg-role-admin",
      bgLight: "bg-role-admin/10",
      text: "text-role-admin",
      border: "border-role-admin",
    },
    teacher: {
      accent: "role-teacher",
      bg: "bg-role-teacher",
      bgLight: "bg-role-teacher/10",
      text: "text-role-teacher",
      border: "border-role-teacher",
    },
    parent: {
      accent: "role-parent",
      bg: "bg-role-parent",
      bgLight: "bg-role-parent/10",
      text: "text-role-parent",
      border: "border-role-parent",
    },
    student: {
      accent: "role-student",
      bg: "bg-role-student",
      bgLight: "bg-role-student/10",
      text: "text-role-student",
      border: "border-role-student",
    },
  };

  return role ? colors[role] : colors.teacher; // Default to teacher colors
}

// Check if current user is a student (for special animations/effects)
export function useIsStudent() {
  const { role } = useTheme();
  return role === "student";
}
