"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUnit } from "@/lib/services/units";
import { getQuestionsForUnit } from "@/lib/services/questions";
import { submitJournal } from "@/lib/services/journals";
import { JournalWizard } from "@/components/journal/JournalWizard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  PenTool,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  X,
} from "lucide-react";
import type { Unit, Question, JournalAnswer, Grade, UserRole } from "@/types";

export default function JournalWizardPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const unitId = params.unitId as string;
  const grade = session?.user.grade as Grade;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load unit and questions
  useEffect(() => {
    if (!grade) {
      router.replace(`/${role}/journal`);
      return;
    }

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const unitData = await getUnit(unitId);
        if (!unitData || unitData.gradeId !== grade) {
          router.replace(`/${role}/journal`);
          return;
        }
        setUnit(unitData);

        const qs = await getQuestionsForUnit(grade, unitId);
        setQuestions(qs);
      } catch {
        setError("שגיאה בטעינת השאלות. נסה שוב מאוחר יותר.");
      }
      setLoading(false);
    }

    loadData();
  }, [grade, unitId, role, router]);

  async function handleSubmit(answers: JournalAnswer[]) {
    if (!unit || !session) return;

    setSubmitting(true);
    setError(null);
    try {
      await submitJournal({
        unitId: unit.id,
        gradeId: grade,
        studentName: session.user.name,
        answers,
      });
      setSubmitted(true);
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
          <Link href={`/${role}/journal`}>
            <Button rightIcon={PenTool}>מלא יומן נוסף</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-role-student/10 rounded-lg">
              <PenTool size={20} className="text-role-student" />
            </div>
            <h1 className="text-lg font-rubik font-bold text-foreground">
              טוען יומן חוקר...
            </h1>
          </div>
        </Card>
        <Card className="text-center py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-surface-2 rounded w-48 mx-auto mb-3"></div>
            <div className="h-3 bg-surface-2 rounded w-32 mx-auto"></div>
          </div>
          <p className="text-gray-500 mt-4">טוען שאלות...</p>
        </Card>
      </div>
    );
  }

  if (!unit) {
    return null;
  }

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
              יומן חוקר - {unit.name}
            </h1>
          </div>
          <Link
            href={`/${role}/journal`}
            className="flex items-center gap-2 text-gray-500 hover:text-foreground cursor-pointer transition-colors"
          >
            <ArrowRight size={18} />
            <span className="text-sm">חזור</span>
          </Link>
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

      {questions.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">אין שאלות ליחידה זו</p>
          <Link href={`/${role}/journal`}>
            <Button variant="ghost" className="mt-4">
              חזור לבחירת יחידה
            </Button>
          </Link>
        </Card>
      ) : (
        <JournalWizard
          questions={questions}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/${role}/journal`)}
        />
      )}
    </div>
  );
}
