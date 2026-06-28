"use client";

import { Building2, DatabaseBackup, SlidersHorizontal } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyForm } from "@/components/forms/company-form";
import { PreferencesForm } from "@/components/forms/preferences-form";
import { BackupRestore } from "@/components/forms/backup-restore";
import { CloudAccount } from "@/components/forms/cloud-account";
import { useCompany, useSettings } from "@/hooks";

export default function SettingsPage() {
  const { company, isLoading: companyLoading } = useCompany();
  const { settings, isLoading: settingsLoading } = useSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your business profile and app preferences."
      />

      <Tabs defaultValue="company" className="space-y-6">
        <div className="-mx-1 overflow-x-auto px-1">
          <TabsList className="w-max">
            <TabsTrigger value="company" className="gap-2">
              <Building2 className="h-4 w-4" />
              Company Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <DatabaseBackup className="h-4 w-4" />
              Backup & Data
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="company">
          {companyLoading ? (
            <FormSkeleton />
          ) : (
            <CompanyForm initial={company} />
          )}
        </TabsContent>

        <TabsContent value="preferences">
          {settingsLoading || !settings ? (
            <FormSkeleton />
          ) : (
            <PreferencesForm initial={settings} />
          )}
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <CloudAccount />
          <BackupRestore />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  );
}
