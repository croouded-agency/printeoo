# Printeoo — Software Architecture Document
**Version:** 0.2  
**Prepared for:** Claude Code / Codex / Robbi (Developer)  
**Status:** Updated — ready for implementation planning  
**Last Updated:** 2026-05-25  

---

## CHANGELOG

| Versi | Tanggal | Perubahan | Oleh |
|---|---|---|---|
| 0.1 | 2026-05-23 | Initial draft | Ahmad |
| 0.2 | 2026-05-25 | Multi-item SPK (order_items table), traceability 3-layer revamp, role courier, insentif schema, portal karyawan, delivery module M19, BOM eksplisit di M15 | Ahmad + Printeoo Dev Assistant |

---

## 1. SYSTEM OVERVIEW

Printeoo adalah platform SaaS multi-tenant untuk manajemen print shop di Indonesia. Dibangun dengan arsitektur modular yang memungkinkan tier-based feature access, multi-branch per tenant, dan full traceability dari order masuk hingga material habis dan upah terbayar.

### Core Design Principles
- **Tenant isolation first** — tidak ada celah data antar tenant, secara struktural maupun query
- **Traceability end-to-end** — setiap item SPK bisa di-trace: siapa input, material apa, berapa deviasi dari estimasi, siapa kerjakan, berapa upah
- **Role-based access** — setiap user hanya melihat dan bisa aksi sesuai perannya
- **Offline-tolerant** — operator produksi harus bisa update status item meski koneksi lambat
- **Mobile-ready** — kasir, operator, gudang, dan kurir akses via tablet/HP; owner via desktop
- **Maximum 3 tap untuk aksi inti** — design constraint untuk role non-desk (operator, gudang, kurir)
- **Data sovereignty** — data pelanggan tidak pernah diakses oleh tim Printeoo tanpa permintaan eksplisit

---

## 2. TENANT & BRANCH HIERARCHY

```
Printeoo Platform (SaaS Layer)
└── Organization / Tenant (1 print shop bisnis = 1 tenant)
    ├── Subscription Tier (Solo / Studio / Pro / Business / Enterprise)
    ├── Branch / Cabang (1..N tergantung tier)
    │   ├── Users & Roles (termasuk courier)
    │   ├── Inventory (per cabang atau shared, configurable)
    │   ├── Production Queue (per item)
    │   ├── Delivery Queue (per SPK)
    │   └── Cash Register / POS
    └── Owner Dashboard (konsolidasi semua cabang)
```

---

## 3. MODULE TREE (LENGKAP)

### M01 — Authentication & Tenant Management
*(Tidak ada perubahan)*

### M02 — User, Role & Permission
- M02.1 User management per tenant
- M02.2 Role definitions:
  - `owner` — akses penuh semua modul semua cabang
  - `branch_manager` — akses penuh 1 cabang
  - `cashier` — input order multi-item, kasir, daftar order
  - `designer` — queue desain per item, upload file, approval
  - `operator` — board produksi per item, update status, scan QR material
  - `warehouse` — inventory, incoming, cetak label QR, stock opname, submit PO (tidak approve)
  - `courier` *(BARU)* — delivery queue milik sendiri, update status kirim, upload bukti
  - `hr_admin` — HR, payroll, absensi, insentif
  - `accountant` — laporan keuangan, pajak
  - `display` — read-only production display (untuk TV/tablet), zero interaction
- M02.3 Custom role builder (Enterprise tier)
- M02.4 Permission matrix per module per role

### M03 — Queue & Antrian
*(Tidak ada perubahan struktural — prefix antrian sekarang punya definisi bisnis yang bisa dikonfigurasi)*

### M04 — Order Management (SPK Digital) *(DIREVISI TOTAL v0.2)*

**Perubahan kunci:** SPK sekarang multi-item. Order table sekarang punya relasi `has_many: order_items`.

- M04.1 Input order baru (multi-item)
- M04.2 Auto-generate nomor SPK
- M04.3 Auto-generate Nota (level SPK)
- M04.4 Status SPK lifecycle — **sekarang di level item**, bukan SPK
  - Item states: `confirmed` → `design_queue` → `in_design` → `design_review` → `production_queue` → `printing` → `finishing` → `ready`
  - SPK states (derived): `active` → `ready` (semua item ready) → `delivered` → `closed`
- M04.5 SPK edit & revision history
- M04.6 SPK duplicate (semua item ikut)
- M04.7 SPK dari online order (auto-created dari M12)
- M04.8 Prioritas SPK (normal / urgent / VIP) — berlaku untuk semua item dalam SPK
- M04.9 SPK search & filter
- M04.10 Bulk SPK actions

### M05 — Production Board *(DIREVISI v0.2)*

**Perubahan kunci:** Kanban card = satu item, bukan satu SPK.

- M05.1 Kanban board per cabang — **card = item**
  - Card menampilkan: nomor SPK + "Item X/Y", nama item, customer, deadline, prioritas, operator assigned, status estimasi BOM
