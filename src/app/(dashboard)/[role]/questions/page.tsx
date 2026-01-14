"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
const STORED_GRADE_KEY = "stem-explorers-selected-grade";

function getStoredGrade(): Grade | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORED_GRADE_KEY);
    if (stored && VALID_GRADES.includes(stored as Grade)) {
      return stored as Grade;
    }
  } catch {
    // localStorage may be unavailable
  }
  return null;
}

export default function QuestionsRedirectPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const urlRole = params.role as UserRole;

  useEffect(() => {
    if (!session) return;

    // Security: Validate URL role matches session role
    if (urlRole !== session.user.role) {
      router.replace(`/${session.user.role}`);
      return;
    }

    // Only admin can access questions management
    if (session.user.role !== "admin") {
      router.replace(`/${session.user.role}`);
      return;
    }

    // Use stored grade or default to א (admin only page)
    const targetGrade = getStoredGrade() || "א";
    router.replace(`/${urlRole}/questions/${encodeURIComponent(targetGrade)}`);
  }, [session, urlRole, router]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-pulse text-gray-400">טוען...</div>
    </div>
  );
}
