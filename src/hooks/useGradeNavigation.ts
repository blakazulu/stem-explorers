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

// Get stored grade from localStorage
function getStoredGrade(): Grade | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORED_GRADE_KEY);
  if (stored && VALID_GRADES.includes(stored as Grade)) {
    return stored as Grade;
  }
  return null;
}

// Store grade in localStorage
function storeGrade(grade: Grade) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORED_GRADE_KEY, grade);
  }
}

export function useGradeNavigation() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();

  const role = params.role as UserRole;
  const isAdmin = session?.user.role === "admin";

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

  // State for stored grade (used on main dashboard)
  const [storedGrade, setStoredGrade] = useState<Grade | null>(null);

  // Load stored grade on mount
  useEffect(() => {
    setStoredGrade(getStoredGrade());
  }, []);

  // Update stored grade when URL grade changes
  useEffect(() => {
    if (gradeFromUrl) {
      storeGrade(gradeFromUrl);
      setStoredGrade(gradeFromUrl);
    }
  }, [gradeFromUrl]);

  // Selected grade: from URL if on grade section, from storage if on dashboard
  const selectedGrade = gradeFromUrl || (isMainDashboard ? storedGrade : null);

  // Should we show grade selector in header?
  const isGradeSection = section !== null && GRADE_SECTIONS.includes(section);
  const showGradeSelector = isGradeSection || (isMainDashboard && isAdmin);

  // Navigate to a specific grade or store it
  const navigateToGrade = useCallback((grade: Grade) => {
    // Always store the selected grade
    storeGrade(grade);
    setStoredGrade(grade);

    // Only navigate if we're on a grade section (not main dashboard)
    if (section && GRADE_SECTIONS.includes(section)) {
      router.push(`/${role}/${section}/${encodeURIComponent(grade)}`);
    }
    // On main dashboard, just store it - no navigation
  }, [section, role, router]);

  return {
    section,
    selectedGrade,
    storedGrade: storedGrade || gradeFromUrl,
    showGradeSelector,
    navigateToGrade,
    role,
  };
}
