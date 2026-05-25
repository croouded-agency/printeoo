# Printeoo — Product Requirements Document (PRD)
**Version:** 1.1  
**Status:** Ready for Development  
**Last Updated:** 2026-05-25  
**Prepared for:** Development Team / Claude Code / Codex  

---

## CHANGELOG

| Versi | Tanggal | Perubahan | Oleh |
|---|---|---|---|
| 1.0 | 2026-05-23 | Initial draft | Ahmad |
| 1.1 | 2026-05-25 | Multi-item SPK, traceability material revamp, role Kurir, role Gudang permission matrix, sistem insentif, Portal Karyawan | Ahmad + Printeoo Dev Assistant |

### Ringkasan Perubahan v1.1
1. **M04 — SPK sekarang multi-item.** Satu SPK bisa berisi beberapa produk/item. Item adalah unit produksi. SPK adalah unit transaksi.
2. **M05 — Production Board sekarang berbasis Item, bukan SPK.** Kanban card = satu item, bukan satu SPK.
3. **M07 — Traceability material direvisi total.** Flow scan QR di gudang (bukan di mesin), estimasi otomatis dari BOM, rekonsiliasi deviasi.
4. **M02 — Role Kurir ditambahkan.** Role baru dengan micro-interface delivery.
5. **M02 — Permission matrix Gudang dipertegas.**
6. **M10 — Sistem Insentif per SPK/Item ditambahkan.**
7. **M10 — Portal Karyawan (Employee Self-Service) ditambahkan.**
8. **M14 — Notifikasi kurir saat status SPK = ready ditambahkan.**
9. **Open Questions diupdate** — 3 item resolved, beberapa ditambah.

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
Print shop di Indonesia — terutama skala menengah — menghadapi tiga masalah utama:

1. **Operasional masih manual.** SPK ditulis di kertas, hilang saat ramai. Tidak ada tracking real-time dari order masuk sampai selesai.
2. **Tidak ada visibility bisnis.** Pemilik tidak tahu produk mana yang paling profitable, berapa waste material per bulan, atau berapa sebenarnya cost per job.
3. **Software yang ada mahal dan tidak dipercaya.** Solusi incumbent harganya Rp 100 juta+ per modul dan terbukti menggunakan data pelanggan untuk kepentingan bisnis mereka sendiri.

**Pain point tambahan yang dikonfirmasi dari lapangan (Yanuar, 15+ tahun di industri):**
4. **Loss material tidak terdeteksi.** Print shop sering kehilangan material tanpa tahu dari mana — karena tidak ada traceability antara proyek dan material yang dipakai. Deviasi antara estimasi dan aktual tidak pernah diukur.
5. **Karyawan tidak termotivasi.** Tidak ada sistem insentif yang transparan dan terhubung ke output nyata per pekerjaan.

### 1.3 Target User
**Primary:** Pemilik dan operator print shop skala menengah di Indonesia (5–50 karyawan, 1–5 cabang), terutama yang:
- Sudah menggunakan software lain dan frustrasi
- Ingin go digital tapi tidak mampu investasi besar di awal

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

**`owner`**
Pemilik bisnis. Akses penuh ke semua modul semua cabang. Satu-satunya role yang bisa manage subscription, billing, dan user management. Bisa konfigurasi insentif per role.

**`branch_manager`**
Manajer cabang. Akses penuh ke cabang yang ditugaskan. Tidak bisa akses cabang lain atau settings billing.

**`cashier`**
Kasir / customer service / deskprint. Input order multi-item, proses pembayaran, lihat daftar order. Tidak bisa akses laporan keuangan atau HR.

**`designer`**
Desainer grafis. Lihat dan update item SPK di queue desain. Upload file, tandai design ready, minta approval customer.

**`operator`**
Operator produksi. Lihat board produksi per item, update status item SPK di tahap cetak dan finishing. Scan QR material saat ambil dari gudang. Input qty material yang dipakai dan waste per item.

**`warehouse`**
Staff gudang. Full access inventory: incoming, cetak label QR, stock opname, adjustment, laporan waste. Bisa submit request PO (tidak bisa approve). Read-only untuk order (untuk lihat material yang dibutuhkan per item). Tidak bisa lihat harga di PO — hanya qty. Portal karyawan aktif.

**`courier`** *(BARU v1.1)*
Kurir pengiriman. Akses terbatas: hanya delivery queue yang di-assign ke mereka. Bisa update status pengiriman dan upload foto bukti. Tersedia untuk karyawan tetap maupun freelance — perbedaan hanya di tipe kontrak di HR. Portal karyawan aktif.

**`hr_admin`**
Admin HR/payroll. Full access HR, absensi, payroll, insentif. Tidak bisa akses order atau inventory.

**`accountant`**
Akuntan. Full access laporan keuangan, jurnal, pajak. Read-only untuk order, inventory, payroll.

**`display`**
Role khusus untuk device production display atau layar antrian. Read-only total, tidak bisa input apapun, tidak bisa membuka scanner. Login sekali, session tidak expired.

### 3.2 Permission Matrix (Lengkap)

