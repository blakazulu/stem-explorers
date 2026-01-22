"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  User,
  Calendar,
  Images,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { Documentation } from "@/types";

interface DocumentationVisibility {
  images: boolean;
  text: boolean;
  teacherName: boolean;
}

interface DocumentationModalProps {
  doc: Documentation;
  isOpen: boolean;
  onClose: () => void;
  visibility?: DocumentationVisibility;
}

export function DocumentationModal({
  doc,
  isOpen,
  onClose,
  visibility = { images: true, text: true, teacherName: true },
}: DocumentationModalProps) {
  const { session } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const isAdmin = session?.user.role === "admin";

  const hasMultipleImages = doc.images.length > 1;

  // Mark image as loaded when DOM img fires onLoad
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  // Reset state when modal opens with new doc
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setLoadedImages(new Set());
    }
  }, [isOpen, doc.id]);

  const goToPrevious = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? doc.images.length - 1 : prev - 1
    );
  }, [doc.images.length]);

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev === doc.images.length - 1 ? 0 : prev + 1
    );
  }, [doc.images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && hasMultipleImages) {
        // RTL: Left arrow goes to next
        goToNext();
      } else if (e.key === "ArrowRight" && hasMultipleImages) {
        // RTL: Right arrow goes to previous
        goToPrevious();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasMultipleImages, goToNext, goToPrevious, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isCurrentImageLoaded = loadedImages.has(currentImageIndex);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal Content - scrollable on mobile */}
      <div
        className="relative bg-surface-0 rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
          aria-label="סגור"
        >
          <X size={20} />
        </button>

        {/* Image Gallery */}
        {visibility.images && doc.images.length > 0 && (
          <div className="relative bg-black overflow-hidden">
            {/* Carousel Container */}
            <div className="relative aspect-[4/3] sm:aspect-video md:aspect-[16/10]">
              {/* Sliding Track - contains all images */}
              <div
                className="absolute inset-0 flex transition-transform duration-300 ease-out"
                style={{
                  width: `${doc.images.length * 100}%`,
                  transform: `translateX(${currentImageIndex * (100 / doc.images.length)}%)`,
                }}
              >
                {doc.images.map((src, index) => (
                  <div
                    key={index}
                    className="relative h-full flex-shrink-0"
                    style={{ width: `${100 / doc.images.length}%` }}
                  >
                    <img
                      src={src}
                      alt={doc.text || `תמונה ${index + 1}`}
                      className="w-full h-full object-contain"
                      onLoad={() => handleImageLoad(index)}
                    />
                    {/* Per-image loading spinner */}
                    {!loadedImages.has(index) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black">
                        <Loader2 size={32} className="text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Loading overlay for current image */}
              {!isCurrentImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                  <Loader2 size={40} className="text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={goToNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
                  aria-label="תמונה הבאה"
                >
                  <ChevronRight size={24} />
                </button>
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
                  aria-label="תמונה קודמת"
                >
                  <ChevronLeft size={24} />
                </button>
              </>
            )}

            {/* Image Counter */}
            {hasMultipleImages && (
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {/* Dots - hidden on very small screens */}
                <div className="hidden xs:flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full">
                  {doc.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        index === currentImageIndex
                          ? "bg-white w-4"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`תמונה ${index + 1}`}
                    />
                  ))}
                </div>
                {/* Counter badge */}
                <span className="bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Images size={14} />
                  {currentImageIndex + 1} / {doc.images.length}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content Section - flexible height on mobile */}
        <div className="p-4 sm:p-6">
          {/* Text */}
          {visibility.text && doc.text && (
            <p className="text-foreground text-base sm:text-lg leading-relaxed mb-4 whitespace-pre-wrap">
              {doc.text}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500 pt-4 border-t border-surface-2">
            {visibility.teacherName && (
              <span className="inline-flex items-center gap-1.5">
                <User size={14} />
                {doc.teacherName}
              </span>
            )}
            {isAdmin && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} />
                {doc.createdAt.toLocaleDateString("he-IL")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
