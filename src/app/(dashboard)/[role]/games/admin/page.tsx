"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Gamepad2, Layers, BarChart2, Hash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useAllGameContent,
  useCreateGameContent,
  useUpdateGameContent,
  useDeleteGameContent,
} from "@/lib/queries/games";
import { GAME_INFO } from "@/lib/constants/games";
import { GameContentTable } from "@/components/games/admin/GameContentTable";
import { GameContentForm } from "@/components/games/admin/GameContentForm";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastActions } from "@/components/ui/Toast";
import type { GameContent, GameType, Difficulty } from "@/types/games";
import type { Grade } from "@/types";

export default function GamesAdminPage() {
  const params = useParams();
  const router = useRouter();
  const { session } = useAuth();
  const toast = useToastActions();

  // Access control - redirect non-admins
  const role = params.role as string;
  if (role !== "admin") {
    router.replace(`/${role}/games`);
    return null;
  }

  // State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<GameContent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    gameType: GameType | "";
    grade: Grade | "";
    difficulty: Difficulty | "";
  }>({
    gameType: "",
    grade: "",
    difficulty: "",
  });

  // Data fetching
  const { data: content = [], isLoading } = useAllGameContent();

  // Mutations
  const createMutation = useCreateGameContent();
  const updateMutation = useUpdateGameContent();
  const deleteMutation = useDeleteGameContent();

  // Stats
  const stats = useMemo(() => {
    const gameTypes = new Set(content.map((c) => c.gameType));
    const grades = new Set(content.map((c) => c.grade));
    return {
      totalContent: content.length,
      gameTypesCount: gameTypes.size,
      gradesCount: grades.size,
      gamesAvailable: Object.keys(GAME_INFO).length,
    };
  }, [content]);

  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (item: GameContent) => {
    setEditItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleFormSubmit = async (
    data: Omit<GameContent, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (editItem) {
        await updateMutation.mutateAsync({
          id: editItem.id,
          data,
        });
        toast.success("התוכן עודכן בהצלחה");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("התוכן נוסף בהצלחה");
      }
      setIsFormOpen(false);
      setEditItem(null);
    } catch {
      toast.error("שגיאה בשמירת התוכן");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("התוכן נמחק בהצלחה");
    } catch {
      toast.error("שגיאה במחיקת התוכן");
    } finally {
      setDeleteId(null);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditItem(null);
  };

  // Show loading state before session is available
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-pulse text-gray-400">...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Gamepad2 size={24} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              ניהול משחקים
            </h1>
            <p className="text-sm text-gray-500">
              ניהול תוכן המשחקים במרכז הלמידה
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
          rightIcon={Plus}
        >
          הוסף תוכן
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-0 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Layers size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.totalContent}
              </p>
              <p className="text-xs text-gray-500">פריטי תוכן</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-0 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Gamepad2 size={20} className="text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.gameTypesCount}
              </p>
              <p className="text-xs text-gray-500">סוגי משחקים</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-0 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <BarChart2 size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.gradesCount}
              </p>
              <p className="text-xs text-gray-500">כיתות פעילות</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-0 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Hash size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.gamesAvailable}
              </p>
              <p className="text-xs text-gray-500">משחקים זמינים</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <GameContentTable
        content={content}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Form Modal */}
      <GameContentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        editItem={editItem}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="מחיקת תוכן"
        message="האם אתה בטוח שברצונך למחוק תוכן זה? פעולה זו אינה ניתנת לביטול."
        confirmLabel="מחק"
        cancelLabel="ביטול"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
