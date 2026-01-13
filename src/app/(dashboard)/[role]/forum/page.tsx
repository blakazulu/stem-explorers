"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { UserRole } from "@/types";

export default function ForumRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const role = params.role as UserRole;

  // Redirect to default room
  useEffect(() => {
    router.replace(`/${role}/forum/requests`);
  }, [role, router]);

  return null;
}
