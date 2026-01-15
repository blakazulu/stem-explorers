"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonList } from "@/components/ui/Skeleton";
import type { UserRole } from "@/types";

const VALID_ROLES: UserRole[] = ["admin", "teacher", "parent", "student"];

interface RoleLayoutProps {
  children: React.ReactNode;
}

export default function RoleLayout({ children }: RoleLayoutProps) {
  const router = useRouter();
  const params = useParams();
  const { session, loading } = useAuth();

  const urlRole = params.role as string;

  useEffect(() => {
    if (loading) return;

    // Not authenticated - redirect to login
    if (!session) {
      router.replace("/login");
      return;
    }

    const userRole = session.user.role;

    // Invalid role in URL
    if (!VALID_ROLES.includes(urlRole as UserRole)) {
      router.replace(`/${userRole}`);
      return;
    }

    // URL role doesn't match user's role - redirect to correct role
    if (urlRole !== userRole) {
      // Preserve the rest of the path but change the role
      const currentPath = window.location.pathname;
      const pathAfterRole = currentPath.split("/").slice(2).join("/");

      // Check if user has access to this path under their role
      // For now, just redirect to their dashboard
      router.replace(`/${userRole}${pathAfterRole ? `/${pathAfterRole}` : ""}`);
      return;
    }
  }, [session, loading, urlRole, router]);

  // Show loading skeleton while validating
  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <SkeletonList count={5} />
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!session) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <SkeletonList count={3} />
      </div>
    );
  }

  // Role mismatch - will redirect
  if (urlRole !== session.user.role) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <SkeletonList count={3} />
      </div>
    );
  }

  return <>{children}</>;
}
