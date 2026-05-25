# INSTRUKSI UPDATE PROTOTYPE — Printeoo v1.1
**Untuk:** Claude Code  
**Dibuat:** 2026-05-25  
**Konteks:** Baca `docs/printeoo-prd-v1.1.md` dan `docs/printeoo-architecture-v0.2.md` sebelum mulai.  
**Scope:** Update prototype HTML/JS/CSS yang sudah ada di `/prototype` — bukan build production.

---

## ATURAN UMUM SEBELUM MULAI

1. **Jangan sentuh** `CLAUDE.md` dan `STATE.md` kecuali diminta update di akhir task.
2. **Jangan hapus** fitur yang sudah ada kecuali eksplisit disebut di instruksi ini.
3. **Baca `prototype/data.js` dan `prototype/app.js` dulu** sebelum menulis kode apapun — pahami struktur data dan routing yang sudah ada.
4. **Setiap task selesai: update `STATE.md`** — tandai task selesai, catat progress, catat bug yang ditemukan.
5. Prototype menggunakan **vanilla JS + hash routing** — jangan tambahkan framework apapun.
6. Semua tanggal tampilkan dalam format **DD MMMM YYYY** (contoh: 25 Mei 2026). Semua waktu dalam format **24 jam** (16:00, bukan 4:00 PM).

---

## TASK LIST

---

### TASK-101 — Hapus stage "Review Pelanggan" dari seluruh prototype

**Priority:** 🔴 CRITICAL — harus dikerjakan pertama, semua task lain depend on ini  
**Estimasi:** 30 menit  
**Files yang terpengaruh:** `data.js`, `app.js`, `pages/production.html` (kanban), `pages/order-detail.html`

**Perubahan yang harus dilakukan:**

**1. `data.js` — Update status values:**
- Cari semua kemunculan `design_review` di `APP_DATA.orders` dan data manapun
- Ganti `design_review` → `in_design` (jika SPK sedang di-review, anggap masih in_design)
- Hapus `design_review` dari array/enum status yang mungkin ada

**2. `app.js` — Update state machine:**
- Cari fungsi atau konstanta yang mendefinisikan status lifecycle SPK
- Hapus `design_review` dari lifecycle
- Update transisi: `in_design` sekarang bisa langsung → `production_queue`
- Tambahkan kemampuan push-back: `in_design` → `in_design` (dengan catatan, untuk kasus revisi)

**3. Kanban board (Production Board):**
- Hapus kolom "Review Pelanggan" dari kanban
- Kolom kanban yang valid setelah ini:
  ```
  Antrian Desain | Sedang Desain | Antrian Cetak | Sedang Cetak | Finishing | Siap Ambil
  ```
- Pastikan counter per kolom masih akurat setelah kolom dihapus

**4. Filter status di halaman Pesanan (daftar order):**
- Hapus "Review Pelanggan" dari dropdown filter status
- Update label status badge jika ada yang menggunakan `design_review`

**5. Progress bar di Detail SPK:**
- Progress bar horizontal di header detail SPK menampilkan tahap-tahap
- Hapus tahap "Review Pelanggan"
- Tahap yang valid setelah ini: Terkonfirmasi → Antrian Desain → Sedang Desain → Antrian Cetak → Sedang Cetak → Finishing → Siap Ambil → Selesai

**Acceptance Criteria:**
- [ ] Tidak ada kemunculan teks "Review Pelanggan" di seluruh prototype
- [ ] Tidak ada kemunculan `design_review` di seluruh JS dan HTML
- [ ] Kanban hanya punya 6 kolom (tanpa Review Pelanggan)
- [ ] Progress bar detail SPK hanya punya tahap yang valid
- [ ] Tidak ada error di console browser setelah perubahan

---

### TASK-102 — Implementasi SPK Multi-Item: Update data.js

**Priority:** 🔴 HIGH  
**Estimasi:** 45 menit  
**Depends on:** TASK-101  
**Files:** `data.js`

**Konsep kunci:**
SPK sekarang punya `items` — array berisi satu atau lebih produk/item. Setiap item punya status produksi sendiri.

