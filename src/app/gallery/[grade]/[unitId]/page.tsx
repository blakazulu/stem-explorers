"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { getUnit } from "@/lib/services/units";
import { getDocumentationByUnit } from "@/lib/services/documentation";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Grade, Unit, Documentation } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

const GRADE_LABELS: Record<Grade, string> = {
  "א": "כיתה א׳",
  "ב": "כיתה ב׳",
  "ג": "כיתה ג׳",
  "ד": "כיתה ד׳",
  "ה": "כיתה ה׳",
  "ו": "כיתה ו׳",
};

// Lightbox state: which doc and which image within it
interface LightboxState {
  docIndex: number;
  imageIndex: number;
}

export default function UnitGalleryPage() {
  const params = useParams();
  const grade = decodeURIComponent(params.grade as string) as Grade;
  const unitId = params.unitId as string;
  const isValidGrade = VALID_GRADES.includes(grade);

  const [unit, setUnit] = useState<Unit | null>(null);
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  useEffect(() => {
    if (!isValidGrade || !unitId) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [unitData, docsData] = await Promise.all([
          getUnit(unitId),
          getDocumentationByUnit(unitId, grade),
        ]);

        if (!unitData || unitData.gradeId !== grade) {
          setError("יחידת הלימוד לא נמצאה");
          return;
        }

        setUnit(unitData);
        setDocs(docsData);
      } catch (err) {
        console.error("Failed to load documentation:", err);
        setError("שגיאה בטעינת התיעודים");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [grade, unitId, isValidGrade]);

  const openLightbox = (docIndex: number, imageIndex: number = 0) => {
    setLightbox({ docIndex, imageIndex });
  };

  const closeLightbox = () => setLightbox(null);

  // Get current doc's images for navigation
  const currentDoc = lightbox ? docs[lightbox.docIndex] : null;
  const currentImages = currentDoc?.images || [];

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightbox || !currentDoc) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
      } else if (e.key === "ArrowRight" && currentImages.length > 1) {
        // RTL - right goes to previous
        setLightbox((prev) => ({
          ...prev!,
          imageIndex: (prev!.imageIndex - 1 + currentImages.length) % currentImages.length,
        }));
      } else if (e.key === "ArrowLeft" && currentImages.length > 1) {
        // RTL - left goes to next
        setLightbox((prev) => ({
          ...prev!,
          imageIndex: (prev!.imageIndex + 1) % currentImages.length,
        }));
      }
    };

    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightbox, currentDoc, currentImages.length]);

  const nextImage = () => {
    if (!lightbox) return;
    setLightbox((prev) => ({
      ...prev!,
      imageIndex: (prev!.imageIndex + 1) % currentImages.length,
    }));
  };

  const prevImage = () => {
    if (!lightbox) return;
    setLightbox((prev) => ({
      ...prev!,
      imageIndex: (prev!.imageIndex - 1 + currentImages.length) % currentImages.length,
    }));
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("he-IL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

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
          href={`/gallery/${grade}`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowRight size={20} />
          <span className="font-medium hidden sm:inline">חזרה ליחידות</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-left">
            <h1 className="text-lg md:text-xl font-rubik font-bold text-gray-800">
              {unit?.name || "טוען..."}
            </h1>
            <p className="text-sm text-gray-500">{GRADE_LABELS[grade]}</p>
          </div>
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
              <Skeleton key={i} variant="card" className="h-64" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <EmptyState
              icon="alert-circle"
              title="שגיאה"
              description={error}
              action={{
                label: "נסה שוב",
                onClick: () => window.location.reload(),
              }}
            />
          </div>
        ) : docs.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <EmptyState
              icon="image"
              title="אין תיעודים"
              description="עדיין לא נוספו תיעודים ליחידה זו"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {docs.map((doc, docIndex) => (
              <button
                key={doc.id}
                type="button"
                className="group text-right bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-white/50 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                onClick={() => openLightbox(docIndex)}
                aria-label={`פתח תיעוד: ${doc.text || `${doc.images.length} תמונות`}`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={doc.images[0]}
                    alt={doc.text || "תיעוד"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    unoptimized
                  />

                  {/* Image count badge */}
                  {doc.images.length > 1 && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-sm px-2 py-1 rounded-full">
                      <Camera size={14} />
                      <span>{doc.images.length}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  {doc.text && (
                    <p className="text-gray-800 text-sm line-clamp-2 mb-2">
                      {doc.text}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{doc.teacherName}</span>
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightbox && currentDoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="תצוגת תמונה מוגדלת"
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
            aria-label="סגור"
          >
            <X size={32} />
          </button>

          {/* Navigation - Previous (right side for RTL) */}
          {currentImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
              aria-label="תמונה קודמת"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Navigation - Next (left side for RTL) */}
          {currentImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
              aria-label="תמונה הבאה"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImages[lightbox.imageIndex]}
              alt={currentDoc.text || "תיעוד"}
              width={1200}
              height={900}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              unoptimized
            />

            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              {currentDoc.text && (
                <p className="text-white text-lg mb-1">{currentDoc.text}</p>
              )}
              <p className="text-white/70 text-sm">
                תועד ע״י {currentDoc.teacherName}
              </p>
            </div>
          </div>

          {/* Counter - only show if multiple images */}
          {currentImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {lightbox.imageIndex + 1} / {currentImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