- M05.2 Role-based kolom visibility (tidak berubah)
- M05.3 Tap card → modal detail item + link ke detail SPK penuh
- M05.4 Assign item ke operator/desainer spesifik
- M05.5 Timer per item (berapa lama di setiap stage)
- M05.6 Notifikasi real-time saat item masuk queue baru
- M05.7 Production Display Mode (M06)

### M06 — Production Display (Tablet / TV Mode) *(DIREVISI v0.2)*

- Card di display sekarang per item: "SPK-001 · Item 2/3 — Banner Flexi China 3×2m"
- Tombol "Simulasi SPK Masuk" hanya ada di prototype, **tidak boleh ada di production build**
- Role `display`: zero interaction, tidak ada scanner, tidak ada tombol apapun selain mute audio

### M07 — Inventory & Gudang *(DIREVISI v0.2)*

- M07.1 Master bahan baku *(tidak berubah)*
- M07.2 Incoming material + QR label *(tidak berubah)*
- M07.2b QR label fisik *(tidak berubah)*
- M07.2c QR scan entry point via URL *(tidak berubah)*
- M07.3 **Traceability Material — 3 Layer** *(BARU v0.2 — lihat detail di Section 4)*
- M07.4 Stock real-time (current / reserved / available)
- M07.5 Waste tracking per **item** SPK
- M07.6 Stock opname — dengan kolom "Diinput oleh" + export PDF
- M07.7 Low stock alert
- M07.8 Supplier management
- M07.9 Inventory valuation (FIFO / average cost)
- M07.10 Traceability: batch → semua item SPK yang menggunakannya

### M08 — Job Costing *(DIREVISI v0.2)*

- Kalkulasi sekarang per **item**, diagregasi ke level SPK
- M08.1 Cost per item: material + labor + overhead
- M08.2 Cost per SPK: Σ cost semua item + variable cost pemasangan
- M08.3 Gross margin per item dan per SPK
- M08.4 Profitability report per periode

### M09 — POS & Kasir *(Tidak berubah — payment di level SPK)*

### M10 — HR & Payroll *(DIPERLUAS v0.2)*

- M10.1–M10.8 *(tidak berubah)*
- M10.9 **Sistem Insentif per Item SPK** *(BARU)*
- M10.10 **Portal Karyawan (Employee Self-Service)** *(BARU)*

### M11–M13 *(Tidak ada perubahan signifikan)*

### M14 — Notification Center *(DITAMBAH v0.2)*

- M14.1–M14.5 *(tidak berubah)*
- M14.6 **Notifikasi Kurir** *(BARU)* — trigger saat semua item SPK = `ready`

### M15 — Product & Pricing Catalog *(DITAMBAH v0.2)*

- M15.1–M15.5 *(tidak berubah)*
- M15.6 **Bill of Materials (BOM) per Produk** *(EKSPLISIT v0.2)*
  - Formula qty per bahan: flat / per m² / per qty ordered
  - Waste factor per bahan
  - Foundation untuk Layer 1 traceability

### M16–M18 *(Tidak ada perubahan signifikan)*

### M19 — Manajemen Pengiriman (Delivery) *(BARU v0.2)*

- M19.1 Micro-interface kurir (mobile-first, no sidebar)
- M19.2 Assign kurir ke SPK
- M19.3 Status delivery: assigned → diambil → sedang_diantar → terkirim
- M19.4 Upload foto bukti pengiriman
- M19.5 History pengiriman per kurir

---

## 4. DATA MODEL — ENTITY RELATIONSHIPS *(DIREVISI v0.2)*

