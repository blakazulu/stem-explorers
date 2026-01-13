"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { getUnitsByGrade } from "@/lib/services/units";
import { DocumentationGallery } from "@/components/documentation/DocumentationGallery";
import { createDocumentation } from "@/lib/services/documentation";
import { uploadImage } from "@/lib/utils/imageUpload";
import { Button } from "@/components/ui/Button";
import type { Grade, Unit } from "@/types";

export default function DocumentationPage() {
  const { session } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(
    session?.user.grade || null
  );
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const isTeacherOrAdmin = session?.user.role === "teacher" || session?.user.role === "admin";

  const loadUnits = useCallback(async () => {
    if (!selectedGrade) return;
    try {
      setError(null);
      const data = await getUnitsByGrade(selectedGrade);
      setUnits(data);
    } catch {
      setError("שגיאה בטעינת יחידות");
    }
  }, [selectedGrade]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  async function handleAddDocumentation() {
    if (!selectedUnit || !selectedGrade || !session) return;
    if (images.length === 0 && !text.trim()) {
      setError("יש להוסיף תמונות או טקסט");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const image of images) {
        const path = `documentation/${selectedGrade}/${selectedUnit.id}/${Date.now()}-${image.name}`;
        const url = await uploadImage(image, path);
        imageUrls.push(url);
      }

      // Create documentation entry
      await createDocumentation({
        unitId: selectedUnit.id,
        gradeId: selectedGrade,
        images: imageUrls,
        text: text.trim(),
        teacherName: session.user.name,
      });

      // Reset form and refresh gallery
      setText("");
      setImages([]);
      setShowAddForm(false);
      setRefreshKey((k) => k + 1);
    } catch {
      setError("שגיאה בהוספת תיעוד");
    }

    setUploading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-rubik font-bold">תיעודים</h1>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-lg">{error}</div>
      )}

      {isTeacherOrAdmin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            בחר שכבה
          </label>
          <GradeSelector selected={selectedGrade} onSelect={setSelectedGrade} />
        </div>
      )}

      {selectedGrade && !selectedUnit && (
        <div>
          <h2 className="text-lg font-rubik font-semibold mb-4">בחר יחידה</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <button
                key={unit.id}
                onClick={() => setSelectedUnit(unit)}
                className="text-right p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="font-rubik font-semibold">{unit.name}</h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedUnit && selectedGrade && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-rubik font-bold">
              תיעודים - {selectedUnit.name}
            </h2>
            <button
              onClick={() => setSelectedUnit(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              חזור לרשימה
            </button>
          </div>

          {showAddForm && isTeacherOrAdmin && (
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6 space-y-4">
              <h3 className="font-rubik font-semibold">הוסף תיעוד חדש</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תמונות
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setImages(Array.from(e.target.files || []))}
                  className="w-full"
                />
                {images.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {images.length} תמונות נבחרו
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תיאור
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="הוסף תיאור לתיעוד..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddDocumentation} disabled={uploading}>
                  {uploading ? "מעלה..." : "שמור תיעוד"}
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  ביטול
                </Button>
              </div>
            </div>
          )}

          <DocumentationGallery
            key={refreshKey}
            unitId={selectedUnit.id}
            gradeId={selectedGrade}
            onAddNew={isTeacherOrAdmin ? () => setShowAddForm(true) : undefined}
          />
        </div>
      )}
    </div>
  );
}
