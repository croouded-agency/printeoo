# ADR-0001: Strategi Konversi Satuan — BOM vs Satuan Pembelian Batch

**Date:** 2026-05-26
**Status:** accepted
**Deciders:** Ahmad Chaidir (Product Owner)

---

## Context

Printeoo menyimpan stok bahan dalam satuan pembelian (`inventory_items.unit`): Roll, Rim, Liter, Pcs, dll. Sementara itu, Bill of Materials (BOM) perlu mendefinisikan konsumsi bahan dalam satuan yang relevan secara operasional — misalnya `m²` per `m²` luas cetak, atau `ml` per `m²` untuk tinta.

Timbul pertanyaan: apakah satuan di BOM harus sama dengan satuan pembelian di batch, atau sistem perlu mekanisme konversi?

Konteks tambahan yang mempengaruhi keputusan ini:
- Spesifikasi fisik bahan (`spec_length_m`, `spec_width_m`, `spec_volume_ml`, dll.) sudah dirancang tersimpan di level **batch** (`material_batches`), bukan di master bahan — karena supplier berbeda bisa punya spec berbeda untuk bahan yang sama (keputusan deliberate di PRD v2, M07.2).
- BOM sudah punya tiga tipe formula: `flat`, `per_m2`, `per_qty`.
- Preview kalkulasi BOM (`0,0132 roll/m²`) sudah ada di spec PRD dan bergantung pada spesifikasi fisik batch.
- Stok opname, PO, dan laporan keuangan semuanya bekerja dalam satuan pembelian.

---

## Decision

Kita menggunakan pendekatan **Derived Unit**: BOM ditulis dalam satuan logis operasional (`m²`, `lembar`, `ml`), dan sistem mengkonversi ke satuan pembelian saat kalkulasi estimasi dengan mengambil spesifikasi fisik dari batch terbaru yang tersedia.

Dua kolom ditambahkan ke schema yang sudah ada:
- `bom_entries.bom_unit` — satuan yang dipakai dalam formula BOM (misal: `m2`, `lembar`, `ml`)
- `material_batches.spec_coverage_per_unit` — coverage per unit pembelian untuk tinta/cat (misal: 70 m²/liter), melengkapi kolom `spec_*` yang sudah ada

Stok selalu dikurangi dan dilaporkan dalam **satuan pembelian** (`inventory_items.unit`). Konversi hanya terjadi di layer kalkulasi estimasi BOM, tidak di layer storage.

---

## Alternatives Considered

### Alternatif 1: Same-Unit Only — Satuan BOM = Satuan Pembelian

BOM ditulis dalam satuan yang sama persis dengan cara beli. Tinta dibeli per `liter`, BOM ditulis `0.015 liter/m²`.

- **Pros:** Tidak perlu logika konversi. Schema paling sederhana. Tidak ada risiko bug kalkulasi.
- **Cons:** Setiap kali supplier ganti spesifikasi (roll lebih panjang, kemasan lebih besar), seluruh BOM yang menggunakan bahan tersebut harus diupdate manual. Preview kalkulasi `0,0132 roll/m²` yang sudah ada di PRD tidak bisa otomatis — harus input manual. Menambah beban operasional owner.
- **Why not:** Konflik dengan nilai inti PRD: BOM harusnya stabil, tidak berubah hanya karena ganti supplier atau batch baru. Juga membuang nilai dari kolom `spec_*` yang sudah didesain di `material_batches`.

### Alternatif 2: Conversion Factor Global di Master Bahan

Tambah kolom `conversion_factor` di `inventory_items`. Misal: 1 roll = 76 m². BOM ditulis dalam `m²`, sistem bagi dengan factor untuk dapat qty roll.

- **Pros:** Konversi tersedia tanpa perlu lookup ke batch. Kalkulasi lebih sederhana.
- **Cons:** Keputusan PRD sudah eksplisit: spesifikasi fisik disimpan di level **batch** karena supplier berbeda bisa punya spec berbeda. Conversion factor global di master bahan akan sering out-of-sync dengan batch aktual. Contoh: beli roll baru yang lebih pendek (40m, bukan 50m) — factor di master bahan tetap `76 m²/roll` padahal seharusnya `60.8 m²/roll`. Laporan job costing menjadi tidak akurat.
- **Why not:** Secara langsung bertentangan dengan keputusan arsitektur yang sudah ada (spesifikasi di level batch). Menciptakan dua sumber kebenaran yang bisa konflik.

