"use client";

import { useState } from "react";
import { addReply } from "@/lib/services/forum";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToastActions } from "@/components/ui/Toast";
import { Trash2, MessageCircle, Calendar, Send } from "lucide-react";
import type { ForumPost } from "@/types";

interface PostCardProps {
  post: ForumPost;
  currentUserName: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onReplyAdded: () => void;
  index?: number;
}

// Generate a consistent color based on name
function getAvatarColor(name: string): string {
  const colors = [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-role-admin",
    "bg-role-teacher",
    "bg-role-student",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash;
  }
  return colors[Math.abs(hash) % colors.length];
}

export function PostCard({
  post,
  currentUserName,
  isAdmin,
  onDelete,
  onReplyAdded,
  index = 0,
}: PostCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToastActions();

  const canDelete = isAdmin || post.authorName === currentUserName;

  async function handleReply() {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await addReply(post.id, {
        authorName: currentUserName,
        content: replyContent,
      });
      setReplyContent("");
      setShowReplyForm(false);
      onReplyAdded();
    } catch {
      toast.error("שגיאה", "שגיאה בשליחת התגובה");
    }
    setSubmitting(false);
  }

  return (
    <Card
      padding="none"
      className={`overflow-hidden animate-slide-up stagger-${Math.min(index + 1, 6)}`}
    >
      <div className="p-4 md:p-6">
        {/* Header with avatar */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div
            className={`shrink-0 w-12 h-12 rounded-full ${getAvatarColor(post.authorName)} flex items-center justify-center text-white font-rubik font-bold text-lg`}
          >
            {post.authorName.charAt(0)}
          </div>

          {/* Author info and title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-rubik font-semibold text-lg text-foreground">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="font-medium">{post.authorName}</span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} />
                {post.createdAt.toLocaleDateString("he-IL")}
              </span>
            </div>
          </div>

          {/* Delete button */}
          {canDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="shrink-0 p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200 cursor-pointer"
              title="מחק פוסט"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-foreground leading-relaxed">{post.content}</p>

        {/* Replies section */}
        {post.replies.length > 0 && (
          <div className="mt-6 pt-4 border-t border-surface-2 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MessageCircle size={14} />
              <span className="font-medium">{post.replies.length} תגובות</span>
            </div>
            <div className="space-y-2">
              {post.replies.map((reply, i) => (
                <div
                  key={reply.id || `legacy_${i}`}
                  className="flex items-start gap-3 bg-surface-1 rounded-xl p-3 transition-colors hover:bg-surface-2"
                >
                  {/* Mini avatar */}
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full ${getAvatarColor(reply.authorName)} flex items-center justify-center text-white text-sm font-medium`}
                  >
                    {reply.authorName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{reply.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {reply.authorName} •{" "}
                      {reply.createdAt?.toLocaleDateString("he-IL")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply form */}
        {showReplyForm ? (
          <div className="mt-4 space-y-3 animate-slide-up">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full p-4 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              placeholder="כתוב תגובה..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReply}
                disabled={submitting || !replyContent.trim()}
                loading={submitting}
                loadingText="שולח..."
                rightIcon={Send}
              >
                שלח
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent("");
                }}
              >
                ביטול
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowReplyForm(true)}
            className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors"
          >
            <MessageCircle size={16} />
            הוסף תגובה
          </button>
        )}
      </div>
    </Card>
  );
}
