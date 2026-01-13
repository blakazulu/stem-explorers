"use client";

import { useState, useEffect } from "react";
import { getUnitsByGrade } from "@/lib/services/units";
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
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const toast = useToastActions();

  async function loadUnits() {
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
  }

  useEffect(() => {
    loadUnits();
  }, [grade]);

  if (loading) {
    return <SkeletonGrid count={6} columns={3} />;
  }

  if (loadError) {
    return (
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
