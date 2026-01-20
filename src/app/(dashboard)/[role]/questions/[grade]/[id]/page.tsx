"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  useQuestionnaire,
  useUpdateQuestionnaire,
  useActivateQuestionnaire,
  useDeactivateQuestionnaire,
  useCopyQuestionnaireToGrades,
} from "@/lib/queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { QuestionFormModal } from "@/components/QuestionFormModal";
import { useToastActions } from "@/components/ui/Toast";
import {
  ClipboardList,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Circle,
  Star,
  CircleDot,
  CheckSquare,
  PenLine,
  Heart,
  ThumbsUp,
  Copy,
  X,
  Check,
} from "lucide-react";
import type {
  EmbeddedQuestion,
  QuestionType,
  RatingStyle,
  Grade,
  UserRole,
} from "@/types";

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
}[] = [
  { value: "stars", label: "כוכבים", icon: Star, emoji: null },
  { value: "hearts", label: "לבבות", icon: Heart, emoji: null },
  { value: "emojis", label: "אימוג'י", icon: null, emoji: "😊" },
  { value: "thumbs", label: "אגודלים", icon: ThumbsUp, emoji: null },
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

  // React Query hooks
  const { data: questionnaire, isLoading: loading } = useQuestionnaire(questionnaireId);
  const updateQuestionnaireMutation = useUpdateQuestionnaire();
  const activateQuestionnaireMutation = useActivateQuestionnaire();
  const deactivateQuestionnaireMutation = useDeactivateQuestionnaire();
  const copyToGradesMutation = useCopyQuestionnaireToGrades();

  const saving =
    updateQuestionnaireMutation.isPending ||
    activateQuestionnaireMutation.isPending ||
    deactivateQuestionnaireMutation.isPending ||
    copyToGradesMutation.isPending;

  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  // Question modal state
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<EmbeddedQuestion | null>(null);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  // Copy to grades modal state
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>([]);

  const toast = useToastActions();
  const isAdmin = session?.user.role === "admin";
  const backUrl = `/${role}/questions/${encodeURIComponent(grade)}`;

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

  // Redirect if questionnaire not found or doesn't match grade
  useEffect(() => {
    if (!loading && questionnaire && questionnaire.gradeId !== grade) {
      router.replace(backUrl);
    }
  }, [loading, questionnaire, grade, backUrl, router]);

  // Initialize edited name when questionnaire loads
  useEffect(() => {
    if (questionnaire) {
      setEditedName(questionnaire.name);
    }
  }, [questionnaire]);

  function handleStartEditName() {
    if (questionnaire) {
      setEditedName(questionnaire.name);
      setIsEditingName(true);
    }
  }

  function handleCancelEditName() {
    setIsEditingName(false);
    if (questionnaire) {
      setEditedName(questionnaire.name);
    }
  }

  function handleSaveName() {
    if (!questionnaire || !editedName.trim()) return;

    updateQuestionnaireMutation.mutate(
      { id: questionnaire.id, data: { name: editedName.trim() } },
      {
        onSuccess: () => {
          toast.success("שאלונים", "שם השאלון עודכן");
          setIsEditingName(false);
        },
        onError: () => {
          toast.error("שגיאה", "לא הצלחנו לעדכן את שם השאלון");
        },
      }
    );
  }

  function handleEditQuestion(q: EmbeddedQuestion) {
    setEditingQuestion(q);
    setShowQuestionModal(true);
  }

  function handleAddQuestion() {
    setEditingQuestion(null);
    setShowQuestionModal(true);
  }

  function handleSaveQuestion(questionData: Omit<EmbeddedQuestion, "id" | "order">) {
    if (!questionnaire) return;

    let updatedQuestions: EmbeddedQuestion[];

    if (editingQuestion) {
      // Update existing question
      updatedQuestions = questionnaire.questions.map((q) => {
        if (q.id !== editingQuestion.id) return q;
        const updated: EmbeddedQuestion = {
          ...q,
          type: questionData.type,
          text: questionData.text,
        };
        // Only include options for choice types (Firebase doesn't support undefined)
        if (questionData.type === "single" || questionData.type === "multiple") {
          updated.options = questionData.options;
          updated.hasOtherOption = questionData.hasOtherOption;
        } else {
          delete updated.options;
          delete updated.hasOtherOption;
        }
        // Only include ratingStyle for rating type
        if (questionData.type === "rating") {
          updated.ratingStyle = questionData.ratingStyle;
        } else {
          delete updated.ratingStyle;
        }
        return updated;
      });
    } else {
      // Add new question
      const newQuestion: EmbeddedQuestion = {
        id: generateId(),
        type: questionData.type,
        text: questionData.text,
        order: questionnaire.questions.length + 1,
      };
      // Only include options for choice types
      if (questionData.type === "single" || questionData.type === "multiple") {
        newQuestion.options = questionData.options;
        newQuestion.hasOtherOption = questionData.hasOtherOption;
      }
      // Only include ratingStyle for rating type
      if (questionData.type === "rating") {
        newQuestion.ratingStyle = questionData.ratingStyle;
      }
      updatedQuestions = [...questionnaire.questions, newQuestion];
    }

    const isEditing = !!editingQuestion;
    updateQuestionnaireMutation.mutate(
      { id: questionnaire.id, data: { questions: updatedQuestions } },
      {
        onSuccess: () => {
          toast.success("שאלונים", isEditing ? "השאלה עודכנה" : "השאלה נוספה");
          setShowQuestionModal(false);
          setEditingQuestion(null);
        },
        onError: () => {
          toast.error("שגיאה", "לא הצלחנו לשמור את השאלה");
        },
      }
    );
  }

  function handleDeleteQuestion() {
    if (!questionnaire || !deleteQuestionId) return;

    const updatedQuestions = questionnaire.questions
      .filter((q) => q.id !== deleteQuestionId)
      .map((q, i) => ({ ...q, order: i + 1 })); // Re-order

    // If questionnaire was active and now has no questions, deactivate it
    const shouldDeactivate = questionnaire.isActive && updatedQuestions.length === 0;

    updateQuestionnaireMutation.mutate(
      {
        id: questionnaire.id,
        data: shouldDeactivate
          ? { questions: updatedQuestions, isActive: false }
          : { questions: updatedQuestions },
      },
      {
        onSuccess: () => {
          toast.success(
            "שאלונים",
            shouldDeactivate ? "השאלה נמחקה והשאלון הושבת" : "השאלה נמחקה"
          );
          setDeleteQuestionId(null);
        },
        onError: () => {
          toast.error("שגיאה", "לא הצלחנו למחוק את השאלה");
        },
      }
    );
  }

  function handleToggleActive() {
    if (!questionnaire) return;

    if (questionnaire.isActive) {
      deactivateQuestionnaireMutation.mutate(questionnaire.id, {
        onSuccess: () => {
          toast.success("שאלונים", "השאלון הושבת");
        },
        onError: () => {
          toast.error("שגיאה", "לא הצלחנו לעדכן את סטטוס השאלון");
        },
      });
    } else {
      activateQuestionnaireMutation.mutate(
        {
          id: questionnaire.id,
          gradeId: questionnaire.gradeId,
        },
        {
          onSuccess: () => {
            toast.success("שאלונים", "השאלון הופעל");
          },
          onError: () => {
            toast.error("שגיאה", "לא הצלחנו לעדכן את סטטוס השאלון");
          },
        }
      );
    }
  }

  function handleOpenCopyModal() {
    setSelectedGrades([]);
    setShowCopyModal(true);
  }

  function handleToggleGrade(g: Grade) {
    setSelectedGrades((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  function handleCopyToGrades() {
    if (!questionnaire || selectedGrades.length === 0) return;

    copyToGradesMutation.mutate(
      { sourceId: questionnaire.id, targetGrades: selectedGrades },
      {
        onSuccess: (count) => {
          toast.success("שאלונים", `השאלון הועתק ל-${count} כיתות`);
          setShowCopyModal(false);
          setSelectedGrades([]);
        },
        onError: () => {
          toast.error("שגיאה", "לא הצלחנו להעתיק את השאלון");
        },
      }
    );
  }

  if (!isAdmin || !VALID_GRADES.includes(grade)) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
            {/* Editable Name */}
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-lg font-rubik font-bold"
                  disabled={saving}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") handleCancelEditName();
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving || !editedName.trim()}
                  className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="שמור"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={handleCancelEditName}
                  disabled={saving}
                  className="p-2 text-gray-400 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
                  title="ביטול"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
                  {questionnaire.name}
                </h1>
                <button
                  onClick={handleStartEditName}
                  disabled={saving}
                  className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                  title="ערוך שם"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500">כיתה {grade}</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleOpenCopyModal}
            disabled={saving}
            rightIcon={Copy}
          >
            העתק לכיתות
          </Button>
          <Button
            onClick={handleToggleActive}
            disabled={saving || (!questionnaire.isActive && questionnaire.questions.length === 0)}
            variant={questionnaire.isActive ? "outline" : "primary"}
            rightIcon={questionnaire.isActive ? Circle : CheckCircle}
            title={
              !questionnaire.isActive && questionnaire.questions.length === 0
                ? "יש להוסיף שאלות לפני הפעלה"
                : undefined
            }
          >
            {questionnaire.isActive ? "השבת" : "הפעל"}
          </Button>
        </div>
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
          {canAddQuestion && (
            <Button
              size="sm"
              onClick={handleAddQuestion}
              rightIcon={Plus}
              disabled={saving}
            >
              הוסף שאלה
            </Button>
          )}
        </div>

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
                const styleConfig =
                  q.type === "rating"
                    ? ratingStyles.find((s) => s.value === (q.ratingStyle || "stars"))
                    : null;
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
                        {q.hasOtherOption && (
                          <span className="text-xs text-gray-400 bg-surface-2 px-1.5 py-0.5 rounded">
                            + אחר
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
                        disabled={saving}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteQuestionId(q.id)}
                        disabled={saving || !canDeleteQuestion}
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

      {/* Question Form Modal */}
      <QuestionFormModal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
        editingQuestion={editingQuestion}
        saving={saving}
      />

      {/* Delete Question Dialog */}
      <ConfirmDialog
        isOpen={deleteQuestionId !== null}
        title="מחיקת שאלה"
        message="האם אתה בטוח שברצונך למחוק שאלה זו?"
        confirmLabel="מחק"
        onConfirm={handleDeleteQuestion}
        onCancel={() => setDeleteQuestionId(null)}
      />

      {/* Copy to Grades Modal */}
      {showCopyModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setShowCopyModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full animate-scale-in"
              dir="rtl"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-rubik font-bold text-foreground">
                    העתק לכיתות אחרות
                  </h2>
                  <button
                    onClick={() => setShowCopyModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p className="text-sm text-gray-500 mb-4">
                  בחר את הכיתות אליהן להעתיק את השאלון. כל כיתה תקבל עותק עצמאי.
                </p>

                {/* Grade Checkboxes */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {VALID_GRADES.filter((g) => g !== grade).map((g) => {
                    const isSelected = selectedGrades.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleToggleGrade(g)}
                        disabled={saving}
                        className={`p-3 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-surface-3 hover:border-primary/50 text-foreground"
                        }`}
                      >
                        <span className="text-lg font-rubik font-bold">כיתה {g}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-surface-2">
                  <Button
                    variant="ghost"
                    onClick={() => setShowCopyModal(false)}
                    disabled={saving}
                  >
                    ביטול
                  </Button>
                  <Button
                    onClick={handleCopyToGrades}
                    disabled={selectedGrades.length === 0 || saving}
                    loading={saving}
                    rightIcon={Copy}
                  >
                    העתק ({selectedGrades.length})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
