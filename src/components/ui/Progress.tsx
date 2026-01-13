"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

interface ProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "gradient";
  animated?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  showLabel = false,
  size = "md",
  variant = "default",
  animated = true,
  className = "",
}: ProgressProps) {
  const [displayValue, setDisplayValue] = useState(animated ? 0 : value);
  const percentage = Math.min(100, Math.max(0, (displayValue / max) * 100));
  const isComplete = percentage >= 100;

  useEffect(() => {
    if (animated) {
      // Animate to target value
      const timer = setTimeout(() => setDisplayValue(value), 50);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animated]);

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const barStyles = {
    default: "bg-primary",
    success: isComplete ? "bg-success" : "bg-primary",
    gradient: "bg-gradient-to-l from-primary to-secondary",
  };

  return (
    <div className={className}>
      <div className={`w-full bg-surface-2 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barStyles[variant]} ${
            isComplete && variant === "success" ? "animate-celebrate" : ""
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex items-center justify-between mt-1 text-sm text-gray-500">
          <span>{Math.round(percentage)}%</span>
          {isComplete && (
            <span className="flex items-center gap-1 text-success">
              <Icon name="check-circle" size="sm" />
              הושלם
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Step Progress component for wizard flows
interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepProgress({
  currentStep,
  totalSteps,
  labels,
  className = "",
}: StepProgressProps) {
  return (
    <div className={className}>
      {/* Progress bar */}
      <div className="relative">
        <div className="h-2 bg-surface-2 rounded-full">
          <div
            className="h-full bg-gradient-to-l from-primary to-secondary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="absolute inset-0 flex justify-between items-center px-1">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNumber = i + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary border-primary"
                    : isCurrent
                    ? "bg-white border-primary scale-125"
                    : "bg-white border-surface-3"
                }`}
              >
                {isCompleted && (
                  <Icon name="check" size={12} className="text-white" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels */}
      {labels && labels.length === totalSteps && (
        <div className="flex justify-between mt-2">
          {labels.map((label, i) => (
            <span
              key={i}
              className={`text-xs ${
                i + 1 <= currentStep ? "text-primary font-medium" : "text-gray-400"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Step counter */}
      <div className="text-center mt-2 text-sm text-gray-500">
        שלב {currentStep} מתוך {totalSteps}
      </div>
    </div>
  );
}

// Celebration confetti effect component
export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;

  const colors = ["#0F766E", "#0284C7", "#F59E0B", "#22C55E", "#10B981"];
  const confettiPieces = Array.from({ length: 50 });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-20px",
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}
