import { Star, Check, Circle, CircleDot, Square, CheckSquare, PenLine } from "lucide-react";
import type { Question } from "@/types";

interface QuestionRendererProps {
  question: Question;
  value: string | number | string[];
  onChange: (value: string | number | string[]) => void;
}

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  switch (question.type) {
    case "rating":
      return (
        <div className="space-y-4">
          <p className="text-lg font-rubik font-medium text-foreground">
            {question.text}
          </p>
          <div className="flex justify-center gap-2 md:gap-3">
            {[1, 2, 3, 4, 5].map((n) => {
              const isSelected = typeof value === "number" && value >= n;
              const isExact = value === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(n)}
                  className={`group relative p-2 md:p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isExact
                      ? "bg-accent/20 scale-110"
                      : "hover:bg-surface-2"
                  }`}
                >
                  <Star
                    size={32}
                    className={`transition-all duration-200 ${
                      isSelected
                        ? "fill-accent text-accent"
                        : "text-gray-300 group-hover:text-accent/50"
                    }`}
                  />
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-medium transition-opacity ${
                      isExact ? "opacity-100 text-accent" : "opacity-0"
                    }`}
                  >
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 px-2">
            <span>לא טוב</span>
            <span>מצוין!</span>
          </div>
        </div>
      );

    case "single":
      return (
        <div className="space-y-4">
          <p className="text-lg font-rubik font-medium text-foreground">
            {question.text}
          </p>
          <div className="space-y-2">
            {question.options?.map((option) => {
              const isSelected = value === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange(option)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-right transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-surface-3 hover:border-primary/50 hover:bg-surface-1"
                  }`}
                >
                  <div
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                  <span
                    className={`flex-1 ${
                      isSelected ? "text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );

    case "multiple": {
      const selectedValues = (value as string[]) || [];
      return (
        <div className="space-y-4">
          <p className="text-lg font-rubik font-medium text-foreground">
            {question.text}
          </p>
          <p className="text-sm text-gray-500">ניתן לבחור יותר מתשובה אחת</p>
          <div className="space-y-2">
            {question.options?.map((option) => {
              const isSelected = selectedValues.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onChange(selectedValues.filter((v) => v !== option));
                    } else {
                      onChange([...selectedValues, option]);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-right transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-secondary bg-secondary/5"
                      : "border-surface-3 hover:border-secondary/50 hover:bg-surface-1"
                  }`}
                >
                  <div
                    className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? "border-secondary bg-secondary"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                  <span
                    className={`flex-1 ${
                      isSelected ? "text-secondary font-medium" : "text-foreground"
                    }`}
                  >
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedValues.length > 0 && (
            <p className="text-sm text-secondary">
              נבחרו {selectedValues.length} תשובות
            </p>
          )}
        </div>
      );
    }

    case "open":
      return (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0 mt-1">
              <PenLine size={20} className="text-primary" />
            </div>
            <p className="text-lg font-rubik font-medium text-foreground">
              {question.text}
            </p>
          </div>
          <textarea
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="כתבו את תשובתכם כאן..."
            className="w-full p-4 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            rows={5}
          />
          {typeof value === "string" && value.length > 0 && (
            <p className="text-sm text-gray-400 text-left">
              {value.length} תווים
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
}
