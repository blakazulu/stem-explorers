"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ExpertsSection } from "@/components/experts";
import { GraduationCap, ArrowRight } from "lucide-react";
import type { Grade, UserRole, ConfigurableRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function ExpertsGradePage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const isAdmin = session?.user.role === "admin";
  const showBackButton = isAdmin;

  // Get the user's role for filtering experts (admin sees all)
  const userRole = session?.user.role === "admin"
    ? undefined
    : (session?.user.role as ConfigurableRole);

  // Validate grade
  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/experts`);
    }
  }, [grade, role, router]);

  if (!VALID_GRADES.includes(grade)) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Link
            href={`/${role}/experts`}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לבחירת כיתה"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
        )}
        <div className="p-3 bg-primary/10 rounded-xl">
          <GraduationCap size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            שאל את המומחה - כיתה {grade}
          </h1>
          <p className="text-sm text-gray-500">צור קשר עם מומחים בתחומי STEM</p>
        </div>
      </div>

      {/* Experts Section (without the separator title since we have page header) */}
      <ExpertsSection grade={grade} isAdmin={isAdmin} userRole={userRole} />
    </div>
  );
}
