"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Gamepad2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlayerBadges } from "@/lib/queries/games";
import { GAME_CATEGORIES } from "@/lib/constants/games";
import { CategoryCard, CategoryModal, BadgeShelf } from "@/components/games";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CategoryInfo } from "@/types/games";

export default function GamesHubPage() {
  const params = useParams();
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const role = params.role as string;

  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);

  // Validate role - only admin and student can access
  const allowedRoles = ["admin", "student"];
  const isAuthorized = allowedRoles.includes(role);

  // Get player badges
  const visitorId = session?.documentId || null;
  const visitorGrade = session?.user?.grade || null;
  const { data: playerBadges, isLoading: badgesLoading } = usePlayerBadges(
    visitorId,
    visitorGrade
  );

  // Show loading while checking auth
  if (authLoading) {
    return <GamesHubSkeleton />;
  }

  // Redirect if not authorized
  if (!isAuthorized) {
    router.replace(`/${session?.user?.role || "student"}`);
    return null;
  }

  const earnedBadges = playerBadges?.badges || [];

  return (
    <div className="max-w-theme mx-auto space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-500/10 rounded-xl">
          <Gamepad2 size={24} className="text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            משחקי STEM
          </h1>
          <p className="text-sm text-gray-500">
            בחרו קטגוריה והתחילו לשחק!
          </p>
        </div>
      </div>

      {/* Badge Shelf */}
      <BadgeShelf earnedBadges={earnedBadges} isLoading={badgesLoading} />

      {/* Categories Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {GAME_CATEGORIES.map((category, index) => (
          <div
            key={category.id}
            className={`animate-slide-up`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CategoryCard
              category={category}
              onClick={() => setSelectedCategory(category)}
            />
          </div>
        ))}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={!!selectedCategory}
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
      />
    </div>
  );
}

// Loading skeleton component
function GamesHubSkeleton() {
  return (
    <div className="max-w-theme mx-auto space-y-6" dir="rtl">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton variant="rectangular" width={56} height={56} className="rounded-xl" />
        <div>
          <Skeleton variant="text" width={150} height={28} className="mb-2" />
          <Skeleton variant="text" width={200} height={16} />
        </div>
      </div>

      {/* Badge shelf skeleton */}
      <div className="bg-surface-0 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Skeleton variant="rectangular" width={32} height={32} className="rounded-lg" />
            <Skeleton variant="text" width={100} height={20} />
          </div>
          <Skeleton variant="text" width={80} height={16} />
        </div>
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="circular" width={48} height={48} />
          ))}
        </div>
      </div>

      {/* Categories grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton
            key={i}
            variant="card"
            height={200}
            className="rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}
