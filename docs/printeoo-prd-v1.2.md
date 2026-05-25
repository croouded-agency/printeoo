# Printeoo — Product Requirements Document (PRD)
**Version:** 1.2  
**Status:** Ready for Development  
**Last Updated:** 2026-05-25  
**Prepared for:** Development Team / Claude Code / Codex  

---

## CHANGELOG

| Versi | Tanggal | Perubahan | Oleh |
|---|---|---|---|
| 1.0 | 2026-05-23 | Initial draft | Ahmad |
| 1.1 | 2026-05-25 | Multi-item SPK, traceability material revamp, role Kurir, role Gudang permission matrix, sistem insentif, Portal Karyawan | Ahmad + Printeoo Dev Assistant |
| 1.2 | 2026-05-25 | Hapus stage "Review Pelanggan", M04 Nota Pesanan + QR tracking, M07 spesifikasi fisik bahan per batch, M15 rename "Master Bahan" → "Daftar Bahan" + UX fixes, M19 tracking publik customer | Ahmad + Printeoo Dev Assistant |

### Ringkasan Perubahan v1.2
1. **M04.4 — Hapus stage `design_review`** dari item lifecycle. Approval desain dilakukan via WA di luar sistem. Revisi tetap bisa dilakukan dengan push-back ke `in_design`.
2. **M04 — Nota Pesanan** ditambahkan: cetak, kirim WA, download PDF, QR tracking customer.
3. **M05 — Kanban** kolom "Review Pelanggan" dihapus. Kolom final: 6 kolom.
4. **M07.2 — Spesifikasi fisik bahan** (ukuran roll, isi per rim, dll) dicatat per batch saat Catat Penerimaan.
5. **M15 — "Master Bahan" di-rename** menjadi "Daftar Bahan". Form disederhanakan: hanya Nama, Kategori, Satuan, Stok Minimum.
6. **M15 — Inline create bahan baru** dari dropdown BOM dan dropdown Catat Penerimaan.
7. **M19 — Halaman tracking publik** (`/track/{spk_id}`) untuk customer scan QR dari nota.
8. **Open Questions diupdate** — item #10 resolved.

---

## CARA MENGGUNAKAN DOKUMEN INI

Dokumen ini adalah sumber kebenaran tunggal (single source of truth) untuk semua keputusan product dan development Printeoo. Sebelum coding modul apapun:

1. Baca Section 1–4 untuk konteks produk
2. Baca modul yang relevan di Section 6
3. Ikuti acceptance criteria sebagai definisi "done"
4. Semua edge case yang tidak tercakup di sini — tanyakan ke Product Owner sebelum implement

---

## 1. PRODUCT OVERVIEW

### 1.1 Visi Produk
Printeoo adalah platform manajemen print shop pertama di Indonesia yang sepenuhnya berpihak pada pemilik usaha. Kami membangun software yang memberikan visibility penuh atas operasional, tanpa menggunakan data pelanggan untuk kepentingan bisnis kami sendiri.

### 1.2 Problem Statement
Print shop di Indonesia — terutama skala menengah — menghadapi masalah utama:

1. **Operasional masih manual.** SPK ditulis di kertas, hilang saat ramai. Tidak ada tracking real-time dari order masuk sampai selesai.
2. **Tidak ada visibility bisnis.** Pemilik tidak tahu produk mana yang paling profitable, berapa waste material per bulan, atau berapa sebenarnya cost per job.
3. **Software yang ada mahal dan tidak dipercaya.** Solusi incumbent harganya Rp 100 juta+ per modul dan terbukti menggunakan data pelanggan untuk kepentingan bisnis mereka sendiri.
4. **Loss material tidak terdeteksi.** Print shop sering kehilangan material tanpa tahu dari mana — karena tidak ada traceability antara proyek dan material yang dipakai. Deviasi antara estimasi dan aktual tidak pernah diukur.
5. **Karyawan tidak termotivasi.** Tidak ada sistem insentif yang transparan dan terhubung ke output nyata per pekerjaan.

