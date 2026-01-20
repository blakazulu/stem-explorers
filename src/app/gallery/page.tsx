"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";
import { useDocumentationCountsByGrade } from "@/lib/queries";
import type { Grade } from "@/types";

const GRADES: { grade: Grade; label: string; color: string; textColor: string; badgeBg: string }[] = [
  { grade: "א", label: "כיתה א׳", color: "from-rose-200/80 to-rose-300/80", textColor: "text-rose-800", badgeBg: "bg-rose-600/80" },
  { grade: "ב", label: "כיתה ב׳", color: "from-orange-200/80 to-amber-300/80", textColor: "text-orange-800", badgeBg: "bg-orange-600/80" },
  { grade: "ג", label: "כיתה ג׳", color: "from-amber-200/80 to-yellow-300/80", textColor: "text-amber-800", badgeBg: "bg-amber-600/80" },
  { grade: "ד", label: "כיתה ד׳", color: "from-emerald-200/80 to-teal-300/80", textColor: "text-emerald-800", badgeBg: "bg-emerald-600/80" },
  { grade: "ה", label: "כיתה ה׳", color: "from-sky-200/80 to-cyan-300/80", textColor: "text-sky-800", badgeBg: "bg-sky-600/80" },
  { grade: "ו", label: "כיתה ו׳", color: "from-violet-200/80 to-purple-300/80", textColor: "text-violet-800", badgeBg: "bg-violet-600/80" },
];

export default function GalleryPage() {
  const { data: gradeCounts = {} } = useDocumentationCountsByGrade();

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
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
      <header className="relative z-10 flex items-center justify-between px-4 py-3 md:px-6 md:py-4 bg-gradient-to-l from-amber-100/90 via-white/90 to-orange-100/90 backdrop-blur-md shadow-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowRight size={20} />
          <span className="font-medium hidden sm:inline">חזרה לדף הבית</span>
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-rubik font-bold text-gray-800">
            גלריית התיעודים
          </h1>
          <Image
            src="/logo/logo-full.png"
            alt="חוקרי STEM"
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
        </div>
      </header>

      {/* Grade Grid - fills remaining space */}
      <main className="relative z-10 flex-1 p-2 md:p-4 min-h-0 flex items-center justify-center">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 place-items-center">
          {GRADES.map(({ grade, label, color, textColor, badgeBg }) => {
            const imageCount = gradeCounts[grade] || 0;
            return (
              <Link
                key={grade}
                href={`/gallery/${grade}`}
                className={`
                  w-[45vw] h-[28vh] md:w-[40vw] md:h-[28vh] lg:w-[30vw] lg:h-[40vh] max-w-[400px] max-h-[300px]
                  relative overflow-hidden rounded-2xl md:rounded-3xl
                  bg-gradient-to-br ${color}
                  backdrop-blur-sm
                  border border-white/50
                  flex flex-col items-center justify-center
                  shadow-lg shadow-black/5
                  transition-all duration-300
                  hover:scale-[1.02] hover:shadow-xl hover:border-white/70
                  active:scale-[0.98]
                  group
                `}
              >
                {/* Image count badge */}
                {imageCount > 0 && (
                  <div className={`absolute top-3 right-3 ${badgeBg} backdrop-blur-sm text-white text-xs md:text-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-md`}>
                    <Images size={14} />
                    <span>{imageCount}</span>
                  </div>
                )}

                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />

                {/* Content */}
                <div className={`relative z-10 text-center ${textColor}`}>
                  <span className="text-8xl md:text-9xl lg:text-[10rem] font-rubik font-bold">
                    {grade}
                  </span>
                  <p className="mt-2 text-xl md:text-2xl lg:text-3xl font-medium opacity-80">
                    {label}
                  </p>
                </div>

                {/* Hover indicator */}
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${textColor}`}>
                  <span className="text-sm bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full">
                    צפה בתיעודים
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
