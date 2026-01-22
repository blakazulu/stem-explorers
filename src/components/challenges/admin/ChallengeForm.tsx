"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToastActions } from "@/components/ui/Toast";
import { useCreateChallenge, useUpdateChallenge } from "@/lib/queries";
import { uploadImage, uploadImageWithProgress } from "@/lib/utils/imageUpload";
import {
  compressVideo,
  isFFmpegSupported,
  isSlowCompressionMode,
  formatFileSize,
  CompressionProgress,
} from "@/lib/utils/videoCompression";
import {
  Send,
  ImagePlus,
  Video,
  Link,
  X,
  Trophy,
  Loader2,
} from "lucide-react";
import type { Challenge, Grade } from "@/types";

const grades: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB

interface ChallengeFormProps {
  authorName: string;
  editingChallenge?: Challenge | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type VideoMode = "none" | "url" | "upload";

export function ChallengeForm({
  authorName,
  editingChallenge,
  onSuccess,
  onCancel,
}: ChallengeFormProps) {
  const isEditing = !!editingChallenge;

  // Form state
  const [title, setTitle] = useState(editingChallenge?.title || "");
  const [description, setDescription] = useState(editingChallenge?.description || "");
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>(
    editingChallenge?.targetGrades === "all" ? [] : (editingChallenge?.targetGrades || [])
  );
  const [allGrades, setAllGrades] = useState(
    editingChallenge?.targetGrades === "all" || !editingChallenge
  );
  const [isActive, setIsActive] = useState(editingChallenge?.isActive || false);

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editingChallenge?.imageUrl || null
  );
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(
    editingChallenge?.imageUrl || null
  );