### 1.3 Target User
**Primary:** Pemilik dan operator print shop skala menengah di Indonesia (5–50 karyawan, 1–5 cabang)

**Secondary:** Print shop yang belum menggunakan software apapun, masih manual

**Tertiary:** Grup percetakan besar dengan kebutuhan multi-cabang dan enterprise

### 1.4 Core Value Proposition
- **Harga masuk rendah** — subscription bulanan, mulai Rp 400rb, bukan Rp 100 juta one-time
- **Data 100% milik pelanggan** — Printeoo tidak pernah menggunakan data operasional tenant
- **Traceability end-to-end** — setiap SPK bisa di-trace: siapa input, material apa per item, berapa deviasi dari estimasi, siapa kerjakan, berapa cost
- **Mudah diadopsi** — tidak butuh training panjang, bisa jalan dalam 1 hari

---

## 2. SUBSCRIPTION TIERS

| Tier | Nama | Target | Max Cabang | Harga/Bulan |
|---|---|---|---|---|
| 1 | Solo | Print shop 1–2 orang, baru mulai digital | 1 | ~Rp 400rb |
| 2 | Studio | Print shop 3–10 karyawan | 1 | ~Rp 800rb |
| 3 | Pro | Print shop established, mulai scale | 1 | ~Rp 1,5 juta |
| 4 | Business | Multi-cabang, tim besar | Unlimited | ~Rp 3 juta |
| 5 | Enterprise | Grup besar, kebutuhan custom | Unlimited + custom | Custom |

*Harga final ditentukan setelah validasi market. Angka di atas adalah working estimate.*

**Module Access per Tier:**

| Module | Solo | Studio | Pro | Business | Enterprise |
|---|---|---|---|---|---|
| SPK Digital & Kasir (multi-item) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Nota Pesanan (cetak + WA + QR tracking) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Production Board (per item) | — | ✓ | ✓ | ✓ | ✓ |
| Inventory Dasar + QR Label | — | ✓ | ✓ | ✓ | ✓ |
| HR Dasar + Portal Karyawan | — | ✓ | ✓ | ✓ | ✓ |
| Antrian & Display | — | — | ✓ | ✓ | ✓ |
| Job Costing per Item | — | — | ✓ | ✓ | ✓ |
| Payroll Lengkap + Insentif | — | — | ✓ | ✓ | ✓ |
| Web-to-Print API | — | — | ✓ | ✓ | ✓ |
| Akuntansi & Pajak | — | — | — | ✓ | ✓ |
| Multi-Branch | — | — | — | ✓ | ✓ |
| Custom Role | — | — | — | — | ✓ |
| White-label | — | — | — | — | ✓ |
| Dedicated Support & SLA | — | — | — | — | ✓ |

---

## 3. USER ROLES & PERMISSIONS

### 3.1 Role Definitions

**`owner`** — Akses penuh ke semua modul semua cabang. Bisa konfigurasi insentif, manage subscription, billing.

**`branch_manager`** — Akses penuh ke cabang yang ditugaskan. Tidak bisa akses cabang lain atau settings billing.

**`cashier`** — Input order multi-item, proses pembayaran, cetak/kirim nota, lihat daftar order.

**`designer`** — Lihat dan update item SPK di queue desain. Upload file, tandai design ready.

**`operator`** — Lihat board produksi per item, update status item, scan QR material saat ambil dari gudang, input qty material dan waste per item.

**`warehouse`** — Full access inventory: incoming, cetak label QR, stock opname, adjustment, laporan waste. Submit request PO (tidak approve). Read-only untuk order.

**`courier`** — Delivery queue milik sendiri. Update status pengiriman. Upload foto bukti. Portal Karyawan aktif.

**`hr_admin`** — Full access HR, absensi, payroll, insentif.

**`accountant`** — Full access laporan keuangan, jurnal, pajak. Read-only untuk order, inventory, payroll.

**`display`** — Read-only production display (TV/tablet). Zero interaction. Session tidak expired.

### 3.2 Permission Matrix

