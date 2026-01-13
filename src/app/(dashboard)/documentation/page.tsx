"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { getUnitsByGrade } from "@/lib/services/units";
import { DocumentationGallery } from "@/components/documentation/DocumentationGallery";
import { createDocumentation } from "@/lib/services/documentation";
import { uploadImage } from "@/lib/utils/imageUpload";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Camera,
  Upload,
  ArrowRight,
  AlertCircle,
  X,
  BookOpen,
  Image,
  FileText,
} from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const isTeacherOrAdmin = session?.user.role === "teacher" || session?.user.role === "admin";

  const loadUnits = useCallback(async () => {
    if (!selectedGrade) return;
    setLoading(true);
    try {
      setError(null);
      const data = await getUnitsByGrade(selectedGrade);
      setUnits(data);
    } catch {
      setError("שגיאה בטעינת יחידות");
    }
    setLoading(false);
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
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-secondary/10 rounded-xl">
          <Camera size={24} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            תיעודים
          </h1>
          <p className="text-sm text-gray-500">
            תיעוד פעילויות ותוצרים מיחידות הלימוד
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 bg-error/10 text-error p-4 rounded-xl animate-slide-up">
          <AlertCircle size={20} />
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={() => setError(null)}
            className="mr-auto p-1 hover:bg-error/20 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Grade Selector for Teachers/Admins */}
      {isTeacherOrAdmin && (
        <Card>
          <GradeSelector selected={selectedGrade} onSelect={setSelectedGrade} />
        </Card>
      )}

      {/* Unit Selection */}
      {selectedGrade && !selectedUnit && (
        <div className="space-y-4">
          <h2 className="text-lg font-rubik font-semibold text-foreground">בחר יחידה</h2>

          {loading ? (
            <SkeletonGrid count={6} />
          ) : units.length === 0 ? (
            <EmptyState
              icon="book-open"
              title={`אין יחידות לכיתה ${selectedGrade}`}
              description="יש ליצור יחידות לימוד בדף תוכניות עבודה"
            />
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {units.map((unit, index) => (
                <Card
                  key={unit.id}
                  interactive
                  onClick={() => setSelectedUnit(unit)}
                  className={`animate-slide-up`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-rubik font-semibold text-foreground">{unit.name}</h3>
                      <p className="text-sm text-gray-500">לחץ לצפייה בתיעודים</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Unit View */}
      {selectedUnit && selectedGrade && (
        <div className="space-y-4 animate-slide-up">
          {/* Unit Header */}
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen size={20} className="text-primary" />
                </div>
                <h2 className="text-lg font-rubik font-bold text-foreground">
                  תיעודים - {selectedUnit.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-foreground cursor-pointer transition-colors"
              >
                <ArrowRight size={18} />
                <span className="text-sm">חזור לרשימה</span>
              </button>
            </div>
          </Card>

          {/* Add Documentation Form */}
          {showAddForm && isTeacherOrAdmin && (
            <Card padding="none" className="overflow-hidden animate-slide-up">
              {/* Form Header */}
              <div className="bg-gradient-to-l from-secondary/10 to-primary/10 px-4 md:px-6 py-4 border-b border-surface-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/20 rounded-lg">
                    <Camera size={20} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-rubik font-semibold text-foreground">הוסף תיעוד חדש</h3>
                    <p className="text-sm text-gray-500">העלה תמונות ותיאור</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 space-y-4">
                {/* Images Upload */}
                <div className="p-4 bg-surface-1 rounded-xl space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Image size={16} className="text-secondary" />
                    תמונות
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setImages(Array.from(e.target.files || []))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-3 p-4 border-2 border-dashed border-surface-3 rounded-xl hover:border-secondary hover:bg-secondary/5 transition-all duration-200">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Upload size={20} className="text-secondary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {images.length > 0 ? `${images.length} תמונות נבחרו` : "גרור תמונות או לחץ לבחירה"}
                        </p>
                        <p className="text-xs text-gray-500">
                          ניתן לבחור מספר תמונות
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Description */}
                <div className="p-4 bg-surface-1 rounded-xl space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText size={16} className="text-primary" />
                    תיאור
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full p-3 border border-surface-2 rounded-xl bg-surface-0 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    rows={3}
                    placeholder="הוסף תיאור לתיעוד..."
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-surface-2">
                  <Button variant="ghost" onClick={() => setShowAddForm(false)} leftIcon={X}>
                    ביטול
                  </Button>
                  <Button
                    onClick={handleAddDocumentation}
                    disabled={uploading}
                    loading={uploading}
                    loadingText="מעלה..."
                  >
                    שמור תיעוד
                  </Button>
                </div>
              </div>
            </Card>
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
