"use client";

import { FlaskConical } from "lucide-react";

interface ExperimentHeaderProps {
  title: string;
  hypothesisPrompt: string;
  imageUrl?: string;
}

/**
 * Header component for the experiment game.
 * Displays the experiment title, hypothesis prompt, and optional image.
 */
export function ExperimentHeader({
  title,
  hypothesisPrompt,
  imageUrl,
}: ExperimentHeaderProps) {
  return (
    <div className="text-center space-y-4">
      {/* Experiment icon and title */}
      <div className="flex items-center justify-center gap-3">
        <div className="p-3 bg-indigo-100 rounded-xl">
          <FlaskConical size={28} className="text-indigo-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-rubik font-bold text-gray-800">
          {title}
        </h2>
      </div>

      {/* Optional experiment image */}
      {imageUrl && (
        <div className="flex justify-center">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full h-auto max-h-48 rounded-xl shadow-md object-contain"
          />
        </div>
      )}

      {/* Hypothesis prompt */}
      <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
        <p className="text-sm text-indigo-600 font-medium mb-1">
          שאלת המחקר:
        </p>
        <p className="text-gray-800 font-medium text-lg">
          {hypothesisPrompt}
        </p>
      </div>
    </div>
  );
}
