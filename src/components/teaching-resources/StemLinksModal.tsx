"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import { useStemLinks, useSaveStemLinks } from "@/lib/queries";
import {
  X,
  Link2,
  ExternalLink,
  Plus,
  Pencil,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import type { Grade, StemLink } from "@/types";

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

interface StemLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: Grade;
  isAdmin: boolean;
}

export function StemLinksModal({
  isOpen,
  onClose,
  grade,
  isAdmin,
}: StemLinksModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toast = useToastActions();

  // React Query hooks
  const { data: allLinks = [], isLoading: loading } = useStemLinks();
  const saveMutation = useSaveStemLinks();

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editGradeSpecific, setEditGradeSpecific] = useState(false);

  // Adding new link state
  const [isAdding, setIsAdding] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newGradeSpecific, setNewGradeSpecific] = useState(false);

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter links for current grade
  const visibleLinks = allLinks.filter(
    (link) => link.grade === null || link.grade === grade
  );

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

  async function handleSave(updatedLinks: StemLink[]): Promise<boolean> {
    try {
      await saveMutation.mutateAsync(updatedLinks);
      toast.success("נשמר", "הקישורים עודכנו בהצלחה");
      return true;
    } catch {
      toast.error("שגיאה", "שגיאה בשמירת הקישורים");
      return false;
    }
  }

  async function handleAddLink() {
    if (!newDescription.trim() || !newUrl.trim()) {
      toast.error("שגיאה", "יש למלא תיאור וכתובת");
      return;
    }

    if (!isValidUrl(newUrl.trim())) {
      toast.error("שגיאה", "יש להזין כתובת URL תקינה");
      return;
    }

    const newLink: StemLink = {
      id: crypto.randomUUID(),
      description: newDescription.trim(),
      url: newUrl.trim(),
      grade: newGradeSpecific ? grade : null,
      createdAt: new Date(),
    };

    const updatedLinks = [...allLinks, newLink];
    const success = await handleSave(updatedLinks);

    if (success) {
      setNewDescription("");
      setNewUrl("");
      setNewGradeSpecific(false);
      setIsAdding(false);
    }
  }

  function handleStartEdit(link: StemLink) {
    setEditingId(link.id);
    setEditDescription(link.description);
    setEditUrl(link.url);
    setEditGradeSpecific(link.grade !== null);
  }

  async function handleSaveEdit() {
    if (!editDescription.trim() || !editUrl.trim()) {
      toast.error("שגיאה", "יש למלא תיאור וכתובת");
      return;
    }

    if (!isValidUrl(editUrl.trim())) {
      toast.error("שגיאה", "יש להזין כתובת URL תקינה");
      return;
    }

    const updatedLinks = allLinks.map((link) =>
      link.id === editingId
        ? {
            ...link,
            description: editDescription.trim(),
            url: editUrl.trim(),
            grade: editGradeSpecific ? grade : null,
          }
        : link
    );

    const success = await handleSave(updatedLinks);
    if (success) {
      setEditingId(null);
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditDescription("");
    setEditUrl("");
    setEditGradeSpecific(false);
  }

  async function handleConfirmDelete() {
    if (!deleteConfirmId) return;
    const updatedLinks = allLinks.filter((link) => link.id !== deleteConfirmId);
    await handleSave(updatedLinks);
    setDeleteConfirmId(null);
  }

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto h-fit z-50 rounded-2xl p-0 backdrop:bg-black/50 backdrop:animate-fade-in max-w-lg w-full shadow-2xl animate-scale-in border-0"
      onClose={onClose}
    >
      <div className="p-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Link2 size={24} className="text-emerald-700" />
            </div>
            <h2 className="text-xl font-rubik font-bold text-foreground">
              קישורים STEM
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

        {/* Content */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : visibleLinks.length === 0 && !isAdding ? (
            <div className="text-center py-8 text-gray-500">
              אין קישורים עדיין
            </div>
          ) : (
            <>
              {visibleLinks.map((link) => (
                <div key={link.id}>
                  {editingId === link.id ? (
                    // Edit mode
                    <div className="p-4 bg-surface-1 rounded-xl space-y-3">
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="תיאור הקישור"
                        className="w-full px-3 py-2 border border-surface-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <input
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="כתובת URL"
                        dir="ltr"
                        className="w-full px-3 py-2 border border-surface-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-left"
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editGradeSpecific}
                          onChange={(e) => setEditGradeSpecific(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        רק לכיתה {grade}
                      </label>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          ביטול
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={saveMutation.isPending}
                          rightIcon={saveMutation.isPending ? Loader2 : Check}
                        >
                          שמור
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="group flex items-center gap-3 p-3 bg-surface-1 rounded-xl hover:bg-surface-2 transition-colors">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink size={16} className="text-gray-400 flex-shrink-0" />
                        <span className="font-medium">{link.description}</span>
                        {link.grade && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            כיתה {link.grade}
                          </span>
                        )}
                      </a>
                      {isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEdit(link)}
                            className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                            aria-label="ערוך"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(link.id)}
                            className="p-1.5 text-gray-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors cursor-pointer"
                            aria-label="מחק"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Add new link form */}
          {isAdmin && isAdding && (
            <div className="p-4 bg-primary/5 rounded-xl space-y-3 border-2 border-dashed border-primary/30">
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="תיאור הקישור"
                className="w-full px-3 py-2 border border-surface-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="כתובת URL"
                dir="ltr"
                className="w-full px-3 py-2 border border-surface-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-left"
              />
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newGradeSpecific}
                  onChange={(e) => setNewGradeSpecific(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                רק לכיתה {grade}
              </label>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setNewDescription("");
                    setNewUrl("");
                    setNewGradeSpecific(false);
                  }}
                >
                  ביטול
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddLink}
                  disabled={saveMutation.isPending}
                  rightIcon={saveMutation.isPending ? Loader2 : Check}
                >
                  הוסף
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add button */}
        {isAdmin && !isAdding && !editingId && (
          <div className="mt-4 pt-4 border-t border-surface-2">
            <Button
              variant="outline"
              onClick={() => setIsAdding(true)}
              rightIcon={Plus}
              className="w-full"
            >
              הוסף קישור
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmId !== null}
        title="מחיקת קישור"
        message="האם אתה בטוח שברצונך למחוק קישור זה?"
        confirmLabel="מחק"
        cancelLabel="ביטול"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </dialog>
  );
}
