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
        <div className="space-y-2">
          <p className="font-medium">{question.text}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={`w-10 h-10 rounded-full border-2 font-medium transition-colors ${
                  value === n
                    ? "bg-primary text-white border-primary"
                    : "border-gray-300 hover:border-primary"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );

    case "single":
      return (
        <div className="space-y-2">
          <p className="font-medium">{question.text}</p>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={value === option}
                  onChange={() => onChange(option)}
                  className="w-4 h-4 text-primary"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "multiple":
      const selectedValues = (value as string[]) || [];
      return (
        <div className="space-y-2">
          <p className="font-medium">{question.text}</p>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option]);
                    } else {
                      onChange(selectedValues.filter((v) => v !== option));
                    }
                  }}
                  className="w-4 h-4 text-primary rounded"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case "open":
      return (
        <div className="space-y-2">
          <p className="font-medium">{question.text}</p>
          <textarea
            value={value as string || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={4}
          />
        </div>
      );

    default:
      return null;
  }
}
