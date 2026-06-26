"use client";

import { Badge } from "@/components/ui/badge";
import { PAYMENT_STATUSES, type PaymentStatus } from "@/types";

const VARIANT: Record<
  PaymentStatus,
  "success" | "destructive" | "warning" | "secondary"
> = {
  paid: "success",
  unpaid: "destructive",
  partial: "warning",
  cancelled: "secondary",
};

/** Colored badge for an invoice payment status. */
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const label =
    PAYMENT_STATUSES.find((s) => s.value === status)?.label ?? status;
  return <Badge variant={VARIANT[status]}>{label}</Badge>;
}
