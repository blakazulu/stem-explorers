"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { Grade } from "@/types";

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

interface HeaderGradeSelectorProps {
  selectedGrade: Grade | null;
  onSelect: (grade: Grade) => void;
  canSelect: boolean;
  isAdminTheme?: boolean;
}

export function HeaderGradeSelector({
  selectedGrade,
  onSelect,
  canSelect,
  isAdminTheme = false,
}: HeaderGradeSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = (grade: Grade) => {
    if (canSelect) {
      onSelect(grade);
      setIsDropdownOpen(false);
    }
  };

  // Desktop: Compact button row
  const DesktopSelector = () => (
    <div className="hidden md:flex items-center gap-1">
      <span className={`text-sm ml-2 ${isAdminTheme ? "text-slate-400" : "text-gray-500"}`}>
        כיתה:
      </span>
      <div className="flex gap-1">
        {grades.map((grade) => {
          const isSelected = selectedGrade === grade;
          return (
            <button
              key={grade}
              onClick={() => handleSelect(grade)}
              disabled={!canSelect}
              className={`
                w-9 h-9 rounded-lg font-rubik font-bold text-base transition-all duration-150
                ${isAdminTheme
                  ? isSelected
                    ? "bg-indigo-500 text-white shadow-md"
                    : canSelect
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                      : "bg-slate-700/50 text-slate-500"
                  : isSelected
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : canSelect
                      ? "bg-white/80 border border-surface-3 text-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
                      : "bg-surface-1 text-gray-400 border border-surface-2"
                }
                ${canSelect ? "cursor-pointer" : "cursor-default"}
              `}
              title={canSelect ? `עבור לכיתה ${grade}` : `כיתה ${grade}`}
            >
              {grade}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Mobile: Dropdown
  const MobileSelector = () => (
    <div className="md:hidden relative" ref={dropdownRef}>
      <button
        onClick={() => canSelect && setIsDropdownOpen(!isDropdownOpen)}
        disabled={!canSelect}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all duration-150
          ${isAdminTheme
            ? "bg-slate-700 text-slate-200"
            : "bg-white/80 border border-surface-3 text-foreground"
          }
          ${canSelect ? "cursor-pointer hover:bg-opacity-90" : "cursor-default"}
        `}
      >
        <span>כיתה {selectedGrade || "—"}</span>
        {canSelect && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && canSelect && (
        <div
          className={`
            absolute top-full mt-1 right-0 z-50 p-2 rounded-xl shadow-xl
            ${isAdminTheme ? "bg-slate-800 border border-slate-700" : "bg-white border border-surface-2"}
            animate-scale-in origin-top-right
          `}
        >
          <div className="grid grid-cols-3 gap-1">
            {grades.map((grade) => {
              const isSelected = selectedGrade === grade;
              return (
                <button
                  key={grade}
                  onClick={() => handleSelect(grade)}
                  className={`
                    w-10 h-10 rounded-lg font-rubik font-bold text-lg transition-all duration-150
                    ${isAdminTheme
                      ? isSelected
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : isSelected
                        ? "bg-primary text-white"
                        : "bg-surface-1 text-foreground hover:bg-primary/10 hover:text-primary"
                    }
                  `}
                >
                  {grade}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <DesktopSelector />
      <MobileSelector />
    </>
  );
}
