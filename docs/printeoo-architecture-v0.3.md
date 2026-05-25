# Printeoo — Software Architecture Document
**Version:** 0.3  
**Prepared for:** Claude Code / Codex / Robbi (Developer)  
**Status:** Updated — ready for implementation planning  
**Last Updated:** 2026-05-25  

---

## CHANGELOG

| Versi | Tanggal | Perubahan | Oleh |
|---|---|---|---|
| 0.1 | 2026-05-23 | Initial draft | Ahmad |
| 0.2 | 2026-05-25 | Multi-item SPK, traceability 3-layer, role courier, insentif schema, portal karyawan, delivery M19, BOM eksplisit | Ahmad + Printeoo Dev Assistant |
| 0.3 | 2026-05-25 | Hapus `design_review` dari item status enum, tambah nota pesanan + tracking publik, spesifikasi fisik per batch, rename Master Bahan → Daftar Bahan, inline create bahan | Ahmad + Printeoo Dev Assistant |

---

## 1. SYSTEM OVERVIEW

Printeoo adalah platform SaaS multi-tenant untuk manajemen print shop di Indonesia. Dibangun dengan arsitektur modular yang memungkinkan tier-based feature access, multi-branch per tenant, dan full traceability dari order masuk hingga material habis dan upah terbayar.

### Core Design Principles
- **Tenant isolation first** — tidak ada celah data antar tenant
- **Traceability end-to-end** — setiap item SPK bisa di-trace: siapa input, material apa, berapa deviasi, siapa kerjakan, berapa upah
- **Role-based access** — setiap user hanya lihat dan aksi sesuai perannya
- **Offline-tolerant** — operator produksi bisa update status item meski koneksi lambat
- **Mobile-ready** — kasir, operator, gudang, kurir via tablet/HP; owner via desktop
- **Maximum 3 tap untuk aksi inti** — design constraint untuk role non-desk
- **Data sovereignty** — data pelanggan tidak pernah diakses tim Printeoo tanpa permintaan eksplisit
- **Inline create** — entitas baru (bahan, customer) bisa dibuat tanpa navigasi keluar dari form aktif

---

## 2. TENANT & BRANCH HIERARCHY
*(Tidak ada perubahan dari v0.2)*

---

## 3. MODULE TREE

### M01 — Authentication & Tenant Management
*(Tidak ada perubahan)*

### M02 — User, Role & Permission
*(Tidak ada perubahan dari v0.2 — role `courier` sudah ada)*

### M03 — Queue & Antrian
*(Tidak ada perubahan)*

### M04 — Order Management *(DIUPDATE v0.3)*

- M04.1 Input order baru (multi-item)
- M04.2 Auto-generate nomor SPK
- M04.3 Auto-generate Nota (level SPK)
- M04.4 Status SPK lifecycle — di level item, **tanpa `design_review`**
  - Item states: `confirmed` → `design_queue` → `in_design` → `production_queue` → `printing` → `finishing` → `ready`
  - Push-back: `in_design` → `in_design` (dengan catatan wajib, oleh cashier/manager)
  - SPK states (derived): `active` → `ready` → `delivered` → `closed`
- M04.5 **Nota Pesanan** *(BARU v0.3)*: cetak, kirim WA, download PDF
- M04.6 **Halaman Tracking Publik** `/track/{spk_id}` *(BARU v0.3)*: tanpa auth, mobile-first
- M04.7 SPK edit & revision history
- M04.8 SPK duplicate
- M04.9 SPK dari online order (M12)
- M04.10 Prioritas SPK
- M04.11 SPK search & filter
- M04.12 Bulk SPK actions

### M05 — Production Board *(DIUPDATE v0.3)*

- Kanban card = item
- **Kolom final (6 kolom):** Antrian Desain | Sedang Desain | Antrian Cetak | Sedang Cetak | Finishing | Siap Ambil
- Kolom "Review Pelanggan" **dihapus**
- Role visibility designer: hanya Antrian Desain + Sedang Desain

### M06 — Production Display
*(Tidak ada perubahan dari v0.2)*

### M07 — Inventory & Gudang *(DIUPDATE v0.3)*

- M07.1 **Daftar Bahan** *(rename dari "Master Bahan")* — registrasi jenis bahan saja, tanpa harga/stok
- M07.2 Incoming Material + **Spesifikasi Fisik per Batch** *(BARU v0.3)*
- M07.2b QR label fisik *(label sekarang mencantumkan spesifikasi fisik)*
- M07.2c QR scan entry point via URL
- M07.3 Traceability 3 Layer
- M07.4–M07.10 *(tidak berubah)*

### M08–M14
*(Tidak ada perubahan dari v0.2)*

### M15 — Product & Pricing Catalog *(DIUPDATE v0.3)*

