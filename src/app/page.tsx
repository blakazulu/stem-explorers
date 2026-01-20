"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Users, Heart, Images, CalendarHeart } from "lucide-react";

// Glowing LED bubble card component
function GlowingBubble({
  title,
  icon: IconComponent,
  href,
  color,
  delay,
}: {
  title: string;
  icon: typeof GraduationCap;
  href: string;
  color: "green" | "blue" | "orange" | "teal" | "pink";
  delay: number;
}) {
  const colorStyles = {
    green: {
      bg: "from-emerald-400/70 via-emerald-500/70 to-emerald-600/70",
      glow: "shadow-[0_0_40px_15px_rgba(52,211,153,0.5)] md:shadow-[0_0_60px_20px_rgba(52,211,153,0.5)]",
      hoverGlow: "group-hover:shadow-[0_0_60px_20px_rgba(52,211,153,0.7)] md:group-hover:shadow-[0_0_80px_30px_rgba(52,211,153,0.7)]",
      border: "border-emerald-300/60",
      innerGlow: "bg-emerald-300/30",
    },
    blue: {
      bg: "from-blue-400/70 via-blue-500/70 to-blue-600/70",
      glow: "shadow-[0_0_40px_15px_rgba(59,130,246,0.5)] md:shadow-[0_0_60px_20px_rgba(59,130,246,0.5)]",
      hoverGlow: "group-hover:shadow-[0_0_60px_20px_rgba(59,130,246,0.7)] md:group-hover:shadow-[0_0_80px_30px_rgba(59,130,246,0.7)]",
      border: "border-blue-300/60",
      innerGlow: "bg-blue-300/30",
    },
    orange: {
      bg: "from-amber-400/70 via-orange-500/70 to-orange-600/70",
      glow: "shadow-[0_0_40px_15px_rgba(251,146,60,0.5)] md:shadow-[0_0_60px_20px_rgba(251,146,60,0.5)]",
      hoverGlow: "group-hover:shadow-[0_0_60px_20px_rgba(251,146,60,0.7)] md:group-hover:shadow-[0_0_80px_30px_rgba(251,146,60,0.7)]",
      border: "border-amber-300/60",
      innerGlow: "bg-amber-300/30",
    },
    teal: {
      bg: "from-teal-400/70 via-teal-500/70 to-teal-600/70",
      glow: "shadow-[0_0_40px_15px_rgba(45,212,191,0.5)] md:shadow-[0_0_60px_20px_rgba(45,212,191,0.5)]",
      hoverGlow: "group-hover:shadow-[0_0_60px_20px_rgba(45,212,191,0.7)] md:group-hover:shadow-[0_0_80px_30px_rgba(45,212,191,0.7)]",
      border: "border-teal-300/60",
      innerGlow: "bg-teal-300/30",
    },
    pink: {
      bg: "from-pink-400/70 via-pink-500/70 to-pink-600/70",
      glow: "shadow-[0_0_40px_15px_rgba(236,72,153,0.5)] md:shadow-[0_0_60px_20px_rgba(236,72,153,0.5)]",
      hoverGlow: "group-hover:shadow-[0_0_60px_20px_rgba(236,72,153,0.7)] md:group-hover:shadow-[0_0_80px_30px_rgba(236,72,153,0.7)]",
      border: "border-pink-300/60",
      innerGlow: "bg-pink-300/30",
    },
  };

  const styles = colorStyles[color];

  return (
    <Link
      href={href}
      className="animate-portal-appear group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Main bubble */}
      <div
        className={`
          relative w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44
          rounded-full
          bg-gradient-to-br ${styles.bg}
          ${styles.glow} ${styles.hoverGlow}
          border-2 ${styles.border}
          flex flex-col items-center justify-center
          transition-all duration-500
          group-hover:scale-110
          backdrop-blur-sm
        `}
      >
        {/* Glass shine - top left highlight */}
        <div className="absolute top-2 left-3 sm:top-3 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/50 rounded-full blur-md" />
        <div className="absolute top-3 left-4 sm:top-4 sm:left-5 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-white/70 rounded-full blur-sm" />

        {/* Inner glow */}
        <div className={`absolute inset-3 sm:inset-4 rounded-full ${styles.innerGlow} blur-xl`} />

        {/* Bottom shadow for 3D depth */}
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 -15px 30px rgba(0,0,0,0.2)' }} />

        {/* Icon */}
        <div className="relative z-10 mb-0.5 sm:mb-1 md:mb-2">
          <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 lg:w-11 lg:h-11 text-white drop-shadow-lg" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <span className="relative z-10 text-white font-rubik font-bold text-sm sm:text-base md:text-lg lg:text-xl drop-shadow-lg">
          {title}
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      router.push(`/${session.user.role}`);
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="text-primary text-lg animate-pulse">טוען...</div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Background image */}
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

      {/* Desktop Layout */}
      <div className="hidden lg:flex relative z-10 h-full flex-col items-center justify-center p-4">
        {/* Title */}
        <h1
          className="text-5xl xl:text-6xl font-playpen text-indigo-900 mb-4 animate-fade-in"
          style={{ textShadow: '0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.2)' }}
        >
          מרכז למידה בית ספרי
        </h1>

        {/* Logo */}
        <div className="relative flex items-center justify-center pointer-events-none mb-6">
          <div className="absolute w-[300px] h-[300px] bg-white/60 rounded-full blur-3xl" />
          <div className="relative animate-scale-in">
            <Image
              src="/logo/logo-full.png"
              alt="חוקרי STEM"
              width={280}
              height={280}
              className="relative w-[280px] h-[280px] object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>

        {/* Bubble Cards - 3x2 grid */}
        <div className="flex flex-col items-center gap-5">
          {/* Top row - 3 bubbles */}
          <div className="flex gap-6 xl:gap-8">
            <GlowingBubble title="תלמידים" icon={GraduationCap} href="/login?type=student" color="green" delay={100} />
            <GlowingBubble title="צוות" icon={Users} href="/login?type=staff" color="blue" delay={200} />
            <GlowingBubble title="הורים" icon={Heart} href="/login?type=parent" color="orange" delay={300} />
          </div>
          {/* Bottom row - 2 bubbles centered */}
          <div className="flex gap-6 xl:gap-8">
            <GlowingBubble title="גלריה" icon={Images} href="/gallery" color="teal" delay={400} />
            <GlowingBubble title="בקהילה" icon={CalendarHeart} href="/community" color="pink" delay={500} />
          </div>
        </div>

        {/* Footer */}
        <p className="absolute bottom-4 text-sm text-gray-500">
          חוקרי STEM • מרחב למידה לבית ספר יסודי
        </p>
      </div>

      {/* Mobile/Tablet Layout - Full height, no scroll */}
      <div className="lg:hidden relative z-10 h-full flex flex-col">
        {/* Top half - Logo */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          {/* Title */}
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-playpen text-indigo-900 mb-2 sm:mb-4 animate-fade-in text-center"
            style={{ textShadow: '0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.2)' }}
          >
            מרכז למידה בית ספרי
          </h1>

          {/* Logo */}
          <div className="relative flex items-center justify-center pointer-events-none">
            <div className="absolute w-56 h-56 md:w-64 md:h-64 bg-white/60 rounded-full blur-3xl" />
            <div className="relative animate-scale-in">
              <Image
                src="/logo/logo-full.png"
                alt="חוקרי STEM"
                width={512}
                height={512}
                className="relative w-56 h-56 md:w-64 md:h-64 object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Bottom half - Bubbles in 3x2 grid */}
        <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
          <div className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
            {/* Top row - 3 bubbles */}
            <div className="flex gap-2 sm:gap-3 md:gap-4">
              <GlowingBubble title="תלמידים" icon={GraduationCap} href="/login?type=student" color="green" delay={100} />
              <GlowingBubble title="צוות" icon={Users} href="/login?type=staff" color="blue" delay={200} />
              <GlowingBubble title="הורים" icon={Heart} href="/login?type=parent" color="orange" delay={300} />
            </div>
            {/* Bottom row - 2 bubbles centered */}
            <div className="flex gap-2 sm:gap-3 md:gap-4">
              <GlowingBubble title="גלריה" icon={Images} href="/gallery" color="teal" delay={400} />
              <GlowingBubble title="בקהילה" icon={CalendarHeart} href="/community" color="pink" delay={500} />
            </div>
          </div>

          {/* Footer */}
          <p className="mt-auto pb-2 text-xs sm:text-sm text-gray-500 text-center">
            חוקרי STEM • מרחב למידה לבית ספר יסודי
          </p>
        </div>
      </div>
    </div>
  );
}
