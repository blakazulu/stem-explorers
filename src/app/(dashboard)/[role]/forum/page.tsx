"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SkeletonList } from "@/components/ui/Skeleton";
import type { UserRole } from "@/types";

export default function ForumRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const role = params.role as UserRole;

  // Redirect to default room
  useEffect(() => {
    router.replace(`/${role}/forum/requests`);
  }, [role, router]);

  // Show loading skeleton while redirecting
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <SkeletonList count={3} />
    </div>
  );
}
