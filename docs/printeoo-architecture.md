# Printeoo — Software Architecture Document
**Version:** 0.1 (Pre-Development)  
**Prepared for:** Claude Code / Codex Context  
**Status:** Foundation Draft — ready for implementation planning

---

## 1. SYSTEM OVERVIEW

Printeoo adalah platform SaaS multi-tenant untuk manajemen print shop di Indonesia. Dibangun dengan arsitektur modular yang memungkinkan tier-based feature access, multi-branch per tenant, dan full traceability dari order masuk hingga material habis dan upah terbayar.

### Core Design Principles
- **Tenant isolation first** — tidak ada celah data antar tenant, secara struktural maupun query
- **Traceability end-to-end** — setiap SPK bisa di-trace: siapa input, material apa, berapa habis, siapa kerjakan, berapa upah
- **Role-based access** — setiap user hanya melihat dan bisa aksi sesuai perannya
- **Offline-tolerant** — operator produksi harus bisa update status meski koneksi lambat
- **Mobile-ready** — kasir dan operator akses via tablet, owner via desktop atau mobile
- **Data sovereignty** — data pelanggan tidak pernah diakses oleh tim Printeoo tanpa permintaan eksplisit

---

## 2. TENANT & BRANCH HIERARCHY

```
Printeoo Platform (SaaS Layer)
└── Organization / Tenant (1 print shop bisnis = 1 tenant)
    ├── Subscription Tier (Solo / Studio / Pro / Business / Enterprise)
    ├── Branch / Cabang (1..N tergantung tier)
    │   ├── Users & Roles
    │   ├── Inventory (per cabang atau shared, configurable)
    │   ├── Production Queue
    │   └── Cash Register / POS
    └── Owner Dashboard (konsolidasi semua cabang)
```

### Tier — Branch & Feature Access

| Tier | Max Cabang | Fitur Utama |
|---|---|---|
| Solo | 1 | SPK digital, kasir, laporan dasar |
| Studio | 1 | + Board produksi, inventory dasar, HR sederhana |
| Pro | 1 | + Web-to-print API, antrian, job costing, payroll |
| Business | Unlimited | + Multi-branch, konsolidasi, akuntansi & pajak |
| Enterprise | Unlimited + custom | + White-label, SLA, custom workflow, dedicated support |

---

## 3. MODULE TREE (LENGKAP)

### M01 — Authentication & Tenant Management
- M01.1 Tenant registration & onboarding
- M01.2 User login (email/password + optional SSO)
- M01.3 Session management & JWT
- M01.4 Tenant switching (untuk enterprise multi-entity)
- M01.5 Subscription management & tier enforcement
- M01.6 Branch management (CRUD cabang)
- M01.7 Audit log (semua akses sensitif tercatat)

### M02 — User, Role & Permission
- M02.1 User management per tenant
- M02.2 Role definitions:
  - `owner` — akses penuh semua modul semua cabang
  - `branch_manager` — akses penuh 1 cabang
  - `cashier` — input order, kasir, daftar order
  - `designer` — queue desain, upload file, approval
  - `operator` — board produksi, update status SPK
  - `warehouse` — inventory, incoming, stock opname
  - `hr_admin` — HR, payroll, absensi
  - `accountant` — laporan keuangan, pajak
  - `display` — read-only production display (untuk TV/tablet)
- M02.3 Custom role builder (Enterprise tier)
- M02.4 Permission matrix per module per role

### M03 — Queue & Antrian (Customer-Facing)
- M03.1 Nomor antrian digital (cetak tiket atau QR scan)
- M03.2 Display antrian (layar TV/monitor di ruang tunggu)
  - Tampilan nomor yang sedang dilayani
  - Estimasi waktu tunggu
  - Running text promosi / info
- M03.3 Pemanggilan nomor antrian (audio + visual)
  - Text-to-speech: "Nomor A-012, silakan ke meja 1"
  - Koneksi ke speaker via browser audio API
- M03.4 Multi-counter support (counter 1, 2, 3 dst)
- M03.5 Statistik antrian harian (rata-rata waktu tunggu)

### M04 — Order Management (SPK Digital)
- M04.1 Input order baru
  - Data customer (nama, telp, email — new atau existing)
  - Produk & spesifikasi (dari product catalog)
  - Ukuran, bahan, finishing, qty
  - Deadline
  - Catatan khusus
  - Upload file (support: PDF, AI, CDR, PNG, JPG hingga 100MB)
  - DP / pembayaran awal
- M04.2 Auto-generate nomor SPK (format: SPK-[CABANG]-[YYYYMMDD]-[SEQ])
- M04.3 Auto-generate Nota (cetak atau kirim PDF via WA)
- M04.4 Status SPK lifecycle:
  - `draft` → `confirmed` → `design_queue` → `design_review` → `production_queue` → `printing` → `finishing` → `ready` → `delivered` → `closed`
- M04.5 SPK edit & revision history
- M04.6 SPK duplicate (untuk repeat order)
- M04.7 SPK dari online order (auto-created dari M12)
- M04.8 Prioritas SPK (normal / urgent / VIP)
- M04.9 SPK search & filter (by status, date, customer, produk)
- M04.10 Bulk SPK actions

