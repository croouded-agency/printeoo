# Printeoo — Database Schema Design

**Version:** 1.0  
**Date:** 2026-05-26  
**Status:** Ready for Implementation  
**Source of Truth:** PRD v2.0, Architecture v0.3, ADR-0001  

---

## TABLE OF CONTENTS

1. [Design Principles](#1-design-principles)
2. [Conventions](#2-conventions)
3. [Schema Overview (ERD Summary)](#3-schema-overview)
4. [Core Tables](#4-core-tables)
   - 4.1 tenants
   - 4.2 branches
   - 4.3 users
   - 4.4 user_invitations
5. [Order Management](#5-order-management)
   - 5.1 customers
   - 5.2 orders
   - 5.3 order_items
   - 5.4 order_item_status_history
   - 5.5 order_files
   - 5.6 order_notes
6. [Product & BOM Catalog](#6-product--bom-catalog)
   - 6.1 products
   - 6.2 product_price_tiers
   - 6.3 bom_entries
   - 6.4 bom_snapshots
7. [Inventory & Gudang](#7-inventory--gudang)
   - 7.1 inventory_items
   - 7.2 material_batches
   - 7.3 material_usage
   - 7.4 stock_adjustments
   - 7.5 stock_opname_sessions
   - 7.6 stock_opname_items
   - 7.7 purchase_orders
   - 7.8 purchase_order_items
8. [Queue System](#8-queue-system)
   - 8.1 queue_sessions
   - 8.2 queue_tickets
9. [POS & Payments](#9-pos--payments)
   - 9.1 payments
10. [HR & Payroll](#10-hr--payroll)
    - 10.1 employee_profiles
    - 10.2 attendance_records
    - 10.3 incentive_configs
    - 10.4 incentive_records
    - 10.5 payroll_runs
    - 10.6 payroll_entries
11. [Delivery](#11-delivery)
    - 11.1 delivery_assignments
12. [Notification & Audit](#12-notification--audit)
    - 12.1 notifications
    - 12.2 notification_preferences
    - 12.3 audit_logs
13. [API & Integration](#13-api--integration)
    - 13.1 api_keys
    - 13.2 webhooks
    - 13.3 webhook_deliveries
14. [Indexes](#14-indexes)
15. [Row-Level Security Policies](#15-row-level-security-policies)
16. [Custom Types (ENUMs)](#16-custom-types-enums)
17. [Migration Strategy](#17-migration-strategy)

---

## 1. Design Principles

### Tenant Isolation
Semua tabel operasional memiliki kolom `tenant_id`. PostgreSQL Row-Level Security (RLS) di-enforce di database layer — bukan hanya di application layer. Ini mencegah data leakage bahkan jika ada bug di aplikasi.

### Money as Integer
Semua nilai moneter disimpan sebagai `BIGINT` dalam satuan sen (rupiah terkecil). Tidak ada `DECIMAL` untuk uang — ini menghindari floating-point error. Contoh: Rp 85.000 disimpan sebagai `8500000`.

> **Kenapa sen, bukan rupiah?** Karena Indonesia tidak punya sub-rupiah, tapi kita simpan dalam sen untuk konsistensi dengan standar ISO 4217 dan kemungkinan diskon desimal.

### Soft Delete
Entitas yang punya relasi historis (inventory_items, customers, employees) menggunakan soft delete via `deleted_at TIMESTAMPTZ`. Hard delete hanya untuk entitas yang tidak punya referensi.

### Immutable Snapshots
Data yang dihitung dari referensi lain (BOM estimate saat order dibuat, harga batch saat pemakaian) disimpan sebagai snapshot immutable. Ini mencegah rekalkulasi retroaktif yang mengubah sejarah.

### UUID v4 untuk Primary Keys
Semua PK menggunakan UUID (`gen_random_uuid()`). Ini memungkinkan:
- ID di-generate di client sebelum insert (optimistic UI)
- Tidak ada sequential ID enumeration (security)
- Merge data dari multiple branches lebih mudah

---

## 2. Conventions

| Aspek | Konvensi |
|---|---|
| Nama tabel | `snake_case`, plural |
| Nama kolom | `snake_case` |
| Primary key | `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` |
| Foreign key | `{entity}_id UUID REFERENCES {table}(id)` |
| Timestamps | `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()` |
| Soft delete | `deleted_at TIMESTAMPTZ NULL` — NULL = aktif |
| Uang | `BIGINT` dalam sen |
| Enum | Didefinisikan sebagai PostgreSQL custom TYPE, bukan CHECK constraint |
| Tenant FK | Semua tabel operasional punya `tenant_id UUID NOT NULL REFERENCES tenants(id)` |
| ON DELETE | Default `RESTRICT` kecuali disebutkan. `CASCADE` hanya untuk child yang tidak punya makna tanpa parent. |
| Trigger `updated_at` | Function `set_updated_at()` di-attach ke semua tabel yang punya `updated_at` |

---

## 3. Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TENANT LAYER                                  │
│  tenants ──< branches ──< users                                         │
│      │                       │                                          │
│      │                       └──< employee_profiles                     │
│      │                                                                  │
│  ┌───┴──────────────────────────────────────────────────────────────┐   │
│  │                      OPERATIONAL LAYER                           │   │
│  │                                                                  │   │
│  │  customers ──< orders ──< order_items ──< order_item_status_history │
│  │                 │              │                                  │   │
│  │                 │              ├──< bom_snapshots                 │   │
│  │                 │              ├──< material_usage                │   │
│  │                 │              └──< incentive_records             │   │
│  │                 │                                                 │   │
│  │                 ├──< order_files                                  │   │
│  │                 ├──< payments                                     │   │
│  │                 └──< delivery_assignments                         │   │
│  │                                                                   │   │
│  │  products ──< bom_entries                                         │   │
│  │           └──< product_price_tiers                                │   │
│  │                                                                   │   │
│  │  inventory_items ──< material_batches ──< material_usage          │   │
│  │       │                                                           │   │
│  │       └──< stock_adjustments                                      │   │
│  │                                                                   │   │
│  │  purchase_orders ──< purchase_order_items                         │   │
│  │  stock_opname_sessions ──< stock_opname_items                     │   │
│  │                                                                   │   │
│  │  queue_sessions ──< queue_tickets                                 │   │
│  │                                                                   │   │
│  │  payroll_runs ──< payroll_entries                                 │   │
│  │  attendance_records                                               │   │
│  │  incentive_configs                                                │   │
│  │                                                                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    CROSS-CUTTING LAYER                            │   │
│  │  notifications  notification_preferences  audit_logs             │   │
│  │  api_keys  webhooks  webhook_deliveries                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Core Tables

### 4.1 `tenants`

```sql
CREATE TABLE tenants (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(63) NOT NULL,
  name              VARCHAR(255) NOT NULL,
  owner_id          UUID        REFERENCES users(id) ON DELETE SET NULL,
  subscription_tier subscription_tier_enum NOT NULL DEFAULT 'solo',
  trial_ends_at     TIMESTAMPTZ,
  is_active         BOOLEAN     NOT NULL DEFAULT TRUE,

  -- Profil bisnis (dari Settings → Profil Bisnis)
  logo_url          TEXT,
  wa_number         VARCHAR(20),
  address           TEXT,
  city              VARCHAR(100),
  footer_text       TEXT        DEFAULT 'Barang yang sudah diambil tidak dapat dikembalikan.',

  -- Konfigurasi operasional
  settings          JSONB       NOT NULL DEFAULT '{}',
  -- settings schema:
  -- {
  --   "queue_reset_time": "08:00",     -- HH:MM WIB
  --   "vip_revenue_threshold": 5000000, -- dalam sen
  --   "material_deviation_alert_pct": 30,
  --   "incentive_enabled": true,
  --   "wa_notification_enabled": false,
  --   "wa_api_provider": "fonnte|wa_cloud",
  --   "wa_api_key": "encrypted:...",
  --   "invoice_prefix": "INV",
  --   "po_prefix": "PO",
  --   "timezone": "Asia/Jakarta"
  -- }

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT tenants_slug_unique UNIQUE (slug)
);

-- Slug harus lowercase, alfanumerik dan hyphen saja
ALTER TABLE tenants ADD CONSTRAINT tenants_slug_format
  CHECK (slug ~ '^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$');
```

### 4.2 `branches`

```sql
CREATE TABLE branches (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  code        VARCHAR(5)   NOT NULL,   -- contoh: SBY, JKT — dipakai di nomor SPK
  address     TEXT,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT branches_code_per_tenant UNIQUE (tenant_id, code)
);
```

### 4.3 `users`

```sql
CREATE TABLE users (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id   UUID         REFERENCES branches(id) ON DELETE SET NULL,
  email       VARCHAR(255) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  role        user_role_enum NOT NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,

  -- Auth (password di-hash bcrypt/argon2, tidak pernah plaintext)
  password_hash       TEXT,
  failed_login_count  SMALLINT    NOT NULL DEFAULT 0,
  locked_until        TIMESTAMPTZ,   -- NULL = tidak terkunci

  -- Magic link & refresh tokens di tabel terpisah (sessions)
  email_verified_at   TIMESTAMPTZ,
  last_login_at       TIMESTAMPTZ,

  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ,  -- soft delete — deactivate, bukan hapus

  CONSTRAINT users_email_per_tenant UNIQUE (tenant_id, email)
);

-- Sessions (refresh tokens) — tabel terpisah untuk rotate-on-use
CREATE TABLE user_sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id       UUID        NOT NULL,  -- denormalized untuk RLS tanpa JOIN
  refresh_token   TEXT        NOT NULL,
  device_info     JSONB,                 -- user agent, IP, dll
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked_at      TIMESTAMPTZ,           -- NULL = aktif
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT sessions_token_unique UNIQUE (refresh_token)
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_user_sessions_token ON user_sessions(refresh_token) WHERE revoked_at IS NULL;
```

### 4.4 `user_invitations`

```sql
CREATE TABLE user_invitations (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id   UUID         REFERENCES branches(id),
  email       VARCHAR(255) NOT NULL,
  role        user_role_enum NOT NULL,
  token       TEXT         NOT NULL,    -- random token, expire 72 jam
  invited_by  UUID         NOT NULL REFERENCES users(id),
  expires_at  TIMESTAMPTZ  NOT NULL,
  accepted_at TIMESTAMPTZ,              -- NULL = belum diterima
  revoked_at  TIMESTAMPTZ,              -- NULL = masih valid
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT invitations_token_unique UNIQUE (token)
);

CREATE INDEX idx_invitations_email ON user_invitations(tenant_id, email)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;
```

---

## 5. Order Management

### 5.1 `customers`

```sql
CREATE TABLE customers (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  phone       VARCHAR(20)  NOT NULL,   -- format: +628xxx
  email       VARCHAR(255),
  type        customer_type_enum NOT NULL DEFAULT 'individu',
  notes       TEXT,                    -- catatan internal, tidak terlihat customer

  -- Stats (di-update via trigger atau background job)
  total_orders     INTEGER   NOT NULL DEFAULT 0,
  total_revenue    BIGINT    NOT NULL DEFAULT 0,   -- sen
  is_vip           BOOLEAN   NOT NULL DEFAULT FALSE,

  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ,

  CONSTRAINT customers_phone_per_tenant UNIQUE (tenant_id, phone)
);
```

### 5.2 `orders`

> SPK = unit transaksi. Status SPK di-derive dari status semua order_items.

```sql
CREATE TABLE orders (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL REFERENCES tenants(id),
  branch_id   UUID         NOT NULL REFERENCES branches(id),
  customer_id UUID         REFERENCES customers(id) ON DELETE SET NULL,

  -- Identitas
  spk_number  VARCHAR(30)  NOT NULL,
  -- format: SPK-{BRANCH_CODE}-{YYYYMMDD}-{4digit}
  -- contoh: SPK-SBY-20260525-0042
  -- di-generate via sequence per branch per hari

  tracking_token VARCHAR(32) NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  -- UUID bukan nomor SPK sequential — cegah enumeration (AC-075)

  -- Status SPK (derived dari order_items, tapi di-cache di sini)
  status      order_status_enum NOT NULL DEFAULT 'active',
  priority    priority_enum     NOT NULL DEFAULT 'normal',

  -- Deadline
  deadline    TIMESTAMPTZ  NOT NULL,

  -- Sumber order
  source      order_source_enum NOT NULL DEFAULT 'walk_in',

  -- Finansial
  subtotal    BIGINT       NOT NULL DEFAULT 0,   -- sum of item subtotals (sen)
  discount    BIGINT       NOT NULL DEFAULT 0,   -- diskon keseluruhan SPK (sen)
  total       BIGINT       NOT NULL DEFAULT 0,   -- subtotal - discount
  dp_amount   BIGINT       NOT NULL DEFAULT 0,
  dp_method   payment_method_enum,
  is_paid     BOOLEAN      NOT NULL DEFAULT FALSE,
  is_delivered BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Catatan
  operator_notes TEXT,

  -- Metadata
  created_by  UUID         NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  closed_at   TIMESTAMPTZ,   -- set saat status → closed

  CONSTRAINT orders_spk_number_unique UNIQUE (tenant_id, spk_number),
  CONSTRAINT orders_tracking_token_unique UNIQUE (tracking_token)
);

-- Sequence per branch per hari di-handle di application layer menggunakan
-- SELECT nextval('spk_seq_{branch_id}_{YYYYMMDD}') atau advisory lock
-- Alternatif: gunakan kolom sequence_number INTEGER per (branch_id, date)
CREATE SEQUENCE IF NOT EXISTS spk_sequence START 1;  -- fallback global sequence
```

**Catatan desain:** SPK number generation menggunakan advisory lock di PostgreSQL untuk handle concurrent requests (AC-043). Lihat section Migration untuk detail implementasi.

### 5.3 `order_items`

> Unit produksi. Status per item independen. SPK status derived dari semua item.

```sql
CREATE TABLE order_items (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tenant_id   UUID         NOT NULL,   -- denormalized untuk RLS
  product_id  UUID         REFERENCES products(id) ON DELETE SET NULL,

  -- Spesifikasi pesanan (dinamis sesuai tipe produk)
  specs       JSONB        NOT NULL DEFAULT '{}',
  -- large_format: {"width_cm": 300, "height_cm": 100, "area_m2": 3.0}
  -- flat/tiered: {"notes": "2 sisi", "size": "A4"}

  finishing   TEXT[]       NOT NULL DEFAULT '{}',
  -- contoh: ["laminasi_doff", "mata_ayam"]

  qty         INTEGER      NOT NULL CHECK (qty > 0),
  unit_price  BIGINT       NOT NULL,   -- sen, bisa di-override kasir
  discount    BIGINT       NOT NULL DEFAULT 0,   -- sen
  subtotal    BIGINT       GENERATED ALWAYS AS (qty * unit_price - discount) STORED,

  needs_design BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Status lifecycle
  status      order_item_status_enum NOT NULL DEFAULT 'confirmed',

  -- Assignment
  assigned_designer_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_operator_id  UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Catatan per item
  notes       TEXT,

  -- Snapshot nama produk (denormalized) — agar tetap terbaca jika produk dihapus
  product_name_snapshot VARCHAR(255),

  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

### 5.4 `order_item_status_history`

```sql
CREATE TABLE order_item_status_history (
  id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID      NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  tenant_id     UUID      NOT NULL,   -- denormalized

  from_status   order_item_status_enum,   -- NULL untuk entry pertama
  to_status     order_item_status_enum NOT NULL,

  -- Push-back wajib isi alasan (AC-051)
  push_back_reason TEXT,
  -- NOT NULL di-enforce di application layer ketika from_status > confirmed
  -- dan to_status = in_design

  changed_by    UUID      NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_item_history_item ON order_item_status_history(order_item_id);
```

### 5.5 `order_files`

```sql
CREATE TABLE order_files (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tenant_id   UUID         NOT NULL,
  order_item_id UUID       REFERENCES order_items(id) ON DELETE SET NULL,
  -- NULL = file berlaku untuk keseluruhan SPK

  file_name   VARCHAR(255) NOT NULL,
  file_url    TEXT         NOT NULL,   -- R2/S3 object key
  file_size   INTEGER,                 -- bytes
  mime_type   VARCHAR(100),
  uploaded_by UUID         NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

### 5.6 `order_notes` (timeline entries)

```sql
-- Timeline events (semua perubahan dan catatan pada SPK)
CREATE TABLE order_timeline (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tenant_id   UUID         NOT NULL,

  event_type  VARCHAR(50)  NOT NULL,
  -- contoh: order_created, item_status_changed, payment_received,
  --         note_added, file_uploaded, courier_assigned, delivered, closed

  description TEXT         NOT NULL,
  metadata    JSONB,   -- detail event spesifik
  actor_id    UUID         REFERENCES users(id) ON DELETE SET NULL,
  actor_name  VARCHAR(255),   -- denormalized snapshot nama
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_timeline_order ON order_timeline(order_id, created_at DESC);
```

---

## 6. Product & BOM Catalog

### 6.1 `products`

```sql
CREATE TABLE products (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  name         VARCHAR(255) NOT NULL,
  pricing_type product_pricing_type_enum NOT NULL,
  -- large_format: harga per m²
  -- flat: harga per pcs
  -- tiered: dari tabel product_price_tiers

  base_price   BIGINT,   -- sen. NULL untuk tiered pricing.
  default_needs_design BOOLEAN NOT NULL DEFAULT FALSE,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,

  -- Snapshot kategori untuk filtering di laporan job costing
  category     VARCHAR(100),

  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ,

  CONSTRAINT products_name_per_tenant UNIQUE (tenant_id, name)
    DEFERRABLE INITIALLY DEFERRED
);
```

### 6.2 `product_price_tiers`

```sql
-- Hanya untuk produk dengan pricing_type = 'tiered'
CREATE TABLE product_price_tiers (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID    NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tenant_id       UUID    NOT NULL,

  min_qty         INTEGER NOT NULL CHECK (min_qty > 0),
  max_qty         INTEGER,   -- NULL = tidak ada batas atas (tier terakhir)
  price_per_unit  BIGINT  NOT NULL,   -- sen

  CONSTRAINT price_tiers_min_unique_per_product UNIQUE (product_id, min_qty)
);
```

### 6.3 `bom_entries`

```sql
-- BOM (Bill of Materials) per produk — template, bukan per-order
CREATE TABLE bom_entries (
  id                  UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id          UUID      NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  inventory_item_id   UUID      NOT NULL REFERENCES inventory_items(id),
  tenant_id           UUID      NOT NULL,

  formula_type        bom_formula_type_enum NOT NULL,
  -- flat: qty_formula unit per order (fixed)
  -- per_m2: qty_formula unit per m² order
  -- per_qty: qty_formula unit per pcs ordered

  qty_formula         DECIMAL(12,6) NOT NULL,
  -- jumlah bahan per satuan formula
  -- contoh: 0.014 roll per m² untuk Flexi China

  bom_unit            VARCHAR(20) NOT NULL,
  -- satuan logis di BOM (m², lembar, ml) — ADR-0001
  -- berbeda dari satuan pembelian di batch

  waste_pct           DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  -- persen waste, WAJIB ADA (AC-179), default 5%
  -- validasi: 0 <= waste_pct <= 100

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT bom_entries_no_negative_waste CHECK (waste_pct >= 0),
  CONSTRAINT bom_entries_max_waste CHECK (waste_pct <= 100)
);
```

### 6.4 `bom_snapshots`

```sql
-- Snapshot immutable BOM estimasi saat SPK dibuat (AC-111)
-- Tidak terpengaruh perubahan BOM setelah SPK dibuat
CREATE TABLE bom_snapshots (
  id                  UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id       UUID       NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  bom_entry_id        UUID       REFERENCES bom_entries(id) ON DELETE SET NULL,
  -- SET NULL jika BOM entry dihapus — snapshot tetap ada
  tenant_id           UUID       NOT NULL,

  inventory_item_id   UUID       REFERENCES inventory_items(id) ON DELETE SET NULL,
  inventory_item_name VARCHAR(255) NOT NULL,   -- snapshot nama

  formula_type        bom_formula_type_enum NOT NULL,
  qty_formula         DECIMAL(12,6) NOT NULL,
  bom_unit            VARCHAR(20)   NOT NULL,
  waste_pct           DECIMAL(5,2)  NOT NULL,
  estimated_qty       DECIMAL(12,6) NOT NULL,   -- hasil kalkulasi sudah termasuk waste
  estimated_unit      VARCHAR(20)   NOT NULL,

  -- Referensi batch yang dipakai untuk kalkulasi konversi (ADR-0001)
  reference_batch_id  UUID       REFERENCES material_batches(id) ON DELETE SET NULL,
  batch_spec_snapshot JSONB,
  -- snapshot spec batch: { spec_length_m, spec_width_m, coverage_per_unit, dll }

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()

  -- Tidak ada updated_at — immutable setelah dibuat
);

CREATE INDEX idx_bom_snapshots_order_item ON bom_snapshots(order_item_id);
```

---

## 7. Inventory & Gudang

### 7.1 `inventory_items`

> Nama modul: "Daftar Bahan" (bukan Master Bahan) — AC-098.
> Form tidak punya field Harga Beli — harga ada di level batch.

```sql
CREATE TABLE inventory_items (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  branch_id   UUID         NOT NULL REFERENCES branches(id),

  name        VARCHAR(255) NOT NULL,
  category    inventory_category_enum NOT NULL,
  unit        VARCHAR(50)  NOT NULL,   -- roll, rim, liter, ml, pcs, pack, kg, meter

  min_stock   DECIMAL(12,3) NOT NULL DEFAULT 0,
  current_stock DECIMAL(12,3) NOT NULL DEFAULT 0,
  -- current_stock di-maintain via trigger dari material_usage dan stock_adjustments
  -- Bukan derived query — disimpan sebagai cache untuk query performa

  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ,   -- soft delete (AC-104)

  CONSTRAINT inventory_items_name_per_branch UNIQUE (tenant_id, branch_id, name)
    WHERE deleted_at IS NULL
);
```

### 7.2 `material_batches`

> Spesifikasi fisik disimpan di level batch karena supplier berbeda bisa punya spec berbeda (AC-108).
> Kolom-kolom `spec_*` mengikuti desain di ADR-0001 — lebih type-safe daripada JSONB.

```sql
CREATE TABLE material_batches (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id   UUID         NOT NULL REFERENCES inventory_items(id),
  tenant_id           UUID         NOT NULL,

  batch_code          VARCHAR(50)  NOT NULL,
  -- format: BATCH-{YYYYMMDD}-{3digit}, atau manual
  supplier            VARCHAR(255) NOT NULL,
  price_per_unit      BIGINT       NOT NULL,   -- sen per satuan
  qty_received        DECIMAL(12,3) NOT NULL,
  qty_remaining       DECIMAL(12,3) NOT NULL,
  received_date       DATE         NOT NULL,
  received_by         UUID         NOT NULL REFERENCES users(id),
  notes               TEXT,

  -- ── Spesifikasi fisik per kategori (ADR-0001) ──────────────────────
  -- Media Cetak / Stiker (satuan: roll)
  spec_length_m       DECIMAL(10,3),  -- panjang roll dalam meter
  spec_width_m        DECIMAL(10,3),  -- lebar roll dalam meter
  spec_thickness_mm   DECIMAL(6,3),   -- ketebalan (opsional)

  -- Kertas (satuan: rim)
  spec_sheets_per_rim INTEGER,        -- lembar per rim
  spec_paper_size     VARCHAR(20),    -- A4 | A3 | F4 | Custom

  -- Tinta (satuan: liter/ml)
  spec_volume_ml      INTEGER,        -- volume per kemasan dalam ml
  spec_ink_type       VARCHAR(100),   -- Pigment | Dye | Eco-Solvent | dll

  -- Aksesoris (satuan: pcs/pack)
  spec_pcs_per_pack   INTEGER,        -- isi per pack

  spec_notes          TEXT,

  -- Derived field (ADR-0001): coverage area atau qty per satuan pembelian
  -- Dihitung saat batch dibuat, di-cache di sini untuk performa BOM calculation
  spec_coverage_per_unit DECIMAL(14,6),
  -- contoh roll: 50m × 1.52m = 76 m²/roll → spec_coverage_per_unit = 76
  -- contoh rim: 500 lembar → spec_coverage_per_unit = 500
  -- contoh tinta: 1000 ml → spec_coverage_per_unit = 1000

  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT batches_code_per_tenant UNIQUE (tenant_id, batch_code),
  CONSTRAINT batches_qty_remaining_non_negative CHECK (qty_remaining >= 0)
);

CREATE INDEX idx_material_batches_item ON material_batches(inventory_item_id)
  WHERE qty_remaining > 0;
```

### 7.3 `material_usage`

```sql
-- Layer 2 traceability: pemakaian aktual bahan per order_item
CREATE TABLE material_usage (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id     UUID         NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  batch_id          UUID         NOT NULL REFERENCES material_batches(id),
  tenant_id         UUID         NOT NULL,

  qty_used          DECIMAL(12,6) NOT NULL CHECK (qty_used > 0),
  qty_waste         DECIMAL(12,6) NOT NULL DEFAULT 0,
  waste_category    VARCHAR(50),   -- misprint | setup | trim | other
  price_per_unit    BIGINT        NOT NULL,   -- snapshot harga batch saat dipakai

  -- Input method (untuk audit)
  input_method      VARCHAR(10)   NOT NULL DEFAULT 'manual',
  -- manual | qr_scan

  operator_id       UUID          NOT NULL REFERENCES users(id),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_material_usage_order_item ON material_usage(order_item_id);
CREATE INDEX idx_material_usage_batch ON material_usage(batch_id);
```

### 7.4 `stock_adjustments`

```sql
-- Semua perubahan stok non-penerimaan dan non-pemakaian
-- (stok opname, koreksi manual, expiry, dll)
CREATE TABLE stock_adjustments (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID         NOT NULL REFERENCES inventory_items(id),
  tenant_id         UUID         NOT NULL,

  type              VARCHAR(20)  NOT NULL,
  -- opname_adjust | manual_adjust | expired | damaged | initial

  qty_before        DECIMAL(12,3) NOT NULL,
  qty_change        DECIMAL(12,3) NOT NULL,   -- positif = tambah, negatif = kurang
  qty_after         DECIMAL(12,3) NOT NULL,

  reason            TEXT,   -- wajib untuk opname (AC-117)
  reference_id      UUID,   -- stock_opname_session_id atau null

  adjusted_by       UUID    NOT NULL REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 7.5 `stock_opname_sessions`

```sql
CREATE TABLE stock_opname_sessions (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL REFERENCES tenants(id),
  branch_id   UUID         NOT NULL REFERENCES branches(id),

  status      VARCHAR(20)  NOT NULL DEFAULT 'in_progress',
  -- in_progress | reviewing | approved | cancelled

  started_by  UUID         NOT NULL REFERENCES users(id),
  approved_by UUID         REFERENCES users(id),
  approved_at TIMESTAMPTZ,

  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

### 7.6 `stock_opname_items`

```sql
CREATE TABLE stock_opname_items (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID          NOT NULL REFERENCES stock_opname_sessions(id)
                                        ON DELETE CASCADE,
  inventory_item_id     UUID          NOT NULL REFERENCES inventory_items(id),
  tenant_id             UUID          NOT NULL,

  system_qty            DECIMAL(12,3) NOT NULL,   -- stok sistem saat opname dimulai
  physical_qty          DECIMAL(12,3),             -- NULL = belum diisi
  difference            DECIMAL(12,3)
    GENERATED ALWAYS AS (physical_qty - system_qty) STORED,

  reason                TEXT,   -- wajib jika ada selisih (AC-117)
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 7.7 `purchase_orders`

```sql
CREATE TABLE purchase_orders (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL REFERENCES tenants(id),
  branch_id   UUID         NOT NULL REFERENCES branches(id),

  po_number   VARCHAR(20)  NOT NULL,
  -- format: PO-{YYYYMMDD}-{3digit}

  supplier    VARCHAR(255) NOT NULL,
  status      po_status_enum NOT NULL DEFAULT 'draft',
  notes       TEXT,

  submitted_by  UUID       NOT NULL REFERENCES users(id),
  approved_by   UUID       REFERENCES users(id),
  approved_at   TIMESTAMPTZ,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT po_number_per_tenant UNIQUE (tenant_id, po_number)
);
```

### 7.8 `purchase_order_items`

```sql
CREATE TABLE purchase_order_items (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id   UUID          NOT NULL REFERENCES purchase_orders(id)
                                      ON DELETE CASCADE,
  inventory_item_id   UUID          NOT NULL REFERENCES inventory_items(id),
  tenant_id           UUID          NOT NULL,

  qty_ordered         DECIMAL(12,3) NOT NULL,
  qty_received        DECIMAL(12,3) NOT NULL DEFAULT 0,
  unit                VARCHAR(50)   NOT NULL   -- snapshot satuan saat PO dibuat
);
```

---

## 8. Queue System

### 8.1 `queue_sessions`

```sql
-- Satu sesi per hari per cabang
CREATE TABLE queue_sessions (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL REFERENCES tenants(id),
  branch_id   UUID         NOT NULL REFERENCES branches(id),
  date        DATE         NOT NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  reset_by    UUID         REFERENCES users(id),
  reset_at    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT queue_sessions_one_active_per_branch_per_day
    UNIQUE (tenant_id, branch_id, date)
);
```

### 8.2 `queue_tickets`

```sql
CREATE TABLE queue_tickets (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID         NOT NULL REFERENCES queue_sessions(id),
  tenant_id   UUID         NOT NULL,
  branch_id   UUID         NOT NULL,

  prefix      CHAR(1)      NOT NULL DEFAULT 'A',
  sequence    SMALLINT     NOT NULL,
  number      VARCHAR(6)   NOT NULL,   -- contoh: A-015, computed: prefix || '-' || lpad(sequence, 3, '0')

  status      queue_status_enum NOT NULL DEFAULT 'waiting',
  counter     VARCHAR(50),   -- nama counter: "Counter 1", "Counter 2"

  called_at   TIMESTAMPTZ,
  served_at   TIMESTAMPTZ,
  done_at     TIMESTAMPTZ,

  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT tickets_sequence_per_session_prefix UNIQUE (session_id, prefix, sequence)
);

CREATE INDEX idx_queue_tickets_status ON queue_tickets(session_id, status)
  WHERE status IN ('waiting', 'called', 'serving');
```

---

## 9. POS & Payments

### 9.1 `payments`

```sql
CREATE TABLE payments (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID         NOT NULL REFERENCES orders(id),
  tenant_id   UUID         NOT NULL,

  amount      BIGINT       NOT NULL,   -- sen, jumlah yang dibayarkan
  method      payment_method_enum NOT NULL,
  is_partial  BOOLEAN      NOT NULL DEFAULT FALSE,

  -- Untuk cash: kembalian
  tendered    BIGINT,      -- jumlah yang diserahkan customer
  change      BIGINT,      -- kembalian

  processed_by  UUID       NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
```

---

## 10. HR & Payroll

### 10.1 `employee_profiles`

```sql
-- Satu per user (semua role kecuali display)
CREATE TABLE employee_profiles (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id       UUID         NOT NULL,

  -- Data pribadi (PII — encrypted at rest via pgcrypto atau app-level encryption)
  nik             TEXT,       -- Nomor Induk Kependudukan (encrypted)
  address         TEXT,
  phone           VARCHAR(20),
  photo_url       TEXT,

  -- Kontrak aktif
  position        VARCHAR(100),
  contract_type   contract_type_enum,
  base_salary     BIGINT,      -- sen per bulan (bulanan), per hari (harian)
  bank_account    TEXT,        -- encrypted
  bank_name       VARCHAR(100),
  joined_at       DATE,

  status          employee_status_enum NOT NULL DEFAULT 'aktif',

  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT employee_profiles_user_unique UNIQUE (user_id)
);

-- Riwayat perubahan kontrak (immutable — append only) (AC-144)
CREATE TABLE employee_contract_history (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID         NOT NULL REFERENCES employee_profiles(id),
  tenant_id       UUID         NOT NULL,

  contract_type   contract_type_enum NOT NULL,
  base_salary     BIGINT       NOT NULL,
  effective_date  DATE         NOT NULL,
  notes           TEXT,
  changed_by      UUID         NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

### 10.2 `attendance_records`

```sql
CREATE TABLE attendance_records (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id   UUID        NOT NULL REFERENCES employee_profiles(id),
  tenant_id     UUID        NOT NULL,
  branch_id     UUID        NOT NULL REFERENCES branches(id),

  date          DATE        NOT NULL,
  status        attendance_status_enum NOT NULL,
  check_in      TIME,
  check_out     TIME,
  overtime_hours DECIMAL(4,2) DEFAULT 0,

  recorded_by   UUID        REFERENCES users(id),
  -- NULL jika self-service via Portal Karyawan

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT attendance_one_per_employee_per_day UNIQUE (employee_id, date)
);
```

### 10.3 `incentive_configs`

```sql
CREATE TABLE incentive_configs (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  -- Target: per produk atau per kategori
  target_type     VARCHAR(10)  NOT NULL,   -- 'product' | 'category'
  product_id      UUID         REFERENCES products(id) ON DELETE CASCADE,
  category        VARCHAR(100),
  -- Constraint: salah satu harus di-set
  CONSTRAINT incentive_config_target CHECK (
    (target_type = 'product' AND product_id IS NOT NULL AND category IS NULL) OR
    (target_type = 'category' AND category IS NOT NULL AND product_id IS NULL)
  ),

  rate_type       incentive_rate_enum NOT NULL,
  -- per_pcs: rate_value = Rp per pcs (dalam sen)
  -- pct_revenue: rate_value = persen (0.01 = 1%)

  rate_value      DECIMAL(10,4) NOT NULL,

  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### 10.4 `incentive_records`

```sql
-- Di-create otomatis saat order_item → ready (AC-151)
CREATE TABLE incentive_records (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id   UUID         NOT NULL REFERENCES order_items(id),
  user_id         UUID         NOT NULL REFERENCES users(id),
  tenant_id       UUID         NOT NULL,

  amount          BIGINT       NOT NULL,   -- sen
  config_snapshot JSONB        NOT NULL,
  -- snapshot konfigurasi insentif saat dihitung
  -- { rate_type, rate_value, target_type, product_id|category }

  status          incentive_status_enum NOT NULL DEFAULT 'pending',
  -- pending → confirmed → paid
  -- pending → revoked (jika item di-cancel setelah ready — AC-155)

  calculated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  paid_at         TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ,
  revoke_reason   TEXT
);

CREATE INDEX idx_incentive_records_user_month
  ON incentive_records(user_id, date_trunc('month', calculated_at));
```

### 10.5 `payroll_runs`

```sql
CREATE TABLE payroll_runs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id),
  branch_id       UUID        REFERENCES branches(id),

  period_year     SMALLINT    NOT NULL,
  period_month    SMALLINT    NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  status          VARCHAR(20) NOT NULL DEFAULT 'draft',
  -- draft | processing | approved | paid

  processed_by    UUID        NOT NULL REFERENCES users(id),
  approved_by     UUID        REFERENCES users(id),
  approved_at     TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT payroll_runs_one_per_period UNIQUE (tenant_id, branch_id, period_year, period_month)
);
```

### 10.6 `payroll_entries`

```sql
CREATE TABLE payroll_entries (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id  UUID    NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id     UUID    NOT NULL REFERENCES employee_profiles(id),
  tenant_id       UUID    NOT NULL,

  base_salary     BIGINT  NOT NULL,
  total_incentive BIGINT  NOT NULL DEFAULT 0,
  overtime_pay    BIGINT  NOT NULL DEFAULT 0,
  deductions      BIGINT  NOT NULL DEFAULT 0,
  net_salary      BIGINT  GENERATED ALWAYS AS
    (base_salary + total_incentive + overtime_pay - deductions) STORED,

  work_days       SMALLINT,
  work_hours      DECIMAL(5,2),

  -- Breakdown detail dalam JSONB untuk slip gaji
  incentive_breakdown JSONB,
  notes               TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 11. Delivery

### 11.1 `delivery_assignments`

```sql
CREATE TABLE delivery_assignments (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tenant_id         UUID         NOT NULL,
  courier_id        UUID         NOT NULL REFERENCES users(id),

  status            delivery_status_enum NOT NULL DEFAULT 'assigned',

  customer_address  TEXT,
  pickup_time       TIMESTAMPTZ,
  delivery_time     TIMESTAMPTZ,
  proof_photo_url   TEXT,    -- R2/S3 key

  fail_reason       TEXT,
  fail_count        SMALLINT NOT NULL DEFAULT 0,

  assigned_by       UUID         NOT NULL REFERENCES users(id),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_delivery_courier ON delivery_assignments(courier_id)
  WHERE status NOT IN ('terkirim', 'gagal_kirim');
```

---

## 12. Notification & Audit

### 12.1 `notifications`

```sql
CREATE TABLE notifications (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id       UUID         NOT NULL,

  event_type      VARCHAR(50)  NOT NULL,
  -- order.created | item.status_changed | order.ready | stock.low
  -- po.needs_approval | order.overdue | incentive.earned

  title           VARCHAR(255) NOT NULL,
  body            TEXT         NOT NULL,

  -- Link ke resource
  resource_type   VARCHAR(50),   -- order | inventory_item | purchase_order | dll
  resource_id     UUID,

  is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,

  -- Channel yang sudah dikirim
  sent_in_app     BOOLEAN      NOT NULL DEFAULT TRUE,
  sent_wa         BOOLEAN      NOT NULL DEFAULT FALSE,
  sent_email      BOOLEAN      NOT NULL DEFAULT FALSE,

  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, created_at DESC)
  WHERE is_read = FALSE;
```

### 12.2 `notification_preferences`

```sql
CREATE TABLE notification_preferences (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id   UUID        NOT NULL,
  event_type  VARCHAR(50) NOT NULL,

  in_app      BOOLEAN     NOT NULL DEFAULT TRUE,
  whatsapp    BOOLEAN     NOT NULL DEFAULT TRUE,
  email       BOOLEAN     NOT NULL DEFAULT FALSE,

  CONSTRAINT notif_prefs_unique UNIQUE (user_id, event_type)
);
```

### 12.3 `audit_logs`

```sql
-- Semua aksi destructive — immutable, tidak ada UPDATE/DELETE (AC per NFR security)
CREATE TABLE audit_logs (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL,
  user_id     UUID,        -- NULL jika system action
  user_name   VARCHAR(255),   -- denormalized snapshot

  action      VARCHAR(100) NOT NULL,
  -- contoh: order.cancelled, user.deactivated, stock.adjusted,
  --         bom.edited, payroll.approved

  resource_type VARCHAR(50),
  resource_id   UUID,

  before_data   JSONB,    -- state sebelum aksi
  after_data    JSONB,    -- state setelah aksi

  ip_address    INET,
  user_agent    TEXT,
  request_id    VARCHAR(50),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log tidak boleh di-update atau di-delete (enforce via RLS atau trigger)
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(tenant_id, resource_type, resource_id);
```

---

## 13. API & Integration

### 13.1 `api_keys`

```sql
CREATE TABLE api_keys (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  name        VARCHAR(100) NOT NULL,   -- contoh: "Website Titaniumprint.id"
  key_hash    TEXT         NOT NULL,   -- bcrypt hash dari full key — tidak simpan plaintext
  key_prefix  VARCHAR(20)  NOT NULL,   -- contoh: "pk_live_abc1" — untuk identifikasi

  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  revoked_at  TIMESTAMPTZ,

  created_by  UUID         NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT api_keys_prefix_unique UNIQUE (key_prefix)
);
```

### 13.2 `webhooks`

```sql
CREATE TABLE webhooks (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID         NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

  url         TEXT         NOT NULL,
  secret      TEXT         NOT NULL,   -- HMAC secret untuk validasi signature
  events      TEXT[]       NOT NULL,   -- array: order.created, item.status_changed, order.ready
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,

  created_by  UUID         NOT NULL REFERENCES users(id),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

### 13.3 `webhook_deliveries`

```sql
-- Log setiap pengiriman webhook — untuk retry dan debugging
CREATE TABLE webhook_deliveries (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id    UUID         NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  tenant_id     UUID         NOT NULL,

  event_type    VARCHAR(50)  NOT NULL,
  payload       JSONB        NOT NULL,

  status        VARCHAR(20)  NOT NULL DEFAULT 'pending',
  -- pending | delivered | failed | retrying

  http_status   SMALLINT,
  response_body TEXT,
  attempt_count SMALLINT     NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,

  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  delivered_at  TIMESTAMPTZ
);

CREATE INDEX idx_webhook_deliveries_retry
  ON webhook_deliveries(next_retry_at)
  WHERE status IN ('pending', 'retrying');
```

---

## 14. Indexes

```sql
-- ─── Orders ──────────────────────────────────────────────────────────────────

-- Query utama: filter status + sort deadline per tenant/branch
CREATE INDEX idx_orders_tenant_branch_status
  ON orders(tenant_id, branch_id, status);

-- Query overdue: deadline sudah lewat, status belum selesai
CREATE INDEX idx_orders_deadline_active
  ON orders(deadline)
  WHERE status NOT IN ('closed', 'cancelled');

-- Tracking publik: lookup by token (frequent, dari QR scan)
CREATE INDEX idx_orders_tracking_token
  ON orders(tracking_token);

-- Search nomor SPK
CREATE INDEX idx_orders_spk_number
  ON orders(tenant_id, spk_number);

-- ─── Order Items ──────────────────────────────────────────────────────────────

-- Production board query: semua item per status per branch
CREATE INDEX idx_order_items_status
  ON order_items(status, order_id);

-- Assignment per user (designer/operator inbox)
CREATE INDEX idx_order_items_designer
  ON order_items(assigned_designer_id)
  WHERE status IN ('design_queue', 'in_design');

CREATE INDEX idx_order_items_operator
  ON order_items(assigned_operator_id)
  WHERE status IN ('production_queue', 'printing', 'finishing');

-- ─── Inventory ────────────────────────────────────────────────────────────────

-- Alert stok menipis
CREATE INDEX idx_inventory_low_stock
  ON inventory_items(tenant_id, branch_id)
  WHERE current_stock <= min_stock AND deleted_at IS NULL;

-- BOM snapshot lookup
CREATE INDEX idx_bom_snapshots_order_item
  ON bom_snapshots(order_item_id);

-- ─── Material Usage ───────────────────────────────────────────────────────────

CREATE INDEX idx_material_usage_order_item
  ON material_usage(order_item_id);

CREATE INDEX idx_material_usage_batch
  ON material_usage(batch_id);

-- ─── Incentives ───────────────────────────────────────────────────────────────

-- Portal karyawan: insentif user per bulan
CREATE INDEX idx_incentive_records_user_month
  ON incentive_records(user_id, date_trunc('month', calculated_at));

-- Payroll processing: semua insentif pending per tenant per bulan
CREATE INDEX idx_incentive_records_tenant_pending
  ON incentive_records(tenant_id, status, calculated_at)
  WHERE status = 'pending';

-- ─── Queue ────────────────────────────────────────────────────────────────────

CREATE INDEX idx_queue_tickets_session_waiting
  ON queue_tickets(session_id, prefix, sequence)
  WHERE status = 'waiting';

-- ─── Notifications ────────────────────────────────────────────────────────────

CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, created_at DESC)
  WHERE is_read = FALSE;

-- ─── Audit ────────────────────────────────────────────────────────────────────

CREATE INDEX idx_audit_logs_resource
  ON audit_logs(tenant_id, resource_type, resource_id, created_at DESC);
```

---

## 15. Row-Level Security Policies

```sql
-- ─── Enable RLS pada semua tabel operasional ─────────────────────────────────

ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items         ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products            ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_batches    ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_usage      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE incentive_records   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs          ENABLE ROW LEVEL SECURITY;
-- (dan semua tabel lainnya)

-- ─── Fungsi helper untuk ambil tenant_id dari JWT ────────────────────────────

CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.tenant_id', TRUE), '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION current_branch_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.branch_id', TRUE), '')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS $$
  SELECT current_setting('app.user_role', TRUE);
$$ LANGUAGE SQL STABLE;

-- Application layer set ini sebelum setiap query:
-- SET LOCAL app.tenant_id = '{tenant_id_from_jwt}';
-- SET LOCAL app.branch_id = '{branch_id_from_jwt}';
-- SET LOCAL app.user_role = '{role_from_jwt}';

-- ─── Policy template (contoh untuk tabel orders) ─────────────────────────────

-- Tenant isolation: setiap user hanya bisa akses data tenant sendiri
CREATE POLICY orders_tenant_isolation ON orders
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- Branch isolation untuk non-owner (owner bisa lihat semua cabang)
CREATE POLICY orders_branch_isolation ON orders
  FOR SELECT
  USING (
    current_user_role() IN ('owner', 'accountant')
    OR branch_id = current_branch_id()
  );

-- Audit logs: read-only, tidak bisa di-delete
CREATE POLICY audit_logs_readonly ON audit_logs
  FOR DELETE
  USING (FALSE);   -- tidak ada yang bisa delete

CREATE POLICY audit_logs_no_update ON audit_logs
  FOR UPDATE
  USING (FALSE);   -- tidak ada yang bisa update

-- Notifications: user hanya lihat notif miliknya
CREATE POLICY notifications_owner ON notifications
  FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND user_id = current_setting('app.user_id', TRUE)::UUID
  );
```

---

## 16. Custom Types (ENUMs)

```sql
-- Subscription
CREATE TYPE subscription_tier_enum AS ENUM (
  'solo', 'studio', 'pro', 'business', 'enterprise'
);

-- User roles
CREATE TYPE user_role_enum AS ENUM (
  'owner', 'branch_manager', 'cashier', 'designer',
  'operator', 'warehouse', 'courier', 'hr_admin', 'accountant', 'display'
);

-- Order item lifecycle — TANPA design_review (ADR per AC-063)
CREATE TYPE order_item_status_enum AS ENUM (
  'confirmed',
  'design_queue',
  'in_design',
  'production_queue',
  'printing',
  'finishing',
  'ready'
);

-- SPK-level status (derived dari item statuses)
CREATE TYPE order_status_enum AS ENUM (
  'active',      -- ada minimal 1 item belum ready
  'ready',       -- semua item ready
  'delivered',   -- customer sudah ambil
  'closed',      -- sudah diambil DAN sudah lunas
  'cancelled'    -- semua item di-cancel
);

-- Prioritas SPK
CREATE TYPE priority_enum AS ENUM ('normal', 'urgent', 'vip');

-- Sumber order
CREATE TYPE order_source_enum AS ENUM ('walk_in', 'online', 'telepon', 'referral');

-- Metode pembayaran
CREATE TYPE payment_method_enum AS ENUM ('cash', 'transfer', 'qris');

-- Tipe pricing produk
CREATE TYPE product_pricing_type_enum AS ENUM ('large_format', 'flat', 'tiered');

-- Formula BOM
CREATE TYPE bom_formula_type_enum AS ENUM ('flat', 'per_m2', 'per_qty');

-- Kategori bahan
CREATE TYPE inventory_category_enum AS ENUM (
  'media_cetak', 'kertas', 'tinta', 'finishing', 'aksesoris', 'lainnya'
);

-- Tipe customer
CREATE TYPE customer_type_enum AS ENUM ('individu', 'perusahaan', 'instansi');

-- Status antrian
CREATE TYPE queue_status_enum AS ENUM (
  'waiting', 'called', 'serving', 'done', 'skipped'
);

-- Status PO
CREATE TYPE po_status_enum AS ENUM (
  'draft', 'dikirim', 'partial', 'diterima', 'dibatalkan'
);

-- Status pengiriman
CREATE TYPE delivery_status_enum AS ENUM (
  'assigned', 'dalam_perjalanan', 'terkirim', 'gagal_kirim'
);

-- Tipe kontrak karyawan
CREATE TYPE contract_type_enum AS ENUM (
  'bulanan', 'harian', 'freelance', 'borongan'
);

-- Status karyawan
CREATE TYPE employee_status_enum AS ENUM ('aktif', 'non_aktif', 'cuti');

-- Status absensi
CREATE TYPE attendance_status_enum AS ENUM (
  'hadir', 'izin', 'sakit', 'alpha', 'cuti'
);

-- Tipe insentif
CREATE TYPE incentive_rate_enum AS ENUM ('per_pcs', 'pct_revenue');

-- Status insentif
CREATE TYPE incentive_status_enum AS ENUM ('pending', 'confirmed', 'paid', 'revoked');
```

---

## 17. Migration Strategy

### Setup Awal

```sql
-- 1. Buat database
CREATE DATABASE printeoo;

-- 2. Aktifkan extensions yang dibutuhkan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- untuk gen_random_bytes, encrypt
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- untuk full-text search customer/produk

-- 3. Buat semua ENUM types (Section 16) sebelum tabel

-- 4. Buat tabel core (Section 4) — tenants, branches, users, invitations

-- 5. Buat tabel operasional (Section 5–13) dalam urutan yang respects FK

-- 6. Buat indexes (Section 14)

-- 7. Setup RLS (Section 15)

-- 8. Buat triggers
```

### Trigger `updated_at`

```sql
-- Fungsi sekali, dipakai di banyak tabel
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach ke setiap tabel yang punya updated_at
CREATE TRIGGER orders_set_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- (ulangi untuk: order_items, customers, products, inventory_items, dll)
```

### Trigger `current_stock` Update

```sql
-- Update inventory_items.current_stock setelah insert di material_usage
CREATE OR REPLACE FUNCTION update_stock_on_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory_items
  SET current_stock = current_stock - (NEW.qty_used + NEW.qty_waste),
      updated_at = NOW()
  FROM material_batches b
  WHERE b.id = NEW.batch_id
    AND inventory_items.id = b.inventory_item_id;

  -- Update qty_remaining di batch
  UPDATE material_batches
  SET qty_remaining = qty_remaining - (NEW.qty_used + NEW.qty_waste)
  WHERE id = NEW.batch_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER material_usage_update_stock
  AFTER INSERT ON material_usage
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_usage();
```

### Trigger Insentif Otomatis

```sql
-- Hitung insentif saat order_item.status → ready
CREATE OR REPLACE FUNCTION calculate_incentive_on_ready()
RETURNS TRIGGER AS $$
DECLARE
  config incentive_configs%ROWTYPE;
  item_revenue BIGINT;
  incentive_amount BIGINT;
  product_category TEXT;
BEGIN
  -- Hanya proses jika status berubah menjadi 'ready'
  IF NEW.status = 'ready' AND OLD.status != 'ready' THEN
    -- Cari konfigurasi insentif yang berlaku
    SELECT ic.* INTO config
    FROM incentive_configs ic
    JOIN products p ON (ic.target_type = 'product' AND ic.product_id = NEW.product_id)
      OR (ic.target_type = 'category' AND ic.category = p.category)
    WHERE p.id = NEW.product_id
      AND ic.tenant_id = NEW.tenant_id
      AND ic.is_active = TRUE
    LIMIT 1;

    IF FOUND AND NEW.assigned_operator_id IS NOT NULL THEN
      -- Hitung amount
      item_revenue := NEW.subtotal;
      IF config.rate_type = 'per_pcs' THEN
        incentive_amount := (config.rate_value * NEW.qty)::BIGINT;
      ELSE -- pct_revenue
        incentive_amount := (item_revenue * config.rate_value / 100)::BIGINT;
      END IF;

      INSERT INTO incentive_records (
        order_item_id, user_id, tenant_id,
        amount, config_snapshot, status
      ) VALUES (
        NEW.id, NEW.assigned_operator_id, NEW.tenant_id,
        incentive_amount,
        row_to_json(config)::JSONB,
        'pending'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_item_incentive_on_ready
  AFTER UPDATE OF status ON order_items
  FOR EACH ROW EXECUTE FUNCTION calculate_incentive_on_ready();
```

### SPK Number Generation (Concurrent-Safe)

```sql
-- Sequence per branch per hari — via advisory lock
-- Dipanggil dari application layer sebelum INSERT orders

CREATE TABLE spk_counters (
  branch_id   UUID  NOT NULL REFERENCES branches(id),
  date        DATE  NOT NULL,
  last_seq    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (branch_id, date)
);

-- Fungsi atomic increment
CREATE OR REPLACE FUNCTION next_spk_sequence(p_branch_id UUID, p_date DATE)
RETURNS INTEGER AS $$
DECLARE
  next_seq INTEGER;
BEGIN
  INSERT INTO spk_counters (branch_id, date, last_seq)
  VALUES (p_branch_id, p_date, 1)
  ON CONFLICT (branch_id, date)
  DO UPDATE SET last_seq = spk_counters.last_seq + 1
  RETURNING last_seq INTO next_seq;

  RETURN next_seq;
END;
$$ LANGUAGE plpgsql;

-- Penggunaan dari application:
-- SELECT next_spk_sequence('{branch_id}', CURRENT_DATE);
-- → returns 42
-- → format: 'SPK-SBY-20260525-0042'
```

### Considerations untuk Neon / Supabase

```sql
-- Jika menggunakan Supabase, tambahkan auth.uid() ke RLS policies:
CREATE POLICY orders_supabase_auth ON orders
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id FROM users
      WHERE id = auth.uid()::UUID
    )
  );

-- Jika menggunakan Neon serverless + Hono.js:
-- Set session variables sebelum query:
-- await client.query(`SET LOCAL app.tenant_id = $1`, [tenantId])
-- await client.query(`SET LOCAL app.user_id = $1`, [userId])
-- await client.query(`SET LOCAL app.user_role = $1`, [role])
```

---

## Appendix: Table Count Summary

| Kelompok | Tabel | Keterangan |
|---|---|---|
| Core | tenants, branches, users, user_sessions, user_invitations | 5 tabel |
| Orders | customers, orders, order_items, order_item_status_history, order_files, order_timeline | 6 tabel |
| Products | products, product_price_tiers, bom_entries, bom_snapshots | 4 tabel |
| Inventory | inventory_items, material_batches, material_usage, stock_adjustments, stock_opname_sessions, stock_opname_items, purchase_orders, purchase_order_items | 8 tabel |
| Queue | queue_sessions, queue_tickets | 2 tabel |
| POS | payments | 1 tabel |
| HR | employee_profiles, employee_contract_history, attendance_records, incentive_configs, incentive_records, payroll_runs, payroll_entries | 7 tabel |
| Delivery | delivery_assignments | 1 tabel |
| Cross-cutting | notifications, notification_preferences, audit_logs | 3 tabel |
| Integration | api_keys, webhooks, webhook_deliveries | 3 tabel |
| Internal | spk_counters | 1 tabel |
| **Total** | | **41 tabel** |
