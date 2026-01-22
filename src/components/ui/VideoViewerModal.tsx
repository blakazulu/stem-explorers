"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface VideoViewerModalProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoViewerModal({ videoUrl, isOpen, onClose }: VideoViewerModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      // Auto-play when modal opens (may fail on mobile, user can click play)
      videoRef.current?.play().catch(() => {});
    } else {
      dialog.close();
      // Pause when modal closes
      videoRef.current?.pause();
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

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto z-50 bg-transparent backdrop:bg-black/90 border-0 p-0 max-w-[90vw] max-h-[90vh]"
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
          className="absolute top-2 right-2 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 cursor-pointer hover:scale-110"
          aria-label="סגור"
        >
          <X size={20} />
        </button>

        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          className="max-w-[85vw] max-h-[85vh] rounded-xl shadow-2xl bg-black"
        >
          הדפדפן שלך לא תומך בתגית וידאו
        </video>
      </div>
    </dialog>
  );
}
