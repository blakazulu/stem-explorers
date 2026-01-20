"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Rocket, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAllAnnouncements, useAnnouncementsByGrade } from "@/lib/queries";
import { AnnouncementForm, AnnouncementCard } from "@/components/announcements";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { UserRole } from "@/types";

export default function AnnouncementsPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();
  const [showFormModal, setShowFormModal] = useState(false);
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
  const announcements = isAdmin ? allAnnouncements : gradeAnnouncements;
  const isLoading = isAdmin ? allLoading : gradeLoading;

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

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="card" className="h-48" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && announcements.length === 0 && (
        <EmptyState
          icon="rocket"
          title={isAdmin ? "אין פרסומים עדיין" : "אין פרסומים עדיין"}
          description={isAdmin ? "צור פרסום חדש כדי לשתף עם התלמידים" : "בקרוב יתווספו פרסומים חדשים"}
        />
      )}

      {/* Announcements List */}
      {!isLoading && announcements.length > 0 && (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              userRole={session.user.role}
              userName={session.user.name}
              userGrade={session.user.grade}
            />
          ))}
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
    </div>
  );
}
