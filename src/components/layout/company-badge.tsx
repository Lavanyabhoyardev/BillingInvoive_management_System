"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCompany } from "@/hooks";
import { ROUTES } from "@/lib/constants";

/** Compact business identity shown at the bottom of the sidebar. */
export function CompanyBadge() {
  const { company } = useCompany();
  const name = company?.companyName?.trim() || "Your Business";
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Link
      href={ROUTES.settings}
      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
    >
      <Avatar className="h-9 w-9 rounded-lg">
        {company?.logo ? (
          <AvatarImage src={company.logo} alt={name} />
        ) : null}
        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
          {initials || <Building2 className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {company?.phone || "Set up profile"}
        </p>
      </div>
    </Link>
  );
}
