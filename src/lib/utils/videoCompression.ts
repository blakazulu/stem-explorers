import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Singleton FFmpeg instance
let ffmpeg: FFmpeg | null = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

// Maximum video duration in seconds (5 minutes)
const MAX_DURATION_SECONDS = 300;
// Maximum resolution (720p)
const MAX_HEIGHT = 720;
// CRF value for quality/size balance (lower = better quality, larger file)
const CRF_VALUE = 28;

export interface CompressionProgress {
  stage: "loading" | "analyzing" | "compressing" | "finalizing";
  progress: number; // 0-100
  message: string;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  duration: number;
}

export type ProgressCallback = (progress: CompressionProgress) => void;

/**
 * Load FFmpeg library (lazy-loaded, one-time ~25MB download)
 */
async function loadFFmpeg(onProgress?: ProgressCallback): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) {
    return ffmpeg;
  }

  if (isLoading && loadPromise) {
    await loadPromise;
    return ffmpeg!;
  }

  isLoading = true;

  loadPromise = (async () => {
    onProgress?.({
      stage: "loading",
      progress: 0,
      message: "טוען את מנוע עיבוד הוידאו...",
    });

    ffmpeg = new FFmpeg();

    // Load ffmpeg-core from CDN with CORS support
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    onProgress?.({
      stage: "loading",
      progress: 100,
      message: "מנוע הוידאו נטען בהצלחה",
    });
  })();

  try {
    await loadPromise;
  } finally {
    isLoading = false;
  }

  return ffmpeg!;
}

/**
 * Get video duration using ffprobe-style analysis
 */
async function getVideoDuration(ffmpeg: FFmpeg, inputFileName: string): Promise<number> {
  return new Promise((resolve) => {
    let duration = 0;

    // Listen for log messages to extract duration
    const logHandler = ({ message }: { message: string }) => {
      // Look for duration in format "Duration: 00:01:30.50"
      const match = message.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = parseInt(match[3], 10);
        duration = hours * 3600 + minutes * 60 + seconds;
      }
    };

    ffmpeg.on("log", logHandler);

    // Run a quick probe command
    ffmpeg.exec(["-i", inputFileName, "-f", "null", "-"]).then(() => {
      ffmpeg.off("log", logHandler);
      resolve(duration);
    }).catch(() => {
      ffmpeg.off("log", logHandler);
      resolve(duration);
    });
  });
}

/**
 * Compress a video file to 720p MP4/H.264
 *
 * @param file - The video file to compress
 * @param onProgress - Callback for progress updates
 * @returns Compressed video blob with metadata
 * @throws Error if video is too long or compression fails
 */
export async function compressVideo(
  file: File,
  onProgress?: ProgressCallback
): Promise<CompressionResult> {
  const originalSize = file.size;

  // Load FFmpeg
  const ffmpegInstance = await loadFFmpeg(onProgress);

  onProgress?.({
    stage: "analyzing",
    progress: 0,
    message: "מנתח את הסרטון...",
  });

  // Write input file to FFmpeg filesystem
  const inputFileName = "input" + getExtension(file.name);
  const outputFileName = "output.mp4";

  await ffmpegInstance.writeFile(inputFileName, await fetchFile(file));

  // Get video duration
  const duration = await getVideoDuration(ffmpegInstance, inputFileName);

  // Check duration limit
  if (duration > MAX_DURATION_SECONDS) {
    // Cleanup
    await ffmpegInstance.deleteFile(inputFileName);
    throw new Error(`הסרטון ארוך מדי (${Math.ceil(duration / 60)} דקות). מקסימום ${MAX_DURATION_SECONDS / 60} דקות.`);
  }

  onProgress?.({
    stage: "analyzing",
    progress: 100,
    message: `משך הסרטון: ${formatDuration(duration)}`,
  });

  // Set up progress tracking for compression (with cleanup)
  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.({
      stage: "compressing",
      progress: Math.min(Math.round(progress * 100), 99),
      message: `מכווץ את הסרטון... ${Math.round(progress * 100)}%`,
    });
  };
  ffmpegInstance.on("progress", progressHandler);

  // Helper to cleanup files safely
  const cleanupFiles = async () => {
    ffmpegInstance.off("progress", progressHandler);
    try {
      await ffmpegInstance.deleteFile(inputFileName);
    } catch { /* ignore - file may not exist */ }
    try {
      await ffmpegInstance.deleteFile(outputFileName);
    } catch { /* ignore - file may not exist */ }
  };

  onProgress?.({
    stage: "compressing",
    progress: 0,
    message: "מתחיל כיווץ...",
  });

  try {
    // Compress video with FFmpeg
    // -vf scale=-2:720 - Scale to 720p height, auto-calculate width (even number)
    // -c:v libx264 - Use H.264 codec
    // -crf 28 - Quality setting (lower = better, 28 is good balance)
    // -preset medium - Encoding speed/quality tradeoff
    // -c:a aac - Audio codec
    // -b:a 128k - Audio bitrate
    // -movflags +faststart - Optimize for web streaming
    await ffmpegInstance.exec([
      "-i", inputFileName,
      "-vf", `scale=-2:'min(${MAX_HEIGHT},ih)'`,
      "-c:v", "libx264",
      "-crf", String(CRF_VALUE),
      "-preset", "medium",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      "-y",
      outputFileName,
    ]);

    onProgress?.({
      stage: "finalizing",
      progress: 50,
      message: "מסיים עיבוד...",
    });

    // Read the output file
    const data = await ffmpegInstance.readFile(outputFileName);
    // Convert Uint8Array to Blob (need to handle FileData type which is Uint8Array | string)
    const compressedBlob = new Blob([data as BlobPart], { type: "video/mp4" });

    // Cleanup
    await cleanupFiles();

    onProgress?.({
      stage: "finalizing",
      progress: 100,
      message: "הסרטון דחוס בהצלחה!",
    });

    return {
      blob: compressedBlob,
      originalSize,
      compressedSize: compressedBlob.size,
      duration,
    };
  } catch (error) {
    // Cleanup on failure
    await cleanupFiles();
    throw error;
  }
}

/**
 * Check if FFmpeg is supported in the current browser
 */
export function isFFmpegSupported(): boolean {
  // Check for SharedArrayBuffer support (required for multi-threading)
  // and WebAssembly support
  return (
    typeof SharedArrayBuffer !== "undefined" &&
    typeof WebAssembly !== "undefined"
  );
}

/**
 * Get file extension from filename
 */
function getExtension(filename: string): string {
  const match = filename.match(/\.[^.]+$/);
  return match ? match[0].toLowerCase() : ".mp4";
}

/**
 * Format duration in seconds to mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Generate a thumbnail from a video file
 * Returns a WebP blob of a frame from the video
 */
export async function generateVideoThumbnail(
  file: File,
  seekTime: number = 1 // seconds into video
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const cleanup = () => {
      URL.revokeObjectURL(video.src);
    };

    video.onloadedmetadata = () => {
      // Seek to the specified time (or 10% into video if seekTime is 0)
      video.currentTime = Math.min(seekTime, video.duration * 0.1);
    };

    video.onseeked = () => {
      // Set canvas dimensions (max 400px width for thumbnail)
      const maxWidth = 400;
      const scale = Math.min(1, maxWidth / video.videoWidth);
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;

      // Draw video frame to canvas
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          cleanup();
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("יצירת תמונה ממוזערת נכשלה"));
          }
        },
        "image/webp",
        0.8
      );
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("טעינת הסרטון ליצירת תמונה ממוזערת נכשלה"));
    };

    video.src = URL.createObjectURL(file);
  });
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
