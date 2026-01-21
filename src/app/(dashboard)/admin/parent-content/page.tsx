// src/app/(dashboard)/admin/parent-content/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Check, X, Users, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { EventForm } from "@/components/parent-content/EventForm";
import { EventList } from "@/components/parent-content/EventList";
import { ChallengeCard, ChallengeForm } from "@/components/challenges";
import {
  useParentContent,
  useUpdateParentContentIntro,
  useUpdateParentContentEvents,
  useDeleteParentContentImage,
  useChallenges,
} from "@/lib/queries";
import { useAuth } from "@/contexts/AuthContext";
import { useToastActions } from "@/components/ui/Toast";
import type { ParentContentPageId, ParentContentEvent, Challenge } from "@/types";

type TabId = ParentContentPageId;

const TABS: { id: TabId; label: string }[] = [
  { id: "community-activities", label: "פעילויות קהילתיות" },
  { id: "stem-family", label: "STEM במשפחה" },
];

export default function AdminParentContentPage() {
  const router = useRouter();
  const { session } = useAuth();
  const toast = useToastActions();

  const [activeTab, setActiveTab] = useState<TabId>("community-activities");
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [editIntroText, setEditIntroText] = useState("");

  // Events state (for community-activities tab)
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ParentContentEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<ParentContentEvent | null>(null);

  // Challenges state (for stem-family tab)
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const challengeDialogRef = useRef<HTMLDialogElement>(null);

  // Redirect non-admins
  useEffect(() => {
    if (session && session.user.role !== "admin") {
      router.replace(`/${session.user.role}`);
    }
  }, [session, router]);

  // Queries
  const { data: content, isLoading: isLoadingContent } = useParentContent(activeTab);
  const { data: challenges = [], isLoading: isLoadingChallenges } = useChallenges();

  // Mutations
  const updateIntro = useUpdateParentContentIntro();
  const updateEvents = useUpdateParentContentEvents();
  const deleteImage = useDeleteParentContentImage();

  // Handle challenge dialog open/close
  useEffect(() => {
    const dialog = challengeDialogRef.current;
    if (!dialog) return;

    if (showChallengeForm || editingChallenge) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [showChallengeForm, editingChallenge]);

  // Handle escape key for challenge dialog
  useEffect(() => {
    const dialog = challengeDialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowChallengeForm(false);
        setEditingChallenge(null);
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Early return for non-admins
  if (!session || session.user.role !== "admin") {
    return null;
  }

  const isLoading = activeTab === "stem-family" ? isLoadingChallenges : isLoadingContent;

  // Separate active and inactive challenges
  const activeChallenge = challenges.find((c) => c.isActive);
  const inactiveChallenges = challenges.filter((c) => !c.isActive);

  const handleStartEditIntro = () => {
    setEditIntroText(content?.intro || "");
    setIsEditingIntro(true);
  };

  const handleCancelEditIntro = () => {
    setIsEditingIntro(false);
    setEditIntroText("");
  };

  const handleSaveIntro = async () => {
    try {
      await updateIntro.mutateAsync({
        pageId: activeTab,
        intro: editIntroText.trim(),
      });
      setIsEditingIntro(false);
      toast.success("ההקדמה נשמרה בהצלחה");
    } catch (error) {
      console.error("Save intro error:", error);
      toast.error("שגיאה בשמירת ההקדמה");
    }
  };

  // Event handlers (for community-activities)
  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: ParentContentEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleSaveEvent = async (
    eventData: Omit<ParentContentEvent, "id" | "createdAt"> & { id?: string }
  ) => {
    const currentEvents = content?.events || [];
    let newEvents: ParentContentEvent[];

    if (eventData.id) {
      // Update existing
      newEvents = currentEvents.map((e) =>
        e.id === eventData.id
          ? { ...e, ...eventData, id: e.id, createdAt: e.createdAt }
          : e
      );
    } else {
      // Add new
      const newEvent: ParentContentEvent = {
        ...eventData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      newEvents = [...currentEvents, newEvent];
    }

    try {
      await updateEvents.mutateAsync({
        pageId: activeTab,
        events: newEvents,
      });
      setShowEventForm(false);
      setEditingEvent(null);
      toast.success(eventData.id ? "האירוע עודכן בהצלחה" : "האירוע נוסף בהצלחה");
    } catch (error) {
      console.error("Save event error:", error);
      toast.error("שגיאה בשמירת האירוע");
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;

    const currentEvents = content?.events || [];
    const newEvents = currentEvents.filter((e) => e.id !== deletingEvent.id);

    try {
      // Delete image from storage if exists
      if (deletingEvent.imageUrl) {
        await deleteImage.mutateAsync(deletingEvent.imageUrl);
      }

      await updateEvents.mutateAsync({
        pageId: activeTab,
        events: newEvents,
      });
      setDeletingEvent(null);
      toast.success("האירוע נמחק בהצלחה");
    } catch (error) {
      console.error("Delete event error:", error);
      toast.error("שגיאה במחיקת האירוע");
    }
  };

  const handleReorderEvents = async (reorderedEvents: ParentContentEvent[]) => {
    try {
      await updateEvents.mutateAsync({
        pageId: activeTab,
        events: reorderedEvents,
      });
    } catch (error) {
      console.error("Reorder events error:", error);
      toast.error("שגיאה בסידור מחדש");
    }
  };

  // Challenge handlers (for stem-family)
  const handleCloseChallengeModal = () => {
    setShowChallengeForm(false);
    setEditingChallenge(null);
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-admin/10 rounded-xl">
          <Users size={24} className="text-role-admin" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            תוכן הורים
          </h1>
          <p className="text-sm text-gray-500">
            ניהול תוכן עמודי ההורים
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-64" />
        </div>
      ) : (
        <>
          {/* Intro Section */}
          <div className="p-6 bg-surface-1 rounded-2xl border border-surface-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">הקדמה</h2>
            {isEditingIntro ? (
              <div className="space-y-3">
                <textarea
                  value={editIntroText}
                  onChange={(e) => setEditIntroText(e.target.value.slice(0, 500))}
                  className="w-full p-3 rounded-lg border border-surface-3 bg-surface-0 text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={4}
                  maxLength={500}
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${editIntroText.length >= 480 ? "text-amber-500" : "text-gray-400"}`}>
                    {editIntroText.length}/500
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEditIntro}
                      disabled={updateIntro.isPending}
                      rightIcon={X}
                    >
                      ביטול
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveIntro}
                      loading={updateIntro.isPending}
                      rightIcon={Check}
                    >
                      שמור
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <p className="text-foreground leading-relaxed flex-1">
                  {content?.intro || "(אין הקדמה - לחץ לעריכה)"}
                </p>
                <button
                  onClick={handleStartEditIntro}
                  className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-gray-400 hover:text-foreground"
                  title="עריכת טקסט"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Content Section - Events for community-activities, Challenges for stem-family */}
          {activeTab === "community-activities" ? (
            // Events Section
            <div className="p-6 bg-surface-1 rounded-2xl border border-surface-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">אירועים</h2>
                <Button onClick={handleAddEvent} leftIcon={Plus} size="sm">
                  הוסף אירוע
                </Button>
              </div>

              <EventList
                events={content?.events || []}
                onReorder={handleReorderEvents}
                onEdit={handleEditEvent}
                onDelete={setDeletingEvent}
              />
            </div>
          ) : (
            // Challenges Section (for stem-family)
            <div className="space-y-6">
              {/* Stats & Add Button */}
              <div className="flex items-center justify-between">
                <div className="flex gap-4 text-sm">
                  {challenges.length > 0 && (
                    <div className="px-4 py-2 bg-surface-1 rounded-lg">
                      <span className="text-gray-500">סה״כ אתגרים:</span>{" "}
                      <span className="font-semibold text-foreground">{challenges.length}</span>
                    </div>
                  )}
                  {activeChallenge && (
                    <div className="px-4 py-2 bg-amber-50 rounded-lg">
                      <span className="text-amber-600">אתגר פעיל:</span>{" "}
                      <span className="font-semibold text-amber-700">{activeChallenge.title}</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setShowChallengeForm(true)}
                  className="bg-amber-500 hover:bg-amber-600"
                  rightIcon={Plus}
                >
                  אתגר חדש
                </Button>
              </div>

              {/* Empty State */}
              {challenges.length === 0 && (
                <EmptyState
                  icon="trophy"
                  title="אין אתגרים עדיין"
                  description="צור אתגר חדש כדי להתחיל"
                  action={{
                    label: "אתגר חדש",
                    onClick: () => setShowChallengeForm(true),
                  }}
                />
              )}

              {/* Active Challenge */}
              {activeChallenge && (
                <div className="space-y-2">
                  <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center gap-2">
                    <Trophy size={16} className="text-amber-500" />
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
              {inactiveChallenges.length > 0 && (
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
            </div>
          )}
        </>
      )}

      {/* Event Form Modal (for community-activities) */}
      {showEventForm && (
        <EventForm
          event={editingEvent || undefined}
          pageId={activeTab}
          onSave={handleSaveEvent}
          onCancel={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          isLoading={updateEvents.isPending}
        />
      )}

      {/* Challenge Form Modal (for stem-family) */}
      <dialog
        ref={challengeDialogRef}
        className="fixed inset-0 m-auto h-fit z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-xl w-full shadow-2xl animate-scale-in border-0 bg-transparent"
        onClose={handleCloseChallengeModal}
      >
        <div className="relative" dir="rtl">
          {/* Close button */}
          <button
            onClick={handleCloseChallengeModal}
            className="absolute top-4 left-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer bg-white/80 backdrop-blur-sm"
            aria-label="סגור"
          >
            <X size={18} />
          </button>

          <ChallengeForm
            authorName={session.user.name}
            editingChallenge={editingChallenge}
            onSuccess={handleCloseChallengeModal}
            onCancel={handleCloseChallengeModal}
          />
        </div>
      </dialog>

      {/* Delete Event Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingEvent}
        onCancel={() => setDeletingEvent(null)}
        onConfirm={handleDeleteEvent}
        title="מחיקת אירוע"
        message={`האם למחוק את "${deletingEvent?.title}"?`}
        confirmLabel="מחק"
        variant="danger"
      />
    </div>
  );
}
