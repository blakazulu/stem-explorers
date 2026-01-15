"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
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

interface ImageItem {
  url: string;
  docId: string;
  text?: string;
  teacherName: string;
}

export default function UnitGalleryPage() {
  const params = useParams();
  const grade = decodeURIComponent(params.grade as string) as Grade;
  const unitId = params.unitId as string;
  const isValidGrade = VALID_GRADES.includes(grade);

  const [unit, setUnit] = useState<Unit | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isValidGrade || !unitId) return;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [unitData, docs] = await Promise.all([
          getUnit(unitId),
          getDocumentationByUnit(unitId, grade),
        ]);

        if (!unitData || unitData.gradeId !== grade) {
          setError("יחידת הלימוד לא נמצאה");
          return;
        }

        setUnit(unitData);

        // Flatten all images from all documentation records
        const allImages: ImageItem[] = [];
        docs.forEach((doc: Documentation) => {
          doc.images.forEach((url: string) => {
            allImages.push({
              url,
              docId: doc.id,
              text: doc.text,
              teacherName: doc.teacherName,
            });
          });
        });
        setImages(allImages);
      } catch (err) {
        console.error("Failed to load documentation:", err);
        setError("שגיאה בטעינת התיעודים");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [grade, unitId, isValidGrade]);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowRight") {
        // RTL - right goes to previous
        setLightboxIndex((prev) => (prev! - 1 + images.length) % images.length);
      } else if (e.key === "ArrowLeft") {
        // RTL - left goes to next
        setLightboxIndex((prev) => (prev! + 1) % images.length);
      }
    };

    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, images.length]);

  const nextImage = () => {
    setLightboxIndex((prev) => (prev! + 1) % images.length);
  };
  const prevImage = () => {
    setLightboxIndex((prev) => (prev! - 1 + images.length) % images.length);
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
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton
                key={i}
                variant="card"
                className="mb-4 break-inside-avoid"
                style={{ height: `${150 + (i % 3) * 50}px` }}
              />
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
        ) : images.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <EmptyState
              icon="image"
              title="אין תיעודים"
              description="עדיין לא נוספו תיעודים ליחידה זו"
            />
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {images.map((image, index) => (
              <button
                key={`${image.docId}-${index}`}
                type="button"
                className="mb-4 break-inside-avoid cursor-pointer group w-full text-right"
                onClick={() => openLightbox(index)}
                aria-label={`פתח תמונה ${index + 1}: ${image.text || "תיעוד"}`}
              >
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-white/50 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300">
                  <Image
                    src={image.url}
                    alt={image.text || "תיעוד"}
                    width={400}
                    height={300}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    unoptimized
                  />
                  {image.text && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <p className="text-white text-sm line-clamp-2">{image.text}</p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && (
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
          {images.length > 1 && (
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
          {images.length > 1 && (
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
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].text || "תיעוד"}
              width={1200}
              height={900}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              unoptimized
            />

            {/* Caption */}
            {(images[lightboxIndex].text || images[lightboxIndex].teacherName) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                {images[lightboxIndex].text && (
                  <p className="text-white text-lg mb-1">{images[lightboxIndex].text}</p>
                )}
                <p className="text-white/70 text-sm">
                  צולם ע״י {images[lightboxIndex].teacherName}
                </p>
              </div>
            )}
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
