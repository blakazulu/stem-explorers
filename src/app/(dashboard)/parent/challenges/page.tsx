"use client";

import { Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChallengesByGrade } from "@/lib/queries";
import { ChallengeCard } from "@/components/challenges";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ParentChallengesPage() {
  const { session } = useAuth();
  const userGrade = session?.user.grade;

  const { data: challenges = [], isLoading } = useChallengesByGrade(userGrade ?? null);

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
        <div className="p-3 bg-amber-500/10 rounded-xl">
          <Trophy size={24} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            אתגר הורים
          </h1>
          <p className="text-sm text-gray-500">
            אתגרים מהנים לכל המשפחה
          </p>
        </div>
      </div>

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
          title="אין אתגרים להצגה"
          description="אתגרים חדשים יופיעו כאן בקרוב"
        />
      )}

      {/* Active Challenge */}
      {!isLoading && activeChallenge && (
        <div className="space-y-2">
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
      {!isLoading && pastChallenges.length > 0 && (
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
    </div>
  );
}
