"use client";

import * as React from "react";
import { bootstrapDatabase } from "@/db";

interface DbContextValue {
  ready: boolean;
}

const DbContext = React.createContext<DbContextValue>({ ready: false });

/** Hook to know whether the database has finished bootstrapping. */
export function useDbReady(): boolean {
  return React.useContext(DbContext).ready;
}

/**
 * Bootstraps IndexedDB (seeds defaults & templates) on first client render.
 * Renders children immediately; data hooks handle their own loading states.
 */
export function DbProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
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
