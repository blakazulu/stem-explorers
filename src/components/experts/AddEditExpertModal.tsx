"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { X, Upload, User } from "lucide-react";
import { uploadImage } from "@/lib/utils/imageUpload";
import type { Expert, Grade, ConfigurableRole } from "@/types";

const ALL_ROLES: ConfigurableRole[] = ["teacher", "parent", "student"];
const ROLE_LABELS: Record<ConfigurableRole, string> = {
  teacher: "מורים",
  parent: "הורים",
  student: "תלמידים",
};

interface AddEditExpertModalProps {
  isOpen: boolean;
  currentGrade: Grade;
  expert?: Expert | null;
  onSave: (data: Omit<Expert, "id" | "order" | "createdAt">) => Promise<void>;
  onClose: () => void;
}

export function AddEditExpertModal({
  isOpen,
  currentGrade,
  expert,
  onSave,
  onClose,
}: AddEditExpertModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGlobalGrade, setIsGlobalGrade] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<ConfigurableRole[]>([...ALL_ROLES]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAllRoles = selectedRoles.length === ALL_ROLES.length;

  const isEdit = !!expert;

  useEffect(() => {
    if (expert) {
      setName(expert.name);
      setTitle(expert.title);
      setDescription(expert.description);
      setAvailability(expert.availability);
      setImageUrl(expert.imageUrl);
      setImagePreview(expert.imageUrl);
      setIsGlobalGrade(expert.grade === null);
      // Handle legacy experts without roles field (treat as all roles)
      setSelectedRoles(expert.roles?.length ? expert.roles : [...ALL_ROLES]);
    } else {
      setName("");
      setTitle("");
      setDescription("");
      setAvailability("");
      setImageUrl("");
      setImagePreview(null);
      setIsGlobalGrade(true);
      setSelectedRoles([...ALL_ROLES]);
    }
    setError("");
  }, [expert, isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("יש להעלות קובץ תמונה בלבד");
      return;
    }

    // Revoke previous preview URL if it was a blob
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    // Show preview immediately using createObjectURL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Upload to Firebase
    setUploading(true);
    setError("");
    try {
      const timestamp = Date.now();
      const path = `experts/${timestamp}-${file.name}`;
      const url = await uploadImage(file, path, 400);
      setImageUrl(url);
    } catch {
      // Revoke the blob URL on failure to prevent memory leak
      URL.revokeObjectURL(previewUrl);
      setError("שגיאה בהעלאת התמונה");
      setImagePreview(expert?.imageUrl || null);
    }
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("יש להזין שם");
      return;
    }
    if (!title.trim()) {
      setError("יש להזין תפקיד");
      return;
    }
    if (!description.trim()) {
      setError("יש להזין תיאור");
      return;
    }

    if (selectedRoles.length === 0) {
      setError("יש לבחור לפחות תפקיד אחד");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        title: title.trim(),
        description: description.trim(),
        availability: availability.trim(),
        imageUrl,
        grade: isGlobalGrade ? null : currentGrade,
        roles: selectedRoles,
      });
      onClose();
    } catch {
      setError("שגיאה בשמירה");
    }
    setSaving(false);
  };

  const toggleRole = (role: ConfigurableRole) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const toggleAllRoles = () => {
    if (isAllRoles) {
      // Can't deselect all - keep at least one
      setSelectedRoles(["teacher"]);
    } else {
      setSelectedRoles([...ALL_ROLES]);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-xl w-[95vw] shadow-2xl animate-scale-in border-0 overflow-hidden"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-2 bg-surface-1">
          <h2 className="text-xl font-rubik font-bold text-foreground">
            {isEdit ? "עריכת מומחה" : "הוספת מומחה"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer"
            aria-label="סגור חלון"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Image Upload */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-dashed border-surface-3 hover:border-primary cursor-pointer transition-colors group"
            >
              {imagePreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="תצוגה מקדימה"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="text-white" size={24} />
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-surface-1 flex flex-col items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                  <User size={28} />
                  <span className="text-xs mt-1">תמונה</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-2">לחץ להעלאת תמונה (אופציונלי)</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              שם המומחה *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 100))}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-3 bg-surface-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="שם מלא"
              maxLength={100}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              תפקיד / תואר *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-3 bg-surface-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="לדוגמה: מומחה לרובוטיקה"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              תיאור *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-3 bg-surface-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              placeholder="תיאור המומחה והתמחותו..."
              rows={3}
              maxLength={500}
            />
            <p className={`text-xs mt-1 text-left ${description.length >= 450 ? 'text-amber-500' : 'text-gray-400'}`}>
              {description.length}/500
            </p>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              זמינות
            </label>
            <input
              type="text"
              value={availability}
              onChange={(e) => setAvailability(e.target.value.slice(0, 200))}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-3 bg-surface-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="לדוגמה: ימים א-ג, 9:00-14:00"
              maxLength={200}
            />
          </div>

          {/* Visibility Settings */}
          <div className="space-y-3 p-4 bg-surface-1 rounded-xl">
            <p className="text-sm font-medium text-foreground mb-2">הגדרות תצוגה</p>

            {/* Roles Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allRoles"
                  checked={isAllRoles}
                  onChange={toggleAllRoles}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="allRoles" className="text-sm text-foreground cursor-pointer font-medium">
                  כל התפקידים
                </label>
              </div>
              <div className="flex flex-wrap gap-3 mr-6">
                {ALL_ROLES.map(role => (
                  <label key={role} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className={`text-sm ${selectedRoles.includes(role) ? 'text-foreground' : 'text-gray-400'}`}>
                      {ROLE_LABELS[role]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grade Selection */}
            <div className="flex items-center gap-3 pt-2 border-t border-surface-2">
              <input
                type="checkbox"
                id="isGlobalGrade"
                checked={isGlobalGrade}
                onChange={(e) => setIsGlobalGrade(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label htmlFor="isGlobalGrade" className="text-sm text-foreground cursor-pointer">
                כל הכיתות
              </label>
              {!isGlobalGrade && (
                <span className="text-xs text-gray-500 mr-auto">
                  (יוצג רק בכיתה {currentGrade})
                </span>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-error bg-error/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-surface-2 bg-surface-1">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={saving}
            className="flex-1"
          >
            ביטול
          </Button>
          <Button
            type="submit"
            loading={saving}
            disabled={uploading}
            className="flex-1"
          >
            {isEdit ? "שמור שינויים" : "הוסף מומחה"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
