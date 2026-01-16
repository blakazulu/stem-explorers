import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { EmailConfig, ReportConfig, Grade, StemLink } from "@/types";

const SETTINGS_DOC = "settings";

export async function getEmailConfig(): Promise<EmailConfig | null> {
  try {
    const docRef = doc(db, SETTINGS_DOC, "emailConfig");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as EmailConfig) : null;
  } catch (error) {
    handleFirebaseError(error, "getEmailConfig");
    throw error;
  }
}

export async function saveEmailConfig(config: EmailConfig): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_DOC, "emailConfig"), config);
  } catch (error) {
    handleFirebaseError(error, "saveEmailConfig");
    throw error;
  }
}

export async function getReportConfig(): Promise<ReportConfig | null> {
  try {
    const docRef = doc(db, SETTINGS_DOC, "reportConfig");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as ReportConfig) : null;
  } catch (error) {
    handleFirebaseError(error, "getReportConfig");
    throw error;
  }
}

export async function saveReportConfig(config: ReportConfig): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_DOC, "reportConfig"), config);
  } catch (error) {
    handleFirebaseError(error, "saveReportConfig");
    throw error;
  }
}

export async function getPedagogicalIntro(grade: Grade): Promise<string | null> {
  try {
    const docRef = doc(db, SETTINGS_DOC, `pedagogicalIntro-${grade}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data().text as string) : null;
  } catch (error) {
    handleFirebaseError(error, "getPedagogicalIntro");
    throw error;
  }
}

export async function savePedagogicalIntro(grade: Grade, text: string): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_DOC, `pedagogicalIntro-${grade}`), { text });
  } catch (error) {
    handleFirebaseError(error, "savePedagogicalIntro");
    throw error;
  }
}

export type ResourceType = "training-schedule" | "timetable";

export interface ResourceFile {
  url: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
}

export async function getResourceFile(grade: Grade, type: ResourceType): Promise<ResourceFile | null> {
  try {
    const docRef = doc(db, SETTINGS_DOC, `resource-${type}-${grade}`);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      url: data.url,
      fileName: data.fileName,
      fileType: data.fileType,
      uploadedAt: data.uploadedAt?.toDate() || new Date(),
    };
  } catch (error) {
    handleFirebaseError(error, "getResourceFile");
    throw error;
  }
}

export async function saveResourceFile(
  grade: Grade,
  type: ResourceType,
  file: ResourceFile
): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_DOC, `resource-${type}-${grade}`), {
      url: file.url,
      fileName: file.fileName,
      fileType: file.fileType,
      uploadedAt: file.uploadedAt,
    });
  } catch (error) {
    handleFirebaseError(error, "saveResourceFile");
    throw error;
  }
}

export async function deleteResourceFile(grade: Grade, type: ResourceType): Promise<void> {
  try {
    await deleteDoc(doc(db, SETTINGS_DOC, `resource-${type}-${grade}`));
  } catch (error) {
    handleFirebaseError(error, "deleteResourceFile");
    throw error;
  }
}

// STEM Links
export async function getStemLinks(): Promise<StemLink[]> {
  try {
    const docRef = doc(db, SETTINGS_DOC, "stemLinks");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return [];
    const data = docSnap.data();
    return (data.links || []).map((link: Record<string, unknown>) => {
      const createdAt = link.createdAt as { toDate?: () => Date } | undefined;
      return {
        id: link.id as string,
        description: link.description as string,
        url: link.url as string,
        grade: link.grade as Grade | null,
        createdAt: createdAt?.toDate?.() || new Date(),
      };
    });
  } catch (error) {
    handleFirebaseError(error, "getStemLinks");
    throw error;
  }
}

export async function saveStemLinks(links: StemLink[]): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_DOC, "stemLinks"), { links });
  } catch (error) {
    handleFirebaseError(error, "saveStemLinks");
    throw error;
  }
}
