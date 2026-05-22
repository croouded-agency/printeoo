# Printeoo — Product Requirements Document (PRD)
**Version:** 1.0  
**Status:** Ready for Development  
**Last Updated:** 2026-05-23  
**Prepared for:** Development Team / Claude Code / Codex  

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

### 1.3 Target User

**Primary:** Pemilik dan operator print shop skala menengah di Indonesia (5–50 karyawan, 1–5 cabang), terutama yang:
- Sudah menggunakan software lain dan frustrasi
- Ingin go digital tapi tidak mampu investasi besar di awal

**Secondary:** Print shop yang belum menggunakan software apapun, masih manual

**Tertiary:** Grup percetakan besar dengan kebutuhan multi-cabang dan enterprise

### 1.4 Core Value Proposition
- **Harga masuk rendah** — subscription bulanan, mulai Rp 400rb, bukan Rp 100 juta one-time
- **Data 100% milik pelanggan** — Printeoo tidak pernah menggunakan data operasional tenant
- **Traceability end-to-end** — setiap SPK bisa di-trace: siapa input, material apa, berapa habis, siapa kerjakan, berapa cost
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
| SPK Digital & Kasir | ✓ | ✓ | ✓ | ✓ | ✓ |
| Production Board | — | ✓ | ✓ | ✓ | ✓ |
| Inventory Dasar | — | ✓ | ✓ | ✓ | ✓ |
| HR Dasar | — | ✓ | ✓ | ✓ | ✓ |
| Antrian & Display | — | — | ✓ | ✓ | ✓ |
| Job Costing | — | — | ✓ | ✓ | ✓ |
| Payroll Lengkap | — | — | ✓ | ✓ | ✓ |
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
Pemilik bisnis. Akses penuh ke semua modul semua cabang. Satu-satunya role yang bisa manage subscription, billing, dan user management.

**`branch_manager`**
Manajer cabang. Akses penuh ke cabang yang ditugaskan. Tidak bisa akses cabang lain atau settings billing.

**`cashier`**
Kasir / customer service / deskprint. Input order, proses pembayaran, lihat daftar order. Tidak bisa akses laporan keuangan atau HR.

**`designer`**
Desainer grafis. Lihat dan update SPK di queue desain. Upload file, tandai design ready, minta approval customer.

**`operator`**
Operator produksi. Lihat board produksi, update status SPK di tahap cetak dan finishing. Input material usage dan waste.

**`warehouse`**
Staff gudang. Full access inventory: incoming, stock opname, adjustment. Read-only untuk order (untuk lihat material yang dibutuhkan).

**`hr_admin`**
Admin HR/payroll. Full access HR, absensi, payroll. Tidak bisa akses order atau inventory.

**`accountant`**
Akuntan. Full access laporan keuangan, jurnal, pajak. Read-only untuk order, inventory, payroll.

**`display`**
Role khusus untuk device production display atau layar antrian. Read-only, tidak bisa input apapun. Login sekali, session tidak expired.

### 3.2 Permission Matrix (Lengkap)

| Action | owner | branch_mgr | cashier | designer | operator | warehouse | hr_admin | accountant | display |
|---|---|---|---|---|---|---|---|---|---|
| Manage tenant settings | ✓ | — | — | — | — | — | — | — | — |
| Manage users & roles | ✓ | R | — | — | — | — | — | — | — |
| Manage subscription | ✓ | — | — | — | — | — | — | — | — |
| Create/edit order (SPK) | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| View all orders | ✓ | ✓ | ✓ | R | R | R | — | R | — |
| Update SPK status | ✓ | ✓ | ✓ | ✓(design) | ✓(prod) | — | — | — | — |
| Process payment | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| View production board | ✓ | ✓ | R | ✓ | ✓ | — | — | — | R |
| Input material usage | ✓ | ✓ | — | — | ✓ | ✓ | — | — | — |
| Manage inventory | ✓ | ✓ | — | — | — | ✓ | — | — | — |
| View inventory | ✓ | ✓ | — | — | R | ✓ | — | R | — |
| Manage employees | ✓ | R | — | — | — | — | ✓ | — | — |
| Process payroll | ✓ | — | — | — | — | — | ✓ | — | — |
| View payroll | ✓ | R | — | — | — | — | ✓ | R | — |
| View financial reports | ✓ | R(branch) | — | — | — | — | — | ✓ | — |
| Manage accounting | ✓ | — | — | — | — | — | — | ✓ | — |
| View owner dashboard | ✓ | R(branch) | — | — | — | — | — | — | — |
| Manage product catalog | ✓ | ✓ | — | — | — | — | — | — | — |
| View product catalog | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — |
| Manage machines | ✓ | ✓ | — | — | — | — | — | R | — |
| Access display mode | ✓ | ✓ | — | — | — | — | — | — | ✓ |
| Export data | ✓ | ✓(branch) | — | — | — | — | R | ✓ | — |
| View audit log | ✓ | — | — | — | — | — | — | — | — |

---

## 4. TECHNICAL REQUIREMENTS

### 4.1 Platform
- **Web application** — responsive, priority desktop untuk owner/manager, priority tablet/mobile untuk operator dan kasir
- **Progressive Web App (PWA)** — agar bisa di-install di tablet operator sebagai app
- **Offline-tolerant** — operator production board harus bisa update status meski koneksi terganggu (sync saat koneksi kembali)

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
- **Mobile-first for operators** — kasir dan operator rata-rata pakai tablet atau HP, bukan laptop
- **High density untuk owner** — dashboard owner boleh dense karena dibaca di layar besar
- **Bahasa Indonesia** — semua UI default bahasa Indonesia. Bahasa Inggris tersedia sebagai opsi settings

### 5.2 Navigation Structure
```
Sidebar (desktop) / Bottom nav (mobile):
├── Dashboard (owner/manager)
├── Antrian
├── Pesanan (Order / SPK)
├── Produksi
├── Inventaris
├── Pelanggan
├── Karyawan & Payroll
├── Keuangan
├── Laporan
└── Pengaturan
```

### 5.3 Color System (Status)
- **Biru** — status normal / in progress
- **Hijau** — selesai / lunas / stok aman
- **Oranye** — urgent / perlu perhatian / stok menipis
- **Merah** — overdue / error / stok habis
- **Abu** — draft / tidak aktif

### 5.4 Notification Patterns
- **Toast** — aksi berhasil atau gagal (muncul 3 detik, pojok kanan atas)
- **Bell icon** — notifikasi yang butuh tindak lanjut (badge count)
- **Modal** — konfirmasi aksi destruktif (hapus, void, dll)
- **Inline error** — validasi form (di bawah field yang error)

### 5.5 Loading & Empty States
- Semua data fetching harus ada skeleton loader (bukan spinner saja)
- Empty state harus ada ilustrasi + teks + CTA (contoh: "Belum ada pesanan hari ini. Tambah pesanan baru →")

---

## 6. MODULE SPECIFICATIONS

---

### M01 — Authentication & Tenant Management

#### M01.1 Tenant Registration & Onboarding

**User Story:**
Sebagai pemilik print shop baru, saya ingin mendaftarkan bisnis saya dan langsung bisa mulai menggunakan Printeoo tanpa konfigurasi yang rumit.

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
- [ ] Login berhasil → redirect ke halaman terakhir yang dikunjungi (atau dashboard)
- [ ] "Ingat saya" → refresh token persist 30 hari
- [ ] Tanpa "Ingat saya" → session expire saat browser ditutup
- [ ] Lupa password: kirim link reset ke email, valid 1 jam
- [ ] Reset password link hanya bisa digunakan sekali

