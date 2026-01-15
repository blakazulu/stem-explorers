"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, Users, Heart, Images, ChevronLeft } from "lucide-react";

// Portal card component with fresh design
function PortalCard({
  title,
  subtitle,
  icon: IconComponent,
  href,
  gradient,
  iconBg,
  delay,
}: {
  title: string;
  subtitle: string;
  icon: typeof GraduationCap;
  href: string;
  gradient: string;
  iconBg: string;
  delay: number;
}) {
  return (
    <Link
      href={href}
      className="group relative animate-portal-appear block"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Card with gradient border effect */}
      <div className={`relative overflow-hidden rounded-2xl lg:rounded-3xl transition-all duration-500 group-hover:scale-[1.03] group-hover:-translate-y-2`}>
        {/* Gradient border */}
        <div className={`absolute inset-0 ${gradient} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />

        {/* Inner card */}
        <div className="relative m-[3px] bg-white rounded-[calc(1rem-3px)] lg:rounded-[calc(1.5rem-3px)] p-5 lg:p-7 h-full">
          {/* Decorative corner accent */}
          <div className={`absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 ${gradient} opacity-10 blur-2xl`} />

          {/* Content row */}
          <div className="relative flex items-center gap-4 lg:gap-5">
            {/* Icon */}
            <div className={`shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl ${iconBg} flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
              <IconComponent className="w-7 h-7 lg:w-8 lg:h-8 text-white" strokeWidth={1.5} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg lg:text-xl font-rubik font-bold text-gray-800 mb-0.5 lg:mb-1">
                {title}
              </h3>
              <p className="text-base text-gray-500 leading-snug">
                {subtitle}
              </p>
            </div>

            {/* Arrow */}
            <div className="shrink-0 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-x-1">
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { session, loading } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect to their dashboard
  useEffect(() => {
    if (!loading && session) {
      router.push(`/${session.user.role}`);
    }
  }, [session, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="text-primary text-lg animate-pulse">טוען...</div>
      </div>
    );
  }

  // If logged in, don't render the home page (will redirect)
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
        {/* Warm brownish overlay */}
        <div className="absolute inset-0 bg-amber-900/[0.15]" />
      </div>

      {/* Content - centered flex layout */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-2 lg:py-4">
        {/* Hero section - logo + text tightly coupled */}
        <div className="text-center mb-8 lg:mb-12 animate-fade-in">
          {/* Logo - big and prominent */}
          <div className="relative inline-block mb-4 lg:mb-6">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/50 via-blue-400/50 to-emerald-400/50 blur-3xl scale-150 opacity-70" />

            <Image
              src="/logo/logo-full.png"
              alt="חוקרי STEM"
              width={400}
              height={400}
              className="relative w-56 h-56 md:w-72 md:h-72 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
              priority
            />
          </div>

          {/* Hero text - right below logo */}
          <div className="animate-slide-up">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-rubik font-bold leading-tight">
              <span className="bg-gradient-to-l from-teal-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                מרכז למידה בית ספרי
              </span>
            </h1>
          </div>
        </div>

        {/* Cards - 2x2 grid, compact and modern */}
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            <PortalCard
              title="כניסת תלמידים"
              subtitle="יומן חוקר ופעילויות STEM"
              icon={GraduationCap}
              href="/login"
              gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
              iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
              delay={100}
            />

            <PortalCard
              title="כניסת צוות"
              subtitle="ניהול תכנים ודוחות"
              icon={Users}
              href="/login"
              gradient="bg-gradient-to-br from-blue-400 to-blue-600"
              iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
              delay={150}
            />

            <PortalCard
              title="כניסת הורים"
              subtitle="צפייה בהתקדמות הילדים"
              icon={Heart}
              href="/login"
              gradient="bg-gradient-to-br from-amber-400 to-orange-500"
              iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
              delay={200}
            />

            <PortalCard
              title="גלריה"
              subtitle="עבודות ופרויקטים"
              icon={Images}
              href="/gallery"
              gradient="bg-gradient-to-br from-teal-400 to-teal-600"
              iconBg="bg-gradient-to-br from-teal-500 to-teal-600"
              delay={250}
            />
          </div>
        </div>

        {/* Footer - subtle */}
        <footer className="mt-8 lg:mt-12 text-center animate-fade-in" style={{ animationDelay: "400ms" }}>
          <p className="text-base text-gray-400">
            חוקרי STEM • מרחב למידה לבית ספר יסודי
          </p>
        </footer>
      </div>
    </div>
  );
}
