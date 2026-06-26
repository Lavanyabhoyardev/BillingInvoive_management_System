"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  href?: string;
  accent?: "blue" | "amber" | "green" | "slate";
  loading?: boolean;
  index?: number;
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  blue: "bg-primary/10 text-primary",
  amber: "bg-warning/15 text-warning",
  green: "bg-success/15 text-success",
  slate: "bg-muted text-muted-foreground",
};

/** Animated KPI card for the dashboard. Optionally links to a page. */
export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent = "blue",
  loading,
  index = 0,
}: StatCardProps) {
  const content = (
    <Card className="group relative overflow-hidden p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={cn("rounded-lg p-2.5", ACCENTS[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        {href && (
          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
      <div className="mt-4 space-y-1">
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="text-3xl font-bold tracking-tight">{value}</p>
        )}
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {href ? (
        <Link href={href} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </motion.div>
  );
}
