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
import { GripVertical } from "lucide-react";
import type { DashboardCardConfig } from "@/types";

interface DraggableCardListProps {
  cards: DashboardCardConfig[];
  cardLabels: Record<string, string>;
  onChange: (cards: DashboardCardConfig[]) => void;
}

interface SortableItemProps {
  card: DashboardCardConfig;
  label: string;
  onToggle: (id: string) => void;
}

function SortableItem({ card, label, onToggle }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3 bg-white border rounded-lg
        ${isDragging ? "shadow-lg border-primary z-10" : "border-surface-2"}
        ${!card.visible ? "opacity-50" : ""}
      `}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        aria-label="גרור לשינוי סדר"
      >
        <GripVertical size={20} />
      </button>

      <label className="flex items-center gap-3 flex-1 cursor-pointer">
        <input
          type="checkbox"
          checked={card.visible}
          onChange={() => onToggle(card.id)}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
        />
        <span className={card.visible ? "text-foreground" : "text-gray-400"}>
          {label}
        </span>
      </label>

      {!card.visible && (
        <span className="text-xs text-gray-400">(מוסתר)</span>
      )}
    </div>
  );
}

export function DraggableCardList({ cards, cardLabels, onChange }: DraggableCardListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((c) => c.id === active.id);
      const newIndex = cards.findIndex((c) => c.id === over.id);

      const newCards = arrayMove(cards, oldIndex, newIndex).map((card, index) => ({
        ...card,
        order: index,
      }));

      onChange(newCards);
    }
  };

  const handleToggle = (id: string) => {
    const newCards = cards.map((card) =>
      card.id === id ? { ...card, visible: !card.visible } : card
    );
    onChange(newCards);
  };

  // Sort cards by order for display
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortedCards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {sortedCards.map((card) => (
            <SortableItem
              key={card.id}
              card={card}
              label={cardLabels[card.id] || card.id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
