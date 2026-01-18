"use client";

import { useEffect } from "react";
import { useUnitsByGrade } from "@/lib/queries";
import { UnitCard } from "./UnitCard";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useToastActions } from "@/components/ui/Toast";
import { RefreshCw, Plus } from "lucide-react";
import type { Unit, Grade } from "@/types";

interface UnitTreeProps {
  grade: Grade;
  onSelectUnit: (unit: Unit) => void;
  onAddUnit?: () => void;
}

export function UnitTree({ grade, onSelectUnit, onAddUnit }: UnitTreeProps) {
  const toast = useToastActions();
  const { data: units = [], isLoading: loading, error, refetch } = useUnitsByGrade(grade);

  useEffect(() => {
    if (error) {
      toast.error("שגיאה", "שגיאה בטעינת יחידות הלימוד");
    }
  }, [error, toast]);

  if (loading) {
    return <SkeletonGrid count={6} columns={3} />;
  }

  if (error) {
    return (
      <EmptyState
        icon="alert-triangle"
        title="שגיאה בטעינה"
        description="לא הצלחנו לטעון את יחידות הלימוד"
        action={
          <Button onClick={() => refetch()} rightIcon={RefreshCw}>
            נסה שוב
          </Button>
        }
      />
    );
  }

  if (units.length === 0) {
    return (
      <EmptyState
        icon="book-open"
        title="אין יחידות לימוד"
        description={`עדיין לא נוספו יחידות לימוד לכיתה ${grade}`}
        variant="stem"
        action={
          onAddUnit ? (
            <Button onClick={onAddUnit} rightIcon={Plus}>
              הוסף יחידה
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {units.map((unit, index) => (
        <UnitCard
          key={unit.id}
          unit={unit}
          onSelect={onSelectUnit}
          index={index}
        />
      ))}
    </div>
  );
}