### M05 — Production Board
- M05.1 Kanban board per cabang
  - Kolom: Antrian Desain → Review Desain → Antrian Cetak → Sedang Cetak → Finishing → Siap Ambil
  - Card: nomor SPK, nama customer, produk, qty, deadline, assigned operator
  - Color coding: normal (biru), urgent (oranye), overdue (merah)
- M05.2 Role-based column visibility
  - Designer: lihat kolom desain saja
  - Operator: lihat kolom cetak & finishing
  - Owner/Manager: lihat semua
- M05.3 Drag & drop update status (atau tap di mobile)
- M05.4 Assign SPK ke operator/desainer spesifik
- M05.5 Timer per SPK (berapa lama di setiap stage)
- M05.6 Notifikasi real-time saat SPK masuk ke queue baru
- M05.7 Production Display Mode (M06)

### M06 — Production Display (Tablet / TV Mode)
- M06.1 Full-screen production board (simplified)
  - Hanya tampilkan: nomor SPK, produk, deadline, status
  - Font besar, high contrast, readable dari 3 meter
- M06.2 Audio notification saat SPK baru masuk
  - "SPK baru masuk: Banner 3x1 meter, deadline hari ini jam 15:00"
  - Configurable: suara notifikasi atau text-to-speech
  - Koneksi ke speaker via browser Web Audio API
- M06.3 Auto-refresh tanpa interaksi (push via WebSocket)
- M06.4 PIN-protected (agar operator tidak bisa ubah data)
- M06.5 Landscape optimized layout
- M06.6 Dark mode / bright mode (untuk kondisi cahaya berbeda)
- M06.7 Optional material QR scanner entry point
  - Tampilkan ikon kamera kecil di pojok layar hanya untuk role yang boleh input produksi/material.
  - Saat ikon diklik, buka scanner overlay berbasis kamera browser dan arahkan hasil scan ke flow `/scan?b={batch_id}&t={tenant_id}`.
  - Jika role aktif adalah `display`, tombol scanner disembunyikan dan display tetap read-only.
  - Implement hanya jika tidak mengganggu layout high-contrast display utama.

### M07 — Inventory & Gudang
- M07.1 Master bahan baku (nama, satuan, kategori, minimum stock)
  - Contoh: Flexi China (roll, meter), Art Paper 150gr (lembar/rim), Tinta Cyan (liter)
- M07.2 Incoming material
  - Purchase order ke supplier
  - Receiving: input qty diterima, batch/lot number, tanggal kadaluarsa (untuk tinta)
  - Status: ordered → in transit → received → stocked

- M07.2b QR label fisik untuk bahan masuk
  - Konsep:
    - Setiap unit/batch material yang masuk ke gudang mendapat label QR unik yang dicetak dan ditempel secara fisik.
    - Label ini adalah identitas fisik bahan tersebut di gudang.
    - Saat bahan digunakan di produksi, operator cukup scan QR sehingga sistem otomatis tahu bahan apa, dari batch mana, dan mengurangi stok.
  - User story:
    - Sebagai staff gudang, saya ingin setiap bahan yang masuk langsung diberi label QR, sehingga operator produksi tidak bisa salah ambil bahan dan semua penggunaan tercatat akurat.
  - Flow lengkap:
    1. Staff gudang selesai input penerimaan barang (M07.2).
    2. Sistem generate QR code per unit/batch/roll.
    3. Staff klik "Cetak Label" lalu print ke label printer atau printer biasa.
    4. Label ditempel ke fisik bahan.
    5. Saat operator ambil bahan untuk produksi:
       - Buka SPK di tablet/HP.
       - Tab "Material" → klik "Scan QR Bahan".
       - Scan QR di bahan → sistem auto-fill nama bahan, batch ID, dan satuan.
       - Operator input qty yang dipakai secara manual → simpan.
    6. Stok berkurang, usage tercatat dengan traceability penuh ke batch asal.
  - QR label content (data yang di-encode):
    ```json
    {
      "type": "MATERIAL",
      "tenant_id": "xxx",
      "item_id": "MAT-001",
      "item_name": "Flexi China",
      "batch_id": "BATCH-20260523-003",
      "received_date": "2026-05-23",
      "unit": "roll",
      "qty_initial": 5,
      "supplier": "CV Sumber Bahan"
    }
    ```
  - Desain label (ukuran 50×30mm, standar label printer thermal):
    ```text
    ┌─────────────────────────────┐
    │ ████ PRINTEOO  ████         │
    │ ████           ████         │
    │ ████  [QR CODE]             │
    │                             │
    │ Flexi China                 │
    │ Batch: BATCH-20260523-003   │
    │ Masuk: 23 Mei 2026          │
    │ 5 Roll | CV Sumber Bahan    │
    └─────────────────────────────┘
    ```
  - Scanner — dua mode:
    - Mode 1: Web app (browser)
      - Gunakan getUserMedia API untuk akses kamera.
      - Library: html5-qrcode atau zxing-js.
      - Berfungsi di Chrome Android/iOS tanpa install apapun.
      - Cocok untuk kasir/operator yang pakai tablet.
    - Mode 2: Android app (future)
      - PWA yang di-install ke tablet/HP Android gudang.
      - Lebih smooth, bisa akses kamera lebih cepat.
      - Bisa tambahkan support barcode scanner fisik (bluetooth/USB).
      - Masuk roadmap Phase 3.
  - Acceptance criteria:
    - Setiap penerimaan barang memiliki tombol "Cetak Label QR".
    - Label bisa dicetak ke thermal label printer 50×30mm atau PDF A4 berisi 24 label per halaman untuk print di printer biasa lalu gunting.
    - QR bisa di-scan dari kamera tablet/HP via browser tanpa install app.
    - Scan QR di form usage material auto-fill bahan dan menampilkan info batch.
    - Jika QR di-scan tapi bahan sudah habis stok, tampilkan warning "Stok batch ini sudah habis" dan minta konfirmasi operator; jangan block hard.
    - Jika QR di-scan dari tenant lain, tampilkan error "Bahan ini bukan milik bisnis Anda".
    - Satu batch bisa cetak label ulang jika label rusak/hilang tanpa generate ID baru.
    - History scan per batch bisa dilihat oleh warehouse/owner, termasuk siapa scan, kapan, dan untuk SPK apa.
  - Catatan teknis:
    - QR encode sebagai URL: `app.printeoo.com/scan?b={batch_id}&t={tenant_id}` sehingga jika di-scan memakai kamera HP biasa, user langsung diarahkan ke halaman relevan setelah login.
    - Tenant ID di-encode untuk validasi lintas tenant.
    - Batch ID adalah UUID (tidak predictable), bukan sequential number, untuk keamanan.
