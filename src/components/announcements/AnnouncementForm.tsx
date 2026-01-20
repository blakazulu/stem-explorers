"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToastActions } from "@/components/ui/Toast";
import { useCreateAnnouncement } from "@/lib/queries";
import { uploadImage } from "@/lib/utils/imageUpload";
import { Send, ImagePlus, X, Rocket } from "lucide-react";
import type { Grade } from "@/types";

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface AnnouncementFormProps {
  authorName: string;
  onCreated?: () => void;
}

export function AnnouncementForm({ authorName, onCreated }: AnnouncementFormProps) {
  const [content, setContent] = useState("");
  const [targetGrade, setTargetGrade] = useState<Grade | "all">("all");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToastActions();
  const createAnnouncement = useCreateAnnouncement();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      toast.error("שגיאה", "יש להעלות קובץ תמונה בלבד (JPEG, PNG, GIF, WebP)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("שגיאה", "גודל הקובץ חייב להיות עד 10MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setUploading(true);
    try {
      let imageUrl: string | undefined;

      if (imageFile) {
        const path = `announcements/${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImage(imageFile, path);
      }

      await createAnnouncement.mutateAsync({
        content: content.trim(),
        targetGrade,
        imageUrl,
        authorName,
      });

      // Reset form
      setContent("");
      setTargetGrade("all");
      removeImage();
      toast.success("הפרסום נוסף בהצלחה!");
      onCreated?.();
    } catch {
      toast.error("שגיאה", "שגיאה בהוספת הפרסום");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-500/10 to-teal-500/10 px-4 md:px-6 py-4 border-b border-surface-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Rocket size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-rubik font-semibold text-lg text-foreground">
              פרסום חדש
            </h3>
            <p className="text-sm text-gray-500">שתף תוכן עם התלמידים</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
        {/* Grade Selector */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            כיתת יעד
          </label>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setTargetGrade("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                targetGrade === "all"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-surface-1 text-foreground hover:bg-surface-2"
              }`}
            >
              כל הכיתות
            </button>
            {grades.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => setTargetGrade(grade)}
                className={`w-10 h-10 rounded-lg font-rubik font-bold transition-all cursor-pointer ${
                  targetGrade === grade
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-surface-1 text-foreground hover:bg-surface-2"
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            תוכן הפרסום
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            placeholder="כתוב את ההודעה לתלמידים..."
            rows={4}
            required
          />
          {content.length > 0 && (
            <p className="text-xs text-gray-400 mt-1 text-left">
              {content.length} תווים
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            תמונה (אופציונלי)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="תצוגה מקדימה"
                className="max-h-48 rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-surface-3 rounded-xl text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-all cursor-pointer"
            >
              <ImagePlus size={20} />
              <span>הוסף תמונה</span>
            </button>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={uploading || !content.trim()}
            loading={uploading}
            loadingText="מפרסם..."
            rightIcon={Send}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            פרסם
          </Button>
        </div>
      </form>
    </Card>
  );
}
