"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "./auth-provider";
import { LoginScreen } from "@/components/auth/login-screen";
import { bootstrapDatabase } from "@/db";
import { startSync, stopSync } from "@/lib/supabase";

function FullScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

/**
 * Gates the app behind authentication when cloud sync is configured, and starts
 * two-way sync once logged in. When Supabase is NOT configured, it renders the
 * app immediately (offline-only mode — unchanged behavior).
 */
export function SyncGate({ children }: { children: React.ReactNode }) {
  const { enabled, loading, user } = useAuth();
  const [syncReady, setSyncReady] = React.useState(!enabled);

  React.useEffect(() => {
    if (!enabled) return;
    if (!user) {
      stopSync();
      setSyncReady(false);
      return;
    }
    let cancelled = false;
    setSyncReady(false);
    (async () => {
      try {
        await startSync(user.id);
        // Seed defaults only after pulling cloud data (avoids duplicates).
        await bootstrapDatabase();
      } catch (err) {
        console.error("[sync] init failed:", err);
      } finally {
        if (!cancelled) setSyncReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, user?.id]);

  if (!enabled) return <>{children}</>;
  if (loading) return <FullScreen label="Loading…" />;
  if (!user) return <LoginScreen />;
  if (!syncReady) return <FullScreen label="Syncing your data…" />;
  return <>{children}</>;
}