- M07.2c QR scan entry point via URL
  - Route: `GET /scan?b={batch_id}&t={tenant_id}`.
  - Jika user belum login:
    - Redirect ke login page.
    - Simpan intended URL lengkap agar setelah login user kembali ke `/scan?b=...&t=...`.
  - Jika user sudah login tetapi `t` tidak sama dengan tenant aktif user:
    - Tampilkan stripped-down error page: "Bahan ini bukan dari bisnis Anda".
    - Jangan tampilkan data batch dan jangan tulis scan log.
  - Jika valid:
    - Tampilkan halaman mobile-optimized "Batch Info" tanpa sidebar/navigasi lengkap.
    - Data wajib: nama bahan, kategori, satuan, stok tersisa batch, tanggal masuk, supplier.
    - Tombol "Catat Pemakaian" redirect ke form usage SPK dengan `batch_id` pre-filled jika konteks SPK tersedia, atau minta pilih SPK terlebih dahulu.
    - Tombol "Cek Stok Saja" hanya menampilkan informasi stok dan menulis `scan_log.action = "stock_check"`.
  - Handler wajib memakai middleware auth dan tenant isolation yang sama dengan modul internal lain.
- M07.3 Stock real-time per cabang
  - Current stock
  - Reserved (sudah dialokasikan ke SPK aktif)
  - Available (current - reserved)
- M07.4 Material usage per SPK
  - Saat SPK masuk produksi, operator input material yang digunakan
  - Otomatis mengurangi stock available
  - Contoh: SPK-SBY-20260523-0042 menggunakan 2.4 meter Flexi China + 200ml tinta hitam
  - Input material di tab "Material" SPK detail:
    - Dropdown manual pilih bahan tetap tersedia dan tetap menjadi fallback utama.
    - Tombol "Scan QR Bahan" ditempatkan di sebelah dropdown.
    - Scanner memakai `getUserMedia` via `html5-qrcode` atau `zxing-js`; pilih `html5-qrcode` jika belum ada library QR di project.
    - Payload QR boleh berupa URL `/scan?b=...&t=...` atau JSON legacy; parser harus mengambil `batch_id`, `tenant_id`, `item_name`, dan `unit`.
    - Setelah scan valid, auto-fill nama bahan, batch ID, dan satuan. Field qty tetap kosong/wajib diisi manual.
    - Jika stok batch = 0, tampilkan warning "Stok batch ini sudah habis" dan minta konfirmasi sebelum operator lanjut.
    - Jika `tenant_id` payload tidak cocok dengan tenant aktif, tampilkan error "Bahan ini bukan milik bisnis Anda", reset hasil scan, dan batalkan auto-fill.
    - Saat usage disimpan dari hasil scan, tulis scan log dengan `action = "usage_input"` dan `spk_id` terkait.
- M07.5 Waste tracking per SPK
  - Operator input waste (gagal cetak, trim sisa, dll)
  - Waste tercatat dan bisa dianalisa per periode
  - Report: waste rate per produk, per mesin, per operator
- M07.6 Stock opname
  - Input hitungan fisik
  - Sistem generate selisih (sistem vs fisik)
  - Approval & adjustment
- M07.7 Low stock alert (otomatis notifikasi ke warehouse & owner)
- M07.8 Supplier management (nama, kontak, lead time, history)
- M07.9 Inventory valuation (FIFO / average cost)
- M07.10 Traceability: dari batch material → SPK yang menggunakannya
  - `batch_id` dari QR adalah primary lookup key untuk semua query traceability batch.
  - Fungsi "Lihat penggunaan batch ini" wajib query berdasarkan `material_usage.batch_id`, bukan hanya `item_id`.
  - Response minimal: `spk_number`, `tanggal_usage`, `qty_used`, `operator_name`, `waste_qty`.
  - Halaman detail batch menampilkan timeline semua SPK yang memakai batch tersebut.
  - Query tetap difilter tenant aktif; `batch_id` tidak boleh membuka data lintas tenant walaupun UUID diketahui.

