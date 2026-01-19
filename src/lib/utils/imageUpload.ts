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
  path: string,
  maxWidth?: number
): Promise<string> {
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const resized = await resizeImage(file, maxWidth);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, resized);
  return getDownloadURL(storageRef);
}

export async function uploadImageWithProgress(
  file: File,
  path: string,
  onProgress?: (percent: number) => void,
  maxWidth?: number
): Promise<string> {
  const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const resized = await resizeImage(file, maxWidth);
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, resized);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(percent);
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
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function isImageFile(file: File): boolean {
  return IMAGE_TYPES.includes(file.type);
}

export function isDocumentFile(file: File): boolean {
  return DOCUMENT_TYPES.includes(file.type);
}

export function isValidResourceFile(file: File): boolean {
  return isImageFile(file) || isDocumentFile(file);
}

export async function uploadResourceFile(
  file: File,
  path: string
): Promise<string> {
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  let uploadData: Blob | File = file;

  // Compress images, upload documents as-is
  if (isImageFile(file)) {
    uploadData = await resizeImage(file);
  }

  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, uploadData);
  return getDownloadURL(storageRef);
}

export async function uploadResourceFileWithProgress(
  file: File,
  path: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  let uploadData: Blob | File = file;

  // Compress images, upload documents as-is
  if (isImageFile(file)) {
    uploadData = await resizeImage(file);
  }

  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, uploadData);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(percent);
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
}

export async function deleteStorageFile(path: string): Promise<void> {
  const { ref, deleteObject } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