```
TENANT
  └── has many: Branch, User, Subscription

BRANCH
  └── belongs to: Tenant
  └── has many: Order, Inventory, User (assigned), Machine

USER
  └── belongs to: Tenant + Branch (atau all branches jika owner)
  └── has one: Role
  └── has one: EmployeeProfile (untuk semua role kecuali display)

ORDER (SPK) ← unit transaksi
  └── belongs to: Branch
  └── has one: Customer
  └── has many: OrderItem ← *** BARU v0.2 ***
  └── has many: StatusHistory (lifecycle level SPK: delivered, closed)
  └── has many: File (uploaded assets, shared untuk semua item)
  └── has one: Invoice / Nota
  └── has one: DeliveryAssignment (→ M19)
  └── derived status: min(status semua OrderItem)

ORDER_ITEM ← unit produksi *** BARU v0.2 ***
  └── belongs to: Order (SPK)
  └── has one: Product (dari catalog)
  └── has many: StatusHistory (lifecycle item: confirmed → ready)
  └── has many: MaterialUsage (→ Inventory)
  └── has many: LaborEntry (→ HR/Payroll)
  └── has one: BOMEstimate (kalkulasi dari M15.6 saat item dibuat)
  └── has one: JobCostItem (kalkulasi otomatis M08)
  └── has many: IncentiveRecord (→ M10.9)

CUSTOMER
  └── belongs to: Tenant (shared across branches)
  └── has many: Order
  └── has many: Payment

PRODUCT
  └── belongs to: Tenant
  └── has many: PricingRule
  └── has many: BOMEntry (→ M15.6) *** EKSPLISIT v0.2 ***

BOM_ENTRY *** EKSPLISIT v0.2 ***
  └── belongs to: Product
  └── belongs to: InventoryItem (bahan)
  └── formula_type: flat | per_m2 | per_qty
  └── formula_value: numeric
  └── waste_factor: decimal (contoh: 0.08 = 8%)
  └── unit: string

BOM_ESTIMATE *** BARU v0.2 ***
  └── belongs to: OrderItem
  └── calculated from: BOMEntry × spesifikasi item (width, height, qty)
  └── snapshot saat item dibuat (tidak berubah meski BOM diupdate)
  └── has many: BOMEstimateRow (per bahan: item_id, qty_estimasi, satuan)

INVENTORY_ITEM (Bahan Baku)
  └── belongs to: Branch (atau Tenant jika shared)
  └── has many: MaterialBatch
  └── has many: StockTransaction

MATERIAL_BATCH
  └── belongs to: Tenant + Branch
  └── belongs to: InventoryItem
  └── has stable batch_id (UUID, encoded in physical QR labels)
  └── qty_initial, qty_remaining, unit
  └── linked to: Supplier + received_date
  └── has many: MaterialUsage
  └── has many: MaterialBatchScanLog

MATERIAL_USAGE *** DIREVISI v0.2 — sekarang linked ke OrderItem ***
  └── belongs to: Tenant + Branch
  └── belongs to: OrderItem ← sebelumnya Order
  └── belongs to: InventoryItem
  └── belongs to: MaterialBatch via batch_id
  └── records: qty_used, waste_qty, operator_id, tanggal_usage
  └── source: 'qr_scan' | 'manual_dropdown'

MATERIAL_DEVIATION *** BARU v0.2 ***
  └── belongs to: OrderItem
  └── belongs to: InventoryItem (per bahan)
  └── bom_estimate_qty: decimal (dari BOMEstimate)
  └── actual_qty_used: decimal (Σ MaterialUsage untuk item + bahan ini)
  └── deviation_qty: actual - estimate
  └── deviation_pct: deviation_qty / bom_estimate_qty × 100
  └── status: 'normal' | 'anomali' (jika |deviation_pct| > threshold tenant)

MATERIAL_BATCH_SCAN_LOG *(tidak berubah)*

DELIVERY_ASSIGNMENT *** BARU v0.2 ***
  └── belongs to: Order (SPK)
  └── belongs to: User (courier)
  └── delivery_type: 'pickup' | 'courier'
  └── address: text
  └── status: assigned | diambil | sedang_diantar | terkirim
  └── assigned_at, picked_up_at, delivered_at: timestamptz
  └── photo_proof_url: text (nullable)
  └── notes: text (nullable)

INCENTIVE_CONFIG *** BARU v0.2 ***
  └── belongs to: Tenant
  └── role: string (role yang eligible)
  └── calc_type: 'flat_per_item' | 'pct_per_item' | 'flat_per_spk'
  └── value: decimal
  └── effective_from: date
  └── created_by: user_id

INCENTIVE_RECORD *** BARU v0.2 ***
  └── belongs to: Tenant + Branch
  └── belongs to: User (employee)
  └── belongs to: OrderItem (atau Order jika flat_per_spk)
  └── config_snapshot: jsonb (copy konfigurasi saat item selesai)
  └── amount: decimal
  └── status: 'pending' | 'approved' | 'paid'
  └── approved_by: user_id (nullable)
  └── paid_at: timestamptz (nullable)

EMPLOYEE_PROFILE *** BARU v0.2 ***
  └── belongs to: User
  └── posisi, cabang, tipe_kontrak
  └── has many: IncentiveRecord
  └── has many: Attendance
  └── has many: Reprimand (teguran)

REPRIMAND *** BARU v0.2 ***
  └── belongs to: EmployeeProfile
  └── issued_by: user_id (owner/manager)
  └── jenis, catatan, tanggal
  └── tidak bisa dihapus oleh employee

EMPLOYEE
  └── belongs to: Tenant + Branch
  └── has one: EmploymentType
  └── has many: Attendance
  └── has many: PayrollEntry

PAYROLL_ENTRY
  └── belongs to: Employee
  └── optionally linked to: Order (untuk variable cost pemasangan)
```

---

## 5. TRACEABILITY MATERIAL — ARSITEKTUR 3 LAYER *(BARU v0.2)*

### Layer 1 — Estimasi Otomatis (BOM Engine)

**Trigger:** Saat OrderItem dibuat (saat SPK disave)

**Flow:**
```
OrderItem dibuat (produk X, width 3m, height 2m, qty 1)
    ↓
BOM Engine query BOMEntry untuk Produk X
    ↓
Per BOMEntry:
  formula_type = 'per_m2':
    qty_estimate = (3 × 2) × formula_value × (1 + waste_factor)
    = 6 × 0.111 × 1.08 = 0.72 roll
    
  formula_type = 'flat':
    qty_estimate = formula_value × (1 + waste_factor)
    
  formula_type = 'per_qty':
    qty_estimate = order_qty × formula_value × (1 + waste_factor)
    ↓
Simpan sebagai BOMEstimate (snapshot, immutable setelah dibuat)
```

