"use client";

import { useState, useEffect } from "react";
import { addReply } from "@/lib/services/forum";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToastActions } from "@/components/ui/Toast";
import { Trash2, MessageCircle, Calendar, Send, Pin, PinOff, Pencil, X, Check } from "lucide-react";
import { LinkifiedText } from "./LinkifiedText";
import { LinkPreview, extractUrls } from "./LinkPreview";
import type { ForumPost } from "@/types";

interface PostCardProps {
  post: ForumPost;
  currentUserName: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onEdit?: (id: string, title: string, content: string) => void;
  onPin?: (id: string, pinned: boolean) => void;
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
  onEdit,
  onPin,
  onReplyAdded,
  index = 0,
}: PostCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const toast = useToastActions();

  const canDelete = isAdmin || post.authorName === currentUserName;

  // Sync edit fields when post data changes externally (e.g., another admin edited)
  useEffect(() => {
    if (!isEditing) {
      setEditTitle(post.title);
      setEditContent(post.content);
    }
  }, [post.title, post.content, isEditing]);

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

  async function handleSaveEdit() {
    if (!editTitle.trim() || !editContent.trim()) return;
    if (!onEdit) return;
    setSaving(true);
    try {
      await onEdit(post.id, editTitle, editContent);
      setIsEditing(false);
    } catch {
      // Error is handled by parent
    }
    setSaving(false);
  }

  function handleCancelEdit() {
    setEditTitle(post.title);
    setEditContent(post.content);
    setIsEditing(false);
  }

  return (
    <Card
      padding="none"
      className={`overflow-hidden animate-slide-up stagger-${Math.min(index + 1, 6)} ${post.pinned ? "ring-2 ring-primary/50" : ""}`}
    >
      {/* Pinned indicator */}
      {post.pinned && (
        <div className="bg-primary/10 px-4 py-2 flex items-center gap-2 text-sm text-primary font-medium">
          <Pin size={14} />
          פוסט מוצמד
        </div>
      )}
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
            {!isEditing && (
              <h3 className="font-rubik font-semibold text-lg text-foreground">
                {post.title}
              </h3>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="font-medium">{post.authorName}</span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} />
                {post.createdAt.toLocaleDateString("he-IL")}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            {/* Edit button - admin only */}
            {isAdmin && onEdit && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="shrink-0 p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200 cursor-pointer"
                aria-label="ערוך פוסט"
                title="ערוך פוסט"
              >
                <Pencil size={18} />
              </button>
            )}
            {/* Pin button - admin only */}
            {isAdmin && onPin && !isEditing && (
              <button
                onClick={() => onPin(post.id, !post.pinned)}
                className={`shrink-0 p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  post.pinned
                    ? "text-primary hover:text-primary/80 hover:bg-primary/10"
                    : "text-gray-400 hover:text-primary hover:bg-primary/10"
                }`}
                aria-label={post.pinned ? "בטל הצמדה" : "הצמד פוסט"}
                title={post.pinned ? "בטל הצמדה" : "הצמד פוסט"}
              >
                {post.pinned ? <PinOff size={18} /> : <Pin size={18} />}
              </button>
            )}
            {/* Delete button */}
            {canDelete && !isEditing && (
              <button
                onClick={() => onDelete(post.id)}
                className="shrink-0 p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200 cursor-pointer"
                aria-label="מחק פוסט"
                title="מחק פוסט"
              >
                <Trash2 size={18} />
              </button>
            )}
            {/* Edit mode action buttons */}
            {isEditing && (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editTitle.trim() || !editContent.trim()}
                  className="shrink-0 p-2 text-success hover:bg-success/10 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="שמור"
                  title="שמור"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="shrink-0 p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
                  aria-label="בטל"
                  title="בטל"
                >
                  <X size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-3 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground font-rubik font-semibold placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="כותרת הפוסט"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-4 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              placeholder="תוכן הפוסט..."
              rows={4}
            />
          </div>
        ) : (
          <>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              <LinkifiedText text={post.content} />
            </p>
            {/* Link Previews */}
            {extractUrls(post.content).map((url) => (
              <LinkPreview key={url} url={url} />
            ))}
          </>
        )}

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
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      <LinkifiedText text={reply.content} />
                    </p>
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