#### M01.3 Multi-User dalam Satu Tenant

**Flow:**
- Owner bisa invite user baru via email
- User yang diundang dapat email dengan link aktivasi (valid 48 jam)
- Owner assign role saat mengundang
- Owner bisa deactivate user kapanpun (session langsung invalidated)

**Acceptance Criteria:**
- [ ] Owner bisa invite maksimal sesuai limit tier (Solo: 2 user, Studio: 10, Pro: 25, Business+: unlimited)
- [ ] User yang di-deactivate tidak bisa login
- [ ] Owner tidak bisa menghapus dirinya sendiri (minimal harus ada 1 owner aktif)

---

### M03 — Queue & Antrian

#### M03.1 Sistem Antrian Customer

**User Story:**
Sebagai kasir, saya ingin mengelola antrian customer yang datang sehingga mereka dilayani secara teratur dan tidak ada yang komplain.

**Flow:**
1. Customer datang → kasir klik "Ambil Nomor" atau customer scan QR di meja masuk
2. Sistem generate nomor antrian (format: A-001, A-002, dst — reset setiap hari)
3. Nomor muncul di layar antrian (M03.2)
4. Kasir siap layani → klik "Panggil Berikutnya"
5. Sistem panggil nomor berikutnya: update layar + audio announcement
6. Kasir bisa skip (nomor tidak hadir) atau recall (panggil ulang)

**Acceptance Criteria:**
- [ ] Nomor antrian auto-reset setiap hari mulai pukul 00:00
- [ ] Support multi-counter (counter 1, counter 2, dst)
- [ ] Kasir bisa lihat: nomor sedang dilayani, antrian menunggu, estimasi waktu tunggu
- [ ] Jika koneksi terputus, antrian tetap berjalan (local state)
- [ ] History antrian tersimpan per hari (untuk analitik)

#### M03.2 Display Antrian (Layar TV/Monitor)

**User Story:**
Sebagai pemilik print shop, saya ingin ada layar di ruang tunggu yang menampilkan nomor antrian sehingga customer tahu kapan giliran mereka.

