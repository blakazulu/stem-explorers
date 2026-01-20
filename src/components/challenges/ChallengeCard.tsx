"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import { useDeleteChallenge, useSetActiveChallenge } from "@/lib/queries";
import { ChallengeMedia } from "./ChallengeMedia";
import { ChallengeCommentForm } from "./ChallengeCommentForm";
import { ChallengeCommentList } from "./ChallengeCommentList";
import {
  Trash2,
  MessageCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trophy,
  Star,
  Pencil,
} from "lucide-react";
import type { Challenge, Grade, UserRole } from "@/types";

interface ChallengeCardProps {
  challenge: Challenge;
  userRole: UserRole;
  userName?: string;
  userGrade?: Grade | null;
  isExpanded?: boolean;
  onEdit?: () => void;
}

const gradeLabels: Record<Grade, string> = {
  "א": "א׳",
  "ב": "ב׳",
  "ג": "ג׳",
  "ד": "ד׳",
  "ה": "ה׳",
  "ו": "ו׳",
};

export function ChallengeCard({
  challenge,
  userRole,
  userName,
  userGrade,
  isExpanded: initialExpanded = false,
  onEdit,
}: ChallengeCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded || challenge.isActive);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showComments, setShowComments] = useState(challenge.isActive);
  const toast = useToastActions();
  const deleteChallenge = useDeleteChallenge();
  const setActive = useSetActiveChallenge();

  const isAdmin = userRole === "admin";
  const isParent = userRole === "parent";
  const canComment = isParent && challenge.isActive && userName && userGrade;

  const handleDeleteChallenge = async () => {
    try {
      await deleteChallenge.mutateAsync(challenge.id);
      toast.success("האתגר נמחק");
      setShowDeleteConfirm(false);
    } catch {
      toast.error("שגיאה", "שגיאה במחיקת האתגר");
    }
  };

  const handleSetActive = async () => {
    try {
      await setActive.mutateAsync(challenge.id);
      toast.success("האתגר הופעל");
    } catch {
      toast.error("שגיאה", "שגיאה בהפעלת האתגר");
    }
  };

  const targetGradesLabel =
    challenge.targetGrades === "all"
      ? "כל הכיתות"
      : challenge.targetGrades.map((g) => gradeLabels[g]).join(", ");

  return (
    <>
      <Card
        padding="none"
        className={`overflow-hidden transition-all duration-300 ${
          challenge.isActive
            ? "ring-2 ring-amber-400 shadow-lg shadow-amber-100"
            : ""
        }`}
      >
        {/* Header - Always visible */}
        <div
          className={`flex items-center justify-between px-4 md:px-6 py-4 border-b border-surface-2 ${
            challenge.isActive
              ? "bg-gradient-to-l from-amber-500/10 to-orange-500/10"
              : "bg-gradient-to-l from-gray-500/5 to-gray-400/5"
          } ${!challenge.isActive ? "cursor-pointer hover:bg-surface-1" : ""}`}
          onClick={() => !challenge.isActive && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            {/* Active badge */}
            {challenge.isActive && (
              <div className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-medium">
                <Star size={12} fill="currentColor" />
                <span>פעיל</span>
              </div>
            )}

            {/* Title */}
            <h3 className={`font-semibold ${challenge.isActive ? "text-lg" : "text-base"}`}>
              {challenge.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Grade badge */}
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              {targetGradesLabel}
            </span>

            {/* Date */}
            <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
              <Calendar size={14} />
              <span>
                {challenge.createdAt?.toLocaleDateString("he-IL", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>

            {/* Admin actions */}
            {isAdmin && (
              <div className="flex items-center gap-1">
                {!challenge.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetActive();
                    }}
                    loading={setActive.isPending}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    title="הפעל אתגר"
                  >
                    <Trophy size={16} />
                  </Button>
                )}
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                    aria-label="ערוך אתגר"
                  >
                    <Pencil size={16} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  aria-label="מחק אתגר"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )}

            {/* Expand/Collapse for inactive challenges */}
            {!challenge.isActive && (
              <div className="text-gray-400">
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            )}
          </div>
        </div>

        {/* Content - Expandable */}
        {(challenge.isActive || isExpanded) && (
          <div className="p-4 md:p-6 space-y-4">
            {/* Media */}
            <ChallengeMedia
              imageUrl={challenge.imageUrl}
              videoUrl={challenge.videoUrl}
              videoStorageUrl={challenge.videoStorageUrl}
              title={challenge.title}
            />

            {/* Description */}
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {challenge.description}
              </p>
            </div>

            {/* Author info */}
            <div className="text-sm text-gray-500">
              פורסם על ידי {challenge.authorName}
            </div>
          </div>
        )}

        {/* Comments Section - Only for expanded or active challenges */}
        {(challenge.isActive || isExpanded) && (
          <div className="border-t border-surface-2">
            {/* Comments Header */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="w-full flex items-center justify-between px-4 md:px-6 py-3 hover:bg-surface-1 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MessageCircle size={16} />
                <span>
                  {challenge.comments.length > 0
                    ? `${challenge.comments.length} תגובות`
                    : "אין תגובות עדיין"}
                </span>
              </div>
              <span className="text-gray-400 text-sm">
                {showComments ? "הסתר" : "הצג"}
              </span>
            </button>

            {/* Comments List */}
            {showComments && (
              <div className="px-4 md:px-6 pb-4 space-y-4">
                <ChallengeCommentList
                  challengeId={challenge.id}
                  comments={challenge.comments}
                  isAdmin={isAdmin}
                />

                {/* Comment Form (parents only, active challenge only) */}
                {canComment && (
                  <div className="pt-3 border-t border-surface-2">
                    <ChallengeCommentForm
                      challengeId={challenge.id}
                      authorName={userName}
                      authorGrade={userGrade}
                    />
                  </div>
                )}

                {/* Message for inactive challenges */}
                {isParent && !challenge.isActive && (
                  <p className="text-sm text-gray-500 text-center py-2 bg-surface-1 rounded-lg">
                    ניתן להגיב רק על אתגר פעיל
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Delete Challenge Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteChallenge}
        title="מחיקת אתגר"
        message="האם אתה בטוח שברצונך למחוק את האתגר? כל התגובות והקבצים יימחקו. פעולה זו לא ניתנת לביטול."
        confirmText="מחק"
        variant="danger"
        loading={deleteChallenge.isPending}
      />
    </>
  );
}
