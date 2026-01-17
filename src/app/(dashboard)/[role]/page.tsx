"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useRoleStyles } from "@/contexts/ThemeContext";
import { useVisibility } from "@/contexts/VisibilityContext";
import { Card } from "@/components/ui/Card";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { ALL_DASHBOARD_CARDS } from "@/lib/constants/visibility-defaults";
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
  ArrowLeft,
  Users,
} from "lucide-react";
import type { UserRole, ConfigurableRole } from "@/types";
import type { LucideIcon } from "lucide-react";

// Card metadata - icons, colors, hrefs
const CARD_METADATA: Record<string, { icon: LucideIcon; color: string; href: string }> = {
  pedagogical: { icon: BookOpen, color: "bg-primary", href: "/pedagogical" },
  "teaching-resources": { icon: FileText, color: "bg-primary", href: "/teaching-resources" },
  responses: { icon: Users, color: "bg-secondary", href: "/responses" },
  reports: { icon: BarChart2, color: "bg-accent", href: "/reports" },
  forum: { icon: MessageSquare, color: "bg-secondary", href: "/forum" },
  documentation: { icon: Image, color: "bg-secondary", href: "/documentation" },
  journal: { icon: PenTool, color: "bg-role-student", href: "/journal" },
  questions: { icon: HelpCircle, color: "bg-role-admin", href: "/questions" },
  passwords: { icon: Key, color: "bg-primary", href: "/passwords" },
  settings: { icon: Settings, color: "bg-secondary", href: "/settings" },
};

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
      label: "משאבי הוראה",
      description: "תוכניות לימודים וקישורים",
      href: "/teaching-resources",
      icon: FileText,
      color: "bg-primary",
    },
    {
      label: "תגובות תלמידים",
      description: "צפה בתגובות התלמידים ליומן",
      href: "/responses",
      icon: Users,
      color: "bg-secondary",
    },
    {
      label: "דוחות",
      description: "צפה בדוחות AI על התלמידים",
      href: "/reports",
      icon: BarChart2,
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
      label: "משאבי הוראה",
      description: "תוכניות לימודים וקישורים",
      href: "/teaching-resources",
      icon: FileText,
      color: "bg-accent",
    },
  ],
};

export default function RoleDashboardPage() {
  const params = useParams();
  const roleStyles = useRoleStyles();
  const { getDashboardConfig, getSidebarConfig } = useVisibility();

  const role = (params.role as UserRole) || "teacher";

  // Admin uses hardcoded actions (not configurable)
  // Other roles use visibility config
  const quickActions: QuickAction[] = role === "admin"
    ? quickActionsByRole.admin
    : (() => {
        const configurableRole = role as ConfigurableRole;
        const dashboardConfig = getDashboardConfig(configurableRole);
        const sidebarConfig = getSidebarConfig(configurableRole);

        // Build sidebar labels lookup (single source of truth)
        const sidebarLabels = Object.fromEntries(
          sidebarConfig.links.map(link => [link.id, link.label])
        );

        return dashboardConfig.cards
          .filter(card => card.visible)
          .sort((a, b) => a.order - b.order)
          .map(card => {
            const metadata = CARD_METADATA[card.id];
            const cardInfo = ALL_DASHBOARD_CARDS[card.id as keyof typeof ALL_DASHBOARD_CARDS];

            return {
              // Use sidebar label as source of truth, fallback to default
              label: sidebarLabels[card.id] || cardInfo?.label || card.id,
              description: cardInfo?.description || "",
              href: metadata?.href || `/${card.id}`,
              icon: metadata?.icon || BookOpen,
              color: metadata?.color || "bg-primary",
            };
          });
      })();

  // Get dashboard intro text
  const dashboardIntro = role !== "admin"
    ? getDashboardConfig(role as ConfigurableRole).intro
    : "";

  return (
    <div className="max-w-theme mx-auto space-y-8">
      {/* Welcome Header - role-specific styling and content */}
      <WelcomeHeader role={role} />

      {/* Dashboard Intro - from visibility config */}
      {dashboardIntro && (
        <div className="bg-surface-1 border border-surface-2 rounded-xl p-5">
          <p className="text-xl font-medium text-foreground leading-relaxed">
            {dashboardIntro}
          </p>
        </div>
      )}

      {/* Quick Actions Grid - role-specific columns */}
      <div>
        <h2 className="text-lg font-rubik font-semibold text-foreground mb-4">
          פעולות מהירות
        </h2>
        <div className={`grid ${roleStyles.gridCols} gap-theme`}>
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

      {/* Teacher-specific: Info Cards - respects visibility config */}
      {role === "teacher" && (() => {
        const sidebarConfig = getSidebarConfig("teacher");
        const forumLink = sidebarConfig.links.find(l => l.id === "forum");
        const docLink = sidebarConfig.links.find(l => l.id === "documentation");
        const showForum = forumLink?.visible;
        const showDoc = docLink?.visible;

        if (!showForum && !showDoc) return null;

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showForum && (
              <Card variant="outlined" padding="md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-rubik font-semibold">{forumLink?.label || "במה אישית"}</h3>
                </div>
                <p className="text-sm text-gray-500">
                  שתפו רעיונות והתייעצו עם עמיתים
                </p>
                <Link
                  href={`/${role}/forum`}
                  className="inline-flex items-center mt-3 text-sm text-primary font-medium hover:underline cursor-pointer"
                >
                  לבמה
                  <ArrowLeft size={14} className="mr-1" />
                </Link>
              </Card>
            )}
            {showDoc && (
              <Card variant="outlined" padding="md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Image className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="font-rubik font-semibold">{docLink?.label || "תיעוד פעילויות"}</h3>
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
            )}
          </div>
        );
      })()}

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