| Action | owner | branch_mgr | cashier | designer | operator | warehouse | courier | hr_admin | accountant | display |
|---|---|---|---|---|---|---|---|---|---|---|
| Manage tenant settings | ✓ | — | — | — | — | — | — | — | — | — |
| Manage users & roles | ✓ | R | — | — | — | — | — | — | — | — |
| Manage subscription | ✓ | — | — | — | — | — | — | — | — | — |
| Configure incentive rules | ✓ | — | — | — | — | — | — | ✓ | — | — |
| Create/edit order (SPK) | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| View all orders | ✓ | ✓ | ✓ | R | R | R | — | — | R | — |
| Update SPK item status | ✓ | ✓ | ✓ | ✓(desain) | ✓(produksi) | — | — | — | — | — |
| Process payment | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| View production board | ✓ | ✓ | R | ✓ | ✓ | — | — | — | — | R |
| Input material usage (scan/manual) | ✓ | ✓ | — | — | ✓ | ✓ | — | — | — | — |
| Manage inventory | ✓ | ✓ | — | — | — | ✓ | — | — | — | — |
| View inventory | ✓ | ✓ | — | — | R | ✓ | — | — | R | — |
| Cetak label QR material | ✓ | ✓ | — | — | — | ✓ | — | — | — | — |
| Submit PO request | ✓ | ✓ | — | — | — | ✓(submit) | — | — | — | — |
| Approve PO | ✓ | ✓ | — | — | — | — | — | — | — | — |
| View delivery queue (semua) | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| View delivery queue (milik sendiri) | — | — | — | — | — | — | ✓ | — | — | — |
| Update delivery status | ✓ | ✓ | ✓ | — | — | — | ✓ | — | — | — |
| Manage employees | ✓ | R | — | — | — | — | ✓ | — | — | — |
| Process payroll | ✓ | — | — | — | — | — | ✓ | — | — | — |
| Manage incentives (input/approve) | ✓ | R | — | — | — | — | ✓ | — | — | — |
| View own incentive | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| View others' incentive | ✓ | R(branch) | — | — | — | — | ✓ | — | — | — |
| View financial reports | ✓ | R(branch) | — | — | — | — | — | ✓ | — | — |
| Manage accounting | ✓ | — | — | — | — | — | — | ✓ | — | — |
| View owner dashboard | ✓ | R(branch) | — | — | — | — | — | — | — | — |
| Manage product catalog | ✓ | ✓ | — | — | — | — | — | — | — | — |
| View product catalog | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — |
| Access display mode | ✓ | ✓ | — | — | — | — | — | — | — | ✓ |
| View Portal Karyawan (milik sendiri) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Export data | ✓ | ✓(branch) | — | — | — | — | R | ✓ | — | — |
| View audit log | ✓ | — | — | — | — | — | — | — | — | — |

### 3.3 Warehouse Permission Detail *(DIPERTEGAS v1.1)*

| Fitur Inventory | Warehouse |
|---|---|
| Lihat stok bahan | ✓ |
| Catat penerimaan barang (incoming) | ✓ |
| Generate & cetak label QR | ✓ |
| Catat pengeluaran barang (untuk SPK tertentu) | ✓ |
| Stok opname — input fisik | ✓ |
| Submit request PO | ✓ (submit saja) |
| Lihat qty di PO | ✓ |
| Lihat harga di PO | ✗ (harga tersembunyi) |
| Approve PO | ✗ (owner / branch_manager) |
| Edit data SPK / order | ✗ |
| Akses data keuangan | ✗ |
| Akses data karyawan lain | ✗ |
| Laporan waste (milik gudang sendiri) | ✓ |

---

## 4. TECHNICAL REQUIREMENTS

### 4.1 Platform
- **Web application** — responsive, priority desktop untuk owner/manager, priority tablet/mobile untuk operator, kasir, gudang, dan kurir
- **Progressive Web App (PWA)** — agar bisa di-install di tablet operator sebagai app
- **Offline-tolerant** — operator production board harus bisa update status item meski koneksi terganggu (sync saat koneksi kembali)

### 4.2 Browser Support
- Chrome 90+ (priority)
- Safari 14+ (iOS iPad support)
- Firefox 88+
- Edge 90+

### 4.3 Performance Requirements
- Page load (initial): < 3 detik pada koneksi 4G
- Dashboard data refresh: < 2 detik
- Production board realtime update: < 500ms latency (WebSocket)
- File upload SPK: support hingga 100MB per file, progress indicator wajib

### 4.4 Security Requirements
- HTTPS wajib di semua endpoint
- JWT authentication dengan refresh token (access token expire 15 menit, refresh token 7 hari)
- Password minimum 8 karakter, harus ada huruf + angka
- Rate limiting: 100 request/menit per user, 1000/menit per tenant
- Semua input di-sanitize (prevent XSS, SQL injection)
- File upload: validasi MIME type dan scan virus sebelum store
- Tenant data isolation via PostgreSQL Row Level Security
- Audit log untuk semua write actions: user_id, action, table, record_id, old_value, new_value, timestamp, IP

### 4.5 Data & Privacy
- Data residency: server Indonesia
- Backup: harian, retensi 30 hari, encrypted
- Export: tenant bisa export semua data kapanpun dalam format CSV/Excel
- Deletion: data dihapus permanen 30 hari setelah cancel, konfirmasi email dikirim
- Printeoo internal access: hanya boleh jika ada support ticket eksplisit dari tenant, dan tercatat di audit log

---

## 5. GLOBAL UI/UX REQUIREMENTS

### 5.1 Design Principles
- **Clarity over cleverness** — label dan aksi harus jelas tanpa perlu membaca dokumentasi
- **Mobile-first for operators** — kasir, operator, gudang, dan kurir rata-rata pakai tablet atau HP
- **High density untuk owner** — dashboard owner boleh dense karena dibaca di layar besar
- **Maximum 3 tap untuk aksi inti** — terutama untuk role warehouse, operator, kurir — mereka bekerja fisik
- **Bahasa Indonesia** — semua UI default bahasa Indonesia

### 5.2 Navigation Structure
```
Sidebar (desktop) / Bottom nav (mobile):
├── Dashboard (owner/manager)
├── Antrian
├── Pesanan (Order / SPK)
├── Produksi
├── Inventaris
├── Pengiriman (courier role)
├── Pelanggan
├── Karyawan & Payroll
├── Keuangan
├── Laporan
└── Pengaturan

Portal Karyawan (semua role kecuali display):
  Accessible via ikon user di header atau menu profil
  ├── Ringkasan Bulan Ini
  ├── Insentif Saya
  ├── Informasi Saya
  └── Notifikasi & Teguran
```

### 5.3 Color System (Status)
- **Biru** — status normal / in progress
- **Hijau** — selesai / lunas / stok aman
- **Oranye** — urgent / perlu perhatian / stok menipis
- **Merah** — overdue / error / stok habis / selisih negatif
- **Abu** — draft / tidak aktif

### 5.4 Notification Patterns
- **Toast** — aksi berhasil atau gagal (muncul 3 detik, pojok kanan atas)
- **Bell icon** — notifikasi yang butuh tindak lanjut (badge count)
- **Modal** — konfirmasi aksi destruktif (hapus, void, batalkan SPK, dll) — tombol destruktif harus outline/secondary, bukan solid merah
- **Inline error** — validasi form (di bawah field yang error)
- **Insentif mini-toast** — saat item SPK diselesaikan oleh role yang eligible: "+Rp X.XXX insentif" muncul 3 detik