**Update struktur `APP_DATA.orders`:**

Ubah setiap order dari struktur lama:
```javascript
// SEBELUM (single product)
{
  id: 'SPK-SBY-20260520-0001',
  customer: 'PT Maju Jaya Surabaya',
  product: 'Banner Flexi China 340gr',
  qty: '12 m2',
  total: 336000,
  status: 'ready',
  // ...
}
```

Ke struktur baru:
```javascript
// SESUDAH (multi-item)
{
  id: 'SPK-SBY-20260520-0001',
  customer: 'PT Maju Jaya Surabaya',
  deadline: '...',
  priority: 'urgent',
  dp: 168000,
  total: 336000,
  // Status SPK = derived dari items (status item paling tertinggal)
  // Untuk prototype: tambahkan field derivedStatus yang dihitung dari items
  items: [
    {
      itemId: 'ITEM-001-01',
      seq: 1,
      product: 'Banner Flexi China 340gr',
      specs: { width: 3, height: 4, finishing: ['Mata Ayam'] },
      qty: 12,
      unit: 'm2',
      unitPrice: 28000,
      total: 336000,
      needsDesign: false,
      status: 'ready',          // status individual item
      assignedTo: 'Eko Pramono',
      notes: 'Warna sesuai file',
      // Estimasi material (dari BOM)
      materialEstimate: [
        { material: 'Flexi China 340gr', qty: 1.44, unit: 'roll' },
        { material: 'Mata Ayam Banner', qty: 34, unit: 'pcs' }
      ],
      // Aktual material (yang sudah di-record)
      materialActual: [
        { material: 'Flexi China 340gr', qty: 1.5, unit: 'roll', batch: 'BCH-FLX340-001' }
      ]
    }
    // item ke-2, ke-3, dst jika ada
  ]
}
```

**Minimal 5 SPK harus punya lebih dari 1 item** untuk mendemonstrasikan fitur multi-item. Contoh:
- SPK untuk PT Maju Jaya: 3 item (Banner + Spanduk + Flyer)
- SPK untuk Universitas Airlangga: 2 item (Brosur + Poster)
- SPK untuk Dinas Koperasi: 2 item (Backdrop + Kartu Nama)
- Dan seterusnya (minimal 2 SPK lagi)

**Tambahkan helper function di data.js:**
```javascript
// Helper: hitung derived status SPK dari status semua item-nya
function getOrderDerivedStatus(order) {
  const statusPriority = [
    'confirmed', 'design_queue', 'in_design',
    'production_queue', 'printing', 'finishing', 'ready'
  ];
  if (!order.items || order.items.length === 0) return 'confirmed';
  const lowestPriority = Math.min(...order.items.map(item => 
    statusPriority.indexOf(item.status)
  ));
  return statusPriority[lowestPriority];
}
window.getOrderDerivedStatus = getOrderDerivedStatus;
```

**Acceptance Criteria:**
- [ ] Semua orders di `APP_DATA.orders` menggunakan struktur baru dengan `items` array
- [ ] Minimal 5 SPK memiliki lebih dari 1 item
- [ ] Setiap item punya field: `itemId`, `seq`, `product`, `specs`, `qty`, `unit`, `unitPrice`, `total`, `needsDesign`, `status`, `assignedTo`, `materialEstimate`, `materialActual`
- [ ] Helper `getOrderDerivedStatus` tersedia di `window`
- [ ] Tidak ada error saat `data.js` di-load di browser

---

### TASK-103 — Update Daftar Pesanan untuk Multi-Item

**Priority:** 🟡 MEDIUM  
**Estimasi:** 30 menit  
**Depends on:** TASK-102  
**Files:** `app.js` (fungsi render daftar order), `pages/orders.html` jika ada

**Perubahan:**

**1. Kolom "Produk" di tabel daftar order:**
- Sebelum: menampilkan satu produk
- Sesudah: jika 1 item → tampilkan nama produk. Jika >1 item → tampilkan produk pertama + badge `+N lagi` (contoh: "Banner Flexi China 340gr +2 lagi")

