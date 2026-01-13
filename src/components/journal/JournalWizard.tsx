"use client";

import { useState, useEffect } from "react";
import { QuestionRenderer } from "./QuestionRenderer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Confetti } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  Sparkles,
  CheckCircle,
  Rocket,
} from "lucide-react";
import type { Question, JournalAnswer } from "@/types";

interface JournalWizardProps {
  questions: Question[];
  onSubmit: (answers: JournalAnswer[]) => Promise<void>;
  onCancel: () => void;
}

function isAnswerValid(answer: string | number | string[] | undefined): boolean {
  if (answer === undefined) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === "string") return answer.trim().length > 0;
  return true; // number (rating) - any number is valid including 0
}

// Encouraging messages for students
const encouragements = [
  "כל הכבוד! ממשיכים הלאה",
  "מצוין! עוד קצת",
  "יופי! אתם עושים עבודה נהדרת",
  "נהדר! המשיכו ככה",
  "איזה יופי! עוד שאלה אחת",
];

export function JournalWizard({ questions, onSubmit, onCancel }: JournalWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementText, setEncouragementText] = useState("");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const canProceed = isAnswerValid(answers[currentQuestion?.id]);
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleNext = async () => {
    if (isLastStep) {
      setSubmitting(true);
      const journalAnswers: JournalAnswer[] = Object.entries(answers).map(
        ([questionId, answer]) => ({ questionId, answer })
      );
      try {
        await onSubmit(journalAnswers);
        setSubmitted(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      } catch (error) {
        // Re-throw so parent component can handle error display
        setSubmitting(false);
        throw error;
      }
      setSubmitting(false);
    } else {
      // Show encouragement
      setEncouragementText(
        encouragements[Math.floor(Math.random() * encouragements.length)]
      );
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 1500);

      // Animate transition
      setSlideDirection("left");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setSlideDirection("right");
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((s) => s - 1);
        setIsAnimating(false);
      }, 200);
    } else {
      onCancel();
    }
  };

  if (!currentQuestion && !submitted) {
    return (
      <Card padding="lg" className="max-w-2xl text-center">
        <Icon name="help-circle" size="xl" className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">אין שאלות להצגה</p>
      </Card>
    );
  }

  // Success state after submission
  if (submitted) {
    return (
      <>
        <Confetti show={showConfetti} />
        <Card padding="lg" className="max-w-2xl text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success/10 mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-2xl font-rubik font-bold text-foreground mb-2">
            כל הכבוד!
          </h2>
          <p className="text-gray-500 mb-6">
            היומן נשלח בהצלחה. המשיכו לחקור ולגלות!
          </p>
          <div className="flex items-center justify-center gap-2 text-role-student">
            <Rocket className="w-5 h-5" />
            <span className="font-medium">אתם חוקרים אמיתיים!</span>
            <Sparkles className="w-5 h-5" />
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Encouragement popup */}
      {showEncouragement && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in">
          <div className="bg-role-student text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <span className="font-medium text-lg">{encouragementText}</span>
          </div>
        </div>
      )}

      <Card padding="none" className="max-w-2xl overflow-hidden">
        {/* Header with progress */}
        <div className="bg-gradient-to-l from-role-student/10 to-primary/10 p-4 md:p-6 border-b border-surface-2">
          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index < currentStep
                    ? "bg-role-student"
                    : index === currentStep
                    ? "bg-primary scale-125"
                    : "bg-surface-3"
                }`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="h-3 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-role-student to-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Animated sparkle at progress tip */}
            {canProceed && (
              <div
                className="absolute top-1/2 -translate-y-1/2 animate-pulse"
                style={{ left: `calc(${progress}% - 8px)` }}
              >
                <Sparkles className="w-4 h-4 text-role-student" />
              </div>
            )}
          </div>

          {/* Step counter */}
          <div className="flex items-center justify-between mt-3 text-sm">
            <span className="text-gray-500">
              שאלה {currentStep + 1} מתוך {questions.length}
            </span>
            <span className="text-primary font-medium">
              {Math.round(progress)}% הושלם
            </span>
          </div>
        </div>

        {/* Question content with slide animation */}
        <div className="p-4 md:p-6 min-h-[200px]">
          <div
            className={`transition-all duration-200 ${
              isAnimating
                ? slideDirection === "left"
                  ? "opacity-0 -translate-x-4"
                  : "opacity-0 translate-x-4"
                : "opacity-100 translate-x-0"
            }`}
          >
            <QuestionRenderer
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(value) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
              }
            />
          </div>
        </div>

        {/* Navigation footer */}
        <div className="p-4 md:p-6 bg-surface-1 border-t border-surface-2">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              leftIcon={currentStep === 0 ? X : ChevronRight}
            >
              {currentStep === 0 ? "ביטול" : "חזרה"}
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed || submitting}
              loading={submitting}
              loadingText="שולח..."
              rightIcon={isLastStep ? Send : ChevronLeft}
              className={isLastStep ? "bg-role-student hover:bg-role-student/90" : ""}
            >
              {isLastStep ? "שליחת היומן" : "הבא"}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
