"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  X,
  Star,
  CircleDot,
  CheckSquare,
  PenLine,
  Save,
  Heart,
  ThumbsUp,
} from "lucide-react";
import type { EmbeddedQuestion, QuestionType, RatingStyle } from "@/types";

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Omit<EmbeddedQuestion, "id" | "order">) => void;
  editingQuestion?: EmbeddedQuestion | null;
  saving?: boolean;
}

const questionTypes: {
  value: QuestionType;
  label: string;
  icon: typeof Star;
  color: string;
}[] = [
  { value: "rating", label: "דירוג (1-5)", icon: Star, color: "text-accent" },
  { value: "single", label: "בחירה יחידה", icon: CircleDot, color: "text-primary" },
  { value: "multiple", label: "בחירה מרובה", icon: CheckSquare, color: "text-secondary" },
  { value: "open", label: "שאלה פתוחה", icon: PenLine, color: "text-role-student" },
];

const ratingStyles: {
  value: RatingStyle;
  label: string;
  icon: typeof Star | null;
  emoji: string | null;
  color: string;
}[] = [
  { value: "stars", label: "כוכבים", icon: Star, emoji: null, color: "text-accent" },
  { value: "hearts", label: "לבבות", icon: Heart, emoji: null, color: "text-error" },
  { value: "emojis", label: "אימוג'י", icon: null, emoji: "😊", color: "" },
  { value: "thumbs", label: "אגודלים", icon: ThumbsUp, emoji: null, color: "text-success" },
];

export function QuestionFormModal({
  isOpen,
  onClose,
  onSave,
  editingQuestion,
  saving = false,
}: QuestionFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Form state
  const [questionType, setQuestionType] = useState<QuestionType>("open");
  const [questionText, setQuestionText] = useState("");
  const [questionOptions, setQuestionOptions] = useState<string[]>([]);
  const [ratingStyle, setRatingStyle] = useState<RatingStyle>("stars");
  const [hasOtherOption, setHasOtherOption] = useState(false);
  const [newOption, setNewOption] = useState("");

  const isChoiceType = questionType === "single" || questionType === "multiple";
  const isRatingType = questionType === "rating";
  const hasEnoughOptions = !isChoiceType || questionOptions.length >= 2;
  const isFormValid = questionText.trim().length > 0 && hasEnoughOptions;

  const currentTypeConfig = questionTypes.find((t) => t.value === questionType);

  // Reset form when opening/closing or when editingQuestion changes
  useEffect(() => {
    if (isOpen) {
      if (editingQuestion) {
        setQuestionType(editingQuestion.type);
        setQuestionText(editingQuestion.text);
        setQuestionOptions(editingQuestion.options || []);
        setRatingStyle(editingQuestion.ratingStyle || "stars");
        setHasOtherOption(editingQuestion.hasOtherOption || false);
      } else {
        setQuestionType("open");
        setQuestionText("");
        setQuestionOptions([]);
        setRatingStyle("stars");
        setHasOtherOption(false);
      }
      setNewOption("");
    }
  }, [isOpen, editingQuestion]);

  // Handle dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function addOption() {
    if (newOption.trim() && !questionOptions.includes(newOption.trim())) {
      setQuestionOptions([...questionOptions, newOption.trim()]);
      setNewOption("");
    }
  }

  function removeOption(opt: string) {
    setQuestionOptions(questionOptions.filter((o) => o !== opt));
  }

  function handleSave() {
    if (!isFormValid) return;

    const question: Omit<EmbeddedQuestion, "id" | "order"> = {
      type: questionType,
      text: questionText.trim(),
    };

    // Only include options for choice types
    if (isChoiceType) {
      question.options = questionOptions;
      question.hasOtherOption = hasOtherOption;
    }

    // Only include ratingStyle for rating type
    if (isRatingType) {
      question.ratingStyle = ratingStyle;
    }

    onSave(question);
  }

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto h-fit z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-2xl w-full shadow-2xl animate-scale-in border-0"
      onClose={onClose}
    >
      <div className="p-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-rubik font-bold text-foreground">
            {editingQuestion ? "עריכת שאלה" : "שאלה חדשה"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Question Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              סוג השאלה
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {questionTypes.map((t) => {
                const IconComponent = t.icon;
                const isSelected = questionType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setQuestionType(t.value)}
                    disabled={saving}
                    className={`p-3 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-surface-3 hover:border-primary/50"
                    }`}
                  >
                    <IconComponent
                      size={20}
                      className={`mx-auto mb-1 ${isSelected ? t.color : "text-gray-400"}`}
                    />
                    <span className={`text-xs ${isSelected ? "text-foreground" : "text-gray-500"}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              טקסט השאלה
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              disabled={saving}
              className="w-full p-3 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              rows={3}
              placeholder="הקלד את השאלה..."
            />
          </div>

          {/* Rating Style selector */}
          {isRatingType && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Star size={14} className="text-accent" />
                סגנון דירוג
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ratingStyles.map((style) => {
                  const isSelected = ratingStyle === style.value;
                  return (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => setRatingStyle(style.value)}
                      disabled={saving}
                      className={`p-3 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-surface-3 hover:border-primary/50"
                      }`}
                    >
                      {style.icon ? (
                        <style.icon
                          size={20}
                          className={`mx-auto mb-1 ${isSelected ? style.color : "text-gray-400"}`}
                        />
                      ) : (
                        <span className="text-xl block mb-1">{style.emoji}</span>
                      )}
                      <span className={`text-xs ${isSelected ? "text-foreground" : "text-gray-500"}`}>
                        {style.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Options for choice types */}
          {isChoiceType && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                {currentTypeConfig && (
                  <currentTypeConfig.icon size={14} className={currentTypeConfig.color} />
                )}
                אפשרויות בחירה (לפחות 2)
              </label>
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="הוסף אפשרות"
                  disabled={saving}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOption())}
                />
                <Button onClick={addOption} size="sm" disabled={saving}>
                  הוסף
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {questionOptions.map((opt) => (
                  <span
                    key={opt}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-1 border border-surface-3 rounded-lg text-sm"
                  >
                    {opt}
                    <button
                      onClick={() => removeOption(opt)}
                      disabled={saving}
                      className="text-gray-400 hover:text-error cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {questionOptions.length === 0 && (
                  <span className="text-sm text-gray-400">לא נוספו אפשרויות</span>
                )}
              </div>

              {/* Has Other Option checkbox */}
              <label className="flex items-center gap-3 p-3 bg-surface-1 rounded-xl border border-surface-3 cursor-pointer hover:bg-surface-2 transition-colors">
                <input
                  type="checkbox"
                  checked={hasOtherOption}
                  onChange={(e) => setHasOtherOption(e.target.checked)}
                  disabled={saving}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer disabled:opacity-50"
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    אפשר תשובה אחרת
                  </span>
                  <span className="text-xs text-gray-400">
                    (הוספת שדה טקסט חופשי &quot;אחר&quot;)
                  </span>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            ביטול
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid || saving}
            loading={saving}
            rightIcon={Save}
          >
            {editingQuestion ? "עדכן" : "הוסף"}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
