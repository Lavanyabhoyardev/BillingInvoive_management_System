"use client";

import * as React from "react";

import { ThemeProvider } from "./theme-provider";
import { DbProvider } from "./db-provider";
import { AuthProvider } from "./auth-provider";
import { SyncGate } from "./sync-gate";
import { ServiceWorkerRegistrar } from "./service-worker";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

/** Single composition root for all client-side providers. */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <DbProvider>
          <SyncGate>
            <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          </SyncGate>
          <Toaster position="top-right" />
          <ServiceWorkerRegistrar />
        </DbProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