### 5.5 Loading & Empty States
- Semua data fetching harus ada skeleton loader (bukan spinner saja)
- Empty state harus ada ilustrasi + teks + CTA

### 5.6 Format Lokal (WAJIB)
- Format angka: `1.000.000` (titik = ribuan, koma = desimal)
- Format tanggal: `DD MMMM YYYY` (contoh: 25 Mei 2026)
- Format waktu: 24 jam (16:00, bukan 4:00 PM)
- Timezone default: Asia/Jakarta (WIB), configurable per tenant

---

## 6. MODULE SPECIFICATIONS

---

### M01 — Authentication & Tenant Management

#### M01.1 Tenant Registration & Onboarding

**Flow:**
1. User buka printeoo.com → klik "Mulai Gratis"
2. Input: nama bisnis, nama pemilik, email, nomor HP, password
3. Verifikasi email (kode OTP 6 digit, valid 10 menit)
4. Onboarding wizard (bisa di-skip):
   - Pilih tipe bisnis (digital printing / offset / campuran)
   - Input nama cabang pertama + kota
   - Pilih tier (default: Studio, trial 14 hari)
   - Opsional: tambah produk pertama dari template
5. Redirect ke dashboard

**Acceptance Criteria:**
- [ ] Registrasi selesai dalam < 5 menit
- [ ] Email verifikasi terkirim dalam < 60 detik
- [ ] Jika email sudah terdaftar, tampilkan pesan error yang jelas + link "Lupa password"
- [ ] Onboarding wizard bisa di-skip di setiap step
- [ ] Tenant baru otomatis dapat akses trial 14 hari tier Pro
- [ ] Setelah trial habis, turun ke Solo kecuali upgrade

#### M01.2 Login

**Flow:**
1. Input email + password
2. Jika valid: generate JWT access token + refresh token, redirect ke dashboard
3. Jika gagal 5x berturut-turut: lock account 15 menit, kirim email notifikasi

**Acceptance Criteria:**
- [ ] Login berhasil → redirect ke halaman terakhir yang dikunjungi (atau dashboard sesuai role)
- [ ] "Ingat saya" → refresh token persist 30 hari
- [ ] Tanpa "Ingat saya" → session expire saat browser ditutup
- [ ] Lupa password: kirim link reset ke email, valid 1 jam, hanya bisa digunakan sekali
- [ ] Halaman login production: TIDAK ada shortcut role atau tombol demo apapun

#### M01.3 Multi-User dalam Satu Tenant

**Acceptance Criteria:**
- [ ] Owner bisa invite maksimal sesuai limit tier (Solo: 2 user, Studio: 10, Pro: 25, Business+: unlimited)
- [ ] User yang di-deactivate tidak bisa login, session langsung invalidated
- [ ] Owner tidak bisa menghapus dirinya sendiri

---

### M03 — Queue & Antrian

#### M03.1 Sistem Antrian Customer

**Flow:**
1. Customer datang → kasir klik "Ambil Nomor" atau customer scan QR di meja masuk
2. Sistem generate nomor antrian (format configurable, contoh: A-001, B-001)
3. Nomor muncul di layar antrian (M03.2)
4. Kasir siap layani → klik "Panggil Berikutnya"
5. Sistem panggil nomor berikutnya: update layar + audio announcement
6. Kasir bisa skip (nomor tidak hadir) atau recall (panggil ulang)

**Prefix antrian:** Dikonfigurasi di Pengaturan → Profil Bisnis. Setiap prefix punya definisi yang bisa diisi owner (contoh: A = Reguler, B = VIP, C = Pengambilan). Definisi prefix ditampilkan di halaman manajemen antrian dan di display publik sebagai legenda.

**Acceptance Criteria:**
- [ ] Nomor antrian auto-reset setiap hari mulai pukul 00:00
- [ ] Support multi-counter, nama counter bisa dikustomisasi per cabang
- [ ] Ubah jumlah counter aktif: harus ada dialog konfirmasi jika ada antrian sedang berjalan
- [ ] Kasir bisa lihat: nomor sedang dilayani, antrian menunggu, estimasi waktu tunggu
- [ ] History antrian tersimpan per hari

---

### M04 — Order Management (SPK Digital)

#### KONSEP KUNCI: SPK Multi-Item *(BARU v1.1)*

**SPK adalah unit transaksi. Item adalah unit produksi.**

Satu SPK dapat berisi satu atau lebih item produk. Setiap item memiliki:
- Produk & spesifikasi sendiri
- Qty, harga satuan, total sendiri
- Status produksi sendiri (bisa berbeda antar item dalam satu SPK)
- Material usage sendiri
- Operator assigned sendiri
- Insentif sendiri

**Contoh:**
```
SPK-SBY-20260525-0001 (container transaksi)
├── Customer: PT Maju Jaya Surabaya
├── Deadline: 28 Mei 2026
├── Total: Rp 4.850.000
│
├── ITEM 1: Banner Flexi China 340gr — 3×2m
│   Qty: 1 set | Harga: Rp 450.000
│   Status: [Sedang Cetak]
│   Operator: Eko Pramono
│
├── ITEM 2: Spanduk Kain Anti Air — 6×1m
│   Qty: 1 set | Harga: Rp 850.000
│   Status: [Antrian Desain]
│   Desainer: Maya Lestari
│
└── ITEM 3: Flyer A5 Full Color — 500 lembar
    Qty: 500 | Harga: Rp 3.550.000
    Status: [Terkonfirmasi]
    Operator: belum di-assign
```

**Status SPK (level transaksi):**
Status SPK di header adalah ringkasan otomatis dari status semua item-nya:
- Jika semua item `ready` → SPK = `ready`
- Jika ada satu item belum selesai → SPK = status item yang paling "tertinggal"
- Selalu tampilkan breakdown: "3 item: 1 cetak, 1 desain, 1 terkonfirmasi"

#### M04.1 Input Order Baru

**Form — Section 1: Data Customer**
- Nama customer* (autocomplete dari existing customer)
- Nomor HP* (auto-format: 08XX-XXXX-XXXX)
- Email (opsional)
- Tipe: Walk-in / Online / Telepon

