"use client";

import { Trash2, Plus, X } from "lucide-react";
import type { SortContent, SortItem } from "@/types/games";

interface SortContentEditorProps {
  content: SortContent;
  onEdit: (updates: Partial<SortContent>) => void;
  onDelete: () => void;
  isNew: boolean;
}

export function SortContentEditor({
  content,
  onEdit,
  onDelete,
  isNew,
}: SortContentEditorProps) {
  // Handle bucket name change
  const handleBucketChange = (index: number, value: string) => {
    const newBuckets = [...content.buckets];
    const oldBucket = newBuckets[index];
    newBuckets[index] = value;

    // Update items that reference the old bucket name
    const newItems = content.items.map((item) =>
      item.correctBucket === oldBucket ? { ...item, correctBucket: value } : item
    );

    onEdit({ buckets: newBuckets, items: newItems });
  };

  // Handle adding a new bucket
  const handleAddBucket = () => {
    onEdit({ buckets: [...content.buckets, ""] });
  };

  // Handle removing a bucket
  const handleRemoveBucket = (index: number) => {
    if (content.buckets.length <= 2) return; // Minimum 2 buckets
    const removedBucket = content.buckets[index];
    const newBuckets = content.buckets.filter((_, i) => i !== index);

    // Remove items that belong to the removed bucket or clear their bucket
    const newItems = content.items.map((item) =>
      item.correctBucket === removedBucket
        ? { ...item, correctBucket: newBuckets[0] || "" }
        : item
    );

    onEdit({ buckets: newBuckets, items: newItems });
  };

  // Handle item text change
  const handleItemTextChange = (index: number, value: string) => {
    const newItems = content.items.map((item, i) =>
      i === index ? { ...item, text: value } : item
    );
    onEdit({ items: newItems });
  };

  // Handle item bucket change
  const handleItemBucketChange = (index: number, value: string) => {
    const newItems = content.items.map((item, i) =>
      i === index ? { ...item, correctBucket: value } : item
    );
    onEdit({ items: newItems });
  };

  // Handle adding a new item
  const handleAddItem = () => {
    const newItem: SortItem = {
      text: "",
      correctBucket: content.buckets[0] || "",
    };
    onEdit({ items: [...content.items, newItem] });
  };

  // Handle removing an item
  const handleRemoveItem = (index: number) => {
    if (content.items.length <= 1) return; // Minimum 1 item
    const newItems = content.items.filter((_, i) => i !== index);
    onEdit({ items: newItems });
  };

  return (
    <div
      className={`
        p-4 rounded-xl border-2
        ${isNew ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200 bg-white"}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-4">
          {/* Buckets section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              קטגוריות (קבוצות):
            </label>
            <div className="space-y-2">
              {content.buckets.map((bucket, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bucket}
                    onChange={(e) => handleBucketChange(index, e.target.value)}
                    placeholder={`קטגוריה ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    dir="rtl"
                  />
                  {content.buckets.length > 2 && (
                    <button
                      onClick={() => handleRemoveBucket(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      title="הסר קטגוריה"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {content.buckets.length < 4 && (
                <button
                  onClick={handleAddBucket}
                  className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-150 flex items-center justify-center gap-1"
                >
                  <Plus size={14} />
                  הוסף קטגוריה
                </button>
              )}
            </div>
          </div>

          {/* Items section */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              פריטים למיון ({content.items.filter((i) => i.text.trim()).length}):
            </label>
            <div className="space-y-2">
              {content.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => handleItemTextChange(index, e.target.value)}
                    placeholder={`פריט ${index + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    dir="rtl"
                  />
                  <select
                    value={item.correctBucket}
                    onChange={(e) => handleItemBucketChange(index, e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white min-w-[120px]"
                    dir="rtl"
                  >
                    {content.buckets.map((bucket, bucketIndex) => (
                      <option key={bucketIndex} value={bucket}>
                        {bucket || `קטגוריה ${bucketIndex + 1}`}
                      </option>
                    ))}
                  </select>
                  {content.items.length > 1 && (
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                      title="הסר פריט"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddItem}
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-150 flex items-center justify-center gap-1"
              >
                <Plus size={14} />
                הוסף פריט
              </button>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="מחק סט"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {isNew && (
        <div className="mt-3 text-xs text-indigo-600 font-medium">
          פריט חדש - יישמר כשתלחץ על &quot;שמור שינויים&quot;
        </div>
      )}
    </div>
  );
}
