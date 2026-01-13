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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-rubik font-bold">תוכניות עבודה</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>יחידה חדשה</Button>
        )}
      </div>

      <GradeSelector selected={selectedGrade} onSelect={setSelectedGrade} />

      {showForm && (
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">
            {editingUnit ? "עריכת יחידה" : "יחידה חדשה"}
          </h2>

          <div>
            <label className="block text-sm font-medium mb-1">שם היחידה</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="הקלד שם יחידה"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">סדר תצוגה</label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              קובץ מבוא {editingUnit?.introFileUrl && "(קיים קובץ)"}
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setIntroFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              קובץ יחידה {editingUnit?.unitFileUrl && "(קיים קובץ)"}
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setUnitFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "שומר..." : editingUnit ? "עדכן" : "צור יחידה"}
            </Button>
            <Button variant="outline" onClick={resetForm}>
              ביטול
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">טוען יחידות...</div>
      ) : units.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          אין יחידות לכיתה {selectedGrade}
        </p>
      ) : (
        <div className="space-y-3">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="bg-white rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all duration-200 hover:shadow-md"
            >
              <div>
                <h3 className="font-medium">{unit.name}</h3>
                <p className="text-sm text-gray-500">
                  כיתה {unit.gradeId} | סדר: {unit.order}
                </p>
                <div className="flex gap-4 mt-2 text-xs">
                  {unit.introFileUrl && (
                    <a
                      href={unit.introFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline cursor-pointer transition-colors hover:text-primary/80"
                    >
                      קובץ מבוא
                    </a>
                  )}
                  {unit.unitFileUrl && (
                    <a
                      href={unit.unitFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline cursor-pointer transition-colors hover:text-primary/80"
                    >
                      קובץ יחידה
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(unit)}
                  className="text-sm text-primary hover:underline cursor-pointer transition-colors hover:text-primary/80"
                >
                  ערוך
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setDeleteId(unit.id)}
                    className="text-sm text-error hover:underline cursor-pointer transition-colors hover:text-error/80"
                  >
                    מחק
                  </button>
                )}
              </div>
            </div>
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
