"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ImageViewerModalProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageViewerModal({ imageUrl, isOpen, onClose }: ImageViewerModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto z-50 bg-transparent backdrop:bg-black/80 border-0 p-0 max-w-[90vw] max-h-[90vh]"
      onClose={onClose}
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="relative" dir="rtl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -left-3 z-10 p-2 bg-white text-gray-600 hover:text-gray-900 rounded-full shadow-lg transition-all duration-200 cursor-pointer hover:scale-110"
          aria-label="סגור"
        >
          <X size={20} />
        </button>

        <img
          src={imageUrl}
          alt="תמונה מוגדלת"
          className="max-w-[85vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
        />
      </div>
    </dialog>
  );
}
