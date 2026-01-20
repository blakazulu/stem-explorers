"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X, ChevronLeft, ChevronRight, Camera, Loader2, Images } from "lucide-react";
import { useUnit, useDocumentationByUnit } from "@/lib/queries";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Grade, Documentation } from "@/types";

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

// Thumbnail card with loading state
function ThumbnailCard({
  doc,
  onClick,
  formatDate,
}: {
  doc: Documentation;
  onClick: () => void;
  formatDate: (date: Date) => string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <button
      type="button"
      className="group text-right bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden border border-white/50 shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      onClick={onClick}
      aria-label={`פתח תיעוד: ${doc.text || `${doc.images.length} תמונות`}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {/* Loading spinner */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 size={32} className="text-gray-400 animate-spin" />
          </div>
        )}
        {!imageError ? (
          <Image
            src={doc.images[0]}
            alt={doc.text || "תיעוד"}
            fill
            className={`object-cover group-hover:scale-105 transition-all duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            unoptimized
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <Camera size={32} className="text-gray-400" />
          </div>
        )}

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
          {/* Date hidden per admin request - kept for potential future use
          <span>{formatDate(doc.createdAt)}</span>
          */}
        </div>
      </div>
    </button>
  );
}

// Lightbox carousel with sliding effect and loading states
function LightboxCarousel({
  images,
  currentIndex,
  onIndexChange,
  onClose,
  caption,
  author,
}: {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  caption?: string;
  author: string;
}) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const hasMultipleImages = images.length > 1;

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const goToPrevious = useCallback(() => {
    onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, onIndexChange]);

  const goToNext = useCallback(() => {
    onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasMultipleImages) {
        goToNext();
      } else if (e.key === "ArrowRight" && hasMultipleImages) {
        goToPrevious();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hasMultipleImages, goToNext, goToPrevious, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const isCurrentImageLoaded = loadedImages.has(currentIndex);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="תצוגת תמונה מוגדלת"
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-20"
        aria-label="סגור"
      >
        <X size={32} />
      </button>

      {/* Image Carousel Container */}
      <div
        className="flex-1 flex items-center justify-center p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full max-w-5xl h-full max-h-[70vh] overflow-hidden rounded-lg">
          {/* Sliding Track */}
          <div
            className="absolute inset-0 flex transition-transform duration-300 ease-out"
            style={{
              width: `${images.length * 100}%`,
              transform: `translateX(${currentIndex * (100 / images.length)}%)`,
            }}
          >
            {images.map((src, index) => (
              <div
                key={index}
                className="relative h-full flex-shrink-0 flex items-center justify-center"
                style={{ width: `${100 / images.length}%` }}
              >
                <img
                  src={src}
                  alt={caption || `תמונה ${index + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onLoad={() => handleImageLoad(index)}
                />
                {/* Per-image loading spinner */}
                {!loadedImages.has(index) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={48} className="text-white animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Loading overlay for current image */}
          {!isCurrentImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <Loader2 size={48} className="text-white animate-spin" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {hasMultipleImages && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-10"
            aria-label="תמונה קודמת"
          >
            <ChevronRight size={32} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-10"
            aria-label="תמונה הבאה"
          >
            <ChevronLeft size={32} />
          </button>
        </>
      )}

      {/* Caption and Counter */}
      <div className="relative z-10 bg-gradient-to-t from-black/80 to-transparent p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {caption && (
            <p className="text-white text-base sm:text-lg mb-1">{caption}</p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-white/70 text-sm">תועד ע״י {author}</p>
            {hasMultipleImages && (
              <div className="flex items-center gap-2">
                {/* Dots */}
                <div className="hidden sm:flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        onIndexChange(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        index === currentIndex
                          ? "bg-white w-4"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`תמונה ${index + 1}`}
                    />
                  ))}
                </div>
                {/* Counter badge */}
                <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Images size={14} />
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnitGalleryPage() {
  const params = useParams();
  const grade = decodeURIComponent(params.grade as string) as Grade;
  const unitId = params.unitId as string;
  const isValidGrade = VALID_GRADES.includes(grade);

  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const {
    data: unit,
    isLoading: unitLoading,
    error: unitError,
    refetch: refetchUnit
  } = useUnit(isValidGrade ? unitId : null);

  const {
    data: docs = [],
    isLoading: docsLoading,
    error: docsError,
    refetch: refetchDocs
  } = useDocumentationByUnit(
    isValidGrade ? unitId : null,
    isValidGrade ? grade : null
  );

  const loading = unitLoading || docsLoading;
  const error = unitError || docsError || (unit && unit.gradeId !== grade ? true : null);

  const handleRetry = () => {
    refetchUnit();
    refetchDocs();
  };

  const openLightbox = (docIndex: number, imageIndex: number = 0) => {
    setLightbox({ docIndex, imageIndex });
  };

  const closeLightbox = () => setLightbox(null);

  // Get current doc's images for navigation
  const currentDoc = lightbox ? docs[lightbox.docIndex] : null;
  const currentImages = currentDoc?.images || [];

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
              description={unit && unit.gradeId !== grade ? "יחידת הלימוד לא נמצאה" : "שגיאה בטעינת התיעודים"}
              action={{
                label: "נסה שוב",
                onClick: handleRetry,
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
              <ThumbnailCard
                key={doc.id}
                doc={doc}
                onClick={() => openLightbox(docIndex)}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </main>

      {/* Lightbox with Sliding Carousel */}
      {lightbox && currentDoc && (
        <LightboxCarousel
          images={currentImages}
          currentIndex={lightbox.imageIndex}
          onIndexChange={(index) => setLightbox((prev) => ({ ...prev!, imageIndex: index }))}
          onClose={closeLightbox}
          caption={currentDoc.text}
          author={currentDoc.teacherName}
        />
      )}
    </div>
  );
}
