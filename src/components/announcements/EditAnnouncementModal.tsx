"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToastActions } from "@/components/ui/Toast";
import { useUpdateAnnouncement } from "@/lib/queries";
import { uploadImage, deleteStorageFile } from "@/lib/utils/imageUpload";
import { X, Pencil, ImagePlus, Trash2 } from "lucide-react";
import type { Announcement, Grade } from "@/types";

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

interface EditAnnouncementModalProps {
  announcement: Announcement;
  isOpen: boolean;
  onClose: () => void;
}

export function EditAnnouncementModal({
  announcement,
  isOpen,
  onClose,
}: EditAnnouncementModalProps) {
  const [content, setContent] = useState(announcement.content);
  const [targetGrade, setTargetGrade] = useState<Grade | "all">(announcement.targetGrade);
  const [imageUrl, setImageUrl] = useState<string | undefined>(announcement.imageUrl);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toast = useToastActions();
  const updateAnnouncement = useUpdateAnnouncement();

  // Reset form when announcement changes or modal opens
  useEffect(() => {
    setContent(announcement.content);
    setTargetGrade(announcement.targetGrade);
    setImageUrl(announcement.imageUrl);
    setNewImageFile(null);
    setImagePreview(null);
  }, [announcement, isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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
      toast.error("שגיאה", "גודל הקובץ חייב להיות עד 15MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setNewImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeNewImage = () => {
    setNewImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeExistingImage = () => {
    setImageUrl(undefined);
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    setSaving(true);
    try {
      let finalImageUrl = imageUrl;

      // If there's a new image, upload it
      if (newImageFile) {
        const path = `announcements/${Date.now()}_${newImageFile.name}`;
        finalImageUrl = await uploadImage(newImageFile, path);

        // Delete old image if exists
        if (announcement.imageUrl) {
          try {
            await deleteStorageFile(announcement.imageUrl);
          } catch {
            // Ignore delete errors
          }
        }
      } else if (imageUrl === undefined && announcement.imageUrl) {
        // User removed the existing image without adding a new one
        try {
          await deleteStorageFile(announcement.imageUrl);
        } catch {
          // Ignore delete errors
        }
      }

      await updateAnnouncement.mutateAsync({
        id: announcement.id,
        data: {
          content: content.trim(),
          targetGrade,
          imageUrl: finalImageUrl,
        },
      });

      toast.success("הפרסום עודכן");
      onClose();
    } catch {
      toast.error("שגיאה", "שגיאה בעדכון הפרסום");
    } finally {
      setSaving(false);
    }
  };

  // Determine what image to show
  const displayImage = imagePreview || imageUrl;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto h-fit z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-xl w-full shadow-2xl animate-scale-in border-0 bg-transparent"
      onClose={onClose}
    >
      <Card padding="none" className="overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-emerald-500/10 to-teal-500/10 px-4 md:px-6 py-4 border-b border-surface-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Pencil size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-rubik font-semibold text-lg text-foreground">
                  עריכת פרסום
                </h3>
                <p className="text-sm text-gray-500">ערוך את תוכן הפרסום</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer"
              aria-label="סגור"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4" dir="rtl">
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
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              תמונה
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {displayImage ? (
              <div className="relative inline-block">
                <img
                  src={displayImage}
                  alt="תצוגה מקדימה"
                  className="max-h-48 rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={imagePreview ? removeNewImage : removeExistingImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
                {!imagePreview && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors cursor-pointer"
                    title="החלף תמונה"
                  >
                    <ImagePlus size={16} />
                  </button>
                )}
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

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              ביטול
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !content.trim()}
              loading={saving}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              שמור שינויים
            </Button>
          </div>
        </div>
      </Card>
    </dialog>
  );
}
