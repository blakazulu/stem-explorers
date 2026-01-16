"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useToastActions } from "@/components/ui/Toast";
import { X, ClipboardList, Send, Loader2, Leaf } from "lucide-react";

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName?: string;
}

const AGE_GROUPS = [
  { id: "a-b", label: "א–ב" },
  { id: "c-d", label: "ג–ד" },
  { id: "e-f", label: "ה–ו" },
];

const RESOURCES = [
  { id: "planters", label: "אדניות שתילה" },
  { id: "soil", label: "אדמה / מצע שתילה" },
  { id: "seeds", label: "זרעים" },
  { id: "seedlings", label: "שתילים" },
  { id: "compost", label: "קומפוסט / דשן" },
  { id: "tools", label: "כלי גינון קטנים (כף שתילה / מגרפה)" },
  { id: "gloves", label: "כפפות עבודה" },
  { id: "watering", label: "משפך / בקבוק השקיה" },
];

export function EquipmentFormModal({
  isOpen,
  onClose,
  teacherName: initialTeacherName = "",
}: EquipmentFormModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toast = useToastActions();

  const [teacherName, setTeacherName] = useState(initialTeacherName);
  const [program, setProgram] = useState("");
  const [classes, setClasses] = useState("");
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function toggleAgeGroup(id: string) {
    setSelectedAgeGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function toggleResource(id: string) {
    setSelectedResources((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (!teacherName.trim()) {
      toast.error("שגיאה", "יש למלא את שם המורה");
      return;
    }
    if (!program.trim()) {
      toast.error("שגיאה", "יש למלא את שם התוכנית / יחידה");
      return;
    }
    if (!classes.trim()) {
      toast.error("שגיאה", "יש למלא את הכיתה/ות");
      return;
    }
    if (selectedAgeGroups.length === 0) {
      toast.error("שגיאה", "יש לבחור לפחות שכבת גיל אחת");
      return;
    }
    if (selectedResources.length === 0) {
      toast.error("שגיאה", "יש לבחור לפחות משאב אחד");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/send-equipment-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherName: teacherName.trim(),
          program: program.trim(),
          classes: classes.trim(),
          ageGroups: selectedAgeGroups.map(
            (id) => AGE_GROUPS.find((g) => g.id === id)?.label || id
          ),
          resources: selectedResources.map(
            (id) => RESOURCES.find((r) => r.id === id)?.label || id
          ),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send request");
      }

      toast.success("נשלח בהצלחה", "הבקשה נשלחה למנהלים");

      // Reset form
      setTeacherName(initialTeacherName);
      setProgram("");
      setClasses("");
      setSelectedAgeGroups([]);
      setSelectedResources([]);
      onClose();
    } catch {
      toast.error("שגיאה", "שגיאה בשליחת הבקשה. נסה שוב מאוחר יותר.");
    }
    setSending(false);
  }

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto h-fit z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-lg w-full shadow-2xl animate-scale-in border-0 max-h-[90vh] overflow-hidden"
      onClose={onClose}
    >
      <div className="flex flex-col max-h-[90vh]" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-surface-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <ClipboardList size={24} className="text-amber-700" />
            </div>
            <div>
              <h2 className="text-xl font-rubik font-bold text-foreground">
                טופס בקשה למשאבי למידה
              </h2>
              <p className="text-sm text-gray-500">למורה</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Text Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                שם המורה
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="הזן את שמך"
                className="w-full px-3 py-2 border border-surface-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                תוכנית / יחידה
              </label>
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="שם התוכנית או היחידה"
                className="w-full px-3 py-2 border border-surface-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                כיתה/ות
              </label>
              <input
                type="text"
                value={classes}
                onChange={(e) => setClasses(e.target.value)}
                placeholder="לדוגמה: ג'1, ג'2"
                className="w-full px-3 py-2 border border-surface-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Age Groups */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              שכבת גיל (סמן/י)
            </label>
            <div className="flex flex-wrap gap-3">
              {AGE_GROUPS.map((group) => (
                <label
                  key={group.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAgeGroups.includes(group.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-surface-2 hover:border-primary/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAgeGroups.includes(group.id)}
                    onChange={() => toggleAgeGroup(group.id)}
                    className="sr-only"
                  />
                  <span className="font-medium">{group.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Leaf size={18} className="text-green-600" />
              <label className="text-sm font-medium text-foreground">
                משאבים דרושים - חומרים לגידול / חקלאות
              </label>
            </div>
            <div className="space-y-2">
              {RESOURCES.map((resource) => (
                <label
                  key={resource.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedResources.includes(resource.id)
                      ? "border-green-500 bg-green-50"
                      : "border-surface-2 hover:border-green-300 hover:bg-green-50/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedResources.includes(resource.id)}
                    onChange={() => toggleResource(resource.id)}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                  <span className="text-foreground">{resource.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button - Fixed at bottom */}
        <div className="p-6 pt-4 border-t border-surface-2 bg-surface-0">
          <Button
            onClick={handleSubmit}
            disabled={sending}
            rightIcon={sending ? Loader2 : Send}
            className="w-full"
          >
            {sending ? "שולח..." : "שלח בקשה"}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
