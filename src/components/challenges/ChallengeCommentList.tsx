"use client";

import { useState, useEffect } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { VideoViewerModal } from "@/components/ui/VideoViewerModal";
import { useToastActions } from "@/components/ui/Toast";
import { useDeleteChallengeComment } from "@/lib/queries";
import { Trash2, Users, X, Play } from "lucide-react";
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
  const [videoModalUrl, setVideoModalUrl] = useState<string | null>(null);
  const toast = useToastActions();
  const deleteComment = useDeleteChallengeComment();

  // Handle Escape key to close image modal
  useEffect(() => {
    if (!expandedImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpandedImage(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [expandedImage]);

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

  // Get all images for a comment (support both legacy imageUrl and new imageUrls)
  const getCommentImages = (comment: ChallengeComment): string[] => {
    const images: string[] = [];
    if (comment.imageUrls && comment.imageUrls.length > 0) {
      images.push(...comment.imageUrls);
    } else if (comment.imageUrl) {
      images.push(comment.imageUrl);
    }
    return images;
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
        {comments.map((comment) => {
          const images = getCommentImages(comment);

          return (
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

                {/* Comment images */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {images.map((imageUrl, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setExpandedImage(imageUrl)}
                        className="block cursor-pointer"
                      >
                        <img
                          src={imageUrl}
                          alt={`תמונה ${index + 1}`}
                          className="h-24 w-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Comment video */}
                {comment.videoUrl && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => setVideoModalUrl(comment.videoUrl!)}
                      className="relative block cursor-pointer group"
                    >
                      <video
                        src={comment.videoUrl}
                        className="h-24 max-w-[200px] rounded-lg shadow-sm bg-gray-900 object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg group-hover:bg-black/40 transition-colors">
                        <div className="w-10 h-10 flex items-center justify-center bg-white/90 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-amber-600 mr-[-2px]" />
                        </div>
                      </div>
                    </button>
                  </div>
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
                  {isAdmin && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">
                        {comment.createdAt?.toLocaleDateString("he-IL")}
                      </span>
                    </>
                  )}
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
          );
        })}
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
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            aria-label="סגור"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Video Modal */}
      <VideoViewerModal
        videoUrl={videoModalUrl || ""}
        isOpen={!!videoModalUrl}
        onClose={() => setVideoModalUrl(null)}
      />
    </>
  );
}