### M08 — Job Costing (Per SPK)
- M08.1 Kalkulasi otomatis cost per SPK:
  - Material cost (dari M07.4, harga rata-rata bahan)
  - Labor cost (dari M10, upah operator yang assigned × waktu)
  - Overhead allocation (listrik, mesin — configurable % dari revenue)
  - Variable cost pemasangan (dari M10.6)
- M08.2 Gross margin per SPK
- M08.3 Gross margin per produk (agregat semua SPK produk sejenis)
- M08.4 Profitability report per periode
- M08.5 HPP calculator (bantu hitung harga jual minimum)
- M08.6 Perbandingan: harga jual vs HPP per SPK

### M09 — POS & Kasir
- M09.1 Kasir untuk SPK walk-in
  - Input / pilih SPK yang sudah dibuat
  - Kalkulasi total (+ diskon, + PPN)
  - Metode pembayaran: cash, transfer, QRIS, kartu
  - Print / kirim nota digital (PDF via WA)
- M09.2 DP & pelunasan
  - Record DP saat order masuk
  - Pelunasan saat ambil
  - Outstanding payment list
- M09.3 Cash drawer management
  - Buka/tutup shift kasir
  - Cash in/out
  - Rekonsiliasi akhir shift
- M09.4 Piutang customer (credit customer)
- M09.5 Refund & void
- M09.6 Laporan kasir per shift / per hari

### M10 — HR & Payroll
- M10.1 Master karyawan
  - Data personal, posisi, cabang, tipe kontrak
  - Tipe: tetap bulanan / tetap harian / freelance / borongan
- M10.2 Absensi
  - Check-in/out manual atau via PIN
  - Kalkulasi hari/jam kerja
  - Izin, sakit, cuti
- M10.3 Payroll bulanan (karyawan tetap)
  - Gaji pokok + tunjangan
  - Potongan: BPJS, pajak PPh21, kasbon
  - Slip gaji digital
- M10.4 Payroll harian / mingguan
  - Karyawan harian: gaji = hari hadir × rate harian
  - Fleksibel per periode pembayaran
- M10.5 Payroll borongan
  - Rate per produk / per unit yang diselesaikan
  - Input hasil kerja per periode → otomatis hitung total
- M10.6 Variable cost pemasangan (kasus Yanuar)
  - SPK dengan komponen pemasangan → buat "project upah"
  - Input: jenis pekerjaan, jumlah tukang, jumlah hari, rate/orang/hari
  - Contoh: Pasang billboard → 3 tukang × 2 hari × Rp 250.000 = Rp 1.500.000
  - Cost ini masuk ke job costing SPK terkait (M08)
  - Pembayaran bisa langsung (cash harian) atau batch mingguan
- M10.7 Payroll summary per periode (semua tipe tergabung)
- M10.8 Laporan PPh21 (format siap lapor)

### M11 — Akuntansi & Pajak
- M11.1 Chart of accounts (pre-configured untuk print shop)
- M11.2 Journal entries otomatis dari transaksi:
  - SPK terbayar → revenue journal
  - Material masuk → inventory journal
  - Payroll → expense journal
  - Biaya operasional → expense journal
- M11.3 General ledger
- M11.4 Laporan keuangan:
  - Profit & Loss (per bulan, per kuartal, per tahun)
  - Balance Sheet
  - Cash Flow Statement
- M11.5 Pajak:
  - PPN (faktur pajak masukan & keluaran)
  - PPh 21 (terintegrasi dengan M10.8)
  - PPh 23 (untuk jasa outsource)
  - Export data format e-Faktur (DJP)
- M11.6 Rekonsiliasi bank (upload mutasi bank → match dengan transaksi)
- M11.7 Budget vs actual per periode

### M12 — Web-to-Print API & Integrasi Online
- M12.1 REST API untuk integrasi e-commerce / website print shop
  - Endpoint: create order, get order status, get product catalog, get pricing
  - Authentication: API key per tenant
  - Webhook: notifikasi ke website saat status order berubah
- M12.2 Product catalog sync
  - Owner manage produk & harga di Printeoo
  - Otomatis tersedia via API ke website
- M12.3 Online order inbound
  - Order dari website masuk sebagai SPK draft di Printeoo
  - Notifikasi ke kasir/CS untuk konfirmasi
- M12.4 File upload dari customer online
  - Customer upload file di website → tersimpan di SPK
- M12.5 Order tracking untuk customer
  - Customer bisa cek status SPK via link / nomor HP
  - Real-time status update
- M12.6 WA Notification (via WhatsApp Business API)
  - Trigger: SPK confirmed, SPK selesai produksi, SPK siap ambil
  - Template pesan configurable per tenant

### M13 — Owner & Management Dashboard
- M13.1 Overview harian
  - Order masuk hari ini, selesai hari ini, pending
  - Revenue hari ini vs target vs kemarin
  - SPK overdue (sudah lewat deadline)
- M13.2 Production overview real-time
  - Berapa SPK di setiap stage
  - Operator sedang mengerjakan apa
- M13.3 Analytics:
  - Top 10 produk (by qty & by revenue)
  - Top 10 customer
  - Revenue trend (harian/mingguan/bulanan)
  - Margin trend per produk
  - Waste rate trend
  - Utilisasi mesin (% waktu produktif)
  - Produktivitas operator (SPK/hari per operator)
