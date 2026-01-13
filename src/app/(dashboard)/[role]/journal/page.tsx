"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUnitsByGrade } from "@/lib/services/units";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BookOpen,
  PenTool,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";
import type { Unit, Grade, UserRole } from "@/types";

export default function JournalUnitSelectorPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = session?.user.grade as Grade;

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUnits = useCallback(async () => {
    if (!grade) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUnitsByGrade(grade);
      setUnits(data);
    } catch {
      setError("שגיאה בטעינת יחידות הלימוד. נסה שוב מאוחר יותר.");
    }
    setLoading(false);
  }, [grade]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  function handleSelectUnit(unit: Unit) {
    router.push(`/${role}/journal/${unit.id}`);
  }

  // Students must have a grade
  if (!grade) {
    return (
      <EmptyState
        icon="alert-circle"
        title="לא נמצאה כיתה"
        description="לא משויכת כיתה לחשבון שלך. פנה למנהל המערכת."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-student/10 rounded-xl">
          <PenTool size={24} className="text-role-student" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            יומן חוקר
          </h1>
          <p className="text-sm text-gray-500">בחר יחידה למילוי יומן חוקר</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 bg-error/10 text-error p-4 rounded-xl animate-slide-up">
          <AlertCircle size={20} />
          <span className="text-sm font-medium flex-1">{error}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadUnits}
            rightIcon={RefreshCw}
            className="text-error hover:bg-error/20"
          >
            נסה שוב
          </Button>
          <button
            onClick={() => setError(null)}
            className="p-1 hover:bg-error/20 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Units Grid */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : units.length === 0 && !error ? (
        <EmptyState
          icon="book-open"
          title="אין יחידות זמינות"
          description="עדיין לא נוספו יחידות לימוד לכיתה שלך"
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {units.map((unit, index) => (
            <Card
              key={unit.id}
              interactive
              onClick={() => handleSelectUnit(unit)}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <BookOpen size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-rubik font-semibold text-lg text-foreground">
                    {unit.name}
                  </h3>
                  <p className="text-sm text-gray-500">לחץ למילוי יומן</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
