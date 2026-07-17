# Flash Peak Community — Pendaftaran Real-time

Halaman pendaftaran anggota **Flash Peak Community** (portal komunitas game bola online — bukan pendaftaran klub sepak bola asli), dengan notifikasi real-time saat ada yang bergabung, daftar anggota real-time, dan generator Identity Card yang bisa diunduh.

## Fitur

- 🏠 **Landing page lengkap** (`landing.html`) — hero, tentang komunitas, 4 posisi player, rules komunitas, jadwal mabar, FAQ, footer — sebelum masuk ke halaman pendaftaran
- 🎨 Tema esports/gaming bola (bukan lagi tema luar angkasa) — hitam, biru neon, hijau neon, aksen emas
- ⚡ Real-time menggunakan **Node.js (Express + Socket.IO)**
- 🔔 Notifikasi "join" muncul di atas layar untuk semua orang yang sedang membuka website, format `nama · usia · status`, otomatis bergantian setiap 2 detik jika ada beberapa notifikasi masuk beruntun
- 👥 Panel "Anggota Real-time" menampilkan seluruh anggota yang sudah bergabung, ter-update otomatis tanpa reload
- 📝 Form biodata: Nama, Usia, ID Game, Username, Alasan Bergabung, **Posisi (ST / CM / WF / CB)**
- 🧑‍🎨 Pilihan avatar bawaan sistem (bisa diganti sebelum daftar)
- 🆔 **ID member unik acak (non-urut)**, contoh `FP-2N45VE`, bukan urutan `FP-0001`, `FP-0002`, dst
- 🪪 Identity Card digital otomatis dibuat setelah daftar (avatar, ID member, username, posisi) dan bisa didownload sebagai gambar PNG
- 💬 Setelah ID Card diunduh, muncul pop-up ajakan gabung grup WhatsApp komunitas
- 📱 Sepenuhnya responsif, semua ikon menggunakan SVG (tanpa emoji di UI)

## Cara Menjalankan

1. Pastikan Node.js sudah terpasang (v16 ke atas).
2. Install dependency:
   ```bash
   npm install
   ```
3. Jalankan server:
   ```bash
   npm start
   ```
4. Buka di browser:
   ```
   http://localhost:3000
   ```
   (otomatis diarahkan ke halaman `pendaftaran.html`)

Buka halaman ini di beberapa tab/browser berbeda untuk melihat notifikasi dan daftar anggota ter-update secara real-time di semua tab sekaligus.

## Struktur Proyek

```
flash-peak-register/
├── server.js              # Server Express + Socket.IO (in-memory member store)
├── package.json
└── public/
    ├── index.html          # Redirect ke landing.html
    ├── landing.html        # Landing page: tentang, posisi, rules, jadwal, FAQ
    ├── landing.css         # Style khusus landing page
    ├── landing.js          # Interaksi landing: navbar, FAQ, reveal, stat live
    ├── pendaftaran.html    # Halaman pendaftaran (form + notifikasi + roster)
    ├── style.css           # Tema visual Flash Peak (bola/gaming) — dipakai bersama
    ├── app.js              # Logic client pendaftaran: socket.io, canvas ID card, dsb
    └── avatars/            # 6 avatar SVG bawaan sistem
```

## Catatan Teknis

- Data anggota disimpan **in-memory** (array di `server.js`) — akan reset setiap server di-restart. Untuk produksi, ganti dengan database (mis. SQLite/MongoDB/PostgreSQL).
- Validasi: nama (min 3 karakter), usia (10–80), ID Game (wajib & unik), username (min 3 karakter & unik), alasan (min 10 karakter), posisi (wajib salah satu dari ST/CM/WF/CB).
- ID member dibuat acak 6 karakter (huruf+angka, mengecualikan karakter yang mirip) dengan prefix `FP-`, dan dijamin unik selama server berjalan — tidak berurutan seperti nomor antrean.
- ID Card dirender langsung di `<canvas>` sisi klien lalu diekspor sebagai PNG — tidak perlu library tambahan.
- Link grup WhatsApp yang digunakan pada pop-up "Join Komunitas" bisa diubah di `public/pendaftaran.html` (cari `chat.whatsapp.com`).
- Untuk mengganti/menambah pilihan avatar, tambahkan file SVG baru ke `public/avatars/` dan daftarkan nama filenya di array `AVATARS` pada `public/app.js`.