- M13.4 Multi-branch konsolidasi (Business & Enterprise tier)
  - Side-by-side comparison antar cabang
  - Drill-down ke cabang spesifik
- M13.5 Alert & anomali
  - Revenue drop signifikan
  - Stock hampir habis
  - SPK overdue menumpuk
  - Operator tidak update status lama

### M14 — Notification Center
- M14.1 In-app notifications (bell icon)
- M14.2 WA notification ke customer (via M12.6)
- M14.3 WA / email notification ke owner (summary harian, alert)
- M14.4 Audio notification di production display (via M06.2)
- M14.5 Notification preferences per user (configurable)

### M15 — Product & Pricing Catalog
- M15.1 Master produk (nama, kategori, satuan)
  - Kategori: large format, offset, merchandise, packaging, jasa desain, jasa pasang
- M15.2 Pricing engine:
  - Harga flat (kartu nama, mug, dll)
  - Harga per ukuran / per meter persegi (banner, spanduk)
  - Harga per range qty (makin banyak makin murah — tiered pricing)
  - Harga custom (input manual saat order)
- M15.3 Material linkage (produk X menggunakan bahan Y per satuan)
  - Basis untuk auto-kalkulasi HPP dan stock reservation
- M15.4 Finishing options per produk (laminasi, mata ayam, cutting, dll)
- M15.5 Estimator (kalkulasi harga otomatis berdasarkan spec input)

### M16 — Mesin & Aset
- M16.1 Master mesin (nama, tipe, kapasitas, tahun beli)
- M16.2 Assign SPK ke mesin spesifik
- M16.3 Utilisasi mesin (jam pakai vs jam tersedia)
- M16.4 Maintenance schedule & log
- M16.5 Downtime recording (mesin rusak → SPK di-reroute)
- M16.6 Depreciation tracking (untuk akuntansi)

### M17 — Customer Management (CRM Ringan)
- M17.1 Master customer (nama, kontak, alamat, tipe: retail / korporat / reseller)
- M17.2 History transaksi per customer
- M17.3 Outstanding payment per customer
- M17.4 Customer tier / pricing khusus (VIP customer dapat harga berbeda)
- M17.5 Customer notes (preferensi, catatan khusus)

### M18 — Settings & Konfigurasi
- M18.1 Profil perusahaan (nama, logo, alamat, NPWP)
- M18.2 Konfigurasi cabang
- M18.3 Konfigurasi SPK (prefix nomor, format, auto-assign)
- M18.4 Konfigurasi POS (metode bayar, pajak, diskon)
- M18.5 Konfigurasi notifikasi
- M18.6 Konfigurasi production display
- M18.7 Backup & export data (CSV/Excel per modul)
- M18.8 API key management (untuk integrasi M12)
- M18.9 Audit log viewer (owner dapat lihat semua aktivitas user)

---

## 4. DATA MODEL — ENTITY RELATIONSHIPS (KONSEPTUAL)

```
TENANT
  └── has many: Branch, User, Subscription

BRANCH
  └── belongs to: Tenant
  └── has many: Order, Inventory, User (assigned), Machine

USER
  └── belongs to: Tenant + Branch (atau all branches jika owner)
  └── has one: Role

ORDER (SPK)
  └── belongs to: Branch
  └── has one: Customer
  └── has one: Product (dari catalog)
  └── has many: StatusHistory (lifecycle)
  └── has many: MaterialUsage (→ Inventory)
  └── has many: LaborEntry (→ HR/Payroll)
  └── has many: File (uploaded assets)
  └── has one: Invoice / Nota
  └── has one: JobCost (kalkulasi otomatis)

CUSTOMER
  └── belongs to: Tenant (shared across branches)
  └── has many: Order
  └── has many: Payment

PRODUCT
  └── belongs to: Tenant
  └── has many: PricingRule
  └── has many: MaterialRequirement (→ BOM: bill of materials)

INVENTORY_ITEM (Bahan Baku)
  └── belongs to: Branch (atau Tenant jika shared)
  └── has many: MaterialBatch
  └── has many: StockTransaction (incoming, usage, waste, adjustment)

MATERIAL_BATCH
  └── belongs to: Tenant + Branch
  └── belongs to: InventoryItem
  └── has stable batch_id (UUID, encoded in physical QR labels)
  └── has stock fields: qty_initial, qty_remaining, unit
  └── linked to supplier + received_date
  └── has many: MaterialUsage
  └── has many: MaterialBatchScanLog

MATERIAL_USAGE
  └── belongs to: Tenant + Branch
  └── belongs to: Order (SPK)
  └── belongs to: InventoryItem
  └── belongs to: MaterialBatch via batch_id
  └── records qty_used, waste_qty, operator_id, tanggal_usage

MATERIAL_BATCH_SCAN_LOG
  └── belongs to: Tenant
  └── belongs to: MaterialBatch via batch_id
  └── belongs to: User
  └── optionally linked to: Order (SPK)
  └── records action: usage_input | stock_check
  └── records user_agent + timestamp

STOCK_TRANSACTION
  └── belongs to: InventoryItem
  └── linked to: Order (jika usage/waste) atau PurchaseOrder (jika incoming)

EMPLOYEE
  └── belongs to: Tenant + Branch
  └── has one: EmploymentType (monthly / daily / freelance / project)
  └── has many: Attendance
  └── has many: PayrollEntry

PAYROLL_ENTRY
  └── belongs to: Employee
  └── optionally linked to: Order (untuk variable cost pemasangan)

MACHINE
  └── belongs to: Branch
  └── has many: ProductionSession (SPK yang dikerjakan di mesin ini)

ACCOUNT (Chart of Accounts)
  └── belongs to: Tenant
  └── has many: JournalEntry

JOURNAL_ENTRY
  └── auto-generated from: Payment, StockTransaction, PayrollEntry, Expense
```

