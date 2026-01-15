import { imageConfig } from "@/lib/config/image";

export async function resizeImage(
  file: File,
  maxWidth: number = imageConfig.maxWidth
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Store the object URL so we can revoke it later to prevent memory leak
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Revoke the object URL to free memory
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        },
        imageConfig.format,
        imageConfig.quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const resized = await resizeImage(file);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, resized);
  return getDownloadURL(storageRef);
}
