"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUnitsByGrade } from "@/lib/services/units";
import { Card } from "@/components/ui/Card";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Camera, BookOpen, ArrowRight } from "lucide-react";
import type { Grade, Unit, UserRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function DocumentationUnitSelectorPage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user.role === "admin";
  // Only show back button for admins (others are restricted to their grade)
  const showBackButton = isAdmin;

  // Validate grade
  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/documentation`);
    }
  }, [grade, role, router]);

  const loadUnits = useCallback(async () => {
    if (!VALID_GRADES.includes(grade)) return;
    setLoading(true);
    try {
      const data = await getUnitsByGrade(grade);
      setUnits(data);
    } catch {
      // Error handled silently
    }
    setLoading(false);
  }, [grade]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  function handleUnitSelect(unit: Unit) {
    router.push(`/${role}/documentation/${grade}/${unit.id}`);
  }

  if (!VALID_GRADES.includes(grade)) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Link
            href={`/${role}/documentation`}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לבחירת כיתה"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
        )}
        <div className="p-3 bg-secondary/10 rounded-xl">
          <Camera size={24} className="text-secondary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            תיעודים - כיתה {grade}
          </h1>
          <p className="text-sm text-gray-500">בחר יחידה לצפייה בתיעודים</p>
        </div>
      </div>

      {/* Unit Selection */}
      <div className="space-y-4">
        <h2 className="text-lg font-rubik font-semibold text-foreground">
          בחר יחידה
        </h2>

        {loading ? (
          <SkeletonGrid count={6} />
        ) : units.length === 0 ? (
          <EmptyState
            icon="book-open"
            title={`אין יחידות לכיתה ${grade}`}
            description="יש ליצור יחידות לימוד בדף תוכניות עבודה"
          />
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit, index) => (
              <Card
                key={unit.id}
                interactive
                onClick={() => handleUnitSelect(unit)}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-rubik font-semibold text-foreground">
                      {unit.name}
                    </h3>
                    <p className="text-sm text-gray-500">לחץ לצפייה בתיעודים</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
