# Parent Content Admin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build admin page "תוכן הורים" for managing intro text and events on two parent-facing pages (פעילויות קהילתיות and STEM במשפחה).

**Architecture:** Two Firestore documents store content for each page. Admin manages via tabbed interface with drag-and-drop event reordering. Parents view content in timeline layout.

**Tech Stack:** Next.js App Router, TypeScript, Firestore, React Query, @dnd-kit/core for drag-and-drop, existing image upload utilities.

---

## Task 1: Types

**Files:**
- Create: `src/types/parentContent.ts`
- Modify: `src/types/index.ts`

**Step 1: Create types file**

```typescript
// src/types/parentContent.ts
import type { Timestamp } from "firebase/firestore";

export type ParentContentPageId = "community-activities" | "stem-family";

export interface ParentContentEvent {
  id: string;
  title: string;
  description: string;
  date?: string; // ISO date string YYYY-MM-DD
  imageUrl?: string;
  linkUrl?: string;
  createdAt: Date;
}

export interface ParentContentDocument {
  intro: string;
  events: ParentContentEvent[];
  updatedAt: Date;
}

// For Firestore operations (with Timestamp)
export interface ParentContentDocumentFirestore {
  intro: string;
  events: Array<Omit<ParentContentEvent, "createdAt"> & { createdAt: Timestamp }>;
  updatedAt: Timestamp;
}
```

**Step 2: Export from index**

Add to `src/types/index.ts`:
```typescript
// Parent Content
export type {
  ParentContentPageId,
  ParentContentEvent,
  ParentContentDocument,
} from "./parentContent";
```

**Step 3: Commit**

```bash
git add src/types/parentContent.ts src/types/index.ts
git commit -m "feat(parent-content): add types for parent content pages"
```

---

## Task 2: Firestore Service

**Files:**
- Create: `src/lib/services/parentContent.ts`

**Step 1: Create service file**

```typescript
// src/lib/services/parentContent.ts
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { handleFirebaseError } from "@/lib/utils/errors";
import type {
  ParentContentPageId,
  ParentContentDocument,
  ParentContentEvent,
} from "@/types";

const COLLECTION = "parentContent";

// Helper to extract storage path from Firebase download URL
function getStoragePathFromUrl(url: string): string | null {
  const match = url.match(/\/o\/(.+?)\?/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

// Convert Firestore document to typed object
function convertDocument(data: Record<string, unknown>): ParentContentDocument {
  const events = (data.events as Array<Record<string, unknown>> || []).map((e) => ({
    id: e.id as string,
    title: e.title as string,
    description: e.description as string,
    date: e.date as string | undefined,
    imageUrl: e.imageUrl as string | undefined,
    linkUrl: e.linkUrl as string | undefined,
    createdAt: (e.createdAt as Timestamp)?.toDate() || new Date(),
  }));

  return {
    intro: (data.intro as string) || "",
    events,
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
  };
}

// Get content for a page (creates default if doesn't exist)
export async function getParentContent(
  pageId: ParentContentPageId
): Promise<ParentContentDocument> {
  try {
    const docRef = doc(db, COLLECTION, pageId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      // Create default document
      const defaultDoc: ParentContentDocument = {
        intro: "",
        events: [],
        updatedAt: new Date(),
      };
      await setDoc(docRef, {
        intro: "",
        events: [],
        updatedAt: serverTimestamp(),
      });
      return defaultDoc;
    }

    return convertDocument(snapshot.data());
  } catch (error) {
    handleFirebaseError(error, "getParentContent");
    throw error;
  }
}

// Update intro text
export async function updateParentContentIntro(
  pageId: ParentContentPageId,
  intro: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, pageId);
    await setDoc(
      docRef,
      {
        intro,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirebaseError(error, "updateParentContentIntro");
    throw error;
  }
}

// Update events array (for add, edit, delete, reorder)
export async function updateParentContentEvents(
  pageId: ParentContentPageId,
  events: ParentContentEvent[]
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, pageId);
    // Convert dates to Timestamps for Firestore
    const firestoreEvents = events.map((e) => ({
      ...e,
      createdAt: Timestamp.fromDate(e.createdAt),
    }));
    await setDoc(
      docRef,
      {
        events: firestoreEvents,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirebaseError(error, "updateParentContentEvents");
    throw error;
  }
}

// Delete image from storage (call when deleting event with image)
export async function deleteParentContentImage(imageUrl: string): Promise<void> {
  try {
    const storagePath = getStoragePathFromUrl(imageUrl);
    if (storagePath) {
      const fileRef = ref(storage, storagePath);
      await deleteObject(fileRef);
    }
  } catch (error) {
    // Log but don't throw - image might not exist
    console.error("Failed to delete parent content image:", error);
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/services/parentContent.ts
git commit -m "feat(parent-content): add Firestore service"
```

