"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";
import { useUnitsByGrade, useDocumentationCountsByUnit } from "@/lib/queries";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Grade } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

const GRADE_LABELS: Record<Grade, string> = {
  "א": "כיתה א׳",
  "ב": "כיתה ב׳",
  "ג": "כיתה ג׳",
  "ד": "כיתה ד׳",
  "ה": "כיתה ה׳",
  "ו": "כיתה ו׳",
};

export default function GradeGalleryPage() {
  const params = useParams();
  const grade = decodeURIComponent(params.grade as string) as Grade;
  const isValidGrade = VALID_GRADES.includes(grade);

  const { data: units = [], isLoading: loading, error, refetch } = useUnitsByGrade(
    isValidGrade ? grade : null
  );
  const { data: docCounts = {} } = useDocumentationCountsByUnit(isValidGrade ? grade : null);

  if (!isValidGrade) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">כיתה לא תקינה</p>
          <Link href="/gallery" className="text-primary hover:underline">
            חזרה לגלריה
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/bg/bg-home.webp"
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-amber-900/[0.08]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-gradient-to-l from-amber-100/90 via-white/90 to-orange-100/90 backdrop-blur-md shadow-sm">
        <Link
          href="/gallery"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowRight size={20} />
          <span className="font-medium hidden sm:inline">חזרה לגלריה</span>
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-rubik font-bold text-gray-800">
            {GRADE_LABELS[grade]} - יחידות לימוד
          </h1>
          <Image
            src="/logo/logo-full.png"
            alt="חוקרי STEM"
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 p-4 md:p-6 overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-40" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <EmptyState
              icon="alert-circle"
              title="שגיאה"
              description="שגיאה בטעינת יחידות הלימוד"
              action={{
                label: "נסה שוב",
                onClick: () => refetch(),
              }}
            />
          </div>
        ) : units.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <EmptyState
              icon="book-open"
              title="אין יחידות לימוד"
              description="עדיין לא נוספו יחידות לימוד לכיתה זו"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {units.map((unit, index) => {
              const imageCount = docCounts[unit.id] || 0;
              return (
                <Link
                  key={unit.id}
                  href={`/gallery/${grade}/${unit.id}`}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg shadow-black/5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-rubik font-bold text-primary">
                        {unit.order}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-rubik font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                        {unit.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Images size={14} />
                        {imageCount > 0 ? `${imageCount} תמונות` : "אין תמונות עדיין"}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
