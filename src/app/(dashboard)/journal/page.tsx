"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUnitsByGrade } from "@/lib/services/units";
import { getQuestionsForUnit } from "@/lib/services/questions";
import { submitJournal } from "@/lib/services/journals";
import { JournalWizard } from "@/components/journal/JournalWizard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BookOpen,
  PenTool,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";
import type { Unit, Question, JournalAnswer, Grade } from "@/types";

export default function JournalPage() {
  const { session } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const grade = session?.user.grade as Grade;

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

  async function handleSelectUnit(unit: Unit) {
    setSelectedUnit(unit);
    setLoadingQuestions(true);
    setError(null);
    try {
      const qs = await getQuestionsForUnit(grade, unit.id);
      setQuestions(qs);
      setShowWizard(true);
    } catch {
      setError("שגיאה בטעינת השאלות. נסה שוב מאוחר יותר.");
      setSelectedUnit(null);
    }
    setLoadingQuestions(false);
  }

  async function handleSubmit(answers: JournalAnswer[]) {
    if (!selectedUnit || !session) return;

    setSubmitting(true);
    setError(null);
    try {
      await submitJournal({
        unitId: selectedUnit.id,
        gradeId: grade,
        studentName: session.user.name,
        answers,
      });
      setSubmitted(true);
      setShowWizard(false);
    } catch {
      setError("שגיאה בשליחת היומן. נסה שוב מאוחר יותר.");
    }
    setSubmitting(false);
  }

  // Success state after submission
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="text-center py-8 animate-scale-in">
          <div className="p-4 bg-success/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h2 className="text-2xl font-rubik font-bold text-success mb-3">
            היומן נשלח בהצלחה!
          </h2>
          <p className="text-gray-600 mb-6">תודה על מילוי יומן החוקר</p>
          <Button onClick={() => setSubmitted(false)} rightIcon={PenTool}>
            מלא יומן נוסף
          </Button>
        </Card>
      </div>
    );
  }

  // Wizard view
  if (showWizard && selectedUnit) {
    return (
      <div className="max-w-2xl space-y-4">
        {/* Header with back button */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-role-student/10 rounded-lg">
                <PenTool size={20} className="text-role-student" />
              </div>
              <h1 className="text-lg font-rubik font-bold text-foreground">
                יומן חוקר - {selectedUnit.name}
              </h1>
            </div>
            <button
              onClick={() => {
                setShowWizard(false);
                setSelectedUnit(null);
              }}
              className="flex items-center gap-2 text-gray-500 hover:text-foreground cursor-pointer transition-colors"
            >
              <ArrowRight size={18} />
              <span className="text-sm">חזור</span>
            </button>
          </div>
        </Card>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-error/10 text-error p-4 rounded-xl animate-slide-up">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
            <button
              onClick={() => setError(null)}
              className="mr-auto p-1 hover:bg-error/20 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {loadingQuestions ? (
          <Card className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-surface-2 rounded w-48 mx-auto mb-3"></div>
              <div className="h-3 bg-surface-2 rounded w-32 mx-auto"></div>
            </div>
            <p className="text-gray-500 mt-4">טוען שאלות...</p>
          </Card>
        ) : (
          <JournalWizard
            questions={questions}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowWizard(false);
              setSelectedUnit(null);
            }}
          />
        )}
      </div>
    );
  }

  // Unit selection view
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
          <p className="text-sm text-gray-500">
            בחר יחידה למילוי יומן חוקר
          </p>
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
              className={`animate-slide-up`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <BookOpen size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-rubik font-semibold text-lg text-foreground">{unit.name}</h3>
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
