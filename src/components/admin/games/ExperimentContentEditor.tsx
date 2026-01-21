"use client";

import { Trash2, Plus, X, GripVertical } from "lucide-react";
import type { ExperimentContent, ExperimentStep } from "@/types/games";

interface ExperimentContentEditorProps {
  content: ExperimentContent;
  onEdit: (updates: Partial<ExperimentContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

export function ExperimentContentEditor({
  content,
  onEdit,
  onDelete,
  isNew,
}: ExperimentContentEditorProps) {
  // Handle title change
  const handleTitleChange = (value: string) => {
    onEdit({ title: value });
  };

  // Handle hypothesis prompt change
  const handleHypothesisPromptChange = (value: string) => {
    onEdit({ hypothesisPrompt: value });
  };

  // Handle conclusion change
  const handleConclusionChange = (value: string) => {
    onEdit({ conclusion: value });
  };

  // Handle main image URL change
  const handleImageUrlChange = (value: string) => {
    onEdit({ imageUrl: value });
  };

  // Handle step instruction change
  const handleStepInstructionChange = (index: number, value: string) => {
    const newSteps = content.steps.map((step, i) =>
      i === index ? { ...step, instruction: value } : step
    );
    onEdit({ steps: newSteps });
  };

  // Handle step image URL change
  const handleStepImageUrlChange = (index: number, value: string) => {
    const newSteps = content.steps.map((step, i) =>
      i === index ? { ...step, imageUrl: value || undefined } : step
    );
    onEdit({ steps: newSteps });
  };

  // Handle adding a new step
  const handleAddStep = () => {
    const newStep: ExperimentStep = {
      instruction: "",
      imageUrl: undefined,
    };
    onEdit({ steps: [...content.steps, newStep] });
  };

  // Handle removing a step
  const handleRemoveStep = (index: number) => {
    if (content.steps.length <= 1) return; // Minimum 1 step
    const newSteps = content.steps.filter((_, i) => i !== index);
    onEdit({ steps: newSteps });
  };

  // Handle moving step up
  const handleMoveStepUp = (index: number) => {
    if (index === 0) return;
    const newSteps = [...content.steps];
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    onEdit({ steps: newSteps });
  };

  // Handle moving step down
  const handleMoveStepDown = (index: number) => {
    if (index === content.steps.length - 1) return;
    const newSteps = [...content.steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    onEdit({ steps: newSteps });
  };

  return (
    <div
      className={`
        p-4 rounded-xl border-2
        ${isNew ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              כותרת הניסוי:
            </label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="למשל: ניסוי צפיפות - מה צף ומה שוקע?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              dir="rtl"
            />
          </div>

          {/* Hypothesis prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              שאלת המחקר / השערה:
            </label>
            <textarea
              value={content.hypothesisPrompt}
              onChange={(e) => handleHypothesisPromptChange(e.target.value)}
              placeholder="למשל: מה לדעתך יקרה כשנשים את החפצים במים?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={2}
              dir="rtl"
            />
          </div>

          {/* Main image URL (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              תמונה ראשית (אופציונלי):
            </label>
            <input
              type="text"
              value={content.imageUrl || ""}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="כתובת URL לתמונה"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              dir="ltr"
            />
          </div>

          {/* Steps section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              שלבי הניסוי ({content.steps.length}):
            </label>
            <div className="space-y-3">
              {content.steps.map((step, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start gap-2">
                    {/* Step number and drag handle */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      {content.steps.length > 1 && (
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveStepUp(index)}
                            disabled={index === 0}
                            className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            title="העבר למעלה"
                          >
                            <GripVertical size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={step.instruction}
                        onChange={(e) => handleStepInstructionChange(index, e.target.value)}
                        placeholder={`הוראת שלב ${index + 1}`}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        dir="rtl"
                      />
                      <input
                        type="text"
                        value={step.imageUrl || ""}
                        onChange={(e) => handleStepImageUrlChange(index, e.target.value)}
                        placeholder="תמונת שלב (אופציונלי)"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        dir="ltr"
                      />
                    </div>

                    {/* Remove step button */}
                    {content.steps.length > 1 && (
                      <button
                        onClick={() => handleRemoveStep(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                        title="הסר שלב"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add step button */}
              <button
                onClick={handleAddStep}
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-150 flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                הוסף שלב
              </button>
            </div>
          </div>

          {/* Conclusion */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              מסקנת הניסוי:
            </label>
            <textarea
              value={content.conclusion}
              onChange={(e) => handleConclusionChange(e.target.value)}
              placeholder="למשל: חפצים קלים יותר מהמים צפים, וחפצים כבדים יותר שוקעים. זה תלוי בצפיפות החומר."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={3}
              dir="rtl"
            />
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="מחק ניסוי"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isNew && (
        <div className="mt-3 text-xs text-indigo-600 font-medium">
          ניסוי חדש - יישמר כשתלחץ על &quot;שמור שינויים&quot;
        </div>
      )}
    </div>
  );
}
