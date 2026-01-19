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
