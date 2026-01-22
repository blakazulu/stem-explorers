"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToastActions } from "@/components/ui/Toast";
import { useUpdateAnnouncement } from "@/lib/queries";
import { X, MessageCircle, Check } from "lucide-react";
import type { Grade } from "@/types";

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

interface AllowCommentsModalProps {
  announcementId: string;
  currentAllowedGrades: Grade[];
  isOpen: boolean;
  onClose: () => void;
}

export function AllowCommentsModal({
  announcementId,
  currentAllowedGrades,
  isOpen,
  onClose,
}: AllowCommentsModalProps) {
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>(currentAllowedGrades);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toast = useToastActions();
  const updateAnnouncement = useUpdateAnnouncement();

  useEffect(() => {
    setSelectedGrades(currentAllowedGrades);
  }, [currentAllowedGrades, isOpen]);

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

  const toggleGrade = (grade: Grade) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const selectAll = () => {
    setSelectedGrades([...grades]);
  };

  const clearAll = () => {
    setSelectedGrades([]);
  };

  const handleSave = async () => {
    try {
      await updateAnnouncement.mutateAsync({
        id: announcementId,
        data: { allowedCommentGrades: selectedGrades },
      });
      toast.success("הגדרות התגובות עודכנו");
      onClose();
    } catch {
      toast.error("שגיאה", "שגיאה בעדכון ההגדרות");
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto h-fit z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-md w-full shadow-2xl animate-scale-in border-0 bg-transparent"
      onClose={onClose}
    >
      <Card padding="none" className="overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-l from-emerald-500/10 to-teal-500/10 px-4 md:px-6 py-4 border-b border-surface-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <MessageCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-rubik font-semibold text-lg text-foreground">
                  הרשאות תגובות
                </h3>
                <p className="text-sm text-gray-500">בחר אילו כיתות יכולות להגיב</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer"
              aria-label="סגור"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4" dir="rtl">
          {/* Quick actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            >
              בחר הכל
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              נקה הכל
            </button>
          </div>

          {/* Grade checkboxes */}
          <div className="grid grid-cols-2 gap-2">
            {grades.map((grade) => (
              <button
                key={grade}
                type="button"
                onClick={() => toggleGrade(grade)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedGrades.includes(grade)
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-surface-3 bg-surface-0 hover:border-surface-3 hover:bg-surface-1"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center ${
                    selectedGrades.includes(grade)
                      ? "bg-emerald-500 text-white"
                      : "border-2 border-gray-300"
                  }`}
                >
                  {selectedGrades.includes(grade) && <Check size={14} />}
                </div>
                <span className="font-rubik font-medium">כיתה {grade}׳</span>
              </button>
            ))}
          </div>

          {/* Info text */}
          <p className="text-sm text-gray-500 bg-surface-1 rounded-lg p-3">
            {selectedGrades.length === 0
              ? "אף אחד לא יוכל להגיב על הפרסום"
              : selectedGrades.length === grades.length
              ? "כל התלמידים יוכלו להגיב"
              : `רק תלמידי כיתות ${selectedGrades.map((g) => `${g}׳`).join(", ")} יוכלו להגיב`}
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              ביטול
            </Button>
            <Button
              onClick={handleSave}
              loading={updateAnnouncement.isPending}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              שמור
            </Button>
          </div>
        </div>
      </Card>
    </dialog>
  );
}
