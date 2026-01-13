"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUnitsByGrade } from "@/lib/services/units";
import { getQuestionsForUnit } from "@/lib/services/questions";
import { submitJournal } from "@/lib/services/journals";
import { JournalWizard } from "@/components/journal/JournalWizard";
import { Button } from "@/components/ui/Button";
import type { Unit, Question, JournalAnswer, Grade } from "@/types";

export default function JournalPage() {
  const { session } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const grade = session?.user.grade as Grade;

  const loadUnits = useCallback(async () => {
    if (!grade) return;
    setLoading(true);
    const data = await getUnitsByGrade(grade);
    setUnits(data);
    setLoading(false);
  }, [grade]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  async function handleSelectUnit(unit: Unit) {
    setSelectedUnit(unit);
    const qs = await getQuestionsForUnit(grade, unit.id);
    setQuestions(qs);
    setShowWizard(true);
  }

  async function handleSubmit(answers: JournalAnswer[]) {
    if (!selectedUnit || !session) return;

    await submitJournal({
      unitId: selectedUnit.id,
      gradeId: grade,
      studentName: session.user.name,
      answers,
    });

    setSubmitted(true);
    setShowWizard(false);
  }

  if (loading) {
    return <div className="text-gray-500">טוען...</div>;
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-rubik font-bold text-success mb-4">
          היומן נשלח בהצלחה!
        </h2>
        <p className="text-gray-600 mb-6">תודה על מילוי יומן החוקר</p>
        <Button onClick={() => setSubmitted(false)}>מלא יומן נוסף</Button>
      </div>
    );
  }

  if (showWizard && selectedUnit) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl md:text-2xl font-rubik font-bold mb-6">
          יומן חוקר - {selectedUnit.name}
        </h1>
        <JournalWizard
          questions={questions}
          onSubmit={handleSubmit}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-xl md:text-2xl font-rubik font-bold">יומן חוקר</h1>
      <p className="text-gray-600">בחר יחידה למילוי יומן חוקר</p>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {units.map((unit) => (
          <button
            key={unit.id}
            onClick={() => handleSelectUnit(unit)}
            className="text-right p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-accent hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <h3 className="font-rubik font-semibold text-lg">{unit.name}</h3>
            <p className="text-sm text-gray-500 mt-1">לחץ למילוי יומן</p>
          </button>
        ))}
      </div>
    </div>
  );
}
