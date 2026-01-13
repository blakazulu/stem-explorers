"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";
import { AlertTriangle, Trash2, Info, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: "bg-error/10",
    iconColor: "text-error",
    buttonClass: "bg-error hover:bg-error/90 focus:ring-error",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    buttonClass: "bg-accent hover:bg-accent/90 focus:ring-accent",
  },
  info: {
    icon: Info,
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
    buttonClass: "bg-secondary hover:bg-secondary/90 focus:ring-secondary",
  },
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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
        onCancel();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const config = variantConfig[variant];
  const IconComponent = config.icon;

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-md w-full shadow-2xl animate-scale-in border-0 m-0"
      onClose={onCancel}
    >
      <div className="p-6" dir="rtl">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center`}
          >
            <IconComponent size={32} className={config.iconColor} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-rubik font-bold text-foreground mb-2">
            {title}
          </h2>
          <p className="text-gray-500">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <button
            onClick={onConfirm}
            className={`font-rubik font-medium rounded-xl px-6 py-2.5 text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] ${config.buttonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
