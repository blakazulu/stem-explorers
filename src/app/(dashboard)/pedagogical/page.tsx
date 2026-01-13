"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { UnitTree } from "@/components/pedagogical/UnitTree";
import type { Grade, Unit } from "@/types";

export default function PedagogicalPage() {
  const { session } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(
    session?.user.grade || null
  );
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const isTeacherOrAdmin = session?.user.role === "teacher" || session?.user.role === "admin";

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-xl md:text-2xl font-rubik font-bold">מודל פדגוגי</h1>

      {isTeacherOrAdmin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            בחר שכבה
          </label>
          <GradeSelector selected={selectedGrade} onSelect={setSelectedGrade} />
        </div>
      )}

      {selectedGrade && !selectedUnit && (
        <div>
          <h2 className="text-lg font-rubik font-semibold mb-4">
            יחידות לימוד - כיתה {selectedGrade}
          </h2>
          <UnitTree grade={selectedGrade} onSelectUnit={setSelectedUnit} />
        </div>
      )}

      {selectedUnit && (
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-rubik font-bold">{selectedUnit.name}</h2>
            <button
              onClick={() => setSelectedUnit(null)}
              className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
            >
              חזור לרשימה
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={selectedUnit.introFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-secondary/10 rounded-lg text-center hover:bg-secondary/20 transition-all duration-200 cursor-pointer"
            >
              <span className="font-medium text-secondary">מבוא ליחידה</span>
            </a>
            <a
              href={selectedUnit.unitFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-primary/10 rounded-lg text-center hover:bg-primary/20 transition-all duration-200 cursor-pointer"
            >
              <span className="font-medium text-primary">תוכן היחידה</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
