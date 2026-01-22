"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Check, X, Loader2, Heart, Upload, Trash2, ImageIcon } from "lucide-react";
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
import { uploadImageWithProgress, deleteStorageFile } from "@/lib/utils/imageUpload";
import { validateEmbedUrl } from "@/lib/utils/embedValidator";

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

  // Banner editing state
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerProgress, setBannerProgress] = useState(0);
  const [deletingBanner, setDeletingBanner] = useState(false);

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

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("יש לבחור קובץ תמונה");
      return;
    }

    setBannerUploading(true);
    setBannerProgress(0);

    try {
      // Delete old banner if exists
      if (config?.bannerUrl) {
        await deleteStorageFile(config.bannerUrl);
      }

      const timestamp = Date.now();
      const path = `personal/banner/${timestamp}-banner.webp`;
      const url = await uploadImageWithProgress(file, path, (percent) => {
        setBannerProgress(percent);
      });

      await saveConfig.mutateAsync({
        bannerUrl: url,
        updatedBy: session.user.name || "admin",
      });

      toast.success("באנר הועלה בהצלחה");
    } catch (error) {
      console.error("Banner upload error:", error);
      toast.error(error instanceof Error ? error.message : "שגיאה בהעלאת באנר");
    } finally {
      setBannerUploading(false);
      setBannerProgress(0);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleDeleteBanner = async () => {
    if (!config?.bannerUrl) return;

    try {
      await deleteStorageFile(config.bannerUrl);
      await saveConfig.mutateAsync({
        bannerUrl: "",
        updatedBy: session.user.name || "admin",
      });
      setDeletingBanner(false);
      toast.success("באנר נמחק בהצלחה");
    } catch (error) {
      console.error("Delete banner error:", error);
      toast.error(error instanceof Error ? error.message : "שגיאה במחיקת באנר");
    }
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

  const handleUpdateMedia = async (data: Partial<PersonalMedia>, newFile?: File, oldUrl?: string) => {
    if (!editingMedia) return;
    try {
      let finalData = { ...data };

      // Handle file replacement for image/video
      if (newFile && editingMedia.type === "image") {
        // Upload new image
        const timestamp = Date.now();
        const path = `personal/media/${timestamp}-${newFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}.webp`;
        const newUrl = await uploadImageWithProgress(newFile, path, () => {});
        finalData.url = newUrl;

        // Delete old file
        if (oldUrl) {
          try {
            await deleteStorageFile(oldUrl);
          } catch (e) {
            console.error("Failed to delete old file:", e);
          }
        }
      } else if (newFile && editingMedia.type === "video") {
        // For video, we need compression - show a message for now
        // This is more complex, so we'll handle it simply
        toast.error("החלפת וידאו עדיין לא נתמכת. מחק והעלה מחדש.");
        return;
      }

      await updateMedia.mutateAsync({
        id: editingMedia.id,
        data: finalData,
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

      {/* Banner Section */}
      <div className="p-6 bg-surface-1 rounded-2xl border border-surface-2">
        <h2 className="text-lg font-semibold text-foreground mb-4">באנר</h2>
        {configLoading ? (
          <div className="h-48 bg-surface-2 rounded-lg animate-pulse" />
        ) : config?.bannerUrl ? (
          <div className="relative group">
            <img
              src={config.bannerUrl}
              alt="באנר"
              className="w-full h-48 md:h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-3">
              <label className="p-3 bg-white rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                <Pencil size={20} className="text-gray-700" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                  disabled={bannerUploading}
                />
              </label>
              <button
                onClick={() => setDeletingBanner(true)}
                className="p-3 bg-white rounded-full hover:bg-red-50 transition-colors"
              >
                <Trash2 size={20} className="text-red-500" />
              </button>
            </div>
            {bannerUploading && (
              <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{ width: `${bannerProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <label className={`flex flex-col items-center justify-center h-48 border-2 border-dashed border-surface-3 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-surface-2/50 transition-colors ${bannerUploading ? "pointer-events-none opacity-50" : ""}`}>
            {bannerUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                <span className="text-sm text-gray-500">מעלה... {bannerProgress}%</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">לחץ להעלאת באנר</span>
                <span className="text-xs text-gray-400 mt-1">מומלץ: 1200x400 פיקסלים</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerUpload}
              className="hidden"
              disabled={bannerUploading}
            />
          </label>
        )}
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

      {/* Delete Media Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingMedia}
        onCancel={() => setDeletingMedia(null)}
        onConfirm={handleDeleteMedia}
        title="מחיקת מדיה"
        message={`האם למחוק את "${deletingMedia?.title}"?`}
        confirmLabel="מחק"
        variant="danger"
      />

      {/* Delete Banner Confirmation */}
      <ConfirmDialog
        isOpen={deletingBanner}
        onCancel={() => setDeletingBanner(false)}
        onConfirm={handleDeleteBanner}
        title="מחיקת באנר"
        message="האם למחוק את הבאנר?"
        confirmLabel="מחק"
        variant="danger"
      />
    </div>
  );
}

// Edit Media Modal Component
interface EditMediaModalProps {
  media: PersonalMedia;
  onSave: (data: Partial<PersonalMedia>, newFile?: File, oldUrl?: string) => Promise<void>;
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

  // Media replacement state
  const [newUrl, setNewUrl] = useState(media.url);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const isLinkType = media.type === "youtube" || media.type === "embed";
  const isFileType = media.type === "image" || media.type === "video";

  // Cleanup filePreview on unmount
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (media.type === "image" && !file.type.startsWith("image/")) {
      toast.error("יש לבחור קובץ תמונה");
      return;
    }
    if (media.type === "video" && !file.type.startsWith("video/")) {
      toast.error("יש לבחור קובץ וידאו");
      return;
    }

    // Cleanup previous preview
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }

    setNewFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleRemoveNewFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setNewFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allGrades && selectedGrades.length === 0) {
      toast.error("יש לבחור לפחות כיתה אחת");
      return;
    }

    const updates: Partial<PersonalMedia> = {
      title: title.trim(),
      description: description.trim() || undefined,
      grades: allGrades ? "all" : selectedGrades,
    };

    // Handle URL change for link types
    if (isLinkType && newUrl !== media.url) {
      // Validate embed URLs
      if (media.type === "embed") {
        const validation = validateEmbedUrl(newUrl);
        if (!validation.isValid) {
          toast.error(validation.error || "קישור לא תקין");
          return;
        }
        updates.url = validation.embedUrl;
      } else {
        updates.url = newUrl;
      }
    }

    // Pass file separately for upload handling
    await onSave(updates, newFile || undefined, newFile ? media.url : undefined);
  };

  const handleGradeToggle = (grade: Grade) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4 text-right">
          עריכת מדיה
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Media preview/replacement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              {media.type === "image" ? "תמונה" : media.type === "video" ? "סרטון" : media.type === "youtube" ? "קישור YouTube" : "קישור הטמעה"}
            </label>

            {isLinkType ? (
              // URL input for youtube/embed
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left text-sm"
                dir="ltr"
                placeholder={media.type === "youtube" ? "https://youtube.com/..." : "https://prezi.com/..."}
              />
            ) : isFileType ? (
              // File upload for image/video
              <div className="space-y-2">
                {/* Current or new preview */}
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  {media.type === "image" ? (
                    <img
                      src={filePreview || media.url}
                      alt={title}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <video
                      src={filePreview || media.url}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  {newFile && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                      חדש
                    </div>
                  )}
                </div>

                {/* Upload/remove buttons */}
                <div className="flex gap-2">
                  <label className="flex-1 text-center py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm text-gray-700 transition-colors">
                    {newFile ? "בחר קובץ אחר" : "החלף קובץ"}
                    <input
                      type="file"
                      accept={media.type === "image" ? "image/*" : "video/*"}
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                  {newFile && (
                    <button
                      type="button"
                      onClick={handleRemoveNewFile}
                      className="py-2 px-3 bg-red-50 hover:bg-red-100 rounded-lg text-sm text-red-600 transition-colors"
                    >
                      בטל שינוי
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>

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