**Tampilan:**
```
┌────────────────────────────────────────────┐
│          TITANIUMPRINT.ID                  │
│                                            │
│   SEDANG DILAYANI                          │
│   ┌──────────┐  ┌──────────┐              │
│   │  A-015   │  │  A-016   │              │
│   │ Counter 1│  │ Counter 2│              │
│   └──────────┘  └──────────┘              │
│                                            │
│   MENUNGGU: A-017, A-018, A-019, A-020    │
│                                            │
│   [Running text: Jam buka 08:00–21:00]    │
└────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Full-screen mode, tidak ada UI elemen Printeoo (bersih)
- [ ] Font besar, readable dari 5 meter
- [ ] Auto-update via WebSocket tanpa refresh manual
- [ ] Audio: text-to-speech bahasa Indonesia saat nomor dipanggil ("Nomor A-015, silakan ke Counter 1")
- [ ] Volume audio configurable dari settings
- [ ] Running text configurable (bisa isi jam buka, promo, dll)
- [ ] Logo dan nama bisnis customizable (pakai data dari M18 profil perusahaan)
- [ ] Jika koneksi terputus: tampilkan indikator "Mengulas koneksi..." tapi nomor terakhir tetap tampil
- [ ] Dark mode dan light mode tersedia
- [ ] Akses via URL khusus: `app.printeoo.com/display/queue/{branch_id}` — login dengan role `display`

#### M03.3 Audio Announcement

**Technical Requirement:**
- Gunakan Web Speech API (browser-native, tidak butuh API eksternal)
- Fallback: file audio pre-recorded jika Web Speech API tidak tersupport
- Teks yang di-TTS: "Nomor [NOMOR], silakan ke [COUNTER]"
- Bahasa: Indonesia (lang="id-ID")
- Rate: 0.9 (sedikit lebih lambat dari normal untuk kejelasan)

**Acceptance Criteria:**
- [ ] Audio berfungsi di Chrome (priority), Safari, Firefox
- [ ] Tidak perlu interaksi user untuk audio setelah pertama kali display dibuka (workaround autoplay policy: minta user klik 1x saat pertama buka)
- [ ] Bisa mute/unmute dari layar display
- [ ] Volume bisa diatur dari settings halaman display

---

### M04 — Order Management (SPK Digital)

#### M04.1 Input Order Baru

**User Story:**
Sebagai kasir, saya ingin input pesanan customer dengan cepat dan akurat, sehingga operator tahu persis apa yang harus dikerjakan tanpa harus tanya-tanya lagi.

**Form Fields:**

*Section: Data Customer*
- Nama customer* (autocomplete dari existing customer, atau input baru)
- Nomor HP* (auto-format: 08XX-XXXX-XXXX)
- Email (opsional)
- Tipe: Walk-in / Online / Telepon

*Section: Detail Pesanan*
- Produk* (dropdown dari product catalog M15)
- Spesifikasi dinamis (berubah sesuai produk yang dipilih):
  - Ukuran (width × height, atau pilihan preset)
  - Bahan / media
  - Finishing (multi-select: laminasi, mata ayam, cutting, lipat, dll)
  - Qty*
- Harga satuan (auto-fill dari catalog, bisa di-override manual)
- Total harga (auto-kalkulasi)
- Diskon (nominal atau %)
- Total setelah diskon

*Section: Produksi*
- Deadline* (date + time picker)
- Prioritas: Normal / Urgent / VIP
- Butuh desain: Ya / Tidak
- Catatan untuk operator (free text)
- Upload file (drag & drop atau browse, multiple files)

*Section: Pembayaran Awal*
- DP / uang muka (nominal, bisa 0)
- Metode DP: Cash / Transfer / QRIS
- Sisa yang harus dibayar (auto-kalkulasi)

**Auto-Generated saat Save:**
- Nomor SPK: `SPK-[KODE_CABANG]-[YYYYMMDD]-[4_DIGIT_SEQ]`
  - Contoh: `SPK-SBY-20260523-0042`
- Nomor Nota: `INV-[KODE_CABANG]-[YYYYMMDD]-[4_DIGIT_SEQ]`
- Timestamp created + user yang input
- Status awal: `confirmed` (jika tidak butuh desain) atau `design_queue` (jika butuh desain)

**Acceptance Criteria:**
- [ ] Form bisa disubmit dalam < 2 menit untuk order standar
- [ ] Autocomplete customer: muncul suggestion setelah 2 karakter, max 5 hasil
- [ ] Jika customer baru: otomatis create customer baru saat SPK disimpan
- [ ] Harga auto-fill dari catalog tapi kasir bisa override (dengan catatan alasan)
- [ ] File upload support: PDF, AI, CDR, PSD, PNG, JPG, JPEG — max 100MB per file, max 10 file per SPK
- [ ] Progress bar saat upload file
- [ ] Jika upload gagal: pesan error spesifik (file terlalu besar / format tidak didukung / koneksi bermasalah)
- [ ] SPK tidak bisa disimpan tanpa: nama customer, produk, qty, deadline
- [ ] Setelah save: tampilkan preview SPK + tombol "Cetak SPK", "Kirim WA", "Buat SPK Lain"
- [ ] SPK yang sudah confirmed otomatis muncul di production board (M05)
- [ ] Jika ada WA API configured (M12.6): kirim notifikasi otomatis ke customer

#### M04.2 SPK Detail View

**Tampilan:**
- Header: nomor SPK, status badge, tanggal, kasir yang input
- Timeline status (progress bar horizontal dengan semua stage)
- Detail pesanan lengkap
- File yang diupload (bisa preview inline untuk image/PDF)
- Riwayat perubahan status (siapa, kapan, dari status apa ke apa)
- Catatan internal (bisa tambah catatan baru)
- Job cost summary (jika M08 aktif di tier)
- Tombol aksi sesuai status dan role

**Acceptance Criteria:**
- [ ] Timeline menampilkan semua transisi status dengan timestamp dan user
- [ ] File preview inline untuk: JPG, PNG, PDF
- [ ] Catatan internal tidak terlihat oleh customer (hanya internal user)
- [ ] Tombol aksi: Edit (jika draft/confirmed), Duplicate, Batalkan (dengan konfirmasi + alasan), Cetak, Kirim WA

#### M04.3 Daftar Order

**Fitur:**
- Tabel dengan kolom: No. SPK, Customer, Produk, Qty, Total, Deadline, Status, Kasir, Aksi
- Filter: Status, Tanggal (range), Cabang, Kasir, Prioritas
- Search: by nomor SPK, nama customer, nomor HP
- Sort: by deadline (default), by tanggal dibuat, by total
- Pagination: 25 per halaman default
- Export: CSV atau Excel (sesuai filter aktif)

**Acceptance Criteria:**
- [ ] Load pertama < 2 detik untuk 100 order
- [ ] Filter kombinasi bisa diterapkan bersamaan
- [ ] Status badge berwarna sesuai color system (Section 5.3)
- [ ] Row overdue (deadline sudah lewat, belum selesai): highlight merah
- [ ] Klik row → buka SPK detail view
- [ ] Bulk action: untuk owner/manager, bisa select multiple SPK lalu bulk update status atau export

#### M04.4 SPK Lifecycle & Status Transitions

```
Status              Siapa yang bisa trigger           Kondisi
──────────────────────────────────────────────────────────────
draft            → confirmed      cashier, manager    Manual setelah review
confirmed        → design_queue   cashier, manager    Jika butuh desain
confirmed        → prod_queue     cashier, manager    Jika tidak butuh desain
design_queue     → in_design      designer            Saat mulai dikerjakan
in_design        → design_review  designer            Saat desain selesai, kirim ke customer
design_review    → prod_queue     cashier, manager    Saat customer approve
design_review    → in_design      cashier, manager    Jika customer minta revisi
prod_queue       → printing       operator            Saat mulai cetak
printing         → finishing      operator            Selesai cetak, masuk finishing
finishing        → ready          operator            Selesai semua
ready            → installation   cashier, manager    Jika ada komponen pemasangan
ready            → delivered      cashier, manager    Customer ambil sendiri
installation     → delivered      cashier, manager    Setelah pemasangan selesai
delivered        → closed         cashier, manager    Setelah lunas penuh
```

**Acceptance Criteria:**
- [ ] Sistem hanya tampilkan tombol transisi yang valid untuk status dan role saat ini
- [ ] Setiap transisi wajib tercatat di history dengan user + timestamp
- [ ] Transisi ke `closed` hanya bisa jika outstanding payment = 0
- [ ] SPK yang di-cancel: tidak bisa di-reopen, tapi bisa di-duplicate sebagai SPK baru

---

### M05 — Production Board

#### M05.1 Kanban Board

**User Story:**
Sebagai operator produksi, saya ingin lihat semua pekerjaan yang harus saya kerjakan hari ini dalam satu tampilan yang jelas, sehingga saya tahu mana yang harus dikerjakan duluan.

**Layout:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Antrian      │ Desain       │ Review       │ Sedang Cetak │ Finishing    │ Siap Ambil   │
│ Desain  (3)  │ (2)          │ Pelanggan(1) │ (4)          │ (2)          │ (5)          │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │ ┌──────────┐ │
│ │SPK-0042  │ │ │SPK-0039  │ │ │SPK-0037  │ │ │SPK-0041  │ │ │SPK-0036  │ │ │SPK-0033  │ │
│ │Banner    │ │ │Kartu Nama│ │ │Spanduk   │ │ │Brosur    │ │ │Banner    │ │ │Stiker    │ │
│ │Budi S.   │ │ │PT ABC    │ │ │Toko XYZ  │ │ │CV Maju   │ │ │Ahmad     │ │ │Rina      │ │
│ │⏰ 14:00  │ │ │⏰ 16:00  │ │ │⏰ URGENT │ │ │⏰ 15:30  │ │ │⏰ Selesai│ │ │⏰ Kemarin│ │
│ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │ └──────────┘ │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

**Card Content:**
- Nomor SPK
- Nama produk + spesifikasi singkat
- Nama customer
- Deadline (relative: "2 jam lagi", "Besok", "Kemarin" untuk overdue)
- Badge prioritas (Urgent = oranye, VIP = ungu)
- Assigned operator/desainer (avatar/inisial)
- Indikator file tersedia (icon paperclip)

**Acceptance Criteria:**
- [ ] Board update real-time via WebSocket (< 500ms)
- [ ] Drag & drop card antar kolom (update status otomatis)
- [ ] Tap card → buka SPK detail dalam modal (bukan navigate ke halaman baru)
- [ ] Filter board: by operator assigned, by produk, by prioritas
- [ ] Card overdue (deadline lewat): border merah, sort ke atas secara default
- [ ] Counter per kolom (angka dalam kurung di header kolom)
- [ ] Kolom collapse/expand (untuk layar sempit)
- [ ] Role-based kolom visibility:
  - Designer: lihat kolom "Antrian Desain", "Sedang Desain", "Review Pelanggan"
  - Operator: lihat kolom "Antrian Cetak", "Sedang Cetak", "Finishing", "Siap Ambil"
  - Owner/Manager: lihat semua kolom
- [ ] Assign operator: klik card → pilih operator dari dropdown

---

### M06 — Production Display Mode

#### M06.1 Full-Screen Display untuk Tablet/TV

**User Story:**
Sebagai pemilik print shop, saya ingin ada layar di area produksi yang menampilkan antrian pekerjaan, sehingga operator bisa langsung tahu apa yang harus dikerjakan tanpa harus tanya ke kasir atau buka laptop.

**Layout (Landscape, 1280×720 minimum):**
```
┌────────────────────────────────────────────────────────────────────┐
│  TITANIUMPRINT — PRODUKSI                    Jumat, 23 Mei 2026   │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ANTRIAN CETAK                              SEDANG DIKERJAKAN      │
│  ┌─────────────────────────────┐           ┌──────────────────┐   │
│  │ SPK-0042 | Banner 3×1m      │           │ SPK-0041         │   │
│  │ Budi Santoso | URGENT 14:00 │           │ Brosur A4 / 500  │   │
│  ├─────────────────────────────┤           │ CV Maju Jaya     │   │
│  │ SPK-0043 | Spanduk 5×1m     │           │ ⏱ 00:32:14       │   │
│  │ PT Makmur | 16:00           │           └──────────────────┘   │
│  ├─────────────────────────────┤                                   │
│  │ SPK-0044 | Kartu Nama       │           FINISHING               │
│  │ Rina | Besok                │           ┌──────────────────┐   │
│  └─────────────────────────────┘           │ SPK-0036         │   │
│                                            │ Banner 2×1m      │   │
│                                            │ Ahmad            │   │
│                                            └──────────────────┘   │
│                                                                    │
│  [🔔 Pesanan baru masuk: SPK-0042 — Banner Urgent]                │
└────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Akses via URL: `app.printeoo.com/display/production/{branch_id}`
- [ ] Login dengan role `display` — session tidak expire
- [ ] PIN protection: untuk exit display mode, harus input PIN (cegah operator tidak sengaja keluar)
- [ ] Auto-refresh via WebSocket, tidak perlu interaksi
- [ ] Saat SPK baru masuk ke antrian cetak:
  - Banner notifikasi muncul di bawah layar (slide up, 5 detik)
  - Audio: "Pesanan baru: [nama produk], deadline [jam]"
