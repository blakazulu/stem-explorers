"use client";

import { useState, useEffect } from "react";
import { getUnitsByGrade } from "@/lib/services/units";
import { UnitCard } from "./UnitCard";
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
    return <div className="text-gray-500">טוען יחידות...</div>;
  }

  if (units.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        אין יחידות לימוד לשכבה זו
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {units.map((unit) => (
        <UnitCard key={unit.id} unit={unit} onSelect={onSelectUnit} />
      ))}
    </div>
  );
}
