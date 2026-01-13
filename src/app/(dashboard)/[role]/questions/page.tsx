"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/lib/services/questions";
import { getUnitsByGrade } from "@/lib/services/units";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  HelpCircle,
  Plus,
  Star,
  CircleDot,
  CheckSquare,
  PenLine,
  X,
  Edit2,
  Trash2,
  GraduationCap,
  BookOpen,
  Hash,
} from "lucide-react";
import type { Question, QuestionType, Grade, Unit, UserRole } from "@/types";

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
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

export default function QuestionsPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const role = params.role as UserRole;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Question, "id">>({
    type: "open",
    text: "",
    options: [],
    target: { grades: [], units: [] },
    order: 0,
  });
  const [newOption, setNewOption] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const [qs, allUnits] = await Promise.all([
      getAllQuestions(),
      Promise.all(grades.map((g) => getUnitsByGrade(g))),
    ]);
    setQuestions(qs);
    setUnits(allUnits.flat());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session?.user.role !== "admin") {
      router.push(`/${role}`);
      return;
    }
    loadData();
  }, [session, router, loadData, role]);

  function resetForm() {
    setFormData({
      type: "open",
      text: "",
      options: [],
      target: { grades: [], units: [] },
      order: questions.length,
    });
    setNewOption("");
    setEditingQuestion(null);
    setShowForm(false);
  }

  function handleEdit(q: Question) {
    setEditingQuestion(q);
    setFormData({
      type: q.type,
      text: q.text,
      options: q.options || [],
      target: q.target,
      order: q.order,
    });
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!formData.text.trim()) return;

    if (editingQuestion) {
      await updateQuestion(editingQuestion.id, formData);
    } else {
      await createQuestion(formData);
    }
    resetForm();
    await loadData();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteQuestion(deleteId);
    setDeleteId(null);
    await loadData();
  }

  function addOption() {
    if (newOption.trim() && !formData.options?.includes(newOption.trim())) {
      setFormData({
        ...formData,
        options: [...(formData.options || []), newOption.trim()],
      });
      setNewOption("");
    }
  }

  function removeOption(opt: string) {
    setFormData({
      ...formData,
      options: formData.options?.filter((o) => o !== opt),
    });
  }

  function toggleGrade(grade: Grade) {
    const current = formData.target.grades;
    setFormData({
      ...formData,
      target: {
        ...formData.target,
        grades: current.includes(grade)
          ? current.filter((g) => g !== grade)
          : [...current, grade],
      },
    });
  }

  function toggleUnit(unitId: string) {
    const current = formData.target.units;
    setFormData({
      ...formData,
      target: {
        ...formData.target,
        units: current.includes(unitId)
          ? current.filter((u) => u !== unitId)
          : [...current, unitId],
      },
    });
  }

  if (session?.user.role !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-role-admin/10 rounded-xl">
            <HelpCircle size={24} className="text-role-admin" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              ניהול שאלות יומן חוקר
            </h1>
          </div>
        </div>
        <SkeletonList count={5} />
      </div>
    );
  }

  const currentTypeConfig = questionTypes.find((t) => t.value === formData.type);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-role-admin/10 rounded-xl">
            <HelpCircle size={24} className="text-role-admin" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              ניהול שאלות יומן חוקר
            </h1>
            <p className="text-sm text-gray-500">
              {questions.length} שאלות מוגדרות
            </p>
          </div>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} rightIcon={Plus}>
            שאלה חדשה
          </Button>
        )}
      </div>

      {/* Question Form */}
      {showForm && (
        <Card padding="none" className="overflow-hidden animate-slide-up">
          {/* Form Header */}
          <div className="bg-gradient-to-l from-role-admin/10 to-primary/10 px-4 md:px-6 py-4 border-b border-surface-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-role-admin/20 rounded-lg">
                {editingQuestion ? (
                  <Edit2 size={20} className="text-role-admin" />
                ) : (
                  <Plus size={20} className="text-role-admin" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-rubik font-semibold text-foreground">
                  {editingQuestion ? "עריכת שאלה" : "שאלה חדשה"}
                </h2>
                <p className="text-sm text-gray-500">
                  הגדר את פרטי השאלה ואת קהל היעד
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-6">
            {/* Question Type Selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                סוג שאלה
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {questionTypes.map((t) => {
                  const IconComponent = t.icon;
                  const isSelected = formData.type === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() =>
                        setFormData({ ...formData, type: t.value })
                      }
                      className={`p-4 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-surface-3 hover:border-primary/50 hover:bg-surface-1"
                      }`}
                    >
                      <IconComponent
                        size={24}
                        className={`mx-auto mb-2 ${isSelected ? t.color : "text-gray-400"}`}
                      />
                      <span
                        className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-gray-500"}`}
                      >
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
                value={formData.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                className="w-full p-4 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                rows={3}
                placeholder="הקלד את השאלה..."
              />
            </div>

            {/* Options for single/multiple choice */}
            {(formData.type === "single" || formData.type === "multiple") && (
              <div className="p-4 bg-surface-1 rounded-xl space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {currentTypeConfig && (
                    <currentTypeConfig.icon
                      size={16}
                      className={currentTypeConfig.color}
                    />
                  )}
                  אפשרויות בחירה
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="הוסף אפשרות"
                    onKeyDown={(e) => e.key === "Enter" && addOption()}
                  />
                  <Button onClick={addOption} size="sm" rightIcon={Plus}>
                    הוסף
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.options?.map((opt) => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-0 border border-surface-3 rounded-lg text-sm"
                    >
                      {opt}
                      <button
                        onClick={() => removeOption(opt)}
                        className="text-gray-400 hover:text-error cursor-pointer transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                  {(!formData.options || formData.options.length === 0) && (
                    <span className="text-sm text-gray-400">
                      לא נוספו אפשרויות עדיין
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Target Grades */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <GraduationCap size={16} className="text-primary" />
                כיתות יעד
                <span className="text-gray-400 font-normal">
                  (ריק = כל הכיתות)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {grades.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGrade(g)}
                    className={`w-10 h-10 rounded-lg font-rubik font-bold transition-all duration-200 cursor-pointer ${
                      formData.target.grades.includes(g)
                        ? "bg-primary text-white shadow-md"
                        : "bg-surface-0 border-2 border-surface-3 text-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Units */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <BookOpen size={16} className="text-secondary" />
                יחידות יעד
                <span className="text-gray-400 font-normal">
                  (ריק = כל היחידות)
                </span>
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 bg-surface-1 rounded-xl">
                {units.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => toggleUnit(unit.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                      formData.target.units.includes(unit.id)
                        ? "bg-secondary text-white"
                        : "bg-surface-0 border border-surface-3 hover:border-secondary hover:text-secondary"
                    }`}
                  >
                    {unit.name}{" "}
                    <span className="opacity-70">({unit.gradeId})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Order */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Hash size={16} className="text-gray-500" />
                סדר תצוגה
              </label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                className="w-24"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-2">
              <Button variant="ghost" onClick={resetForm} leftIcon={X}>
                ביטול
              </Button>
              <Button onClick={handleSubmit}>
                {editingQuestion ? "עדכן שאלה" : "צור שאלה"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {questions.length === 0 ? (
          <EmptyState
            icon="help-circle"
            title="אין שאלות עדיין"
            description="צור שאלות חדשות ליומן החוקר"
            action={
              <Button onClick={() => setShowForm(true)} rightIcon={Plus}>
                שאלה חדשה
              </Button>
            }
          />
        ) : (
          questions.map((q, index) => {
            const typeConfig = questionTypes.find((t) => t.value === q.type);
            const TypeIcon = typeConfig?.icon || HelpCircle;
            return (
              <Card
                key={q.id}
                interactive
                className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="shrink-0 p-2 rounded-lg bg-surface-1">
                      <TypeIcon size={20} className={typeConfig?.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            typeConfig?.color
                          } bg-surface-1 font-medium`}
                        >
                          {typeConfig?.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          סדר: {q.order}
                        </span>
                      </div>
                      <p className="font-medium text-foreground">{q.text}</p>
                      {q.options && q.options.length > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          אפשרויות: {q.options.join(" • ")}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap size={12} />
                          {q.target.grades.length > 0
                            ? q.target.grades.join(", ")
                            : "כל הכיתות"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <BookOpen size={12} />
                          {q.target.units.length > 0
                            ? `${q.target.units.length} יחידות`
                            : "כל היחידות"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(q)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 cursor-pointer"
                      title="ערוך"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteId(q.id)}
                      className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200 cursor-pointer"
                      title="מחק"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="מחיקת שאלה"
        message="האם אתה בטוח שברצונך למחוק שאלה זו?"
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
