"use client";

import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleStyles, useIsStudent } from "@/contexts/ThemeContext";
import { Card } from "@/components/ui/Card";
import {
  Rocket,
  Lightbulb,
  Star,
  Settings,
  Sparkles,
  TrendingUp,
  Calendar,
  Heart,
} from "lucide-react";
import type { UserRole } from "@/types";

interface WelcomeHeaderProps {
  role: UserRole;
}

// Role-specific configuration for distinct visual experiences
const welcomeConfig: Record<
  UserRole,
  {
    greeting: string;
    subtitle: string;
    titleSize: string;
    icon: React.ElementType;
    showProgress?: boolean;
    showStreak?: boolean;
    showDate?: boolean;
  }
> = {
  student: {
    greeting: "שלום חוקר/ת!",
    subtitle: "מוכנים להמשיך לחקור ולגלות?",
    titleSize: "text-3xl md:text-4xl",
    icon: Rocket,
    showStreak: true,
  },
  teacher: {
    greeting: "שלום מורה!",
    subtitle: "הנה סיכום מהיר של המערכת",
    titleSize: "text-2xl md:text-3xl",
    icon: Lightbulb,
    showDate: true,
  },
  parent: {
    greeting: "שלום!",
    subtitle: "ברוכים הבאים למרחב הלמידה של ילדכם",
    titleSize: "text-2xl md:text-3xl",
    icon: Heart,
    showProgress: true,
  },
  admin: {
    greeting: "שלום מנהל!",
    subtitle: "ניהול וסקירת מערכת חוקרי STEM",
    titleSize: "text-xl md:text-2xl",
    icon: Settings,
    showDate: true,
  },
};

export function WelcomeHeader({ role }: WelcomeHeaderProps) {
  const { session } = useAuth();
  const roleStyles = useRoleStyles();
  const isStudent = useIsStudent();

  const config = welcomeConfig[role];

  // Format today's date in Hebrew
  const today = new Date().toLocaleDateString("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Main Welcome Section */}
      <div className="flex items-start gap-4">
        {/* Logo - with role-specific animation */}
        <div
          className={`
            hidden sm:flex items-center justify-center
            transition-all duration-theme
            ${isStudent ? "animate-bounce-playful" : ""}
          `}
        >
          <Image
            src="/logo/logo-full.png"
            alt="חוקרי STEM"
            width={100}
            height={100}
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Text Content */}
        <div className="flex-1">
          <h1
            className={`${config.titleSize} font-rubik font-bold text-foreground transition-all duration-theme`}
          >
            {config.greeting.replace(
              "חוקר/ת",
              session?.user.name || "חוקר/ת"
            )}
          </h1>
          <p className="text-gray-500 mt-1">{config.subtitle}</p>

          {/* Grade badge for students and parents */}
          {session?.user.grade && (
            <p className={`text-sm mt-2 ${roleStyles.text} font-medium`}>
              כיתה {session.user.grade}
            </p>
          )}

          {/* Date display for teachers and admins */}
          {config.showDate && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
              <Calendar size={14} />
              <span>{today}</span>
            </div>
          )}
        </div>

        {/* Student streak counter (playful gamification) */}
        {config.showStreak && (
          <div
            className={`
              hidden md:flex flex-col items-center p-3
              rounded-theme ${roleStyles.bgLight}
              transition-all duration-theme
            `}
          >
            <Sparkles className={`w-5 h-5 ${roleStyles.text} mb-1`} />
            <span className={`text-2xl font-bold ${roleStyles.text}`}>7</span>
            <span className="text-xs text-gray-500">ימי חקירה</span>
          </div>
        )}
      </div>

      {/* Student-specific encouragement card */}
      {role === "student" && (
        <Card
          className={`
            bg-gradient-to-l from-role-student/5 to-primary/5
            border border-role-student/20
          `}
          padding="md"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-role-student/10 rounded-theme">
              <Sparkles className="w-6 h-6 text-role-student" />
            </div>
            <div>
              <h3 className="font-rubik font-semibold text-foreground">
                המשיכו לחקור!
              </h3>
              <p className="text-sm text-gray-500">
                כל יום הוא הזדמנות לגלות משהו חדש ומרגש
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Parent-specific child progress indicator */}
      {role === "parent" && config.showProgress && session?.user.grade && (
        <Card
          className={`
            bg-gradient-to-l from-role-parent/5 to-amber-50
            border border-role-parent/20
          `}
          padding="md"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-role-parent/10 rounded-theme">
              <TrendingUp className="w-6 h-6 text-role-parent" />
            </div>
            <div className="flex-1">
              <h3 className="font-rubik font-semibold text-foreground">
                התקדמות ילדכם בכיתה {session.user.grade}
              </h3>
              <p className="text-sm text-gray-500">
                צפו בדוחות ותיעודים כדי לעקוב אחר הלמידה
              </p>
            </div>
            <Star className="w-8 h-8 text-role-parent/30" />
          </div>
        </Card>
      )}
    </div>
  );
}

export default WelcomeHeader;
