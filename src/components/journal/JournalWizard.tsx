"use client";

import { useState } from "react";
import { QuestionRenderer } from "./QuestionRenderer";
import { Button } from "@/components/ui/Button";
import type { Question, JournalAnswer } from "@/types";

interface JournalWizardProps {
  questions: Question[];
  onSubmit: (answers: JournalAnswer[]) => Promise<void>;
  onCancel: () => void;
}

export function JournalWizard({ questions, onSubmit, onCancel }: JournalWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const canProceed = answers[currentQuestion?.id] !== undefined;

  const handleNext = async () => {
    if (isLastStep) {
      setSubmitting(true);
      const journalAnswers: JournalAnswer[] = Object.entries(answers).map(
        ([questionId, answer]) => ({ questionId, answer })
      );
      await onSubmit(journalAnswers);
      setSubmitting(false);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else {
      onCancel();
    }
  };

  if (!currentQuestion) {
    return <div>אין שאלות להצגה</div>;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>שאלה {currentStep + 1} מתוך {questions.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-8">
        <QuestionRenderer
          question={currentQuestion}
          value={answers[currentQuestion.id]}
          onChange={(value) =>
            setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
          }
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          {currentStep === 0 ? "ביטול" : "חזור"}
        </Button>
        <Button onClick={handleNext} disabled={!canProceed || submitting}>
          {submitting ? "שולח..." : isLastStep ? "שלח" : "הבא"}
        </Button>
      </div>
    </div>
  );
}
