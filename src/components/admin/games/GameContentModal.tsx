"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { HangmanContentEditor } from "./HangmanContentEditor";
import { WordSearchContentEditor } from "./WordSearchContentEditor";
import { MemoryContentEditor } from "./MemoryContentEditor";
import { QuizContentEditor } from "./QuizContentEditor";
import { SortContentEditor } from "./SortContentEditor";
import { NumberPatternContentEditor } from "./NumberPatternContentEditor";
import { useGameContent, useUpdateGameContent, useDeleteGameContent, useCreateGameContent } from "@/lib/queries/games";
import { useToastActions } from "@/components/ui/Toast";
import { GAME_INFO, DIFFICULTY_LABELS } from "@/lib/constants/games";
import type { Grade } from "@/types";
import type { GameType, Difficulty, GameContent, HangmanContent, WordSearchContent, MemoryContent, QuizContent, SortContent, NumberPatternContent } from "@/types/games";

const GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

interface GameContentModalProps {
  gameType: GameType | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GameContentModal({ gameType, isOpen, onClose }: GameContentModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toast = useToastActions();

  const [selectedGrade, setSelectedGrade] = useState<Grade>("א");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("easy");
  const [editedContent, setEditedContent] = useState<Map<string, GameContent>>(new Map());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [newContent, setNewContent] = useState<GameContent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; isNew: boolean } | null>(null);

  // Fetch content for selected game/grade/difficulty
  const { data: content = [], isLoading, refetch } = useGameContent(
    gameType,
    selectedGrade,
    selectedDifficulty
  );

  // Mutations
  const updateContent = useUpdateGameContent();
  const deleteContent = useDeleteGameContent();
  const createContent = useCreateGameContent();

  // Reset state when game or filters change
  useEffect(() => {
    setEditedContent(new Map());
    setDeletedIds(new Set());
    setNewContent([]);
  }, [gameType, selectedGrade, selectedDifficulty]);