**2. Kolom "Qty":**
- Jika multi-item: tampilkan jumlah item, bukan qty (contoh: "3 item")

**3. Status badge:**
- Gunakan `getOrderDerivedStatus(order)` untuk menentukan status yang ditampilkan
- Tambahkan tooltip: jika hover status badge → tampilkan breakdown (contoh: "2 item selesai, 1 item sedang cetak")

**4. Filter "Overdue":**
- Tambahkan tombol filter "Overdue" sejajar dengan "Hari Ini" dan "Minggu Ini" yang sudah ada
- Logika: tampilkan SPK di mana deadline sudah lewat DAN ada item yang belum `ready`

**Acceptance Criteria:**
- [ ] SPK multi-item menampilkan produk pertama + badge "+N lagi" di kolom Produk
- [ ] Filter "Overdue" berfungsi dan memfilter dengan benar
- [ ] Status SPK menggunakan derived status dari items
- [ ] Tidak ada perubahan visual yang merusak layout existing

---

### TASK-104 — Update Detail SPK untuk Multi-Item

**Priority:** 🔴 HIGH  
**Estimasi:** 60 menit  
**Depends on:** TASK-102  
**Files:** `app.js` (fungsi `renderOrderDetail`), `pages/order-detail.html`

**Perubahan di halaman Detail SPK:**

**1. Header SPK:**
- Tetap tampilkan nomor SPK, status derived, deadline, prioritas
- Tambahkan: "X item · Total Rp Y.YYY.YYY"

**2. Progress bar (tahap produksi):**
- Hapus "Review Pelanggan" (sudah di TASK-101)
- Progress bar sekarang menunjukkan status **item yang paling tertinggal**
- Di bawah progress bar: tambahkan ringkasan item "3 item: 1 selesai, 1 sedang cetak, 1 antrian desain"

**3. Ganti section "Info Pesanan" menjadi daftar item:**
```
┌─────────────────────────────────────────────────────┐
│ ITEM 1 — Banner Flexi China 340gr          [SELESAI] │
│ 12 m² · Rp 336.000 · Eko Pramono                    │
│ Estimasi: 1.44 roll Flexi, 34 pcs Mata Ayam          │
│ Aktual: 1.5 roll Flexi (deviasi: +0.06 roll, +4.2%) │
├─────────────────────────────────────────────────────┤
│ ITEM 2 — Spanduk Kain Anti Air          [SEDANG CETAK]│
│ 6 m² · Rp 180.000 · Eko Pramono                     │
│ Estimasi: 0.7 roll Spanduk Kain                      │
│ Aktual: belum direcord                               │
└─────────────────────────────────────────────────────┘
```

**4. Section Material & Waste:**
- Tetap ada, tapi sekarang tampilkan per item (tab atau accordion per item)
- Judul: "Material — Item 1: Banner Flexi China 340gr"

**5. Aksi & Catatan (kanan):**
- Tombol aksi sesuai status derived SPK
- **PENTING — fix dari UX audit:**
  - Tombol "Batalkan SPK": pindah ke dropdown "⋯ Lainnya", gunakan style outline (bukan solid merah)
  - Ganti "Tandai Sudah Diambil & Lunas" menjadi DUA tombol terpisah:
    - "Tandai Diambil" (primary)
    - "Tandai Lunas" (secondary/outline)

**Acceptance Criteria:**
- [ ] Daftar item ditampilkan dengan status individual masing-masing
- [ ] Estimasi vs aktual material ditampilkan per item
- [ ] Deviasi material dihitung dan ditampilkan (estimasi - aktual, dan persentasenya)
- [ ] Tombol "Batalkan" tidak lagi merah solid di header — sudah di dropdown ⋯
- [ ] Ada dua tombol terpisah: "Tandai Diambil" dan "Tandai Lunas"

---

### TASK-105 — Update Production Board (Kanban) untuk Multi-Item

**Priority:** 🔴 HIGH  
**Estimasi:** 45 menit  
**Depends on:** TASK-101, TASK-102  
**Files:** `app.js` (fungsi render kanban), `pages/production.html`

**Perubahan:**

