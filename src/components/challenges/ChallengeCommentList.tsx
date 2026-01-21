"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import { useDeleteChallengeComment } from "@/lib/queries";
import { Trash2, Users } from "lucide-react";
import type { ChallengeComment } from "@/types";

interface ChallengeCommentListProps {
  challengeId: string;
  comments: ChallengeComment[];
  isAdmin: boolean;
}

export function ChallengeCommentList({
  challengeId,
  comments,
  isAdmin,
}: ChallengeCommentListProps) {
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const toast = useToastActions();
  const deleteComment = useDeleteChallengeComment();

  const handleDeleteComment = async () => {
    if (!deleteCommentId) return;
    try {
      await deleteComment.mutateAsync({
        challengeId,
        commentId: deleteCommentId,
      });
      toast.success("התגובה נמחקה");
      setDeleteCommentId(null);
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת התגובה");
    }
  };

  if (comments.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        אין תגובות עדיין. היו הראשונים להגיב!
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex items-start gap-3 bg-surface-1 rounded-xl p-3"
          >
            {/* Avatar */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-medium">
              {comment.authorName.charAt(0)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {comment.content}
              </p>

              {/* Comment image */}
              {comment.imageUrl && (
                <button
                  type="button"
                  onClick={() => setExpandedImage(comment.imageUrl!)}
                  className="mt-2 block cursor-pointer"
                >
                  <img
                    src={comment.imageUrl}
                    alt="תמונה מצורפת"
                    className="max-h-40 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  />
                </button>
              )}

              <div className="flex items-center gap-2 mt-2">
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

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <img
            src={expandedImage}
            alt="תמונה מוגדלת"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            aria-label="סגור"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
      )}
    </>
  );
}
