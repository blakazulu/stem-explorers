"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, Video, ImageIcon, Youtube, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UploadOverlay } from "@/components/ui/UploadOverlay";
import { uploadImageWithProgress } from "@/lib/utils/imageUpload";
import {
  compressVideo,
  generateVideoThumbnail,
  isFFmpegSupported,
  formatFileSize,
  CompressionProgress,
} from "@/lib/utils/videoCompression";
import { useToastActions } from "@/components/ui/Toast";
import type { Grade, PersonalMediaType } from "@/types";

interface PersonalMediaUploaderProps {
  onUpload: (data: {
    type: PersonalMediaType;
    url: string;
    thumbnailUrl?: string;
    title: string;
    description?: string;
    grades: Grade[] | "all";
  }) => Promise<void>;
  onCancel: () => void;
}

const GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

type UploadMode = "image" | "video" | "youtube";

export default function PersonalMediaUploader({
  onUpload,
  onCancel,
}: PersonalMediaUploaderProps) {
  const [mode, setMode] = useState<UploadMode | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<Grade[]>([]);
  const [allGrades, setAllGrades] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionProgress, setCompressionProgress] =
    useState<CompressionProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToastActions();

  // Cleanup filePreview on unmount
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (mode === "image" && !file.type.startsWith("image/")) {
        toast.error("יש לבחור קובץ תמונה");
        return;
      }

      if (mode === "video" && !file.type.startsWith("video/")) {
        toast.error("יש לבחור קובץ וידאו");
        return;
      }

      // Cleanup previous preview
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }

      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));

      // Auto-fill title from filename
      if (!title) {
        const nameWithoutExt = file.name.replace(/\.[^.]+$/, "");
        setTitle(nameWithoutExt);
      }
    },
    [mode, title, filePreview, toast]
  );

  const handleGradeToggle = (grade: Grade) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("יש להזין כותרת");
      return;
    }

    const grades = allGrades ? "all" : selectedGrades;
    if (!allGrades && selectedGrades.length === 0) {
      toast.error("יש לבחור לפחות כיתה אחת");
      return;
    }

    setIsUploading(true);

    try {
      if (mode === "youtube") {
        if (!youtubeUrl.trim()) {
          toast.error("יש להזין קישור YouTube");
          return;
        }

        await onUpload({
          type: "youtube",
          url: youtubeUrl,
          title: title.trim(),
          description: description.trim() || undefined,
          grades,
        });
      } else if (mode === "image" && selectedFile) {
        setUploadProgress(0);
        const timestamp = Date.now();
        const path = `personal/media/${timestamp}-${selectedFile.name.replace(
          /[^a-zA-Z0-9.-]/g,
          "_"
        )}.webp`;
        const url = await uploadImageWithProgress(selectedFile, path, (percent) => {
          setUploadProgress(percent);
        });

        await onUpload({
          type: "image",
          url,
          title: title.trim(),
          description: description.trim() || undefined,
          grades,
        });
      } else if (mode === "video" && selectedFile) {
        // Check browser support
        if (!isFFmpegSupported()) {
          if (filePreview) {
            URL.revokeObjectURL(filePreview);
          }
          toast.error(
            "הדפדפן שלך לא תומך בדחיסת וידאו. נסה להעלות קישור YouTube במקום."
          );
          setIsUploading(false);
          return;
        }

        // Compress video
        const result = await compressVideo(selectedFile, (progress) => {
          setCompressionProgress(progress);
        });

        setCompressionProgress({
          stage: "finalizing",
          progress: 75,
          message: "מעלה תמונה ממוזערת...",
        });

        // Generate thumbnail
        let thumbnailUrl: string | undefined;
        try {
          const thumbnailBlob = await generateVideoThumbnail(selectedFile);
          const timestamp = Date.now();
          const thumbPath = `personal/media/${timestamp}-thumb.webp`;

          const { ref, uploadBytes, getDownloadURL } = await import(
            "firebase/storage"
          );
          const { storage } = await import("@/lib/firebase");

          const thumbRef = ref(storage, thumbPath);
          await uploadBytes(thumbRef, thumbnailBlob);
          thumbnailUrl = await getDownloadURL(thumbRef);
        } catch (e) {
          console.error("Failed to generate thumbnail:", e);
        }

        setCompressionProgress({
          stage: "finalizing",
          progress: 80,
          message: "מעלה את הסרטון...",
        });

        // Upload video with progress tracking
        const timestamp = Date.now();
        const videoPath = `personal/media/${timestamp}-video.mp4`;

        const { ref, uploadBytesResumable, getDownloadURL } = await import(
          "firebase/storage"
        );
        const { storage } = await import("@/lib/firebase");

        const videoRef = ref(storage, videoPath);

        // Use uploadBytesResumable for progress tracking
        const videoUrl = await new Promise<string>((resolve, reject) => {
          const uploadTask = uploadBytesResumable(videoRef, result.blob);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Map upload progress from 80% to 100%
              const uploadPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const overallProgress = 80 + (uploadPercent * 0.2); // 80% + (0-20%)
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

        await onUpload({
          type: "video",
          url: videoUrl,
          thumbnailUrl,
          title: title.trim(),
          description: description.trim() || undefined,
          grades,
        });

        toast.success(
          `הסרטון הועלה בהצלחה (${formatFileSize(
            result.originalSize
          )} → ${formatFileSize(result.compressedSize)})`
        );
      }

      // Cleanup
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "שגיאה בהעלאה");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setCompressionProgress(null);
    }
  };

  // Mode selection screen
  if (!mode) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4 text-right">
          הוסף מדיה חדשה
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setMode("image")}
            className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <ImageIcon className="w-8 h-8 text-blue-500" />
            <span className="text-sm font-medium">תמונה</span>
          </button>
          <button
            onClick={() => setMode("video")}
            className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <Video className="w-8 h-8 text-purple-500" />
            <span className="text-sm font-medium">סרטון</span>
          </button>
          <button
            onClick={() => setMode("youtube")}
            className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
          >
            <Youtube className="w-8 h-8 text-red-500" />
            <span className="text-sm font-medium">YouTube</span>
          </button>
        </div>
        <button
          onClick={onCancel}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 w-full text-center"
        >
          ביטול
        </button>
      </div>
    );
  }

  // Upload form
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onCancel}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">
          {mode === "image" && "העלאת תמונה"}
          {mode === "video" && "העלאת סרטון"}
          {mode === "youtube" && "הוספת סרטון YouTube"}
        </h2>
      </div>

      <div className="space-y-4">
        {/* File/URL input */}
        {mode === "youtube" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
              קישור YouTube
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left"
              dir="ltr"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
              {mode === "image" ? "תמונה" : "סרטון"}
            </label>
            {filePreview ? (
              <div className="relative">
                {mode === "image" ? (
                  <img
                    src={filePreview}
                    alt="תצוגה מקדימה"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={filePreview}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}
                <button
                  onClick={() => {
                    URL.revokeObjectURL(filePreview);
                    setFilePreview(null);
                    setSelectedFile(null);
                  }}
                  className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full z-20"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
                {isUploading && mode === "image" && !compressionProgress && (
                  <UploadOverlay progress={uploadProgress} />
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 flex flex-col items-center justify-center gap-2"
                  disabled={isUploading}
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    לחץ לבחירת {mode === "image" ? "תמונה" : "סרטון"}
                  </span>
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={mode === "image" ? "image/*" : "video/*"}
              onChange={handleFileSelect}
              className="hidden"
            />
            {mode === "video" && (
              <p className="text-xs text-gray-500 mt-1 text-right">
                מקסימום 3 דקות. הסרטון יכווץ אוטומטית ל-720p.
              </p>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
            כותרת *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right"
            placeholder="הזן כותרת..."
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
            תיאור (אופציונלי)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right resize-none"
            rows={2}
            placeholder="הזן תיאור..."
          />
        </div>

        {/* Grade selection */}
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

        {/* Compression progress */}
        {compressionProgress && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-700">
                  {compressionProgress.message}
                </p>
                <div className="mt-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${compressionProgress.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSubmit} disabled={isUploading} className="flex-1">
            {isUploading ? "מעלה..." : "העלה"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setMode(null)}
            disabled={isUploading}
          >
            חזרה
          </Button>
        </div>
      </div>
    </div>
  );
}