| Action | owner | branch_mgr | cashier | designer | operator | warehouse | courier | hr_admin | accountant | display |
|---|---|---|---|---|---|---|---|---|---|---|
| Manage tenant settings | ✓ | — | — | — | — | — | — | — | — | — |
| Manage users & roles | ✓ | R | — | — | — | — | — | — | — | — |
| Configure incentive rules | ✓ | — | — | — | — | — | — | ✓ | — | — |
| Create/edit order (SPK) | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| Cetak / kirim nota pesanan | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| View all orders | ✓ | ✓ | ✓ | R | R | R | — | — | R | — |
| Update SPK item status | ✓ | ✓ | ✓ | ✓(desain) | ✓(produksi) | — | — | — | — | — |
| Process payment | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| View production board | ✓ | ✓ | R | ✓ | ✓ | — | — | — | — | R |
| Input material usage (scan/manual) | ✓ | ✓ | — | — | ✓ | ✓ | — | — | — | — |
| Manage inventory | ✓ | ✓ | — | — | — | ✓ | — | — | — | — |
| Cetak label QR material | ✓ | ✓ | — | — | — | ✓ | — | — | — | — |
| Submit PO request | ✓ | ✓ | — | — | — | ✓(submit) | — | — | — | — |
| Approve PO | ✓ | ✓ | — | — | — | — | — | — | — | — |
| View delivery queue (semua) | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| View delivery queue (milik sendiri) | — | — | — | — | — | — | ✓ | — | — | — |
| Update delivery status | ✓ | ✓ | ✓ | — | — | — | ✓ | — | — | — |
| Manage employees | ✓ | R | — | — | — | — | ✓ | — | — | — |
| Process payroll | ✓ | — | — | — | — | — | ✓ | — | — | — |
| View own incentive | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| View others' incentive | ✓ | R(branch) | — | — | — | — | ✓ | — | — | — |
| View financial reports | ✓ | R(branch) | — | — | — | — | — | ✓ | — | — |
| View Portal Karyawan (milik sendiri) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| View audit log | ✓ | — | — | — | — | — | — | — | — | — |

### 3.3 Warehouse Permission Detail

| Fitur Inventory | Warehouse |
|---|---|
| Lihat stok bahan | ✓ |
| Catat penerimaan barang (incoming) + spesifikasi fisik | ✓ |
| Generate & cetak label QR | ✓ |
| Catat pengeluaran barang per SPK | ✓ |
| Stok opname — input fisik | ✓ |
| Submit request PO | ✓ (submit saja) |
| Lihat qty di PO | ✓ |
| Lihat harga di PO | ✗ (harga tersembunyi) |
| Approve PO | ✗ |
| Edit data SPK / order | ✗ |
| Akses data keuangan | ✗ |
| Laporan waste (milik gudang sendiri) | ✓ |

---

## 4. TECHNICAL REQUIREMENTS

*(Tidak ada perubahan dari v1.1)*

---

## 5. GLOBAL UI/UX REQUIREMENTS

### 5.1 Design Principles
- **Clarity over cleverness** — label dan aksi harus jelas tanpa perlu membaca dokumentasi
- **Mobile-first for operators** — kasir, operator, gudang, dan kurir rata-rata pakai tablet atau HP
- **High density untuk owner** — dashboard owner boleh dense karena dibaca di layar besar
- **Maximum 3 tap untuk aksi inti** — untuk role non-desk (operator, gudang, kurir)
- **Bahasa Indonesia** — semua UI default bahasa Indonesia
- **Inline create** — jika user butuh entitas baru (bahan, customer, dll) saat mengisi form, sistem harus support create inline tanpa navigasi keluar

### 5.2 Navigation Structure
```
Sidebar (desktop) / Bottom nav (mobile):
├── Dashboard (owner/manager)
├── Antrian
├── Pesanan (Order / SPK)
├── Produksi
├── Inventaris
├── Pengiriman (courier role: micro-interface)
├── Pelanggan
├── Produk & BOM
├── Karyawan & Payroll
├── Keuangan
└── Pengaturan

Portal Karyawan (semua role kecuali display):
  Accessible via ikon user di header / footer sidebar
  ├── Ringkasan Bulan Ini
  ├── Insentif Saya
  ├── Informasi Saya
  └── Notifikasi & Teguran
```

