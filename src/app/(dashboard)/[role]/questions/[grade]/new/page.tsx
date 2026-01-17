"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createQuestionnaire } from "@/lib/services/questionnaires";
import { useUnitsByGrade } from "@/lib/queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useToastActions } from "@/components/ui/Toast";
import {
  ClipboardList,
  ArrowRight,
  Plus,
  BookOpen,
} from "lucide-react";
import type { Grade, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function NewQuestionnairePage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const isValidGrade = VALID_GRADES.includes(grade);
  const { data: units = [], isLoading, error } = useUnitsByGrade(isValidGrade ? grade : null);

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [unitId, setUnitId] = useState("");
  const toast = useToastActions();

  const isAdmin = session?.user.role === "admin";
  const isFormValid = name.trim().length > 0 && unitId.length > 0;
  const backUrl = `/${role}/questions/${encodeURIComponent(grade)}`;

  useEffect(() => {
    if (!isAdmin) {
      router.replace(`/${role}`);
      return;
    }
    if (!isValidGrade) {
      router.replace(`/${role}/questions`);
    }
  }, [isAdmin, isValidGrade, role, router]);

  useEffect(() => {
    if (error) {
      toast.error("שגיאה", "שגיאה בטעינת יחידות הלימוד");
    }
  }, [error, toast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    setSaving(true);
    try {
      const id = await createQuestionnaire({
        name: name.trim(),
        gradeId: grade,
        unitId,
        questions: [],
        isActive: false,
      });
      toast.success("שאלונים", "השאלון נוצר בהצלחה");
      router.push(`/${role}/questions/${encodeURIComponent(grade)}/${id}`);
    } catch {
      toast.error("שגיאה", "לא הצלחנו ליצור את השאלון");
      setSaving(false);
    }
  }

  if (!isAdmin || !isValidGrade) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
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
            שאלון חדש - כיתה {grade}
          </h1>
          <p className="text-sm text-gray-500">יצירת שאלון חדש ליומן החוקר</p>
        </div>
      </div>

      {/* Form */}
      {isLoading ? (
        <SkeletonCard />
      ) : (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Questionnaire Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                שם השאלון
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="לדוגמה: שאלון חקר מים"
                disabled={saving}
              />
            </div>

            {/* Unit Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                <BookOpen size={16} className="text-primary" />
                יחידת לימוד
              </label>
              {units.length === 0 ? (
                <p className="text-sm text-gray-500 bg-surface-1 p-4 rounded-lg">
                  אין יחידות לימוד לכיתה זו. יש ליצור יחידה קודם.
                </p>
              ) : (
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {units.map((unit) => (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => setUnitId(unit.id)}
                      disabled={saving}
                      className={`p-4 text-right rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        unitId === unit.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-surface-3 hover:border-primary/50 hover:bg-surface-1"
                      } ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className={`font-medium ${unitId === unit.id ? "text-primary" : "text-foreground"}`}>
                        {unit.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-2">
              <Link href={backUrl}>
                <Button variant="ghost" type="button" disabled={saving}>
                  ביטול
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={!isFormValid || saving || units.length === 0}
                loading={saving}
                rightIcon={Plus}
              >
                צור שאלון
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