- [ ] Timer aktif untuk SPK yang sedang dikerjakan (stopwatch dari saat status berubah ke "printing")
- [ ] Font minimum 24px untuk konten utama, readable dari 3 meter
- [ ] Dark mode default (lebih nyaman di area produksi)
- [ ] Jika tidak ada pekerjaan: tampilkan pesan "Semua pekerjaan selesai 🎉" dengan animasi

#### M06.2 Audio System

**Technical Implementation:**
```javascript
// Gunakan Web Speech API
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'id-ID'
  utterance.rate = 0.9
  utterance.volume = userSettings.volume // 0.0 - 1.0
  window.speechSynthesis.speak(utterance)
}

// Trigger saat SPK baru masuk ke queue
onNewSPK(spk => {
  speak(`Pesanan baru masuk: ${spk.product_name}, deadline ${formatTime(spk.deadline)}`)
})
```

**Acceptance Criteria:**
- [ ] Workaround autoplay policy: tampilkan overlay "Ketuk layar untuk mengaktifkan audio" saat pertama kali display dibuka
- [ ] Setelah user tap sekali, audio berfungsi tanpa interaksi lagi
- [ ] Mute/unmute toggle di pojok layar (ikon kecil, tidak mengganggu tampilan)
- [ ] Antrian audio: jika 3 SPK masuk bersamaan, diucapkan satu per satu bukan bersamaan
- [ ] Fallback: jika Web Speech API tidak tersedia, tampilkan visual notification saja (tidak error)

---

### M07 — Inventory & Gudang

#### M07.1 Master Bahan Baku

**Fields:**
- Nama bahan*
- Kode bahan (auto-generate atau manual)
- Kategori (Media cetak / Tinta / Finishing / Packaging / Lainnya)
- Satuan* (meter, lembar, roll, liter, kg, pcs, rim)
- Satuan konversi (opsional: 1 roll = 224 meter)
- Harga beli rata-rata (auto-update saat ada incoming)
- Stok minimum (trigger alert jika di bawah ini)
- Supplier default
- Catatan

**Acceptance Criteria:**
- [ ] Satuan konversi: jika diisi, sistem bisa track dalam dua satuan (stok ditampilkan dalam keduanya)
- [ ] Harga beli rata-rata: dihitung otomatis weighted average dari semua incoming
- [ ] Bahan tidak bisa dihapus jika masih ada stok atau terhubung ke SPK aktif (deactivate saja)

#### M07.2 Incoming Material (Penerimaan Barang)

**Flow:**
1. Buat Purchase Order (PO) ke supplier
2. Saat barang datang: buat dokumen penerimaan, link ke PO
3. Input: qty diterima, nomor batch, tanggal expired (untuk tinta), harga beli aktual
4. Stok otomatis bertambah

**Acceptance Criteria:**
- [ ] PO bisa dibuat tanpa harus ada supplier terdaftar (input manual nama supplier)
- [ ] Partial receiving: bisa terima sebagian dari PO (sisa masih "in transit")
- [ ] Harga beli aktual bisa berbeda dari PO (sistem catat keduanya)
- [ ] Setelah penerimaan: jurnal akuntansi otomatis dibuat (jika M11 aktif)

#### M07.2b — QR Label Fisik untuk Bahan Masuk

**User Story:**
Sebagai staff gudang, saya ingin setiap bahan yang masuk langsung diberi label QR,
sehingga operator produksi tidak bisa salah ambil bahan dan semua penggunaan
tercatat akurat dengan traceability sampai ke batch asal.

**Flow:**
1. Staff gudang selesai input penerimaan barang (M07.2)
2. Sistem generate QR code unik per batch/unit/roll
3. Staff klik "Cetak Label QR" → cetak ke label printer atau PDF
4. Label ditempel ke fisik bahan di gudang
5. Saat operator ambil bahan untuk produksi:
   - Buka SPK di tablet/HP → tab "Material" → klik "Scan Bahan"
   - Scan QR → sistem auto-fill nama bahan, batch, satuan
   - Operator input qty yang dipakai → simpan
6. Stok berkurang, usage tercatat dengan traceability penuh ke batch asal

**QR Content (data yang di-encode sebagai URL):**
`app.printeoo.com/scan?b={batch_id}&t={tenant_id}`

Sehingga jika di-scan dari kamera HP biasa (di luar app), user diarahkan ke
halaman batch info setelah login.

**Desain Label (50×30mm, thermal label printer):**
- Nama bahan
- Nomor batch
- Tanggal masuk
- Qty awal + satuan
- Nama supplier
- QR code

**Format cetak yang didukung:**
- Thermal label printer 50×30mm (direct print)
- PDF A4 layout 24 label per halaman (untuk print di printer biasa, lalu gunting)

**Route /scan — behaviour:**
- Jika belum login: redirect ke login, setelah login redirect kembali ke /scan?b=...&t=...
- Jika tenant_id tidak cocok dengan tenant user: error "Bahan ini bukan milik bisnis Anda"
- Jika valid: tampilkan halaman "Batch Info" (mobile-optimized, tanpa sidebar):
  - Nama bahan, kategori, satuan, stok tersisa batch ini, tanggal masuk, supplier
  - Tombol "Catat Pemakaian" → redirect ke form usage dengan batch pre-filled
  - Tombol "Cek Stok Saja" → hanya lihat, catat di scan_log sebagai stock_check

**Acceptance Criteria:**
- [ ] Setiap penerimaan barang → tombol "Cetak Label QR" tersedia
- [ ] Label bisa dicetak ke thermal 50×30mm atau PDF A4 (24 per halaman)
- [ ] QR bisa di-scan dari kamera tablet/HP via browser tanpa install app (gunakan library html5-qrcode atau zxing-js)
- [ ] Scan QR di form usage → auto-fill bahan + info batch
- [ ] Jika stok batch = 0 saat di-scan: warning "Stok batch ini sudah habis" (tidak block, operator bisa lanjut dengan konfirmasi)
- [ ] Jika QR di-scan dari tenant berbeda: error "Bahan ini bukan milik bisnis Anda"
- [ ] Label bisa dicetak ulang jika rusak/hilang tanpa generate batch ID baru
- [ ] Scan log per batch: siapa scan, kapan, untuk SPK apa, tipe aksi (usage_input / stock_check)
- [ ] Scan log hanya bisa dilihat oleh role warehouse dan owner
- [ ] Batch ID menggunakan UUID (tidak sequential) untuk keamanan
- [ ] Halaman /scan mobile-optimized, tanpa sidebar navigasi lengkap

#### M07.3 Material Usage per SPK

**Flow:**
1. Operator buka SPK yang sedang dikerjakan
2. Tab "Material" → klik "Catat Pemakaian" atau "Scan QR Bahan"
3. Input: bahan, qty dipakai, qty waste (gagal cetak/trim)
4. Sistem update stok otomatis