**Form — Section 2: Item Pesanan** *(multi-item)*
- Minimal 1 item, bisa tambah item dengan tombol "+ Tambah Item"
- Per item:
  - Produk* (dropdown dari product catalog M15)
  - Spesifikasi dinamis (ukuran, bahan, finishing — sesuai konfigurasi produk)
  - Qty*
  - Harga satuan (auto-fill dari catalog, bisa di-override dengan catatan alasan)
  - Total (auto-kalkulasi)
  - Butuh desain: Ya / Tidak (per item)
  - Catatan khusus per item (untuk operator)
- Summary: subtotal semua item, diskon (per-SPK), total akhir

**Form — Section 3: Produksi & Pembayaran**
- Deadline* (date + time picker — format: 25 Mei 2026, 16:00)
- Prioritas: Normal / Urgent / VIP (berlaku untuk seluruh SPK)
- Upload file desain (opsional saat input, bisa dilakukan setelah save): max 100MB/file, max 10 file
- DP / uang muka (nominal, bisa 0)
- Metode DP: Cash / Transfer / QRIS
- Sisa yang harus dibayar (auto-kalkulasi)

**Auto-Generated saat Save:**
- Nomor SPK: `SPK-[KODE_CABANG]-[YYYYMMDD]-[4_DIGIT_SEQ]`
- Nomor Nota: `INV-[KODE_CABANG]-[YYYYMMDD]-[4_DIGIT_SEQ]`
- Per item: status awal `confirmed` (jika tidak butuh desain) atau `design_queue` (jika butuh desain)

**Acceptance Criteria:**
- [ ] Satu SPK bisa berisi 1–20 item produk
- [ ] Form bisa disubmit dalam < 3 menit untuk order standar (3 item)
- [ ] Harga satuan: field di-lock sampai produk dipilih; jika di-override manual, sistem wajib minta catatan alasan
- [ ] File upload: bisa di-skip saat input order, ada reminder di detail SPK "File desain belum diupload"
- [ ] Format tanggal dan waktu: DD MMMM YYYY, format 24 jam (bukan AM/PM)
- [ ] Setelah save: tampilkan preview SPK + tombol "Cetak SPK", "Kirim WA", "Buat SPK Lain"
- [ ] Semua item langsung muncul di production board sesuai status awal masing-masing

#### M04.2 SPK Detail View

**Tampilan:**
- Header: nomor SPK, status ringkasan, tanggal, kasir yang input, deadline, prioritas
- Progress per item (bukan satu progress bar SPK): tabel atau daftar item dengan status masing-masing
- Info pembayaran: total, DP, sisa tagihan, status lunas/belum
- File yang diupload (bisa preview inline untuk image/PDF)
- Timeline SPK (seluruh transisi dari semua item, tergabung berurutan by timestamp)
- Material & Waste per item (muncul setelah item masuk produksi)
- Catatan internal (bisa tambah catatan baru)
- Tombol aksi sesuai status dan role

**Tombol Aksi — Aturan UX:**
- Tombol "Batalkan SPK": wajib outline (bukan solid merah), ada di dropdown "⋯ Lainnya", bukan di header utama. Harus ada dialog konfirmasi dengan field alasan.
- Tombol "Tandai Diambil" dan "Tandai Lunas": dua tombol terpisah, bukan satu tombol gabung.

**Acceptance Criteria:**
- [ ] Setiap item ditampilkan dengan status individual-nya
- [ ] Timeline menampilkan semua transisi status dari semua item, diurutkan by timestamp
- [ ] Material usage per item: tampilkan estimasi vs aktual vs deviasi
- [ ] Tombol aksi: tergantung status dan role — tidak ada tombol yang tidak relevan tampil
- [ ] Batalkan SPK: hanya bisa jika tidak ada payment yang masuk; jika ada payment, harus refund dulu

#### M04.3 Daftar Order

**Fitur:**
- Tabel: No. SPK, Customer, Jumlah Item, Total, Deadline, Status Ringkasan, Aksi
- Filter: Status, Tanggal (range), Prioritas, Overdue (shortcut), Cabang, Kasir
- Search: by nomor SPK, nama customer, nomor HP, nama produk dalam item
- Sort: by deadline (default), by tanggal dibuat, by total
- Pagination: 25 per halaman
- Export: CSV atau Excel

**Acceptance Criteria:**
- [ ] Filter "Overdue" tersedia sebagai shortcut sejajar dengan "Hari Ini" dan "Minggu Ini"
- [ ] Row overdue: highlight merah, sort ke atas secara default
- [ ] Status SPK ringkasan: tampilkan badge + tooltip "X item selesai, Y item dalam proses"

#### M04.4 SPK Item Lifecycle & Status Transitions

Setiap **item** dalam SPK punya lifecycle sendiri:

```
Status Item         Siapa yang bisa trigger       Kondisi
────────────────────────────────────────────────────────────
confirmed        → design_queue   cashier, manager    Jika item butuh desain
confirmed        → prod_queue     cashier, manager    Jika item tidak butuh desain
design_queue     → in_design      designer            Saat mulai dikerjakan
in_design        → design_review  designer            Desain selesai, kirim ke customer
design_review    → prod_queue     cashier, manager    Customer approve
design_review    → in_design      cashier, manager    Customer minta revisi
prod_queue       → printing       operator            Mulai cetak
printing         → finishing      operator            Selesai cetak
finishing        → ready          operator            Selesai semua
```

**Status SPK (level transaksi — derived dari item):**
```
ready (semua item ready) → delivered (customer ambil) atau installation
installation             → delivered (setelah pasang selesai)
delivered                → closed (setelah lunas)
```

**Acceptance Criteria:**
- [ ] Setiap transisi item wajib tercatat: user, timestamp, catatan opsional
- [ ] Insentif operator dihitung saat item berubah ke status `ready`
- [ ] Saat semua item `ready` → trigger notifikasi ke customer (WA) + notifikasi ke kurir jika ada delivery
- [ ] SPK ke `closed` hanya bisa jika outstanding payment = 0

---

### M05 — Production Board

#### M05.1 Kanban Board *(DIREVISI TOTAL v1.1)*

