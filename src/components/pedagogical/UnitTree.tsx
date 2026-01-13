"use client";

import { useState, useEffect } from "react";
import { getUnitsByGrade } from "@/lib/services/units";
import { UnitCard } from "./UnitCard";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Unit, Grade } from "@/types";

interface UnitTreeProps {
  grade: Grade;
  onSelectUnit: (unit: Unit) => void;
}

export function UnitTree({ grade, onSelectUnit }: UnitTreeProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUnits() {
      setLoading(true);
      const data = await getUnitsByGrade(grade);
      setUnits(data);
      setLoading(false);
    }
    loadUnits();
  }, [grade]);

  if (loading) {
    return <SkeletonGrid count={6} columns={3} />;
  }

  if (units.length === 0) {
    return (
      <EmptyState
        icon="book-open"
        title="אין יחידות לימוד"
        description={`עדיין לא נוספו יחידות לימוד לכיתה ${grade}`}
        variant="stem"
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
