import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { ExplanationButton, EmailConfig, ReportConfig } from "@/types";

const SETTINGS_DOC = "settings";

export async function getExplanationButtons(): Promise<ExplanationButton[]> {
  try {
    const docRef = doc(db, SETTINGS_DOC, "explanationButtons");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data().buttons as ExplanationButton[]) : [];
  } catch (error) {
    handleFirebaseError(error, "getExplanationButtons");
  }
}

export async function saveExplanationButtons(buttons: ExplanationButton[]): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_DOC, "explanationButtons"), { buttons });
  } catch (error) {
    handleFirebaseError(error, "saveExplanationButtons");
  }
}

export async function getEmailConfig(): Promise<EmailConfig | null> {
  try {
    const docRef = doc(db, SETTINGS_DOC, "emailConfig");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as EmailConfig) : null;
  } catch (error) {
    handleFirebaseError(error, "getEmailConfig");
  }
}

export async function saveEmailConfig(config: EmailConfig): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_DOC, "emailConfig"), config);
  } catch (error) {
    handleFirebaseError(error, "saveEmailConfig");
  }
}

export async function getReportConfig(): Promise<ReportConfig | null> {
  try {
    const docRef = doc(db, SETTINGS_DOC, "reportConfig");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as ReportConfig) : null;
  } catch (error) {
    handleFirebaseError(error, "getReportConfig");
  }
}

export async function saveReportConfig(config: ReportConfig): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_DOC, "reportConfig"), config);
  } catch (error) {
    handleFirebaseError(error, "saveReportConfig");
  }
}
