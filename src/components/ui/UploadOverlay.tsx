"use client";

import { Loader2 } from "lucide-react";
import { Progress } from "./Progress";

interface UploadOverlayProps {
  progress?: number; // 0-100, if undefined shows indeterminate animation
  message?: string;
}

export function UploadOverlay({ progress, message }: UploadOverlayProps) {
  const isIndeterminate = progress === undefined;

  return (
    <div
      className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3 z-10"
      role="status"
      aria-live="polite"
      aria-label={message || "מעלה..."}
    >
      <Loader2 className="w-8 h-8 text-primary animate-spin" aria-hidden="true" />
      <div className="w-3/4 max-w-[120px]">
        {isIndeterminate ? (
          <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary rounded-full animate-shimmer" />
          </div>
        ) : (
          <Progress value={progress} size="sm" animated />
        )}
      </div>
      {message && (
        <p className="text-sm text-gray-600 text-center px-2">{message}</p>
      )}
    </div>
  );
}
