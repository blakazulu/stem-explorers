"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  getUnitsByGrade,
  createUnit,
  updateUnit,
  deleteUnit,
} from "@/lib/services/units";
import { uploadImage } from "@/lib/utils/imageUpload";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonList } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FileText,
  Plus,
  Upload,
  BookOpen,
  File,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Hash,
  CheckCircle,
} from "lucide-react";
import type { Unit, Grade } from "@/types";

export default function WorkPlansPage() {
  const { session } = useAuth();
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState<Grade>("א");
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [order, setOrder] = useState(0);
  const [introFile, setIntroFile] = useState<File | null>(null);
  const [unitFile, setUnitFile] = useState<File | null>(null);

  const isAdmin = session?.user.role === "admin";
  const isTeacher = session?.user.role === "teacher";
  const canManage = isAdmin || isTeacher;

  const loadUnits = useCallback(async () => {
    setLoading(true);
    const data = await getUnitsByGrade(selectedGrade);
    setUnits(data);
    setLoading(false);
  }, [selectedGrade]);

  useEffect(() => {
    if (!canManage) {
      router.push("/dashboard");
      return;
    }
    loadUnits();
  }, [canManage, router, loadUnits]);

  function resetForm() {
    setName("");
    setOrder(units.length);
    setIntroFile(null);
    setUnitFile(null);
    setEditingUnit(null);
    setShowForm(false);
  }

  function handleEdit(unit: Unit) {
    setEditingUnit(unit);
    setName(unit.name);
    setOrder(unit.order);
    setShowForm(true);
  }

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);

    try {
      let introFileUrl = editingUnit?.introFileUrl || "";
      let unitFileUrl = editingUnit?.unitFileUrl || "";

      if (introFile) {
        const path = `units/${selectedGrade}/intro_${Date.now()}.webp`;
        introFileUrl = await uploadImage(introFile, path);
      }

      if (unitFile) {
        const path = `units/${selectedGrade}/unit_${Date.now()}.webp`;
        unitFileUrl = await uploadImage(unitFile, path);
      }

      if (editingUnit) {
        await updateUnit(editingUnit.id, {
          name,
          order,
          introFileUrl,
          unitFileUrl,
        });
      } else {
        await createUnit({
          gradeId: selectedGrade,
          name,
          order,
          introFileUrl,
          unitFileUrl,
        });
      }

      resetForm();
      await loadUnits();
    } catch (error) {
      console.error("Error saving unit:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteUnit(deleteId);
    setDeleteId(null);
    await loadUnits();
  }

  if (!canManage) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-role-teacher/10 rounded-xl">
            <FileText size={24} className="text-role-teacher" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              תוכניות עבודה
            </h1>
            <p className="text-sm text-gray-500">ניהול יחידות לימוד לפי כיתות</p>
          </div>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} rightIcon={Plus}>
            יחידה חדשה
          </Button>
        )}
      </div>

      {/* Grade Selector */}
      <Card>
        <GradeSelector selected={selectedGrade} onSelect={setSelectedGrade} />
      </Card>

      {/* Unit Form */}
      {showForm && (
        <Card padding="none" className="overflow-hidden animate-slide-up">
          {/* Form Header */}
          <div className="bg-gradient-to-l from-role-teacher/10 to-primary/10 px-4 md:px-6 py-4 border-b border-surface-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-role-teacher/20 rounded-lg">
                {editingUnit ? (
                  <Edit2 size={20} className="text-role-teacher" />
                ) : (
                  <Plus size={20} className="text-role-teacher" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-rubik font-semibold text-foreground">
                  {editingUnit ? "עריכת יחידה" : "יחידה חדשה"}
                </h2>
                <p className="text-sm text-gray-500">
                  כיתה {selectedGrade}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-6">
            {/* Unit Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                שם היחידה
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="הקלד שם יחידה"
              />
            </div>

            {/* Display Order */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Hash size={16} className="text-gray-500" />
                סדר תצוגה
              </label>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                className="w-24"
              />
            </div>

            {/* Intro File Upload */}
            <div className="p-4 bg-surface-1 rounded-xl space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <BookOpen size={16} className="text-secondary" />
                קובץ מבוא
                {editingUnit?.introFileUrl && (
                  <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                    <CheckCircle size={12} />
                    קיים קובץ
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setIntroFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center gap-3 p-4 border-2 border-dashed border-surface-3 rounded-xl hover:border-secondary hover:bg-secondary/5 transition-all duration-200">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Upload size={20} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {introFile ? introFile.name : "גרור קובץ או לחץ לבחירה"}
                    </p>
                    <p className="text-xs text-gray-500">
                      תמונה או PDF
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Unit File Upload */}
            <div className="p-4 bg-surface-1 rounded-xl space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <File size={16} className="text-primary" />
                קובץ יחידה
                {editingUnit?.unitFileUrl && (
                  <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                    <CheckCircle size={12} />
                    קיים קובץ
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setUnitFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center gap-3 p-4 border-2 border-dashed border-surface-3 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Upload size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {unitFile ? unitFile.name : "גרור קובץ או לחץ לבחירה"}
                    </p>
                    <p className="text-xs text-gray-500">
                      תמונה או PDF
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-surface-2">
              <Button variant="ghost" onClick={resetForm} leftIcon={X}>
                ביטול
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={saving || !name.trim()}
                loading={saving}
                loadingText="שומר..."
              >
                {editingUnit ? "עדכן יחידה" : "צור יחידה"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Units List */}
      {loading ? (
        <SkeletonList count={4} />
      ) : units.length === 0 ? (
        <EmptyState
          icon="book-open"
          title={`אין יחידות לכיתה ${selectedGrade}`}
          description="צור יחידה חדשה להתחלת העבודה"
          action={
            <Button onClick={() => setShowForm(true)} rightIcon={Plus}>
              יחידה חדשה
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {units.map((unit, index) => (
            <Card
              key={unit.id}
              interactive
              className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Unit Icon */}
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <BookOpen size={24} className="text-primary" />
                  </div>

                  {/* Unit Info */}
                  <div>
                    <h3 className="font-rubik font-semibold text-foreground">
                      {unit.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      כיתה {unit.gradeId} • סדר: {unit.order}
                    </p>

                    {/* File Links */}
                    <div className="flex gap-4 mt-3">
                      {unit.introFileUrl && (
                        <a
                          href={unit.introFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-secondary/80 transition-colors"
                        >
                          <BookOpen size={14} />
                          קובץ מבוא
                          <ExternalLink size={12} />
                        </a>
                      )}
                      {unit.unitFileUrl && (
                        <a
                          href={unit.unitFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          <File size={14} />
                          קובץ יחידה
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(unit)}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 cursor-pointer"
                    title="ערוך"
                  >
                    <Edit2 size={18} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteId(unit.id)}
                      className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200 cursor-pointer"
                      title="מחק"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="מחיקת יחידה"
        message="האם אתה בטוח שברצונך למחוק יחידה זו? כל התוכן המשויך ימחק גם כן."
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
