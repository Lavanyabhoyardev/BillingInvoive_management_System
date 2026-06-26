"use client";

import Link from "next/link";
import { Boxes } from "lucide-react";

import { APP_NAME, APP_TAGLINE, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** App logo/wordmark used in the sidebar header. */
export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href={ROUTES.dashboard}
      className={cn("flex items-center gap-3", className)}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Boxes className="h-5 w-5" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold tracking-tight">{APP_NAME}</span>
        <span className="text-[11px] text-muted-foreground">{APP_TAGLINE}</span>
      </div>
    </Link>
  );
}