**Unit terkecil di kanban adalah ITEM, bukan SPK.**

Satu SPK dengan 3 item akan muncul sebagai 3 card di kanban — masing-masing di kolom sesuai statusnya.

**Layout kolom:**
```
Antrian Desain | Sedang Desain | Review Pelanggan | Antrian Cetak | Sedang Cetak | Finishing | Siap Ambil
```

**Card Content (per item):**
- Nomor SPK + nomor urut item (contoh: "SPK-001 · Item 2/3")
- Nama produk + spesifikasi singkat
- Nama customer
- Deadline item (relative: "2 jam lagi", "Besok", "Overdue")
- Badge prioritas SPK (Urgent = oranye, VIP = ungu)
- Assigned operator/desainer (avatar/inisial)
- Indikator estimasi material: warna hijau jika BOM tersedia, abu jika belum
- Badge insentif (opsional, configurable oleh owner: tampilkan atau tidak)

**Role-based kolom visibility:**
- `designer`: hanya kolom Antrian Desain, Sedang Desain, Review Pelanggan
- `operator`: hanya kolom Antrian Cetak, Sedang Cetak, Finishing, Siap Ambil
- `owner` / `branch_manager`: semua kolom
- `cashier`: read-only, semua kolom

**Acceptance Criteria:**
- [ ] Board update real-time via WebSocket (< 500ms)
- [ ] Tap card → buka detail item dalam modal + link "Buka Detail SPK Lengkap →"
- [ ] Scroll horizontal dengan indikator posisi (pill atau scrollbar visible)
- [ ] Filter board: by operator assigned, by produk, by prioritas, by SPK tertentu
- [ ] Kanban header menampilkan counter item per kolom

#### M05.2 Modal Detail Item

Saat card di-tap, modal menampilkan:
- Nomor SPK + Item ke-X dari Y
- Status item saat ini
- Nama produk, spesifikasi, qty
- Nama customer, deadline, prioritas
- Assigned operator (bisa ganti dari modal)
- Estimasi material (dari BOM) vs material sudah di-record
- Catatan operator untuk item ini
- Tombol "Update Status" (tampilkan status berikutnya yang valid)
- Link "Buka Detail SPK Lengkap →" (navigasi ke halaman M04.2)

---

### M06 — Production Display Mode

*(Tidak ada perubahan signifikan dari v1.0, kecuali:)*

- Display sekarang menampilkan per **item**, bukan per SPK. Card item mencantumkan "SPK-001 · Item 2/3"
- Tombol "Simulasi SPK Masuk" **hanya ada di prototype demo**, tidak boleh ada di production build
- Role `display`: zero interaction, tidak ada scanner, tidak ada tombol apapun selain mute/unmute audio

---

### M07 — Inventory & Gudang

#### M07.1 Master Bahan Baku
*(Tidak ada perubahan)*

#### M07.2 Incoming Material (Penerimaan Barang)
*(Tidak ada perubahan)*

#### M07.2b — QR Label Fisik untuk Bahan Masuk
*(Tidak ada perubahan dari v1.0)*

#### M07.3 — Traceability Material: Flow Tiga Layer *(DIREVISI TOTAL v1.1)*

**Latar Belakang:**
Material loss adalah salah satu pain point terbesar print shop Indonesia. Akar masalahnya bukan hanya karena "tidak ketahuan dipakai untuk apa" — tapi karena tidak pernah ada rekonsiliasi antara *estimasi seharusnya pakai berapa* vs *aktual pakai berapa*. Sistem Printeoo menyelesaikan ini dengan tiga layer yang berlapis, tanpa menambah beban kerja operator secara signifikan.

**Prinsip desain:**
> Record material harus bisa dilakukan dalam **maksimal 3 tap** oleh operator yang belum pernah training, menggunakan HP layar retak, di ruangan berisik.

---

**LAYER 1 — Estimasi Otomatis dari BOM (Zero Input dari Karyawan)**

Bill of Materials (BOM) dikonfigurasi di M15 Product Catalog oleh owner/manager. Setiap produk punya formula estimasi material.

Contoh:
```
Produk: Banner Flexi China 340gr
Formula BOM:
  Material: Flexi China 340gr
  Qty estimasi: (width_m × height_m) ÷ 9 × 1.08  [waste factor 8%]
  Material: Mata Ayam
  Qty estimasi: ((width_m + height_m) × 2) ÷ 0.3  [per 30cm tepi]
```

Saat SPK dibuat dengan item Banner 3×2m, sistem otomatis generate:
```
Estimasi Material Item 1 (Banner 3×2m):
  Flexi China 340gr: 0.72 roll  (6m² ÷ 9 × 1.08)
  Mata Ayam: 34 pcs
```

Estimasi ini ditampilkan di:
- Detail SPK (tab Material, per item)
- Kanban card (indikator BOM tersedia)
- Dashboard gudang (total kebutuhan material per hari dari semua SPK aktif)

**Acceptance Criteria Layer 1:**
- [ ] BOM dikonfigurasi per produk di M15, bukan per SPK
- [ ] Estimasi auto-generate saat SPK dibuat, tidak butuh input karyawan
- [ ] Jika produk tidak punya BOM: tampilkan warning "Estimasi material belum dikonfigurasi untuk produk ini"
- [ ] Estimasi bisa di-override manual oleh owner/manager per item SPK (dengan catatan alasan)

---

**LAYER 2 — Record Aktual via Scan QR di Gudang (Maximum Accountability, Minimum Friction)**

**Prinsip:** Scan QR dilakukan di **gudang saat mengambil material**, bukan di mesin saat mencetak. Gudang adalah chokepoint — semua material harus lewat sini. Ini lebih mudah dikontrol.

**Flow lengkap:**

*Step 1 — Operator atau warehouse ambil material dari gudang:*
1. Scan QR label fisik di material (dari HP/tablet)
2. Sistem tampilkan halaman Batch Info (mobile-optimized, tanpa sidebar):
   - Nama bahan, batch ID, qty tersisa, tanggal masuk
   - Tombol "Catat Pengambilan untuk SPK"
