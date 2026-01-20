import { useState, useEffect } from "react";
import { Star, Heart, ThumbsUp, ThumbsDown, Check, PenLine } from "lucide-react";
import type { Question, RatingStyle } from "@/types";

interface QuestionRendererProps {
  question: Question;
  value: string | number | string[];
  onChange: (value: string | number | string[]) => void;
}

// Emoji sequence for rating (1=sad, 5=happy)
const ratingEmojis = ["😢", "😕", "😐", "🙂", "😊"];

// Labels for different rating styles
const ratingLabels: Record<RatingStyle, { low: string; high: string }> = {
  stars: { low: "לא טוב", high: "מצוין!" },
  hearts: { low: "פחות", high: "הרבה!" },
  emojis: { low: "עצוב", high: "שמח!" },
  thumbs: { low: "לא מסכים", high: "מסכים מאוד!" },
};

const OTHER_PREFIX = "אחר: ";

// Helper to check if a value is an "other" answer
function isOtherValue(val: string): boolean {
  return val.startsWith(OTHER_PREFIX);
}

// Helper to extract the text from an "other" answer
function getOtherText(val: string): string {
  return val.replace(OTHER_PREFIX, "");
}

export function QuestionRenderer({ question, value, onChange }: QuestionRendererProps) {
  const style: RatingStyle = question.ratingStyle || "stars";

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

              // Render based on style
              let content: React.ReactNode;
              let selectedBg: string;
              let selectedColor: string;
              let hoverColor: string;

              switch (style) {
                case "hearts":
                  selectedBg = "bg-error/20";
                  selectedColor = "fill-error text-error";
                  hoverColor = "text-error/50";
                  content = (
                    <Heart
                      size={32}
                      className={`transition-all duration-200 ${
                        isSelected ? selectedColor : `text-gray-300 group-hover:${hoverColor}`
                      }`}
                    />
                  );
                  break;

                case "emojis":
                  selectedBg = "bg-accent/20";
                  content = (
                    <span
                      className={`text-3xl transition-all duration-200 ${
                        isExact ? "scale-110" : isSelected ? "" : "grayscale opacity-50 group-hover:opacity-75"
                      }`}
                    >
                      {ratingEmojis[n - 1]}
                    </span>
                  );
                  break;

                case "thumbs": {
                  // Gradient from red (thumbs down) to green (thumbs up)
                  const thumbColors = [
                    "text-error", // 1 - red
                    "text-orange-500", // 2 - orange
                    "text-yellow-500", // 3 - yellow
                    "text-lime-500", // 4 - lime
                    "text-success", // 5 - green
                  ];
                  const bgColors = [
                    "bg-error/20",
                    "bg-orange-500/20",
                    "bg-yellow-500/20",
                    "bg-lime-500/20",
                    "bg-success/20",
                  ];
                  selectedBg = bgColors[n - 1];
                  const ThumbIcon = n <= 2 ? ThumbsDown : ThumbsUp;
                  const thumbRotation = n === 3 ? "rotate-90" : "";
                  content = (
                    <ThumbIcon
                      size={32}
                      className={`transition-all duration-200 ${thumbRotation} ${
                        isSelected
                          ? `${thumbColors[n - 1]} fill-current`
                          : "text-gray-300 group-hover:text-gray-400"
                      }`}
                    />
                  );
                  break;
                }

                case "stars":
                default:
                  selectedBg = "bg-accent/20";
                  selectedColor = "fill-accent text-accent";
                  hoverColor = "text-accent/50";
                  content = (
                    <Star
                      size={32}
                      className={`transition-all duration-200 ${
                        isSelected ? selectedColor : `text-gray-300 group-hover:${hoverColor}`
                      }`}
                    />
                  );
                  break;
              }

              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(n)}
                  aria-label={`דירוג ${n} מתוך 5`}
                  aria-pressed={isExact}
                  className={`group relative p-2 md:p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isExact ? `${selectedBg} scale-110` : "hover:bg-surface-2"
                  }`}
                >
                  {content}
                  {style !== "emojis" && (
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-medium transition-opacity ${
                        isExact ? "opacity-100 text-foreground" : "opacity-0"
                      }`}
                    >
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 px-2">
            <span>{ratingLabels[style].low}</span>
            <span>{ratingLabels[style].high}</span>
          </div>
        </div>
      );

    case "single":
      return (
        <SingleChoiceRenderer
          question={question}
          value={value as string}
          onChange={onChange}
        />
      );

    case "multiple":
      return (
        <MultipleChoiceRenderer
          question={question}
          value={(value as string[]) || []}
          onChange={onChange}
        />
      );

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
            aria-label={question.text}
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

// Single choice with "other" option support
function SingleChoiceRenderer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}) {
  const isOtherSelected = value ? isOtherValue(value) : false;
  const [otherText, setOtherText] = useState(() =>
    isOtherSelected ? getOtherText(value) : ""
  );

  // Sync otherText when value changes externally
  useEffect(() => {
    if (value && isOtherValue(value)) {
      setOtherText(getOtherText(value));
    }
  }, [value]);

  function handleOptionClick(option: string) {
    onChange(option);
  }

  function handleOtherClick() {
    onChange(OTHER_PREFIX + otherText);
  }

  function handleOtherTextChange(text: string) {
    setOtherText(text);
    if (isOtherSelected || text.length > 0) {
      onChange(OTHER_PREFIX + text);
    }
  }

  return (
    <div className="space-y-4" role="radiogroup" aria-label={question.text}>
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
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleOptionClick(option)}
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

        {/* "Other" option */}
        {question.hasOtherOption && (
          <div
            className={`rounded-xl border-2 transition-all duration-200 ${
              isOtherSelected
                ? "border-primary bg-primary/5"
                : "border-surface-3 hover:border-primary/50"
            }`}
          >
            <button
              type="button"
              role="radio"
              aria-checked={isOtherSelected}
              onClick={handleOtherClick}
              className="w-full flex items-center gap-3 p-4 text-right cursor-pointer"
            >
              <div
                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  isOtherSelected
                    ? "border-primary bg-primary"
                    : "border-gray-300"
                }`}
              >
                {isOtherSelected && <Check size={14} className="text-white" />}
              </div>
              <span
                className={`${
                  isOtherSelected ? "text-primary font-medium" : "text-foreground"
                }`}
              >
                אחר:
              </span>
            </button>
            {isOtherSelected && (
              <div className="px-4 pb-4">
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => handleOtherTextChange(e.target.value)}
                  placeholder="הקלד את תשובתך..."
                  className="w-full p-3 border-2 border-surface-3 rounded-lg bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Multiple choice with "other" option support
function MultipleChoiceRenderer({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const selectedValues = value || [];
  const otherValue = selectedValues.find(isOtherValue);
  const isOtherSelected = !!otherValue;
  const [otherText, setOtherText] = useState(() =>
    otherValue ? getOtherText(otherValue) : ""
  );

  // Sync otherText when value changes externally
  useEffect(() => {
    const other = selectedValues.find(isOtherValue);
    if (other) {
      setOtherText(getOtherText(other));
    }
  }, [selectedValues]);

  function handleOptionClick(option: string) {
    const isSelected = selectedValues.includes(option);
    if (isSelected) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  }

  function handleOtherClick() {
    if (isOtherSelected) {
      // Remove "other" from selection
      onChange(selectedValues.filter((v) => !isOtherValue(v)));
      setOtherText("");
    } else {
      // Add "other" to selection
      onChange([...selectedValues, OTHER_PREFIX + otherText]);
    }
  }

  function handleOtherTextChange(text: string) {
    setOtherText(text);
    // Update the "other" value in the array
    const withoutOther = selectedValues.filter((v) => !isOtherValue(v));
    onChange([...withoutOther, OTHER_PREFIX + text]);
  }

  // Count only non-"other" selections for display, or include other if it has text
  const displayCount = selectedValues.filter(
    (v) => !isOtherValue(v) || getOtherText(v).trim().length > 0
  ).length;

  return (
    <div className="space-y-4" role="group" aria-label={question.text}>
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
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => handleOptionClick(option)}
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

        {/* "Other" option */}
        {question.hasOtherOption && (
          <div
            className={`rounded-xl border-2 transition-all duration-200 ${
              isOtherSelected
                ? "border-secondary bg-secondary/5"
                : "border-surface-3 hover:border-secondary/50"
            }`}
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={isOtherSelected}
              onClick={handleOtherClick}
              className="w-full flex items-center gap-3 p-4 text-right cursor-pointer"
            >
              <div
                className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  isOtherSelected
                    ? "border-secondary bg-secondary"
                    : "border-gray-300"
                }`}
              >
                {isOtherSelected && <Check size={14} className="text-white" />}
              </div>
              <span
                className={`${
                  isOtherSelected ? "text-secondary font-medium" : "text-foreground"
                }`}
              >
                אחר:
              </span>
            </button>
            {isOtherSelected && (
              <div className="px-4 pb-4">
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => handleOtherTextChange(e.target.value)}
                  placeholder="הקלד את תשובתך..."
                  className="w-full p-3 border-2 border-surface-3 rounded-lg bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
                  autoFocus
                />
              </div>
            )}
          </div>
        )}
      </div>
      {displayCount > 0 && (
        <p className="text-sm text-secondary">
          נבחרו {displayCount} תשובות
        </p>
      )}
    </div>
  );
}