**1. Unit card kanban = ITEM, bukan SPK:**
- Setiap item dalam setiap SPK menghasilkan satu card di kanban
- SPK dengan 3 item → 3 card, masing-masing di kolom sesuai status item-nya

**2. Konten card (per item):**
```
┌──────────────────────────────────┐
│ SPK-001 · Item 1/3               │  ← nomor SPK + urutan item
│ Banner Flexi China 340gr         │  ← nama produk
│ PT Maju Jaya Surabaya            │  ← nama customer
│ ⏰ 2 hari lagi          [Urgent] │  ← deadline + badge prioritas
│ 👤 Eko Pramono                   │  ← operator assigned
└──────────────────────────────────┘
```

**3. Modal detail item (saat card di-klik):**
- Tampilkan detail item: produk, specs, qty, status, operator
- Tampilkan estimasi material item ini
- Tombol "Update Status" → pindahkan item ke status berikutnya
- **Tambahkan link:** "Buka Detail SPK Lengkap →" yang navigasi ke `#/orders/{spk_id}`

**4. Indikator scroll horizontal:**
- Kanban ada 6 kolom, layar mungkin tidak cukup
- Tambahkan scrollbar visible di bawah kanban, atau indikator "● ● ○ ○" yang menunjukkan posisi scroll

**Acceptance Criteria:**
- [ ] Card = item (bukan SPK). SPK dengan 3 item = 3 card
- [ ] Label "SPK-001 · Item X/Y" terlihat di setiap card
- [ ] Modal detail item punya link "Buka Detail SPK Lengkap →"
- [ ] Scrollbar atau indikator posisi scroll terlihat
- [ ] Counter per kolom akurat (menghitung items, bukan SPK)

---

### TASK-106 — Update Form Input Pesanan Baru untuk Multi-Item

**Priority:** 🟡 MEDIUM  
**Estimasi:** 60 menit  
**Depends on:** TASK-102  
**Files:** `app.js` (fungsi `renderNewOrderForm`), `pages/new-order.html`

**Perubahan di form:**

**1. Section 2 sekarang mendukung multi-item:**

Ubah dari satu set field produk menjadi:
```
Section 2: Detail Pesanan

[Item 1]
Produk: [dropdown]     Qty: [input]    Harga Satuan: [auto-fill, locked sampai produk dipilih]
Spesifikasi: ...
Finishing: [ ] Laminasi Doff  [ ] Laminasi Glossy  [ ] Mata Ayam ...
Butuh Desain: [Ya/Tidak]
Catatan untuk operator: [textarea]
Total Item 1: Rp 0

[+ Tambah Item]    ← tombol untuk tambah item ke-2, ke-3, dst

──────────────────────────────
SUBTOTAL: Rp 0
Diskon: [dropdown Rp/%] [input]
TOTAL: Rp 0
```

**2. Logika "Harga Satuan":**
- Field Harga Satuan LOCKED (disabled) sampai produk dipilih
- Setelah produk dipilih: auto-fill dari APP_DATA.products[selected].price
- Jika user mengubah harga dari nilai default: tampilkan field kecil di bawahnya "Alasan perubahan harga" (wajib diisi)

**3. Format tanggal dan waktu:**
- Field deadline: tampilkan dalam format Indonesia. Jika menggunakan native `<input type="date">`, tambahkan helper yang menampilkan nilai dalam format "25 Mei 2026" di sebelahnya
- Field jam deadline: gunakan format 24 jam (16:00) — jika ada `type="time"`, pastikan tidak menampilkan AM/PM

**4. Upload file:**
- Pindahkan section upload file ke bawah tombol "Simpan Pesanan"
- Tampilkan sebagai: "Upload File Desain (opsional — bisa dilakukan setelah pesanan disimpan)"
- Ini mengurangi cognitive load kasir yang sedang melayani customer

**Acceptance Criteria:**
- [ ] Form mendukung input minimal 1 item, maksimal bebas (tombol + Tambah Item)
- [ ] Harga Satuan locked sampai produk dipilih
- [ ] Jika harga di-override: field alasan muncul dan wajib diisi sebelum save
- [ ] Format tanggal tampil Indonesia (DD MMMM YYYY)
- [ ] Format waktu 24 jam
- [ ] Upload file posisinya di bawah, bukan di tengah form
- [ ] Submit form → semua item masuk ke `APP_DATA.orders` dengan struktur multi-item