  // Video state
  const [videoMode, setVideoMode] = useState<VideoMode>(() => {
    if (editingChallenge?.videoUrl) return "url";
    if (editingChallenge?.videoStorageUrl) return "upload";
    return "none";
  });
  const [videoUrl, setVideoUrl] = useState(editingChallenge?.videoUrl || "");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(
    editingChallenge?.videoStorageUrl || null
  );
  const [existingVideoStorageUrl, setExistingVideoStorageUrl] = useState<string | null>(
    editingChallenge?.videoStorageUrl || null
  );

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const toast = useToastActions();
  const createChallenge = useCreateChallenge();
  const updateChallenge = useUpdateChallenge();

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview !== existingImageUrl) {
        URL.revokeObjectURL(imagePreview);
      }
      if (videoPreview && videoPreview !== existingVideoStorageUrl) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [imagePreview, videoPreview, existingImageUrl, existingVideoStorageUrl]);

  const handleGradeToggle = (grade: Grade) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      toast.error("שגיאה", "יש להעלות קובץ תמונה בלבד (JPEG, PNG, GIF, WebP)");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("שגיאה", "גודל הקובץ חייב להיות עד 15MB");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    // Cleanup old preview
    if (imagePreview && imagePreview !== existingImageUrl) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExistingImageUrl(null);
  };

  const removeImage = () => {
    if (imagePreview && imagePreview !== existingImageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("שגיאה", "יש לבחור קובץ וידאו");
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    // Cleanup old preview
    if (videoPreview && videoPreview !== existingVideoStorageUrl) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setExistingVideoStorageUrl(null);
  };

  const removeVideo = () => {
    if (videoPreview && videoPreview !== existingVideoStorageUrl) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    setExistingVideoStorageUrl(null);
    setVideoUrl("");
    setVideoMode("none");
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("שגיאה", "יש להזין כותרת");
      return;
    }

    if (!description.trim()) {
      toast.error("שגיאה", "יש להזין תיאור");
      return;
    }

    const targetGrades = allGrades ? ("all" as const) : selectedGrades;
    if (!allGrades && selectedGrades.length === 0) {
      toast.error("שגיאה", "יש לבחור לפחות כיתה אחת");
      return;
    }

    setUploading(true);

    try {
      let imageUrl: string | undefined = existingImageUrl || undefined;
      let videoStorageUrl: string | undefined = existingVideoStorageUrl || undefined;
      let finalVideoUrl: string | undefined = videoMode === "url" ? videoUrl : undefined;

      // Upload new image if selected
      if (imageFile) {
        setUploadProgress(0);
        const path = `challenges/${Date.now()}_${imageFile.name}`;
        imageUrl = await uploadImageWithProgress(imageFile, path, (percent) => {
          setUploadProgress(percent);
        });
      }

      // Handle video upload if mode is "upload" and we have a new file
      if (videoMode === "upload" && videoFile) {
        if (!isFFmpegSupported()) {
          toast.error("שגיאה", "הדפדפן שלך לא תומך בעיבוד וידאו. נסה להשתמש בדפדפן Chrome או Edge.");
          setUploading(false);
          return;
        }

        // Show friendly message if using slow mode
        if (isSlowCompressionMode()) {
          toast.info(
            "הסרטון יעובד בהצלחה, אבל זה עשוי לקחת קצת יותר זמן מהרגיל. אפשר להמשיך לעבוד בינתיים 😊"
          );
        }

        // Compress video
        const result = await compressVideo(videoFile, (progress) => {
          setCompressionProgress(progress);
        });

        setCompressionProgress({
          stage: "finalizing",
          progress: 80,
          message: "מעלה את הסרטון...",
        });

        // Upload video
        const timestamp = Date.now();
        const videoPath = `challenges/${timestamp}-video.mp4`;

        const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
        const { storage } = await import("@/lib/firebase");

        const videoRef = ref(storage, videoPath);

        videoStorageUrl = await new Promise<string>((resolve, reject) => {
          const uploadTask = uploadBytesResumable(videoRef, result.blob);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const uploadPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const overallProgress = 80 + (uploadPercent * 0.2);
              setCompressionProgress({
                stage: "finalizing",
                progress: overallProgress,
                message: `מעלה את הסרטון... ${Math.round(uploadPercent)}%`,
              });
            },
            reject,
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              } catch (error) {
                reject(error);
              }
            }
          );
        });

        toast.success(
          `הסרטון הועלה בהצלחה (${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)})`
        );
      }

      // Clear video URL if mode is not "url"
      if (videoMode !== "url") {
        finalVideoUrl = undefined;
      }

      // Clear video storage URL if mode is not "upload" or we're using URL mode
      if (videoMode !== "upload") {
        videoStorageUrl = undefined;
      }

      const challengeData = {
        title: title.trim(),
        description: description.trim(),
        targetGrades,
        isActive,
        imageUrl,
        videoUrl: finalVideoUrl,
        videoStorageUrl,
        authorName,
      };

      if (isEditing && editingChallenge) {
        await updateChallenge.mutateAsync({
          id: editingChallenge.id,
          data: challengeData,
        });
        toast.success("האתגר עודכן בהצלחה!");
      } else {
        await createChallenge.mutateAsync(challengeData);
        toast.success("האתגר נוסף בהצלחה!");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("שגיאה", isEditing ? "שגיאה בעדכון האתגר" : "שגיאה בהוספת האתגר");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setCompressionProgress(null);
    }
  };

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-l from-amber-500/10 to-orange-500/10 px-4 md:px-6 py-4 border-b border-surface-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Trophy size={20} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-rubik font-semibold text-lg text-foreground">
              {isEditing ? "עריכת אתגר" : "אתגר חדש"}
            </h3>
            <p className="text-sm text-gray-500">
              {isEditing ? "עדכן את פרטי האתגר" : "צור אתגר חדש להורים"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            כותרת *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="הזן כותרת לאתגר..."
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            תיאור *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
            placeholder="תאר את האתגר..."
            rows={4}
            required
          />
        </div>

        {/* Grade Selector */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            כיתות יעד
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allGrades}
                onChange={(e) => setAllGrades(e.target.checked)}
                className="rounded text-amber-600"
              />
              <span className="text-sm">כל הכיתות</span>
            </label>
            {!allGrades && (
              <div className="flex gap-2 flex-wrap">
                {grades.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleGradeToggle(grade)}
                    className={`w-10 h-10 rounded-lg font-rubik font-bold transition-all cursor-pointer ${
                      selectedGrades.includes(grade)
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-surface-1 text-foreground hover:bg-surface-2"
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            תמונה (אופציונלי)
          </label>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="תצוגה מקדימה"
                className="max-h-48 rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={uploading}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-surface-3 rounded-xl text-gray-500 hover:border-amber-500 hover:text-amber-600 transition-all cursor-pointer disabled:opacity-50"
            >
              <ImagePlus size={20} />
              <span>הוסף תמונה</span>
            </button>
          )}
        </div>

        {/* Video Section */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            סרטון (אופציונלי)
          </label>

          {/* Video mode selector */}
          {videoMode === "none" && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setVideoMode("url")}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-surface-3 rounded-xl text-gray-500 hover:border-amber-500 hover:text-amber-600 transition-all cursor-pointer disabled:opacity-50"
              >
                <Link size={20} />
                <span>קישור YouTube/Vimeo</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoMode("upload")}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-surface-3 rounded-xl text-gray-500 hover:border-amber-500 hover:text-amber-600 transition-all cursor-pointer disabled:opacity-50"
              >
                <Video size={20} />
                <span>העלאת סרטון</span>
              </button>
            </div>
          )}

          {/* Video URL input */}
          {videoMode === "url" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 p-3 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={removeVideo}
                  disabled={uploading}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                תמיכה בקישורי YouTube ו-Vimeo
              </p>
            </div>
          )}

          {/* Video upload */}
          {videoMode === "upload" && (
            <div className="space-y-2">
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              {videoPreview ? (
                <div className="relative">
                  <video
                    src={videoPreview}
                    className="w-full max-h-48 rounded-lg object-contain bg-gray-900"
                    controls
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    disabled={uploading}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-surface-3 rounded-xl text-gray-500 hover:border-amber-500 hover:text-amber-600 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Video size={24} />
                    <span>לחץ לבחירת סרטון</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoMode("none")}
                    disabled={uploading}
                    className="p-3 text-gray-400 hover:text-gray-600 hover:bg-surface-1 rounded-xl transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                מקסימום 5 דקות. הסרטון יכווץ אוטומטית ל-720p.
              </p>
            </div>
          )}
        </div>

        {/* Active checkbox */}
        <div className="pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500"
            />
            <div>
              <span className="font-medium text-foreground">סמן כאתגר פעיל</span>
              <p className="text-xs text-gray-500">
                רק אתגר אחד יכול להיות פעיל בכל זמן. אתגר פעיל יוצג ראשון ויאפשר תגובות.
              </p>
            </div>
          </label>
        </div>

        {/* Compression/Upload progress */}
        {compressionProgress && (
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700">
                  {compressionProgress.message}
                </p>
                <div className="mt-1 h-2 bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${compressionProgress.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={uploading}
            >
              ביטול
            </Button>
          )}
          <Button
            type="submit"
            disabled={uploading || !title.trim() || !description.trim()}
            loading={uploading && !compressionProgress}
            loadingText={isEditing ? "מעדכן..." : "יוצר..."}
            rightIcon={Send}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {isEditing ? "עדכן אתגר" : "צור אתגר"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