3. Tap "Catat Pengambilan untuk SPK"
4. Sistem tampilkan daftar SPK aktif yang di-assign ke operator ini (max 10 item, sorted by deadline)
5. Pilih SPK + item yang sesuai
6. Input qty yang diambil (field numerik, auto-suggest dari estimasi BOM)
7. Tap "Simpan" → selesai. Total: 3–4 tap.

*Step 2 — Setelah selesai produksi (opsional tapi direkomendasikan):*
Dari kanban card atau detail SPK, operator input sisa material (jika ada yang dikembalikan) atau waste (gagal cetak, trim).

**Tampilan auto-suggest qty:**
```
Estimasi BOM: 0.72 roll
[  0.72  ] roll  ← field pre-filled dari estimasi, bisa diubah
```

**Acceptance Criteria Layer 2:**
- [ ] Scan QR bisa dilakukan dari browser HP/tablet tanpa install app (gunakan html5-qrcode atau zxing-js)
- [ ] Daftar SPK di Step 4: hanya SPK yang memiliki item assigned ke operator yang sedang scan, atau semua SPK aktif jika role = warehouse
- [ ] Qty field: pre-filled dari estimasi BOM, bisa diubah, bukan mandatory sama dengan estimasi
- [ ] Jika stok batch = 0: warning "Stok batch ini sudah habis" — tidak block, operator bisa konfirmasi lanjut
- [ ] Fallback dropdown: jika scan QR tidak berhasil, operator bisa pilih bahan secara manual dari dropdown catalog
- [ ] Setiap record pengambilan: catat user_id, batch_id, spk_id, item_id, qty_ambil, timestamp, user_agent

---

**LAYER 3 — Rekonsiliasi & Anomali Detection (untuk Owner/Manager)**

Sistem otomatis menghitung deviasi dan menampilkan anomali.

**Per item SPK, tampilkan:**
```
Material: Flexi China 340gr
  Estimasi BOM:   0.72 roll
  Diambil:        0.90 roll  (Eko Pramono, 25 Mei 09:15)
  Sisa/dikembalikan: 0.05 roll
  Aktual terpakai: 0.85 roll
  Deviasi:        +0.13 roll (+18%) ⚠️
```

**Alert otomatis ke owner/branch_manager:**
- Deviasi > 20% dari estimasi BOM → notifikasi "Material usage anomali pada SPK-001 Item 1"
- Threshold deviasi configurable per tenant di pengaturan

**Laporan Deviasi (di dashboard owner dan M13):**
- Deviasi rata-rata per produk (menunjukkan apakah BOM perlu dikoreksi atau ada masalah operasional)
- Operator dengan deviasi tertinggi (menunjukkan kebutuhan pelatihan)
- Tren deviasi per bulan

**Acceptance Criteria Layer 3:**
- [ ] Deviasi dihitung otomatis saat ada record aktual
- [ ] Threshold alert configurable (default: 20%)
- [ ] Laporan deviasi per produk tersedia di M13 analytics
- [ ] Jika BOM tidak tersedia: deviasi tidak bisa dihitung, tampilkan "-" bukan 0%

---

#### M07.4 Stock Real-Time
- Current stock
- Reserved (dialokasikan ke SPK aktif berdasarkan estimasi BOM)
- Available (current - reserved)
- Per batch: qty_initial, qty_remaining, tanggal masuk

#### M07.5 Waste Tracking per Item SPK
*(Tidak ada perubahan — waste sekarang di-record per item, bukan per SPK)*

#### M07.6 Stock Opname
- Nama sesi opname (deskriptif, bukan hanya tanggal)
- Input hitungan fisik per bahan
- Sistem generate selisih (sistem vs fisik)
- Kolom "Diinput oleh" per baris (untuk accountability jika ada beberapa orang opname)
- Alasan penyesuaian (wajib diisi sebelum approve)
- Approval & adjustment oleh owner/branch_manager
- Export hasil opname ke PDF (untuk dokumen resmi yang bisa ditandatangani)

**Acceptance Criteria:**
- [ ] Kolom "Diinput oleh" wajib ada di tabel detail opname
- [ ] Export PDF hasil opname tersedia
- [ ] Selisih negatif ditampilkan merah, selisih 0 hijau

---

### M08 — Job Costing (Per Item SPK)

*(Kalkulasi sekarang per item, kemudian diagregasi ke level SPK)*

```
TOTAL COST PER ITEM =
  Σ Material Cost (qty_aktual × avg_unit_cost per bahan)
+ Σ Labor Cost (jam_kerja × rate_per_jam operator assigned)
+ Overhead Allocation (configurable % dari harga jual item)

TOTAL COST PER SPK = Σ cost semua item + Variable Cost Pemasangan

GROSS PROFIT per SPK = Harga Jual SPK − Total Cost SPK
```

---

### M09 — POS & Kasir
*(Tidak ada perubahan signifikan — payment tetap di level SPK, bukan per item)*

---

### M10 — HR & Payroll *(DIPERLUAS v1.1)*

#### M10.1–M10.8 (Tidak ada perubahan dari v1.0)

#### M10.9 — Sistem Insentif per Item SPK *(BARU v1.1)*

**User Story:**
Sebagai owner, saya ingin memberikan insentif kepada karyawan berdasarkan output nyata yang mereka kerjakan, sehingga ada motivasi yang terhubung langsung ke pekerjaan selesai — bukan hanya gaji flat.

**Model insentif yang didukung:**

| Tipe | Cara Hitung | Contoh |
|---|---|---|
| Flat per item | Rp X setiap item selesai | Rp 5.000 per item apapun |
| Persentase harga item | Y% dari harga jual item | 1.5% dari total item |
| Flat per SPK | Rp X setiap SPK selesai | Rp 15.000 per SPK closed |

**Konfigurasi oleh Owner:**
- Toggle per role: role mana yang eligible dapat insentif
- Pilih tipe perhitungan (flat/persentase)
- Set nilai (nominal atau %)
- Berlaku mulai tanggal tertentu

**Flow insentif:**
1. Operator/designer menyelesaikan item (status → `ready`)
2. Sistem otomatis hitung insentif berdasarkan konfigurasi aktif
3. Mini-toast ke operator: "+Rp 8.500 insentif" (3 detik)
4. Record insentif masuk ke tracking bulan berjalan
5. Owner/hr_admin bisa lihat semua insentif di laporan
6. Owner/hr_admin approve sebelum pembayaran (tidak otomatis transfer)
7. Setelah di-approve: status berubah "Sudah Dibayar"

