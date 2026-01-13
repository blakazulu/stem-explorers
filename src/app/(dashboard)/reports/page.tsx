"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { getUnitsByGrade } from "@/lib/services/units";
import { getReport } from "@/lib/services/reports";
import type { Grade, Unit, Report } from "@/types";

export default function ReportsPage() {
  const { session } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(
    session?.user.grade || null
  );
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);

  const isTeacherOrAdmin = session?.user.role === "teacher" || session?.user.role === "admin";
  const isParent = session?.user.role === "parent";

  useEffect(() => {
    if (selectedGrade) {
      loadUnits();
    }
  }, [selectedGrade]);

  async function loadUnits() {
    const data = await getUnitsByGrade(selectedGrade!);
    setUnits(data);
  }

  async function loadReport(unit: Unit) {
    setSelectedUnit(unit);
    setLoading(true);
    const data = await getReport(unit.id, selectedGrade!);
    setReport(data);
    setLoading(false);
  }

  const reportContent = report
    ? isParent
      ? report.parentContent
      : report.teacherContent
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-rubik font-bold">דוחות</h1>

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
          <h2 className="text-lg font-rubik font-semibold mb-4">בחר יחידה</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => loadReport(unit)}
                className="text-right p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-rubik font-semibold">{unit.name}</h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedUnit && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-rubik font-bold">
              דוח - {selectedUnit.name}
            </h2>
            <button
              onClick={() => {
                setSelectedUnit(null);
                setReport(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              חזור
            </button>
          </div>

          {loading ? (
            <div className="text-gray-500">טוען דוח...</div>
          ) : reportContent ? (
            <div
              className="prose prose-lg max-w-none"
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: reportContent }}
            />
          ) : (
            <p className="text-gray-500">אין דוח זמין ליחידה זו</p>
          )}
        </div>
      )}
    </div>
  );
}
