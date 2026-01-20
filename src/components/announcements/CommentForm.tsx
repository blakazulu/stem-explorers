"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToastActions } from "@/components/ui/Toast";
import { useAddAnnouncementComment } from "@/lib/queries";
import { Send } from "lucide-react";
import type { Grade } from "@/types";

interface CommentFormProps {
  announcementId: string;
  authorName: string;
  authorGrade: Grade;
  onCommented?: () => void;
}

export function CommentForm({
  announcementId,
  authorName,
  authorGrade,
  onCommented,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToastActions();
  const addComment = useAddAnnouncementComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await addComment.mutateAsync({
        announcementId,
        comment: {
          content: content.trim(),
          authorName,
          authorGrade,
        },
      });

      setContent("");
      toast.success("התגובה נוספה!");
      onCommented?.();
    } catch {
      toast.error("שגיאה", "שגיאה בהוספת התגובה");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="כתוב תגובה..."
          rows={2}
          className="w-full p-3 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none text-sm"
        />
      </div>
      <Button
        type="submit"
        disabled={submitting || !content.trim()}
        loading={submitting}
        size="sm"
        className="bg-emerald-500 hover:bg-emerald-600 mb-0.5"
      >
        <Send size={16} />
      </Button>
    </form>
  );
}
