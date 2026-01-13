"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getUnitsByGrade } from "@/lib/services/units";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToastActions } from "@/components/ui/Toast";
import {
  BookOpen,
  PenTool,
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
  const [loadError, setLoadError] = useState(false);
  const toast = useToastActions();

  const loadUnits = useCallback(async () => {
    if (!grade) return;
    setLoading(true);
    setLoadError(false);
    try {
      const data = await getUnitsByGrade(grade);
      setUnits(data);
    } catch {
      setLoadError(true);
      toast.error("שגיאה", "שגיאה בטעינת יחידות הלימוד");
    }
    setLoading(false);
  }, [grade, toast]);

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

      {/* Units Grid */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : loadError ? (
        <EmptyState
          icon="alert-triangle"
          title="שגיאה בטעינה"
          description="לא הצלחנו לטעון את יחידות הלימוד"
          action={
            <Button onClick={loadUnits} rightIcon={RefreshCw}>
              נסה שוב
            </Button>
          }
        />
      ) : units.length === 0 ? (
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
