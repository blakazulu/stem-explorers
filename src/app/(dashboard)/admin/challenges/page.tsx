"use client";

import { useState, useRef, useEffect } from "react";
import { Trophy, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChallenges } from "@/lib/queries";
import { ChallengeCard, ChallengeForm } from "@/components/challenges";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Challenge } from "@/types";

export default function AdminChallengesPage() {
  const { session } = useAuth();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const { data: challenges = [], isLoading } = useChallenges();

  // Separate active and inactive challenges
  const activeChallenge = challenges.find((c) => c.isActive);
  const inactiveChallenges = challenges.filter((c) => !c.isActive);

  // Handle dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (showFormModal || editingChallenge) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [showFormModal, editingChallenge]);

  // Handle escape key
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowFormModal(false);
        setEditingChallenge(null);
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingChallenge(null);
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge);
  };

  // Show loading state before session is available
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-gray-400">טוען...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Trophy size={24} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              אתגר הורים
            </h1>
            <p className="text-sm text-gray-500">
              ניהול אתגרים להורים
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowFormModal(true)}
          className="bg-amber-500 hover:bg-amber-600"
          rightIcon={Plus}
        >
          אתגר חדש
        </Button>
      </div>

      {/* Stats */}
      {!isLoading && challenges.length > 0 && (
        <div className="flex gap-4 text-sm">
          <div className="px-4 py-2 bg-surface-1 rounded-lg">
            <span className="text-gray-500">סה״כ אתגרים:</span>{" "}
            <span className="font-semibold text-foreground">{challenges.length}</span>
          </div>
          {activeChallenge && (
            <div className="px-4 py-2 bg-amber-50 rounded-lg">
              <span className="text-amber-600">אתגר פעיל:</span>{" "}
              <span className="font-semibold text-amber-700">{activeChallenge.title}</span>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton variant="card" className="h-64" />
          <Skeleton variant="card" className="h-24" />
          <Skeleton variant="card" className="h-24" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && challenges.length === 0 && (
        <EmptyState
          icon="trophy"
          title="אין אתגרים עדיין"
          description="צור אתגר חדש כדי להתחיל"
          action={{
            label: "אתגר חדש",
            onClick: () => setShowFormModal(true),
          }}
        />
      )}

      {/* Active Challenge */}
      {!isLoading && activeChallenge && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            אתגר פעיל
          </h2>
          <ChallengeCard
            challenge={activeChallenge}
            userRole={session.user.role}
            userName={session.user.name}
            userGrade={session.user.grade}
            isExpanded={true}
            onEdit={() => handleEditChallenge(activeChallenge)}
          />
        </div>
      )}

      {/* Inactive Challenges */}
      {!isLoading && inactiveChallenges.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            אתגרים לא פעילים ({inactiveChallenges.length})
          </h2>
          <div className="space-y-3">
            {inactiveChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                userRole={session.user.role}
                userName={session.user.name}
                userGrade={session.user.grade}
                isExpanded={false}
                onEdit={() => handleEditChallenge(challenge)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Form Modal */}
      <dialog
        ref={dialogRef}
        className="fixed inset-0 m-auto h-fit z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-xl w-full shadow-2xl animate-scale-in border-0 bg-transparent"
        onClose={handleCloseModal}
      >
        <div className="relative" dir="rtl">
          {/* Close button */}
          <button
            onClick={handleCloseModal}
            className="absolute top-4 left-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer bg-white/80 backdrop-blur-sm"
            aria-label="סגור"
          >
            <X size={18} />
          </button>

          <ChallengeForm
            authorName={session.user.name}
            editingChallenge={editingChallenge}
            onSuccess={handleCloseModal}
            onCancel={handleCloseModal}
          />
        </div>
      </dialog>
    </div>
  );
}
