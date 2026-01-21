"use client";

import { useState, useEffect, useRef } from "react";
import { Icon, IconName } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { GAME_INFO, DIFFICULTY_LABELS } from "@/lib/constants/games";
import type { GameContent, GameType, Difficulty, HangmanContent, QuizContent } from "@/types/games";
import type { Grade } from "@/types";
import { X, ChevronDown, Loader2 } from "lucide-react";

// Grade labels for display
const GRADE_LABELS: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

interface GameContentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<GameContent, "id" | "createdAt" | "updatedAt">) => void;
  editItem: GameContent | null;
  isLoading: boolean;
}

export function GameContentForm({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  isLoading,
}: GameContentFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Base form state
  const [gameType, setGameType] = useState<GameType>("quiz");
  const [grade, setGrade] = useState<Grade>("א");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  // Hangman-specific state
  const [word, setWord] = useState("");
  const [hint, setHint] = useState("");
  const [category, setCategory] = useState("");

  // Quiz-specific state
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState("");

  // Handle dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Handle escape key
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

  // Reset form when opening or when editItem changes
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        // Editing existing item
        setGameType(editItem.gameType);
        setGrade(editItem.grade);
        setDifficulty(editItem.difficulty);

        // Set game-specific fields
        if (editItem.gameType === "hangman") {
          setWord(editItem.word);
          setHint(editItem.hint);
          setCategory(editItem.category);
        } else if (editItem.gameType === "quiz") {
          setQuestion(editItem.question);
          setOptions([...editItem.options]);
          setCorrectIndex(editItem.correctIndex);
          setExplanation(editItem.explanation);
        }
      } else {
        // Creating new item - reset to defaults
        setGameType("quiz");
        setGrade("א");
        setDifficulty("easy");
        setWord("");
        setHint("");
        setCategory("");
        setQuestion("");
        setOptions(["", "", "", ""]);
        setCorrectIndex(0);
        setExplanation("");
      }
    }
  }, [isOpen, editItem]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build the content object based on game type
    if (gameType === "hangman") {
      const data: Omit<HangmanContent, "id" | "createdAt" | "updatedAt"> = {
        gameType: "hangman",
        grade,
        difficulty,
        word,
        hint,
        category,
      };
      onSubmit(data);
    } else if (gameType === "quiz") {
      const data: Omit<QuizContent, "id" | "createdAt" | "updatedAt"> = {
        gameType: "quiz",
        grade,
        difficulty,
        question,
        options,
        correctIndex,
        explanation,
      };
      onSubmit(data);
    }
  };

  // Check if the form supports editing for this game type
  const isSupported = gameType === "hangman" || gameType === "quiz";

  // Check if form is valid
  const isValid = (() => {
    if (gameType === "hangman") {
      return word.trim() && hint.trim() && category.trim();
    }
    if (gameType === "quiz") {
      return (
        question.trim() &&
        options.every((opt) => opt.trim()) &&
        explanation.trim()
      );
    }
    return false;
  })();

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto h-fit z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-2xl w-full shadow-2xl animate-scale-in border-0 bg-transparent"
      onClose={onClose}
    >
      <div className="bg-white rounded-2xl" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Icon name="gamepad-2" size="md" className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-rubik font-bold text-foreground">
              {editItem ? "עריכת תוכן" : "הוספת תוכן חדש"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-surface-2 rounded-lg transition-all duration-200 cursor-pointer"
            aria-label="סגור"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Base Fields */}
          <div className="grid grid-cols-3 gap-4">
            {/* Game Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סוג משחק
              </label>
              <div className="relative">
                <select
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value as GameType)}
                  disabled={!!editItem}
                  className="appearance-none w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(Object.keys(GAME_INFO) as GameType[]).map((type) => (
                    <option key={type} value={type}>
                      {GAME_INFO[type].nameHe}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                כיתה
              </label>
              <div className="relative">
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as Grade)}
                  className="appearance-none w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                >
                  {GRADE_LABELS.map((g) => (
                    <option key={g} value={g}>
                      כיתה {g}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                רמת קושי
              </label>
              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="appearance-none w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                >
                  {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(
                    (diff) => (
                      <option key={diff} value={diff}>
                        {DIFFICULTY_LABELS[diff]}
                      </option>
                    )
                  )}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Game-Specific Fields */}
          {!isSupported ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <Icon
                name="construction"
                size="lg"
                className="text-amber-500 mx-auto mb-3"
              />
              <p className="text-amber-700 font-medium">
                טופס עריכה למשחק זה עדיין בפיתוח
              </p>
              <p className="text-amber-600 text-sm mt-1">
                בחר משחק אחר או המתן לעדכון הבא
              </p>
            </div>
          ) : gameType === "hangman" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מילה
                </label>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="הזן את המילה לניחוש"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  רמז
                </label>
                <input
                  type="text"
                  value={hint}
                  onChange={(e) => setHint(e.target.value)}
                  placeholder="הזן רמז למילה"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  קטגוריה
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="לדוגמה: חיות, צמחים, מדע"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          ) : gameType === "quiz" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שאלה
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="הזן את השאלה"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  תשובות אפשריות
                </label>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={correctIndex === index}
                        onChange={() => setCorrectIndex(index)}
                        className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        placeholder={`תשובה ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      {correctIndex === index && (
                        <span className="text-xs text-emerald-600 font-medium">
                          נכונה
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  בחר את התשובה הנכונה באמצעות לחיצה על העיגול שלצידה
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  הסבר
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="הסבר שיוצג לאחר התשובה"
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-2">
            <Button type="button" variant="outline" onClick={onClose}>
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading || !isSupported}
              loading={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {editItem ? "שמור שינויים" : "הוסף תוכן"}
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
