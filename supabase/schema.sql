-- ============================================================================
-- QuoteDesk — Supabase schema
-- Run this ONCE in your Supabase project:  SQL Editor → New query → paste → Run
-- ============================================================================
--
-- Design: each app table is mirrored as a generic row:
--   id         text         -> the record's id (same id used in the app/Dexie)
--   user_id    uuid         -> owner (auth.uid()); keeps each account private
--   updated_at timestamptz  -> last change (for conflict resolution)
--   data       jsonb        -> the full record object
--
-- This needs no migrations when you add fields later — everything lives in `data`.
-- Row Level Security ensures users only ever see their own rows.
-- ============================================================================

-- Helper: create a synced table with RLS + policies + realtime.
create or replace function qd_create_synced_table(tbl text) returns void as $$
begin
  execute format($f$
    create table if not exists public.%1$I (
      id text not null,
      user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
      updated_at timestamptz not null default now(),
      data jsonb not null,
      primary key (user_id, id)
    );
    alter table public.%1$I enable row level security;
  $f$, tbl);

  -- Policies (drop+create so this script is re-runnable).
  execute format('drop policy if exists "own_select" on public.%1$I;', tbl);
  execute format('drop policy if exists "own_modify" on public.%1$I;', tbl);
  execute format(
    'create policy "own_select" on public.%1$I for select using (auth.uid() = user_id);',
    tbl
  );
  execute format(
    'create policy "own_modify" on public.%1$I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);',
    tbl
  );
end;
$$ language plpgsql;

select qd_create_synced_table('company');
select qd_create_synced_table('settings');
select qd_create_synced_table('quotations');
select qd_create_synced_table('templates');
select qd_create_synced_table('invoices');
select qd_create_synced_table('estimates');

-- Enable Realtime so changes on one device appear on the other.
alter publication supabase_realtime add table public.company;
alter publication supabase_realtime add table public.settings;
alter publication supabase_realtime add table public.quotations;
alter publication supabase_realtime add table public.templates;
alter publication supabase_realtime add table public.invoices;
alter publication supabase_realtime add table public.estimates;

-- Done. (You can drop the helper if you like:  drop function qd_create_synced_table(text);)