- M15.1–M15.5 *(tidak berubah)*
- M15.6 BOM per Produk — **field waste wajib ada**, preview kalkulasi dengan referensi spek batch, inline create bahan

### M16–M18
*(Tidak ada perubahan)*

### M19 — Manajemen Pengiriman
*(Tidak ada perubahan dari v0.2)*

---

## 4. DATA MODEL — ENTITY RELATIONSHIPS *(DIUPDATE v0.3)*

```
TENANT
  └── has many: Branch, User, Subscription

BRANCH
  └── belongs to: Tenant
  └── has many: Order, Inventory, User, Machine

USER
  └── belongs to: Tenant + Branch
  └── has one: Role
  └── has one: EmployeeProfile (semua role kecuali display)

ORDER (SPK) ← unit transaksi
  └── belongs to: Branch
  └── has one: Customer
  └── has many: OrderItem
  └── has many: StatusHistory (level SPK: delivered, closed)
  └── has many: File
  └── has one: Invoice / Nota
  └── has one: DeliveryAssignment
  └── derived status dari OrderItem

ORDER_ITEM ← unit produksi
  └── belongs to: Order
  └── has one: Product
  └── has many: StatusHistory (lifecycle: confirmed → ready, TANPA design_review)
  └── has many: MaterialUsage
  └── has many: LaborEntry
  └── has one: BOMEstimate (snapshot immutable)
  └── has one: JobCostItem
  └── has many: IncentiveRecord

CUSTOMER, PRODUCT, BOM_ENTRY, BOM_ESTIMATE
*(Tidak ada perubahan dari v0.2)*

INVENTORY_ITEM (Daftar Bahan)  ← rename dari "Master Bahan" v0.3
  └── belongs to: Branch
  └── has many: MaterialBatch
  └── has many: StockTransaction
  └── fields: nama, kategori, satuan, stok_minimum
  └── TIDAK ada field harga_beli (harga di level batch)

MATERIAL_BATCH *(DIUPDATE v0.3 — tambah kolom spesifikasi fisik)*
  └── belongs to: Tenant + Branch
  └── belongs to: InventoryItem
  └── batch_id: UUID (stable, encoded in QR)
  └── qty_initial, qty_remaining, unit
  └── linked to: Supplier + received_date + harga_per_unit
  └── BARU: physical_specs jsonb
    {
      "panjang_roll": 50,       -- meter (untuk roll)
      "lebar_roll": 1.52,       -- meter (untuk roll)
      "ketebalan_mm": 0.8,      -- mm (opsional)
      "luas_per_unit": 76,      -- m², auto-kalkulasi
      "kebutuhan_per_m2": 0.0132, -- roll/m², auto-kalkulasi
      "isi_per_rim": 500,       -- lembar (untuk kertas/rim)
      "ukuran_kertas": "A4",    -- untuk kertas
      "volume_ml": 1000,        -- untuk tinta
      "jenis_tinta": "Pigment", -- untuk tinta
      "isi_per_pack": 100       -- untuk aksesoris/pack
    }
  └── has many: MaterialUsage
  └── has many: MaterialBatchScanLog

NOTA_PESANAN *(BARU v0.3)*
  └── belongs to: Order (SPK)
  └── nomor_nota: string (auto-generate)
  └── snapshot_data: jsonb (snapshot order + items saat nota dibuat)
  └── generated_at: timestamptz
  └── generated_by: user_id

MATERIAL_DEVIATION, DELIVERY_ASSIGNMENT, INCENTIVE_CONFIG,
INCENTIVE_RECORD, EMPLOYEE_PROFILE, REPRIMAND, EMPLOYEE, PAYROLL_ENTRY
*(Tidak ada perubahan dari v0.2)*
```

---

## 5. TRACEABILITY MATERIAL — ARSITEKTUR 3 LAYER
*(Tidak ada perubahan dari v0.2)*

**Catatan tambahan v0.3:** BOM Engine di Layer 1 sekarang bisa menggunakan spesifikasi fisik dari batch terbaru untuk menghasilkan preview yang lebih akurat. Jika batch dengan spesifikasi belum ada, estimasi tetap bisa dihitung dari `formula_value` yang diinput manual.

---

## 6. DATABASE SCHEMA — KEY TABLES *(DIUPDATE v0.3)*

### Perubahan dari v0.2

