"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GradeSelector } from "@/components/ui/GradeSelector";
import { Card } from "@/components/ui/Card";
import { ClipboardList } from "lucide-react";
import type { Grade, UserRole } from "@/types";

export default function QuestionsGradeSelectorPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const isAdmin = session?.user.role === "admin";

  useEffect(() => {
    if (!isAdmin) {
      router.replace(`/${role}`);
    }
  }, [isAdmin, role, router]);

  function handleGradeSelect(grade: Grade) {
    router.push(`/${role}/questions/${encodeURIComponent(grade)}`);
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-admin/10 rounded-xl">
          <ClipboardList size={24} className="text-role-admin" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            ניהול שאלונים
          </h1>
          <p className="text-sm text-gray-500">בחר כיתה לניהול שאלוני יומן החוקר</p>
        </div>
      </div>

      {/* Grade Selector */}
      <Card>
        <GradeSelector selected={null} onSelect={handleGradeSelect} />
      </Card>
    </div>
  );
}