---

## Task 3: React Query Hooks

**Files:**
- Modify: `src/lib/queries/keys.ts`
- Create: `src/lib/queries/parentContent.ts`
- Modify: `src/lib/queries/index.ts`

**Step 1: Add query keys**

Add to `src/lib/queries/keys.ts` before the closing brace:
```typescript
  parentContent: {
    page: (pageId: string) => ["parentContent", pageId] as const,
  },
```

**Step 2: Create hooks file**

```typescript
// src/lib/queries/parentContent.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import {
  getParentContent,
  updateParentContentIntro,
  updateParentContentEvents,
  deleteParentContentImage,
} from "@/lib/services/parentContent";
import type { ParentContentPageId, ParentContentEvent } from "@/types";

export function useParentContent(pageId: ParentContentPageId) {
  return useQuery({
    queryKey: queryKeys.parentContent.page(pageId),
    queryFn: () => getParentContent(pageId),
  });
}

export function useUpdateParentContentIntro() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pageId,
      intro,
    }: {
      pageId: ParentContentPageId;
      intro: string;
    }) => updateParentContentIntro(pageId, intro),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.parentContent.page(pageId),
      });
    },
  });
}

export function useUpdateParentContentEvents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pageId,
      events,
    }: {
      pageId: ParentContentPageId;
      events: ParentContentEvent[];
    }) => updateParentContentEvents(pageId, events),
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.parentContent.page(pageId),
      });
    },
  });
}

export function useDeleteParentContentImage() {
  return useMutation({
    mutationFn: (imageUrl: string) => deleteParentContentImage(imageUrl),
  });
}
```

**Step 3: Export from index**

Add to `src/lib/queries/index.ts`:
```typescript
// Parent Content
export {
  useParentContent,
  useUpdateParentContentIntro,
  useUpdateParentContentEvents,
  useDeleteParentContentImage,
} from "./parentContent";
```

**Step 4: Commit**

```bash
git add src/lib/queries/keys.ts src/lib/queries/parentContent.ts src/lib/queries/index.ts
git commit -m "feat(parent-content): add React Query hooks"
```

---

## Task 4: Event Form Modal Component

**Files:**
- Create: `src/components/parent-content/EventForm.tsx`

**Step 1: Create event form modal**