### 5.3 Color System
- **Biru** — status normal / in progress
- **Hijau** — selesai / lunas / stok aman
- **Oranye** — urgent / perlu perhatian / stok menipis
- **Merah** — overdue / error / stok habis / selisih negatif
- **Abu** — draft / tidak aktif

### 5.4 Notification Patterns
- **Toast** — aksi berhasil atau gagal (3 detik, pojok kanan atas)
- **Bell icon** — notifikasi yang butuh tindak lanjut (badge count)
- **Modal** — konfirmasi aksi destruktif — tombol destruktif wajib outline/secondary, **bukan solid merah**
- **Inline error** — validasi form
- **Insentif mini-toast** — "+Rp X.XXX insentif" saat item selesai, 3 detik

### 5.5 Format Lokal (WAJIB di semua output termasuk nota)
- Format angka: `1.000.000` (titik = ribuan, koma = desimal)
- Format tanggal: `DD MMMM YYYY` (25 Mei 2026)
- Format waktu: 24 jam (16:00, bukan 4:00 PM)
- Timezone default: Asia/Jakarta (WIB)

---

## 6. MODULE SPECIFICATIONS

---

### M01 — Authentication & Tenant Management
*(Tidak ada perubahan dari v1.1)*

---

### M03 — Queue & Antrian
*(Tidak ada perubahan dari v1.1)*

---

### M04 — Order Management (SPK Digital)

#### KONSEP KUNCI: SPK Multi-Item
SPK adalah unit transaksi. Item adalah unit produksi. Satu SPK bisa berisi 1–20 item produk, masing-masing dengan status produksi independen.

#### M04.1 Input Order Baru
*(Tidak ada perubahan dari v1.1)*

#### M04.2 SPK Detail View

**Tombol Aksi — Aturan UX:**
- Tombol "Batalkan SPK": outline style, di dropdown "⋯ Lainnya", bukan di header. Wajib dialog konfirmasi + alasan.
- Tombol "Tandai Diambil" dan "Tandai Lunas": **dua tombol terpisah**, bukan satu.

**Acceptance Criteria:**
- [ ] Setiap item ditampilkan dengan status individual-nya
- [ ] Material usage per item: tampilkan estimasi vs aktual vs deviasi
- [ ] Tombol "Batalkan" tidak solid merah — outline + di dropdown
- [ ] Ada dua tombol terpisah: "Tandai Diambil" dan "Tandai Lunas"

#### M04.3 Daftar Order

**Acceptance Criteria:**
- [ ] Filter "Overdue" tersedia sebagai shortcut sejajar "Hari Ini" dan "Minggu Ini"
- [ ] Row overdue: highlight merah, sort ke atas

#### M04.4 SPK Item Lifecycle & Status Transitions *(DIUPDATE v1.2)*

Status `design_review` **dihapus**. Approval desain dilakukan via WA di luar sistem.

```
Status Item         Siapa yang bisa trigger       Kondisi
────────────────────────────────────────────────────────────
confirmed        → design_queue   cashier, manager    Jika item butuh desain
confirmed        → prod_queue     cashier, manager    Jika tidak butuh desain
design_queue     → in_design      designer            Mulai dikerjakan
in_design        → prod_queue     designer            Desain selesai, customer approve via WA
in_design        → in_design      cashier, manager    Push back jika customer minta revisi
                                                       (wajib isi catatan alasan)
prod_queue       → printing       operator            Mulai cetak
printing         → finishing      operator            Selesai cetak
finishing        → ready          operator            Selesai semua
```

**Status SPK (level transaksi — derived):**
```
ready (semua item) → delivered (customer ambil) atau installation
installation       → delivered
delivered          → closed (setelah lunas)
```