**Kenapa snapshot (immutable)?**
Jika owner mengubah BOM formula di kemudian hari, estimasi item SPK yang sudah dibuat tidak boleh ikut berubah — ini akan merusak laporan historis dan membingungkan rekonsiliasi.

### Layer 2 — Record Aktual via QR Scan

**Endpoint yang terlibat:**
```
# Saat scan QR label fisik
GET /scan?b={batch_id}&t={tenant_id}
  → Validasi tenant, return BatchInfo + list SPK aktif user ini

# Saat operator pilih SPK & item, input qty
POST /orders/{spk_id}/items/{item_id}/material-usage
  Body: {
    batch_id: uuid,
    item_id: uuid (order item),
    qty_used: decimal,
    waste_qty: decimal (opsional),
    source: 'qr_scan' | 'manual',
    user_agent: string
  }
  → Insert MaterialUsage
  → Update MaterialBatch.qty_remaining
  → Insert MaterialBatchScanLog (action: 'usage_input')
  → Trigger recalculate MaterialDeviation
```

**Validation rules:**
- `batch_id` harus milik tenant aktif (RLS + explicit check)
- `item_id` harus milik SPK yang di-assign ke user atau semua SPK aktif (jika warehouse)
- Jika `qty_remaining` akan menjadi negatif: warning, tidak block hard

### Layer 3 — Rekonsiliasi Otomatis

**MaterialDeviation dihitung setiap kali ada MaterialUsage baru:**

```sql
-- Upsert MaterialDeviation per (order_item_id, inventory_item_id)
INSERT INTO material_deviation (
  order_item_id, inventory_item_id, tenant_id,
  bom_estimate_qty, actual_qty_used, deviation_qty, deviation_pct, status
)
SELECT
  mu.order_item_id,
  mu.inventory_item_id,
  mu.tenant_id,
  be.qty_estimate,                          -- dari BOMEstimate
  SUM(mu.qty_used) OVER (
    PARTITION BY mu.order_item_id, mu.inventory_item_id
  ),                                         -- actual
  actual - estimate,                         -- deviation_qty
  ((actual - estimate) / estimate) * 100,    -- deviation_pct
  CASE
    WHEN ABS(deviation_pct) > tenant_threshold THEN 'anomali'
    ELSE 'normal'
  END
ON CONFLICT (order_item_id, inventory_item_id)
DO UPDATE SET ...
```

**Alert trigger:**
```
Jika MaterialDeviation.status = 'anomali':
  → Insert notification untuk owner + branch_manager
  → Payload: spk_number, item_name, material_name, deviation_pct
```

---

## 6. DATABASE SCHEMA — KEY TABLES *(DIUPDATE v0.2)*

### Tabel Baru / Dimodifikasi

