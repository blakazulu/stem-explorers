"use client";

import { useEffect, useRef, useState } from "react";
import { X, Clock } from "lucide-react";
import type { Expert } from "@/types";

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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      setImageError(false);
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
      <div className="bg-surface-0 rounded-2xl shadow-xl overflow-hidden animate-scale-in">
        {/* Header with image */}
        <div className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 pt-8 pb-40 px-6">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 hover:bg-white/50 rounded-full transition-colors cursor-pointer"
            aria-label="סגור"
          >
            <X size={20} className="text-gray-600" />
          </button>

          {/* Large circular image */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-[150px]">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-30 blur-md scale-110" />
              <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden border-4 border-white shadow-xl">
                {!imageError && expert.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={expert.imageUrl}
                    alt={expert.name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary/60">
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
          <p className="text-primary font-medium mb-4">
            {expert.title}
          </p>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-4 text-right">
            {expert.description}
          </p>

          {/* Availability */}
          {expert.availability && (
            <div className="flex items-center gap-2 justify-center text-sm text-gray-500 bg-surface-1 rounded-lg py-2 px-4">
              <Clock size={16} className="text-primary" />
              <span>{expert.availability}</span>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