```typescript
// src/components/parent-content/EventForm.tsx
"use client";

import { useState, useRef } from "react";
import { Loader2, X, Upload, Link as LinkIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToastActions } from "@/components/ui/Toast";
import { processAndUploadImage } from "@/lib/utils/imageUpload";
import type { ParentContentEvent, ParentContentPageId } from "@/types";

interface EventFormProps {
  event?: ParentContentEvent;
  pageId: ParentContentPageId;
  onSave: (event: Omit<ParentContentEvent, "id" | "createdAt"> & { id?: string }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;

export function EventForm({
  event,
  pageId,
  onSave,
  onCancel,
  isLoading,
}: EventFormProps) {
  const toast = useToastActions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [date, setDate] = useState(event?.date || "");
  const [imageUrl, setImageUrl] = useState(event?.imageUrl || "");
  const [linkUrl, setLinkUrl] = useState(event?.linkUrl || "");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const eventId = event?.id || `temp-${Date.now()}`;
      const path = `parent-content/${pageId}/${eventId}`;
      const url = await processAndUploadImage(file, path);
      setImageUrl(url);
      toast.success("התמונה הועלתה בהצלחה");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("שגיאה בהעלאת התמונה");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("יש להזין כותרת");
      return;
    }
    if (!description.trim()) {
      toast.error("יש להזין תיאור");
      return;
    }
    if (linkUrl && !isValidUrl(linkUrl)) {
      toast.error("כתובת הקישור אינה תקינה");
      return;
    }

    await onSave({
      id: event?.id,
      title: title.trim(),
      description: description.trim(),
      date: date || undefined,
      imageUrl: imageUrl || undefined,
      linkUrl: linkUrl || undefined,
    });
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              {event ? "עריכת אירוע" : "הוספת אירוע"}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                כותרת *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="כותרת האירוע"
                required
              />
              <span className="text-xs text-gray-400 mt-1">
                {title.length}/{MAX_TITLE_LENGTH}
              </span>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                תיאור *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                rows={4}
                placeholder="תיאור האירוע"
                required
              />
              <span className="text-xs text-gray-400 mt-1">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={16} className="inline ml-1" />
                תאריך (אופציונלי)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Upload size={16} className="inline ml-1" />
                תמונה (אופציונלי)
              </label>
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="תצוגה מקדימה"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 left-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center gap-2 text-gray-500"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Upload size={24} />
                      <span>לחץ להעלאת תמונה</span>
                    </>
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Link URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <LinkIcon size={16} className="inline ml-1" />
                קישור (אופציונלי)
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary"
                placeholder="https://example.com"
                dir="ltr"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading || uploading}
                loading={isLoading}
                className="flex-1"
              >
                {event ? "שמור שינויים" : "הוסף אירוע"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                ביטול
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/parent-content/EventForm.tsx
git commit -m "feat(parent-content): add event form modal component"
```

---

## Task 5: Draggable Event List Component

**Files:**
- Create: `src/components/parent-content/EventList.tsx`

**Step 1: Create draggable list component**

```typescript
// src/components/parent-content/EventList.tsx
"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, Calendar, Link as LinkIcon, Image } from "lucide-react";
import type { ParentContentEvent } from "@/types";

interface EventListProps {
  events: ParentContentEvent[];
  onReorder: (events: ParentContentEvent[]) => void;
  onEdit: (event: ParentContentEvent) => void;
  onDelete: (event: ParentContentEvent) => void;
}

interface SortableEventItemProps {
  event: ParentContentEvent;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableEventItem({ event, onEdit, onDelete }: SortableEventItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("he-IL", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        p-4 bg-white border rounded-lg
        ${isDragging ? "shadow-lg border-primary z-10" : "border-surface-2"}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-1"
          aria-label="גרור לשינוי סדר"
        >
          <GripVertical size={20} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{event.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {event.description}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {event.date && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                <Calendar size={12} />
                {formatDate(event.date)}
              </span>
            )}
            {event.imageUrl && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                <Image size={12} />
                תמונה
              </span>
            )}
            {event.linkUrl && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                <LinkIcon size={12} />
                קישור
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-surface-1 rounded-lg transition-colors text-gray-400 hover:text-foreground"
            aria-label="עריכה"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
            aria-label="מחיקה"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function EventList({ events, onReorder, onEdit, onDelete }: EventListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = events.findIndex((e) => e.id === active.id);
      const newIndex = events.findIndex((e) => e.id === over.id);
      const reordered = arrayMove(events, oldIndex, newIndex);
      onReorder(reordered);
    }
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>אין אירועים</p>
        <p className="text-sm mt-1">לחץ על &quot;הוסף אירוע&quot; להתחלה</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={events.map((e) => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {events.map((event) => (
            <SortableEventItem
              key={event.id}
              event={event}
              onEdit={() => onEdit(event)}
              onDelete={() => onDelete(event)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/parent-content/EventList.tsx
git commit -m "feat(parent-content): add draggable event list component"
```

---

## Task 6: Admin Page

**Files:**
- Create: `src/app/(dashboard)/admin/parent-content/page.tsx`

**Step 1: Create admin page**

