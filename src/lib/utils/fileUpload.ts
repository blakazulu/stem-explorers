import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];

function getFileExtension(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return ext;
}

function isAllowedFile(file: File): boolean {
  const extension = getFileExtension(file.name);
  return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension);
}

export async function uploadDocument(
  file: File,
  folder: string
): Promise<string> {
  if (!isAllowedFile(file)) {
    throw new Error("סוג קובץ לא נתמך. יש להעלות קובץ PDF או Word בלבד.");
  }

  const extension = getFileExtension(file.name);
  const path = `${folder}/${Date.now()}${extension}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
