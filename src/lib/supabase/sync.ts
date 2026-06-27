import type { Table } from "dexie";

import { getDb, type QuotationDatabase } from "@/db";
import { getSupabase, SYNCED_TABLES, type SyncedTable } from "./client";

/**
 * Two-way sync between the local Dexie database and Supabase.
 *
 *  Outbound: Dexie CRUD hooks mirror every local change to Supabase. Because
 *            this is wired at the database level, NO service or component code
 *            needs to change — every existing write is captured automatically.
 *
 *  Inbound:  Supabase Realtime pushes remote changes (from other devices) back
 *            into Dexie, which makes the existing `useLiveQuery` hooks re-render.
 *
 * An `applyingRemote` guard prevents echo loops (remote → Dexie → back to remote).
 */

interface SyncRecord {
  id: string;
  updatedAt: string;
  [key: string]: unknown;
}

let currentUserId: string | null = null;
let applyingRemote = false;
let hooksAttached = false;
const channels: { unsubscribe: () => void }[] = [];

/** Runs a Dexie write that originated remotely, suppressing outbound mirroring. */
async function applyRemote<T>(fn: () => Promise<T>): Promise<T> {
  applyingRemote = true;
  try {
    return await fn();
  } finally {
    applyingRemote = false;
  }
}

function tableRef(name: SyncedTable): Table<SyncRecord, string> {
  const db = getDb() as QuotationDatabase;
  return (db as unknown as Record<string, Table<SyncRecord, string>>)[name];
}

/** Upserts one record to Supabase. */
async function pushRecord(name: SyncedTable, record: SyncRecord): Promise<void> {
  if (!currentUserId) return;
  const supabase = getSupabase();
  const { error } = await supabase.from(name).upsert(
    {
      id: record.id,
      user_id: currentUserId,
      updated_at: record.updatedAt ?? new Date().toISOString(),
      data: record,
    },
    { onConflict: "user_id,id" }
  );
  if (error) console.error(`[sync] push ${name} failed:`, error.message);
}

/** Deletes one record from Supabase. */
async function removeRecord(name: SyncedTable, id: string): Promise<void> {
  if (!currentUserId) return;
  const supabase = getSupabase();
  const { error } = await supabase
    .from(name)
    .delete()
    .eq("user_id", currentUserId)
    .eq("id", id);
  if (error) console.error(`[sync] delete ${name} failed:`, error.message);
}

/** Attaches Dexie CRUD hooks once to mirror local changes outward. */
function attachHooks(): void {
  if (hooksAttached) return;
  hooksAttached = true;

  for (const name of SYNCED_TABLES) {
    const table = tableRef(name);

    table.hook("creating", (_pk, obj) => {
      if (!applyingRemote && currentUserId) {
        void pushRecord(name, obj as SyncRecord);
      }
    });

    table.hook("updating", (mods, _pk, obj) => {
      if (!applyingRemote && currentUserId) {
        const next = { ...(obj as SyncRecord), ...(mods as object) } as SyncRecord;
        void pushRecord(name, next);
      }
    });

    table.hook("deleting", (pk) => {
      if (!applyingRemote && currentUserId) {
        void removeRecord(name, String(pk));
      }
    });
  }
}

function newer(a?: string, b?: string): boolean {
  const ta = a ? Date.parse(a) : 0;
  const tb = b ? Date.parse(b) : 0;
  return ta > tb;
}

/**
 * Initial reconciliation on login:
 *   - pull remote rows that are newer/missing into Dexie
 *   - push local rows that are newer/missing up to Supabase
 */
async function reconcile(): Promise<void> {
  const supabase = getSupabase();

  for (const name of SYNCED_TABLES) {
    const table = tableRef(name);
    const [{ data: remoteRows, error }, localRecords] = await Promise.all([
      supabase.from(name).select("id, data"),
      table.toArray(),
    ]);
    if (error) {
      console.error(`[sync] pull ${name} failed:`, error.message);
      continue;
    }

    const remoteMap = new Map<string, SyncRecord>();
    for (const row of remoteRows ?? []) {
      remoteMap.set(row.id as string, (row as { data: SyncRecord }).data);
    }
    const localMap = new Map(localRecords.map((r) => [r.id, r]));

    // remote -> local
    const toPutLocal: SyncRecord[] = [];
    for (const [id, remote] of remoteMap) {
      const local = localMap.get(id);
      if (!local || newer(remote.updatedAt, local.updatedAt)) {
        toPutLocal.push(remote);
      }
    }
    if (toPutLocal.length) {
      await applyRemote(() => table.bulkPut(toPutLocal));
    }

    // local -> remote
    const pushes: Promise<void>[] = [];
    for (const local of localRecords) {
      const remote = remoteMap.get(local.id);
      if (!remote || newer(local.updatedAt, remote.updatedAt)) {
        pushes.push(pushRecord(name, local));
      }
    }
    await Promise.all(pushes);
  }
}

/** Subscribes to Realtime so other devices' changes flow into Dexie. */
function startRealtime(): void {
  const supabase = getSupabase();

  for (const name of SYNCED_TABLES) {
    const channel = supabase
      .channel(`sync:${name}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: name,
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const table = tableRef(name);
          if (payload.eventType === "DELETE") {
            const id = (payload.old as { id?: string })?.id;
            if (id) void applyRemote(() => table.delete(id));
          } else {
            const record = (payload.new as { data?: SyncRecord })?.data;
            if (record) void applyRemote(() => table.put(record));
          }
        }
      )
      .subscribe();

    channels.push({ unsubscribe: () => void supabase.removeChannel(channel) });
  }
}

/** Starts sync for a logged-in user: hooks + reconcile + realtime. */
export async function startSync(userId: string): Promise<void> {
  currentUserId = userId;
  attachHooks();
  await reconcile();
  startRealtime();
}

/** Stops realtime + clears the active user (called on logout). */
export function stopSync(): void {
  for (const ch of channels) ch.unsubscribe();
  channels.length = 0;
  currentUserId = null;
}

/** Whether sync currently has an active user. */
export function isSyncing(): boolean {
  return currentUserId !== null;
}
