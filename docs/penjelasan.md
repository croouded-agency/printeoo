# Penjelasan Arsitektur & Flow Printeoo

Dokumen ini menjawab tiga pertanyaan teknis dari diskusi dengan programmer terkait desain sistem Printeoo.

---

## 1. Metode Inventory yang Digunakan

Printeoo menggunakan **perpetual inventory** dengan model **3-layer traceability**, bukan periodic/FIFO/LIFO sederhana.

### Cara Kerjanya

**Layer 1 — Estimasi (saat SPK dibuat)**
```
BOM × qty item × (1 + waste%) = estimasi kebutuhan
```
> Snapshot immutable — tidak berubah meski BOM diedit kemudian.

**Layer 2 — Usage aktual (saat produksi)**
```
Operator scan QR batch → input qty pakai + qty waste
→ Stok berkurang secara real-time per batch
```

**Layer 3 — Rekonsiliasi (job costing)**
```
Estimasi vs aktual → deviasi → alert jika > threshold
Cost per item = qty aktual × harga batch yang dipakai
```

### Yang Perlu Disamakan Persepsinya

- **Stok dikelola di level batch**, bukan hanya di level jenis bahan. Satu jenis bahan (misalnya "Flexi China 340gr") bisa punya beberapa batch dengan harga dan spesifikasi fisik berbeda karena beli dari supplier berbeda.
- **Harga bahan tidak ada di master bahan** — harga masuk saat `CatatPenerimaan` dan tersimpan di level batch. Kalkulasi job costing memakai harga aktual batch yang di-scan, bukan harga rata-rata (average costing).
- **Stok opname** tersedia sebagai mekanisme koreksi berkala.

### Schema Kunci

```
inventory_items     (jenis bahan: nama, kategori, satuan, min_stock)
  └── material_batches  (per penerimaan: harga, spek fisik, qty_remaining)
        └── material_usage  (per order_item: qty_used, qty_waste)
```

---

## 2. Konversi Satuan

Ini adalah **gap yang saat ini hanya sebagian terjawab** di PRD — perlu didiskusikan lebih jauh.

### Yang Sudah Ada di Desain

Sistem menyimpan **spesifikasi fisik per batch** saat penerimaan, dan digunakan untuk kalkulasi BOM:

| Jenis Bahan | Input saat Penerimaan | Preview di BOM |
|---|---|---|
| Roll media cetak | Panjang (m) × Lebar (m) | `50 × 1.52 = 76 m²/roll → 0,0132 roll/m²` |
| Kertas | Isi per rim (lembar) + ukuran (A4/A3/F4) | `1 rim = 500 lembar A4` |
| Tinta | Volume per kemasan (ml) | `1.000 ml/kemasan` |

### Konversi yang Terjadi di BOM

Formula BOM punya tiga tipe:

| Tipe Formula | Keterangan | Contoh |
|---|---|---|
| `flat` | Bahan X per order, fixed | 1 roll per banner apapun ukurannya |
| `per_m2` | Bahan X per m² — konversi terjadi di sini | Luas order ÷ luas per roll = qty roll |
| `per_qty` | Bahan X per pcs ordered | 1 plastik wrap per 100 pcs kartu nama |

### Gap yang Belum Didefinisikan di PRD

Konversi **lintas satuan yang berbeda** belum ditangani. Contoh skenario yang belum dijawab:

- Bahan dibeli dalam satuan `kg`, dipakai dalam `gram` per pcs
- Tinta dibeli dalam `liter`, dikonsumsi dalam `ml` per m²

**Keputusan:** Menggunakan pendekatan *Derived Unit* — BOM ditulis dalam satuan logis operasional (`m²`, `lembar`, `ml`), konversi ke satuan pembelian dilakukan saat kalkulasi estimasi menggunakan spesifikasi fisik dari batch terbaru. Lihat [ADR-0001](adr/0001-unit-conversion-strategy.md) untuk konteks lengkap dan alternatif yang dipertimbangkan.

---

## 3. Apakah Sudah Mengadopsi Dynamic Pricing?

**Jawaban singkat: sebagian — ada elemen dynamic, tapi belum fully dynamic.**

### Yang Sudah Ada (Semi-Dynamic)

| Mekanisme | Tipe | Implementasi |
|---|---|---|
| `large_format` | Area-based | Input dimensi (cm) → auto-hitung m² → harga = m² × rate. Harga berubah otomatis sesuai ukuran pesanan |
| `tiered` pricing | Quantity-based | Input qty → sistem lookup tier → harga per unit otomatis berubah. Contoh: 100 pcs = Rp 500/pcs, 500 pcs = Rp 350/pcs |
| Diskon per item | Manual override | Kasir bisa beri diskon nominal atau % per item |
| Diskon per SPK | Manual override | Diskon global di atas semua item |
| Harga editable | Manual override | Kasir bisa override harga satuan dari katalog |

### Yang Belum Ada (Truly Dynamic Pricing)

- Tidak ada **surge pricing** — harga naik otomatis saat deadline mepet atau order urgent
- Tidak ada **customer-tier pricing** — harga beda untuk pelanggan VIP vs reguler
- Tidak ada **time-based pricing** — harga berbeda hari biasa vs weekend
- Tidak ada **competitor-aware** atau demand-based pricing

### Kesimpulan

Pricing model saat ini adalah **rule-based semi-dynamic**: harga dihitung dari formula (area × rate, atau qty lookup table), bukan dari market signal.

Untuk print shop Indonesia di stage ini, ini sudah appropriate — fully dynamic pricing justru akan membingungkan kasir dan customer. Jika ada kebutuhan di masa depan, extension point-nya sudah ada: `unit_price` di `order_items` bisa di-override dan pricing logic bisa di-extend tanpa ubah schema.