  // Open/close dialog
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

  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    return editedContent.size > 0 || deletedIds.size > 0 || newContent.length > 0;
  }, [editedContent, deletedIds, newContent]);

  // Get visible content (original minus deleted, plus edited versions)
  const visibleContent = useMemo(() => {
    return content
      .filter((item) => !deletedIds.has(item.id))
      .map((item) => editedContent.get(item.id) || item);
  }, [content, deletedIds, editedContent]);

  // Handle content edit
  const handleContentEdit = (id: string, updates: Partial<GameContent>) => {
    const original = content.find((c) => c.id === id);
    if (!original) return;

    const updated = { ...original, ...updates } as GameContent;
    setEditedContent((prev) => new Map(prev).set(id, updated));
  };

  // Handle content delete request (shows confirmation)
  const handleContentDeleteRequest = (id: string, isNew: boolean) => {
    setDeleteConfirm({ id, isNew });
  };

  // Handle confirmed delete
  const handleConfirmedDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.isNew) {
      // Delete new (unsaved) content
      setNewContent((prev) => prev.filter((item) => item.id !== deleteConfirm.id));
    } else {
      // Mark existing content for deletion
      setDeletedIds((prev) => new Set(prev).add(deleteConfirm.id));
      // Remove from edited if it was there
      setEditedContent((prev) => {
        const next = new Map(prev);
        next.delete(deleteConfirm.id);
        return next;
      });
    }
    setDeleteConfirm(null);
  };

  // Handle add new content
  const handleAddNew = () => {
    if (!gameType) return;

    const tempId = `new-${Date.now()}`;
    let newItem: GameContent;

    switch (gameType) {
      case "hangman":
        newItem = {
          id: tempId,
          gameType: "hangman",
          grade: selectedGrade,
          difficulty: selectedDifficulty,
          word: "",
          hint: "",
          category: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as HangmanContent;
        break;
      case "wordSearch":
        newItem = {
          id: tempId,
          gameType: "wordSearch",
          grade: selectedGrade,
          difficulty: selectedDifficulty,
          words: [""],
          gridSize: selectedDifficulty === "easy" ? 8 : selectedDifficulty === "medium" ? 10 : 12,
          directions: selectedDifficulty === "easy" ? ["horizontal"] : selectedDifficulty === "medium" ? ["horizontal", "vertical"] : ["horizontal", "vertical", "diagonal"],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as WordSearchContent;
        break;
      case "memory":
        newItem = {
          id: tempId,
          gameType: "memory",
          grade: selectedGrade,
          difficulty: selectedDifficulty,
          pairs: [{ term: "", match: "" }],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as MemoryContent;
        break;
      case "quiz":
        newItem = {
          id: tempId,
          gameType: "quiz",
          grade: selectedGrade,
          difficulty: selectedDifficulty,
          question: "",
          options: ["", "", "", ""],
          correctIndex: 0,
          explanation: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as QuizContent;
        break;
      case "sort":
        newItem = {
          id: tempId,
          gameType: "sort",
          grade: selectedGrade,
          difficulty: selectedDifficulty,
          buckets: ["קטגוריה 1", "קטגוריה 2"],
          items: [{ text: "", correctBucket: "קטגוריה 1" }],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as SortContent;
        break;
      case "numberPattern":
        newItem = {
          id: tempId,
          gameType: "numberPattern",
          grade: selectedGrade,
          difficulty: selectedDifficulty,
          sequence: [1, 2, 3, null, 5],
          answer: 4,
          rule: "",
          createdAt: new Date(),
          updatedAt: new Date(),
        } as NumberPatternContent;
        break;
      default:
        return;
    }

    setNewContent((prev) => [...prev, newItem]);
  };

  // Handle new content edit
  const handleNewContentEdit = (tempId: string, updates: Partial<GameContent>) => {
    setNewContent((prev) =>
      prev.map((item) =>
        item.id === tempId ? ({ ...item, ...updates } as GameContent) : item
      )
    );
  };


  // Validate content before save
  const validateContent = (item: GameContent): string | null => {
    if (item.gameType === "hangman") {
      const h = item as HangmanContent;
      if (!h.word.trim()) return "חסרה מילה";
      if (!h.hint.trim()) return "חסר רמז";
      if (!h.category.trim()) return "חסרה קטגוריה";
    } else if (item.gameType === "wordSearch") {
      const w = item as WordSearchContent;
      const validWords = w.words.filter((word) => word.trim());
      if (validWords.length === 0) return "יש להוסיף לפחות מילה אחת";
    } else if (item.gameType === "memory") {
      const m = item as MemoryContent;
      const validPairs = m.pairs.filter((p) => p.term.trim() && p.match.trim());
      if (validPairs.length === 0) return "יש להוסיף לפחות זוג אחד תקין";
    } else if (item.gameType === "quiz") {
      const q = item as QuizContent;
      if (!q.question.trim()) return "חסרה שאלה";
      const validOptions = q.options.filter((o) => o.trim());
      if (validOptions.length < 2) return "יש להוסיף לפחות 2 אפשרויות תשובה";
      if (!q.options[q.correctIndex]?.trim()) return "התשובה הנכונה חייבת להיות מלאה";
      if (!q.explanation.trim()) return "חסר הסבר";
    } else if (item.gameType === "sort") {
      const s = item as SortContent;
      const validBuckets = s.buckets.filter((b) => b.trim());
      if (validBuckets.length < 2) return "יש להוסיף לפחות 2 קטגוריות";
      const validItems = s.items.filter((i) => i.text.trim() && i.correctBucket.trim());
      if (validItems.length === 0) return "יש להוסיף לפחות פריט אחד תקין";
    } else if (item.gameType === "numberPattern") {
      const n = item as NumberPatternContent;
      if (n.sequence.length < 3) return "יש להוסיף לפחות 3 מספרים לסדרה";
      if (!n.sequence.includes(null)) return "יש לבחור מספר חסר (?)";
      if (!n.rule.trim()) return "יש להוסיף תיאור הכלל";
    }
    return null;
  };

  // Clean content before save (filter empty items)
  const cleanContent = (item: GameContent): GameContent => {
    if (item.gameType === "wordSearch") {
      const w = item as WordSearchContent;
      return { ...w, words: w.words.filter((word) => word.trim()) } as GameContent;
    } else if (item.gameType === "memory") {
      const m = item as MemoryContent;
      return { ...m, pairs: m.pairs.filter((p) => p.term.trim() && p.match.trim()) } as GameContent;
    } else if (item.gameType === "sort") {
      const s = item as SortContent;
      return {
        ...s,
        buckets: s.buckets.filter((b) => b.trim()),
        items: s.items.filter((i) => i.text.trim() && i.correctBucket.trim()),
      } as GameContent;
    }
    return item;
  };

  // Save all changes
  const handleSave = async () => {
    if (!hasChanges) return;

    // Validate all content
    const allContent = [...Array.from(editedContent.values()), ...newContent];
    for (const item of allContent) {
      const error = validateContent(item);
      if (error) {
        toast.error(error);
        return;
      }
    }

    setIsSaving(true);

    try {
      // Delete removed items
      for (const id of deletedIds) {
        await deleteContent.mutateAsync(id);
      }

      // Update edited items (clean before save)
      for (const [id, item] of editedContent) {
        const cleaned = cleanContent(item);
        const { id: _, createdAt, updatedAt, ...data } = cleaned;
        await updateContent.mutateAsync({ id, data });
      }

      // Create new items (clean before save)
      for (const item of newContent) {
        const cleaned = cleanContent(item);
        const { id: _, createdAt, updatedAt, ...data } = cleaned;
        await createContent.mutateAsync(data as Omit<GameContent, "id" | "createdAt" | "updatedAt">);
      }

      // Reset state and refetch
      setEditedContent(new Map());
      setDeletedIds(new Set());
      setNewContent([]);
      await refetch();

      toast.success("השינויים נשמרו בהצלחה");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("שגיאה בשמירת השינויים");
    } finally {
      setIsSaving(false);
    }
  };

  if (!gameType) return null;

  const gameInfo = GAME_INFO[gameType];

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto max-h-[90vh] w-full max-w-3xl z-50 rounded-xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in shadow-2xl animate-scale-in border-0 bg-transparent overflow-hidden"
      onClose={onClose}
    >
      <div className="bg-white rounded-xl flex flex-col max-h-[90vh]" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Icon name={gameInfo.icon as IconName} size="md" className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-rubik font-bold text-gray-900">
              {gameInfo.nameHe}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-wrap items-center gap-6">
            {/* Grade selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">כיתה:</span>
              <div className="flex gap-1">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`
                      w-8 h-8 rounded-lg font-medium text-sm
                      transition-all duration-150
                      ${selectedGrade === grade
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }
                    `}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">רמה:</span>
              <div className="flex gap-1">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`
                      px-3 py-1.5 rounded-lg font-medium text-sm
                      transition-all duration-150
                      ${selectedDifficulty === diff
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                      }
                    `}
                  >
                    {DIFFICULTY_LABELS[diff]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="card" className="h-24" />
              ))}
            </div>
          ) : visibleContent.length === 0 && newContent.length === 0 ? (
            <EmptyState
              icon="file-text"
              title="אין תוכן"
              description={`אין תוכן עבור כיתה ${selectedGrade} ברמת ${DIFFICULTY_LABELS[selectedDifficulty]}`}
              action={{
                label: "הוסף תוכן חדש",
                onClick: handleAddNew,
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Existing content */}
              {visibleContent.map((item) => (
                <ContentEditor
                  key={item.id}
                  content={item}
                  gameType={gameType}
                  onEdit={(updates) => handleContentEdit(item.id, updates)}
                  onDelete={() => handleContentDeleteRequest(item.id, false)}
                  isNew={false}
                />
              ))}

              {/* New content */}
              {newContent.map((item) => (
                <ContentEditor
                  key={item.id}
                  content={item}
                  gameType={gameType}
                  onEdit={(updates) => handleNewContentEdit(item.id, updates)}
                  onDelete={() => handleContentDeleteRequest(item.id, true)}
                  isNew={true}
                />
              ))}

              {/* Add new button */}
              <button
                onClick={handleAddNew}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-150 font-medium"
              >
                + הוסף פריט חדש
              </button>
            </div>
          )}
        </div>

        {/* Footer with save button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {hasChanges ? "יש שינויים שלא נשמרו" : "אין שינויים"}
            </span>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              loading={isSaving}
              leftIcon={Save}
              variant="primary"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              שמור שינויים
            </Button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={handleConfirmedDelete}
        title="מחיקת תוכן"
        message={deleteConfirm?.isNew
          ? "האם למחוק פריט חדש זה? הפריט טרם נשמר."
          : "האם למחוק פריט זה? המחיקה תתבצע רק לאחר לחיצה על 'שמור שינויים'."
        }
        confirmLabel="מחק"
        cancelLabel="ביטול"
        variant="danger"
      />
    </dialog>
  );
}

// Content editor wrapper that renders the appropriate editor
interface ContentEditorProps {
  content: GameContent;
  gameType: GameType;
  onEdit: (updates: Partial<GameContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

function ContentEditor({ content, gameType, onEdit, onDelete, isNew }: ContentEditorProps) {
  switch (gameType) {
    case "hangman":
      return (
        <HangmanContentEditor
          content={content as HangmanContent}
          onEdit={onEdit}
          onDelete={onDelete}
          isNew={isNew}
        />
      );
    case "wordSearch":
      return (
        <WordSearchContentEditor
          content={content as WordSearchContent}
          onEdit={onEdit}
          onDelete={onDelete}
          isNew={isNew}
        />
      );
    case "memory":
      return (
        <MemoryContentEditor
          content={content as MemoryContent}
          onEdit={onEdit}
          onDelete={onDelete}
          isNew={isNew}
        />
      );
    case "quiz":
      return (
        <QuizContentEditor
          content={content as QuizContent}
          onEdit={onEdit}
          onDelete={onDelete}
          isNew={isNew}
        />
      );
    case "sort":
      return (
        <SortContentEditor
          content={content as SortContent}
          onEdit={onEdit}
          onDelete={onDelete}
          isNew={isNew}
        />
      );
    case "numberPattern":
      return (
        <NumberPatternContentEditor
          content={content as NumberPatternContent}
          onEdit={onEdit}
          onDelete={onDelete}
          isNew={isNew}
        />
      );
    default:
      return null;
  }
}
