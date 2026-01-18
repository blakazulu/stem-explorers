"use client";

import { useEffect, useRef, useState } from "react";
import { X, Clock, Loader2 } from "lucide-react";
import type { Expert } from "@/types";
import { useRoleStyles } from "@/contexts/ThemeContext";

interface ExpertDetailsModalProps {
  expert: Expert | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExpertDetailsModal({
  expert,
  isOpen,
  onClose,
}: ExpertDetailsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const roleStyles = useRoleStyles();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      setImageError(false);
      setImageLoaded(false);
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Handle Escape key to ensure onClose is called
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  if (!expert) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className="fixed inset-0 m-auto backdrop:bg-black/50 bg-transparent p-4 max-w-2xl w-full"
    >
      <div className="bg-surface-0 rounded-theme shadow-xl overflow-hidden animate-scale-in">
        {/* Header with image */}
        <div className={`relative ${roleStyles.bgLight} pt-8 pb-40 px-6`}>
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/50 rounded-full transition-colors duration-theme cursor-pointer"
            aria-label="סגור"
          >
            <X size={20} className="text-gray-600" />
          </button>

          {/* Large circular image */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-[150px]">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full ${roleStyles.bg} opacity-30 blur-md scale-110`} />
              <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden border-4 border-white shadow-xl">
                {!imageError && expert.imageUrl ? (
                  <>
                    {/* Loading spinner */}
                    {!imageLoaded && (
                      <div className={`absolute inset-0 ${roleStyles.bgLight} flex items-center justify-center`}>
                        <Loader2 size={40} className={`${roleStyles.text} animate-spin`} />
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={expert.imageUrl}
                      alt={expert.name}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                    />
                  </>
                ) : (
                  <div className={`w-full h-full ${roleStyles.bgLight} flex items-center justify-center`}>
                    <span className={`text-3xl font-bold ${roleStyles.text} opacity-60`}>
                      {expert.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-40 pb-6 px-6 text-center">
          {/* Name */}
          <h2 className="text-xl font-rubik font-bold text-foreground mb-1">
            {expert.name}
          </h2>

          {/* Title */}
          <p className={`${roleStyles.text} font-medium mb-4`}>
            {expert.title}
          </p>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-4 text-right">
            {expert.description}
          </p>

          {/* Availability */}
          {expert.availability && expert.availability.length > 0 && (
            <div className="flex items-center gap-2 justify-center text-sm text-gray-500 bg-surface-1 rounded-theme py-2 px-4">
              <Clock size={16} className={roleStyles.text} />
              <span>{expert.availability.length} ימים זמינים בלוח</span>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