---

### TASK-107 — Tambah Role Kurir: Navigation dan Interface

**Priority:** 🟡 MEDIUM  
**Estimasi:** 45 menit  
**Depends on:** TASK-102  
**Files:** `app.js` (sidebar, role switcher, routing), `data.js`

**Perubahan:**

**1. Role Switcher (pojok kanan atas):**
- Tambahkan opsi "Kurir" di dropdown "Lihat sebagai:"

**2. Sidebar untuk role Kurir:**
- Kurir tidak mendapat sidebar penuh — hanya tampilan micro interface
- Saat login sebagai Kurir: sembunyikan sidebar, tampilkan halaman delivery khusus

**3. Buat halaman delivery micro-interface:**
Route baru: `#/delivery`

Layout (mobile-first, tanpa sidebar):
```
┌─────────────────────────────────┐
│  🚚 Pengiriman Hari Ini          │
│  Halo, [nama kurir]  · 3 tugas  │
├─────────────────────────────────┤
│  ● BELUM DIAMBIL                │
│  SPK-SBY-001 · PT Maju Jaya     │
│  Jl. Basuki Rahmat No. 12       │
│  [Konfirmasi Diambil]           │
├─────────────────────────────────┤
│  ● SEDANG DIANTAR               │
│  SPK-SBY-003 · Kopi Tepi Kali   │
│  Jl. Pemuda No. 45              │
│  [Konfirmasi Terkirim]          │
│  [+ Tambah Catatan]             │
├─────────────────────────────────┤
│  ✓ SELESAI HARI INI             │
│  SPK-SBY-002 · Terkirim 10:30   │
└─────────────────────────────────┘
```

**4. Data dummy delivery:**
Tambahkan ke `data.js`:
```javascript
APP_DATA.deliveries = [
  {
    id: 'DEL-001',
    spkId: 'SPK-SBY-20260520-0001',
    customer: 'PT Maju Jaya Surabaya',
    address: 'Jl. Basuki Rahmat No. 12, Surabaya',
    courierName: 'Budi Kurir',
    status: 'assigned',   // assigned | diambil | sedang_diantar | terkirim
    assignedAt: '2026-05-25T08:00:00',
    pickedUpAt: null,
    deliveredAt: null,
    notes: null
  },
  // minimal 3 delivery dengan status berbeda
]
```

**5. Shortcut login demo:**
Di halaman login, tambahkan tombol shortcut "Kurir" sejajar dengan Owner, Kasir, Operator, Display Mode.

**Acceptance Criteria:**
- [ ] Role "Kurir" ada di role switcher
- [ ] Saat login sebagai Kurir: langsung ke halaman delivery, sidebar tidak tampil
- [ ] Halaman delivery menampilkan daftar pengiriman dari APP_DATA.deliveries
- [ ] Tombol "Konfirmasi Diambil" mengubah status delivery ke "sedang_diantar"
- [ ] Tombol "Konfirmasi Terkirim" mengubah status delivery ke "terkirim"
- [ ] Status tersimpan ke localStorage

---

### TASK-108 — Tambah Portal Karyawan (Employee Self-Service)

**Priority:** 🟢 LOW  
**Estimasi:** 45 menit  
**Depends on:** TASK-107  
**Files:** `app.js`, `data.js`, buat `pages/portal-karyawan.html`

**Buat halaman baru: Portal Karyawan**
Route: `#/portal-karyawan`

**Accessible dari:** ikon user di footer sidebar (di bawah nama user yang sedang login)

