"use client";

import { useState, useEffect } from "react";
import { getUnitsByGrade } from "@/lib/services/units";
import { UnitCard } from "./UnitCard";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { AlertCircle, RefreshCw, X, Plus } from "lucide-react";
import type { Unit, Grade } from "@/types";

interface UnitTreeProps {
  grade: Grade;
  onSelectUnit: (unit: Unit) => void;
  onAddUnit?: () => void;
}

export function UnitTree({ grade, onSelectUnit, onAddUnit }: UnitTreeProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadUnits() {
    setLoading(true);
    setError(null);
    try {
      const data = await getUnitsByGrade(grade);
      setUnits(data);
    } catch {
      setError("שגיאה בטעינת יחידות הלימוד");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadUnits();
  }, [grade]);

  if (loading) {
    return <SkeletonGrid count={6} columns={3} />;
  }

  if (error) {
    return (
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