```sql
-- =============================================
-- ORDER ITEMS (multi-item SPK) — BARU v0.2
-- =============================================
CREATE TABLE order_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  order_id        uuid NOT NULL REFERENCES orders(id),
  item_seq        integer NOT NULL,     -- urutan item dalam SPK (1, 2, 3...)
  product_id      uuid NOT NULL REFERENCES products(id),
  product_snapshot jsonb NOT NULL,      -- snapshot produk saat order dibuat
  specifications  jsonb NOT NULL,       -- width, height, qty, finishing, dll
  qty             decimal NOT NULL,
  unit_price      decimal NOT NULL,
  unit_price_overridden boolean DEFAULT false,
  price_override_reason text,
  total_price     decimal NOT NULL,
  needs_design    boolean NOT NULL DEFAULT false,
  status          text NOT NULL DEFAULT 'confirmed',
  assigned_to     uuid REFERENCES users(id),
  operator_notes  text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_tenant_order ON order_items(tenant_id, order_id);
CREATE INDEX idx_order_items_tenant_status ON order_items(tenant_id, status);
CREATE INDEX idx_order_items_assigned ON order_items(tenant_id, assigned_to);

-- RLS: tenant_id = session tenant
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- =============================================
-- BOM ENTRIES — EKSPLISIT v0.2
-- =============================================
CREATE TABLE bom_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  product_id      uuid NOT NULL REFERENCES products(id),
  inventory_item_id uuid NOT NULL REFERENCES inventory_items(id),
  formula_type    text NOT NULL CHECK (formula_type IN ('flat', 'per_m2', 'per_qty')),
  formula_value   decimal NOT NULL,
  waste_factor    decimal NOT NULL DEFAULT 0.0,  -- 0.08 = 8%
  unit            text NOT NULL,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bom_entries_product ON bom_entries(tenant_id, product_id);

-- =============================================
-- BOM ESTIMATES (snapshot per order item) — BARU v0.2
-- =============================================
CREATE TABLE bom_estimates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  order_item_id   uuid NOT NULL REFERENCES order_items(id),
  inventory_item_id uuid NOT NULL REFERENCES inventory_items(id),
  qty_estimate    decimal NOT NULL,
  unit            text NOT NULL,
  formula_snapshot jsonb NOT NULL,  -- copy BOMEntry saat estimasi dibuat
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bom_estimates_order_item ON bom_estimates(tenant_id, order_item_id);

-- =============================================
-- MATERIAL USAGE — DIMODIFIKASI v0.2
-- (sebelumnya linked ke order_id, sekarang ke order_item_id)
-- =============================================
ALTER TABLE material_usage
  ADD COLUMN IF NOT EXISTS order_item_id uuid REFERENCES order_items(id),
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual' 
    CHECK (source IN ('qr_scan', 'manual'));

-- Catatan: order_id tetap ada untuk backward compat, tapi order_item_id wajib untuk record baru
CREATE INDEX IF NOT EXISTS idx_material_usage_order_item 
  ON material_usage(tenant_id, order_item_id);

-- =============================================
-- MATERIAL DEVIATION — BARU v0.2
-- =============================================
CREATE TABLE material_deviation (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL,
  order_item_id       uuid NOT NULL REFERENCES order_items(id),
  inventory_item_id   uuid NOT NULL REFERENCES inventory_items(id),
  bom_estimate_qty    decimal,          -- null jika tidak ada BOM
  actual_qty_used     decimal NOT NULL,
  deviation_qty       decimal,          -- null jika tidak ada BOM
  deviation_pct       decimal,          -- null jika tidak ada BOM
  status              text DEFAULT 'normal' CHECK (status IN ('normal', 'anomali', 'no_bom')),
  last_updated        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(order_item_id, inventory_item_id)
);

CREATE INDEX idx_material_deviation_tenant_status 
  ON material_deviation(tenant_id, status);
CREATE INDEX idx_material_deviation_order_item 
  ON material_deviation(tenant_id, order_item_id);

-- =============================================
-- ORDER ITEM STATUS HISTORY — BARU v0.2
-- =============================================
CREATE TABLE order_item_status_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  order_item_id   uuid NOT NULL REFERENCES order_items(id),
  from_status     text,
  to_status       text NOT NULL,
  changed_by      uuid NOT NULL REFERENCES users(id),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_item_status_history_item 
  ON order_item_status_history(tenant_id, order_item_id, created_at DESC);

-- =============================================
-- DELIVERY ASSIGNMENTS — BARU v0.2
-- =============================================
CREATE TABLE delivery_assignments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  order_id        uuid NOT NULL REFERENCES orders(id),
  courier_id      uuid REFERENCES users(id),  -- null jika customer ambil sendiri
  delivery_type   text NOT NULL CHECK (delivery_type IN ('pickup', 'courier')),
  address         text,
  status          text NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned', 'diambil', 'sedang_diantar', 'terkirim')),
  assigned_at     timestamptz DEFAULT now(),
  picked_up_at    timestamptz,
  delivered_at    timestamptz,
  photo_proof_url text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_tenant_courier 
  ON delivery_assignments(tenant_id, courier_id, status);
CREATE INDEX idx_delivery_tenant_order 
  ON delivery_assignments(tenant_id, order_id);

ALTER TABLE delivery_assignments ENABLE ROW LEVEL SECURITY;
-- RLS courier: hanya lihat row di mana courier_id = current_user_id

-- =============================================
-- INCENTIVE CONFIG — BARU v0.2
-- =============================================
CREATE TABLE incentive_configs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  role            text NOT NULL,
  calc_type       text NOT NULL 
    CHECK (calc_type IN ('flat_per_item', 'pct_per_item', 'flat_per_spk')),
  value           decimal NOT NULL,
  effective_from  date NOT NULL,
  is_active       boolean DEFAULT true,
  created_by      uuid NOT NULL REFERENCES users(id),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_incentive_config_tenant_role 
  ON incentive_configs(tenant_id, role, effective_from DESC);

-- =============================================
-- INCENTIVE RECORDS — BARU v0.2
-- =============================================
CREATE TABLE incentive_records (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  user_id         uuid NOT NULL REFERENCES users(id),
  order_item_id   uuid REFERENCES order_items(id),  -- null jika flat_per_spk
  order_id        uuid REFERENCES orders(id),
  config_snapshot jsonb NOT NULL,  -- copy config saat record dibuat
  amount          decimal NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'paid')),
  approved_by     uuid REFERENCES users(id),
  approved_at     timestamptz,
  paid_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_incentive_records_user 
  ON incentive_records(tenant_id, user_id, status);
CREATE INDEX idx_incentive_records_order_item 
  ON incentive_records(tenant_id, order_item_id);

ALTER TABLE incentive_records ENABLE ROW LEVEL SECURITY;
-- RLS: user hanya bisa SELECT row di mana user_id = current_user_id
-- owner dan hr_admin bisa SELECT semua (bypass via role check)

-- =============================================
-- REPRIMANDS (teguran) — BARU v0.2
-- =============================================
CREATE TABLE reprimands (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL,
  employee_id     uuid NOT NULL REFERENCES users(id),
  issued_by       uuid NOT NULL REFERENCES users(id),
  jenis           text NOT NULL,
  catatan         text,
  tanggal         date NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
  -- Tidak ada kolom deleted_at — reprimand tidak bisa dihapus
);

CREATE INDEX idx_reprimands_employee 
  ON reprimands(tenant_id, employee_id, tanggal DESC);

ALTER TABLE reprimands ENABLE ROW LEVEL SECURITY;
-- RLS: employee hanya bisa SELECT row milik sendiri (employee_id = current_user_id)
-- owner dan hr_admin bypass

-- =============================================
-- EXISTING TABLES — MIGRATION NOTES
-- =============================================

-- Scan log (tidak berubah dari v0.1, sudah ada di architecture lama)
-- Tabel material_batch_scan_log sudah ada, tidak perlu modifikasi

-- orders table: tambahkan kolom turunan untuk status ringkasan
-- (atau kalkulasi on-the-fly dari order_items — lihat catatan di bawah)
```

