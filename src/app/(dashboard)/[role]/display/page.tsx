"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useVisibility } from "@/contexts/VisibilityContext";
import { useToastActions } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { RoleTabs } from "@/components/display/RoleTabs";
import { CollapsibleSection } from "@/components/display/CollapsibleSection";
import { DashboardSection } from "@/components/display/DashboardSection";
import { SidebarSection } from "@/components/display/SidebarSection";
import { PageElementsSection } from "@/components/display/PageElementsSection";
import { saveVisibilityConfig } from "@/lib/services/visibility";
import { Eye, Save, RotateCcw } from "lucide-react";
import type { ConfigurableRole, VisibilityConfig } from "@/types";

export default function DisplaySettingsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const { config: savedConfig, isLoading, refetch } = useVisibility();
  const toast = useToastActions();

  const [selectedRole, setSelectedRole] = useState<ConfigurableRole>("teacher");
  const [localConfig, setLocalConfig] = useState<VisibilityConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (session && session.user.role !== "admin") {
      router.replace(`/${session.user.role}`);
    }
  }, [session, router]);

  // Initialize local config from saved config
  useEffect(() => {
    if (savedConfig && !localConfig) {
      setLocalConfig(savedConfig);
    }
  }, [savedConfig, localConfig]);

  // Track changes
  useEffect(() => {
    if (localConfig && savedConfig) {
      setHasChanges(JSON.stringify(localConfig) !== JSON.stringify(savedConfig));
    }
  }, [localConfig, savedConfig]);

  const handleSave = async () => {
    if (!localConfig) return;

    setIsSaving(true);
    try {
      await saveVisibilityConfig(localConfig);
      await refetch();
      setHasChanges(false);
      toast.success("הגדרות התצוגה נשמרו בהצלחה");
    } catch (error) {
      console.error("Failed to save visibility config:", error);
      toast.error("שגיאה בשמירת ההגדרות");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (savedConfig) {
      setLocalConfig(savedConfig);
      setHasChanges(false);
      toast.success("השינויים בוטלו");
    }
  };

  const updateDashboard = (dashboardConfig: VisibilityConfig["dashboards"][ConfigurableRole]) => {
    if (!localConfig) return;
    setLocalConfig({
      ...localConfig,
      dashboards: {
        ...localConfig.dashboards,
        [selectedRole]: dashboardConfig,
      },
    });
  };

  const updateSidebar = (sidebarConfig: VisibilityConfig["sidebars"][ConfigurableRole]) => {
    if (!localConfig) return;
    setLocalConfig({
      ...localConfig,
      sidebars: {
        ...localConfig.sidebars,
        [selectedRole]: sidebarConfig,
      },
    });
  };

  const updatePageElements = (pageElementsConfig: VisibilityConfig["pageElements"][ConfigurableRole]) => {
    if (!localConfig) return;
    setLocalConfig({
      ...localConfig,
      pageElements: {
        ...localConfig.pageElements,
        [selectedRole]: pageElementsConfig,
      },
    });
  };

  if (session?.user.role !== "admin") {
    return null;
  }

  if (isLoading || !localConfig) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="card" height={60} />
        <Skeleton variant="card" height={300} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Eye size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-rubik font-bold text-foreground">
              תצוגה
            </h1>
            <p className="text-sm text-gray-500">
              התאם את התצוגה לכל תפקיד
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <RotateCcw size={18} className="ml-2" />
              בטל
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            loading={isSaving}
          >
            <Save size={18} className="ml-2" />
            שמור
          </Button>
        </div>
      </div>

      {/* Role Tabs */}
      <RoleTabs selectedRole={selectedRole} onRoleChange={setSelectedRole} />

      {/* Configuration Sections */}
      <div className="space-y-4">
        {/* Dashboard Section */}
        <Card padding="lg">
          <CollapsibleSection
            id="display-dashboard"
            title="לוח בקרה"
            description="טקסט פתיחה וכרטיסים"
          >
            <DashboardSection
              config={localConfig.dashboards[selectedRole]}
              sidebarConfig={localConfig.sidebars[selectedRole]}
              onChange={updateDashboard}
            />
          </CollapsibleSection>
        </Card>

        {/* Sidebar Section */}
        <Card padding="lg">
          <CollapsibleSection
            id="display-sidebar"
            title="תפריט צד"
            description="קישורים והצגה"
          >
            <SidebarSection
              config={localConfig.sidebars[selectedRole]}
              onChange={updateSidebar}
            />
          </CollapsibleSection>
        </Card>

        {/* Page Elements Section */}
        <Card padding="lg">
          <CollapsibleSection
            id="display-page-elements"
            title="אלמנטים בדפים"
            description="בחר אילו אלמנטים יוצגו"
          >
            <PageElementsSection
              config={localConfig.pageElements[selectedRole]}
              onChange={updatePageElements}
            />
          </CollapsibleSection>
        </Card>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 left-4 md:right-auto md:left-auto md:w-96 bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-lg">
          <p className="text-amber-800 text-sm">
            יש שינויים שלא נשמרו. לחץ על &quot;שמור שינויים&quot; לשמירה.
          </p>
        </div>
      )}
    </div>
  );
}