**Status enum final untuk `order_items.status`:**
```
confirmed | design_queue | in_design | production_queue | printing | finishing | ready
```

**Acceptance Criteria:**
- [ ] Status `design_review` tidak ada di sistem
- [ ] Push-back ke `in_design` wajib disertai catatan alasan
- [ ] Insentif operator dihitung saat item → `ready`
- [ ] Saat semua item `ready` → trigger notifikasi customer (WA) + notifikasi kurir

#### M04.5 — Nota Pesanan *(BARU v1.2)*

**User Story:** Sebagai kasir, saya ingin bisa memberikan bukti pesanan kepada customer — baik dicetak langsung, dikirim via WA, atau di-download — sehingga customer punya dokumen resmi dan bisa cek status ordernya kapanpun.

**Konten Nota:**
- Header bisnis: logo, nama bisnis, telepon, kota (dari Pengaturan → Profil Bisnis)
- Nomor SPK, tanggal, nama kasir
- Data customer: nama, nomor HP
- Daftar item: nama produk, qty, harga satuan, total per item
- Subtotal, diskon (jika ada), total, DP dibayar, sisa tagihan
- Deadline dan prioritas
- QR code — encode URL tracking: `https://app.printeoo.com/track?spk={spk_id}`
- Footer dan syarat & ketentuan (dari Pengaturan → Profil Bisnis)

**Tiga output format:**

| Format | Cara | Trigger |
|---|---|---|
| Cetak | `window.print()` dari halaman nota print-ready | Tombol "Cetak Nota" di detail SPK |
| Kirim WA | Buka `wa.me/{nomor}?text=...` dengan pesan pre-filled + link tracking | Tombol "Kirim WA" di detail SPK |
| Download PDF | Print dialog browser (save as PDF) | Tombol "Download PDF" di detail SPK |

**Halaman nota** (`/nota/{spk_id}`): tanpa sidebar, tanpa header navigasi, murni dokumen. CSS `@media print` menyembunyikan semua elemen non-dokumen.

**Modal sukses setelah save order baru:**
```
✅ Pesanan berhasil disimpan! SPK-SBY-20260525-0042
[🖨️ Cetak Nota Sekarang]  [📱 Kirim WA ke Customer]  [📋 Lihat Detail SPK]
```

**Acceptance Criteria:**
- [ ] Tombol "Cetak Nota", "Kirim WA", "Download PDF" ada di detail SPK
- [ ] Halaman nota bersih tanpa elemen navigasi
- [ ] QR code ter-generate dengan URL tracking yang benar
- [ ] Kirim WA membuka WhatsApp dengan pesan pre-filled + nomor customer
- [ ] Format tanggal Indonesia, format waktu 24 jam di semua output nota
- [ ] Modal sukses muncul setelah save order baru

#### M04.6 — Halaman Tracking Customer (Publik) *(BARU v1.2)*

Route: `/track/{spk_id}` — **publik, tanpa login**, mobile-first, tanpa sidebar.

Customer buka halaman ini dengan scan QR di nota.

**Yang DITAMPILKAN:**
- Nama bisnis + logo
- Nomor SPK
- 5 milestone yang disederhanakan: Terkonfirmasi → Desain → Produksi → Finishing → Siap Ambil
- Status aktif saat ini + waktu update terakhir
- Nama item-item yang dipesan (tanpa harga)
- Deadline
- Kontak bisnis (tombol "Hubungi via WA")

**Yang TIDAK DITAMPILKAN:**
- Harga, total, DP, sisa tagihan
- Nama operator/desainer assigned
- Catatan internal
- Detail material atau batch

**Mapping status internal → milestone customer:**
```
confirmed / design_queue / in_design  →  "Desain"
production_queue / printing           →  "Produksi"
finishing                             →  "Finishing"
ready / delivered                     →  "Siap Ambil"
closed                                →  "Selesai"
```

**Catatan untuk production:** URL tracking tidak menggunakan nomor SPK sequential langsung — gunakan token/hash untuk mencegah enumerasi SPK orang lain.