**Aturan privasi insentif:**
- Karyawan hanya bisa lihat insentif milik sendiri (via Portal Karyawan)
- Owner dan hr_admin bisa lihat semua
- Branch_manager bisa lihat insentif karyawan di cabang mereka

**Acceptance Criteria:**
- [ ] Konfigurasi insentif: bisa diatur per role, bukan per individu
- [ ] Perubahan konfigurasi tidak retroaktif (hanya berlaku untuk item selesai setelah tanggal berlaku)
- [ ] Mini-toast insentif muncul di layar role yang eligible saat item selesai
- [ ] Insentif tidak otomatis dibayarkan — harus ada approval owner/hr_admin
- [ ] Laporan insentif: per karyawan, per periode, status (belum dibayar / sudah dibayar)
- [ ] Karyawan A tidak bisa lihat insentif karyawan B

#### M10.10 — Portal Karyawan (Employee Self-Service) *(BARU v1.1)*

**User Story:**
Sebagai karyawan Printeoo (role apapun kecuali display), saya ingin bisa melihat informasi kerja saya sendiri — insentif, absensi, catatan dari atasan — tanpa harus tanya ke HR atau manager.

**Scope MVP Portal Karyawan:**

*Tab 1: Ringkasan Bulan Ini*
- Jumlah hari hadir / absen / izin (read-only dari data absensi)
- Total insentif terkumpul bulan ini (jika role eligible)
- Jumlah item/SPK yang diselesaikan (untuk role produksi)

*Tab 2: Insentif Saya*
- Daftar per item: nama SPK, nama item, tanggal selesai, nilai insentif
- Total bulan ini
- Status: Belum Dibayar / Sudah Dibayar
- Riwayat 3 bulan terakhir

*Tab 3: Informasi Saya*
- Nama, posisi, cabang, tipe kontrak (read-only)
- Tidak ada data sensitif (gaji, BPJS) — itu ada di payslip Phase berikutnya

*Tab 4: Notifikasi & Teguran*
- Teguran yang diterima: tanggal, jenis, catatan (read-only, tidak bisa dihapus)
- Pengumuman dari owner/branch_manager

**Akses:**
- Tersedia untuk semua role kecuali `display`
- Via ikon user di header → "Portal Karyawan"
- Atau via sidebar (jika ada slot)

**Acceptance Criteria:**
- [ ] Karyawan hanya bisa lihat data milik sendiri
- [ ] Teguran tidak bisa dihapus oleh karyawan
- [ ] Insentif yang tampil = hanya yang sudah di-approve, atau semua termasuk pending (dengan label status)
- [ ] Tidak ada fitur request cuti atau input absensi dari Portal Karyawan di Phase ini

---

### M14 — Notification Center *(DITAMBAH v1.1)*

#### M14.1–M14.5 (Tidak ada perubahan)

#### M14.6 — Notifikasi Kurir *(BARU v1.1)*

**Trigger:** Semua item dalam SPK mencapai status `ready` → status SPK level transaksi = `ready`

**Flow:**
1. Sistem deteksi SPK → semua item `ready`
2. Cek: apakah ada kurir yang di-assign ke SPK ini?
   - Jika ya: kirim WA notification ke kurir: "Ada order siap diantar: [nama customer], [alamat]. Buka aplikasi untuk konfirmasi."
   - Jika tidak: notifikasi ke kasir/branch_manager: "SPK-001 siap ambil — belum ada kurir yang di-assign"
3. Jika 30 menit berlalu dan belum ada kurir yang di-assign: escalation notif ke branch_manager

**Acceptance Criteria:**
- [ ] WA notifikasi ke kurir terkirim saat semua item SPK = ready
- [ ] Notifikasi ke kasir jika kurir belum di-assign setelah 30 menit
- [ ] Kurir bisa konfirmasi "Diambil" dari notifikasi (link ke halaman delivery)

---

### M-COURIER — Modul Pengiriman *(BARU v1.1)*

*Modul ini tidak ada di numbering sebelumnya. Dimasukkan sebagai M19.*

#### M19 — Manajemen Pengiriman (Delivery)

**User Story:**
Sebagai owner/manager, saya ingin bisa track semua pengiriman — siapa kurir yang mengantar, kapan diambil, kapan terkirim — sehingga ada accountability end-to-end dari SPK selesai hingga barang di tangan customer.

#### M19.1 — Antarmuka Kurir (Micro Interface)

**Desain prinsip:** Interface kurir harus sesederhana aplikasi kurir (GoSend/Lalamove) — bukan ERP. Tidak ada sidebar navigasi penuh. Landing page = daftar pengiriman hari ini.

**Homepage kurir setelah login:**
```
┌─────────────────────────────────┐
│  Halo, [Nama Kurir]             │
│  Hari ini: 3 pengiriman         │
├─────────────────────────────────┤
│  [BELUM DIAMBIL]                │
│  SPK-001 · PT Maju Jaya         │
│  Jl. Basuki Rahmat No.12        │
│  [Konfirmasi Diambil]           │
├─────────────────────────────────┤
│  [SEDANG DIANTAR]               │
│  SPK-003 · Kopi Tepi Kali       │
│  Jl. Pemuda No.45               │
│  [Konfirmasi Terkirim]          │
├─────────────────────────────────┤
│  [SELESAI HARI INI] ✓           │
│  SPK-002 · Terkirim 10:30       │
└─────────────────────────────────┘
```

**Status delivery per SPK:**
```
assigned → diambil → sedang_diantar → terkirim
```

**Acceptance Criteria:**
- [ ] Kurir hanya bisa lihat SPK yang di-assign ke mereka
- [ ] Kurir tidak bisa lihat harga, total pembayaran, atau detail finansial SPK
- [ ] Kurir bisa upload foto bukti pengiriman (opsional, max 5MB)
- [ ] Timestamp otomatis saat kurir tap "Konfirmasi Diambil" dan "Konfirmasi Terkirim"
- [ ] Jika ada masalah: kurir bisa tambahkan catatan teks (contoh: "Tidak ada di tempat, dititip ke satpam")
- [ ] Update status kurir otomatis mengubah status SPK: jika terkirim → SPK status = `delivered`