```sql
-- =============================================
-- 1. HAPUS design_review dari status enum order_items
-- =============================================
-- Status enum final:
-- confirmed | design_queue | in_design | production_queue | printing | finishing | ready
--
-- Jika menggunakan PostgreSQL enum type:
ALTER TYPE order_item_status RENAME VALUE 'design_review' TO 'DEPRECATED_design_review';
-- Atau jika menggunakan text dengan CHECK constraint:
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_status_check;
ALTER TABLE order_items ADD CONSTRAINT order_items_status_check
  CHECK (status IN ('confirmed','design_queue','in_design','production_queue','printing','finishing','ready'));

-- =============================================
-- 2. INVENTORY_ITEM — hapus kolom harga_beli jika ada
-- (harga sekarang di level batch, bukan item)
-- =============================================
ALTER TABLE inventory_items DROP COLUMN IF EXISTS harga_beli_rata;
-- Catatan: harga_beli_rata dihitung on-the-fly dari weighted average batch aktif

-- =============================================
-- 3. MATERIAL_BATCH — tambah kolom spesifikasi fisik
-- =============================================
ALTER TABLE material_batches
  ADD COLUMN IF NOT EXISTS physical_specs jsonb,
  ADD COLUMN IF NOT EXISTS harga_per_unit decimal;
-- physical_specs: { panjang_roll, lebar_roll, ketebalan_mm, luas_per_unit,
--                   kebutuhan_per_m2, isi_per_rim, ukuran_kertas,
--                   volume_ml, jenis_tinta, isi_per_pack }

-- =============================================
-- 4. NOTA_PESANAN — tabel baru
-- =============================================
CREATE TABLE IF NOT EXISTS nota_pesanan (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  order_id        uuid NOT NULL REFERENCES orders(id),
  nomor_nota      text NOT NULL,
  snapshot_data   jsonb NOT NULL,
  generated_at    timestamptz NOT NULL DEFAULT now(),
  generated_by    uuid NOT NULL REFERENCES users(id)
);

CREATE INDEX idx_nota_pesanan_order ON nota_pesanan(tenant_id, order_id);
ALTER TABLE nota_pesanan ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. ORDER_ITEM_STATUS_HISTORY — tambah kolom push_back_reason
-- =============================================
ALTER TABLE order_item_status_history
  ADD COLUMN IF NOT EXISTS push_back_reason text;
-- Wajib diisi jika transisi adalah push-back (in_design → in_design)
```

### Tabel-tabel yang tidak berubah dari v0.2
`order_items`, `bom_entries`, `bom_estimates`, `material_usage`, `material_deviation`, `material_batch_scan_log`, `delivery_assignments`, `incentive_configs`, `incentive_records`, `reprimands`

---

## 7. API BOUNDARY MAP *(DIUPDATE v0.3)*

### Tambahan / Perubahan Endpoint

```
# Nota Pesanan
GET  /orders/{spk_id}/nota          ← render data nota (untuk halaman /nota/{spk_id})
POST /orders/{spk_id}/nota          ← generate & simpan snapshot nota

# Tracking Publik (TANPA auth)
GET  /public/track/{spk_id}         ← return milestone status untuk customer
     Response: { spk_id, business_name, business_phone, items[], 
                 current_milestone, last_updated, deadline }
     Rate limited: 60 req/menit per IP

# Daftar Bahan (sebelumnya Master Bahan)
GET    /inventory/items              ← list semua jenis bahan
POST   /inventory/items              ← daftarkan jenis bahan baru (TANPA harga)
GET    /inventory/items/{id}         ← detail + riwayat penerimaan
PUT    /inventory/items/{id}         ← update (nama, kategori, satuan, stok_minimum)

# Catat Penerimaan — update: tambah physical_specs
POST /inventory/batches              ← buat batch baru
     Body: { item_id, qty, harga_per_unit, supplier, received_date,
             physical_specs: { panjang_roll?, lebar_roll?, isi_per_rim?, ... } }

# Spesifikasi fisik batch
GET  /inventory/batches/{id}/specs   ← ambil spek fisik batch
PUT  /inventory/batches/{id}/specs   ← update spek fisik

# BOM — preview kalkulasi dengan referensi batch
GET  /products/{id}/bom/preview?qty=10&width=3&height=2&batch_ref=latest
     Response: { items: [{ material, qty_estimate, unit, formula_breakdown }] }

# Semua endpoint sebelumnya dari v0.2 tidak berubah
```

**Endpoint publik `/public/track`:**
- Tidak butuh JWT auth
- Rate limited ketat (60 req/menit per IP) untuk mencegah scraping
- Tidak return harga, operator names, catatan internal
- Di production: `spk_id` di URL sebaiknya menggunakan token terpisah, bukan UUID order langsung

---

## 8. ROLE & PERMISSION MATRIX *(DIUPDATE v0.3)*

Perubahan dari v0.2:

| Module | owner | branch_mgr | cashier | designer | operator | warehouse | courier | hr_admin | accountant | display |
|---|---|---|---|---|---|---|---|---|---|---|
| M04 Nota Pesanan | RW | RW | RW | — | — | — | — | — | — | — |
| M04 Tracking Publik | public | public | public | public | public | public | public | public | public | public |
| M07 Daftar Bahan (ex Master) | RW | RW | — | — | — | RW | — | — | — | — |
| M07 Spesifikasi Fisik Batch | RW | RW | — | — | — | RW | — | — | — | — |