---

## 5. ROLE & PERMISSION MATRIX

| Module | owner | branch_mgr | cashier | designer | operator | warehouse | hr_admin | accountant | display |
|---|---|---|---|---|---|---|---|---|---|
| M01 Tenant Mgmt | RW | R | — | — | — | — | — | — | — |
| M02 User & Role | RW | R | — | — | — | — | — | — | — |
| M03 Queue | RW | RW | RW | R | R | — | — | — | R |
| M04 Order / SPK | RW | RW | RW | R | R | — | — | — | — |
| M05 Production Board | RW | RW | R | RW | RW | — | — | — | R |
| M06 Display Mode | RW | RW | — | — | R | — | — | — | R |
| M07 Inventory | RW | RW | — | — | R(usage) | RW | — | R | — |
| M08 Job Costing | RW | R | — | — | — | — | — | RW | — |
| M09 POS / Kasir | RW | RW | RW | — | — | — | — | R | — |
| M10 HR & Payroll | RW | R | — | — | — | — | RW | R | — |
| M11 Akuntansi | RW | R | — | — | — | — | — | RW | — |
| M12 API & WA | RW | R | — | — | — | — | — | — | — |
| M13 Dashboard | RW | R(branch) | — | — | — | — | — | R | — |
| M14 Notifications | RW | RW | R | R | R | R | R | R | R |
| M15 Product Catalog | RW | R | R | R | R | — | — | — | — |
| M16 Mesin & Aset | RW | RW | — | — | R | — | — | R | — |
| M17 CRM Customer | RW | RW | RW | R | — | — | — | R | — |
| M18 Settings | RW | R(branch) | — | — | — | — | — | — | — |

*RW = read & write, R = read only, — = no access*

Access notes:
- Scan history per batch hanya boleh dibuka oleh `warehouse` dan `owner`.
- `operator` boleh scan QR untuk usage input dan melihat ringkasan batch yang diperlukan untuk produksi, tetapi tidak boleh melihat tabel scan history.
- `display` tetap read-only dan tidak boleh membuka scanner atau endpoint write.

---

## 6. API BOUNDARY MAP

### Internal API (Frontend ↔ Backend)
```
REST API + WebSocket

Auth:       POST /auth/login, /auth/logout, /auth/refresh
Tenant:     GET/POST/PUT /tenant, /tenant/branches
Users:      CRUD /users, /roles
Queue:      CRUD /queue, WS: /ws/queue/{branch_id}
Orders:     CRUD /orders, /orders/{id}/status
Production: GET/PUT /production/board, WS: /ws/production/{branch_id}
Inventory:  CRUD /inventory, /inventory/transactions
Scan:       GET /scan?b={batch_id}&t={tenant_id}
HR:         CRUD /employees, /payroll, /attendance
Finance:    GET /reports/*, /journals, /tax
Products:   CRUD /products, /pricing
Dashboard:  GET /dashboard/summary, /dashboard/analytics
```

### Inventory QR & Traceability API
```
GET  /scan?b={batch_id}&t={tenant_id}
     — mobile stripped-down page for physical QR label scan.

GET  /inventory/batches/{batch_id}
     — batch detail scoped to active tenant; returns material name, category, unit,
       qty_remaining, received_date, supplier.

GET  /inventory/batches/{batch_id}/traceability
     — list SPK usage for one batch_id.
       Response rows: spk_number, tanggal_usage, qty_used, operator_name, waste_qty.

GET  /inventory/batches/{batch_id}/scan-log
     — scan history for warehouse/owner only.

POST /inventory/batches/{batch_id}/scan-log
     — records stock_check or usage_input.
       Body: { action, spk_id?, user_agent }.

POST /orders/{spk_id}/material-usage
     — creates material usage. Body must include batch_id when usage comes from QR scan;
       manual dropdown flow may also include batch_id if selected batch is known.
```

Tenant rules:
- All endpoints use auth middleware and active-tenant filtering.
- `/scan` validates URL tenant `t` before loading batch data.
- Mismatched tenant returns the exact user-facing error "Bahan ini bukan dari bisnis Anda".
- Usage form QR validation returns the exact user-facing error "Bahan ini bukan milik bisnis Anda".

### External API (Tenant's Website ↔ Printeoo)
```
Base URL: api.printeoo.com/v1/
Auth: Bearer API Key (per tenant)

GET  /external/products          — ambil katalog produk & harga
GET  /external/estimate          — kalkulasi harga berdasarkan spec
POST /external/orders            — buat order baru dari website
GET  /external/orders/{id}       — cek status order
POST /external/orders/{id}/files — upload file desain
GET  /external/orders/track?phone={phone} — tracking oleh customer

Webhooks (Printeoo → Website):
POST {tenant_webhook_url}
  Event types: order.confirmed, order.in_production, order.ready, order.delivered
```

