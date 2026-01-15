"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Users, Heart, Images } from "lucide-react";

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
  color: "green" | "blue" | "orange" | "teal";
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
    <div className="min-h-screen relative overflow-hidden">
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col p-4">
        {/* Title at top */}
        <header className="pt-2 sm:pt-4 md:pt-6 lg:pt-8 text-center animate-fade-in">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-playpen text-indigo-900"
            style={{ textShadow: '0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.2)' }}
          >
            מרכז למידה בית ספרי
          </h1>
        </header>

        {/* Main area with logo and cards */}
        <main className="relative flex-1 flex flex-col items-center justify-center gap-6 md:gap-8 lg:gap-0">
          {/* Mobile/Tablet: Stacked layout | Desktop: Radial layout */}

          {/* Logo section */}
          <div className="relative flex items-center justify-center pointer-events-none lg:z-10">
            {/* Logo glow background */}
            <div className="absolute w-40 h-40 sm:w-56 sm:h-56 md:w-[320px] md:h-[320px] lg:w-[450px] lg:h-[450px] bg-white/60 rounded-full blur-3xl" />

            {/* Logo - mobile:160, sm:224, md:380, lg:512 */}
            <div className="relative animate-scale-in">
              <Image
                src="/logo/logo-full.png"
                alt="חוקרי STEM"
                width={512}
                height={512}
                className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-[380px] md:h-[380px] lg:w-[512px] lg:h-[512px] object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Bubble Cards Grid - 2x2 on mobile, radial on lg */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:absolute lg:inset-0 lg:grid-cols-1 lg:gap-0">
            {/* Students - TOP RIGHT on desktop */}
            <div className="flex justify-center lg:absolute lg:top-[10%] lg:right-[10%]">
              <GlowingBubble
                title="תלמידים"
                icon={GraduationCap}
                href="/login"
                color="green"
                delay={100}
              />
            </div>

            {/* Staff - TOP LEFT on desktop */}
            <div className="flex justify-center lg:absolute lg:top-[10%] lg:left-[10%]">
              <GlowingBubble
                title="צוות"
                icon={Users}
                href="/login"
                color="blue"
                delay={200}
              />
            </div>

            {/* Parents - BOTTOM LEFT on desktop */}
            <div className="flex justify-center lg:absolute lg:bottom-[10%] lg:left-[10%]">
              <GlowingBubble
                title="הורים"
                icon={Heart}
                href="/login"
                color="orange"
                delay={300}
              />
            </div>

            {/* Gallery - BOTTOM RIGHT on desktop */}
            <div className="flex justify-center lg:absolute lg:bottom-[10%] lg:right-[10%]">
              <GlowingBubble
                title="גלריה"
                icon={Images}
                href="/gallery"
                color="teal"
                delay={400}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 text-center">
        <p className="text-xs sm:text-sm md:text-base text-gray-500">
          חוקרי STEM • מרחב למידה לבית ספר יסודי
        </p>
      </div>
    </div>
  );
}
