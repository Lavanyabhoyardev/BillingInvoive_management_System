"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileEdit,
  FilePlus2,
  LayoutTemplate,
  Settings,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: string;
}

const ACTIONS: QuickAction[] = [
  {
    label: "New Quotation",
    description: "Start a fresh quotation",
    href: ROUTES.newQuotation,
    icon: FilePlus2,
    accent: "bg-primary/10 text-primary",
  },
  {
    label: "Drafts",
    description: "Resume saved drafts",
    href: ROUTES.drafts,
    icon: FileEdit,
    accent: "bg-warning/15 text-warning",
  },
  {
    label: "Templates",
    description: "Load a ready template",
    href: ROUTES.templates,
    icon: LayoutTemplate,
    accent: "bg-success/15 text-success",
  },
  {
    label: "Settings",
    description: "Company profile & prefs",
    href: ROUTES.settings,
    icon: Settings,
    accent: "bg-muted text-muted-foreground",
  },
];

/** Grid of primary navigation shortcuts on the dashboard. */
export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ACTIONS.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
          >
            <Link href={action.href}>
              <Card className="flex h-full flex-col gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className={cn("w-fit rounded-lg p-2.5", action.accent)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{action.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
