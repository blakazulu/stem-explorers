import { Image, Calendar, User, Trash2, Images } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Documentation } from "@/types";

interface DocumentationCardProps {
  doc: Documentation;
  canDelete: boolean;
  onDelete: (doc: Documentation) => void;
  index?: number;
}

export function DocumentationCard({
  doc,
  canDelete,
  onDelete,
  index = 0,
}: DocumentationCardProps) {
  return (
    <Card
      padding="none"
      className={`group overflow-hidden animate-slide-up stagger-${Math.min(index + 1, 6)}`}
    >
      {/* Image Section */}
      {doc.images.length > 0 ? (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={doc.images[0]}
            alt={doc.text || "תיעוד"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Image count badge */}
          {doc.images.length > 1 && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-lg">
              <Images size={14} />
              {doc.images.length} תמונות
            </span>
          )}
        </div>
      ) : (
        <div className="aspect-video bg-surface-2 flex items-center justify-center">
          <Image size={48} className="text-gray-300" />
        </div>
      )}

      {/* Content Section */}
      <div className="p-4">
        {doc.text && (
          <p className="text-foreground mb-3 line-clamp-2">{doc.text}</p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <User size={14} />
            {doc.teacherName}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            {doc.createdAt.toLocaleDateString("he-IL")}
          </span>
        </div>

        {/* Delete button */}
        {canDelete && (
          <button
            onClick={() => onDelete(doc)}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-error hover:text-error/80 hover:underline cursor-pointer transition-colors"
          >
            <Trash2 size={14} />
            מחק
          </button>
        )}
      </div>
    </Card>
  );
}
