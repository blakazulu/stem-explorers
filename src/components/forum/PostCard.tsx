"use client";

import { useState } from "react";
import { addReply } from "@/lib/services/forum";
import { Button } from "@/components/ui/Button";
import type { ForumPost } from "@/types";

interface PostCardProps {
  post: ForumPost;
  currentUserName: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onReplyAdded: () => void;
}

export function PostCard({
  post,
  currentUserName,
  isAdmin,
  onDelete,
  onReplyAdded,
}: PostCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canDelete = isAdmin || post.authorName === currentUserName;

  async function handleReply() {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    await addReply(post.id, {
      authorName: currentUserName,
      content: replyContent,
    });
    setReplyContent("");
    setShowReplyForm(false);
    setSubmitting(false);
    onReplyAdded();
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-rubik font-semibold text-lg">{post.title}</h3>
          <p className="text-sm text-gray-500">
            {post.authorName} • {post.createdAt.toLocaleDateString("he-IL")}
          </p>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-sm text-error hover:underline cursor-pointer transition-colors hover:text-error/80"
          >
            מחק
          </button>
        )}
      </div>

      <p className="text-foreground mb-4">{post.content}</p>

      {post.replies.length > 0 && (
        <div className="border-t pt-4 mt-4 space-y-3">
          <h4 className="font-medium text-sm text-gray-600">תגובות</h4>
          {post.replies.map((reply, i) => (
            <div key={reply.id || `legacy_${i}`} className="bg-gray-50 rounded-lg p-3 transition-colors hover:bg-gray-100">
              <p className="text-sm">{reply.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {reply.authorName} • {reply.createdAt?.toLocaleDateString("he-IL")}
              </p>
            </div>
          ))}
        </div>
      )}

      {showReplyForm ? (
        <div className="mt-4 space-y-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="כתוב תגובה..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleReply} disabled={submitting}>
              {submitting ? "שולח..." : "שלח"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowReplyForm(false)}
            >
              ביטול
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowReplyForm(true)}
          className="mt-4 text-sm text-primary hover:underline cursor-pointer transition-colors hover:text-primary/80"
        >
          הוסף תגובה
        </button>
      )}
    </div>
  );
}
