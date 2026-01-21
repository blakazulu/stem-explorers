"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import { useDeleteAnnouncement, useDeleteAnnouncementComment } from "@/lib/queries";
import { CommentForm } from "./CommentForm";
import { Trash2, MessageCircle, Users, Calendar } from "lucide-react";
import type { Announcement, Grade, UserRole } from "@/types";

interface AnnouncementCardProps {
  announcement: Announcement;
  userRole: UserRole;
  userName?: string;
  userGrade?: Grade | null;
}

const gradeLabels: Record<Grade | "all", string> = {
  "א": "כיתה א׳",
  "ב": "כיתה ב׳",
  "ג": "כיתה ג׳",
  "ד": "כיתה ד׳",
  "ה": "כיתה ה׳",
  "ו": "כיתה ו׳",
  "all": "כל הכיתות",
};

export function AnnouncementCard({
  announcement,
  userRole,
  userName,
  userGrade,
}: AnnouncementCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(true);
  const toast = useToastActions();
  const deleteAnnouncement = useDeleteAnnouncement();
  const deleteComment = useDeleteAnnouncementComment();

  const isAdmin = userRole === "admin";
  const canComment = userRole === "student" && userName && userGrade;

  const handleDeleteAnnouncement = async () => {
    try {
      await deleteAnnouncement.mutateAsync(announcement.id);
      toast.success("הפרסום נמחק");
      setShowDeleteConfirm(false);
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת הפרסום");
    }
  };

  const handleDeleteComment = async () => {
    if (!deleteCommentId) return;
    try {
      await deleteComment.mutateAsync({
        announcementId: announcement.id,
        commentId: deleteCommentId,
      });
      toast.success("התגובה נמחקה");
      setDeleteCommentId(null);
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת התגובה");
    }
  };

  return (
    <>
      <Card padding="none" className="overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-surface-2 bg-gradient-to-l from-emerald-500/5 to-teal-500/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={14} />
              <span>
                {announcement.createdAt?.toLocaleDateString("he-IL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">{announcement.authorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              {gradeLabels[announcement.targetGrade]}
            </span>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                aria-label="מחק פרסום"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4">
          {/* Text content */}
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {announcement.content}
          </p>

          {/* Image */}
          {announcement.imageUrl && (
            <div className="mt-4">
              <a
                href={announcement.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={announcement.imageUrl}
                  alt="תמונה מצורפת"
                  className="max-w-full h-auto rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                />
              </a>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="border-t border-surface-2">
          {/* Comments Header */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="w-full flex items-center justify-between px-4 md:px-6 py-3 hover:bg-surface-1 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageCircle size={16} />
              <span>
                {announcement.comments.length > 0
                  ? `${announcement.comments.length} תגובות`
                  : "אין תגובות עדיין"}
              </span>
            </div>
            <span className="text-gray-400 text-sm">
              {showComments ? "הסתר" : "הצג"}
            </span>
          </button>

          {/* Comments List */}
          {showComments && (
            <div className="px-4 md:px-6 pb-4 space-y-3">
              {announcement.comments.length > 0 && (
                <div className="space-y-3 mb-4">
                  {announcement.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex items-start gap-3 bg-surface-1 rounded-xl p-3"
                    >
                      {/* Avatar */}
                      <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-medium">
                        {comment.authorName.charAt(0)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {comment.authorName}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Users size={10} />
                            כיתה {comment.authorGrade}׳
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">
                            {comment.createdAt?.toLocaleDateString("he-IL")}
                          </span>
                        </div>
                      </div>

                      {/* Admin delete button */}
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteCommentId(comment.id)}
                          className="shrink-0 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          aria-label="מחק תגובה"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Form (students only) */}
              {canComment && (
                <CommentForm
                  announcementId={announcement.id}
                  authorName={userName}
                  authorGrade={userGrade}
                />
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Delete Announcement Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAnnouncement}
        title="מחיקת פרסום"
        message="האם אתה בטוח שברצונך למחוק את הפרסום? פעולה זו לא ניתנת לביטול."
        confirmLabel="מחק"
        variant="danger"
      />

      {/* Delete Comment Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteCommentId}
        onCancel={() => setDeleteCommentId(null)}
        onConfirm={handleDeleteComment}
        title="מחיקת תגובה"
        message="האם אתה בטוח שברצונך למחוק את התגובה?"
        confirmLabel="מחק"
        variant="danger"
      />
    </>
  );
}
