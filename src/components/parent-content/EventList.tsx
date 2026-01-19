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
