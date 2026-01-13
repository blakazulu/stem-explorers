"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { UnitTreeView } from "@/components/pedagogical/UnitTreeView";
import { Lightbulb, ArrowRight } from "lucide-react";
import type { Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function PedagogicalGradePage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const isAdmin = session?.user.role === "admin";
  const isTeacherOrAdmin =
    session?.user.role === "teacher" || session?.user.role === "admin";
  const showBackButton = isAdmin;

  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/pedagogical`);
    }
  }, [grade, role, router]);

  if (!VALID_GRADES.includes(grade)) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Link
            href={`/${role}/pedagogical`}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לבחירת כיתה"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
        )}
        <div className="p-3 bg-accent/10 rounded-xl">
          <Lightbulb size={24} className="text-accent" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            מודל פדגוגי - כיתה {grade}
          </h1>
          <p className="text-sm text-gray-500">מסע הלמידה שלנו ביחידות השונות</p>
        </div>
      </div>

      {/* Tree View */}
      <UnitTreeView
        grade={grade}
        role={role}
        onAddUnit={
          isTeacherOrAdmin
            ? () => router.push(`/${role}/work-plans/${encodeURIComponent(grade)}/new`)
            : undefined
        }
      />
    </div>
  );
}
