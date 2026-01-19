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