---

## 7. TECH STACK RECOMMENDATION

*Ini rekomendasi, bukan keharusan. Sesuaikan dengan keahlian tim.*

### Frontend
- **Framework:** React (Next.js) atau Vue (Nuxt)
- **UI Library:** Shadcn/ui atau Ant Design
- **State:** Zustand atau Pinia
- **Realtime:** Socket.io client (untuk production board & antrian)
- **Charts:** Recharts atau ApexCharts

### Backend
- **Runtime:** Node.js (NestJS) atau Python (FastAPI)
- **Database:** PostgreSQL (dengan Row Level Security untuk tenant isolation)
- **Cache:** Redis (session, realtime queue)
- **File Storage:** Cloudflare R2 atau AWS S3 (file SPK per tenant)
- **Queue/Jobs:** BullMQ (untuk notifikasi async, generate PDF, dll)
- **Realtime:** Socket.io server

### Infrastructure
- **Hosting:** Railway / Render (awal) → pindah ke dedicated VPS saat scale
- **CDN:** Cloudflare
- **Email:** Resend atau SendGrid
- **WA API:** Fonnte / WA Business Cloud API (untuk notifikasi)
- **TTS (audio antrian):** Web Speech API (browser-native, gratis)

### Security
- **Auth:** JWT + refresh token, bcrypt password hashing
- **Tenant isolation:** PostgreSQL Row Level Security (RLS) per tenant_id
- **File isolation:** Storage prefix per tenant (`/{tenant_id}/spk/{order_id}/`)
- **API rate limiting:** per tenant, per endpoint
- **Audit log:** setiap write action tercatat dengan user_id + timestamp + IP

### Database Migration Notes — M07.2b/M07.3/M07.10
Migration harus dibuat sebagai file terpisah, bukan edit schema ad hoc.

```sql
-- 1. Ensure batch identity exists on material usage.
ALTER TABLE material_usage
  ADD COLUMN IF NOT EXISTS batch_id uuid;

CREATE INDEX IF NOT EXISTS idx_material_usage_tenant_batch
  ON material_usage (tenant_id, batch_id);

-- 2. Scan log per physical batch label.
CREATE TABLE IF NOT EXISTS material_batch_scan_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  batch_id uuid NOT NULL,
  user_id uuid NOT NULL,
  spk_id uuid NULL,
  action text NOT NULL CHECK (action IN ('usage_input', 'stock_check')),
  user_agent text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_material_batch_scan_log_tenant_batch
  ON material_batch_scan_log (tenant_id, batch_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_material_batch_scan_log_tenant_user
  ON material_batch_scan_log (tenant_id, user_id, created_at DESC);
```

Implementation constraints:
- `material_usage.batch_id` should reference the stable QR batch identity used by `material_batch.batch_id`.
- Traceability queries must start from `(tenant_id, batch_id)`, then join to SPK/order and operator.
- Backfill existing usage rows with known batch data if available; otherwise keep `batch_id` nullable for historical records and mark traceability as item-level only for those rows.
- Apply RLS policies to `material_batch_scan_log` using the same tenant session context as other tenant-owned tables.

### Minimum Tests — QR Material Tracking
- `/scan` tenant validation:
  - unauthenticated user is redirected to login and returns to `/scan?b=...&t=...` after login.
  - authenticated user with mismatched tenant sees "Bahan ini bukan dari bisnis Anda".
  - authenticated user with matching tenant sees batch info and no cross-tenant data.
- Traceability query:
  - "Lihat penggunaan batch ini" filters by `batch_id`, not only `item_id`.
  - Two batches for the same material item return different SPK usage rows.
  - Response includes `spk_number`, `tanggal_usage`, `qty_used`, `operator_name`, `waste_qty`.
- Scan log:
  - `usage_input` records `user_id`, `timestamp`, `spk_id`, action, and user agent.
  - `stock_check` records with nullable `spk_id`.
  - scan history endpoint is allowed for `warehouse` and `owner`, rejected for other roles.

---

## 8. SPK LIFECYCLE — STATE MACHINE

```
                    ┌─────────────────────────────────────────┐
                    │           SPK LIFECYCLE                  │
                    └─────────────────────────────────────────┘

[INPUT ORDER] ──→ draft
                    │
                    ↓ (kasir confirm + DP)
                confirmed
                    │
          ┌─────────┴─────────┐
          │ butuh desain?     │ tidak butuh desain
          ↓                   ↓
    design_queue         production_queue
          │                   │
          ↓                   │
    in_design                 │
          │                   │
          ↓                   │
    design_review             │
          │                   │
          ↓ (customer approve)│
          └──────────→ production_queue
                              │
                              ↓
                          printing
                              │
                              ↓
                          finishing
                              │
                              ↓
                            ready ──→ [WA notif ke customer]
                              │
                    ┌─────────┴──────────┐
                    │ ada pemasangan?    │ tidak
                    ↓                   ↓
              installation           delivered
                    │                   │
                    ↓                   ↓
                delivered            closed (lunas)
                    │
                    ↓
                 closed (lunas)
```