**Acceptance Criteria:**
- [ ] Halaman `/track/{spk_id}` bisa diakses tanpa login
- [ ] Menampilkan 5 milestone dengan status aktif yang jelas
- [ ] Tidak menampilkan harga atau informasi internal apapun
- [ ] Mobile-first layout, readable di layar 320px ke atas
- [ ] Tombol "Hubungi via WA" membuka WhatsApp ke nomor bisnis

---

### M05 — Production Board *(DIUPDATE v1.2)*

#### M05.1 Kanban Board

**Kolom final (6 kolom — "Review Pelanggan" dihapus):**
```
Antrian Desain | Sedang Desain | Antrian Cetak | Sedang Cetak | Finishing | Siap Ambil
```

**Role-based kolom visibility (diupdate):**
- `designer`: Antrian Desain, Sedang Desain *(bukan lagi + Review Pelanggan)*
- `operator`: Antrian Cetak, Sedang Cetak, Finishing, Siap Ambil
- `owner` / `branch_manager`: semua kolom
- `cashier`: read-only, semua kolom

*(Semua acceptance criteria lainnya tidak berubah dari v1.1)*

---

### M06 — Production Display Mode
*(Tidak ada perubahan dari v1.1)*

---

### M07 — Inventory & Gudang

#### M07.1 Daftar Bahan *(RENAME v1.2)*

**Nama modul diubah dari "Master Bahan" menjadi "Daftar Bahan"** di seluruh UI.

Daftar Bahan adalah registrasi *jenis* bahan — bukan pencatatan stok. Stok dan harga masuk lewat Catat Penerimaan.

**Form Tambah Bahan (disederhanakan v1.2):**
- Nama Bahan* 
- Kategori*
- Satuan*
- Stok Minimum (opsional) — alert jika stok di bawah ini

**Field yang DIHAPUS dari form:** Harga Beli — harga masuk lewat Catat Penerimaan, bukan dari sini.

**Helper text form:**
> "Daftarkan jenis bahan ke sistem. Stok dan harga beli dicatat di Inventaris → Catat Penerimaan setiap kali barang datang dari supplier."

**Empty state (saat tabel kosong):**
```
Belum ada bahan terdaftar.

Cara kerjanya:
1. Daftarkan jenis bahan di sini (nama, kategori, satuan)
2. Catat penerimaan di Inventaris setiap kali barang datang
3. Stok dan harga terupdate otomatis

[+ Tambah Bahan Pertama]
```

**Tabel Daftar Bahan — perilaku per state:**
- Bahan sudah pernah diterima: kolom Aksi = [Detail]
- Bahan belum pernah diterima (stok = 0): kolom Aksi = [Catat Penerimaan Pertama →]
- Kolom Stok / Harga kosong: tampilkan `—` dengan tooltip "Belum ada penerimaan. Catat di Inventaris → Catat Penerimaan"

**Inline create dari form lain:**
Dropdown "Pilih Bahan" di form BOM dan form Catat Penerimaan mendukung inline create:
```
[ketik nama bahan yang tidak ada...]
───────────────────────────
Tidak ditemukan: "Vinyl Korea"
[+ Daftarkan "Vinyl Korea" sebagai bahan baru]
```
Klik → mini-modal tambah bahan → setelah simpan, dropdown otomatis terpilih ke bahan baru.

**Acceptance Criteria:**
- [ ] Semua teks "Master Bahan" di UI sudah diganti "Daftar Bahan"
- [ ] Form Tambah Bahan tidak punya field Harga Beli
- [ ] Form punya field Stok Minimum
- [ ] Helper text tidak menggunakan kata "otomatis" untuk proses manual
- [ ] Empty state menampilkan 3 langkah
- [ ] Bahan tanpa stok menampilkan tombol "Catat Penerimaan Pertama →"
- [ ] Inline create berfungsi di dropdown BOM dan Catat Penerimaan

#### M07.2 Incoming Material — Catat Penerimaan *(DIUPDATE v1.2)*

