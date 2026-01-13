"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUnitsByGrade } from "@/lib/services/units";
import { Card } from "@/components/ui/Card";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BarChart2, ChevronRight, BookOpen, ArrowRight } from "lucide-react";
import { Icon, getStemIconForId } from "@/components/ui/Icon";
import type { Grade, Unit, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function ReportsUnitSelectorPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user.role === "admin";
  // Only show back button for admins (others are restricted to their grade)
  const showBackButton = isAdmin;

  // Validate grade
  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/reports`);
    }
  }, [grade, role, router]);

  const loadUnits = useCallback(async () => {
    if (!VALID_GRADES.includes(grade)) return;
    setLoading(true);
    try {
      const data = await getUnitsByGrade(grade);
      setUnits(data);
    } catch {
      // Error handled silently
    }
    setLoading(false);
  }, [grade]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  function handleUnitSelect(unit: Unit) {
    router.push(`/${role}/reports/${grade}/${unit.id}`);
  }

  if (!VALID_GRADES.includes(grade)) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Link
            href={`/${role}/reports`}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לבחירת כיתה"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
        )}
        <div className="p-3 bg-secondary/10 rounded-xl">
          <BarChart2 size={24} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            דוחות - כיתה {grade}
          </h1>
          <p className="text-sm text-gray-500">בחר יחידה לצפייה בדוח</p>
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
                  className={`group text-right p-4 bg-surface-0 rounded-xl border-2 border-surface-2 hover:border-secondary hover:shadow-lg transition-all duration-200 cursor-pointer animate-slide-up stagger-${Math.min(index + 1, 6)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-200">
                      <Icon name={stemIcon} size="md" className="text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-rubik font-semibold text-foreground group-hover:text-secondary transition-colors">
                        {unit.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">לחץ לצפייה בדוח</p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-gray-300 group-hover:text-secondary group-hover:-translate-x-1 transition-all duration-200"
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
