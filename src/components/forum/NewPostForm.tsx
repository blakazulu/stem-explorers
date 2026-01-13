"use client";

import { useState } from "react";
import { createPost } from "@/lib/services/forum";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    await createPost({
      room,
      authorName,
      title,
      content,
    });
    setSubmitting(false);
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 md:p-6 shadow-sm space-y-4">
      <h3 className="font-rubik font-semibold text-lg">פוסט חדש</h3>

      <Input
        label="כותרת"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          תוכן
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 border rounded-lg"
          rows={5}
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "שולח..." : "פרסם"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          ביטול
        </Button>
      </div>
    </form>
  );
}