**Acceptance Criteria:**
- [ ] Suggestion bahan otomatis berdasarkan produk di SPK (dari Bill of Materials M15.3)
- [ ] Tersedia dua cara input bahan: (a) dropdown manual dari catalog, (b) scan QR label fisik bahan
- [ ] Scan QR → auto-fill nama bahan dan batch, operator hanya perlu input qty yang dipakai
- [ ] Kedua cara input tetap berfungsi bersamaan — scan adalah shortcut, bukan pengganti
- [ ] Qty yang diinput tidak boleh melebihi stok available
- [ ] Waste wajib dikategorikan: Gagal cetak / Trim / Kerusakan bahan / Lainnya
- [ ] Operator bisa edit usage selama SPK belum closed
- [ ] Setelah SPK closed: usage terkunci, tidak bisa diedit

#### M07.4 Stock Opname

**Flow:**
1. Buat sesi opname baru (tentukan scope: semua bahan atau per kategori)
2. Sistem generate daftar bahan + stok sistem saat ini
3. Staff input stok fisik per bahan
4. Sistem kalkulasi selisih (sistem vs fisik)
5. Manager review dan approve
6. Sistem lakukan adjustment (stok diupdate ke angka fisik, selisih dicatat sebagai adjustment)

**Acceptance Criteria:**
- [ ] Opname hanya bisa dilakukan oleh warehouse atau owner
- [ ] Saat opname berlangsung: transaksi stok lain tetap bisa berjalan (tidak perlu freeze)
- [ ] Adjustment memerlukan approval owner atau branch_manager
- [ ] Laporan opname bisa di-export PDF/Excel

---

### M08 — Job Costing

#### M08.1 Kalkulasi Cost per SPK

**Formula:**
```
TOTAL COST PER SPK =
  Material Cost
  + Labor Cost (Operator)
  + Variable Cost (Pemasangan)
  + Overhead Allocation

Material Cost = Σ (qty_used × avg_unit_price) per bahan

Labor Cost = Σ (jam_kerja × rate_per_jam) per operator assigned
  - jam_kerja: dari timer di production board (M05)
  - rate_per_jam: dari data karyawan di M10

Variable Cost = Σ (jumlah_orang × jumlah_hari × rate_harian) untuk pemasangan

Overhead = harga_jual × overhead_rate%
  - overhead_rate: configurable di settings (default: 10%)

GROSS PROFIT = harga_jual − total_cost
GROSS MARGIN% = (gross_profit / harga_jual) × 100
```

**Acceptance Criteria:**
- [ ] Job cost otomatis ter-update saat ada material usage baru atau labor entry baru
- [ ] Owner bisa lihat job cost breakdown per SPK di detail view
- [ ] Jika data material usage atau labor belum lengkap: tampilkan indikator "Cost belum final"
- [ ] HPP calculator: owner input target margin → sistem kalkulasi minimum harga jual
- [ ] Report: top 10 produk by margin%, bottom 10 produk by margin% (per periode)

---

### M09 — POS & Kasir

#### M09.1 Proses Pembayaran

**Flow:**
1. Customer datang ambil pesanan → kasir buka SPK by nomor atau scan QR
2. Sistem tampilkan: detail pesanan, total tagihan, DP yang sudah dibayar, sisa yang harus dibayar
3. Kasir input metode pembayaran dan nominal
4. Jika lunas: status SPK → `delivered` / `closed`
5. Generate nota/receipt: cetak atau kirim WA/email

**Payment Methods:**
- Cash
- Transfer bank (input nominal + bukti opsional)
- QRIS (tampilkan QR, kasir konfirmasi manual saat sudah terbayar)
- Kartu debit/kredit (manual konfirmasi)
- Piutang / kredit customer (untuk customer terdaftar dengan credit limit)

**Acceptance Criteria:**
- [ ] Kasir bisa proses partial payment (bayar sebagian, sisanya jadi piutang)
- [ ] Change calculator untuk pembayaran cash (tampilkan kembalian)
- [ ] Nota bisa dicetak (format thermal printer 80mm atau A5) atau dikirim WA
- [ ] Void/refund: hanya owner atau manager, wajib input alasan, tercatat di audit log
- [ ] Laporan kasir: ringkasan per shift (total transaksi, breakdown per metode pembayaran)

#### M09.2 Cash Register Management

**Flow:**
- Buka shift: kasir input uang awal di laci
- Selama shift: semua transaksi tercatat
- Tutup shift: kasir hitung fisik uang, input ke sistem
- Sistem tampilkan: expected vs actual, selisih

**Acceptance Criteria:**
- [ ] Satu kasir hanya bisa punya satu shift aktif
- [ ] Cash in/out non-transaksi bisa dicatat (contoh: ambil uang untuk beli konsumsi)
- [ ] Laporan shift tidak bisa diedit setelah tutup (immutable)
- [ ] Owner bisa lihat semua laporan shift dari semua kasir

---

### M10 — HR & Payroll

#### M10.1 Master Karyawan

**Fields:**
- Data personal: nama, NIK, tanggal lahir, alamat, nomor HP, email
- Data kerja: posisi, cabang, tanggal mulai, status (aktif/tidak aktif)
- Tipe kontrak: Tetap Bulanan / Tetap Harian / Freelance / Borongan
- Gaji pokok / rate (sesuai tipe kontrak)
- BPJS: nomor kepesertaan Kesehatan dan Ketenagakerjaan
- Rekening bank untuk transfer gaji
- Dokumen: upload KTP, kontrak kerja (opsional)

**Acceptance Criteria:**
- [ ] NIK wajib unik per tenant
- [ ] Karyawan tidak aktif tidak bisa di-assign ke SPK baru
- [ ] Karyawan dengan data BPJS otomatis masuk kalkulasi potongan di payroll

#### M10.2 Absensi

**Flow:**
- Check-in: kasir/manager input manual, atau karyawan input PIN di terminal
- Check-out: sama
- Sistem kalkulasi jam kerja per hari
- Izin/sakit/cuti: input manual oleh hr_admin atau manager, perlu approval

**Acceptance Criteria:**
- [ ] Jika check-in tanpa check-out: sistem flag sebagai "belum checkout", hr_admin harus resolve
- [ ] Overtime: jam di atas jam kerja normal (configurable) dihitung sebagai overtime dengan rate berbeda
- [ ] Laporan absensi bulanan: per karyawan, export Excel, format siap untuk perhitungan payroll

#### M10.3 Payroll — Karyawan Tetap Bulanan

**Formula:**
```
TAKE HOME PAY =
  Gaji Pokok
  + Tunjangan Transport
  + Tunjangan Makan
  + Lembur (jam_overtime × rate_overtime)
  − Potongan BPJS Kesehatan (1% dari gaji pokok)
  − Potongan BPJS Ketenagakerjaan (2% dari gaji pokok)
  − PPh 21 (sesuai tabel pajak, kalkulasi sistem)
  − Kasbon (jika ada)
  ± Bonus / Penalty
```

**Acceptance Criteria:**
- [ ] Payroll periode: bisa bulanan, dua mingguan, atau mingguan (configurable per karyawan)
- [ ] Sistem kalkulasi otomatis berdasarkan data absensi bulan tersebut
- [ ] Hr_admin bisa review dan edit sebelum finalize
- [ ] Setelah finalize: tidak bisa diedit, harus buat adjustment entry
- [ ] Slip gaji: cetak atau kirim WA/email ke karyawan
- [ ] Export daftar transfer (format Excel siap upload ke internet banking)