### Alternatif 3: Dual-Unit Storage — Simpan Stok dalam Dua Satuan Sekaligus

Stok disimpan sekaligus dalam satuan pembelian (roll) dan satuan logis (m²). Setiap transaksi masuk/keluar update keduanya.

- **Pros:** Query sederhana, tidak perlu kalkulasi saat display.
- **Cons:** Denormalisasi berat. Dua angka stok yang harus selalu sinkron — rentan drift. Stok opname menjadi membingungkan: user hitung fisik dalam satuan apa? Laporan keuangan pakai angka yang mana?
- **Why not:** Terlalu kompleks untuk masalah yang bisa diselesaikan di layer kalkulasi saja.

---

## Consequences

### Positive

- **BOM tidak perlu diupdate saat ganti supplier atau batch baru.** Formula tetap `0.014 m²/m²`, hanya reference batch bergeser ke yang terbaru.
- **Konsisten dengan arsitektur yang sudah ada.** Kolom `spec_*` di `material_batches` memang sudah dirancang untuk ini — keputusan ini tinggal memanfaatkannya, bukan menambah konsep baru.
- **Stok, PO, dan laporan keuangan tetap dalam satuan pembelian.** Tidak ada ambiguitas di angka keuangan.
- **Job costing akurat per batch.** Cost per item menggunakan harga dan spesifikasi dari batch yang benar-benar dipakai.
- **Satu tambahan kolom untuk tinta** (`spec_coverage_per_unit`) cukup untuk menutup kasus yang paling umum.

### Negative

- **Kalkulasi BOM lebih kompleks.** Butuh join ke `material_batches` + logika konversi per kategori bahan. Developer perlu memahami mapping: `m²` order → `spec_length_m × spec_width_m` → qty roll.
- **Preview BOM bergantung pada batch terbaru.** Jika batch terbaru tidak punya spec fisik, preview tidak bisa ditampilkan. Ini expected behavior tapi perlu dikomunikasikan ke user.
- **Dua kolom satuan di BOM** (`bom_unit` dan `purchase_unit`) bisa membingungkan developer baru jika tidak terdokumentasi.

### Risks

- **Batch tanpa spec fisik memblokir estimasi.** Mitigasi: warning di form BOM dan di form order jika batch terbaru tidak punya spec. Estimasi bisa dikosongkan (tidak memblokir submit SPK), tapi flag harus jelas.
- **Kategori bahan baru di masa depan mungkin butuh tipe konversi berbeda.** Mitigasi: kolom `bom_unit` adalah free-text, bukan enum. Logika konversi di-handle di application layer sehingga bisa di-extend tanpa migrasi schema.

---

## Schema Changes

Tambahan pada schema PRD v2 yang sudah ada:

```sql
-- bom_entries: tambah dua kolom
ALTER TABLE bom_entries ADD COLUMN bom_unit VARCHAR(20);
-- Nilai: 'm2', 'lembar', 'ml', 'pcs', 'gram'
-- Jika NULL, diasumsikan sama dengan inventory_items.unit (backward compatible)

-- material_batches: tambah satu kolom untuk tinta/cat
ALTER TABLE material_batches ADD COLUMN spec_coverage_per_unit DECIMAL(10,4);
-- Contoh: 70.0 untuk tinta yang punya coverage 70 m²/liter
-- NULL untuk kategori bahan yang tidak relevan (roll, kertas, aksesoris)
```

## Contoh Kalkulasi End-to-End

```
Produk: Banner 3×1m (luas = 3 m²)
Bahan:  Flexi China 340gr
BOM:    formula = per_m2, qty_formula = 1.0, waste_pct = 10%, bom_unit = 'm2'

Batch terbaru:
  spec_length_m = 50, spec_width_m = 1.52
  → luas per roll = 50 × 1.52 = 76 m²

Kalkulasi estimasi:
  kebutuhan_m2  = 3 × 1.0 × (1 + 0.10) = 3.3 m²
  qty_roll      = 3.3 / 76              = 0.0434 roll
  stok dikurangi: 0.0434 roll (satuan pembelian)

Jika batch tidak punya spec:
  → Warning: "Batch terbaru belum punya spesifikasi fisik. Estimasi tidak tersedia."
  → SPK tetap bisa dibuat, estimasi material dikosongkan
```
