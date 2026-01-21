"use client";

import { KeyboardEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Send, RotateCcw } from "lucide-react";

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onRetry: () => void;
  disabled: boolean;
  showRetry: boolean;
  attemptsLeft: number;
}

/**
 * Input field for entering the missing number guess.
 * Includes submit button and retry functionality.
 */
export function NumberInput({
  value,
  onChange,
  onSubmit,
  onRetry,
  disabled,
  showRetry,
  attemptsLeft,
}: NumberInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disabled && value.trim()) {
      onSubmit();
    }
  };

  // Allow only numbers and negative sign
  const handleChange = (newValue: string) => {
    // Allow empty string, negative sign, or valid numbers
    if (newValue === "" || newValue === "-" || /^-?\d+$/.test(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="?"
          className={`
            w-20 h-14 text-center text-2xl font-bold
            border-2 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-blue-400
            transition-all duration-200
            ${disabled
              ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-white border-blue-300 text-blue-700"
            }
          `}
          dir="ltr"
        />

        {showRetry ? (
          <Button
            onClick={onRetry}
            variant="outline"
            leftIcon={RotateCcw}
            className="border-blue-400 text-blue-600 hover:bg-blue-50"
          >
            נסה שוב
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={disabled || !value.trim()}
            variant="primary"
            leftIcon={Send}
            className="bg-blue-600 hover:bg-blue-700"
          >
            בדוק
          </Button>
        )}
      </div>

      {!disabled && attemptsLeft < 3 && (
        <p className="text-sm text-gray-500">
          נותרו {attemptsLeft} ניסיונות
        </p>
      )}
    </div>
  );
}
