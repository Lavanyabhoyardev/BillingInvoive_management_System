"use client";

import { FileText, FileEdit, LayoutTemplate, IndianRupee } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CompanySetupBanner } from "@/components/dashboard/company-setup-banner";
import { RecentQuotations } from "@/components/dashboard/recent-quotations";
import { useDashboardStats, useSettings } from "@/hooks";
import { formatCurrency } from "@/utils";
import { ROUTES } from "@/lib/constants";

export default function DashboardPage() {
  const { stats, isLoading } = useDashboardStats();
  const { settings } = useSettings();
  const symbol = settings?.currencySymbol ?? "₹";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your quotations and quick actions."
      />

      <CompanySetupBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          index={0}
          label="Total Quotations"
          value={stats?.totalQuotations ?? 0}
          icon={FileText}
          accent="blue"
          href={ROUTES.quotations}
          loading={isLoading}
        />
        <StatCard
          index={1}
          label="Draft Quotations"
          value={stats?.draftQuotations ?? 0}
          icon={FileEdit}
          accent="amber"
          href={ROUTES.drafts}
          loading={isLoading}
        />
        <StatCard
          index={2}
          label="Templates"
          value={stats?.templates ?? 0}
          icon={LayoutTemplate}
          accent="green"
          href={ROUTES.templates}
          loading={isLoading}
        />
        <StatCard
          index={3}
          label="Total Quoted Value"
          value={formatCurrency(stats?.totalQuotedValue ?? 0, symbol)}
          icon={IndianRupee}
          accent="slate"
          loading={isLoading}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Quick Actions
        </h2>
        <QuickActions />
      </section>

      <RecentQuotations />
    </div>
  );
}