**Layout:**
```
Portal Karyawan
[Tab: Ringkasan] [Tab: Insentif Saya] [Tab: Informasi Saya] [Tab: Teguran & Pengumuman]

── Tab Ringkasan ──
Bulan Mei 2026
Hari Hadir: 18 hari
Hari Absen: 2 hari
SPK/Item Selesai: 47 item
Insentif Terkumpul: Rp 235.000 (belum dibayar)

── Tab Insentif Saya ──
[Tabel: Tanggal | SPK | Item | Nilai | Status]
25 Mei | SPK-001 | Banner Flexi 3×2m | Rp 8.500 | Belum Dibayar
24 Mei | SPK-001 | Spanduk Kain 6m   | Rp 5.000 | Belum Dibayar
...
Total bulan ini: Rp 235.000

── Tab Informasi Saya ──
Nama: Eko Pramono
Posisi: Operator Cetak
Cabang: Surabaya Pusat
Tipe Kontrak: Bulanan

── Tab Teguran & Pengumuman ──
[kosong / dummy 1 teguran lama]
Pengumuman: "Libur Waisak 12 Mei 2026 — operasional tutup"
```

**Data dummy insentif:**
Tambahkan ke `data.js`:
```javascript
APP_DATA.incentives = {
  'Eko Pramono': [
    { date: '25 Mei 2026', spk: 'SPK-SBY-20260520-0001', item: 'Banner Flexi China 340gr', amount: 8500, status: 'pending' },
    { date: '24 Mei 2026', spk: 'SPK-SBY-20260519-0009', item: 'Spanduk Kain Anti Air', amount: 5000, status: 'pending' },
    // minimal 5 entri
  ]
}
```

**Acceptance Criteria:**
- [ ] Halaman Portal Karyawan bisa diakses dari semua role (kecuali Display)
- [ ] 4 tab berfungsi
- [ ] Tab Insentif menampilkan data dummy dari `APP_DATA.incentives` untuk user yang sedang login
- [ ] Total insentif bulan ini dihitung otomatis
- [ ] Halaman ini tidak menampilkan data insentif karyawan lain

---

### TASK-109 — Fix UX Issues Kritis dari Audit

**Priority:** 🔴 HIGH (beberapa item adalah bug visual)  
**Estimasi:** 45 menit  
**Depends on:** Tidak ada — bisa dikerjakan paralel  
**Files:** `app.js`, `style.css`, `pages/*.html`

**Fix yang harus dilakukan:**

**[FIX-01] Dashboard — Revenue bar chart: nilai Y-axis atau tooltip**
- Bar chart SVG di dashboard tidak ada nilai Y-axis
- Minimal: tambahkan tooltip saat hover bar → tampilkan nilai Rp
- Atau: tambahkan label nilai di atas setiap bar

**[FIX-02] Dashboard — Label konteks "Revenue Hari Ini" vs "Pesanan Hari Ini"**
- Jika pesanan hari ini = 0 tapi revenue ada, tambahkan sub-label di bawah metric card:
  - Di bawah "Pesanan Hari Ini: 0" → tambahkan teks kecil abu: "Order baru masuk hari ini"
  - Di bawah "Revenue Hari Ini" → tambahkan teks kecil abu: "Termasuk pelunasan order sebelumnya"

**[FIX-03] Dashboard — Completion rate kontradiksi**
- Jika ada 5 SPK selesai tapi completion rate 0%, ini kontradiksi
- Fix: completion rate = (SPK selesai hari ini) / (SPK aktif hari ini) × 100
- Atau: jika tidak ada data yang bisa dihitung akurat, sembunyikan completion rate di prototype

**[FIX-04] Keuangan — Revenue bar terpotong**
- Di halaman Keuangan, bar revenue terlalu panjang sehingga label "Rp 87." terpotong
- Fix: format angka besar menjadi "Rp 87,5 jt" atau berikan padding yang cukup di kanan bar

**[FIX-05] Pengaturan Tampilan — Toggle Dark Mode tidak bisa diklik**
- Toggle "Mode Gelap (Dark Mode)" saat ini bisa diklik padahal fitur belum tersedia
- Fix: tambahkan attribute `disabled` ke toggle, ubah cursor menjadi `not-allowed`, tambahkan tooltip "Tersedia di versi berikutnya"

