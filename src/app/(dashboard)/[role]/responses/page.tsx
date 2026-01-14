"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
const STORED_GRADE_KEY = "stem-explorers-selected-grade";

function getStoredGrade(): Grade | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORED_GRADE_KEY);
  if (stored && VALID_GRADES.includes(stored as Grade)) {
    return stored as Grade;
  }
  return null;
}

export default function ResponsesRedirectPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const isTeacher = session?.user.role === "teacher";
  const isAdmin = session?.user.role === "admin";

  useEffect(() => {
    if (!session) return;

    // Only teachers and admins can access responses
    if (!isTeacher && !isAdmin) {
      router.replace(`/${role}`);
      return;
    }

    // Priority: user's assigned grade > stored grade > default א
    const targetGrade = session.user.grade || getStoredGrade() || "א";
    router.replace(`/${role}/responses/${encodeURIComponent(targetGrade)}`);
  }, [session, isTeacher, isAdmin, role, router]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-pulse text-gray-400">טוען...</div>
    </div>
  );
}
