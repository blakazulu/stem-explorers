"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { UploadOverlay } from "@/components/ui/UploadOverlay";
import { X, Upload, User } from "lucide-react";
import { uploadImageWithProgress } from "@/lib/utils/imageUpload";
import type { StaffMember } from "@/types";

interface AddEditStaffModalProps {
  isOpen: boolean;
  member?: StaffMember | null;
  onSave: (data: { name: string; description: string; imageUrl: string }) => Promise<void>;
  onClose: () => void;
}

export function AddEditStaffModal({
  isOpen,
  member,
  onSave,
  onClose,
}: AddEditStaffModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!member;

  useEffect(() => {
    if (member) {
      setName(member.name);
      setDescription(member.description);
      setImageUrl(member.imageUrl);
      setImagePreview(member.imageUrl);
    } else {
      setName("");
      setDescription("");
      setImageUrl("");
      setImagePreview(null);
    }
    setError("");
  }, [member, isOpen]);

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

    // Show preview immediately using createObjectURL (more efficient than FileReader)
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Upload to Firebase
    setUploading(true);
    setUploadProgress(0);
    setError("");
    try {
      const timestamp = Date.now();
      const path = `staff/${timestamp}-${file.name}`;
      const url = await uploadImageWithProgress(file, path, (percent) => {
        setUploadProgress(percent);
      });
      setImageUrl(url);
    } catch {
      setError("שגיאה בהעלאת התמונה");
      setImagePreview(member?.imageUrl || null);
    }
    setUploading(false);
    setUploadProgress(0);

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
    if (!description.trim()) {
      setError("יש להזין תיאור");
      return;
    }
    if (!imageUrl) {
      setError("יש להעלות תמונה");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        imageUrl,
      });
      onClose();
    } catch {
      setError("שגיאה בשמירה");
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-md w-[95vw] shadow-2xl animate-scale-in border-0 overflow-hidden"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-2 bg-surface-1">
          <h2 className="text-xl font-rubik font-bold text-foreground">
            {isEdit ? "עריכת איש צוות" : "הוספת איש צוות"}
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
        <div className="p-6 space-y-5">
          {/* Image Upload */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-dashed border-surface-3 hover:border-primary cursor-pointer transition-colors group"
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
                  <User size={32} />
                  <span className="text-xs mt-1">העלאת תמונה</span>
                </div>
              )}
              {uploading && <UploadOverlay progress={uploadProgress} />}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-2">לחץ להעלאת תמונה</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              שם
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-3 bg-surface-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              placeholder="שם מלא"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              תיאור
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              className="w-full px-4 py-2.5 rounded-xl border border-surface-3 bg-surface-0 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              placeholder="תפקיד או תיאור קצר"
              rows={3}
              maxLength={200}
            />
            <p className={`text-xs mt-1 text-left ${description.length >= 180 ? 'text-amber-500' : 'text-gray-400'}`}>
              {description.length}/200
            </p>
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
            {isEdit ? "שמור שינויים" : "הוסף"}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
