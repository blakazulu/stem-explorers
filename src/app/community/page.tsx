"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, ExternalLink, CalendarHeart, X } from "lucide-react";
import { useParentContent } from "@/lib/queries";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ParentContentEvent } from "@/types";

function CommunityEventCard({ event, isLast }: { event: ParentContentEvent; isLast: boolean }) {
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  // Close expanded image on Escape key
  useEffect(() => {
    if (!isImageExpanded) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsImageExpanded(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isImageExpanded]);

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
        <div className="w-3 h-3 bg-pink-500 rounded-full border-2 border-white shadow-sm z-10" />
        {!isLast && (
          <div className="w-0.5 bg-pink-300 flex-1 min-h-[24px]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="relative bg-white/95 backdrop-blur-sm rounded-xl border border-pink-200/50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Date badge */}
          {event.date && (
            <div className="px-4 pt-4">
              <span className="inline-flex items-center gap-1.5 text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                <Calendar size={14} />
                {formatDate(event.date)}
              </span>
            </div>
          )}

          {/* Image thumbnail - clickable to expand */}
          {event.imageUrl && (
            <div
              className="mt-3 cursor-pointer group"
              onClick={() => setIsImageExpanded(true)}
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full max-h-96 object-contain bg-gray-50 transition-all group-hover:brightness-95"
              />
            </div>
          )}

          {/* Text content */}
          <div className="p-4">
            <h3 className="font-semibold text-lg text-gray-800">
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
                className="inline-flex items-center gap-1.5 mt-3 text-pink-600 hover:text-pink-700 font-medium transition-colors"
              >
                <ExternalLink size={16} />
                לפרטים נוספים
              </a>
            )}
          </div>

          {/* Expanded image overlay - covers entire card */}
          {event.imageUrl && isImageExpanded && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="תמונה מוגדלת"
              className="absolute inset-0 z-20 bg-black flex items-center justify-center cursor-pointer animate-fade-in"
              onClick={() => setIsImageExpanded(false)}
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsImageExpanded(false);
                }}
                className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
                aria-label="סגור תמונה"
              >
                <X size={20} className="text-gray-700" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { data: content, isLoading } = useParentContent("community-activities");

  const hasEvents = content?.events && content.events.length > 0;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background - same as home page */}
      <div className="absolute inset-0">
        <Image
          src="/bg/bg-home.webp"
          alt=""
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-amber-900/[0.08]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-gradient-to-l from-pink-100/90 via-white/90 to-pink-50/90 backdrop-blur-md shadow-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowRight size={20} />
          <span className="font-medium hidden sm:inline">חזרה לדף הבית</span>
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-rubik font-bold text-gray-800">
            פעילויות קהילתיות
          </h1>
          <div className="p-2 bg-pink-100 rounded-lg">
            <CalendarHeart size={24} className="text-pink-600" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton variant="card" className="h-48 bg-white/80" />
              <Skeleton variant="card" className="h-48 bg-white/80" />
              <Skeleton variant="card" className="h-48 bg-white/80" />
            </div>
          ) : !hasEvents ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <EmptyState
                icon="calendar"
                title="אין פעילויות כרגע"
                description="בקרוב יתווספו כאן פעילויות קהילתיות"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Intro */}
              {content?.intro && (
                <div className="p-4 md:p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-pink-200/50 shadow-sm">
                  <p className="text-gray-700 leading-relaxed">{content.intro}</p>
                </div>
              )}

              {/* Events Timeline */}
              <div className="mt-4">
                {content?.events?.map((event, index) => (
                  <CommunityEventCard
                    key={event.id}
                    event={event}
                    isLast={index === (content.events?.length ?? 0) - 1}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