**[FIX-06] Pengaturan Notifikasi — Tambahkan notifikasi kurir**
- Di halaman Pengaturan → Notifikasi, section "Pesanan & Produksi"
- Tambahkan item baru:
  ```
  Notifikasi Kurir
  Kirim WA ke kurir saat pesanan siap diantar   [toggle ON]
  
  Kurir belum di-assign
  Notif ke manager jika 30 menit belum ada kurir  [toggle OFF]
  ```

**[FIX-07] Pengaturan Pengguna & Akses — Tambahkan role Kurir dan Gudang ke matriks**
- Tabel "Matriks Hak Akses" di Pengaturan → Pengguna & Akses saat ini hanya ada 4 kolom role
- Tambahkan kolom: Gudang, Kurir
- Update centang per fitur sesuai permission matrix di PRD v1.1

**Acceptance Criteria:**
- [ ] Bar chart dashboard punya tooltip atau label nilai
- [ ] Tidak ada kontradiksi "0 pesanan tapi ada revenue" tanpa penjelasan
- [ ] Completion rate tidak menampilkan 0% jika ada SPK selesai
- [ ] Revenue bar di Keuangan tidak terpotong
- [ ] Toggle Dark Mode tidak bisa diklik (disabled state)
- [ ] Notifikasi kurir ada di Pengaturan → Notifikasi
- [ ] Matriks akses punya kolom Gudang dan Kurir

---

### TASK-110 — Update STATE.md setelah semua task selesai

**Priority:** 🟡 MEDIUM  
**Estimasi:** 15 menit  
**Depends on:** Semua task di atas

**Yang harus diupdate di STATE.md:**
- Tandai semua task baru (TASK-101 s/d TASK-109) sebagai selesai
- Update ringkasan progress (tambah fase baru: "Fase 8 — v1.1 Update")
- Catat keputusan teknis baru jika ada (di section KEPUTUSAN TEKNIS)
- Catat bug yang ditemukan selama pengerjaan (di section BUGS & ISSUES)
- Update section NEXT TASK

---

## URUTAN PENGERJAAN YANG DISARANKAN

```
TASK-101 (hapus Review Pelanggan)
    ↓
TASK-102 (update data.js multi-item)
    ↓
TASK-109 (fix UX kritis — paralel boleh)
    ↓
TASK-103 (daftar pesanan multi-item)
TASK-104 (detail SPK multi-item)
TASK-105 (kanban per item)
    ↓
TASK-106 (form input multi-item)
TASK-107 (role kurir + delivery interface)
    ↓
TASK-108 (portal karyawan)
    ↓
TASK-110 (update STATE.md)
```

---

## CATATAN PENTING UNTUK CLAUDE CODE

### Tentang data.js
Saat mengubah struktur `APP_DATA.orders` ke multi-item, **semua fungsi di `app.js` yang membaca `order.product`, `order.qty`, atau `order.status` langsung harus diupdate** untuk membaca dari `order.items[0]` atau menggunakan `getOrderDerivedStatus()`. Lakukan audit menyeluruh sebelum mengubah struktur data.

### Tentang localStorage
Prototype menggunakan localStorage untuk persistensi. Setelah mengubah struktur data, **clear localStorage** di browser sebelum testing untuk menghindari konflik dengan data lama.

### Tentang format tanggal
Semua tanggal yang ditampilkan ke user harus dalam format **DD MMMM YYYY** (25 Mei 2026). Gunakan formatter yang sudah ada di app.js jika tersedia, atau buat helper:
```javascript
function formatTanggalIndo(dateStr) {
  const bulan = ['Januari','Februari','Maret','April','Mei','Juni',
                 'Juli','Agustus','September','Oktober','November','Desember'];
  const d = new Date(dateStr);
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}
```

### Tentang "Simulasi SPK Masuk" di Production Display
Tombol ini tetap ada di prototype (dibutuhkan untuk demo). Tapi tambahkan komentar di kode:
```javascript
// PROTOTYPE ONLY — hapus di production build
// Referensi: printeoo-architecture-v0.2.md Section 3 M06
```

---

*Selesai. Feed file ini ke Claude Code bersama dengan `docs/printeoo-prd-v1.1.md` dan `docs/printeoo-architecture-v0.2.md` sebagai konteks.*
