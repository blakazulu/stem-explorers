"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Grade, UserRole } from "@/types";

// Sections that support grade selection in header
const GRADE_SECTIONS = [
  "work-plans",
  "questions",
  "documentation",
  "pedagogical",
  "reports",
  "responses",
];

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
const STORED_GRADE_KEY = "stem-explorers-selected-grade";
const GRADE_CHANGE_EVENT = "stem-explorers-grade-change";

// Get stored grade from localStorage with error handling
function getStoredGrade(): Grade | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORED_GRADE_KEY);
    if (stored && VALID_GRADES.includes(stored as Grade)) {
      return stored as Grade;
    }
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded, etc.)
  }
  return null;
}

// Store grade in localStorage and dispatch custom event for same-tab listeners
function storeGrade(grade: Grade) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORED_GRADE_KEY, grade);
    // Dispatch custom event so other components in the same tab can react
    window.dispatchEvent(new CustomEvent(GRADE_CHANGE_EVENT));
  } catch {
    // localStorage may be unavailable
  }
}

export function useGradeNavigation() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();

  const role = params.role as UserRole;
  const isAdmin = session?.user.role === "admin";
  const userAssignedGrade = session?.user.grade || null;

  // Extract section from pathname: /admin/work-plans/א → "work-plans"
  const pathParts = pathname.split("/").filter(Boolean);
  const section = pathParts[1] || null;

  // Check if we're on the main dashboard (no section, just /admin)
  const isMainDashboard = pathParts.length === 1 && pathParts[0] === role;

  // Extract grade if present from URL: /admin/work-plans/א → "א"
  const gradeParam = pathParts[2];
  const decodedGrade = gradeParam ? decodeURIComponent(gradeParam) : null;
  const gradeFromUrl = decodedGrade && VALID_GRADES.includes(decodedGrade as Grade)
    ? (decodedGrade as Grade)
    : null;

  // State for stored grade (used on main dashboard for admins)
  const [storedGrade, setStoredGrade] = useState<Grade | null>(null);

  // Load stored grade on mount
  useEffect(() => {
    setStoredGrade(getStoredGrade());
  }, []);

  // Update stored grade when URL grade changes (only for users without assigned grade)
  useEffect(() => {
    if (gradeFromUrl && !userAssignedGrade) {
      storeGrade(gradeFromUrl);
      setStoredGrade(gradeFromUrl);
    }
  }, [gradeFromUrl, userAssignedGrade]);

  // Selected grade shown in header:
  // - From URL if on a grade section
  // - User's assigned grade if they have one
  // - From storage if on dashboard (admin only)
  const selectedGrade = gradeFromUrl ||
    (isMainDashboard && userAssignedGrade) ||
    (isMainDashboard && isAdmin ? storedGrade : null);

  // Should we show grade selector in header?
  const isGradeSection = section !== null && GRADE_SECTIONS.includes(section);
  const showGradeSelector = isGradeSection || (isMainDashboard && isAdmin);

  // Navigate to a specific grade or store it
  const navigateToGrade = useCallback((grade: Grade) => {
    // Only store for users without assigned grades (admins, teachers without grade)
    if (!userAssignedGrade) {
      storeGrade(grade);
      setStoredGrade(grade);
    }

    // Only navigate if we're on a grade section (not main dashboard)
    if (section && GRADE_SECTIONS.includes(section)) {
      router.push(`/${role}/${section}/${encodeURIComponent(grade)}`);
    }
    // On main dashboard, just store it - no navigation
  }, [section, role, router, userAssignedGrade]);

  return {
    section,
    selectedGrade,
    showGradeSelector,
    navigateToGrade,
    role,
  };
}
