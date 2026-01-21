// src/app/(dashboard)/parent/stem-family/page.tsx
"use client";

import { Home, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useParentContent, useChallengesByGrade } from "@/lib/queries";
import { ChallengeCard } from "@/components/challenges";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function StemFamilyPage() {
  const { session } = useAuth();
  const userGrade = session?.user.grade;

  const { data: content, isLoading: isLoadingContent } = useParentContent("stem-family");
  const { data: challenges = [], isLoading: isLoadingChallenges } = useChallengesByGrade(userGrade ?? null);

  const isLoading = isLoadingContent || isLoadingChallenges;

  // Separate active and inactive challenges
  const activeChallenge = challenges.find((c) => c.isActive);
  const pastChallenges = challenges.filter((c) => !c.isActive);

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
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-parent/10 rounded-xl">
          <Home size={24} className="text-role-parent" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            STEM במשפחה
          </h1>
          <p className="text-sm text-gray-500">
            אתגרים מהנים לכל המשפחה
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton variant="text" className="w-full h-16" />
          <Skeleton variant="card" className="h-64" />
          <Skeleton variant="card" className="h-24" />
        </div>
      ) : (
        <>
          {/* Intro */}
          {content?.intro && (
            <div className="p-4 bg-role-parent/5 rounded-xl border border-role-parent/20">
              <p className="text-foreground leading-relaxed">{content.intro}</p>
            </div>
          )}

          {/* Empty State */}
          {challenges.length === 0 && (
            <EmptyState
              icon="trophy"
              title="אין אתגרים להצגה"
              description="אתגרים חדשים יופיעו כאן בקרוב"
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
              />
            </div>
          )}

          {/* Past Challenges */}
          {pastChallenges.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-rubik font-semibold text-foreground flex items-center gap-2">
                <span className="text-gray-400">אתגרים קודמים</span>
                <span className="text-sm font-normal text-gray-400">
                  ({pastChallenges.length})
                </span>
              </h2>
              <div className="space-y-3">
                {pastChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    userRole={session.user.role}
                    userName={session.user.name}
                    userGrade={session.user.grade}
                    isExpanded={false}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
