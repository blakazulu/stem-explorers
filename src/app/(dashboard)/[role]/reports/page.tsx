"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { Card } from "@/components/ui/Card";
import { BarChart2 } from "lucide-react";
import type { Grade, UserRole } from "@/types";

export default function ReportsGradeSelectorPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const isParent = session?.user.role === "parent";
  const isTeacher = session?.user.role === "teacher";
  const hasGradeRestriction = (isParent || isTeacher) && session?.user.grade;

  // Parents and teachers with a grade should redirect to their grade
  useEffect(() => {
    if (hasGradeRestriction) {
      router.replace(`/${role}/reports/${session.user.grade}`);
    }
  }, [hasGradeRestriction, session?.user.grade, role, router]);

  function handleGradeSelect(grade: Grade) {
    router.push(`/${role}/reports/${grade}`);
  }

  // Users with grade restriction - will redirect, show nothing
  if (hasGradeRestriction) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-secondary/10 rounded-xl">
          <BarChart2 size={24} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            דוחות
          </h1>
          <p className="text-sm text-gray-500">בחר כיתה לצפייה בדוחות</p>
        </div>
      </div>

      {/* Grade Selector */}
      <Card>
        <GradeSelector selected={null} onSelect={handleGradeSelect} />
      </Card>
    </div>
  );
}
