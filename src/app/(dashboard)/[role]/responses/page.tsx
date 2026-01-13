"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { Card } from "@/components/ui/Card";
import { ClipboardCheck } from "lucide-react";
import type { Grade, UserRole } from "@/types";

export default function ResponsesGradeSelectorPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const isTeacher = session?.user.role === "teacher";
  const isAdmin = session?.user.role === "admin";
  const hasGradeRestriction = isTeacher && session?.user.grade;

  // Only teachers and admins can access this page
  useEffect(() => {
    if (!isTeacher && !isAdmin) {
      router.replace(`/${role}`);
    }
  }, [isTeacher, isAdmin, role, router]);

  // Teachers with a grade should redirect to their grade
  useEffect(() => {
    if (hasGradeRestriction) {
      router.replace(`/${role}/responses/${session.user.grade}`);
    }
  }, [hasGradeRestriction, session?.user.grade, role, router]);

  function handleGradeSelect(grade: Grade) {
    router.push(`/${role}/responses/${grade}`);
  }

  // Users with grade restriction - will redirect, show nothing
  if (hasGradeRestriction || (!isTeacher && !isAdmin)) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <ClipboardCheck size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            תגובות תלמידים
          </h1>
          <p className="text-sm text-gray-500">בחר כיתה לצפייה בתגובות</p>
        </div>
      </div>

      {/* Grade Selector */}
      <Card>
        <GradeSelector selected={null} onSelect={handleGradeSelect} />
      </Card>
    </div>
  );
}