#### M10.4 Payroll — Karyawan Harian

**Formula:**
```
UPAH = hari_hadir × rate_harian
```

**Acceptance Criteria:**
- [ ] Rate harian bisa berbeda per hari (hari biasa vs hari libur)
- [ ] Periode pembayaran fleksibel (mingguan, dua mingguan)
- [ ] Bisa bayar per batch (semua karyawan harian cabang sekaligus)

#### M10.5 Payroll — Variable Cost Pemasangan

**User Story:**
Sebagai pemilik print shop, saya sering punya proyek yang membutuhkan tukang harian untuk pasang billboard, spanduk besar, atau neon box. Saya ingin biaya ini tercatat dengan proper dan terhubung ke SPK yang bersangkutan.

**Flow:**
1. SPK yang ada komponen pemasangan → buka tab "Pemasangan"
2. Input project upah:
   - Jenis pekerjaan (Las / Rangkai / Pasang / Finishing lapangan)
   - Nama tukang (bisa tidak terdaftar sebagai karyawan)
   - Jumlah orang
   - Jumlah hari
   - Rate per orang per hari
   - Total (auto-kalkulasi)
   - Tanggal pembayaran
3. Status pembayaran: Belum dibayar / Sudah dibayar (cash)
4. Cost ini otomatis masuk ke job costing SPK (M08)

**Acceptance Criteria:**
- [ ] Tukang tidak harus terdaftar sebagai karyawan (bisa input nama bebas)
- [ ] Bisa tambah multiple entry pemasangan per SPK (jika ada beberapa tahap)
- [ ] Jika tukang adalah karyawan terdaftar: link ke data karyawan, masuk ke payroll mereka
- [ ] Jika tukang eksternal: dicatat sebagai expense operasional
- [ ] Laporan: total biaya pemasangan per periode, per SPK

---

### M11 — Akuntansi & Pajak

#### M11.1 Chart of Accounts (Pre-configured untuk Print Shop)

**Akun yang sudah tersedia by default:**

*Aktiva:*
- 1101 Kas
- 1102 Bank (bisa tambah sub-akun per rekening)
- 1103 Piutang Usaha
- 1201 Persediaan Bahan Baku
- 1301 Mesin & Peralatan
- 1302 Akumulasi Depresiasi Mesin

*Kewajiban:*
- 2101 Hutang Usaha (ke supplier)
- 2102 Hutang Pajak PPN
- 2103 Hutang PPh 21
- 2201 Hutang Jangka Panjang

*Ekuitas:*
- 3101 Modal Pemilik
- 3201 Laba Ditahan

*Pendapatan:*
- 4101 Pendapatan Jasa Cetak
- 4102 Pendapatan Jasa Desain
- 4103 Pendapatan Jasa Pemasangan
- 4901 Diskon (kontra-revenue)

*Beban:*
- 5101 HPP Bahan Baku
- 5102 Upah Produksi
- 5103 Biaya Pemasangan
- 5201 Gaji Karyawan
- 5202 BPJS Ketenagakerjaan (tanggungan perusahaan)
- 5301 Listrik
- 5302 Sewa Tempat
- 5303 Biaya Iklan & Marketing
- 5304 Penyusutan Mesin
- 5401 Biaya Bank & Admin

**Acceptance Criteria:**
- [ ] Owner atau accountant bisa tambah akun baru
- [ ] Akun default tidak bisa dihapus (hanya bisa deactivate)
- [ ] Setiap akun punya kode unik dalam satu tenant

#### M11.2 Auto-Journal dari Transaksi

| Event | Jurnal Otomatis |
|---|---|
| SPK confirmed + DP masuk | Dr Kas/Bank, Cr Pendapatan Diterima Dimuka |
| SPK delivered + lunas | Dr Kas/Bank, Cr Pendapatan Jasa Cetak |
| Invoice belum lunas | Dr Piutang Usaha, Cr Pendapatan Jasa Cetak |
| Material diterima dari supplier | Dr Persediaan Bahan Baku, Cr Hutang Usaha |
| Supplier dibayar | Dr Hutang Usaha, Cr Kas/Bank |
| Material dipakai produksi | Dr HPP Bahan Baku, Cr Persediaan Bahan Baku |
| Payroll diproses | Dr Beban Gaji, Cr Kas/Bank + Hutang PPh21 |
| Biaya operasional | Dr Beban [sesuai kategori], Cr Kas/Bank |

**Acceptance Criteria:**
- [ ] Semua jurnal otomatis bisa dilihat dan di-audit oleh accountant
- [ ] Jurnal otomatis tidak bisa diedit (hanya bisa lihat), tapi bisa dibuat jurnal koreksi manual
- [ ] Accountant bisa buat jurnal manual untuk item yang tidak punya trigger otomatis

#### M11.3 Laporan Keuangan

**Profit & Loss:**
- Pendapatan total (breakdown per jenis jasa)
- HPP total (breakdown: bahan baku, upah produksi, pemasangan)
- Gross Profit
- Beban operasional (detail per kategori)
- EBITDA
- Depresiasi
- EBIT
- Beban bunga (jika ada)
- EBT
- Pajak
- Net Profit

**Acceptance Criteria:**
- [ ] Laporan tersedia untuk: bulan ini, bulan lalu, YTD, custom range
- [ ] Bisa perbandingan dua periode (month-over-month atau year-over-year)
- [ ] Export PDF dan Excel
- [ ] Drill-down: klik angka di P&L → lihat transaksi penyusunnya

#### M11.4 Pajak PPN

**Flow:**
- Setiap SPK yang ditagih: sistem generate faktur pajak (jika tenant PKP)
- Rekap PPN Keluaran vs PPN Masukan per bulan
- Export format CSV siap upload ke aplikasi e-Faktur DJP

**Acceptance Criteria:**
- [ ] Tenant bisa setting: PKP (kena PPN) atau non-PKP
- [ ] Jika PKP: harga di SPK otomatis include/exclude PPN (configurable)
- [ ] Nomor faktur pajak: input manual atau auto-generate sesuai format DJP
- [ ] Laporan masa PPN: format siap lapor ke SPT Masa

---

### M12 — Web-to-Print API & Integrasi

#### M12.1 REST API untuk Integrasi Website

**Authentication:**
- Bearer token (API Key) di header: `Authorization: Bearer {api_key}`
- API Key dibuat di Settings → API → Generate Key
- Satu tenant bisa punya multiple API keys (per integrasi)
- API Key bisa di-revoke kapanpun

**Endpoints:**

```
GET  /v1/products
  Response: list produk aktif dengan pricing rules

GET  /v1/products/{id}/estimate
  Query params: width, height, qty, finishing[], material
  Response: { price_per_unit, total_price, breakdown }

POST /v1/orders
  Body: customer_info, product_id, specifications, files[], notes
  Response: { order_id, spk_number, status, total_price }

GET  /v1/orders/{order_id}
  Response: detail order + status terkini

POST /v1/orders/{order_id}/files
  Body: multipart/form-data dengan file
  Response: { file_id, filename, url }

GET  /v1/orders/track
  Query: phone={nomor_hp} atau order_id={id}
  Response: list order + status (endpoint publik, tidak perlu auth)

GET  /v1/webhooks
POST /v1/webhooks (register webhook URL)
DELETE /v1/webhooks/{id}
```

