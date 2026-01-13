"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRoleStyles } from "@/contexts/ThemeContext";
import { Card } from "@/components/ui/Card";
import {
  BookOpen,
  FileText,
  Image,
  PenTool,
  BarChart2,
  MessageSquare,
  HelpCircle,
  Key,
  Settings,
  Rocket,
  Sparkles,
  ArrowLeft,
  Users,
  Star,
  Lightbulb,
} from "lucide-react";
import type { UserRole } from "@/types";
import type { LucideIcon } from "lucide-react";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

// Role-specific quick actions - hrefs will be prefixed with role
const quickActionsByRole: Record<UserRole, QuickAction[]> = {
  student: [
    {
      label: "יומן חוקר",
      description: "המשך לכתוב ביומן החקר שלך",
      href: "/journal",
      icon: PenTool,
      color: "bg-role-student",
    },
    {
      label: "מודל פדגוגי",
      description: "צפה ביחידות הלימוד",
      href: "/pedagogical",
      icon: BookOpen,
      color: "bg-primary",
    },
    {
      label: "תיעודים",
      description: "צפה בתיעודי פעילויות",
      href: "/documentation",
      icon: Image,
      color: "bg-secondary",
    },
  ],
  teacher: [
    {
      label: "מודל פדגוגי",
      description: "צפה וערוך יחידות לימוד",
      href: "/pedagogical",
      icon: BookOpen,
      color: "bg-role-teacher",
    },
    {
      label: "תוכניות עבודה",
      description: "נהל תוכניות עבודה לשכבות",
      href: "/work-plans",
      icon: FileText,
      color: "bg-primary",
    },
    {
      label: "דוחות",
      description: "צפה בדוחות AI על התלמידים",
      href: "/reports",
      icon: BarChart2,
      color: "bg-secondary",
    },
    {
      label: "פורום",
      description: "שתף והתייעץ עם עמיתים",
      href: "/forum",
      icon: MessageSquare,
      color: "bg-accent",
    },
  ],
  parent: [
    {
      label: "מודל פדגוגי",
      description: "צפה במה הילד/ה לומד/ת",
      href: "/pedagogical",
      icon: BookOpen,
      color: "bg-role-parent",
    },
    {
      label: "דוחות",
      description: "צפה בהתקדמות הילד/ה",
      href: "/reports",
      icon: BarChart2,
      color: "bg-primary",
    },
    {
      label: "תיעודים",
      description: "צפה בתיעודי פעילויות",
      href: "/documentation",
      icon: Image,
      color: "bg-secondary",
    },
  ],
  admin: [
    {
      label: "ניהול שאלות",
      description: "צור וערוך שאלות ליומן החוקר",
      href: "/questions",
      icon: HelpCircle,
      color: "bg-role-admin",
    },
    {
      label: "ניהול סיסמאות",
      description: "נהל סיסמאות משתמשים",
      href: "/passwords",
      icon: Key,
      color: "bg-primary",
    },
    {
      label: "הגדרות",
      description: "הגדרות מערכת ודוחות",
      href: "/settings",
      icon: Settings,
      color: "bg-secondary",
    },
    {
      label: "תוכניות עבודה",
      description: "נהל תוכניות עבודה",
      href: "/work-plans",
      icon: FileText,
      color: "bg-accent",
    },
  ],
};

// Role-specific greetings
const greetingsByRole: Record<UserRole, { title: string; subtitle: string }> = {
  student: {
    title: "שלום חוקר/ת!",
    subtitle: "מוכנים להמשיך לחקור ולגלות?",
  },
  teacher: {
    title: "שלום מורה!",
    subtitle: "הנה סיכום מהיר של המערכת",
  },
  parent: {
    title: "שלום!",
    subtitle: "ברוכים הבאים למרחב הלמידה של ילדכם",
  },
  admin: {
    title: "שלום מנהל!",
    subtitle: "ניהול וסקירת מערכת חוקרי STEM",
  },
};

