# NYEMEK! — Dimsum Pedas Bikin Nagih

Website e-commerce makanan **NYEMEK!** dengan konsep visual **Korean Spicy Food Editorial**, dilengkapi katalog interaktif, keranjang belanja, checkout WhatsApp, dan Admin Dashboard.

## Fitur Utama

### Customer Website (`/`)
- **Announcement Bar & Sticky Navigation**: Navigasi responsif dengan akses cepat ke menu, paket hemat, showcase, lokasi outlet, keranjang belanja, dan Admin Dashboard.
- **Hero & Editorial Showcase**: Tata letak editorial gelap kontras tinggi dengan fotografi close-up dimsum pedas.
- **Katalog Interaktif**: Pencarian real-time (nama, deskripsi, kategori), filter kategori, filter level pedas (`0–5`), sorting harga/nama/terbaru, dan modal detail produk.
- **Promosi & Paket Bundling**: Kode promo aktif (`NYEMEK10`, `RAMEHEMAT`, `BORONG20`, `RESELLER25`) yang bisa langsung diterapkan ke keranjang.
- **Keranjang Belanja & Checkout WhatsApp**: Validasi stok otomatis, perhitungan subtotal & diskon, form metode pengiriman (`Delivery`, `Pickup`, `Frozen Reseller`), pembuatan draft pesanan lokal, dan tautan WhatsApp terenkode rapi.

### Admin Dashboard (`/admin`)
- **Login Demo**: Username `admin` / Password `admin` (dapat diubah di menu Pengaturan Admin).
- **Overview**: KPI katalog, stok, jumlah pesanan, transaksi tercatat, estimasi pendapatan dari data riil, dan produk terlaris.
- **Manajemen Produk (CRUD)**: Tambah, edit, aktif/nonaktifkan, dan hapus produk dengan validasi harga, diskon, stok, level pedas, dan URL gambar.
- **Manajemen Kategori**: Tambah, edit, dan hapus kategori dengan pengalihan produk aman.
- **Manajemen Pesanan**: Filter status/tanggal, ubah status pesanan & pembayaran, cetak struk detail, dan hapus pesanan.
- **Manajemen Inventori**: Pantau stok tersedia, stok menipis, habis, tombol tambah/kurang cepat, dan riwayat perubahan stok.
- **Manajemen Promosi**: Kelola kode promo, persentase/nominal diskon, minimal belanja, dan periode berlaku.
- **Pengaturan Toko & Data**: Ubah informasi outlet, nomor WhatsApp, Google Maps, banner promo, serta Export/Import JSON dan Reset Data Demo.

## Instalasi & Menjalankan Lokal

```bash
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`.

## Pengujian & Build

```bash
# Jalankan unit test Vitest
npm test

# Typecheck TypeScript
npm run lint

# Build produksi
npm run build
```

## Keterbatasan Versi Frontend-Only
- Data disimpan di `localStorage` browser (`nyemek_products`, `nyemek_categories`, `nyemek_cart`, `nyemek_settings`, `nyemek_orders`, `nyemek_promotions`, `nyemek_inventory`, `nyemek_admin_session`).
- Autentikasi `admin`/`admin` ditujukan untuk demonstrasi prototipe lokal; deployment produksi wajib menggunakan backend authentication, database terpusat, dan verifikasi pembayaran server-side.
