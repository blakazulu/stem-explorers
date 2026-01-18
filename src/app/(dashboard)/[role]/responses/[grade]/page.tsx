"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useUnitsByGrade } from "@/lib/queries";
import { Card } from "@/components/ui/Card";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClipboardCheck, ChevronRight, BookOpen, ArrowRight } from "lucide-react";
import { Icon, getStemIconForId } from "@/components/ui/Icon";
import type { Grade, Unit, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function ResponsesUnitSelectorPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const isAdmin = session?.user.role === "admin";
  const isTeacher = session?.user.role === "teacher";
  // Only show back button for admins (teachers are restricted to their grade)
  const showBackButton = isAdmin;

  const isValidGrade = VALID_GRADES.includes(grade);

  const { data: units = [], isLoading: loading } = useUnitsByGrade(isValidGrade ? grade : null);

  // Only teachers and admins can access this page
  useEffect(() => {
    if (!isTeacher && !isAdmin) {
      router.replace(`/${role}`);
    }
  }, [isTeacher, isAdmin, role, router]);

  // Validate grade
  useEffect(() => {
    if (!isValidGrade) {
      router.replace(`/${role}/responses`);
    }
  }, [isValidGrade, role, router]);

  function handleUnitSelect(unit: Unit) {
    router.push(`/${role}/responses/${grade}/${unit.id}`);
  }

  if (!isValidGrade || (!isTeacher && !isAdmin)) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Link
            href={`/${role}/responses`}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לבחירת כיתה"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
        )}
        <div className="p-3 bg-primary/10 rounded-xl">
          <ClipboardCheck size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            תגובות תלמידים - כיתה {grade}
          </h1>
          <p className="text-sm text-gray-500">בחר יחידה לצפייה בתגובות</p>
        </div>
      </div>

      {/* Unit Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-primary" />
          <h2 className="text-lg font-rubik font-semibold text-foreground">
            בחר יחידה
          </h2>
        </div>

        {loading ? (
          <SkeletonGrid count={6} columns={3} />
        ) : units.length === 0 ? (
          <EmptyState
            icon="book-open"
            title="אין יחידות"
            description={`לא נמצאו יחידות לכיתה ${grade}`}
          />
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit, index) => {
              const stemIcon = getStemIconForId(unit.id);
              return (
                <button
                  key={unit.id}
                  onClick={() => handleUnitSelect(unit)}
                  className={`group text-right p-4 bg-surface-0 rounded-xl border-2 border-surface-2 hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer animate-slide-up stagger-${Math.min(index + 1, 6)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-200">
                      <Icon name={stemIcon} size="md" className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-rubik font-semibold text-foreground group-hover:text-primary transition-colors">
                        {unit.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">לחץ לצפייה בתגובות</p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:text-primary group-hover:-translate-x-1 transition-all duration-200"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
