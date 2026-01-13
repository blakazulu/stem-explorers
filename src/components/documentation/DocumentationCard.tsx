import type { Documentation } from "@/types";

interface DocumentationCardProps {
  doc: Documentation;
  canDelete: boolean;
  onDelete: (doc: Documentation) => void;
}

export function DocumentationCard({ doc, canDelete, onDelete }: DocumentationCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      {doc.images.length > 0 && (
        <div className="aspect-video relative">
          <img
            src={doc.images[0]}
            alt={doc.text || "תיעוד"}
            className="w-full h-full object-cover"
          />
          {doc.images.length > 1 && (
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              +{doc.images.length - 1} תמונות
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        {doc.text && <p className="text-foreground mb-2">{doc.text}</p>}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{doc.teacherName}</span>
          <span>{doc.createdAt.toLocaleDateString("he-IL")}</span>
        </div>
        {canDelete && (
          <button
            onClick={() => onDelete(doc)}
            className="mt-2 text-sm text-error hover:underline"
          >
            מחק
          </button>
        )}
      </div>
    </div>
  );
}
