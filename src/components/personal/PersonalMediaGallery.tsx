"use client";

import { useState, useCallback } from "react";
import Masonry from "react-masonry-css";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PersonalMediaCard from "./PersonalMediaCard";
import VideoPlayerModal from "./VideoPlayerModal";
import { ImageCarousel } from "@/components/ui/ImageCarousel";
import type { PersonalMedia } from "@/types";

interface PersonalMediaGalleryProps {
  media: PersonalMedia[];
  isAdmin?: boolean;
  onEdit?: (media: PersonalMedia) => void;
  onDelete?: (media: PersonalMedia) => void;
  onReorder?: (media: PersonalMedia[]) => void;
}

// Breakpoints for masonry columns
const breakpointColumns = {
  default: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 1,
};

// Sortable wrapper for media card
function SortableMediaCard({
  media,
  isAdmin,
  onClick,
  onEdit,
  onDelete,
}: {
  media: PersonalMedia;
  isAdmin: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <PersonalMediaCard
        media={media}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        isAdmin={isAdmin}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function PersonalMediaGallery({
  media,
  isAdmin = false,
  onEdit,
  onDelete,
  onReorder,
}: PersonalMediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<PersonalMedia | null>(
    null
  );
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showImageCarousel, setShowImageCarousel] = useState(false);

  // Get all images for carousel
  const images = media.filter((m) => m.type === "image");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleMediaClick = useCallback(
    (item: PersonalMedia) => {
      setSelectedMedia(item);
      if (item.type === "video" || item.type === "youtube") {
        setShowVideoModal(true);
      } else {
        setShowImageCarousel(true);
      }
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = media.findIndex((m) => m.id === active.id);
        const newIndex = media.findIndex((m) => m.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(media, oldIndex, newIndex).map(
            (item, index) => ({
              ...item,
              order: index,
            })
          );
          onReorder?.(reordered);
        }
      }
    },
    [media, onReorder]
  );

  if (media.length === 0) {
    return null;
  }

  const galleryContent = (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {media.map((item) => (
        <div key={item.id} className="mb-4">
          {isAdmin && onReorder ? (
            <SortableMediaCard
              media={item}
              isAdmin={isAdmin}
              onClick={() => handleMediaClick(item)}
              onEdit={onEdit ? () => onEdit(item) : undefined}
              onDelete={onDelete ? () => onDelete(item) : undefined}
            />
          ) : (
            <PersonalMediaCard
              media={item}
              onClick={() => handleMediaClick(item)}
              isAdmin={false}
            />
          )}
        </div>
      ))}
    </Masonry>
  );

  return (
    <>
      {isAdmin && onReorder ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={media.map((m) => m.id)}
            strategy={rectSortingStrategy}
          >
            {galleryContent}
          </SortableContext>
        </DndContext>
      ) : (
        galleryContent
      )}

      {/* Video Modal */}
      {selectedMedia && (selectedMedia.type === "video" || selectedMedia.type === "youtube") && (
        <VideoPlayerModal
          isOpen={showVideoModal}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedMedia(null);
          }}
          url={selectedMedia.url}
          title={selectedMedia.title}
          type={selectedMedia.type}
        />
      )}

      {/* Image Carousel Modal */}
      {showImageCarousel && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowImageCarousel(false)}
        >
          <button
            onClick={() => setShowImageCarousel(false)}
            className="absolute top-4 left-4 p-2 text-white hover:text-gray-300 transition-colors z-10"
            aria-label="סגור"
          >
            <span className="text-3xl">&times;</span>
          </button>
          {/* Title at top */}
          {selectedMedia && (
            <div className="absolute top-4 right-4 text-white text-right z-10">
              <h3 className="text-lg font-medium">{selectedMedia.title}</h3>
              {selectedMedia.description && (
                <p className="text-sm text-gray-300 mt-1 max-w-md">
                  {selectedMedia.description}
                </p>
              )}
            </div>
          )}
          <div
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageCarousel
              images={images.map((img) => img.url)}
              initialIndex={selectedMedia ? images.findIndex((img) => img.id === selectedMedia.id) : 0}
            />
          </div>
        </div>
      )}
    </>
  );
}
