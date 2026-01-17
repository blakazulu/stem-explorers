"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useVisibility } from "@/contexts/VisibilityContext";
import { StemLinksModal } from "@/components/teaching-resources/StemLinksModal";
import { EquipmentFormModal } from "@/components/teaching-resources/EquipmentFormModal";
import { ExpertsSection } from "@/components/experts";
import {
  FolderOpen,
  ArrowRight,
  BookOpen,
  Link2,
  ClipboardList,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import type { Grade, UserRole, ConfigurableRole } from "@/types";

const VALID_GRADES: Grade[] = ["א", "ב", "ג", "ד", "ה", "ו"];

export default function TeachingResourcesGradePage() {
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { canSee } = useVisibility();

  const [stemLinksOpen, setStemLinksOpen] = useState(false);
  const [equipmentFormOpen, setEquipmentFormOpen] = useState(false);

  const role = params.role as UserRole;
  const grade = decodeURIComponent(params.grade as string) as Grade;

  const isAdmin = session?.user.role === "admin";
  const showBackButton = isAdmin;
  const configurableRole = (role === "admin" ? "teacher" : role) as ConfigurableRole;

  useEffect(() => {
    if (!VALID_GRADES.includes(grade)) {
      router.replace(`/${role}/teaching-resources`);
    }
  }, [grade, role, router]);

  if (!VALID_GRADES.includes(grade)) {
    return null;
  }

  const allResources = [
    {
      id: "curricula",
      visibilityKey: "curricula",
      title: "תוכניות לימודים",
      description: "יחידות הלימוד, קבצים ומשאבים לכל נושא",
      icon: BookOpen,
      href: `/${role}/teaching-resources/${encodeURIComponent(grade)}/curricula`,
      featured: true,
      gradient: "from-primary via-primary/80 to-secondary",
      iconBg: "bg-white/20",
    },
    {
      id: "stem-links",
      visibilityKey: "stemLinks",
      title: "קישורים STEM",
      description: "אוסף קישורים שימושיים",
      icon: Link2,
      onClick: () => setStemLinksOpen(true),
      featured: false,
      gradient: "from-emerald-700 to-teal-700",
      iconBg: "bg-white/20",
    },
    {
      id: "equipment-form",
      visibilityKey: "equipment",
      title: "טופס הצטיידות",
      description: "בקשה למשאבי למידה",
      icon: ClipboardList,
      onClick: () => setEquipmentFormOpen(true),
      featured: false,
      gradient: "from-amber-700 to-orange-700",
      iconBg: "bg-white/20",
    },
  ];

  // Filter resources based on visibility config (admin sees everything)
  const resources = role === "admin"
    ? allResources
    : allResources.filter(r => canSee(configurableRole, "teachingResources", r.visibilityKey));

  const featuredResource = resources.find((r) => r.featured);
  const otherResources = resources.filter((r) => !r.featured);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Link
            href={`/${role}/teaching-resources`}
            className="p-2 hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
            title="חזרה לבחירת כיתה"
          >
            <ArrowRight size={20} className="text-gray-500" />
          </Link>
        )}
        <div className="p-3 bg-primary/10 rounded-xl">
          <FolderOpen size={24} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
            משאבי הוראה - כיתה {grade}
          </h1>
          <p className="text-sm text-gray-500">כלים ומשאבים לתמיכה בהוראה</p>
        </div>
      </div>

      {/* Featured Resource - Full Width */}
      {featuredResource && featuredResource.href && (
        <Link
          href={featuredResource.href}
          className="group relative block w-full overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {/* Background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${featuredResource.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />

          {/* Decorative elements */}
          <div className="absolute top-4 left-4 opacity-20">
            <Sparkles size={60} className="text-white" />
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-8 translate-y-8" />
          <div className="absolute top-0 left-1/2 w-24 h-24 bg-white/5 rounded-full -translate-y-12" />

          {/* Content */}
          <div className="relative p-8 md:p-10 flex items-center gap-6">
            <div className={`p-5 rounded-2xl ${featuredResource.iconBg} backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <featuredResource.icon size={40} className="text-white drop-shadow-md" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-rubik font-bold text-white mb-2 drop-shadow-md">
                {featuredResource.title}
              </h2>
              <p className="text-white text-lg drop-shadow-sm">
                {featuredResource.description}
              </p>
            </div>
            <div className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
              <ChevronLeft size={32} className="text-white drop-shadow-md" />
            </div>
          </div>
        </Link>
      )}

      {/* Other Resources - 2 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {otherResources.map((resource) =>
          resource.onClick ? (
            <button
              key={resource.id}
              onClick={resource.onClick}
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg cursor-pointer transition-all duration-300 text-right"
            >
              <ResourceCard resource={resource} />
            </button>
          ) : (
            <Link
              key={resource.id}
              href={resource.href || "#"}
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg cursor-pointer transition-all duration-300"
            >
              <ResourceCard resource={resource} />
            </Link>
          )
        )}
      </div>

      {/* Experts Section - controlled by visibility */}
      {(role === "admin" || canSee(configurableRole, "teachingResources", "experts")) && (
        <ExpertsSection grade={grade} isAdmin={isAdmin} />
      )}

      {/* STEM Links Modal */}
      <StemLinksModal
        isOpen={stemLinksOpen}
        onClose={() => setStemLinksOpen(false)}
        grade={grade}
        isAdmin={isAdmin}
      />

      {/* Equipment Request Form Modal */}
      <EquipmentFormModal
        isOpen={equipmentFormOpen}
        onClose={() => setEquipmentFormOpen(false)}
        teacherName={session?.user.name}
      />
    </div>
  );
}

interface ResourceCardProps {
  resource: {
    title: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    gradient: string;
    iconBg: string;
  };
}

function ResourceCard({ resource }: ResourceCardProps) {
  const Icon = resource.icon;

  return (
    <>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${resource.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />

      {/* Decorative circle */}
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-x-6 translate-y-6" />

      {/* Content */}
      <div className="relative p-6 flex items-center gap-4">
        <div className={`p-4 rounded-xl ${resource.iconBg} backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon size={28} className="text-white drop-shadow-md" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-rubik font-bold text-white mb-1 drop-shadow-lg">
            {resource.title}
          </h3>
          <p className="text-white text-sm drop-shadow-md">
            {resource.description}
          </p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <ChevronLeft size={24} className="text-white drop-shadow-lg" />
        </div>
      </div>
    </>
  );
}