### Catatan: Status SPK vs Status Item

**Pilihan arsitektur untuk status SPK:**

**Option A (Recommended): Derived / Computed**
Status SPK tidak disimpan di database — dikalkulasi on-the-fly dari status item-itemnya:
```sql
-- View atau function untuk status SPK
SELECT
  o.id,
  CASE
    WHEN EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.status != 'ready') 
      THEN 'in_progress'
    ELSE 'ready'
  END as derived_production_status,
  COUNT(oi.id) as total_items,
  COUNT(CASE WHEN oi.status = 'ready' THEN 1 END) as items_ready
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id
```

**Option B: Stored + trigger update**
Kolom `production_status` di tabel orders, diupdate via database trigger setiap kali order_item.status berubah.

**Rekomendasi:** Option B untuk production (lebih performant untuk query besar, cukup tambahkan trigger). Option A untuk awal development (lebih mudah).

---

## 7. API BOUNDARY MAP *(DIUPDATE v0.2)*

### Internal API

```
Auth:       POST /auth/login, /auth/logout, /auth/refresh
Tenant:     GET/POST/PUT /tenant, /tenant/branches
Users:      CRUD /users, /roles

Queue:      CRUD /queue, WS: /ws/queue/{branch_id}

Orders:     
  GET/POST        /orders
  GET/PUT/DELETE  /orders/{id}
  PUT             /orders/{id}/status           ← SPK level (delivered, closed)
  GET             /orders/{id}/items            ← list semua item
  POST            /orders/{id}/items            ← tambah item ke SPK
  GET/PUT         /orders/{id}/items/{item_id}  ← detail + edit item
  PUT             /orders/{id}/items/{item_id}/status  ← transisi status item

Production: 
  GET   /production/board?branch_id=...  ← return items grouped by status
  WS:   /ws/production/{branch_id}

BOM:
  GET/POST/PUT/DELETE /products/{product_id}/bom
  GET                 /orders/{id}/items/{item_id}/bom-estimate

Inventory:  
  CRUD /inventory, /inventory/transactions
  GET  /inventory/daily-requirements?branch_id=...&date=...  ← kebutuhan material hari ini

Scan:       GET /scan?b={batch_id}&t={tenant_id}

Material Usage (per item):
  POST /orders/{spk_id}/items/{item_id}/material-usage
    Body: { batch_id, qty_used, waste_qty, source }
  GET  /orders/{spk_id}/items/{item_id}/material-usage  ← history per item

Material Traceability:
  GET /inventory/batches/{batch_id}
  GET /inventory/batches/{batch_id}/traceability        ← semua item yang pakai batch ini
  GET /inventory/batches/{batch_id}/scan-log            ← warehouse + owner only

Material Deviation:
  GET /orders/{spk_id}/items/{item_id}/deviation        ← deviasi per item
  GET /orders/{spk_id}/deviation                        ← summary deviasi semua item
  GET /reports/material-deviation?period=...            ← laporan owner

Delivery:
  POST /orders/{id}/delivery                 ← assign kurir + tipe + alamat
  PUT  /orders/{id}/delivery/status          ← update status (kurir / kasir)
  POST /orders/{id}/delivery/proof           ← upload foto bukti

Incentives:
  GET/POST/PUT   /incentive-configs          ← owner / hr_admin
  GET            /incentive-records          ← owner/hr_admin: semua; user: milik sendiri
  PUT            /incentive-records/{id}/approve
  PUT            /incentive-records/{id}/paid

Portal Karyawan (Employee Self-Service):
  GET /me/summary                 ← ringkasan bulan ini
  GET /me/incentives              ← insentif milik sendiri
  GET /me/profile                 ← info pribadi
  GET /me/reprimands              ← teguran milik sendiri
  GET /me/announcements           ← pengumuman dari owner

HR:         CRUD /employees, /payroll, /attendance
Finance:    GET /reports/*, /journals, /tax
Products:   CRUD /products, /pricing, /products/{id}/bom
Dashboard:  GET /dashboard/summary, /dashboard/analytics
```

---

## 8. ROLE & PERMISSION MATRIX *(DIUPDATE v0.2)*

