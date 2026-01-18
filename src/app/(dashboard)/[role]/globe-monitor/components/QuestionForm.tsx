"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  Save,
  X,
  Plus,
  Hash,
  Type,
  Calendar,
  Clock,
  List,
  CheckSquare,
} from "lucide-react";
import type { GlobeMonitorQuestion, GlobeMonitorQuestionType } from "@/types";

const questionTypes: {
  value: GlobeMonitorQuestionType;
  label: string;
  icon: typeof Type;
  color: string;
}[] = [
  { value: "text", label: "טקסט חופשי", icon: Type, color: "text-role-student" },
  { value: "number", label: "מספר", icon: Hash, color: "text-primary" },
  { value: "date", label: "תאריך", icon: Calendar, color: "text-accent" },
  { value: "time", label: "שעה", icon: Clock, color: "text-secondary" },
  { value: "single", label: "בחירה בודדת", icon: List, color: "text-role-teacher" },
  { value: "multi", label: "בחירה מרובה", icon: CheckSquare, color: "text-role-parent" },
];

interface QuestionFormProps {
  initialData?: GlobeMonitorQuestion;
  onSubmit: (data: Omit<GlobeMonitorQuestion, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  nextOrder: number;
}

export default function QuestionForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  nextOrder,
}: QuestionFormProps) {
  const [label, setLabel] = useState(initialData?.label || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState<GlobeMonitorQuestionType>(initialData?.type || "text");
  const [options, setOptions] = useState<string[]>(initialData?.options || []);
  const [unit, setUnit] = useState(initialData?.unit || "");
  const [min, setMin] = useState<number | "">(initialData?.min ?? "");
  const [max, setMax] = useState<number | "">(initialData?.max ?? "");
  const [required, setRequired] = useState(initialData?.required || false);
  const [newOption, setNewOption] = useState("");

  const isChoiceType = type === "single" || type === "multi";
  const isNumberType = type === "number";
  const hasEnoughOptions = !isChoiceType || options.length >= 2;
  const isValid = label.trim().length > 0 && hasEnoughOptions;

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const removeOption = (opt: string) => {
    setOptions(options.filter((o) => o !== opt));
  };

  const handleSubmit = () => {
    if (!isValid) return;

    const data: Omit<GlobeMonitorQuestion, "id" | "createdAt" | "updatedAt"> = {
      label: label.trim(),
      type,
      required,
      order: initialData?.order ?? nextOrder,
    };

    if (description.trim()) {
      data.description = description.trim();
    }

    if (isChoiceType && options.length > 0) {
      data.options = options;
    }

    if (isNumberType) {
      if (unit.trim()) data.unit = unit.trim();
      if (min !== "") data.min = Number(min);
      if (max !== "") data.max = Number(max);
    }

    onSubmit(data);
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Question Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          סוג השאלה
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {questionTypes.map((t) => {
            const IconComponent = t.icon;
            const isSelected = type === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                disabled={isSubmitting}
                className={`p-3 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-surface-3 hover:border-primary/50"
                }`}
              >
                <IconComponent
                  size={20}
                  className={`mx-auto mb-1 ${isSelected ? t.color : "text-gray-400"}`}
                />
                <span
                  className={`text-xs ${isSelected ? "text-foreground" : "text-gray-500"}`}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          שם השאלה *
        </label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="לדוגמה: טמפרטורה"
          disabled={isSubmitting}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          תיאור/הנחיה (אופציונלי)
        </label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="הסבר קצר למילוי השדה"
          disabled={isSubmitting}
        />
      </div>

      {/* Number type fields */}
      {isNumberType && (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              יחידה
            </label>
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="°C, %, מ'"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              מינימום
            </label>
            <Input
              type="number"
              value={min}
              onChange={(e) => setMin(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              מקסימום
            </label>
            <Input
              type="number"
              value={max}
              onChange={(e) => setMax(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="100"
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Choice options */}
      {isChoiceType && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            אפשרויות בחירה (לפחות 2) *
          </label>
          <div className="flex gap-2">
            <Input
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder="הוסף אפשרות"
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption();
                }
              }}
            />
            <Button onClick={addOption} disabled={isSubmitting || !newOption.trim()}>
              <Plus size={18} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <span
                key={opt}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-1 border border-surface-3 rounded-lg text-sm"
              >
                {opt}
                <button
                  onClick={() => removeOption(opt)}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-error cursor-pointer"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            {options.length === 0 && (
              <span className="text-sm text-gray-400">לא נוספו אפשרויות</span>
            )}
          </div>
        </div>
      )}

      {/* Required checkbox */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="required"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
          disabled={isSubmitting}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
        <label htmlFor="required" className="text-sm text-foreground cursor-pointer">
          שדה חובה
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-surface-2">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          ביטול
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
          rightIcon={Save}
        >
          {initialData ? "עדכן" : "צור שאלה"}
        </Button>
      </div>
    </Card>
  );
}