Setiap transisi state mencatat: user yang melakukan, timestamp, catatan opsional.

---

## 9. JOB COSTING — FORMULA

Untuk setiap SPK, sistem kalkulasi otomatis:

```
TOTAL COST PER SPK =
  Σ Material Cost
    (qty_used × avg_unit_cost per bahan)

+ Σ Labor Cost — Operator Produksi
    (jam_kerja × rate_per_jam per operator yang assigned)

+ Σ Variable Cost — Pemasangan
    (jumlah_tukang × jumlah_hari × rate_harian)

+ Overhead Allocation
    (configurable: % dari harga jual, atau flat per SPK)

GROSS PROFIT per SPK =
  Harga Jual − Total Cost

GROSS MARGIN % =
  (Gross Profit / Harga Jual) × 100
```

Semua komponen bisa di-drill-down. Owner bisa lihat per SPK: "dari mana datangnya cost ini?"

---

## 10. DATA PRIVACY & SECURITY POLICY (IMPLEMENTASI)

### Tenant Data Isolation
- Setiap tabel utama memiliki kolom `tenant_id`
- PostgreSQL Row Level Security (RLS): semua query otomatis difilter by tenant_id dari session
- Tidak ada query yang bisa mengakses lintas tenant tanpa super-admin override yang tercatat

### Printeoo Internal Access Policy
- Tim Printeoo TIDAK memiliki akses ke data operasional tenant kecuali:
  1. Ada permintaan eksplisit tertulis dari tenant (support ticket)
  2. Ada kewajiban hukum (surat resmi dari penegak hukum)
- Setiap akses internal dicatat di audit log terpisah (tidak bisa dihapus oleh siapapun)
- Tim Printeoo hanya bisa lihat: status subscription, tenant_id, jumlah transaksi agregat (tanpa detail)

### Agregat Anonim untuk Product Improvement
- Printeoo BOLEH menggunakan data seperti: "rata-rata jumlah SPK/hari di platform" — tanpa identifikasi tenant
- TIDAK BOLEH: melihat produk apa yang dijual tenant, siapa pelanggan mereka, berapa margin mereka

### Data Export & Deletion
- Tenant bisa export semua data kapanpun (CSV/Excel per modul)
- Saat cancel: data dipertahankan 30 hari, lalu dihapus permanen
- Konfirmasi penghapusan dikirim via email

### Penyimpanan
- Data tersimpan di server Indonesia (compliance dengan regulasi lokal)
- File desain dienkripsi at-rest per tenant
- Backup harian, retensi 30 hari, di-encrypt

---

## 11. PROTOTYPE SCOPE — APA YANG DI-BUILD UNTUK DEMO YANUAR

### Fully Interactive (MVP Demo)
- [ ] M01 Login & role switching (simulasi 3 role: Owner, Kasir, Operator)
- [ ] M03 Queue display (layar antrian dengan audio)
- [ ] M04 Input order baru + generate SPK
- [ ] M05 Production board (kanban, drag status)
- [ ] M06 Production display mode (tablet/TV view + audio notif)
- [ ] M09 POS kasir (sederhana: pilih SPK, input bayar, nota)
- [ ] M13 Owner dashboard (data dummy tapi visual)
- [ ] M15 Product catalog (list produk + harga)

### Visible but "Segera Hadir" Badge
- [ ] M07 Inventory & gudang
- [ ] M08 Job costing
- [ ] M10 HR & Payroll
- [ ] M11 Akuntansi & Pajak
- [ ] M12 Web-to-print API
- [ ] M16 Mesin & Aset
- [ ] M17 CRM Customer

### Tier & Pricing Page
- [ ] Halaman pricing dengan 5 tier
- [ ] Feature comparison table
- [ ] CTA "Mulai Gratis 14 Hari"

---

## 12. DEVELOPMENT PHASES

### Phase 1 — Foundation (Bulan 1–3)
Prioritas: bisa dipakai Yanuar untuk operasional harian
- Auth + tenant + branch setup
- M04 Order / SPK digital
- M05 Production board
- M09 POS kasir dasar
- M15 Product catalog
- M14 WA notification (order selesai)

### Phase 2 — Operations Complete (Bulan 4–6)
Prioritas: operasional penuh tanpa kertas
- M03 Queue & antrian
- M06 Production display
- M07 Inventory dasar (stock + usage per SPK)
- M13 Owner dashboard
- M17 CRM customer

### Phase 3 — Intelligence (Bulan 7–9)
Prioritas: bisnis insight & efisiensi
- M08 Job costing otomatis
- M10 HR & payroll (termasuk variable cost pemasangan)
- M07 Waste tracking
- M13 Analytics lengkap

### Phase 4 — Scale (Bulan 10–12)
Prioritas: ekspansi & integrasi
- M11 Akuntansi & pajak
- M12 Web-to-print API
- M01 Multi-branch (Business tier)
- M16 Mesin & aset

### Phase 5 — Enterprise (Year 2)
- M02 Custom role builder
- White-label
- Custom workflow engine
- SLA & dedicated support infrastructure

---

*Dokumen ini adalah living document. Update setiap kali ada keputusan arsitektur baru.*  
*Feed dokumen ini ke Claude Code / Codex sebagai konteks sebelum mulai coding setiap modul.*
