import {
  FileText,
  FilePlus2,
  FileEdit,
  LayoutDashboard,
  LayoutTemplate,
  Receipt,
  Calculator,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** When true, only match the href exactly (used for the dashboard root). */
  exact?: boolean;
}

/** Primary navigation items rendered in the sidebar. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard, exact: true },
  { label: "New Quotation", href: ROUTES.newQuotation, icon: FilePlus2 },
  { label: "Quotations", href: ROUTES.quotations, icon: FileText },
  { label: "Drafts", href: ROUTES.drafts, icon: FileEdit },
  { label: "Invoices / Bills", href: ROUTES.invoices, icon: Receipt },
  { label: "Estimates", href: ROUTES.estimates, icon: Calculator },
  { label: "Customers", href: ROUTES.customers, icon: Users },
  { label: "Templates", href: ROUTES.templates, icon: LayoutTemplate },
  { label: "Settings", href: ROUTES.settings, icon: Settings },
];
