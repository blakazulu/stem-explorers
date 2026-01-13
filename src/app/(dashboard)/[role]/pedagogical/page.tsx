"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { Card } from "@/components/ui/Card";
import { Lightbulb } from "lucide-react";
import type { Grade, UserRole } from "@/types";

export default function PedagogicalGradeSelectorPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const isStudent = session?.user.role === "student";
  const isParent = session?.user.role === "parent";

  // Students and parents with a grade should redirect to their grade
  useEffect(() => {
    if ((isStudent || isParent) && session?.user.grade) {
      router.replace(`/${role}/pedagogical/${session.user.grade}`);
    }
  }, [isStudent, isParent, session?.user.grade, role, router]);

  function handleGradeSelect(grade: Grade) {
    router.push(`/${role}/pedagogical/${grade}`);
  }

  // Students/parents with grade - will redirect, show nothing
  if ((isStudent || isParent) && session?.user.grade) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-accent/10 rounded-xl">
          <Lightbulb size={24} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            מודל פדגוגי
          </h1>
          <p className="text-sm text-gray-500">
            בחר כיתה לצפייה בתכני היחידות
          </p>
        </div>
      </div>

      {/* Grade Selector */}
      <Card>
        <GradeSelector selected={null} onSelect={handleGradeSelect} />
      </Card>
    </div>
  );
}