```typescript
// src/app/(dashboard)/admin/parent-content/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Check, X, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EventForm } from "@/components/parent-content/EventForm";
import { EventList } from "@/components/parent-content/EventList";
import {
  useParentContent,
  useUpdateParentContentIntro,
  useUpdateParentContentEvents,
  useDeleteParentContentImage,
} from "@/lib/queries";
import { useAuth } from "@/contexts/AuthContext";
import { useToastActions } from "@/components/ui/Toast";
import type { ParentContentPageId, ParentContentEvent } from "@/types";

type TabId = ParentContentPageId;

const TABS: { id: TabId; label: string }[] = [
  { id: "community-activities", label: "פעילויות קהילתיות" },
  { id: "stem-family", label: "STEM במשפחה" },
];

export default function AdminParentContentPage() {
  const router = useRouter();
  const { session } = useAuth();
  const toast = useToastActions();

  const [activeTab, setActiveTab] = useState<TabId>("community-activities");
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [editIntroText, setEditIntroText] = useState("");
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ParentContentEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<ParentContentEvent | null>(null);

  // Redirect non-admins
  useEffect(() => {
    if (session && session.user.role !== "admin") {
      router.replace(`/${session.user.role}`);
    }
  }, [session, router]);

  // Queries
  const { data: content, isLoading } = useParentContent(activeTab);

  // Mutations
  const updateIntro = useUpdateParentContentIntro();
  const updateEvents = useUpdateParentContentEvents();
  const deleteImage = useDeleteParentContentImage();

  // Early return for non-admins
  if (!session || session.user.role !== "admin") {
    return null;
  }

  const handleStartEditIntro = () => {
    setEditIntroText(content?.intro || "");
    setIsEditingIntro(true);
  };

  const handleCancelEditIntro = () => {
    setIsEditingIntro(false);
    setEditIntroText("");
  };

  const handleSaveIntro = async () => {
    try {
      await updateIntro.mutateAsync({
        pageId: activeTab,
        intro: editIntroText.trim(),
      });
      setIsEditingIntro(false);
      toast.success("ההקדמה נשמרה בהצלחה");
    } catch (error) {
      console.error("Save intro error:", error);
      toast.error("שגיאה בשמירת ההקדמה");
    }
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: ParentContentEvent) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleSaveEvent = async (
    eventData: Omit<ParentContentEvent, "id" | "createdAt"> & { id?: string }
  ) => {
    const currentEvents = content?.events || [];
    let newEvents: ParentContentEvent[];

    if (eventData.id) {
      // Update existing
      newEvents = currentEvents.map((e) =>
        e.id === eventData.id
          ? { ...e, ...eventData, id: e.id, createdAt: e.createdAt }
          : e
      );
    } else {
      // Add new
      const newEvent: ParentContentEvent = {
        ...eventData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };
      newEvents = [...currentEvents, newEvent];
    }

    try {
      await updateEvents.mutateAsync({
        pageId: activeTab,
        events: newEvents,
      });
      setShowEventForm(false);
      setEditingEvent(null);
      toast.success(eventData.id ? "האירוע עודכן בהצלחה" : "האירוע נוסף בהצלחה");
    } catch (error) {
      console.error("Save event error:", error);
      toast.error("שגיאה בשמירת האירוע");
    }
  };

  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;

    const currentEvents = content?.events || [];
    const newEvents = currentEvents.filter((e) => e.id !== deletingEvent.id);

    try {
      // Delete image from storage if exists
      if (deletingEvent.imageUrl) {
        await deleteImage.mutateAsync(deletingEvent.imageUrl);
      }

      await updateEvents.mutateAsync({
        pageId: activeTab,
        events: newEvents,
      });
      setDeletingEvent(null);
      toast.success("האירוע נמחק בהצלחה");
    } catch (error) {
      console.error("Delete event error:", error);
      toast.error("שגיאה במחיקת האירוע");
    }
  };

  const handleReorderEvents = async (reorderedEvents: ParentContentEvent[]) => {
    try {
      await updateEvents.mutateAsync({
        pageId: activeTab,
        events: reorderedEvents,
      });
    } catch (error) {
      console.error("Reorder events error:", error);
      toast.error("שגיאה בסידור מחדש");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-admin/10 rounded-xl">
          <Users size={24} className="text-role-admin" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            תוכן הורים
          </h1>
          <p className="text-sm text-gray-500">
            ניהול תוכן עמודי ההורים
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-gray-500 hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-64" />
        </div>
      ) : (
        <>
          {/* Intro Section */}
          <div className="p-6 bg-surface-1 rounded-2xl border border-surface-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">הקדמה</h2>
            {isEditingIntro ? (
              <div className="space-y-3">
                <textarea
                  value={editIntroText}
                  onChange={(e) => setEditIntroText(e.target.value.slice(0, 500))}
                  className="w-full p-3 rounded-lg border border-surface-3 bg-surface-0 text-foreground leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  rows={4}
                  maxLength={500}
                  autoFocus
                />
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${editIntroText.length >= 480 ? "text-amber-500" : "text-gray-400"}`}>
                    {editIntroText.length}/500
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEditIntro}
                      disabled={updateIntro.isPending}
                      rightIcon={X}
                    >
                      ביטול
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveIntro}
                      loading={updateIntro.isPending}
                      rightIcon={Check}
                    >
                      שמור
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <p className="text-foreground leading-relaxed flex-1">
                  {content?.intro || "(אין הקדמה - לחץ לעריכה)"}
                </p>
                <button
                  onClick={handleStartEditIntro}
                  className="p-2 hover:bg-surface-2 rounded-lg transition-colors text-gray-400 hover:text-foreground"
                  title="עריכת טקסט"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Events Section */}
          <div className="p-6 bg-surface-1 rounded-2xl border border-surface-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">אירועים</h2>
              <Button onClick={handleAddEvent} leftIcon={Plus} size="sm">
                הוסף אירוע
              </Button>
            </div>

            <EventList
              events={content?.events || []}
              onReorder={handleReorderEvents}
              onEdit={handleEditEvent}
              onDelete={setDeletingEvent}
            />
          </div>
        </>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          event={editingEvent || undefined}
          pageId={activeTab}
          onSave={handleSaveEvent}
          onCancel={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          isLoading={updateEvents.isPending}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingEvent}
        onCancel={() => setDeletingEvent(null)}
        onConfirm={handleDeleteEvent}
        title="מחיקת אירוע"
        message={`האם למחוק את "${deletingEvent?.title}"?`}
        confirmLabel="מחק"
        variant="danger"
      />
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/(dashboard)/admin/parent-content/page.tsx
git commit -m "feat(parent-content): add admin management page"
```

---

## Task 7: Timeline Event Card Component

**Files:**
- Create: `src/components/parent-content/EventCard.tsx`

**Step 1: Create timeline event card**

```typescript
// src/components/parent-content/EventCard.tsx
"use client";