| Module | owner | branch_mgr | cashier | designer | operator | warehouse | courier | hr_admin | accountant | display |
|---|---|---|---|---|---|---|---|---|---|---|
| M01 Tenant Mgmt | RW | R | — | — | — | — | — | — | — | — |
| M02 User & Role | RW | R | — | — | — | — | — | — | — | — |
| M03 Queue | RW | RW | RW | R | R | — | — | — | — | R |
| M04 Order / SPK | RW | RW | RW | R | R | — | — | — | — | — |
| M04 Item Status Update | RW | RW | partial | design only | prod only | — | — | — | — | — |
| M05 Production Board | RW | RW | R | RW | RW | — | — | — | — | R |
| M06 Display Mode | RW | RW | — | — | R | — | — | — | — | R(read-only) |
| M07 Inventory | RW | RW | — | — | R(usage) | RW | — | — | R | — |
| M07 Cetak Label QR | RW | RW | — | — | — | RW | — | — | — | — |
| M07 Submit PO | RW | RW | — | — | — | W(submit) | — | — | — | — |
| M07 Approve PO | RW | RW | — | — | — | — | — | — | — | — |
| M08 Job Costing | RW | R | — | — | — | — | — | RW | — | — |
| M09 POS / Kasir | RW | RW | RW | — | — | — | — | — | R | — |
| M10 HR & Payroll | RW | R | — | — | — | — | RW | — | — | — |
| M10 Insentif Config | RW | — | — | — | — | — | RW | — | — | — |
| M10 Insentif Records (semua) | RW | R(branch) | — | — | — | — | RW | — | — | — |
| M10 Insentif Records (sendiri) | RW | RW | RW | RW | RW | RW | RW | RW | RW | — |
| M10 Portal Karyawan | RW | RW | RW | RW | RW | RW | RW | RW | RW | — |
| M11 Akuntansi | RW | R | — | — | — | — | — | RW | — | — |
| M12 API & WA | RW | R | — | — | — | — | — | — | — | — |
| M13 Dashboard | RW | R(branch) | — | — | — | — | — | — | R | — |
| M14 Notifications | RW | RW | R | R | R | R | R | R | R | R |
| M15 Product Catalog | RW | R | R | R | R | — | — | — | — | — |
| M15 BOM Config | RW | RW | — | — | — | — | — | — | — | — |
| M16 Mesin & Aset | RW | RW | — | — | R | — | — | — | R | — |
| M17 CRM Customer | RW | RW | RW | R | — | — | — | — | R | — |
| M18 Settings | RW | R(branch) | — | — | — | — | — | — | — | — |
| M19 Delivery Queue (semua) | RW | RW | RW | — | — | — | — | — | — | — |
| M19 Delivery Queue (sendiri) | — | — | — | — | — | — | RW | — | — | — |
| M19 Upload bukti | — | — | — | — | — | — | RW | — | — | — |

*RW = read & write, R = read only, W = write only (submit), — = no access*

**Catatan RLS khusus:**
- `incentive_records`: RLS policy → user hanya bisa SELECT row di mana `user_id = auth.uid()`. Owner dan hr_admin bypass via role check di application layer.
- `delivery_assignments`: RLS policy → courier hanya bisa SELECT + UPDATE row di mana `courier_id = auth.uid()`.
- `reprimands`: RLS policy → employee hanya SELECT row di mana `employee_id = auth.uid()`.
- `order_items`: tetap tenant-scoped via `tenant_id`. Tidak ada user-level isolation kecuali untuk assignment display di kanban.
- Scan history per batch: hanya `warehouse` dan `owner`. `operator` hanya bisa POST usage, tidak bisa GET scan history.
- `display` role: tidak boleh membuka scanner atau endpoint write apapun.

---

## 9. TECH STACK RECOMMENDATION

*(Tidak ada perubahan dari v0.1)*

### Frontend
- **Framework:** React (Next.js) — App Router, TypeScript
- **UI Library:** Shadcn/ui
- **State:** Zustand
- **Realtime:** Socket.io client
- **Charts:** Recharts atau ApexCharts
- **QR Scanner:** html5-qrcode atau zxing-js (browser-native, no install)

### Backend
- **Runtime:** Node.js (NestJS), TypeScript, modular
- **Database:** PostgreSQL + Row Level Security
- **Cache:** Redis (session, realtime queue, BullMQ)
- **File Storage:** Cloudflare R2
- **Queue/Jobs:** BullMQ (notifikasi async, PDF generation, insentif calculation)
- **Realtime:** Socket.io server

### Infrastructure
- **Hosting:** Railway / Render → VPS saat scale
- **CDN:** Cloudflare
- **Email:** Resend
- **WA API:** Fonnte (awal) atau WA Business Cloud API
- **TTS:** Web Speech API (browser-native)

---

## 10. SPK LIFECYCLE — STATE MACHINE *(DIREVISI v0.2)*

### Item Lifecycle (unit produksi)
```
confirmed
    │
    ├─── [butuh desain] ──→ design_queue → in_design → design_review
    │                                                        │
    │                                              [customer approve]
    │                                                        │
    └─── [tidak butuh desain] ──→ production_queue ←────────┘
                                        │
                                    printing
                                        │
                                    finishing
                                        │
                                      ready ──→ [trigger: cek semua item SPK]
```

