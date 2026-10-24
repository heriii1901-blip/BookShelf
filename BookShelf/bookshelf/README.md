# BookShelf

Aplikasi baca buku (PDF) pribadi. UI mengikuti TachiyomiSY: tab Pustaka, History, Book, Upload, Akun.

Stack: React + Vite, Supabase (login, database, storage), Capacitor (jadi APK).

## Setup Supabase
1. Buat project di https://supabase.com/dashboard
2. Menu **SQL Editor** → **New query** → paste isi `supabase/schema.sql` → **Run**
3. **Authentication** → **Sign In / Providers** → **Email** → matikan **Confirm email** (biar daftar langsung bisa masuk)
4. **Project Settings** → **API**: salin **Project URL** dan **anon public key**

## Jalan di komputer
```
cp .env.example .env     # isi URL dan anon key
npm install
npm run dev
```

## Build APK lewat GitHub
1. Di repo GitHub: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
2. Tambah `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
3. Tab **Actions** → **Build APK** → **Run workflow** (juga jalan otomatis tiap push ke `main`)
4. Selesai (±5-8 menit) → klik run-nya → bagian **Artifacts** → download `BookShelf-apk` → ekstrak zip → `app-debug.apk`
