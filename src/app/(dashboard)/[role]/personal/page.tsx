"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePersonalPageConfig, usePersonalMediaByGrade, useAllPersonalMedia } from "@/lib/queries";
import PersonalMediaGallery from "@/components/personal/PersonalMediaGallery";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { UserRole } from "@/types";

export default function PersonalPage() {
  const router = useRouter();
  const params = useParams();
  const { session } = useAuth();

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
      router.replace(`/${session.user.role}/personal`);
    }
  }, [session, urlRole, router]);

  // Determine grade for filtering media
  const userGrade = session?.user.grade;
  const isAdmin = session?.user.role === "admin";

  // Fetch config
  const { data: config, isLoading: configLoading } = usePersonalPageConfig();

  // Fetch media - admins see all, students see grade-filtered
  const { data: gradeMedia = [], isLoading: gradeMediaLoading } = usePersonalMediaByGrade(
    userGrade,
    { enabled: !!userGrade && !isAdmin }
  );
  const { data: allMedia = [], isLoading: allMediaLoading } = useAllPersonalMedia({
    enabled: isAdmin || !userGrade,
  });

  // Use appropriate media based on user role
  const mediaItems = isAdmin || !userGrade ? allMedia : gradeMedia;
  const mediaLoading = isAdmin || !userGrade ? allMediaLoading : gradeMediaLoading;

  // Show loading state before session is available
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-gray-400">טוען...</div>
      </div>
    );
  }

  const hasIntro = config?.introText || config?.bannerUrl;
  const hasMedia = mediaItems.length > 0;
  const isEmpty = !hasIntro && !hasMedia && !configLoading && !mediaLoading;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-student/10 rounded-xl">
          <Heart size={24} className="text-role-student" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            אישי
          </h1>
          <p className="text-sm text-gray-500">
            תוכן אישי מיוחד עבורך
          </p>
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <EmptyState
          icon="heart"
          title="אין עדיין תוכן אישי"
          description="התוכן יתעדכן בקרוב"
        />
      )}

      {/* Intro Section */}
      {(configLoading || hasIntro) && (
        <Card className="overflow-hidden">
          {configLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton variant="text" className="h-48" />
              <Skeleton variant="text" className="h-24" />
            </div>
          ) : (
            <>
              {/* Banner */}
              {config?.bannerUrl && (
                <div className="relative w-full h-48 md:h-64">
                  <img
                    src={config.bannerUrl}
                    alt="באנר"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Intro Text */}
              {config?.introText && (
                <div className="p-6">
                  <p className="text-foreground leading-relaxed text-right">
                    {config.introText}
                  </p>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Media Gallery Section */}
      {(mediaLoading || hasMedia) && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">גלריית מדיה</h2>
          {mediaLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="card" className="h-48" />
              ))}
            </div>
          ) : (
            <PersonalMediaGallery
              media={mediaItems}
              isAdmin={false}
            />
          )}
        </div>
      )}
    </div>
  );
}