**Tambahan: Section Spesifikasi Fisik Bahan**

Di modal Catat Penerimaan, setelah field Qty Diterima, tambahkan section:

```
SPESIFIKASI FISIK BAHAN (opsional tapi direkomendasikan)
Digunakan untuk kalkulasi estimasi material otomatis di setiap order.
Pilih bahan terlebih dahulu untuk melihat field yang relevan.
```

Field yang muncul **sesuai kategori bahan:**

**Media Cetak / Stiker / Finishing (satuan: roll):**
- Panjang Roll* (meter) — contoh: 50
- Lebar Roll* (meter) — contoh: 1.52
- Ketebalan (mm, opsional) — contoh: 0.8
- Preview otomatis: "Luas 1 roll = 50 × 1.52 = 76 m² → 0.0132 roll/m²"

**Kertas (satuan: rim):**
- Isi per Rim* (lembar) — contoh: 500
- Ukuran Kertas (dropdown: A4 / A3 / F4 / Custom)
- Preview: "1 rim = 500 lembar A4"

**Tinta (satuan: liter/ml):**
- Volume per Kemasan (ml/liter) — contoh: 1000
- Jenis Tinta (teks) — contoh: Pigment, Dye, Eco-Solvent

**Aksesoris / lainnya (satuan: pcs/pack):**
- Isi per Pack (pcs, opsional) — contoh: 100

**Penyimpanan spesifikasi:** Di level **batch**, bukan di master bahan. Alasannya: supplier berbeda bisa punya spesifikasi berbeda untuk bahan yang sama.

**QR Label setelah penerimaan:** Label mencantumkan spesifikasi fisik (contoh: "50m × 1.52m | 76 m²/roll").

**Acceptance Criteria:**
- [ ] Section Spesifikasi Fisik ada di modal Catat Penerimaan
- [ ] Field menyesuaikan kategori bahan yang dipilih
- [ ] Preview kalkulasi otomatis muncul saat input panjang × lebar roll
- [ ] Spesifikasi tersimpan di level batch
- [ ] QR label mencantumkan spesifikasi fisik

#### M07.2b — QR Label Fisik
*(Tidak ada perubahan)*

#### M07.3 — Traceability Material: Flow Tiga Layer
*(Tidak ada perubahan dari v1.1)*

#### M07.4–M07.10
*(Tidak ada perubahan dari v1.1)*

---

### M08 — Job Costing
*(Tidak ada perubahan dari v1.1)*

---

### M09 — POS & Kasir
*(Tidak ada perubahan dari v1.1)*

---

### M10 — HR & Payroll
*(Tidak ada perubahan dari v1.1)*

---

### M14 — Notification Center
*(Tidak ada perubahan dari v1.1)*

---

### M15 — Product & Pricing Catalog (Produk & BOM)

#### M15.1–M15.5
*(Tidak ada perubahan)*

#### M15.6 — Bill of Materials per Produk *(DIUPDATE v1.2)*

**Fields per BOM entry:**
- Produk (relasi ke M15.1)
- Bahan (relasi ke M07.1 — dengan inline create jika belum ada)
- Formula qty: flat / per m² / per qty ordered
- Waste factor (%) — *field ini wajib ada, tidak boleh kosong default 0*
- Satuan output

**Preview Kalkulasi (interaktif):**
- Input qty order atau dimensi → estimasi material ter-update realtime
- Tampilkan breakdown: "formula × qty × (1 + waste%) = total estimasi"
- Referensi spesifikasi batch: "Menggunakan spek batch terbaru: 50m × 1.52m = 76 m²/roll"
- Jika belum ada batch dengan spesifikasi: warning + link "Catat Penerimaan →"

**Acceptance Criteria:**
- [ ] BOM bisa dikonfigurasi untuk satu produk menggunakan beberapa bahan
- [ ] Field Waste wajib ada (default: 0%)
- [ ] Preview kalkulasi realtime dengan breakdown formula
- [ ] Inline create bahan baru dari dropdown BOM
- [ ] Jika produk tidak punya BOM: warning di form order dan di kanban card

