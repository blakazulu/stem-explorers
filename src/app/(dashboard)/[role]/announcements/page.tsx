"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo } from "react";
import { Rocket, Plus, X, ChevronLeft, ChevronRight, MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllAnnouncements, useAnnouncementsByGrade } from "@/lib/queries";
import { AnnouncementForm, AnnouncementCard, AllowCommentsModal } from "@/components/announcements";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { UserRole, Grade, Announcement } from "@/types";

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

type FilterGrade = Grade | "all";

export default function AnnouncementsPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAllowCommentsModal, setShowAllowCommentsModal] = useState(false);
  const [filterGrade, setFilterGrade] = useState<FilterGrade>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const urlRole = params.role as UserRole;

  // Redirect if role doesn't have access or URL role doesn't match session
  useEffect(() => {
    if (!session) return;

    const allowedRoles = ["admin", "student"];
    if (!allowedRoles.includes(session.user.role)) {
      router.replace(`/${session.user.role}`);
      return;
    }

    if (urlRole !== session.user.role) {
      router.replace(`/${session.user.role}/announcements`);
    }
  }, [session, urlRole, router]);

  // Handle dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (showFormModal) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [showFormModal]);

  // Handle escape key
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowFormModal(false);
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isAdmin = session?.user.role === "admin";
  const userGrade = session?.user.grade;

  // Fetch announcements - admin sees all, students see grade-filtered
  const { data: allAnnouncements = [], isLoading: allLoading } = useAllAnnouncements();
  const { data: gradeAnnouncements = [], isLoading: gradeLoading } = useAnnouncementsByGrade(
    userGrade ?? null
  );

  // Use appropriate data based on user role
  const baseAnnouncements = isAdmin ? allAnnouncements : gradeAnnouncements;
  const isLoading = isAdmin ? allLoading : gradeLoading;

  // Calculate counts per grade for admin filter tabs
  const gradeCounts = useMemo(() => {
    const counts: Record<FilterGrade, number> = {
      all: baseAnnouncements.length,
      "א": 0, "ב": 0, "ג": 0, "ד": 0, "ה": 0, "ו": 0,
    };

    baseAnnouncements.forEach((announcement) => {
      if (announcement.targetGrade === "all") {
        // "all" announcements count toward every grade
        grades.forEach((g) => counts[g]++);
      } else {
        counts[announcement.targetGrade]++;
      }
    });

    return counts;
  }, [baseAnnouncements]);

  // Filter announcements for admin based on selected filter
  const filteredAnnouncements = useMemo(() => {
    if (!isAdmin || filterGrade === "all") {
      return baseAnnouncements;
    }
    return baseAnnouncements.filter(
      (a) => a.targetGrade === filterGrade || a.targetGrade === "all"
    );
  }, [baseAnnouncements, filterGrade, isAdmin]);

  // Reset index when filter changes or announcements update
  useEffect(() => {
    setCurrentIndex(0);
  }, [filterGrade, filteredAnnouncements.length]);

  // Navigation handlers
  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(filteredAnnouncements.length - 1, prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showFormModal) return; // Don't navigate when modal is open

      if (e.key === "ArrowLeft") {
        goToNext();
      } else if (e.key === "ArrowRight") {
        goToPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFormModal, filteredAnnouncements.length]);

  const currentAnnouncement = filteredAnnouncements[currentIndex];

  // Show loading state before session is available
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-gray-400">טוען...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Rocket size={24} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
                יוצאים לדרך
              </h1>
              <p className="text-sm text-gray-500">
                {isAdmin ? "פרסומים לתלמידים" : "פרסומים והודעות"}
              </p>
            </div>
          </div>

          {/* Admin: New Post Button */}
          {isAdmin && (
            <Button
              onClick={() => setShowFormModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
              rightIcon={Plus}
            >
              פרסום חדש
            </Button>
          )}
        </div>

        {/* Admin: Grade Filter Tabs + Allow Comments Button */}
        {isAdmin && !isLoading && (
          <div className="flex flex-row flex-nowrap items-center justify-between gap-4">
            {/* Grade Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterGrade("all")}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all cursor-pointer flex items-center gap-2 ${filterGrade === "all"
                    ? "bg-emerald-500 text-white shadow-md"
                    : "bg-surface-1 text-foreground hover:bg-surface-2"
                  }`}
              >
                הכל
                <span className={`px-2 py-0.5 rounded-full text-xs ${filterGrade === "all"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-700"
                  }`}>
                  {gradeCounts.all}
                </span>
              </button>
              {grades.map((grade) => (
                <button
                  key={grade}
                  onClick={() => setFilterGrade(grade)}
                  className={`px-3 py-2 rounded-lg font-rubik font-bold transition-all cursor-pointer flex items-center gap-2 ${filterGrade === grade
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-surface-1 text-foreground hover:bg-surface-2"
                    }`}
                >
                  {grade}
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${filterGrade === grade
                      ? "bg-white/20 text-white"
                      : "bg-emerald-100 text-emerald-700"
                    }`}>
                    {gradeCounts[grade]}
                  </span>
                </button>
              ))}
            </div>

            {/* Allow Comments Button - for current announcement */}
            {currentAnnouncement && (
              <button
                onClick={() => setShowAllowCommentsModal(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer shrink-0 ${
                  (currentAnnouncement.allowedCommentGrades?.length ?? 0) > 0
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <MessageSquarePlus size={16} />
                <span>
                  {(currentAnnouncement.allowedCommentGrades?.length ?? 0) > 0
                    ? `תגובות מופעלות (${currentAnnouncement.allowedCommentGrades?.length})`
                    : "הפעל תגובות"}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(1)].map((_, i) => (
            <Skeleton key={i} variant="card" className="h-64" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAnnouncements.length === 0 && (
        <EmptyState
          icon="rocket"
          title={isAdmin ? "אין פרסומים עדיין" : "אין פרסומים עדיין"}
          description={isAdmin ? "צור פרסום חדש כדי לשתף עם התלמידים" : "בקרוב יתווספו פרסומים חדשים"}
        />
      )}

      {/* Carousel View */}
      {!isLoading && filteredAnnouncements.length > 0 && currentAnnouncement && (
        <div className="relative">
          {/* Navigation Buttons */}
          {filteredAnnouncements.length > 1 && (
            <>
              {/* Previous Button - on the right (RTL) */}
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className={`absolute top-1/2 -translate-y-1/2 -right-4 md:-right-14 z-10 p-2 md:p-3 rounded-full bg-white shadow-lg border border-surface-2 transition-all cursor-pointer ${currentIndex === 0
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-surface-1 hover:shadow-xl"
                  }`}
                aria-label="פרסום קודם"
              >
                <ChevronRight size={24} className="text-emerald-600" />
              </button>

              {/* Next Button - on the left (RTL) */}
              <button
                onClick={goToNext}
                disabled={currentIndex === filteredAnnouncements.length - 1}
                className={`absolute top-1/2 -translate-y-1/2 -left-4 md:-left-14 z-10 p-2 md:p-3 rounded-full bg-white shadow-lg border border-surface-2 transition-all cursor-pointer ${currentIndex === filteredAnnouncements.length - 1
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-surface-1 hover:shadow-xl"
                  }`}
                aria-label="פרסום הבא"
              >
                <ChevronLeft size={24} className="text-emerald-600" />
              </button>
            </>
          )}

          {/* Current Announcement Card */}
          <div className="px-2 md:px-8">
            <AnnouncementCard
              announcement={currentAnnouncement}
              userRole={session.user.role}
              userName={session.user.name}
              userGrade={session.user.grade}
            />
          </div>

          {/* Position Indicator */}
          {filteredAnnouncements.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-sm text-gray-500">
                {currentIndex + 1} / {filteredAnnouncements.length}
              </span>
              <div className="flex gap-1">
                {filteredAnnouncements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${index === currentIndex
                        ? "bg-emerald-500 w-4"
                        : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    aria-label={`עבור לפרסום ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Post Modal */}
      {isAdmin && (
        <dialog
          ref={dialogRef}
          className="fixed inset-0 m-auto h-fit z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-xl w-full shadow-2xl animate-scale-in border-0 bg-transparent"
          onClose={() => setShowFormModal(false)}
        >
          <div className="relative" dir="rtl">
            {/* Close button */}
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 left-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer bg-white/80 backdrop-blur-sm"
              aria-label="סגור"
            >
              <X size={18} />
            </button>

            <AnnouncementForm
              authorName={session.user.name}
              onCreated={() => setShowFormModal(false)}
            />
          </div>
        </dialog>
      )}

      {/* Allow Comments Modal */}
      {isAdmin && currentAnnouncement && (
        <AllowCommentsModal
          announcementId={currentAnnouncement.id}
          currentAllowedGrades={currentAnnouncement.allowedCommentGrades || []}
          isOpen={showAllowCommentsModal}
          onClose={() => setShowAllowCommentsModal(false)}
        />
      )}
    </div>
  );
}
