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
 * Deduplicates an array of items by id, keeping the first occurrence.
 */
function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * Merges saved config with defaults to handle new features gracefully.
 * If saved config is missing properties, they get filled from defaults.
 * Also deduplicates cards/links arrays to prevent duplicate items.
 */
export function mergeWithDefaults(saved: VisibilityConfig | null): VisibilityConfig {
  if (!saved) return DEFAULT_VISIBILITY_CONFIG;

  // Merge dashboards: keep saved cards + add any new cards from defaults
  const mergeDashboard = (defaultDash: typeof DEFAULT_VISIBILITY_CONFIG.dashboards.teacher, savedDash?: typeof saved.dashboards.teacher) => {
    if (!savedDash?.cards) return { intro: defaultDash.intro, cards: defaultDash.cards };

    // Get IDs of saved cards
    const savedIds = new Set(savedDash.cards.map(c => c.id));

    // Find new cards in defaults that aren't in saved (add at end with next order)
    const maxOrder = Math.max(...savedDash.cards.map(c => c.order), -1);
    const newCards = defaultDash.cards
      .filter(c => !savedIds.has(c.id))
      .map((c, i) => ({ ...c, order: maxOrder + 1 + i }));

    return {
      intro: savedDash?.intro ?? defaultDash.intro,
      cards: deduplicateById([...savedDash.cards, ...newCards]),
    };
  };

  // Merge sidebars: keep saved links + add any new links from defaults
  const mergeSidebar = (defaultSidebar: typeof DEFAULT_VISIBILITY_CONFIG.sidebars.teacher, savedSidebar?: typeof saved.sidebars.teacher) => {
    if (!savedSidebar?.links) return { links: defaultSidebar.links };

    // Get IDs of saved links
    const savedIds = new Set(savedSidebar.links.map(l => l.id));

    // Find new links in defaults that aren't in saved
    const newLinks = defaultSidebar.links.filter(l => !savedIds.has(l.id));

    // Combine: saved links first, then new links at the end
    return {
      links: deduplicateById([...savedSidebar.links, ...newLinks]),
    };
  };

  const merged: VisibilityConfig = {
    dashboards: {
      teacher: mergeDashboard(DEFAULT_VISIBILITY_CONFIG.dashboards.teacher, saved.dashboards?.teacher),
      parent: mergeDashboard(DEFAULT_VISIBILITY_CONFIG.dashboards.parent, saved.dashboards?.parent),
      student: mergeDashboard(DEFAULT_VISIBILITY_CONFIG.dashboards.student, saved.dashboards?.student),
    },
    sidebars: {
      teacher: mergeSidebar(DEFAULT_VISIBILITY_CONFIG.sidebars.teacher, saved.sidebars?.teacher),
      parent: mergeSidebar(DEFAULT_VISIBILITY_CONFIG.sidebars.parent, saved.sidebars?.parent),
      student: mergeSidebar(DEFAULT_VISIBILITY_CONFIG.sidebars.student, saved.sidebars?.student),
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
