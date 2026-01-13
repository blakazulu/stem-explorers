"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Icon } from "./Icon";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Convenience functions
export function useToastActions() {
  const { addToast } = useToast();

  return {
    success: (title: string, description?: string) =>
      addToast({ type: "success", title, description }),
    error: (title: string, description?: string) =>
      addToast({ type: "error", title, description }),
    warning: (title: string, description?: string) =>
      addToast({ type: "warning", title, description }),
    info: (title: string, description?: string) =>
      addToast({ type: "info", title, description }),
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

const toastStyles: Record<ToastType, { bg: string; border: string; icon: "check-circle" | "x-circle" | "alert-triangle" | "info" }> = {
  success: {
    bg: "bg-success/10",
    border: "border-success",
    icon: "check-circle",
  },
  error: {
    bg: "bg-error/10",
    border: "border-error",
    icon: "x-circle",
  },
  warning: {
    bg: "bg-accent/10",
    border: "border-accent",
    icon: "alert-triangle",
  },
  info: {
    bg: "bg-secondary/10",
    border: "border-secondary",
    icon: "info",
  },
};

const iconColors: Record<ToastType, string> = {
  success: "text-success",
  error: "text-error",
  warning: "text-accent",
  info: "text-secondary",
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const style = toastStyles[toast.type];

  return (
    <div
      className={`${style.bg} ${style.border} border-r-4 rounded-lg p-4 shadow-lg animate-slide-in-right flex items-start gap-3`}
      role="alert"
    >
      <Icon name={style.icon} size="md" className={iconColors[toast.type]} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-sm text-gray-600 mt-1">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        aria-label="סגור"
      >
        <Icon name="x" size="sm" />
      </button>
    </div>
  );
}
