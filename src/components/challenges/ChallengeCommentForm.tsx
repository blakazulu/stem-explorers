"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useToastActions } from "@/components/ui/Toast";
import { useAddChallengeComment } from "@/lib/queries";
import { uploadImage } from "@/lib/utils/imageUpload";
import {
  compressVideo,
  isFFmpegSupported,
  isSlowCompressionMode,
  formatFileSize,
  CompressionProgress,
} from "@/lib/utils/videoCompression";
import { Send, ImagePlus, Video, X, Loader2 } from "lucide-react";
import type { Grade } from "@/types";

interface ChallengeCommentFormProps {
  challengeId: string;
  authorName: string;
  authorGrade: Grade;
  onCommented?: () => void;
}

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB per image
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function ChallengeCommentForm({
  challengeId,
  authorName,
  authorGrade,
  onCommented,
}: ChallengeCommentFormProps) {
  const [content, setContent] = useState("");

  // Multiple images state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // Upload state
  const [submitting, setSubmitting] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const toast = useToastActions();
  const addComment = useAddChallengeComment();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = MAX_IMAGES - imageFiles.length;
    if (remainingSlots <= 0) {
      toast.error("שגיאה", `ניתן להעלות עד ${MAX_IMAGES} תמונות`);
      return;
    }

    const filesToAdd: File[] = [];
    const previewsToAdd: string[] = [];

    for (const file of files.slice(0, remainingSlots)) {
      // Validate file type
      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        toast.error("שגיאה", "יש לבחור קבצי תמונה בלבד (JPEG, PNG, GIF, WebP)");
        continue;
      }

      // Validate file size
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error("שגיאה", "גודל התמונה חורג מ-15MB");
        continue;
      }

      filesToAdd.push(file);
      previewsToAdd.push(URL.createObjectURL(file));
    }

    if (filesToAdd.length > 0) {
      setImageFiles((prev) => [...prev, ...filesToAdd]);
      setImagePreviews((prev) => [...prev, ...previewsToAdd]);
    }

    // Clear input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("שגיאה", "יש להזין טקסט");
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      let videoUrl: string | undefined;

      // Upload images
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const path = `challenges/comments/${challengeId}/${Date.now()}_${i}_${file.name}`;
        const url = await uploadImage(file, path);
        imageUrls.push(url);
      }

      // Upload video if selected
      if (videoFile) {
        if (!isFFmpegSupported()) {
          toast.error("שגיאה", "הדפדפן שלך לא תומך בעיבוד וידאו. נסה להשתמש בדפדפן Chrome או Edge.");
          setSubmitting(false);
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
        const videoPath = `challenges/comments/${challengeId}/${timestamp}-video.mp4`;

        const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
        const { storage } = await import("@/lib/firebase");

        const videoRef = ref(storage, videoPath);

        videoUrl = await new Promise<string>((resolve, reject) => {
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
          `הסרטון הועלה (${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)})`
        );
      }

      await addComment.mutateAsync({
        challengeId,
        comment: {
          content: content.trim(),
          authorName,
          authorGrade,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          videoUrl,
        },
      });

      // Reset form
      setContent("");
      imagePreviews.forEach((p) => URL.revokeObjectURL(p));
      setImageFiles([]);
      setImagePreviews([]);
      removeVideo();

      toast.success("התגובה נוספה!");
      onCommented?.();
    } catch {
      toast.error("שגיאה", "שגיאה בהוספת התגובה");
    } finally {
      setSubmitting(false);
      setCompressionProgress(null);
    }
  };

  const canAddMoreImages = imageFiles.length < MAX_IMAGES;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Image previews */}
      {imagePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative inline-block">
              <img
                src={preview}
                alt={`תצוגה מקדימה ${index + 1}`}
                className="h-20 w-20 object-cover rounded-lg shadow-sm"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={submitting}
                className="absolute -top-2 -left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                aria-label="הסר תמונה"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Video preview */}
      {videoPreview && (
        <div className="relative inline-block">
          <video
            src={videoPreview}
            className="h-24 max-w-[200px] rounded-lg shadow-sm bg-gray-900"
            controls
          />
          <button
            type="button"
            onClick={removeVideo}
            disabled={submitting}
            className="absolute -top-2 -left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
            aria-label="הסר סרטון"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Compression progress */}
      {compressionProgress && (
        <div className="bg-amber-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-700">
                {compressionProgress.message}
              </p>
              <div className="mt-1 h-1.5 bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${compressionProgress.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="כתוב תגובה..."
            rows={2}
            className="w-full p-3 border-2 border-surface-3 rounded-xl bg-surface-0 text-foreground placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-sm"
          />
        </div>

        {/* Hidden inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoSelect}
          className="hidden"
        />

        {/* Image upload button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          disabled={submitting || !canAddMoreImages}
          className="mb-0.5"
          title={canAddMoreImages ? `הוסף תמונה (${imageFiles.length}/${MAX_IMAGES})` : `מקסימום ${MAX_IMAGES} תמונות`}
        >
          <ImagePlus size={16} />
          {imageFiles.length > 0 && (
            <span className="text-xs mr-1">{imageFiles.length}</span>
          )}
        </Button>

        {/* Video upload button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => videoInputRef.current?.click()}
          disabled={submitting || !!videoFile}
          className="mb-0.5"
          title={videoFile ? "סרטון נבחר" : "הוסף סרטון"}
        >
          <Video size={16} />
        </Button>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={submitting || !content.trim()}
          loading={submitting && !compressionProgress}
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 mb-0.5"
        >
          <Send size={16} />
        </Button>
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-400">
        ניתן להוסיף עד {MAX_IMAGES} תמונות וסרטון אחד
      </p>
    </form>
  );
}
