"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Loader2, CheckCircle } from "lucide-react";

interface RefreshModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function RefreshModal({ isOpen, onComplete }: RefreshModalProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"clearing" | "complete">("clearing");

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setStatus("clearing");
      return;
    }

    // Start cache clearing process
    const clearCaches = async () => {
      try {
        // Unregister all service workers
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map((registration) => registration.unregister())
          );
        }

        // Clear all caches from Cache Storage API
        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        }
      } catch (error) {
        console.error("Error clearing caches:", error);
      }
    };

    clearCaches();

    // Animate progress over 3 seconds (minimum)
    const duration = 3000;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setStatus("complete");
        // Wait a moment to show completion, then reload
        setTimeout(() => {
          onComplete();
          window.location.reload();
        }, 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-80 text-center animate-scale-in">
        {/* Animated icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {status === "clearing" ? (
            <>
              {/* Outer spinning ring */}
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"
                style={{ animationDuration: "1s" }}
              />
              {/* Inner icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-16 h-16 text-success" />
            </div>
          )}
        </div>

        {/* Status text */}
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {status === "clearing" ? "מרענן את האפליקציה..." : "הושלם!"}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {status === "clearing"
            ? "מנקה קבצים שמורים וטוען גרסה חדשה"
            : "טוען מחדש..."}
        </p>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-primary to-secondary transition-all duration-100 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
