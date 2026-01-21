"use client";

import { CheckCircle2 } from "lucide-react";

interface ExperimentStepProps {
  stepNumber: number;
  instruction: string;
  imageUrl?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

/**
 * Single step component for the experiment game.
 * Displays step number, instruction, optional image, and completion status.
 */
export function ExperimentStep({
  stepNumber,
  instruction,
  imageUrl,
  isCompleted,
  isCurrent,
}: ExperimentStepProps) {
  return (
    <div
      className={`
        p-4 rounded-xl border-2 transition-all duration-300
        ${isCurrent
          ? "border-indigo-400 bg-indigo-50 shadow-md"
          : isCompleted
            ? "border-emerald-300 bg-emerald-50"
            : "border-gray-200 bg-gray-50 opacity-60"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Step number indicator */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            font-bold text-lg transition-all duration-300
            ${isCurrent
              ? "bg-indigo-600 text-white"
              : isCompleted
                ? "bg-emerald-500 text-white"
                : "bg-gray-300 text-gray-600"
            }
          `}
        >
          {isCompleted ? (
            <CheckCircle2 size={24} />
          ) : (
            <span>{stepNumber}</span>
          )}
        </div>

        {/* Step content */}
        <div className="flex-1">
          <p
            className={`
              text-base font-medium
              ${isCurrent
                ? "text-gray-800"
                : isCompleted
                  ? "text-emerald-800"
                  : "text-gray-600"
              }
            `}
          >
            {instruction}
          </p>

          {/* Optional step image */}
          {imageUrl && isCurrent && (
            <div className="mt-3">
              <img
                src={imageUrl}
                alt={`שלב ${stepNumber}`}
                className="max-w-full h-auto max-h-40 rounded-lg shadow-sm object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