import { Calendar, ExternalLink } from "lucide-react";
import type { ParentContentEvent } from "@/types";

interface EventCardProps {
  event: ParentContentEvent;
  isLast: boolean;
}

export function EventCard({ event, isLast }: EventCardProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("he-IL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative flex gap-4">
      {/* Timeline line and dot */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-role-parent rounded-full border-2 border-white shadow-sm z-10" />
        {!isLast && (
          <div className="w-0.5 bg-role-parent/30 flex-1 min-h-[24px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="bg-white rounded-xl border border-surface-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Date badge */}
          {event.date && (
            <div className="px-4 pt-4">
              <span className="inline-flex items-center gap-1.5 text-sm bg-role-parent/10 text-role-parent px-3 py-1 rounded-full">
                <Calendar size={14} />
                {formatDate(event.date)}
              </span>
            </div>
          )}

          {/* Image */}
          {event.imageUrl && (
            <div className="mt-3">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Text content */}
          <div className="p-4">
            <h3 className="font-semibold text-lg text-foreground">
              {event.title}
            </h3>
            <p className="text-gray-600 mt-2 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>

            {/* Link */}
            {event.linkUrl && (
              <a
                href={event.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-role-parent hover:text-role-parent/80 font-medium transition-colors"
              >
                <ExternalLink size={16} />
                לפרטים נוספים
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/parent-content/EventCard.tsx
git commit -m "feat(parent-content): add timeline event card component"
```

---

## Task 8: Parent View Pages

**Files:**
- Create: `src/app/(dashboard)/parent/community-activities/page.tsx`
- Create: `src/app/(dashboard)/parent/stem-family/page.tsx`

**Step 1: Create community-activities page**

```typescript
// src/app/(dashboard)/parent/community-activities/page.tsx
"use client";

import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { EventCard } from "@/components/parent-content/EventCard";
import { useParentContent } from "@/lib/queries";

export default function CommunityActivitiesPage() {
  const { data: content, isLoading } = useParentContent("community-activities");

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-parent/10 rounded-xl">
          <Users size={24} className="text-role-parent" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            פעילויות קהילתיות
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton variant="text" className="w-full h-16" />
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-48" />
        </div>
      ) : (
        <>
          {/* Intro */}
          {content?.intro && (
            <div className="p-4 bg-role-parent/5 rounded-xl border border-role-parent/20">
              <p className="text-foreground leading-relaxed">{content.intro}</p>
            </div>
          )}

          {/* Events Timeline */}
          {content?.events && content.events.length > 0 ? (
            <div className="mt-6">
              {content.events.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isLast={index === content.events.length - 1}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="calendar"
              title="אין אירועים להצגה"
              description="אירועים חדשים יופיעו כאן"
            />
          )}
        </>
      )}
    </div>
  );
}
```

**Step 2: Create stem-family page**

```typescript
// src/app/(dashboard)/parent/stem-family/page.tsx
"use client";

import { Home } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { EventCard } from "@/components/parent-content/EventCard";
import { useParentContent } from "@/lib/queries";

export default function StemFamilyPage() {
  const { data: content, isLoading } = useParentContent("stem-family");

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-role-parent/10 rounded-xl">
          <Home size={24} className="text-role-parent" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            STEM במשפחה
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton variant="text" className="w-full h-16" />
          <Skeleton variant="card" className="h-48" />
          <Skeleton variant="card" className="h-48" />
        </div>
      ) : (
        <>
          {/* Intro */}
          {content?.intro && (
            <div className="p-4 bg-role-parent/5 rounded-xl border border-role-parent/20">
              <p className="text-foreground leading-relaxed">{content.intro}</p>
            </div>
          )}

          {/* Events Timeline */}
          {content?.events && content.events.length > 0 ? (
            <div className="mt-6">
              {content.events.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isLast={index === content.events.length - 1}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="home"
              title="אין אירועים להצגה"
              description="אירועים חדשים יופיעו כאן"
            />
          )}
        </>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/(dashboard)/parent/community-activities/page.tsx src/app/(dashboard)/parent/stem-family/page.tsx
git commit -m "feat(parent-content): add parent view pages"
```

---

## Task 9: Add Sidebar Link

**Files:**
- Modify: `src/components/dashboard/Sidebar.tsx`

**Step 1: Add nav item for admin**

In `src/components/dashboard/Sidebar.tsx`, find the `navItems` array (around line 44) and add a new entry after the forum entries (around line 51):

```typescript
  { label: "תוכן הורים", href: "/parent-content", roles: ["admin"], icon: Users },
```

Add `Users` to the imports from lucide-react if not already imported.

**Step 2: Commit**

```bash
git add src/components/dashboard/Sidebar.tsx
git commit -m "feat(parent-content): add sidebar link for admin"
```

---

## Task 10: Update CHANGELOG

**Files:**
- Modify: `CHANGELOG.md`

**Step 1: Add changelog entry**

Add under `[Unreleased]` in the `Added` section:

```markdown
### Added
- Parent content admin page ("תוכן הורים") for managing community activities and STEM family pages
- Events management with drag-and-drop reordering for parent content pages
- Timeline display of events on parent-facing pages
- Intro text editing for each parent content page
```

**Step 2: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs: update changelog for parent content feature"
```

---

## Task 11: Final Verification

**Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

**Step 2: Run lint**

```bash
npm run lint
```

Expected: No linting errors.

**Step 3: Manual testing checklist**

- [ ] Admin can access /admin/parent-content
- [ ] Tabs switch between community-activities and stem-family
- [ ] Intro text can be edited and saved
- [ ] Events can be added with title, description, date, image, link
- [ ] Events can be reordered via drag-and-drop
- [ ] Events can be edited
- [ ] Events can be deleted (with image cleanup)
- [ ] Parent can view /parent/community-activities with timeline
- [ ] Parent can view /parent/stem-family with timeline
- [ ] Empty states display correctly
- [ ] Loading skeletons display correctly

---

**Plan complete and saved to `docs/plans/2026-01-19-parent-content-implementation.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
