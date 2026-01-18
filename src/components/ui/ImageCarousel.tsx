"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronLeft, Images, Loader2 } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  aspectRatio?: string;
  showCounter?: boolean;
  showDots?: boolean;
  className?: string;
}

export function ImageCarousel({
  images,
  alt = "תמונה",
  aspectRatio = "aspect-[4/3] sm:aspect-video md:aspect-[16/10]",
  showCounter = true,
  showDots = true,
  className = "",
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const hasMultipleImages = images.length > 1;

  // Reset when images change
  useEffect(() => {
    setCurrentIndex(0);
    setLoadedImages(new Set());
  }, [images]);

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && hasMultipleImages) {
        // RTL: Left arrow goes to next
        goToNext();
      } else if (e.key === "ArrowRight" && hasMultipleImages) {
        // RTL: Right arrow goes to previous
        goToPrevious();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hasMultipleImages, goToNext, goToPrevious]);

  if (images.length === 0) return null;

  const isCurrentImageLoaded = loadedImages.has(currentIndex);

  return (
    <div className={`relative bg-black overflow-hidden ${className}`}>
      {/* Carousel Container */}
      <div className={`relative ${aspectRatio}`}>
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
              className="relative h-full flex-shrink-0"
              style={{ width: `${100 / images.length}%` }}
            >
              <img
                src={src}
                alt={`${alt} ${index + 1}`}
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
      {hasMultipleImages && (showDots || showCounter) && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {/* Dots */}
          {showDots && (
            <div className="hidden xs:flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    index === currentIndex
                      ? "bg-white w-4"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`תמונה ${index + 1}`}
                />
              ))}
            </div>
          )}
          {/* Counter badge */}
          {showCounter && (
            <span className="bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Images size={14} />
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