#### M19.2 — Assign Kurir ke SPK

**Dilakukan oleh:** cashier, branch_manager, owner

**Flow:**
1. Di detail SPK, saat status = `ready`, muncul section "Pengiriman"
2. Pilih tipe: Customer Ambil Sendiri / Diantar Kurir
3. Jika Diantar: pilih kurir dari dropdown (hanya kurir aktif di cabang ini)
4. Input alamat pengiriman (auto-fill dari data customer, bisa diedit)
5. Simpan → kurir mendapat notifikasi WA

**Acceptance Criteria:**
- [ ] Dropdown kurir hanya menampilkan user dengan role `courier` yang aktif di cabang tersebut
- [ ] Alamat pengiriman auto-fill dari profil customer, bisa di-override
- [ ] History pengiriman per kurir: berapa SPK hari ini, rata-rata waktu, completion rate

---

### M15 — Product & Pricing Catalog *(DITAMBAH v1.1)*

#### M15.1–M15.5 (Tidak ada perubahan)

#### M15.6 — Bill of Materials per Produk *(EKSPLISIT v1.1)*

**Sebelumnya masuk sebagai M15.3, sekarang dipisahkan menjadi M15.6 karena pentingnya untuk traceability.**

**Fields per BOM entry:**
- Produk (relasi ke M15.1)
- Bahan (relasi ke M07.1)
- Formula qty:
  - Flat: X unit per item ordered
  - Per area: X unit per m² (untuk banner, spanduk)
  - Per qty ordered: X unit per 1000 pcs
- Waste factor (%): overhead material yang ditambahkan ke estimasi (contoh: 8%)
- Satuan output

**Acceptance Criteria:**
- [ ] BOM bisa dikonfigurasi untuk satu produk menggunakan beberapa bahan
- [ ] Formula per area mendukung input width × height dari form order
- [ ] Estimasi auto-generate saat item SPK dibuat
- [ ] Jika produk tidak punya BOM: warning di form order dan di kanban card

---

## 7. PROTOTYPE REQUIREMENTS (untuk Demo Yanuar)

*(Sudah selesai — prototype v1 complete. Section ini dipertahankan sebagai referensi historis.)*

---

## 8. NON-FUNCTIONAL REQUIREMENTS

*(Tidak ada perubahan dari v1.0)*

---

## 9. DEVELOPMENT PRIORITIES (Sprint Order) *(DIUPDATE v1.1)*

### Sprint 1–2: Foundation
- M01 Auth (login, register, session) — tanpa shortcut demo di login production
- M02 User & role management — **termasuk role `courier` dan permission matrix lengkap**
- Database schema setup dengan RLS — **termasuk tabel order_items untuk multi-item**
- Basic navigation shell

### Sprint 3–4: Core Operations
- M04 Order / SPK **multi-item** (input, list, detail, status per item)
- M15 Product catalog + **BOM per produk** (M15.6)
- M09 POS kasir (basic payment di level SPK)

### Sprint 5–6: Production
- M05 Production board **per item** (kanban)
- M06 Production display (TV mode + audio) — item-based card
- M03 Queue system

### Sprint 7–8: Intelligence & Traceability
- M07 Inventory (incoming, QR label)
- **M07.3 Traceability Layer 1** — estimasi BOM auto-generate
- **M07.3 Traceability Layer 2** — scan QR saat ambil dari gudang, record aktual
- **M07.3 Traceability Layer 3** — rekonsiliasi deviasi, alert anomali
- M08 Job costing per item
- M13 Owner dashboard
- **M19 Modul Pengiriman** (assign kurir, micro interface kurir, foto bukti)

### Sprint 9–10: People & Money
- M10.1–M10.8 HR & payroll
- **M10.9 Sistem Insentif per item**
- **M10.10 Portal Karyawan (Employee Self-Service)**
- M11 Akuntansi dasar
- M17 CRM customer

### Sprint 11–12: Integration & Scale
- M12 Web-to-print API
- M11 Pajak
- M01 Multi-branch (Business tier)
- Billing & subscription management

---

## 10. OPEN QUESTIONS & DECISIONS NEEDED

### ✅ RESOLVED (v1.1)
1. ~~**SPK multi-item atau single?**~~ → **RESOLVED: Multi-item. Item adalah unit produksi, SPK adalah unit transaksi.**
2. ~~**Traceability material — level implementasi?**~~ → **RESOLVED: Layer 1 (estimasi BOM) + Layer 2 (scan QR di gudang). Layer 3 (rekonsiliasi) adalah output otomatis.**
3. ~~**Role kurir — terpisah atau tidak?**~~ → **RESOLVED: Role `courier` terpisah dengan micro-interface. Bisa karyawan tetap maupun freelance.**

### ❓ MASIH OPEN

1. **Pricing final** — working estimate di dokumen ini, tapi belum divalidasi ke market. Harus dikunci sebelum launch.
2. **WA API provider** — Fonnte vs WA Business Cloud API?
3. **Hosting provider** — Railway vs Render vs VPS langsung?
4. **Domain final** — `printeoo.com` dan `printeoo.id` sudah secured?
5. **Offline strategy** — seberapa robust? Full offline atau hanya tolerant?
6. **Printsoft migration tool** — perlu dibangun? Format data Printsoft belum diketahui.
7. **Prefix antrian (A/B/C) — definisi bisnis?** Yanuar perlu menetapkan: A = apa, B = apa. Ini mempengaruhi konfigurasi display antrian.
8. **Assign kurir ke SPK — otomatis atau manual?** Apakah sistem bisa auto-assign kurir berdasarkan aturan tertentu (misalnya round-robin), atau selalu manual oleh kasir/manager?
9. **Insentif kurir — per SPK atau per km/pengiriman?** Model flat atau ada komponen jarak?
10. **"Review Pelanggan" di kanban** — apakah Yanuar punya flow formal approval desain dari customer di dalam sistem? Atau approval selalu via WA di luar sistem? Jika tidak ada, stage ini bisa dihapus dari lifecycle item.

---

*Dokumen ini adalah living document. Setiap perubahan requirement harus dicatat di sini sebelum diimplementasikan.*