*Semua permission lain tidak berubah dari v0.2*

---

## 9. TECH STACK RECOMMENDATION
*(Tidak ada perubahan dari v0.2)*

**Tambahan library v0.3:**
- QR Code generation (server-side untuk nota): `qrcode` npm package
- QR Code generation (client-side untuk prototype): `qrcodejs` via CDN

---

## 10. SPK LIFECYCLE — STATE MACHINE *(DIUPDATE v0.3)*

### Item Lifecycle (TANPA design_review)
```
confirmed
    │
    ├─ [butuh desain] ──→ design_queue → in_design ──→ production_queue
    │                                       ↑  │
    │                           [push-back] │  └─ [desain selesai, customer
    │                           dengan      │     approve via WA]
    │                           catatan     │
    │                                       └─ in_design (push-back state)
    │
    └─ [tidak butuh desain] ──→ production_queue
                                      │
                                  printing → finishing → ready
```

### SPK Lifecycle (tidak berubah dari v0.2)

---

## 11. JOB COSTING — FORMULA
*(Tidak ada perubahan dari v0.2)*

---

## 12. DATA PRIVACY & SECURITY POLICY

*(Tidak ada perubahan dari v0.2)*

**Tambahan v0.3:** Halaman `/public/track/{spk_id}` adalah endpoint publik. Wajib:
- Rate limiting ketat
- Tidak return data sensitif (harga, nama operator, catatan internal)
- Di production: pertimbangkan tracking token terpisah dari UUID order untuk mencegah enumeration

---

## 13. DEVELOPMENT PHASES *(DIUPDATE v0.3)*

### Phase 1 — Foundation (Bulan 1–3)
- Auth + role `courier`
- M04 SPK multi-item — **status enum TANPA `design_review`**
- M04.5 Nota Pesanan + M04.6 Halaman Tracking Publik
- M15 Product catalog + BOM (waste field wajib, inline create bahan)
- M07.1 Daftar Bahan (form disederhanakan)
- M09 POS kasir

### Phase 2 — Operations Complete (Bulan 4–6)
- M03 Queue & antrian
- M06 Production display (6 kolom)
- M07.2 Catat Penerimaan + **spesifikasi fisik batch**
- M07.2b QR label (dengan spesifikasi fisik)
- M19 Modul Pengiriman
- M13 Owner dashboard

### Phase 3 — Intelligence (Bulan 7–9)
- M07.3 Traceability Layer 1 + 2 + 3
- M08 Job costing per item
- M10.9 Sistem Insentif
- M10.10 Portal Karyawan

### Phase 4 — Scale (Bulan 10–12)
- M11 Akuntansi & pajak
- M12 Web-to-print API
- M01 Multi-branch
- Billing & subscription

### Phase 5 — Enterprise (Year 2)
- Custom role builder, white-label, custom workflow, SLA

---

## 14. MINIMUM TESTS *(DIUPDATE v0.3)*

### Tambahan dari v0.2

**Status Lifecycle (design_review dihapus):**
- [ ] Item tidak bisa masuk ke status `design_review` — constraint di DB dan application layer
- [ ] Push-back `in_design → in_design` wajib ada `push_back_reason` di history
- [ ] Transisi `in_design → production_queue` bisa dilakukan oleh designer

**Nota Pesanan:**
- [ ] Endpoint `/orders/{spk_id}/nota` return data lengkap nota dengan format rupiah Indonesia
- [ ] Snapshot nota tersimpan — tidak berubah meski data order diedit setelah nota dibuat

**Tracking Publik:**
- [ ] `/public/track/{spk_id}` bisa diakses tanpa JWT
- [ ] Response tidak mengandung harga, nama operator, atau catatan internal
- [ ] Rate limit aktif: lebih dari 60 req/menit per IP mendapat 429

**Spesifikasi Fisik Batch:**
- [ ] `physical_specs` tersimpan di batch, bukan di inventory_item
- [ ] BOM preview menggunakan spek dari batch terbaru jika tersedia
- [ ] Jika batch belum ada spek, BOM preview tetap bisa dihitung dari formula manual

**Daftar Bahan (ex Master Bahan):**
- [ ] `POST /inventory/items` tidak menerima field `harga_beli` — return 400 jika dikirim
- [ ] Harga beli hanya bisa masuk via `POST /inventory/batches`
- [ ] Inline create: `POST /inventory/items` dari dalam form BOM dan Catat Penerimaan return item baru yang langsung bisa dipilih

---

*Dokumen ini adalah living document. Update setiap kali ada keputusan arsitektur baru.*  
*Feed dokumen ini ke Claude Code / Codex sebagai konteks sebelum mulai coding setiap modul.*
