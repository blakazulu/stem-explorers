/**
 * Image processing configuration
 * These values control how images are processed before upload
 */
export const imageConfig = {
  /**
   * Maximum width for resized images in pixels
   * Images wider than this will be scaled down proportionally
   */
  maxWidth: parseInt(process.env.NEXT_PUBLIC_IMAGE_MAX_WIDTH || "800", 10),

  /**
   * WebP compression quality (0-1)
   * Higher values = better quality but larger files
   */
  quality: parseFloat(process.env.NEXT_PUBLIC_IMAGE_QUALITY || "0.85"),

  /**
   * Output format for processed images
   */
  format: "image/webp" as const,
};
