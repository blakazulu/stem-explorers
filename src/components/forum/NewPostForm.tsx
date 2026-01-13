"use client";

import { useState } from "react";
import { createPost } from "@/lib/services/forum";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PenLine, Send, X, AlertCircle } from "lucide-react";
import type { ForumRoom } from "@/types";

interface NewPostFormProps {
  room: ForumRoom;
  authorName: string;
  onCreated: () => void;
  onCancel: () => void;
}

export function NewPostForm({ room, authorName, onCreated, onCancel }: NewPostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await createPost({
        room,
        authorName,
        title,
        content,
      });
      onCreated();
    } catch {
      setError("שגיאה בפרסום הפוסט");
    }
    setSubmitting(false);
  }

  return (
    <Card padding="none" className="overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-l from-primary/10 to-secondary/10 px-4 md:px-6 py-4 border-b border-surface-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <PenLine size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-rubik font-semibold text-lg text-foreground">
              פוסט חדש
            </h3>
            <p className="text-sm text-gray-500">שתף את המחשבות שלך עם הקהילה</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 bg-error/10 text-error p-3 rounded-lg text-sm">
            <AlertCircle size={16} />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="p-1 hover:bg-error/20 rounded transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <Input
          label="כותרת"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="נושא הפוסט..."
          required
        />

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            תוכן
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            placeholder="כתוב את תוכן הפוסט כאן..."
            rows={5}
            required
          />
          {content.length > 0 && (
            <p className="text-xs text-gray-400 mt-1 text-left">
              {content.length} תווים
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            leftIcon={X}
          >
            ביטול
          </Button>
          <Button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            loading={submitting}
            loadingText="שולח..."
            rightIcon={Send}
          >
            פרסם
          </Button>
        </div>
      </form>
    </Card>
  );
}