**Webhook Events:**
```json
{
  "event": "order.status_changed",
  "tenant_id": "xxx",
  "order_id": "SPK-SBY-20260523-0042",
  "old_status": "printing",
  "new_status": "ready",
  "timestamp": "2026-05-23T14:30:00+07:00",
  "customer": {
    "name": "Budi Santoso",
    "phone": "081234567890"
  }
}
```

**Acceptance Criteria:**
- [ ] API rate limit: 1000 request/jam per API key
- [ ] Response time < 500ms untuk semua GET endpoint
- [ ] Semua response dalam format JSON dengan struktur konsisten
- [ ] Error response format: `{ "error": "ERROR_CODE", "message": "Pesan human-readable" }`
- [ ] Webhook retry: jika endpoint gagal, retry 3x dengan exponential backoff (5m, 15m, 60m)
- [ ] API documentation tersedia di `docs.printeoo.com`

#### M12.2 WhatsApp Notification

**Provider:** Fonnte (prioritas) atau WA Business Cloud API

**Trigger & Template:**

| Trigger | Penerima | Template Default |
|---|---|---|
| SPK confirmed | Customer | "Halo {nama}, pesanan Anda ({spk_no}) sudah kami terima. Estimasi selesai: {deadline}. Terima kasih!" |
| Design ready for review | Customer | "Halo {nama}, desain pesanan Anda sudah siap untuk di-review. Silakan konfirmasi via link: {link}" |
| SPK ready | Customer | "Halo {nama}, pesanan Anda ({spk_no}) sudah siap diambil di {cabang}. Buka jam {jam_buka}. Terima kasih!" |
| SPK overdue | Owner | "Alert: SPK {spk_no} sudah melewati deadline. Customer: {customer_name}. Segera ditindaklanjuti." |
| Stock minimum | Owner/Warehouse | "Alert stok: {nama_bahan} tinggal {qty} {satuan}. Segera lakukan pembelian." |

**Acceptance Criteria:**
- [ ] Template pesan bisa dikustomisasi per tenant
- [ ] On/off per jenis notifikasi
- [ ] Log pengiriman WA: status (sent/failed/delivered) tercatat
- [ ] Jika WA API tidak dikonfigurasi: sistem tetap berjalan normal (notifikasi hanya in-app)

---

### M13 — Owner Dashboard

#### M13.1 Dashboard Overview

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Selamat pagi, Yanuar ☀️              Jumat, 23 Mei 2026    │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ Pesanan     │ Revenue     │ Selesai     │ Pending / Late    │
│ Hari Ini    │ Hari Ini    │ Hari Ini    │                   │
│ 24 order    │ Rp 4,2 jt   │ 18 order   │ 3 overdue ⚠️      │
│ ↑12% kemarin│ ↑8% kemarin │ 75% rate   │ 2 belum lunas     │
├─────────────┴─────────────┴─────────────┴───────────────────┤
│                                                             │
│  Revenue Trend (7 hari terakhir)        Top Produk Bulan   │
│  [chart area]                           1. Banner    34%   │
│                                         2. Spanduk   21%   │
│                                         3. Kartu Nama 18%  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Produksi Sekarang                      SPK Overdue         │
│  Antrian: 5 | Desain: 2 | Cetak: 3     SPK-0033 — 2 jam   │
│  Finishing: 1 | Siap: 7                SPK-0031 — kemarin  │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Data dashboard refresh otomatis setiap 60 detik (atau realtime via WebSocket untuk bagian produksi)
- [ ] Semua angka "hari ini" dihitung dari 00:00 hingga sekarang (timezone Asia/Jakarta)
- [ ] Persentase perubahan (↑↓) dibanding hari/periode sebelumnya
- [ ] Klik angka → navigate ke halaman terkait dengan filter sudah aktif
- [ ] Mobile view: cards stack vertikal, charts disederhanakan

#### M13.2 Analytics

**Halaman terpisah dari dashboard, lebih detail:**

- Revenue chart: daily / weekly / monthly / yearly toggle
- Produk analysis: top N by revenue, by qty, by margin
- Customer analysis: top customer by revenue, customer baru vs returning
- Operator performance: SPK selesai per operator, average waktu per stage
- Inventory: material usage trend, waste trend per produk
- Machine utilization (jika M16 aktif)

**Acceptance Criteria:**
- [ ] Semua chart interaktif (hover untuk lihat angka, klik untuk drill-down)
- [ ] Date range picker custom
- [ ] Export chart sebagai gambar (PNG) atau data sebagai Excel

---

### M15 — Product & Pricing Catalog

#### M15.1 Master Produk

**Fields:**
- Nama produk*
- Kode produk (auto atau manual)
- Kategori (Large Format / Offset / Merchandise / Packaging / Jasa Desain / Jasa Pasang / Lainnya)
- Satuan (pcs / lembar / meter / set)
- Status: aktif / tidak aktif
- Deskripsi (untuk tampilan web-to-print)
- Foto produk (opsional)

#### M15.2 Pricing Rules

Setiap produk bisa punya satu atau kombinasi dari:

**Tipe 1: Harga Flat**
- Harga per unit, tidak berubah
- Cocok untuk: mug, pin, topi, kartu nama standar

**Tipe 2: Harga per Ukuran (m²)**
- Harga = (width × height) × harga_per_m2
- Minimum charge (misal: minimum tagihan Rp 25.000)
- Cocok untuk: banner, spanduk, flexi

**Tipe 3: Tiered Pricing (by Qty)**
- Range qty → harga per unit berbeda
- Contoh: 1–50 pcs = Rp 5.000/pcs, 51–200 pcs = Rp 4.000/pcs, 201+ = Rp 3.000/pcs
- Cocok untuk: kartu nama, brosur, stiker

**Tipe 4: Harga Custom**
- Tidak ada auto-kalkulasi
- Kasir harus input harga manual saat order
- Cocok untuk: proyek besar, pemasangan, desain custom

**Acceptance Criteria:**
- [ ] Satu produk bisa kombinasi tipe (contoh: harga per m² + tiered qty)
- [ ] Pricing estimator: kasir bisa input spec → langsung lihat estimasi harga sebelum buat SPK
- [ ] Harga bisa di-override per SPK (dengan catat alasan)
- [ ] History perubahan harga tercatat (kapan, siapa, dari berapa ke berapa)

#### M15.3 Bill of Materials (BOM)

Link produk ke bahan baku yang digunakan:

- Produk: Banner Flexi
  - Flexi China: 1 m² per m² produk
  - Tinta (4 warna): 0.05 liter per m²
  - Mata ayam (opsional): 4 pcs per banner

**Acceptance Criteria:**
- [ ] BOM digunakan untuk: stock reservation saat SPK dibuat, suggestion usage di M07.3
- [ ] BOM adalah estimasi, operator bisa input usage aktual berbeda dari BOM
- [ ] Jika stok bahan tidak cukup untuk BOM saat SPK dibuat: tampilkan warning (bukan block)

---

### M17 — Customer Management

#### M17.1 Customer Profile

**Fields:**
- Nama*
- Tipe: Individual / Perusahaan
- Nomor HP* (unique per tenant)
- Email
- Alamat
- NPWP (untuk customer korporat yang butuh faktur pajak)
- Tipe customer: Retail / Korporat / Reseller / Agen
- Credit limit (jika diizinkan bayar dengan piutang)
- Harga khusus (VIP customer bisa dapat pricing berbeda)
- Catatan internal

**Acceptance Criteria:**
- [ ] Nomor HP unik per tenant (tidak bisa ada dua customer dengan HP yang sama)
- [ ] Merge customer: jika ada duplikat, owner bisa merge (semua history ikut ke customer yang dipertahankan)
- [ ] Customer tidak bisa dihapus jika ada SPK aktif atau piutang outstanding

