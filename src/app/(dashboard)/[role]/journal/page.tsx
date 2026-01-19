"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PenTool, BarChart3, BookOpen } from "lucide-react";
import type { UserRole, Grade } from "@/types";

export default function JournalPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = session?.user.grade as Grade;

  // Students must have a grade
  if (!grade) {
    return (
      <EmptyState
        icon="alert-circle"
        title="לא נמצאה כיתה"
        description="לא משויכת כיתה לחשבון שלך. פנה למנהל המערכת."
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-role-student/10 rounded-lg">
            <BookOpen size={20} className="text-role-student" />
          </div>
          <div>
            <h1 className="text-lg font-rubik font-bold text-foreground">
              יומן חוקר
            </h1>
            <p className="text-sm text-gray-500">כיתה {grade}</p>
          </div>
        </div>
      </Card>

      {/* Two Card Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Collection Card */}
        <Card
          variant="outlined"
          interactive
          className="cursor-pointer group hover:border-role-student transition-all duration-200"
          onClick={() => router.push(`/${role}/forum`)}
        >
          <div className="flex flex-col items-center text-center py-6 px-4">
            <div className="p-4 bg-role-student/10 rounded-2xl mb-4 group-hover:bg-role-student/20 transition-colors">
              <BarChart3 size={32} className="text-role-student" />
            </div>
            <h2 className="text-xl font-rubik font-bold text-foreground mb-2">
              תיעוד איסוף הנתונים
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              שתפו תצפיות, ממצאים ותובנות מהמחקר שלכם
            </p>
          </div>
        </Card>

        {/* Reflection Card */}
        <Card
          variant="outlined"
          interactive
          className="cursor-pointer group hover:border-role-student transition-all duration-200"
          onClick={() => router.push(`/${role}/journal/questionnaire`)}
        >
          <div className="flex flex-col items-center text-center py-6 px-4">
            <div className="p-4 bg-role-student/10 rounded-2xl mb-4 group-hover:bg-role-student/20 transition-colors">
              <PenTool size={32} className="text-role-student" />
            </div>
            <h2 className="text-xl font-rubik font-bold text-foreground mb-2">
              רפלקציה אישית
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              מלאו את יומן החוקר ושתפו את החוויה שלכם
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
