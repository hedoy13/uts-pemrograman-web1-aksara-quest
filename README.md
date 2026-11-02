# Aksara Quest

Aplikasi web pemesanan buku online bertema game RPG, dibuat sebagai tugas UTS **Pemrograman Web 1**. Pengguna berperan sebagai petualang di sebuah guild: buku menjadi item, pesanan menjadi quest, dan setiap aksi memberi XP.

Proyek ini berfokus pada **front-end**. Tidak ada server atau database. Semua data berasal dari file `js/data.js` berformat array dan objek JSON, lalu data tambahan dari pengguna disimpan di browser (`localStorage`).

## Tautan

| Keterangan | Tautan |
|---|---|
| Video penjelasan (YouTube) | https://youtu.be/DdzBgyNxxJI?si=1sOSGH-7Y3rT06wl |
| Kode sumber (GitHub) | https://github.com/hedoy13/uts-pemrograman-web1-aksara-quest |
| Aplikasi online (GitHub Pages) | https://hedoy13.github.io/uts-pemrograman-web1-aksara-quest/ |

## Identitas

- Nama: Mushlih hadi
- NIM: 312600335
- Mata kuliah: Pemrograman Web 1

## Akun untuk mencoba

| Email | Password | Role |
|---|---|---|
| amirarifda17@gmail.com | zaracantik123 | User |
| rina@gmail.com | rina123 | User |
| agus@gmail.com | agus123 | User |
| siti@gmail.com | siti123 | Admin |

Nomor Delivery Order contoh untuk halaman tracking: `20230012` dan `20230013`.

## Halaman dan fitur

| Halaman | Isi |
|---|---|
| `index.html` (login) | Form email dan password dengan validasi, alert "Email/password yang anda masukkan salah" bila gagal, serta modal **Lupa Password** dan **Daftar**. `login.html` hanya mengalihkan ke halaman ini. |
| `dashboard.html` | Salam sesuai jam lokal (pagi, siang, sore, malam), empat menu navigasi (Katalog, Lacak, Laporan, Riwayat), dan panel Misi Petualangan. |
| `stok.html` | Tabel katalog dinamis dari `dataKatalogBuku`, pencarian, penanda stok menipis, kelangkaan item, dan form **tambah baris stok** lewat manipulasi DOM. |
| `checkout.html` | Keranjang yang bisa ditambah, diubah, dan dihapus, form pemesan dan pembayaran dengan validasi, perhitungan ongkos kirim dan total, serta tab **Laporan** dan **Riwayat** transaksi. |
| `tracking.html` | Pencarian nomor Delivery Order, progres pengiriman empat tahap, detail ekspedisi, tanggal kirim, jenis paket, total pembayaran, dan riwayat perjalanan paket. |

Fitur tambahan: HUD dengan level, bar XP, dan koin; sistem misi; kelangkaan item berdasarkan harga; desain responsif; dan dukungan navigasi keyboard.

## Teknologi

- HTML5 semantik (`header`, `nav`, `main`, `section`, `aside`, `footer`, `dialog`, `table`, `ol`, `dl`, `time`)
- CSS3: file external, variabel CSS, grid, flexbox, media query, `clip-path`
- JavaScript (vanilla): manipulasi DOM, validasi form, `localStorage` dan `sessionStorage`
- Font dari Google Fonts: Pixelify Sans dan Rajdhani

## Struktur folder

```
tugas-uts-web1/
|-- index.html        (halaman login)
|-- login.html        (pengalihan ke index.html)
|-- dashboard.html
|-- stok.html
|-- checkout.html
|-- tracking.html
|-- css/
|   |-- style.css
|-- js/
|   |-- data.js       (data pengguna, katalog, dan tracking)
|   |-- script.js     (logika semua halaman)
|-- assets/
|   |-- logo.svg
|-- img/
|   |-- (sampul buku .jpg)
|-- README.md
```

## Cara menjalankan

1. Unduh atau clone repositori ini.
2. Buka `index.html` di browser, atau jalankan dengan ekstensi **Live Server** di VS Code.
3. Login dengan salah satu akun di atas.

Koneksi internet dibutuhkan agar font Google Fonts tampil. Tanpa internet, aplikasi tetap berjalan dengan font bawaan.

## Catatan teknis

- Satu file `script.js` dipakai semua halaman. Atribut `data-page` pada `<body>` menentukan fungsi mana yang dijalankan (`initLogin`, `initDash`, `initStok`, `initCheckout`, `initTrack`).
- Akun baru, buku baru, pesanan baru, keranjang, dan kemajuan misi disimpan di `localStorage`. Untuk mengembalikan data ke kondisi awal, buka DevTools, lalu **Application > Local Storage > Clear**.
- Sesi login disimpan di `sessionStorage`, jadi otomatis hilang saat tab ditutup.
- Pada `data.js` bawaan soal, saya memperbaiki tiga kesalahan kecil: ekstensi gambar PAUD (`.jpeg` menjadi `.jpg`), satu tanggal yang salah ketik (`2025-08 25`), dan satu urutan jam perjalanan yang terbalik. Satu akun contoh juga ditambahkan.
- Password pada data contoh disimpan apa adanya karena ini hanya simulasi front-end. Aplikasi sungguhan tidak boleh menyimpan password seperti ini.
