"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Check, X, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import PersonalMediaGallery from "@/components/personal/PersonalMediaGallery";
import PersonalMediaUploader from "@/components/personal/PersonalMediaUploader";
import {
  usePersonalPageConfig,
  useSavePersonalPageConfig,
  useAllPersonalMedia,
  useCreatePersonalMedia,
  useUpdatePersonalMedia,
  useDeletePersonalMedia,
  useReorderPersonalMedia,
} from "@/lib/queries";
import { useAuth } from "@/contexts/AuthContext";
import { useToastActions } from "@/components/ui/Toast";
import type { PersonalMedia, Grade, PersonalMediaType } from "@/types";
import { getNextMediaOrder } from "@/lib/services/personal";

const DEFAULT_INTRO = "ברוכים הבאים לעמוד האישי. כאן תוכלו למצוא תוכן מיוחד המותאם עבורכם.";

export default function AdminPersonalPage() {
  const router = useRouter();
  const { session } = useAuth();
  const toast = useToastActions();
  const [showUploader, setShowUploader] = useState(false);
  const [editingMedia, setEditingMedia] = useState<PersonalMedia | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<PersonalMedia | null>(null);

  // Intro editing state
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [editText, setEditText] = useState("");
  const [savingIntro, setSavingIntro] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (session && session.user.role !== "admin") {
      router.replace(`/${session.user.role}`);
    }
  }, [session, router]);

  // Early return for non-admins
  if (!session || session.user.role !== "admin") {
    return null;
  }

  // Queries
  const { data: config, isLoading: configLoading } = usePersonalPageConfig();
  const { data: mediaItems = [], isLoading: mediaLoading } =
    useAllPersonalMedia();

  // Derived intro text with default fallback
  const introText = config?.introText || DEFAULT_INTRO;

  // Mutations
  const saveConfig = useSavePersonalPageConfig();
  const createMedia = useCreatePersonalMedia();
  const updateMedia = useUpdatePersonalMedia();
  const deleteMedia = useDeletePersonalMedia();
  const reorderMedia = useReorderPersonalMedia();

  const handleStartEditIntro = () => {
    setEditText(introText);
    setIsEditingIntro(true);
  };

  const handleCancelEditIntro = () => {
    setIsEditingIntro(false);
    setEditText("");
  };

  const handleSaveIntro = async () => {
    if (!editText.trim()) {
      toast.error("הטקסט לא יכול להיות ריק");
      return;
    }

    setSavingIntro(true);
    try {
      await saveConfig.mutateAsync({
        introText: editText.trim(),
        updatedBy: session.user.name || "admin",
      });
      setIsEditingIntro(false);
      toast.success("הקדמה נשמרה בהצלחה");
    } catch (error) {
      console.error("Save intro error:", error);
      toast.error(error instanceof Error ? error.message : "שגיאה בשמירת ההקדמה");
    }
    setSavingIntro(false);
  };

  const handleUploadMedia = async (data: {
    type: PersonalMediaType;
    url: string;
    thumbnailUrl?: string;
    title: string;
    description?: string;
    grades: Grade[] | "all";
  }) => {
    try {
      const order = await getNextMediaOrder();
      await createMedia.mutateAsync({
        ...data,
        order,
        createdBy: session.user.name || "admin",
      });
      setShowUploader(false);
      toast.success("מדיה נוספה בהצלחה");
    } catch (error) {
      console.error("Upload media error:", error);
      toast.error(error instanceof Error ? error.message : "שגיאה בהוספת מדיה");
    }
  };

  const handleEditMedia = (media: PersonalMedia) => {
    setEditingMedia(media);
  };

  const handleUpdateMedia = async (data: Partial<PersonalMedia>) => {
    if (!editingMedia) return;
    try {
      await updateMedia.mutateAsync({
        id: editingMedia.id,
        data,
      });
      setEditingMedia(null);
      toast.success("מדיה עודכנה בהצלחה");
    } catch (error) {
      console.error("Update media error:", error);
      toast.error(error instanceof Error ? error.message : "שגיאה בעדכון מדיה");
    }
  };

  const handleDeleteMedia = async () => {
    if (!deletingMedia) return;
    try {
      await deleteMedia.mutateAsync({
        id: deletingMedia.id,
        url: deletingMedia.url,
        thumbnailUrl: deletingMedia.thumbnailUrl,
      });
      setDeletingMedia(null);
      toast.success("מדיה נמחקה בהצלחה");
    } catch (error) {
      console.error("Delete media error:", error);
      toast.error(error instanceof Error ? error.message : "שגיאה במחיקת מדיה");
    }
  };

  const handleReorderMedia = async (reordered: PersonalMedia[]) => {
    try {
      await reorderMedia.mutateAsync(
        reordered.map((m) => ({ id: m.id, order: m.order }))
      );
    } catch (error) {
      console.error("Reorder media error:", error);
      toast.error(error instanceof Error ? error.message : "שגיאה בסידור מחדש");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-admin/10 rounded-xl">
          <Heart size={24} className="text-role-admin" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            אישי - ניהול
          </h1>
          <p className="text-sm text-gray-500">
            עריכת תוכן העמוד האישי המוצג לתלמידים
          </p>
        </div>
      </div>

      {/* Intro Section */}
      <div className="p-6 bg-surface-1 rounded-2xl border border-surface-2">
        <h2 className="text-lg font-semibold text-foreground mb-4">הקדמה</h2>
        {configLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-surface-2 rounded w-full" />
            <div className="h-4 bg-surface-2 rounded w-5/6" />
            <div className="h-4 bg-surface-2 rounded w-4/6" />
          </div>
        ) : isEditingIntro ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value.slice(0, 500))}
              className="w-full p-3 rounded-lg border border-surface-3 bg-surface-0 text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={4}
              maxLength={500}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs ${editText.length >= 480 ? 'text-amber-500' : 'text-gray-400'}`}>
                {editText.length}/500
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEditIntro}
                  disabled={savingIntro}
                  rightIcon={X}
                >
                  ביטול
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveIntro}
                  loading={savingIntro}
                  rightIcon={Check}
                >
                  שמור
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <p className="text-foreground leading-relaxed flex-1">
              {introText}
            </p>
            <button
              onClick={handleStartEditIntro}
              className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-gray-400 hover:text-foreground"
              title="עריכת טקסט"
            >
              <Pencil size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Media Gallery Section */}
      <div className="p-6 bg-surface-1 rounded-2xl border border-surface-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">גלריית מדיה</h2>
          <Button
            onClick={() => setShowUploader(true)}
            leftIcon={Plus}
            size="sm"
          >
            הוסף מדיה
          </Button>
        </div>

        {mediaLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-48" />
            ))}
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>אין עדיין מדיה בגלריה</p>
            <p className="text-sm mt-1">לחץ על &quot;הוסף מדיה&quot; להתחלה</p>
          </div>
        ) : (
          <PersonalMediaGallery
            media={mediaItems}
            isAdmin={true}
            onEdit={handleEditMedia}
            onDelete={setDeletingMedia}
            onReorder={handleReorderMedia}
          />
        )}
      </div>

      {/* Upload Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <PersonalMediaUploader
            onUpload={handleUploadMedia}
            onCancel={() => setShowUploader(false)}
          />
        </div>
      )}

      {/* Edit Media Modal */}
      {editingMedia && (
        <EditMediaModal
          media={editingMedia}
          onSave={handleUpdateMedia}
          onCancel={() => setEditingMedia(null)}
          isLoading={updateMedia.isPending}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingMedia}
        onCancel={() => setDeletingMedia(null)}
        onConfirm={handleDeleteMedia}
        title="מחיקת מדיה"
        message={`האם למחוק את "${deletingMedia?.title}"?`}
        confirmLabel="מחק"
        variant="danger"
      />
    </div>
  );
}

// Edit Media Modal Component
interface EditMediaModalProps {
  media: PersonalMedia;
  onSave: (data: Partial<PersonalMedia>) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

function EditMediaModal({
  media,
  onSave,
  onCancel,
  isLoading,
}: EditMediaModalProps) {
  const toast = useToastActions();
  const [title, setTitle] = useState(media.title);
  const [description, setDescription] = useState(media.description || "");
  const [allGrades, setAllGrades] = useState(media.grades === "all");
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>(
    media.grades === "all" ? [] : media.grades
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allGrades && selectedGrades.length === 0) {
      toast.error("יש לבחור לפחות כיתה אחת");
      return;
    }
    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      grades: allGrades ? "all" : selectedGrades,
    });
  };

  const handleGradeToggle = (grade: Grade) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4 text-right">
          עריכת מדיה
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
              כותרת
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
              תיאור
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              כיתות
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allGrades}
                  onChange={(e) => setAllGrades(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">כל הכיתות</span>
              </label>
              {!allGrades && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {GRADES.map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => handleGradeToggle(grade)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedGrades.includes(grade)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  שומר...
                </>
              ) : (
                "שמור"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              ביטול
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
