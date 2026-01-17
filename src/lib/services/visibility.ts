import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type { VisibilityConfig } from "@/types";
import { DEFAULT_VISIBILITY_CONFIG } from "@/lib/constants/visibility-defaults";

const SETTINGS_DOC = "settings";
const VISIBILITY_DOC_ID = "visibility";

/**
 * Fetches visibility config from Firestore.
 * Returns null if no config exists (will use defaults).
 */
export async function getVisibilityConfig(): Promise<VisibilityConfig | null> {
  try {
    const docRef = doc(db, SETTINGS_DOC, VISIBILITY_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docSnap.data() as VisibilityConfig;
  } catch (error) {
    handleFirebaseError(error, "getVisibilityConfig");
    throw error;
  }
}

/**
 * Saves visibility config to Firestore.
 */
export async function saveVisibilityConfig(config: VisibilityConfig): Promise<void> {
  try {
    await setDoc(doc(db, SETTINGS_DOC, VISIBILITY_DOC_ID), config);
  } catch (error) {
    handleFirebaseError(error, "saveVisibilityConfig");
    throw error;
  }
}

/**
 * Merges saved config with defaults to handle new features gracefully.
 * If saved config is missing properties, they get filled from defaults.
 */
export function mergeWithDefaults(saved: VisibilityConfig | null): VisibilityConfig {
  if (!saved) return DEFAULT_VISIBILITY_CONFIG;

  const merged: VisibilityConfig = {
    dashboards: {
      teacher: { ...DEFAULT_VISIBILITY_CONFIG.dashboards.teacher, ...saved.dashboards?.teacher },
      parent: { ...DEFAULT_VISIBILITY_CONFIG.dashboards.parent, ...saved.dashboards?.parent },
      student: { ...DEFAULT_VISIBILITY_CONFIG.dashboards.student, ...saved.dashboards?.student },
    },
    sidebars: {
      teacher: { ...DEFAULT_VISIBILITY_CONFIG.sidebars.teacher, ...saved.sidebars?.teacher },
      parent: { ...DEFAULT_VISIBILITY_CONFIG.sidebars.parent, ...saved.sidebars?.parent },
      student: { ...DEFAULT_VISIBILITY_CONFIG.sidebars.student, ...saved.sidebars?.student },
    },
    pageElements: {
      teacher: {
        ...DEFAULT_VISIBILITY_CONFIG.pageElements.teacher,
        ...saved.pageElements?.teacher,
        teachingResources: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.teacher.teachingResources, ...saved.pageElements?.teacher?.teachingResources },
        pedagogical: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.teacher.pedagogical, ...saved.pageElements?.teacher?.pedagogical },
        documentation: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.teacher.documentation, ...saved.pageElements?.teacher?.documentation },
      },
      parent: {
        ...DEFAULT_VISIBILITY_CONFIG.pageElements.parent,
        ...saved.pageElements?.parent,
        teachingResources: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.parent.teachingResources, ...saved.pageElements?.parent?.teachingResources },
        pedagogical: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.parent.pedagogical, ...saved.pageElements?.parent?.pedagogical },
        documentation: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.parent.documentation, ...saved.pageElements?.parent?.documentation },
      },
      student: {
        ...DEFAULT_VISIBILITY_CONFIG.pageElements.student,
        ...saved.pageElements?.student,
        teachingResources: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.student.teachingResources, ...saved.pageElements?.student?.teachingResources },
        pedagogical: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.student.pedagogical, ...saved.pageElements?.student?.pedagogical },
        documentation: { ...DEFAULT_VISIBILITY_CONFIG.pageElements.student.documentation, ...saved.pageElements?.student?.documentation },
      },
    },
  };

  return merged;
}
