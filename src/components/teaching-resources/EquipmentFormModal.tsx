"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { useToastActions } from "@/components/ui/Toast";
import { X, ClipboardList, Send, Loader2, Leaf } from "lucide-react";
import { useUnitsByGrade } from "@/lib/queries/units";
import type { Grade, Unit } from "@/types";

interface EquipmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherName?: string;
}

const AGE_GROUPS = [
  { id: "a-b", label: "א–ב", grades: ["א", "ב"] as Grade[] },
  { id: "c-d", label: "ג–ד", grades: ["ג", "ד"] as Grade[] },
  { id: "e-f", label: "ה–ו", grades: ["ה", "ו"] as Grade[] },
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
  const [classes, setClasses] = useState("");
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const [sending, setSending] = useState(false);

  // Get all grades from selected age groups
  const selectedGrades = useMemo(() => {
    const grades: Grade[] = [];
    for (const ageGroupId of selectedAgeGroups) {
      const ageGroup = AGE_GROUPS.find((g) => g.id === ageGroupId);
      if (ageGroup) {
        grades.push(...ageGroup.grades);
      }
    }
    return grades;
  }, [selectedAgeGroups]);

  // Fetch units for each selected grade
  const unitsGradeA = useUnitsByGrade(selectedGrades.includes("א") ? "א" : null);
  const unitsGradeB = useUnitsByGrade(selectedGrades.includes("ב") ? "ב" : null);
  const unitsGradeC = useUnitsByGrade(selectedGrades.includes("ג") ? "ג" : null);
  const unitsGradeD = useUnitsByGrade(selectedGrades.includes("ד") ? "ד" : null);
  const unitsGradeE = useUnitsByGrade(selectedGrades.includes("ה") ? "ה" : null);
  const unitsGradeF = useUnitsByGrade(selectedGrades.includes("ו") ? "ו" : null);

  // Combine units by grade
  const unitsByGrade = useMemo(() => {
    const result: { grade: Grade; units: Unit[]; isLoading: boolean }[] = [];
    const gradeQueries = [
      { grade: "א" as Grade, query: unitsGradeA },
      { grade: "ב" as Grade, query: unitsGradeB },
      { grade: "ג" as Grade, query: unitsGradeC },
      { grade: "ד" as Grade, query: unitsGradeD },
      { grade: "ה" as Grade, query: unitsGradeE },
      { grade: "ו" as Grade, query: unitsGradeF },
    ];
    for (const { grade, query } of gradeQueries) {
      if (selectedGrades.includes(grade)) {
        result.push({
          grade,
          units: query.data || [],
          isLoading: query.isLoading,
        });
      }
    }
    return result;
  }, [selectedGrades, unitsGradeA, unitsGradeB, unitsGradeC, unitsGradeD, unitsGradeE, unitsGradeF]);

  const isLoadingUnits = unitsByGrade.some((g) => g.isLoading);
  const hasAnyUnits = unitsByGrade.some((g) => g.units.length > 0);

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
    const isDeselecting = selectedAgeGroups.includes(id);

    // When deselecting, remove units that belong to deselected grades
    if (isDeselecting) {
      const removedAgeGroup = AGE_GROUPS.find((g) => g.id === id);
      if (removedAgeGroup) {
        const removedGrades = removedAgeGroup.grades;
        // Get all units for the grades being removed and filter them out
        const allUnitsData = [
          unitsGradeA.data,
          unitsGradeB.data,
          unitsGradeC.data,
          unitsGradeD.data,
          unitsGradeE.data,
          unitsGradeF.data,
        ].flat().filter(Boolean) as Unit[];

        const unitIdsToRemove = allUnitsData
          .filter((u) => removedGrades.includes(u.gradeId))
          .map((u) => u.id);

        setSelectedUnits((prevUnits) =>
          prevUnits.filter((unitId) => !unitIdsToRemove.includes(unitId))
        );
      }
    }

    setSelectedAgeGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function toggleUnit(unitId: string) {
    setSelectedUnits((prev) =>
      prev.includes(unitId) ? prev.filter((u) => u !== unitId) : [...prev, unitId]
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
    if (selectedAgeGroups.length === 0) {
      toast.error("שגיאה", "יש לבחור לפחות שכבת גיל אחת");
      return;
    }
    // Only require unit selection if units exist for selected grades
    if (hasAnyUnits && selectedUnits.length === 0) {
      toast.error("שגיאה", "יש לבחור לפחות יחידה אחת");
      return;
    }
    if (!classes.trim()) {
      toast.error("שגיאה", "יש למלא את הכיתה/ות");
      return;
    }
    if (selectedResources.length === 0) {
      toast.error("שגיאה", "יש לבחור לפחות משאב אחד");
      return;
    }

    // Build unit names with grades for the email
    const allUnits = unitsByGrade.flatMap((g) => g.units);
    const unitNames = selectedUnits.map((unitId) => {
      const unit = allUnits.find((u) => u.id === unitId);
      return unit ? `${unit.name} (${unit.gradeId})` : unitId;
    });

    setSending(true);
    try {
      const response = await fetch("/api/send-equipment-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherName: teacherName.trim(),
          units: unitNames,
          classes: classes.trim(),
          ageGroups: selectedAgeGroups.map(
            (id) => AGE_GROUPS.find((g) => g.id === id)?.label || id
          ),
          resources: selectedResources.map(
            (id) => RESOURCES.find((r) => r.id === id)?.label || id
          ),
          other: other.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send request");
      }

      toast.success("נשלח בהצלחה", "הבקשה נשלחה למנהלים");

      // Reset form
      setTeacherName(initialTeacherName);
      setClasses("");
      setSelectedAgeGroups([]);
      setSelectedUnits([]);
      setSelectedResources([]);
      setOther("");
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
          {/* Teacher Name */}
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

          {/* Units - depends on age group selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              תוכנית / יחידה
            </label>
            {selectedAgeGroups.length === 0 ? (
              <div className="px-4 py-3 bg-surface-1 rounded-lg text-gray-500 text-sm">
                בחרו שכבת גיל קודם
              </div>
            ) : isLoadingUnits ? (
              <div className="px-4 py-3 bg-surface-1 rounded-lg text-gray-500 text-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                טוען יחידות...
              </div>
            ) : (
              <div className="space-y-4">
                {unitsByGrade.map(({ grade, units }) => (
                  <div key={grade}>
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      כיתה {grade}
                    </div>
                    {units.length === 0 ? (
                      <div className="text-sm text-gray-400 mr-2">
                        אין יחידות
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {units.map((unit) => (
                          <label
                            key={unit.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedUnits.includes(unit.id)
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-surface-2 hover:border-primary/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedUnits.includes(unit.id)}
                              onChange={() => toggleUnit(unit.id)}
                              className="sr-only"
                            />
                            <span className="font-medium">{unit.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Classes */}
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

          {/* Other */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              אחר
            </label>
            <textarea
              value={other}
              onChange={(e) => setOther(e.target.value.slice(0, 500))}
              placeholder="משאבים נוספים או הערות..."
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-surface-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${other.length >= 480 ? 'text-amber-500' : 'text-gray-400'}`}>
                {other.length}/500
              </span>
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
