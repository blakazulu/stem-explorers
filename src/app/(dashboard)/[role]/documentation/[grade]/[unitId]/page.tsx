"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUnit } from "@/lib/services/units";
import { DocumentationGallery } from "@/components/documentation/DocumentationGallery";
import { createDocumentation } from "@/lib/services/documentation";
import { uploadImage } from "@/lib/utils/imageUpload";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
import type { Grade, Unit, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function DocumentationGalleryPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;
  const unitId = params.unitId as string;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form state
  const [text, setText] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const isTeacherOrAdmin =
    session?.user.role === "teacher" || session?.user.role === "admin";

  // Validate grade and load unit
  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/documentation`);
      return;
    }

    async function loadUnit() {
      setLoading(true);
      try {
        const unitData = await getUnit(unitId);
        if (!unitData || unitData.gradeId !== grade) {
          router.replace(`/${role}/documentation/${grade}`);
          return;
        }
        setUnit(unitData);
      } catch {
        router.replace(`/${role}/documentation/${grade}`);
      }
      setLoading(false);
    }

    loadUnit();
  }, [grade, unitId, role, router]);

  async function handleAddDocumentation() {
    if (!unit || !session) return;
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
        const path = `documentation/${grade}/${unitId}/${Date.now()}-${image.name}`;
        const url = await uploadImage(image, path);
        imageUrls.push(url);
      }

      // Create documentation entry
      await createDocumentation({
        unitId: unitId,
        gradeId: grade,
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

  if (!VALID_GRADES.includes(grade) || loading) {
    return null;
  }

  if (!unit) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/${role}/documentation/${grade}`}
          className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          title="חזרה לבחירת יחידה"
        >
          <ArrowRight size={20} className="text-gray-500" />
        </Link>
        <div className="p-3 bg-secondary/10 rounded-xl">
          <Camera size={24} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            תיעודים - {unit.name}
          </h1>
          <p className="text-sm text-gray-500">כיתה {grade}</p>
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
                <h3 className="font-rubik font-semibold text-foreground">
                  הוסף תיעוד חדש
                </h3>
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
                      {images.length > 0
                        ? `${images.length} תמונות נבחרו`
                        : "גרור תמונות או לחץ לבחירה"}
                    </p>
                    <p className="text-xs text-gray-500">ניתן לבחור מספר תמונות</p>
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
              <Button
                variant="ghost"
                onClick={() => setShowAddForm(false)}
                leftIcon={X}
              >
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
        unitId={unitId}
        gradeId={grade}
        onAddNew={isTeacherOrAdmin ? () => setShowAddForm(true) : undefined}
      />
    </div>
  );
}
