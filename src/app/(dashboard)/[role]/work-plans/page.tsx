"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { Card } from "@/components/ui/Card";
import { FileText } from "lucide-react";
import type { Grade, UserRole } from "@/types";

export default function WorkPlansGradeSelectorPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const isAdmin = session?.user.role === "admin";
  const isTeacher = session?.user.role === "teacher";
  const canManage = isAdmin || isTeacher;

  // Teachers with a grade should redirect to their grade
  useEffect(() => {
    if (isTeacher && session?.user.grade) {
      router.replace(`/${role}/work-plans/${session.user.grade}`);
    }
  }, [isTeacher, session?.user.grade, role, router]);

  function handleGradeSelect(grade: Grade) {
    router.push(`/${role}/work-plans/${grade}`);
  }

  if (!canManage) {
    return null;
  }

  // Teachers with grade - will redirect, show nothing
  if (isTeacher && session?.user.grade) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-teacher/10 rounded-xl">
          <FileText size={24} className="text-role-teacher" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            תוכניות עבודה
          </h1>
          <p className="text-sm text-gray-500">בחר כיתה לניהול יחידות הלימוד</p>
        </div>
      </div>

      {/* Grade Selector */}
      <Card>
        <GradeSelector selected={null} onSelect={handleGradeSelect} />
      </Card>
    </div>
  );
}
