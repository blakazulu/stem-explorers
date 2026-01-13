"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getQuestionnaire, updateQuestionnaire, activateQuestionnaire, deactivateQuestionnaire } from "@/lib/services/questionnaires";
import { getUnit } from "@/lib/services/units";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import {
  ClipboardList,
  ArrowRight,
  Plus,
  X,
  Edit2,
  Trash2,
  CheckCircle,
  Circle,
  Star,
  CircleDot,
  CheckSquare,
  PenLine,
  BookOpen,
  Save,
  Heart,
  ThumbsUp,
} from "lucide-react";
import type { Questionnaire, EmbeddedQuestion, QuestionType, RatingStyle, Unit, Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
const MIN_QUESTIONS = 0;
const MAX_QUESTIONS = 10;

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

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export default function EditQuestionnairePage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;
  const questionnaireId = params.id as string;

  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Question form state
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionType, setQuestionType] = useState<QuestionType>("open");
  const [questionText, setQuestionText] = useState("");
  const [questionOptions, setQuestionOptions] = useState<string[]>([]);
  const [ratingStyle, setRatingStyle] = useState<RatingStyle>("stars");
  const [newOption, setNewOption] = useState("");
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  const toast = useToastActions();
  const isAdmin = session?.user.role === "admin";
  const backUrl = `/${role}/questions/${encodeURIComponent(grade)}`;

  const isChoiceType = questionType === "single" || questionType === "multiple";
  const isRatingType = questionType === "rating";
  const hasEnoughOptions = !isChoiceType || questionOptions.length >= 2;
  const isQuestionFormValid = questionText.trim().length > 0 && hasEnoughOptions;
  const canAddQuestion = questionnaire && questionnaire.questions.length < MAX_QUESTIONS;
  const canDeleteQuestion = questionnaire && questionnaire.questions.length > MIN_QUESTIONS;

  useEffect(() => {
    if (!isAdmin) {
      router.replace(`/${role}`);
      return;
    }
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/questions`);
    }
  }, [isAdmin, grade, role, router]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const q = await getQuestionnaire(questionnaireId);
      if (!q || q.gradeId !== grade) {
        router.replace(backUrl);
        return;
      }
      setQuestionnaire(q);

      const u = await getUnit(q.unitId);
      setUnit(u);
    } catch {
      toast.error("שגיאה", "שגיאה בטעינת השאלון");
      router.replace(backUrl);
    }
    setLoading(false);
  }, [questionnaireId, grade, backUrl, router, toast]);

  useEffect(() => {
    if (isAdmin && VALID_GRADES.includes(grade)) {
      loadData();
    }
  }, [isAdmin, grade, loadData]);

  function resetQuestionForm() {
    setShowQuestionForm(false);
    setEditingQuestionId(null);
    setQuestionType("open");
    setQuestionText("");
    setQuestionOptions([]);
    setRatingStyle("stars");
    setNewOption("");
  }

  function handleEditQuestion(q: EmbeddedQuestion) {
    setEditingQuestionId(q.id);
    setQuestionType(q.type);
    setQuestionText(q.text);
    setQuestionOptions(q.options || []);
    setRatingStyle(q.ratingStyle || "stars");
    setShowQuestionForm(true);
  }

  function addOption() {
    if (newOption.trim() && !questionOptions.includes(newOption.trim())) {
      setQuestionOptions([...questionOptions, newOption.trim()]);
      setNewOption("");
    }
  }

  function removeOption(opt: string) {
    setQuestionOptions(questionOptions.filter((o) => o !== opt));
  }

  async function handleSaveQuestion() {
    if (!questionnaire || !isQuestionFormValid) return;

    setSaving(true);
    try {
      let updatedQuestions: EmbeddedQuestion[];

      if (editingQuestionId) {
        // Update existing question
        updatedQuestions = questionnaire.questions.map((q) => {
          if (q.id !== editingQuestionId) return q;
          const updated: EmbeddedQuestion = {
            ...q,
            type: questionType,
            text: questionText.trim(),
          };
          // Only include options for choice types (Firebase doesn't support undefined)
          if (isChoiceType) {
            updated.options = questionOptions;
          } else {
            delete updated.options;
          }
          // Only include ratingStyle for rating type
          if (isRatingType) {
            updated.ratingStyle = ratingStyle;
          } else {
            delete updated.ratingStyle;
          }
          return updated;
        });
      } else {
        // Add new question
        const newQuestion: EmbeddedQuestion = {
          id: generateId(),
          type: questionType,
          text: questionText.trim(),
          order: questionnaire.questions.length + 1,
        };
        // Only include options for choice types (Firebase doesn't support undefined)
        if (isChoiceType) {
          newQuestion.options = questionOptions;
        }
        // Only include ratingStyle for rating type
        if (isRatingType) {
          newQuestion.ratingStyle = ratingStyle;
        }
        updatedQuestions = [...questionnaire.questions, newQuestion];
      }

      await updateQuestionnaire(questionnaire.id, { questions: updatedQuestions });
      setQuestionnaire({ ...questionnaire, questions: updatedQuestions });
      toast.success("שאלונים", editingQuestionId ? "השאלה עודכנה" : "השאלה נוספה");
      resetQuestionForm();
    } catch {
      toast.error("שגיאה", "לא הצלחנו לשמור את השאלה");
    }
    setSaving(false);
  }

  async function handleDeleteQuestion() {
    if (!questionnaire || !deleteQuestionId) return;

    setSaving(true);
    try {
      const updatedQuestions = questionnaire.questions
        .filter((q) => q.id !== deleteQuestionId)
        .map((q, i) => ({ ...q, order: i + 1 })); // Re-order

      // If questionnaire was active and now has no questions, deactivate it
      const shouldDeactivate = questionnaire.isActive && updatedQuestions.length === 0;

      if (shouldDeactivate) {
        await updateQuestionnaire(questionnaire.id, { questions: updatedQuestions, isActive: false });
        setQuestionnaire({ ...questionnaire, questions: updatedQuestions, isActive: false });
        toast.success("שאלונים", "השאלה נמחקה והשאלון הושבת");
      } else {
        await updateQuestionnaire(questionnaire.id, { questions: updatedQuestions });
        setQuestionnaire({ ...questionnaire, questions: updatedQuestions });
        toast.success("שאלונים", "השאלה נמחקה");
      }
      setDeleteQuestionId(null);
    } catch {
      toast.error("שגיאה", "לא הצלחנו למחוק את השאלה");
    }
    setSaving(false);
  }

  async function handleToggleActive() {
    if (!questionnaire) return;

    setSaving(true);
    try {
      if (questionnaire.isActive) {
        await deactivateQuestionnaire(questionnaire.id);
        setQuestionnaire({ ...questionnaire, isActive: false });
        toast.success("שאלונים", "השאלון הושבת");
      } else {
        await activateQuestionnaire(questionnaire.id, questionnaire.gradeId, questionnaire.unitId);
        setQuestionnaire({ ...questionnaire, isActive: true });
        toast.success("שאלונים", "השאלון הופעל");
      }
    } catch {
      toast.error("שגיאה", "לא הצלחנו לעדכן את סטטוס השאלון");
    }
    setSaving(false);
  }

  if (!isAdmin || !VALID_GRADES.includes(grade)) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-role-admin/10 rounded-xl">
            <ClipboardList size={24} className="text-role-admin" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              עריכת שאלון
            </h1>
          </div>
        </div>
        <SkeletonCard />
      </div>
    );
  }

  if (!questionnaire) {
    return null;
  }

  const currentTypeConfig = questionTypes.find((t) => t.value === questionType);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={backUrl}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לרשימת השאלונים"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
          <div className="p-3 bg-role-admin/10 rounded-xl">
            <ClipboardList size={24} className="text-role-admin" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              {questionnaire.name}
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <BookOpen size={14} />
              {unit?.name || "יחידה לא ידועה"} • כיתה {grade}
            </p>
          </div>
        </div>

        {/* Activate Button */}
        <Button
          onClick={handleToggleActive}
          disabled={saving || questionnaire.questions.length === 0}
          variant={questionnaire.isActive ? "outline" : "primary"}
          rightIcon={questionnaire.isActive ? Circle : CheckCircle}
        >
          {questionnaire.isActive ? "השבת" : "הפעל"}
        </Button>
      </div>

      {/* Status Banner */}
      {questionnaire.isActive && (
        <div className="flex items-center gap-2 px-4 py-3 bg-success/10 text-success rounded-xl">
          <CheckCircle size={18} />
          <span className="font-medium">שאלון זה פעיל ומוצג לתלמידים</span>
        </div>
      )}

      {/* Questions List */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-rubik font-semibold text-lg text-foreground">
            שאלות ({questionnaire.questions.length}/{MAX_QUESTIONS})
          </h2>
          {canAddQuestion && !showQuestionForm && (
            <Button
              size="sm"
              onClick={() => setShowQuestionForm(true)}
              rightIcon={Plus}
              disabled={saving}
            >
              הוסף שאלה
            </Button>
          )}
        </div>

        {/* Question Form */}
        {showQuestionForm && (
          <div className="mb-6 p-4 bg-surface-1 rounded-xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">
                {editingQuestionId ? "עריכת שאלה" : "שאלה חדשה"}
              </h3>
              <button
                onClick={resetQuestionForm}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Question Type */}
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
                rows={2}
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
              <div className="space-y-2">
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
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-0 border border-surface-3 rounded-lg text-sm"
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
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={resetQuestionForm} disabled={saving}>
                ביטול
              </Button>
              <Button
                onClick={handleSaveQuestion}
                disabled={!isQuestionFormValid || saving}
                loading={saving}
                rightIcon={Save}
              >
                {editingQuestionId ? "עדכן" : "הוסף"}
              </Button>
            </div>
          </div>
        )}

        {/* Questions */}
        {questionnaire.questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>אין שאלות עדיין</p>
            <p className="text-sm mt-1">הוסף לפחות שאלה אחת כדי להפעיל את השאלון</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questionnaire.questions
              .sort((a, b) => a.order - b.order)
              .map((q, index) => {
                const typeConfig = questionTypes.find((t) => t.value === q.type);
                const TypeIcon = typeConfig?.icon || PenLine;
                const styleConfig = q.type === "rating" ? ratingStyles.find((s) => s.value === (q.ratingStyle || "stars")) : null;
                return (
                  <div
                    key={q.id}
                    className="flex items-start gap-3 p-4 bg-surface-1 rounded-xl"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-2 text-sm font-medium text-gray-500">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <TypeIcon size={16} className={typeConfig?.color} />
                        <span className="text-xs text-gray-500">{typeConfig?.label}</span>
                        {styleConfig && (
                          <span className="text-xs text-gray-400">
                            ({styleConfig.emoji || styleConfig.label})
                          </span>
                        )}
                      </div>
                      <p className="text-foreground">{q.text}</p>
                      {q.options && q.options.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          אפשרויות: {q.options.join(" • ")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditQuestion(q)}
                        disabled={saving || showQuestionForm}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteQuestionId(q.id)}
                        disabled={saving || showQuestionForm || !canDeleteQuestion}
                        className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </Card>

      <ConfirmDialog
        isOpen={deleteQuestionId !== null}
        title="מחיקת שאלה"
        message="האם אתה בטוח שברצונך למחוק שאלה זו?"
        confirmLabel="מחק"
        onConfirm={handleDeleteQuestion}
        onCancel={() => setDeleteQuestionId(null)}
      />
    </div>
  );
}
