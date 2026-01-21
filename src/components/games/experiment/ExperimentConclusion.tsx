"use client";

import { Trophy, Lightbulb, ClipboardCheck } from "lucide-react";
import { Confetti } from "@/components/ui/Progress";

interface ExperimentConclusionProps {
  conclusion: string;
  hypothesis: string;
  score: number;
}

/**
 * Conclusion component for the experiment game.
 * Shows the final results, compares with hypothesis, and displays score.
 */
export function ExperimentConclusion({
  conclusion,
  hypothesis,
  score,
}: ExperimentConclusionProps) {
  const isExcellent = score >= 80;

  return (
    <div className="space-y-4 animate-scale-in">
      <Confetti show={isExcellent} />

      {/* Success banner */}
      <div className="bg-emerald-100 border-2 border-emerald-300 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {isExcellent ? (
            <Trophy size={28} className="text-amber-500" />
          ) : (
            <ClipboardCheck size={28} className="text-emerald-600" />
          )}
          <h3 className="text-xl font-rubik font-bold text-emerald-800">
            {isExcellent ? "ניסוי מושלם!" : "הניסוי הושלם!"}
          </h3>
        </div>
        <p className="text-emerald-700 font-medium">
          ניקוד סופי: <span className="font-bold text-lg">{score}</span>
        </p>
      </div>

      {/* Hypothesis comparison */}
      {hypothesis && hypothesis.trim() && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <Lightbulb size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-600 font-medium mb-1">
                ההשערה שלך:
              </p>
              <p className="text-blue-800 font-medium">
                &ldquo;{hypothesis}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scientific conclusion */}
      <div className="bg-white border-2 border-indigo-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <div className="p-1.5 bg-indigo-100 rounded-lg flex-shrink-0">
            <ClipboardCheck size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-indigo-600 font-medium mb-1">
              מסקנת הניסוי:
            </p>
            <p className="text-gray-800 leading-relaxed">
              {conclusion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
