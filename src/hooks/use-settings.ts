"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { getDb } from "@/db";
import { APP_SETTINGS_ID, type AppSettings } from "@/types";

/** Reactive access to app settings. */
export function useSettings(): {
  settings: AppSettings | undefined;
  isLoading: boolean;
} {
  const settings = useLiveQuery(
    () => getDb().settings.get(APP_SETTINGS_ID),
    [],
    undefined
  );
  return { settings, isLoading: settings === undefined };
}
