"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useToastActions } from "@/components/ui/Toast";
import { useAddChallengeComment } from "@/lib/queries";
import { uploadImage } from "@/lib/utils/imageUpload";
import { Send, ImagePlus, X } from "lucide-react";
import type { Grade } from "@/types";

interface ChallengeCommentFormProps {
  challengeId: string;
  authorName: string;
  authorGrade: Grade;
  onCommented?: () => void;
}

export function ChallengeCommentForm({
  challengeId,
  authorName,
  authorGrade,
  onCommented,
}: ChallengeCommentFormProps) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToastActions();
  const addComment = useAddChallengeComment();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("שגיאה", "יש לבחור קובץ תמונה");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("שגיאה", "גודל התמונה חורג מ-5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      let imageUrl: string | undefined;

      // Upload image if selected
      if (imageFile) {
        const path = `challenges/comments/${challengeId}/${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImage(imageFile, path);
      }

      await addComment.mutateAsync({
        challengeId,
        comment: {
          content: content.trim(),
          authorName,
          authorGrade,
          imageUrl,
        },
      });

      setContent("");
      removeImage();
      toast.success("התגובה נוספה!");
      onCommented?.();
    } catch {
      toast.error("שגיאה", "שגיאה בהוספת התגובה");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Image preview */}
      {imagePreview && (
        <div className="relative inline-block">
          <img
            src={imagePreview}
            alt="תצוגה מקדימה"
            className="max-h-32 rounded-lg shadow-sm"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            aria-label="הסר תמונה"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="כתוב תגובה..."
            rows={2}
            className="w-full p-3 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-sm"
          />
        </div>

        {/* Image upload button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={submitting}
          className="mb-0.5"
          title="הוסף תמונה"
        >
          <ImagePlus size={16} />
        </Button>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={submitting || !content.trim()}
          loading={submitting}
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 mb-0.5"
        >
          <Send size={16} />
        </Button>
      </div>
    </form>
  );
}
