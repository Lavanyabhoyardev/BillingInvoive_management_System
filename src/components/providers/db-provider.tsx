"use client";

import * as React from "react";
import { bootstrapDatabase } from "@/db";
import { isSupabaseConfigured } from "@/lib/supabase";

interface DbContextValue {
  ready: boolean;
}

const DbContext = React.createContext<DbContextValue>({ ready: false });

/** Hook to know whether the database has finished bootstrapping. */
export function useDbReady(): boolean {
  return React.useContext(DbContext).ready;
}

/**
 * Initializes IndexedDB. In offline-only mode it also seeds defaults/templates.
 * When cloud sync is configured, seeding is deferred to SyncGate (after the
 * initial cloud pull) so seed data isn't duplicated across devices.
 */
export function DbProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    // Cloud mode bootstraps inside SyncGate (post-pull); skip here.
    if (isSupabaseConfigured) {
      setReady(true);
      return;
    }
    bootstrapDatabase()
      .catch((err) => console.error("DB bootstrap failed:", err))
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <DbContext.Provider value={{ ready }}>{children}</DbContext.Provider>;
}
