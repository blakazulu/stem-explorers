"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToastActions } from "@/components/ui/Toast";
import {
  useGlobeMonitorQuestions,
  useCreateGlobeMonitorSubmission,
} from "@/lib/queries";
import { X, Send, Globe } from "lucide-react";
import type { GlobeMonitorQuestion } from "@/types";

interface SubmissionFormModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SubmissionFormModal({
  userId,
  userName,
  onClose,
  onSuccess,
}: SubmissionFormModalProps) {
  const { data: questions = [], isLoading } = useGlobeMonitorQuestions();
  const createSubmission = useCreateGlobeMonitorSubmission();
  const toast = useToastActions();

  const sortedQuestions = useMemo(
    () => [...questions].sort((a, b) => a.order - b.order),
    [questions]
  );

  // Get local date in YYYY-MM-DD format
  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // Get local time in HH:mm format
  const getLocalTimeString = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize default values for date/time fields when questions load
  useEffect(() => {
    if (sortedQuestions.length > 0) {
      const defaults: Record<string, string> = {};
      for (const question of sortedQuestions) {
        if (question.type === "date" && !answers[question.id]) {
          defaults[question.id] = getLocalDateString();
        }
        if (question.type === "time" && !answers[question.id]) {
          defaults[question.id] = getLocalTimeString();
        }
      }
      if (Object.keys(defaults).length > 0) {
        setAnswers((prev) => ({ ...defaults, ...prev }));
      }
    }
  }, [sortedQuestions]);

  const updateAnswer = (questionId: string, value: string | number | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    // Clear error when user types
    if (errors[questionId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const toggleMultiOption = (questionId: string, option: string) => {
    const current = (answers[questionId] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    updateAnswer(questionId, updated);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const question of sortedQuestions) {
      if (question.required) {
        const answer = answers[question.id];
        if (
          answer === undefined ||
          answer === "" ||
          (Array.isArray(answer) && answer.length === 0)
        ) {
          newErrors[question.id] = "שדה חובה";
        }
      }

      // Validate number min/max
      if (question.type === "number" && answers[question.id] !== undefined && answers[question.id] !== "") {
        const num = Number(answers[question.id]);
        if (question.min !== undefined && num < question.min) {
          newErrors[question.id] = `ערך מינימלי: ${question.min}`;
        }
        if (question.max !== undefined && num > question.max) {
          newErrors[question.id] = `ערך מקסימלי: ${question.max}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Build answers object, only including questions that have answers
    const submissionAnswers: Record<string, string | number | string[]> = {};
    for (const question of sortedQuestions) {
      const answer = answers[question.id];
      if (answer !== undefined && answer !== "" && !(Array.isArray(answer) && answer.length === 0)) {
        submissionAnswers[question.id] = answer;
      }
    }

    // Get the date from the date question or use today (local time)
    const dateQuestion = sortedQuestions.find((q) => q.type === "date");
    const submissionDate = dateQuestion && submissionAnswers[dateQuestion.id]
      ? String(submissionAnswers[dateQuestion.id])
      : getLocalDateString();

    try {
      await createSubmission.mutateAsync({
        answers: submissionAnswers,
        submittedBy: userId,
        submittedByName: userName,
        date: submissionDate,
      });
      toast.success("הדיווח נשלח בהצלחה!");
      onSuccess();
      onClose();
    } catch {
      toast.error("שגיאה בשליחת הדיווח");
    }
  };

  const renderField = (question: GlobeMonitorQuestion) => {
    const error = errors[question.id];
    const baseInputClass = error ? "border-error" : "";

    switch (question.type) {
      case "date":
        return (
          <Input
            type="date"
            value={(answers[question.id] as string) || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className={baseInputClass}
          />
        );

      case "time":
        return (
          <Input
            type="time"
            value={(answers[question.id] as string) || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className={baseInputClass}
          />
        );

      case "number":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={answers[question.id] ?? ""}
              onChange={(e) =>
                updateAnswer(
                  question.id,
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              min={question.min}
              max={question.max}
              className={`flex-1 ${baseInputClass}`}
            />
            {question.unit && (
              <span className="text-sm text-gray-500 min-w-[40px]">
                {question.unit}
              </span>
            )}
          </div>
        );

      case "text":
        return (
          <Input
            type="text"
            value={(answers[question.id] as string) || ""}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            className={baseInputClass}
          />
        );

      case "single":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-1 cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => updateAnswer(question.id, option)}
                  className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );

      case "multi":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => {
              const selected = ((answers[question.id] as string[]) || []).includes(option);
              return (
                <label
                  key={option}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleMultiOption(question.id, option)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-surface-0 p-4 border-b border-surface-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/bg/globe.jpg"
              alt="Globe"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h3 className="font-rubik font-semibold flex items-center gap-2">
                <Globe size={18} className="text-role-student" />
                דיווח ניטור
              </h3>
              <p className="text-xs text-gray-500">מלא את הטופס ושלח</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">טוען שאלות...</div>
          ) : sortedQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              אין שאלות מוגדרות
            </div>
          ) : (
            sortedQuestions.map((question) => (
              <div key={question.id} className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  {question.label}
                  {question.required && (
                    <span className="text-error mr-1">*</span>
                  )}
                </label>
                {question.description && (
                  <p className="text-xs text-gray-500">{question.description}</p>
                )}
                {renderField(question)}
                {errors[question.id] && (
                  <p className="text-xs text-error">{errors[question.id]}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface-0 p-4 border-t border-surface-2 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={createSubmission.isPending}>
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createSubmission.isPending || isLoading}
            loading={createSubmission.isPending}
            rightIcon={Send}
          >
            שלח דיווח
          </Button>
        </div>
      </Card>
    </div>
  );
}
