# TASK-117 — Fix Sidebar Branch Manager
**Priority:** 🔴 HIGH  
**Tanggal:** 2026-05-25  
**Konteks:** Baca `docs/printeoo-prd-v1.2.md` Section 3 (Permission Matrix) sebelum mulai.

---

## MASALAH

Sidebar untuk role Branch Manager saat ini hanya menampilkan "Pelanggan". Ini terlalu terbatas dan tidak mencerminkan permission matrix yang sudah didefinisikan. Branch Manager adalah pengelola penuh satu cabang — dia harus bisa akses hampir semua modul operasional.

---

## SIDEBAR YANG BENAR PER ROLE

Gunakan tabel ini sebagai referensi tunggal untuk semua role. Lakukan audit menyeluruh — bukan hanya Branch Manager.

| Menu Sidebar | Owner | Branch Manager | Kasir | Desainer | Operator | Gudang | Kurir |
|---|---|---|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pesanan | ✅ | ✅ | ✅ | ✅ (read) | ✅ (read) | ❌ | ❌ |
| + Pesanan Baru | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pelanggan | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Produksi | ✅ | ✅ | ✅ (read) | ✅ | ✅ | ❌ | ❌ |
| Antrian | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Produk & BOM | ✅ | ✅ | ❌ | ✅ (read) | ✅ (read) | ❌ | ❌ |
| Inventaris | ✅ | ✅ | ❌ | ❌ | ✅ (read) | ✅ | ❌ |
| Karyawan | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Keuangan | ✅ | ✅ (cabang) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pengaturan | ✅ | ✅ (terbatas) | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pengiriman | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (milik sendiri) |
| Profil & Akun Saya | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Portal Saya | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Catatan penting:**
- "read" = menu tampil di sidebar tapi aksi write disembunyikan di dalam halaman
- Branch Manager di Pengaturan: hanya bisa akses tab Profil Bisnis (read), Cabang (hanya cabangnya), Notifikasi. Tab Pengguna & Akses dan Paket & Langganan **disembunyikan**
- Kurir: tidak punya sidebar standar — landing page langsung ke halaman Pengiriman (micro-interface)
- Gudang: landing page saat login langsung ke Inventaris

---

## PERUBAHAN SPESIFIK UNTUK BRANCH MANAGER

Branch Manager harus mendapatkan sidebar yang hampir identik dengan Owner, dengan dua pengecualian:

**Yang disembunyikan dari Branch Manager:**
1. Di halaman Pengaturan: tab "Pengguna & Akses" dan "Paket & Langganan" tidak tampil
2. Di Dashboard: data hanya menampilkan cabangnya sendiri (bukan konsolidasi semua cabang)
3. Di Keuangan: data hanya cabangnya sendiri

**Catatan untuk prototype:** Cukup tampilkan sidebar yang lengkap dulu. Pembatasan data per cabang bisa ditandai sebagai catatan ("data ditampilkan untuk cabang yang ditugaskan") tanpa harus implement filtering data secara penuh.

---

## LANDING PAGE PER ROLE

Saat login, setiap role langsung diarahkan ke halaman yang paling relevan:

| Role | Landing Page |
|---|---|
| owner | Dashboard |
| branch_manager | Dashboard |
| cashier | Pesanan (daftar order) |
| designer | Produksi (kanban — hanya kolom desain) |
| operator | Produksi (kanban — hanya kolom cetak/finishing) |
| warehouse | Inventaris |
| courier | Pengiriman (micro-interface) |
| hr_admin | Karyawan |
| accountant | Keuangan |
| display | Production Display (full screen) |

---

## ACCEPTANCE CRITERIA

- [ ] Branch Manager melihat sidebar lengkap sesuai tabel di atas
- [ ] Branch Manager bisa akses Dashboard, Pesanan, Pelanggan, Produksi, Antrian, Inventaris, Karyawan, Keuangan, Pengaturan
- [ ] Branch Manager di Pengaturan: tab "Paket & Langganan" dan "Pengguna & Akses" tidak tampil
- [ ] Lakukan audit sidebar untuk SEMUA role — pastikan tidak ada role lain yang terlalu terbatas atau terlalu luas
- [ ] Landing page per role sudah sesuai tabel di atas
- [ ] Tidak ada error di console browser setelah perubahan
- [ ] Update `STATE.md` setelah selesai

---

## PATCH STATE.md

```
[2026-05-25] Sidebar dirender berdasarkan role secara ketat.
Branch Manager = sidebar hampir sama dengan Owner, minus tab billing dan user management global.
Kurir = tidak ada sidebar, langsung micro-interface pengiriman.
Gudang = landing page ke Inventaris.
Designer = landing page ke Produksi (kolom desain).
Operator = landing page ke Produksi (kolom cetak/finishing).
```