---

### M19 — Manajemen Pengiriman (Delivery)
*(Tidak ada perubahan dari v1.1, termasuk M19.1 dan M19.2)*

---

## 7. PROTOTYPE REQUIREMENTS
*(Sudah selesai — prototype v1 complete. Section ini referensi historis.)*

---

## 8. NON-FUNCTIONAL REQUIREMENTS
*(Tidak ada perubahan dari v1.0)*

---

## 9. DEVELOPMENT PRIORITIES (Sprint Order)

### Sprint 1–2: Foundation
- M01 Auth + role `courier` + permission matrix lengkap
- M02 User & role management
- Database schema: `order_items`, `bom_entries`, `bom_estimates`, `material_batch` (dengan kolom spesifikasi fisik), `delivery_assignments`, `incentive_configs`, `incentive_records`, `reprimands`
- Basic navigation shell

### Sprint 3–4: Core Operations
- M04 Order / SPK multi-item — **status enum tanpa `design_review`**
- M04.5 Nota Pesanan (cetak, WA, PDF)
- M04.6 Halaman tracking publik `/track/{spk_id}`
- M15 Product catalog + BOM (dengan field waste wajib + preview kalkulasi)
- M07.1 Daftar Bahan (form disederhanakan, inline create)
- M09 POS kasir

### Sprint 5–6: Production
- M05 Production board per item — **6 kolom tanpa Review Pelanggan**
- M06 Production display (item-based card)
- M03 Queue system

### Sprint 7–8: Intelligence & Traceability
- M07.2 Catat Penerimaan + **spesifikasi fisik per batch**
- M07.2b QR label (mencantumkan spesifikasi fisik)
- M07.3 Traceability Layer 1 + 2 + 3
- M08 Job costing per item
- M13 Owner dashboard
- M19 Modul Pengiriman

### Sprint 9–10: People & Money
- M10.1–M10.8 HR & payroll
- M10.9 Sistem Insentif per item
- M10.10 Portal Karyawan
- M11 Akuntansi dasar
- M17 CRM customer

### Sprint 11–12: Integration & Scale
- M12 Web-to-print API
- M11 Pajak
- M01 Multi-branch (Business tier)
- Billing & subscription management

---

## 10. OPEN QUESTIONS & DECISIONS NEEDED

### ✅ RESOLVED

1. ~~SPK multi-item atau single?~~ → Multi-item. Item = unit produksi, SPK = unit transaksi.
2. ~~Traceability material — level implementasi?~~ → Layer 1 + 2 + 3.
3. ~~Role kurir — terpisah?~~ → Ya, role `courier` dengan micro-interface.
4. ~~"Review Pelanggan" di kanban?~~ → **DIHAPUS.** Approval desain via WA di luar sistem. Push-back ke `in_design` dengan catatan jika revisi.
5. ~~Spesifikasi fisik bahan disimpan di mana?~~ → Di level batch saat Catat Penerimaan. Bukan di master/daftar bahan.
6. ~~Redundansi form Tambah Bahan vs Catat Penerimaan?~~ → Resolved: Daftar Bahan = registrasi jenis bahan saja (tanpa harga/stok). Catat Penerimaan = input stok fisik masuk.

### ❓ MASIH OPEN

1. **Pricing final** — belum divalidasi ke market.
2. **WA API provider** — Fonnte vs WA Business Cloud API?
3. **Hosting provider** — Railway vs Render vs VPS?
4. **Domain final** — `printeoo.com` dan `printeoo.id` sudah secured?
5. **Offline strategy** — full offline atau tolerant saja?
6. **Printsoft migration tool** — perlu dibangun?
7. **Prefix antrian (A/B/C)** — definisi bisnis: A = apa, B = apa?
8. **Assign kurir — otomatis atau manual?**
9. **Insentif kurir** — per SPK atau per km/pengiriman?

---

*Dokumen ini adalah living document. Setiap perubahan requirement harus dicatat di sini sebelum diimplementasikan.*
