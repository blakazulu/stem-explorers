"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useVisibilityConfig, useSaveVisibilityConfig } from "@/lib/queries";
import { useToastActions } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { RoleTabs } from "@/components/display/RoleTabs";
import { CollapsibleSection } from "@/components/display/CollapsibleSection";
import { DashboardSection } from "@/components/display/DashboardSection";
import { SidebarSection } from "@/components/display/SidebarSection";
import { PageElementsSection } from "@/components/display/PageElementsSection";
import { Eye, Save, RotateCcw } from "lucide-react";
import type { ConfigurableRole, VisibilityConfig } from "@/types";

export default function DisplaySettingsPage() {
  const { session } = useAuth();
  const router = useRouter();
  const { data: savedConfig, isLoading } = useVisibilityConfig();
  const saveConfigMutation = useSaveVisibilityConfig();
  const toast = useToastActions();

  const [selectedRole, setSelectedRole] = useState<ConfigurableRole>("teacher");
  const [localConfig, setLocalConfig] = useState<VisibilityConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Redirect non-admins
  useEffect(() => {
    if (session && session.user.role !== "admin") {
      router.replace(`/${session.user.role}`);
    }
  }, [session, router]);

  // Initialize/sync local config from saved config (only when not dirty)
  useEffect(() => {
    if (savedConfig && !hasChanges) {
      setLocalConfig(savedConfig);
    }
  }, [savedConfig, hasChanges]);

  const handleSave = async () => {
    if (!localConfig) return;

    try {
      await saveConfigMutation.mutateAsync(localConfig);
      setHasChanges(false);
      toast.success("הגדרות התצוגה נשמרו בהצלחה");
    } catch (error) {
      console.error("Failed to save visibility config:", error);
      toast.error("שגיאה בשמירת ההגדרות");
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
    setHasChanges(true);
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
    setHasChanges(true);
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
    setHasChanges(true);
  };

  if (session?.user.role !== "admin") {
    return null;
  }

  if (isLoading || !localConfig) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="card" height={60} />
        <Skeleton variant="card" height={300} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-surface-0 pb-4 pt-2 -mt-2 space-y-4">
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
                disabled={saveConfigMutation.isPending}
              >
                <RotateCcw size={18} className="ml-2" />
                בטל
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saveConfigMutation.isPending}
              loading={saveConfigMutation.isPending}
            >
              <Save size={18} className="ml-2" />
              שמור
            </Button>
          </div>
        </div>

        {/* Role Tabs */}
        <RoleTabs selectedRole={selectedRole} onRoleChange={setSelectedRole} />
      </div>

      {/* Configuration Sections */}
      <div className="space-y-4 mt-2">
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
              sidebarConfig={localConfig.sidebars[selectedRole]}
              dashboardConfig={localConfig.dashboards[selectedRole]}
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