#### M17.2 Customer History

- Total spending (lifetime, bulan ini, tahun ini)
- Jumlah order (total, bulan ini)
- Produk yang sering dipesan
- Outstanding piutang
- Timeline semua order

---

### M18 — Settings & Konfigurasi

#### M18.1 Profil Perusahaan
- Nama bisnis, logo, alamat, kota, nomor telp, email, website
- NPWP (untuk faktur pajak)
- Nama cabang dan alamat per cabang
- Jam operasional per cabang (untuk display antrian)

#### M18.2 Konfigurasi SPK
- Prefix nomor SPK per cabang
- Format nomor (editable template)
- Auto-assign operator (round-robin atau manual)
- Default prioritas

#### M18.3 Konfigurasi Pajak
- Status PKP: ya/tidak
- Rate PPN (default 11%)
- Harga di catalog: include PPN atau exclude PPN

#### M18.4 Konfigurasi Notifikasi
- Per jenis notifikasi: on/off
- WA API credentials (token Fonnte atau WA Business API)
- Template pesan WA (editable per trigger)
- Email SMTP settings (opsional)

#### M18.5 Konfigurasi Production Display
- Volume audio announcement
- Mode: dark / light
- Running text content
- Refresh interval (default: realtime WebSocket)

#### M18.6 Data Management
- Export semua data: per modul atau semua sekaligus (ZIP berisi multiple CSV)
- Audit log: filter by user, action, date range — export CSV
- Hapus data: hanya bisa dilakukan oleh owner, dengan konfirmasi berlapis

---

## 7. PROTOTYPE REQUIREMENTS (untuk Demo Yanuar)

### Scope Prototype
File tunggal HTML + JS + CSS (atau beberapa file yang bisa dibuka langsung di browser tanpa server).

### Halaman yang Harus Ada

1. **Login Page** — dengan role switcher (Owner / Kasir / Operator / Display)
2. **Owner Dashboard** — data dummy, semua widget terisi, chart animated
3. **Daftar Order (SPK)** — tabel dengan filter, beberapa SPK dummy dengan berbagai status
4. **Input Order Baru** — form lengkap, interaktif, bisa submit (simpan ke localStorage)
5. **SPK Detail** — timeline status, detail lengkap
6. **Production Board** — kanban interaktif, bisa drag-drop atau klik update status
7. **Production Display Mode** — full screen, dark mode, dengan simulasi audio (tombol "Simulasi SPK Masuk")
8. **Queue / Antrian** — layar antrian customer + simulasi panggil nomor dengan audio
9. **Pricing Page** — halaman 5 tier dengan comparison table (landing page style)
10. **Halaman "Segera Hadir"** — untuk modul yang belum dibangun, tampilkan preview screenshot/mockup dengan badge

### Data Dummy yang Harus Realistis
- Nama customer: nama Indonesia (Budi Santoso, PT Maju Jaya, Rina Dewi, dll)
- Nama produk: produk print shop nyata (Banner Flexi 3×1m, Kartu Nama Art Carton 260gr, Spanduk Kain, Brosur A4 Full Color, dll)
- Angka revenue: skala realistis untuk print shop menengah (Rp 500rb–15 juta per order)
- Tanggal: gunakan tanggal relatif (hari ini, kemarin, besok) bukan tanggal hard-coded

### Behaviour Prototype
- Role switcher: ganti tampilan sesuai role (owner lihat semua, operator lihat board saja, dll)
- Production board: klik card atau drag → update status (simpan ke localStorage)
- Input order: submit form → muncul di daftar order dan production board
- Display mode: tekan tombol "Simulasi SPK Baru" → muncul notifikasi + audio TTS
- Queue display: tekan "Panggil Berikutnya" → update layar + audio

---

## 8. NON-FUNCTIONAL REQUIREMENTS

### Performance
- Lighthouse score minimum: Performance 80, Accessibility 90
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

### Scalability
- Arsitektur harus support hingga 10.000 tenant aktif tanpa refaktor mayor
- Production board WebSocket: support 100 concurrent connections per branch

### Reliability
- Uptime target: 99.5% (downtime maksimal ~3.6 jam/bulan)
- Scheduled maintenance: Minggu dini hari, notifikasi 48 jam sebelumnya

### Accessibility
- Semua form harus accessible (label, ARIA)
- Contrast ratio minimum 4.5:1 untuk text
- Keyboard navigable untuk semua aksi utama

### Localization
- Default: Bahasa Indonesia
- Format angka: 1.000.000 (titik sebagai separator ribuan, koma untuk desimal)
- Format tanggal: DD MMMM YYYY (23 Mei 2026)
- Timezone: Asia/Jakarta (WIB) sebagai default, configurable per tenant

---

## 9. DEVELOPMENT PRIORITIES (Sprint Order)

### Sprint 1–2: Foundation
- M01 Auth (login, register, session)
- M02 User & role management
- Database schema setup dengan RLS
- Basic navigation shell

### Sprint 3–4: Core Operations
- M04 Order / SPK (input, list, detail, status update)
- M15 Product catalog (basic)
- M09 POS kasir (basic payment)

### Sprint 5–6: Production
- M05 Production board (kanban)
- M06 Production display (TV mode + audio)
- M03 Queue system

### Sprint 7–8: Intelligence
- M07 Inventory (incoming, usage, stock)
- M07.2b QR label fisik untuk material tracking (cetak label, scan di form usage, route /scan, scan log)
- M08 Job costing (basic formula)
- M13 Owner dashboard

### Sprint 9–10: People & Money
- M10 HR & payroll (semua tipe termasuk variable pemasangan)
- M11 Akuntansi dasar (P&L, cash flow)
- M17 CRM customer

### Sprint 11–12: Integration & Scale
- M12 Web-to-print API
- M11 Pajak (PPN, PPh, e-Faktur)
- M01 Multi-branch (Business tier)
- Billing & subscription management

---

## 10. OPEN QUESTIONS & DECISIONS NEEDED

*Item berikut membutuhkan keputusan dari Product Owner sebelum development dimulai:*

1. **Pricing final** — berapa angka pasti per tier? Perlu validasi dengan 5–10 calon pelanggan.
2. **WA API provider** — Fonnte vs WA Business Cloud API? Fonnte lebih mudah setup, WA Cloud API lebih reliable untuk skala besar.
3. **Hosting provider** — Railway vs Render vs VPS langsung? Tergantung budget awal.
4. **Domain final** — apakah `printeoo.com` sudah secured? Domain `.id` juga perlu (`printeoo.id`).
5. **Offline strategy** — seberapa robust offline mode yang dibutuhkan? Full offline (semua data cached) atau hanya tolerant (bisa update status meski koneksi lambat)?
6. **Printsoft migration tool** — apakah perlu build tool untuk migrate data dari Printsoft? Format data Printsoft belum diketahui (tunggu akses dari Yanuar).
7. **Bahasa default** — semua UI Indonesia, atau ada kebutuhan dual language dari awal?

---

*Dokumen ini adalah living document. Setiap perubahan requirement harus dicatat di sini sebelum diimplementasikan.*  
*Version history: tambahkan entri di sini setiap kali ada perubahan signifikan.*

| Versi | Tanggal | Perubahan | Oleh |
|---|---|---|---|
| 1.0 | 2026-05-23 | Initial draft | Ahmad |