### SPK Lifecycle (unit transaksi — derived)
```
[semua item ready] → SPK production_status = 'ready'
                          │
               ┌──────────┴──────────┐
               │ ada pemasangan?     │ tidak
               ↓                    ↓
          installation          delivery_assigned
               │                    │
               └──────────┬─────────┘
                           ↓
                       delivered ──→ [WA notif ke customer, notif kurir jika ada]
                           │
                       closed (lunas)
```

**Setiap transisi item mencatat:** user yang melakukan, timestamp, catatan opsional  
**Setiap transisi SPK mencatat:** user yang melakukan, timestamp, catatan opsional  

---

## 11. JOB COSTING — FORMULA *(DIREVISI v0.2)*

```
TOTAL COST PER ITEM =
  Σ Material Cost per bahan
    (qty_actual_used × avg_unit_cost_bahan)

+ Labor Cost item ini
    (jam_kerja_operator × rate_per_jam)

+ Overhead Allocation item
    (configurable: % dari unit_price item)

TOTAL COST PER SPK =
  Σ Total Cost semua Item

+ Variable Cost Pemasangan (jika ada)
    (jumlah_tukang × jumlah_hari × rate_harian)

GROSS PROFIT per SPK =
  Total Harga Jual SPK − Total Cost SPK

GROSS MARGIN % =
  (Gross Profit / Total Harga Jual) × 100

INSENTIF per Item (jika config aktif) =
  flat_per_item: config.value
  pct_per_item:  item.unit_price × config.value
  flat_per_spk:  config.value (dibagi rata ke semua item? atau ke operator terakhir? TBD)
```

---

## 12. DATA PRIVACY & SECURITY POLICY
*(Tidak ada perubahan dari v0.1)*

---

## 13. DEVELOPMENT PHASES *(DIUPDATE v0.2)*

### Phase 1 — Foundation (Bulan 1–3)
- Auth + tenant + branch setup, **role courier included**
- M04 Order / SPK **multi-item** — order_items table dan form
- M15 Product catalog + **BOM per produk (M15.6)** — foundation traceability Layer 1
- M05 Production board **per item**
- M09 POS kasir dasar (payment di level SPK)
- M14 WA notification (order selesai)
- M18 Settings dasar

### Phase 2 — Operations Complete (Bulan 4–6)
- M03 Queue & antrian
- M06 Production display (item-based card)
- M07 Inventory: incoming + QR label + **Traceability Layer 1 + 2**
- M19 Modul Pengiriman (assign kurir, micro interface, foto bukti)
- M13 Owner dashboard **dengan laporan deviasi material**
- M17 CRM customer

### Phase 3 — Intelligence (Bulan 7–9)
- M07 **Traceability Layer 3** — rekonsiliasi otomatis + alert anomali
- M08 Job costing per item
- M10.1–M10.8 HR & payroll
- **M10.9 Sistem Insentif per item**
- **M10.10 Portal Karyawan**
- M13 Analytics lengkap

### Phase 4 — Scale (Bulan 10–12)
- M11 Akuntansi & pajak
- M12 Web-to-print API
- M01 Multi-branch (Business tier)
- M16 Mesin & aset
- Billing & subscription management

### Phase 5 — Enterprise (Year 2)
- M02 Custom role builder
- White-label
- Custom workflow engine
- SLA & dedicated support infrastructure

---

## 14. MINIMUM TESTS *(DIUPDATE v0.2)*

### Multi-Item SPK
- SPK bisa dibuat dengan 1 item (backward compatible)
- SPK bisa dibuat dengan N item (N ≤ 20)
- Setiap item punya status independent
- Status SPK derived = status item paling tertinggal
- Saat semua item `ready` → SPK production_status = `ready` otomatis

### Traceability Material
- BOM estimate auto-generate saat item dibuat
- BOM estimate adalah snapshot immutable (perubahan BOM tidak retroaktif)
- QR scan dari `/scan` → pre-fill item SPK sesuai assignment operator
- Material usage terhubung ke order_item_id, bukan hanya order_id
- MaterialDeviation ter-update setiap kali ada usage baru
- Alert anomali terkirim saat deviation_pct > threshold
- Cross-tenant scan: error "Bahan ini bukan dari bisnis Anda"

### Kurir & Delivery
- Kurir hanya bisa lihat SPK yang di-assign ke mereka
- Update status delivery oleh kurir mengubah status SPK
- Upload foto bukti tersimpan di R2 dengan prefix tenant isolation

### Insentif
- Insentif dihitung saat item berubah ke `ready`
- Konfigurasi perubahan tidak retroaktif
- Employee A tidak bisa query incentive_records milik employee B
- Mini-toast muncul di layar operator setelah item selesai
- Approval oleh owner/hr_admin diperlukan sebelum status `paid`

### Portal Karyawan
- Setiap role (kecuali display) bisa akses Portal Karyawan
- Data yang ditampilkan hanya milik user yang login
- Reprimand tidak bisa dihapus oleh employee

---

*Dokumen ini adalah living document. Update setiap kali ada keputusan arsitektur baru.*  
*Feed dokumen ini ke Claude Code / Codex sebagai konteks sebelum mulai coding setiap modul.*
