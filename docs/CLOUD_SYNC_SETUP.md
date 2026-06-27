# Cloud Sync Setup (Supabase) — same data on mobile + PC

By default QuoteDesk stores everything offline in the browser (IndexedDB). To
access the **same data from multiple devices**, enable cloud sync with Supabase.
It's free and takes ~5 minutes. If you skip this, the app keeps working offline.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> → sign up (free).
2. **New project** → choose a name + a database password → create.
3. Wait ~2 minutes for it to provision.

## 2. Create the database tables

1. In your project: left sidebar → **SQL Editor** → **New query**.
2. Open the file [`supabase/schema.sql`](../supabase/schema.sql) from this repo,
   copy everything, paste into the editor, and click **Run**.
3. You should see "Success". This creates 6 tables with security + realtime.

## 3. Turn on Email login

1. Left sidebar → **Authentication** → **Providers** → **Email**: make sure it's
   enabled.
2. (Optional, easier for personal use) **Authentication → Sign In / Providers →**
   turn **OFF** "Confirm email" so you can log in immediately without clicking a
   confirmation link.

## 4. Get your keys

1. Left sidebar → **Project Settings** → **API**.
2. Copy the **Project URL** and the **anon / public** API key.

## 5. Add the keys to the app

Create a file named **`.env.local`** in the project root (copy `.env.local.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

Restart the dev server (`npm run dev`). You'll now see a **login screen**.
Create an account once, then log in with the same email/password on your phone
and PC — the data stays in sync automatically.

## 6. Deploy on Vercel

Add the same two variables in Vercel:

1. Vercel → your project → **Settings → Environment Variables**.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. **Redeploy**.

---

## How it works

- Your local IndexedDB stays as a fast offline cache. A sync layer mirrors every
  change to Supabase and listens for changes from your other devices (realtime).
- Row Level Security ensures **only you** can read/write your own data.
- No app feature, page, or component changed — sync is a layer on top.

## Notes

- First login on a device pulls your cloud data down; new local data is pushed up.
- Editing the *same* record on two devices at the exact same moment uses
  last-write-wins (fine for a single owner).
- To go back to offline-only, just remove the env vars and redeploy.
