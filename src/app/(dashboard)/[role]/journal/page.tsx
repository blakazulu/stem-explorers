"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveQuestionnaire } from "@/lib/queries";
import { submitJournal } from "@/lib/services/journals";
import { JournalWizard } from "@/components/journal/JournalWizard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToastActions } from "@/components/ui/Toast";
import {
  PenTool,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import type { Question, JournalAnswer, Grade, UserRole } from "@/types";

export default function JournalPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = session?.user.grade as Grade;

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToastActions();

  // Load active questionnaire for this grade
  const {
    data: questionnaire,
    isLoading,
    isError,
    refetch,
  } = useActiveQuestionnaire(grade);

  // Derive questions from questionnaire
  const questions: Question[] = questionnaire?.questions
    ?.sort((a, b) => a.order - b.order)
    .map((eq) => ({
      id: eq.id,
      type: eq.type,
      text: eq.text,
      options: eq.options,
      ratingStyle: eq.ratingStyle,
      target: { grades: [grade], units: [] },
      order: eq.order,
    })) ?? [];

  async function handleSubmit(answers: JournalAnswer[]) {
    if (!questionnaire || !session) return;

    setSubmitting(true);
    try {
      await submitJournal({
        gradeId: grade,
        studentName: session.user.name,
        questionnaireId: questionnaire.id,
        answers,
      });
      setSubmitted(true);
    } catch {
      toast.error("שגיאה", "שגיאה בשליחת היומן");
    }
    setSubmitting(false);
  }

  function handleFillAgain() {
    setSubmitted(false);
  }

  // Students must have a grade
  if (!grade) {
    return (
      <EmptyState
        icon="alert-circle"
        title="לא נמצאה כיתה"
        description="לא משויכת כיתה לחשבון שלך. פנה למנהל המערכת."
      />
    );
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
          <Button onClick={handleFillAgain} rightIcon={PenTool}>
            מלא יומן נוסף
          </Button>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
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

  // Error state
  if (isError) {
    return (
      <div className="max-w-2xl space-y-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-role-student/10 rounded-lg">
              <PenTool size={20} className="text-role-student" />
            </div>
            <h1 className="text-lg font-rubik font-bold text-foreground">
              יומן חוקר
            </h1>
          </div>
        </Card>
        <EmptyState
          icon="alert-triangle"
          title="שגיאה בטעינה"
          description="לא הצלחנו לטעון את השאלות"
          action={
            <Button onClick={() => refetch()} rightIcon={RefreshCw}>
              נסה שוב
            </Button>
          }
        />
      </div>
    );
  }

  // No active questionnaire
  if (!questionnaire || questions.length === 0) {
    return (
      <div className="max-w-2xl space-y-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-role-student/10 rounded-lg">
              <PenTool size={20} className="text-role-student" />
            </div>
            <h1 className="text-lg font-rubik font-bold text-foreground">
              יומן חוקר
            </h1>
          </div>
        </Card>
        <EmptyState
          icon="clipboard-list"
          title="אין שאלון פעיל"
          description="עדיין לא הוגדר שאלון פעיל לכיתה שלך"
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Header */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-role-student/10 rounded-lg">
            <PenTool size={20} className="text-role-student" />
          </div>
          <div>
            <h1 className="text-lg font-rubik font-bold text-foreground">
              יומן חוקר - {questionnaire.name}
            </h1>
            <p className="text-sm text-gray-500">כיתה {grade}</p>
          </div>
        </div>
      </Card>

      <JournalWizard
        questions={questions}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/${role}`)}
      />
    </div>
  );
}
