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
  position,
  delay,
}: {
  title: string;
  icon: typeof GraduationCap;
  href: string;
  color: "green" | "blue" | "orange" | "teal";
  position: string;
  delay: number;
}) {
  const colorStyles = {
    green: {
      bg: "from-emerald-400/70 via-emerald-500/70 to-emerald-600/70",
      glow: "shadow-[0_0_60px_20px_rgba(52,211,153,0.5)]",
      hoverGlow: "group-hover:shadow-[0_0_80px_30px_rgba(52,211,153,0.7)]",
      border: "border-emerald-300/60",
      innerGlow: "bg-emerald-300/30",
    },
    blue: {
      bg: "from-blue-400/70 via-blue-500/70 to-blue-600/70",
      glow: "shadow-[0_0_60px_20px_rgba(59,130,246,0.5)]",
      hoverGlow: "group-hover:shadow-[0_0_80px_30px_rgba(59,130,246,0.7)]",
      border: "border-blue-300/60",
      innerGlow: "bg-blue-300/30",
    },
    orange: {
      bg: "from-amber-400/70 via-orange-500/70 to-orange-600/70",
      glow: "shadow-[0_0_60px_20px_rgba(251,146,60,0.5)]",
      hoverGlow: "group-hover:shadow-[0_0_80px_30px_rgba(251,146,60,0.7)]",
      border: "border-amber-300/60",
      innerGlow: "bg-amber-300/30",
    },
    teal: {
      bg: "from-teal-400/70 via-teal-500/70 to-teal-600/70",
      glow: "shadow-[0_0_60px_20px_rgba(45,212,191,0.5)]",
      hoverGlow: "group-hover:shadow-[0_0_80px_30px_rgba(45,212,191,0.7)]",
      border: "border-teal-300/60",
      innerGlow: "bg-teal-300/30",
    },
  };

  const styles = colorStyles[color];

  return (
    <Link
      href={href}
      className={`absolute ${position} animate-portal-appear group z-30`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Main bubble */}
      <div
        className={`
          relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48
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
        <div className="absolute top-3 left-4 md:top-4 md:left-5 w-10 h-10 md:w-14 md:h-14 bg-white/50 rounded-full blur-md" />
        <div className="absolute top-4 left-5 md:top-5 md:left-6 w-5 h-5 md:w-7 md:h-7 bg-white/70 rounded-full blur-sm" />

        {/* Inner glow */}
        <div className={`absolute inset-4 rounded-full ${styles.innerGlow} blur-xl`} />

        {/* Bottom shadow for 3D depth */}
        <div className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 -15px 30px rgba(0,0,0,0.2)' }} />

        {/* Icon */}
        <div className="relative z-10 mb-1 md:mb-2">
          <IconComponent className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white drop-shadow-lg" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <span className="relative z-10 text-white font-rubik font-bold text-base md:text-lg lg:text-xl drop-shadow-lg">
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
        <header className="pt-4 md:pt-6 lg:pt-8 text-center animate-fade-in">
          <h1
            className="text-3xl md:text-5xl lg:text-7xl font-playpen text-indigo-900"
            style={{ textShadow: '0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.2)' }}
          >
            מרכז למידה בית ספרי
          </h1>
        </header>

        {/* Main area with logo and cards */}
        <main className="flex-1 flex items-center justify-center">
          {/* Radial layout container - larger for 512px logo */}
          <div className="relative w-[380px] h-[380px] md:w-[550px] md:h-[550px] lg:w-[900px] lg:h-[900px]">

            {/* Center: Logo */}
            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              {/* Logo glow background */}
              <div className="absolute w-48 h-48 md:w-72 md:h-72 lg:w-[450px] lg:h-[450px] bg-white/60 rounded-full blur-3xl" />

              {/* Logo - 512px on desktop */}
              <div className="relative animate-scale-in">
                <Image
                  src="/logo/logo-full.png"
                  alt="חוקרי STEM"
                  width={512}
                  height={512}
                  className="relative w-44 h-44 md:w-64 md:h-64 lg:w-[512px] lg:h-[512px] object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

          {/* Bubble Cards - positioned at corners, closer to logo */}
          {/* Students - TOP RIGHT (RTL: visually top-left) */}
          <GlowingBubble
            title="תלמידים"
            icon={GraduationCap}
            href="/login"
            color="green"
            position="top-4 right-4 md:top-6 md:right-6 lg:top-12 lg:right-12"
            delay={100}
          />

          {/* Staff - TOP LEFT (RTL: visually top-right) */}
          <GlowingBubble
            title="צוות"
            icon={Users}
            href="/login"
            color="blue"
            position="top-4 left-4 md:top-6 md:left-6 lg:top-12 lg:left-12"
            delay={200}
          />

          {/* Parents - BOTTOM LEFT (RTL: visually bottom-right) */}
          <GlowingBubble
            title="הורים"
            icon={Heart}
            href="/login"
            color="orange"
            position="bottom-4 left-4 md:bottom-6 md:left-6 lg:bottom-12 lg:left-12"
            delay={300}
          />

          {/* Gallery - BOTTOM RIGHT (RTL: visually bottom-left) */}
          <GlowingBubble
            title="גלריה"
            icon={Images}
            href="/gallery"
            color="teal"
            position="bottom-4 right-4 md:bottom-6 md:right-6 lg:bottom-12 lg:right-12"
            delay={400}
          />
          </div>
        </main>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-base text-gray-500">
          חוקרי STEM • מרחב למידה לבית ספר יסודי
        </p>
      </div>
    </div>
  );
}
