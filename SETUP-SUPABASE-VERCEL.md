# Setup: Flash Peak Community — Vercel + Supabase

Arsitektur baru (menggantikan Express + Socket.IO + file JSON):

- **Data**: tabel `members` di Postgres (Supabase) — persisten selamanya, tidak hilang saat redeploy.
- **Registrasi**: `POST /api/register` (Vercel Function) → insert ke Supabase pakai service role key (aman, tidak lewat browser).
- **Real-time**: browser subscribe langsung ke Supabase Realtime:
  - `postgres_changes` (event INSERT tabel `members`) → update roster & total member live.
  - Presence channel → hitung jumlah viewer online real-time.
  - Broadcast channel → notifikasi toast "member baru join" ke semua tab.

## Langkah setup

### 1. Buat project Supabase
1. Buka https://supabase.com → New Project.
2. Buka **SQL Editor** → jalankan isi file `sql/schema.sql` di repo ini.
3. Buka **Project Settings → API**, catat:
   - `Project URL` → jadi `SUPABASE_URL`
   - `anon public` key → dipakai di `public/supabase-config.js`
   - `service_role` key → jadi `SUPABASE_SERVICE_ROLE_KEY` (JANGAN pernah taruh di kode frontend)

### 2. Aktifkan Realtime
Di Supabase Dashboard → **Database → Replication**, pastikan tabel `members` masuk ke publication `supabase_realtime` (skrip SQL sudah otomatis menambahkannya, tinggal dicek centangnya aktif).

### 3. Isi kredensial
- Edit `public/supabase-config.js`, ganti `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dengan punya kamu (aman ditaruh di frontend, karena RLS hanya izinkan SELECT).
- Di **Vercel Project Settings → Environment Variables**, tambahkan:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  (lihat `.env.example`)

### 4. Deploy ke Vercel
```
vercel
```
atau hubungkan repo GitHub ke Vercel dashboard seperti biasa. Vercel otomatis mendeteksi folder `api/` sebagai serverless functions dan `public/` sebagai static site.

### 5. Test
- Buka `/pendaftaran.html`, isi form, submit.
- Buka `/landing.html` di tab lain → total registrasi harus naik otomatis tanpa refresh.
- Refresh browser / redeploy project → data tetap ada (tersimpan di Postgres, bukan file lokal).

## Kenapa tidak pakai Socket.IO lagi?
Vercel menjalankan setiap request sebagai serverless function yang stateless & berumur pendek — tidak bisa menahan koneksi WebSocket jangka panjang seperti Socket.IO butuhkan. Supabase Realtime jalan di infrastruktur Supabase sendiri (bukan di function Vercel), jadi cocok dipasangkan dengan hosting serverless seperti Vercel.
