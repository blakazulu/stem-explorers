"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  getAllQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/lib/services/questions";
import { getUnitsByGrade } from "@/lib/services/units";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Question, QuestionType, Grade, Unit } from "@/types";

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
const questionTypes: { value: QuestionType; label: string }[] = [
  { value: "rating", label: "דירוג (1-5)" },
  { value: "single", label: "בחירה יחידה" },
  { value: "multiple", label: "בחירה מרובה" },
  { value: "open", label: "שאלה פתוחה" },
];

export default function QuestionsPage() {
  const { session } = useAuth();
  const router = useRouter();
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
      router.push("/dashboard");
      return;
    }
    loadData();
  }, [session, router, loadData]);

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

  if (loading) {
    return <div className="text-gray-500">טוען שאלות...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-rubik font-bold">ניהול שאלות יומן חוקר</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>שאלה חדשה</Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">
            {editingQuestion ? "עריכת שאלה" : "שאלה חדשה"}
          </h2>

          <div>
            <label className="block text-sm font-medium mb-1">סוג שאלה</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as QuestionType })
              }
              className="w-full p-2 border rounded-lg cursor-pointer transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {questionTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">טקסט השאלה</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full p-3 border rounded-lg"
              rows={3}
              placeholder="הקלד את השאלה..."
            />
          </div>

          {(formData.type === "single" || formData.type === "multiple") && (
            <div>
              <label className="block text-sm font-medium mb-2">אפשרויות בחירה</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="הוסף אפשרות"
                />
                <Button onClick={addOption} size="sm">
                  הוסף
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.options?.map((opt) => (
                  <span
                    key={opt}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {opt}
                    <button
                      onClick={() => removeOption(opt)}
                      className="text-error hover:text-red-700 cursor-pointer transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              כיתות יעד (ריק = כל הכיתות)
            </label>
            <div className="flex flex-wrap gap-2">
              {grades.map((g) => (
                <button
                  key={g}
                  onClick={() => toggleGrade(g)}
                  className={`px-3 py-1 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                    formData.target.grades.includes(g)
                      ? "bg-primary text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              יחידות יעד (ריק = כל היחידות)
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {units.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => toggleUnit(unit.id)}
                  className={`px-3 py-1 rounded-lg text-sm cursor-pointer transition-all duration-200 ${
                    formData.target.units.includes(unit.id)
                      ? "bg-primary text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {unit.name} ({unit.gradeId})
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">סדר תצוגה</label>
            <Input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
              }
              className="w-24"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit}>
              {editingQuestion ? "עדכן" : "צור שאלה"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              ביטול
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {questions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">אין שאלות עדיין</p>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                      {questionTypes.find((t) => t.value === q.type)?.label}
                    </span>
                    <span className="text-xs text-gray-500">סדר: {q.order}</span>
                  </div>
                  <p className="font-medium">{q.text}</p>
                  {q.options && q.options.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      אפשרויות: {q.options.join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    כיתות: {q.target.grades.length > 0 ? q.target.grades.join(", ") : "הכל"} |
                    יחידות: {q.target.units.length > 0 ? `${q.target.units.length} נבחרו` : "הכל"}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(q)}
                    className="text-sm text-primary hover:underline cursor-pointer transition-colors hover:text-primary/80"
                  >
                    ערוך
                  </button>
                  <button
                    onClick={() => setDeleteId(q.id)}
                    className="text-sm text-error hover:underline cursor-pointer transition-colors hover:text-error/80"
                  >
                    מחק
                  </button>
                </div>
              </div>
            </div>
          ))
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