export default function RoleDashboardPage() {
  const { session } = useAuth();
  const params = useParams();
  const roleStyles = useRoleStyles();

  const role = (params.role as UserRole) || "teacher";
  const quickActions = quickActionsByRole[role];
  const greeting = greetingsByRole[role];

  return (
    <div className="max-w-5xl space-y-8">
      {/* Welcome Section */}
      <div className="flex items-start gap-4">
        <div
          className={`hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl ${roleStyles.bgLight}`}
        >
          {role === "student" ? (
            <Rocket className={`w-8 h-8 ${roleStyles.text}`} />
          ) : role === "teacher" ? (
            <Lightbulb className={`w-8 h-8 ${roleStyles.text}`} />
          ) : role === "parent" ? (
            <Star className={`w-8 h-8 ${roleStyles.text}`} />
          ) : (
            <Settings className={`w-8 h-8 ${roleStyles.text}`} />
          )}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-rubik font-bold text-foreground">
            {greeting.title.replace("חוקר/ת", session?.user.name || "חוקר/ת")}
          </h1>
          <p className="text-gray-500 mt-1">{greeting.subtitle}</p>
          {session?.user.grade && (
            <p className={`text-sm mt-2 ${roleStyles.text} font-medium`}>
              כיתה {session.user.grade}
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-rubik font-semibold text-foreground mb-4">
          פעולות מהירות
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const ActionIcon = action.icon;
            // Prefix href with role
            const fullHref = `/${role}${action.href}`;
            return (
              <Link key={action.href} href={fullHref}>
                <Card
                  interactive
                  padding="md"
                  className={`h-full group animate-slide-up stagger-${index + 1}`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${action.color} text-white mb-3 transition-transform group-hover:scale-110`}
                  >
                    <ActionIcon size={20} />
                  </div>
                  <h3 className="font-rubik font-semibold text-foreground mb-1">
                    {action.label}
                  </h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                  <div className="mt-3 flex items-center text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>כניסה</span>
                    <ArrowLeft size={14} className="mr-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Student-specific: Encouragement Section */}
      {role === "student" && (
        <Card className="bg-gradient-to-l from-role-student/5 to-primary/5 border-role-student/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-role-student/10 rounded-xl">
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

      {/* Teacher-specific: Info Cards */}
      {role === "teacher" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="outlined" padding="md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-rubik font-semibold">פורום מורים</h3>
            </div>
            <p className="text-sm text-gray-500">
              שתפו רעיונות והתייעצו עם עמיתים בפורום המורים
            </p>
            <Link
              href={`/${role}/forum`}
              className="inline-flex items-center mt-3 text-sm text-primary font-medium hover:underline cursor-pointer"
            >
              לפורום
              <ArrowLeft size={14} className="mr-1" />
            </Link>
          </Card>
          <Card variant="outlined" padding="md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Image className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-rubik font-semibold">תיעוד פעילויות</h3>
            </div>
            <p className="text-sm text-gray-500">
              הוסיפו תיעודי תמונות מפעילויות בכיתה
            </p>
            <Link
              href={`/${role}/documentation`}
              className="inline-flex items-center mt-3 text-sm text-secondary font-medium hover:underline cursor-pointer"
            >
              לתיעודים
              <ArrowLeft size={14} className="mr-1" />
            </Link>
          </Card>
        </div>
      )}

      {/* Parent-specific: Child Info */}
      {role === "parent" && session?.user.grade && (
        <Card variant="outlined" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-role-parent/10 rounded-xl">
              <Star className="w-6 h-6 text-role-parent" />
            </div>
            <div>
              <h3 className="font-rubik font-semibold text-foreground">
                כיתה {session.user.grade}
              </h3>
              <p className="text-sm text-gray-500">
                צפו בתכנים ובדוחות של ילדכם בכיתה {session.user.grade}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Admin-specific: Additional Tools */}
      {role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="outlined" padding="md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-rubik font-semibold">מודל פדגוגי</h3>
            </div>
            <p className="text-sm text-gray-500">
              צפה ביחידות הלימוד של כל הכיתות
            </p>
            <Link
              href={`/${role}/pedagogical`}
              className="inline-flex items-center mt-3 text-sm text-primary font-medium hover:underline cursor-pointer"
            >
              למודל הפדגוגי
              <ArrowLeft size={14} className="mr-1" />
            </Link>
          </Card>
          <Card variant="outlined" padding="md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <BarChart2 className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="font-rubik font-semibold">דוחות</h3>
            </div>
            <p className="text-sm text-gray-500">
              צפה בדוחות AI לכל היחידות והכיתות
            </p>
            <Link
              href={`/${role}/reports`}
              className="inline-flex items-center mt-3 text-sm text-secondary font-medium hover:underline cursor-pointer"
            >
              לדוחות
              <ArrowLeft size={14} className="mr-1" />
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}
