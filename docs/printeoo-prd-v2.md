# Printeoo — Product Requirements Document
**Version:** 2.0  
**Status:** Active — Production-Ready  
**Last Updated:** 2026-05-25  
**Prepared by:** Ahmad Chaidir  
**Prepared for:** Development Team · AI Coding Assistants · Investors  

---

## CHANGELOG

| Versi | Tanggal | Perubahan | Oleh |
|---|---|---|---|
| 1.0 | 2026-05-23 | Initial draft | Ahmad |
| 1.1 | 2026-05-25 | Multi-item SPK, traceability, role Kurir, Portal Karyawan | Ahmad |
| 1.2 | 2026-05-25 | Hapus design_review, Nota Pesanan + QR tracking, spesifikasi fisik batch | Ahmad |
| 2.0 | 2026-05-25 | Full rewrite: industry-standard format, numbered user stories, testable AC, error states, API contracts, edge cases | Ahmad |

---

## CARA MENGGUNAKAN DOKUMEN INI

Dokumen ini adalah **single source of truth** untuk semua keputusan product dan engineering Printeoo.

**Untuk developer/AI:**
- Setiap modul punya User Stories bernomor (`US-XXX`) dan Acceptance Criteria bernomor (`AC-XXX`)
- AC yang dimulai `[MUST]` adalah blocker release; `[SHOULD]` adalah target; `[COULD]` adalah nice-to-have
- Setiap edge case diberi label `[EDGE]`
- Error state diberi label `[ERROR]`
- API contract hint diberi label `[API]`
- Field database diberi label `[DB]`

**Untuk product decisions:**
- Semua open question ada di Section 10 dengan owner dan deadline
- Setiap decision yang sudah resolved dicatat dengan rationale-nya

---

## TABLE OF CONTENTS

1. Product Overview
2. Subscription Tiers & Module Access
3. User Roles & Permission Matrix
4. Technical Requirements
5. Global UI/UX Requirements
6. Module Specifications (M01–M19)
7. Non-Functional Requirements
8. Data Model & Schema
9. Development Priorities
10. Open Questions & Decision Log

---

## 1. PRODUCT OVERVIEW

### 1.1 Visi

Printeoo adalah platform manajemen print shop pertama di Indonesia yang berpihak penuh pada pemilik usaha — memberikan visibility operasional end-to-end tanpa menjual data pelanggan untuk kepentingan bisnis kami sendiri.

**North Star Metric:** Jumlah SPK yang diproses melalui Printeoo per bulan di seluruh tenant aktif.

### 1.2 Problem Statement

Print shop skala menengah di Indonesia (5–50 karyawan) menghadapi 5 masalah utama:

| # | Masalah | Dampak Nyata |
|---|---|---|
| P1 | SPK masih di kertas, sering hilang saat ramai | Order terlewat, pelanggan kecewa |
| P2 | Tidak ada tracking real-time order → produksi | Operator tidak tahu urutan prioritas |
| P3 | Loss material tidak terdeteksi | Profit aktual tidak diketahui, waste tidak bisa dikurangi |
| P4 | Software incumbent mahal (Rp 100jt+) dan tidak dipercaya (jual data) | Tidak ada alternatif terjangkau |
| P5 | Sistem insentif tidak transparan | Karyawan tidak termotivasi, turnover tinggi |

### 1.3 Target User

**Primary Persona — Pemilik Print Shop Menengah:**
- Usaha 5–20 karyawan, 1–2 cabang
- Revenue Rp 50–300 juta/bulan
- Pakai WhatsApp + Excel + kertas saat ini
- Pain point terbesar: tidak tahu berapa profit sebenarnya per job

**Secondary Persona — Operator Kasir/Produksi:**
- Pengguna harian sistem
- Tidak selalu melek teknologi
- Pakai tablet atau HP Android mid-range
- Butuh: maksimum 3 tap untuk aksi inti

**Tertiary Persona — Grup Percetakan:**
- 3–10 cabang, 50–200 karyawan
- Butuh: multi-branch visibility, custom role, white-label

### 1.4 Value Proposition

```
Untuk pemilik print shop Indonesia yang frustrasi dengan operasional manual,
Printeoo adalah platform SaaS yang memberikan visibility penuh — dari order masuk
hingga material habis dan upah terbayar — mulai Rp 400.000/bulan.

Berbeda dari software incumbent yang mahal dan tidak dipercaya, Printeoo:
- Tidak pernah menggunakan data operasional tenant
- Bisa jalan dalam 1 hari tanpa training panjang
- Harga mulai Rp 400rb, bukan Rp 100 juta one-time
```

### 1.5 Success Metrics (per kuartal)

| Metric | Target Q1 | Target Q2 |
|---|---|---|
| Tenant aktif berbayar | 10 | 50 |
| SPK diproses/bulan (total) | 1.000 | 10.000 |
| Churn rate bulanan | < 5% | < 3% |
| NPS | > 30 | > 50 |
| Time-to-value (setup hingga SPK pertama) | < 60 menit | < 30 menit |

---

## 2. SUBSCRIPTION TIERS & MODULE ACCESS

### 2.1 Tier Definitions

| Tier | Nama | Target Segmen | Max Cabang | Max User | Harga/Bulan* |
|---|---|---|---|---|---|
| 1 | Solo | 1–2 orang, baru digital | 1 | 3 | ~Rp 400.000 |
| 2 | Studio | 3–10 karyawan | 1 | 10 | ~Rp 800.000 |
| 3 | Pro | Established, mulai scale | 1 | 25 | ~Rp 1.500.000 |
| 4 | Business | Multi-cabang | Unlimited | 100 | ~Rp 3.000.000 |
| 5 | Enterprise | Grup besar, custom | Unlimited | Unlimited | Custom |

*Harga belum final, pending validasi market. Lihat Open Question #1.

### 2.2 Module Access Matrix

| Module | Solo | Studio | Pro | Business | Enterprise |
|---|---|---|---|---|---|
| M04 SPK Digital (multi-item) | ✓ | ✓ | ✓ | ✓ | ✓ |
| M04.5 Nota Pesanan + QR Tracking | ✓ | ✓ | ✓ | ✓ | ✓ |
| M09 POS Kasir | ✓ | ✓ | ✓ | ✓ | ✓ |
| M17 CRM Pelanggan (dasar) | ✓ | ✓ | ✓ | ✓ | ✓ |
| M05 Production Board (per item) | — | ✓ | ✓ | ✓ | ✓ |
| M07 Inventory + QR Label | — | ✓ | ✓ | ✓ | ✓ |
| M10 HR Dasar + Portal Karyawan | — | ✓ | ✓ | ✓ | ✓ |
| M03 Antrian & Display | — | — | ✓ | ✓ | ✓ |
| M08 Job Costing per Item | — | — | ✓ | ✓ | ✓ |
| M10.9 Payroll Lengkap + Insentif | — | — | ✓ | ✓ | ✓ |
| M12 Web-to-Print API | — | — | ✓ | ✓ | ✓ |
| M11 Akuntansi & Pajak | — | — | — | ✓ | ✓ |
| M01 Multi-Branch | — | — | — | ✓ | ✓ |
| M02 Custom Role | — | — | — | — | ✓ |
| White-label | — | — | — | — | ✓ |
| Dedicated Support & SLA | — | — | — | — | ✓ |

### 2.3 Trial & Billing Rules

- Semua tier berbayar mendapat **14 hari free trial** tanpa kartu kredit
- Setelah trial: downgrade otomatis ke Solo jika tidak subscribe, data tetap tersimpan 30 hari
- Pembayaran: transfer bank, kartu kredit, QRIS
- Invoice otomatis dikirim ke email owner setiap awal periode

---

## 3. USER ROLES & PERMISSIONS

### 3.1 Role Definitions

| Role ID | Nama | Deskripsi Singkat | Tier Minimum |
|---|---|---|---|
| `owner` | Pemilik | Akses penuh semua modul semua cabang | Solo |
| `branch_manager` | Manajer Cabang | Akses penuh cabang ditugaskan, tidak bisa billing | Business |
| `cashier` | Kasir | Input SPK, proses pembayaran, nota, antrian | Solo |
| `designer` | Desainer | Queue desain, upload file, tandai design ready | Studio |
| `operator` | Operator Produksi | Board produksi, update status item, input material usage | Studio |
| `warehouse` | Staff Gudang | Full inventory: incoming, opname, QR, waste, submit PO | Studio |
| `courier` | Kurir | Delivery queue milik sendiri, update status kirim, upload bukti | Studio |
| `hr_admin` | Admin HR | Full HR, absensi, payroll, insentif | Pro |
| `accountant` | Akuntan | Full laporan keuangan, jurnal, pajak; read-only lainnya | Business |
| `display` | Layar Display | Read-only production display. No interaction, no session expire | Pro |

### 3.2 Permission Matrix

| Action | owner | branch_mgr | cashier | designer | operator | warehouse | courier | hr_admin | accountant | display |
|---|---|---|---|---|---|---|---|---|---|---|
| Manage tenant settings | ✓ | — | — | — | — | — | — | — | — | — |
| Manage subscription & billing | ✓ | — | — | — | — | — | — | — | — | — |
| Manage users & roles | ✓ | R† | — | — | — | — | — | — | — | — |
| Configure incentive rules | ✓ | — | — | — | — | — | — | ✓ | — | — |
| Create / edit SPK | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| Cetak / kirim nota pesanan | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| View all SPK | ✓ | ✓ | ✓ | R | R | R | — | — | R | — |
| Update item status (desain) | ✓ | ✓ | ✓ | ✓ | — | — | — | — | — | — |
| Update item status (produksi) | ✓ | ✓ | — | — | ✓ | — | — | — | — | — |
| Process payment | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| View production board | ✓ | ✓ | R | ✓ | ✓ | — | — | — | — | R |
| Input material usage & waste | ✓ | ✓ | — | — | ✓ | ✓ | — | — | — | — |
| Manage inventory (full) | ✓ | ✓ | — | — | — | ✓ | — | — | — | — |
| Cetak QR label material | ✓ | ✓ | — | — | — | ✓ | — | — | — | — |
| Submit PO request | ✓ | ✓ | — | — | — | ✓ | — | — | — | — |
| Approve PO | ✓ | ✓ | — | — | — | — | — | — | — | — |
| View delivery queue (semua) | ✓ | ✓ | ✓ | — | — | — | — | — | — | — |
| View delivery queue (milik sendiri) | — | — | — | — | — | — | ✓ | — | — | — |
| Update delivery status | ✓ | ✓ | ✓ | — | — | — | ✓ | — | — | — |
| Manage employees | ✓ | R† | — | — | — | — | — | ✓ | — | — |
| Process payroll | ✓ | — | — | — | — | — | — | ✓ | — | — |
| View own incentive | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| View others' incentive | ✓ | R† | — | — | — | — | — | ✓ | — | — |
| View financial reports | ✓ | R† | — | — | — | — | — | — | ✓ | — |
| View Portal Karyawan (milik sendiri) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| View audit log | ✓ | — | — | — | — | — | — | — | — | — |

†R = Read-only; R† = Read-only, terbatas pada cabang yang ditugaskan

### 3.3 Warehouse — Detail Permission Inventory

| Fitur | Warehouse |
|---|---|
| Lihat stok & riwayat | ✓ |
| Catat penerimaan + spesifikasi fisik | ✓ |
| Generate & cetak QR label | ✓ |
| Catat pengeluaran per SPK | ✓ |
| Stok opname — input fisik | ✓ |
| Submit PO request | ✓ |
| Lihat qty di PO | ✓ |
| Lihat harga di PO | ✗ (hidden) |
| Approve PO | ✗ |
| Edit data SPK | ✗ |
| Akses laporan keuangan | ✗ |

---

## 4. TECHNICAL REQUIREMENTS

### 4.1 Stack (Recommended)

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR untuk halaman publik (tracking), RSC untuk dashboard |
| UI | Tailwind CSS + shadcn/ui | Kecepatan development, konsistensi |
| Backend | Hono.js on Cloudflare Workers | Edge-native, latency rendah, biaya rendah di awal |
| Database | PostgreSQL (Neon/Supabase) | ACID, relational, Row-Level Security untuk tenant isolation |
| Auth | Clerk atau NextAuth.js | Multi-tenant session, role claim di JWT |
| File Storage | Cloudflare R2 | Murah, S3-compatible |
| Queue/Job | Cloudflare Queues | Background job: notif WA, PDF gen, payroll calc |
| Realtime | Pusher atau Cloudflare Durable Objects | Production board live update, display queue |
| PDF | React-PDF atau Puppeteer (serverless) | Generate nota, laporan, label QR |
| WA Integration | Fonnte atau WA Business Cloud API | Notif otomatis ke customer dan owner |

### 4.2 Multi-Tenancy

- **Tenant isolation:** Row-Level Security di PostgreSQL dengan `tenant_id` di semua tabel operasional
- **Subdomain strategy:** `{tenant-slug}.printeoo.com` untuk produksi, custom domain untuk Enterprise
- **Data residency:** Semua data di server Indonesia (atau region Asia terdekat)

### 4.3 Security Requirements

- Semua API endpoint memerlukan JWT yang valid dengan claim `tenant_id` + `branch_id` + `role`
- Rate limiting: 100 req/menit per user untuk endpoint write
- Input sanitization: semua user input di-sanitize sebelum masuk DB
- File upload: validasi MIME type server-side, scan malware untuk file desain
- Audit log: semua aksi destructive dicatat (hapus SPK, adjust stok, approve payroll)
- HTTPS-only, HSTS enabled
- Halaman `/track/{spk_id}` menggunakan token UUID v4 (bukan nomor SPK sequential) untuk mencegah enumerasi

### 4.4 Offline Strategy

- **Operator produksi:** Service Worker cache untuk production board. Update status item bisa dilakukan offline, sync saat reconnect (conflict resolution: last-write-wins dengan timestamp)
- **Kasir:** Online required untuk payment processing. Halaman SPK list di-cache untuk read
- **Display:** Polling 5 detik sebagai fallback jika WebSocket putus

### 4.5 Performance Budget

| Halaman | LCP Target | TTI Target |
|---|---|---|
| Login | < 1.5s | < 2s |
| Dashboard | < 2s | < 3s |
| Production Board | < 2s | < 3s |
| Tracking Publik `/track` | < 1.5s | < 2s |
| Display (TV mode) | < 2s | < 3s |

---

## 5. GLOBAL UI/UX REQUIREMENTS

### 5.1 Design Principles

1. **Clarity over cleverness** — label dan aksi harus self-explanatory tanpa dokumentasi
2. **Mobile-first untuk operator** — kasir, operator, gudang, kurir rata-rata pakai tablet/HP
3. **High density untuk owner** — dashboard owner boleh dense (layar besar)
4. **Maximum 3 tap untuk aksi inti** — hard constraint untuk role non-desk
5. **Bahasa Indonesia** — semua UI default bahasa Indonesia, termasuk error messages
6. **Inline create** — entitas baru (bahan, customer, produk) bisa dibuat tanpa navigasi keluar

### 5.2 Navigation Structure

```
Sidebar (desktop, 220px) / Bottom nav (mobile, 56px):
├── Dashboard              [owner, branch_manager]
├── Antrian                [owner, branch_manager, cashier]
├── Pesanan (SPK)          [owner, branch_manager, cashier, designer*, operator*]
│   └── + Pesanan Baru     [owner, branch_manager, cashier]
├── Produksi               [owner, branch_manager, designer, operator]
├── Inventaris             [owner, branch_manager, warehouse]
├── Pengiriman             [owner, branch_manager, cashier, courier]
├── Pelanggan              [owner, branch_manager, cashier]
├── Produk & BOM           [owner, branch_manager]
├── Karyawan & Payroll     [owner, hr_admin]
├── Keuangan               [owner, accountant]
└── Pengaturan             [owner]

Header (60px):
├── Logo + Breadcrumb
├── Notifikasi bell (badge count)
├── Portal Karyawan (semua role kecuali display) — ikon user
└── Role / Branch switcher (owner only: bisa switch branch)

Portal Karyawan (slide-over panel):
├── Ringkasan Bulan Ini (jam kerja, insentif terkumpul)
├── Insentif Saya (detail per item)
├── Informasi Saya (data pribadi, kontrak)
└── Notifikasi & Teguran
```

*designer dan operator hanya bisa read SPK, tidak bisa buat baru

### 5.3 Color System

```css
:root {
  /* Brand */
  --color-primary:       #2563EB;   /* CTA, active state, link */
  --color-primary-light: #EFF6FF;   /* Background highlight */
  --color-primary-dark:  #1D4ED8;   /* Hover state */

  /* Semantic */
  --color-success:       #16A34A;   /* Selesai, lunas, stok aman */
  --color-warning:       #D97706;   /* Urgent, hampir habis, perlu perhatian */
  --color-danger:        #DC2626;   /* Overdue, error, stok habis, selisih negatif */
  --color-info:          #0891B2;   /* Informasi netral */

  /* Neutral */
  --color-neutral-50:    #F9FAFB;   /* Background halaman */
  --color-neutral-100:   #F3F4F6;   /* Background card, sidebar */
  --color-neutral-200:   #E5E7EB;   /* Border, divider */
  --color-neutral-400:   #9CA3AF;   /* Placeholder text */
  --color-neutral-500:   #6B7280;   /* Muted text, label */
  --color-neutral-700:   #374151;   /* Secondary text */
  --color-neutral-900:   #111827;   /* Primary text */
  --color-white:         #FFFFFF;
}
```

### 5.4 Typography Scale

```
xs:   12px / 1.5 — label tabel, badge, metadata kecil
sm:   13px / 1.5 — body tabel, secondary text
base: 14px / 1.6 — body utama
md:   16px / 1.5 — subheading
lg:   18px / 1.4 — heading section
xl:   24px / 1.3 — heading halaman
2xl:  32px / 1.2 — angka besar dashboard
3xl:  48px / 1.1 — display mode (nomor antrian, produk aktif)

Font: Inter (primary), fallback: Plus Jakarta Sans, system-ui, sans-serif
Minimum contrast: WCAG AA (4.5:1 untuk teks normal, 3:1 untuk teks besar)
```

### 5.5 Component Standards

**Badge Status:**
```
confirmed     → bg:#DBEAFE  text:#1D4ED8  "Dikonfirmasi"
design_queue  → bg:#E0E7FF  text:#4338CA  "Antrian Desain"
in_design     → bg:#FEF3C7  text:#92400E  "Sedang Desain"
printing      → bg:#FEF3C7  text:#92400E  "Sedang Cetak"
finishing     → bg:#D1FAE5  text:#065F46  "Finishing"
ready         → bg:#D1FAE5  text:#065F46  "Siap Ambil"
delivered     → bg:#F3F4F6  text:#374151  "Diambil"
closed        → bg:#F3F4F6  text:#374151  "Selesai"
overdue       → bg:#FEE2E2  text:#991B1B  "Terlambat"
urgent        → bg:#FED7AA  text:#9A3412  "Urgent"
vip           → bg:#F3E8FF  text:#6B21A8  "VIP"
```

**Notification Patterns:**
- `Toast` — hasil aksi (sukses/gagal), 3 detik, pojok kanan atas, max 3 stack
- `Bell` — notifikasi yang butuh tindak lanjut (badge count), tidak auto-dismiss
- `Modal` — konfirmasi aksi destruktif WAJIB: tombol destruktif outline/secondary bukan solid merah
- `Inline error` — validasi form, muncul di bawah field
- `Insentif mini-toast` — "+Rp X.XXX insentif" muncul 3 detik saat item selesai

**Format Lokal (WAJIB di semua output termasuk nota dan laporan):**
- Angka: `1.000.000` (titik ribuan, koma desimal) — gunakan `Intl.NumberFormat('id-ID')`
- Tanggal: `25 Mei 2026` — gunakan `Intl.DateTimeFormat('id-ID', {day:'numeric',month:'long',year:'numeric'})`
- Waktu: 24 jam `16:00` — bukan `4:00 PM`
- Timezone default: `Asia/Jakarta` (WIB, UTC+7)
- Mata uang: `Rp 1.500.000` (spasi setelah Rp, tanpa desimal untuk rupiah)

---

## 6. MODULE SPECIFICATIONS

---

### M01 — Authentication & Tenant Management

#### M01.1 Registrasi Tenant

**User Story US-001:**
> Sebagai calon pemilik print shop, saya ingin mendaftar Printeoo dengan email dan nama bisnis saya, sehingga saya bisa mulai menggunakan sistem dalam waktu kurang dari 5 menit.

**Flow:**
```
Landing Page → Klik "Mulai Gratis" → Form registrasi → Verifikasi email → Onboarding wizard → Dashboard
```

**Form registrasi fields:**
- Nama lengkap pemilik* 
- Email* (unik per sistem)
- Password* (min 8 karakter, 1 huruf besar, 1 angka)
- Nama bisnis* (menjadi default branch name)
- Nomor HP (untuk notif WA)

**Onboarding wizard (4 langkah, bisa skip):**
1. Profil bisnis: logo, alamat, kota, nomor WA bisnis
2. Tambah produk pertama (atau skip, bisa dari template)
3. Undang karyawan pertama (atau skip)
4. Tour singkat: "Ini dashboard Anda. Klik sini untuk buat pesanan pertama."

**Acceptance Criteria:**
- [MUST AC-001] Email verifikasi terkirim dalam 60 detik setelah submit
- [MUST AC-002] Tenant slug di-generate dari nama bisnis (slugify, lowercase, hapus spasi/simbol)
- [MUST AC-003] Jika slug sudah ada, tambahkan suffix angka: `titaniumprint-2`
- [MUST AC-004] Setelah verifikasi email, user langsung masuk dashboard tanpa login ulang
- [SHOULD AC-005] Onboarding wizard progress tersimpan jika user tutup browser di tengah jalan
- [EDGE AC-006] Email sudah terdaftar → tampilkan "Email sudah digunakan. Masuk atau reset password?"

**[DB] Tabel `tenants`:**
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
slug            VARCHAR(63) UNIQUE NOT NULL
name            VARCHAR(255) NOT NULL
owner_id        UUID REFERENCES users(id)
subscription_tier ENUM('solo','studio','pro','business','enterprise') DEFAULT 'solo'
trial_ends_at   TIMESTAMPTZ
created_at      TIMESTAMPTZ DEFAULT NOW()
settings        JSONB DEFAULT '{}'  -- logo_url, wa_number, address, footer_text, dll
```

#### M01.2 Login & Session

**User Story US-002:**
> Sebagai pengguna, saya ingin login dengan email dan password, sehingga saya bisa mengakses sistem dengan aman.

**Acceptance Criteria:**
- [MUST AC-007] Login gagal setelah 5 percobaan dalam 15 menit → lock 30 menit + notif email
- [MUST AC-008] Session token expire: 8 jam untuk web, 30 hari untuk "Ingat saya"
- [MUST AC-009] Logout dari semua perangkat tersedia di Settings
- [SHOULD AC-010] Magic link login sebagai alternatif password (kirim via email)
- [EDGE AC-011] User yang di-deactivate oleh owner → session langsung di-revoke, redirect ke login dengan pesan "Akun Anda dinonaktifkan"

#### M01.3 Multi-Branch (Business & Enterprise tier)

**User Story US-003:**
> Sebagai pemilik yang punya 3 cabang, saya ingin bisa switch antar cabang dari header, sehingga saya bisa monitor semua cabang tanpa login ulang.

**Acceptance Criteria:**
- [MUST AC-012] Owner bisa switch branch dari dropdown di header
- [MUST AC-013] Semua data (SPK, inventory, karyawan) otomatis terfilter per branch yang aktif
- [MUST AC-014] Branch manager hanya bisa akses branch yang ditugaskan
- [SHOULD AC-015] Dashboard owner punya view "Semua Cabang" yang aggregate metrics
- [EDGE AC-016] Jika tenant downgrade dari Business ke Pro → branch kedua dan seterusnya di-lock (read-only), data tidak hilang

---

### M02 — User & Role Management

#### M02.1 Manage Users

**User Story US-004:**
> Sebagai owner, saya ingin mengundang karyawan dengan email mereka dan assign role yang tepat, sehingga setiap orang hanya bisa akses fitur yang relevan dengan tugasnya.

**Flow:**
```
Pengaturan → Pengguna → Undang Pengguna → Input email + pilih role + pilih branch
→ Email undangan terkirim → Karyawan klik link → Set password → Masuk sistem
```

**Acceptance Criteria:**
- [MUST AC-017] Link undangan expire 72 jam
- [MUST AC-018] Owner bisa resend undangan atau revoke sebelum diterima
- [MUST AC-019] Satu user hanya bisa punya satu role per tenant (tidak multi-role)
- [MUST AC-020] Owner tidak bisa hapus dirinya sendiri
- [SHOULD AC-021] Undangan bisa dikirim via WA selain email
- [EDGE AC-022] Email undangan sudah ada di sistem sebagai user berbeda → error "Email sudah digunakan akun lain"

#### M02.2 Deactivate User

**Acceptance Criteria:**
- [MUST AC-023] Deactivate user (bukan delete): data historis tetap ada, user tidak bisa login
- [MUST AC-024] SPK dan record yang dibuat user yang di-deactivate tetap tampil dengan nama user tersebut
- [MUST AC-025] Owner tidak bisa deactivate dirinya sendiri

---

### M03 — Queue & Antrian

#### M03.1 Manajemen Antrian (Kasir)

**User Story US-005:**
> Sebagai kasir, saya ingin memanggil nomor antrian berikutnya dengan satu tap, sehingga proses antrian customer berjalan cepat dan tertib.

**State antrian:**
```
Tersedia → Dipanggil → Dilayani → Selesai
```

**Acceptance Criteria:**
- [MUST AC-026] Tombol "Panggil Berikutnya" per counter — satu tap, langsung update display
- [MUST AC-027] Nomor antrian format: `{prefix}-{3digit}` — contoh: `A-001`, `B-012`
- [MUST AC-028] Reset nomor antrian: manual oleh kasir (dengan konfirmasi), atau otomatis jam tertentu (konfigurasi dari Settings)
- [MUST AC-029] "Panggil Ulang" — recall nomor yang sama tanpa advance queue
- [MUST AC-030] "Lewati" — skip nomor yang tidak hadir, masuk ke log "Tidak Hadir"
- [SHOULD AC-031] Estimasi waktu tunggu tampil di layar antrian (berdasarkan average service time)
- [EDGE AC-032] Jika antrian kosong dan kasir klik "Panggil Berikutnya" → toast "Antrian kosong"

#### M03.2 Layar Antrian (Display)

**User Story US-006:**
> Sebagai customer yang menunggu, saya ingin melihat nomor yang sedang dilayani di layar besar, sehingga saya tidak perlu terus-menerus bertanya ke kasir.

**Acceptance Criteria:**
- [MUST AC-033] Nomor aktif per counter tampil dalam font minimum 96px
- [MUST AC-034] Nomor yang baru dipanggil: animasi highlight 3 detik (fade-in + scale)
- [MUST AC-035] Audio TTS saat nomor baru dipanggil: "Nomor A-015, silakan ke Counter 1" (Web Speech API, `lang: 'id-ID'`)
- [MUST AC-036] Overlay "Ketuk untuk aktifkan audio" saat pertama buka (workaround autoplay policy)
- [MUST AC-037] Running text footer: konfigurasi dari Settings (jam buka, tagline bisnis)
- [MUST AC-038] Sync real-time dengan kasir (WebSocket/polling 500ms)
- [SHOULD AC-039] Jika 2 counter aktif, tampilkan 2 box nomor side-by-side
- [EDGE AC-040] Koneksi WebSocket putus → indikator "Offline" kecil di pojok, polling fallback aktif

---

### M04 — Order Management (SPK Digital)

#### KONSEP KUNCI

**SPK = unit transaksi.** SPK berisi 1–20 `OrderItem`. Setiap `OrderItem` adalah unit produksi dengan status independen. Status SPK di-derive dari status semua item-nya.

```
SPK
└── Item 1: Banner 3×1m        [status: printing]
└── Item 2: Kartu Nama 500 pcs [status: design_queue]
└── Item 3: Stiker A3 100 pcs  [status: confirmed]
SPK status → "active" (karena belum semua item ready)
```

#### M04.1 Input Order Baru

**User Story US-007:**
> Sebagai kasir, saya ingin input pesanan baru dengan cepat — cukup pilih customer, produk, dan qty — sehingga antrian tidak menumpuk saat toko ramai.

**Form sections:**

**Section 1 — Data Customer:**
- Input customer: autocomplete dari database (ketik 2+ karakter → dropdown suggestion)
- Saat pilih customer existing: auto-fill nomor HP
- Customer baru: inline create (modal mini) tanpa navigasi keluar
- Nomor HP: auto-format `+62xxx-xxxx-xxxx`
- Sumber order: Walk-in / Online / Telepon / Referral

**Section 2 — Item Pesanan (multi-item):**
- Tombol "+ Tambah Item" — bisa tambah unlimited item
- Per item:
  - Dropdown produk (searchable, dari katalog)
  - Field spesifikasi dinamis sesuai tipe produk:
    - `large_format` (Banner, Spanduk): input lebar (cm) + tinggi (cm) → auto-hitung m²
    - `flat` (Kartu Nama, Mug): input qty pcs
    - `tiered` (Brosur): input qty → harga per unit auto-update sesuai tier
  - Finishing: multi-select (Laminasi Doff / Glossy / Mata Ayam / Cutting / Lipat)
  - Harga satuan: auto-fill dari katalog, editable
  - Diskon per item: nominal atau % (toggle)
  - Total per item: auto-kalkulasi (readonly)
  - Butuh desain: toggle (default: sesuai konfigurasi produk)
  - Catatan per item: textarea opsional

**Section 3 — Produksi & Pembayaran:**
- Deadline: date + time picker
- Prioritas: Normal / Urgent / VIP
- File desain: upload (bisa multiple), atau "Bawa sendiri nanti", atau "Dibuat tim"
- Catatan untuk operator: textarea
- Diskon keseluruhan SPK: nominal atau %
- DP: nominal + metode (Cash / Transfer / QRIS)
- Sisa tagihan: auto-kalkulasi

**Auto-generate nomor SPK:** `SPK-{BRANCH_CODE}-{YYYYMMDD}-{4digit_increment}`
Contoh: `SPK-SBY-20260525-0042`

**After submit:**
- Simpan SPK ke database
- Tampilkan modal sukses:
  ```
  ✅ Pesanan berhasil disimpan!
  SPK-SBY-20260525-0042

  [🖨️ Cetak Nota]  [📱 Kirim WA]  [📋 Lihat Detail]
  ```
- Trigger background job: kirim notif WA ke customer (jika diaktifkan di Settings)

**Acceptance Criteria:**
- [MUST AC-041] Minimal 1 item wajib ada sebelum bisa submit
- [MUST AC-042] Total SPK (sum semua item) tampil realtime saat user edit qty/harga
- [MUST AC-043] Nomor SPK auto-increment tidak boleh ada gap (handle concurrent request dengan DB sequence)
- [MUST AC-044] Customer baru bisa dibuat inline tanpa keluar dari form order
- [MUST AC-045] Submit → redirect ke detail SPK yang baru dibuat
- [SHOULD AC-046] Draft auto-save setiap 30 detik ke localStorage (recovery jika browser crash)
- [EDGE AC-047] Produk yang dipilih tidak punya BOM → warning banner "Produk ini belum punya BOM. Estimasi material tidak tersedia."
- [EDGE AC-048] Deadline yang dipilih adalah hari libur nasional → warning "Perhatian: deadline jatuh pada hari libur"
- [ERROR AC-049] Gagal simpan ke server → toast error + data form tetap ada, tombol submit aktif kembali

**[API] POST /api/spk**
```json
Request:
{
  "customer_id": "uuid | null",
  "customer_new": { "name": "string", "phone": "string" } | null,
  "items": [
    {
      "product_id": "uuid",
      "specs": { "width_cm": 300, "height_cm": 100 },
      "finishing": ["laminasi_doff"],
      "qty": 1,
      "unit_price": 85000,
      "discount": 0,
      "needs_design": true,
      "notes": "string"
    }
  ],
  "deadline": "2026-05-28T16:00:00+07:00",
  "priority": "normal | urgent | vip",
  "discount_spk": 0,
  "dp_amount": 100000,
  "dp_method": "cash | transfer | qris",
  "operator_notes": "string"
}

Response 201:
{
  "spk_id": "uuid",
  "spk_number": "SPK-SBY-20260525-0042",
  "tracking_token": "abc123def456"
}
```

#### M04.2 SPK Detail View

**User Story US-008:**
> Sebagai kasir atau owner, saya ingin melihat semua informasi SPK dalam satu halaman — status setiap item, timeline kejadian, dan tombol aksi yang kontekstual — sehingga saya bisa mengambil keputusan tanpa harus membuka halaman lain.

**Layout:**
```
Header: [Nomor SPK besar] [Badge Status] [Badge Prioritas] [Deadline]
        [Aksi cepat: Cetak Nota | Kirim WA | ⋯ Lainnya]

Section A: Daftar Item
  Per item: nama produk, spesifikasi, qty, harga, status badge, tombol aksi item

Section B: Timeline
  Chronological list: waktu | event | user yang melakukan

Section C: Keuangan
  Subtotal | Diskon | Total | DP | Sisa Tagihan | Status Bayar

Section D: File & Catatan
  File yang diupload | Catatan operator | Catatan customer
```

**Tombol aksi kontekstual (per item, muncul sesuai status item):**

| Status Item | Tombol | Siapa |
|---|---|---|
| `confirmed` | "Kirim ke Antrian Desain" | cashier, manager, owner |
| `confirmed` | "Langsung ke Antrian Cetak" (jika tidak perlu desain) | cashier, manager, owner |
| `design_queue` | "Mulai Kerjakan Desain" | designer, owner |
| `in_design` | "Selesai Desain → Kirim ke Produksi" | designer, owner |
| `in_design` | "Push Back (Revisi)" | cashier, manager, owner |
| `production_queue` | "Mulai Cetak" | operator, owner |
| `printing` | "Selesai Cetak → Finishing" | operator, owner |
| `finishing` | "Selesai → Siap Ambil" | operator, owner |
| Semua item `ready` | "Tandai Diambil" | cashier, manager, owner |
| Semua item `ready` | "Tandai Lunas" | cashier, manager, owner |

**Note:** "Tandai Diambil" dan "Tandai Lunas" adalah **dua tombol terpisah** — bisa dilakukan dalam urutan apapun. SPK `closed` hanya setelah keduanya dilakukan.

**Tombol di dropdown "⋯ Lainnya":**
- "Duplikat SPK" — buat SPK baru dengan data yang sama
- "Batalkan SPK" — outline style (bukan solid merah), wajib dialog konfirmasi + alasan

**Acceptance Criteria:**
- [MUST AC-050] Setiap item ditampilkan dengan status individual dan tombol aksinya
- [MUST AC-051] Push-back ke `in_design` wajib disertai catatan alasan (field mandatory di modal konfirmasi)
- [MUST AC-052] Tombol "Batalkan" wajib: outline/secondary style, di dropdown "⋯", ada dialog konfirmasi
- [MUST AC-053] "Tandai Diambil" dan "Tandai Lunas" adalah dua tombol terpisah
- [MUST AC-054] Timeline bertambah setiap ada perubahan status item (dengan nama user + timestamp)
- [MUST AC-055] Material usage per item ditampilkan: estimasi vs aktual vs deviasi (jika sudah ada input)
- [SHOULD AC-056] Perubahan status item trigger notif WA ke customer jika semua item → `ready`
- [EDGE AC-057] SPK dari customer yang sudah di-delete → tampilkan nama customer dengan label "(Dihapus)"

#### M04.3 Daftar SPK

**User Story US-009:**
> Sebagai owner, saya ingin melihat semua pesanan dengan filter yang fleksibel, sehingga saya bisa fokus ke yang paling penting (overdue, urgent) tanpa harus scroll semua data.

**Filter & Sort:**
- Search: nomor SPK, nama customer, nama produk (full-text)
- Filter status: semua status + shortcut "Overdue" (deadline < now AND status ≠ closed/cancelled)
- Filter tanggal: Hari Ini / Minggu Ini / Bulan Ini / Custom range
- Filter prioritas: Normal / Urgent / VIP
- Sort: Deadline (default) / Dibuat / Total / Status

**Table columns:** No. SPK | Customer | Items (count + nama pertama) | Total | Deadline | Status | Aksi

**Acceptance Criteria:**
- [MUST AC-058] Filter "Overdue" tersedia sebagai shortcut sejajar "Hari Ini" dan "Minggu Ini"
- [MUST AC-059] Row overdue: background merah muda (#FFF5F5), sort ke atas secara default
- [MUST AC-060] Pagination: 25 per halaman, dengan info "Menampilkan X–Y dari Z pesanan"
- [MUST AC-061] Filter state tersimpan di URL query params (bisa di-bookmark / share)
- [SHOULD AC-062] Export ke Excel/CSV untuk period yang dipilih

#### M04.4 SPK Item Lifecycle

**State machine (tanpa `design_review`):**

```
                    ┌─────────────────────────────────────┐
                    │                                     ↓
confirmed ──────→ design_queue ──→ in_design ──→ production_queue
    │                                  ↑ push-back (cashier/manager, wajib alasan)
    └──────────────────────────────→ production_queue (jika tidak butuh desain)
                                         │
                                         ↓
                                      printing ──→ finishing ──→ ready
```

**Status enum final untuk `order_items.status`:**
```
confirmed | design_queue | in_design | production_queue | printing | finishing | ready
```

**Status SPK (derived, level transaksi):**
```
active    → ada minimal 1 item belum ready
ready     → semua item ready
delivered → customer sudah ambil (tandai diambil)
closed    → sudah diambil DAN sudah lunas
cancelled → SPK dibatalkan (semua item di-cancel)
```

**Acceptance Criteria:**
- [MUST AC-063] Status `design_review` tidak boleh ada di sistem sama sekali
- [MUST AC-064] State machine di-enforce di backend — tidak bisa skip stage
- [MUST AC-065] Insentif operator dihitung saat item → `ready`
- [MUST AC-066] Saat semua item → `ready`: trigger notifikasi ke customer (WA) + notifikasi ke kurir (jika ada delivery assignment)
- [EDGE AC-067] Jika salah satu item di-cancel di tengah jalan → status SPK tetap dihitung dari item yang tersisa

**[DB] Tabel `order_items`:**
```sql
id              UUID PRIMARY KEY
order_id        UUID REFERENCES orders(id) ON DELETE CASCADE
product_id      UUID REFERENCES products(id)
specs           JSONB           -- {"width_cm": 300, "height_cm": 100}
finishing       TEXT[]
qty             INTEGER NOT NULL
unit_price      BIGINT NOT NULL  -- dalam sen/rupiah terkecil
discount        BIGINT DEFAULT 0
needs_design    BOOLEAN DEFAULT false
status          order_item_status NOT NULL DEFAULT 'confirmed'
assigned_designer_id  UUID REFERENCES users(id)
assigned_operator_id  UUID REFERENCES users(id)
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
updated_at      TIMESTAMPTZ DEFAULT NOW()
```

#### M04.5 Nota Pesanan

**User Story US-010:**
> Sebagai kasir, saya ingin memberikan nota pesanan kepada customer — cetak, kirim WA, atau download PDF — sehingga customer punya bukti resmi dan bisa cek status ordernya kapanpun.

**Konten nota:**
- Header: logo bisnis, nama bisnis, alamat, nomor WA (dari Settings → Profil Bisnis)
- Nomor SPK, tanggal dibuat, nama kasir
- Data customer: nama, nomor HP
- Tabel item: nama produk, spesifikasi, qty, harga satuan, total per item
- Subtotal | Diskon | Total | DP Dibayar | Sisa Tagihan
- Deadline + prioritas
- QR code → encode URL: `https://app.printeoo.com/track/{tracking_token}`
- Footer: syarat & ketentuan (dari Settings → Profil Bisnis, default: "Barang yang sudah diambil tidak dapat dikembalikan.")

**Output formats:**

| Format | Mekanisme | Trigger |
|---|---|---|
| Cetak | `window.print()` dari halaman nota print-ready | Tombol "Cetak Nota" |
| Kirim WA | `wa.me/{nomor}?text={pesan_prefilled}` | Tombol "Kirim WA" |
| Download PDF | Print dialog → Save as PDF (atau Puppeteer serverside) | Tombol "Download PDF" |

**Halaman nota** route `/nota/{spk_id}`:
- Tanpa sidebar, tanpa header navigasi
- Murni dokumen, print-ready
- CSS `@media print`: sembunyikan semua elemen non-dokumen

**Pesan WA pre-filled:**
```
Halo {nama_customer}, terima kasih sudah memesan di {nama_bisnis}!

📋 SPK: {nomor_spk}
📦 Pesanan: {list_item}
💰 Total: Rp {total}
📅 Estimasi selesai: {deadline}

Cek status pesanan Anda di sini:
👉 {tracking_url}

Hubungi kami jika ada pertanyaan: {wa_bisnis}
```

**Acceptance Criteria:**
- [MUST AC-068] Tombol "Cetak Nota", "Kirim WA", "Download PDF" ada di header detail SPK
- [MUST AC-069] Halaman nota tidak punya elemen navigasi Printeoo
- [MUST AC-070] QR code ter-generate dengan tracking_token (UUID, bukan nomor SPK langsung)
- [MUST AC-071] Kirim WA membuka WhatsApp (app atau web) dengan nomor customer dan pesan pre-filled
- [MUST AC-072] Format tanggal dan angka Indonesia di semua output nota
- [MUST AC-073] Modal sukses muncul setelah save order baru dengan 3 opsi tindak lanjut

#### M04.6 Halaman Tracking Publik

**User Story US-011:**
> Sebagai customer, saya ingin scan QR di nota saya dan langsung lihat status pesanan di HP saya, tanpa perlu download aplikasi atau login.

**Route:** `/track/{tracking_token}` — **publik, tanpa auth, mobile-first**

**Yang DITAMPILKAN:**
- Nama bisnis + logo
- Nomor SPK
- 5 milestone disederhanakan dengan visual progress bar:
  ```
  ● Terkonfirmasi → ● Desain → ● Produksi → ● Finishing → ○ Siap Ambil
  ```
- Status aktif + waktu update terakhir
- Nama item yang dipesan (tanpa harga)
- Deadline
- Tombol "Hubungi via WA" → nomor WA bisnis

**Yang TIDAK DITAMPILKAN:**
- Harga, total, DP, sisa tagihan
- Nama operator/desainer
- Catatan internal
- Detail material atau batch

**Mapping status internal → milestone customer:**
```
confirmed / design_queue / in_design  →  "Desain"
production_queue / printing           →  "Produksi"
finishing                             →  "Finishing"
ready / delivered                     →  "Siap Ambil"
closed                                →  "Selesai"
cancelled                             →  "Dibatalkan"
```

**Acceptance Criteria:**
- [MUST AC-074] Route bisa diakses tanpa login, tanpa cookie
- [MUST AC-075] Menggunakan `tracking_token` UUID, bukan nomor SPK sequential (cegah enumerasi)
- [MUST AC-076] Milestone progress bar visual dengan state aktif jelas
- [MUST AC-077] Tidak menampilkan harga atau informasi internal apapun
- [MUST AC-078] Mobile-first layout, readable di layar 320px ke atas
- [MUST AC-079] Tombol WA membuka WhatsApp ke nomor bisnis (bukan nomor personal user)
- [EDGE AC-080] Token tidak valid / SPK tidak ditemukan → halaman 404 yang friendly dengan link ke halaman utama bisnis

---

### M05 — Production Board

#### M05.1 Kanban Board

**User Story US-012:**
> Sebagai operator atau owner, saya ingin melihat semua item produksi dalam bentuk kanban board, sehingga saya bisa langsung tahu apa yang harus dikerjakan berikutnya tanpa perlu bertanya ke siapa-siapa.

**Kolom final (6 kolom):**
```
Antrian Desain | Sedang Desain | Antrian Cetak | Sedang Cetak | Finishing | Siap Ambil
```

**Card per item berisi:**
- Nomor SPK (kecil, muted)
- Nama produk (bold)
- Spesifikasi singkat (ukuran atau qty)
- Nama customer
- Deadline: relative time ("Hari ini 14:00", "Besok", "3 hari lagi") + warna merah jika overdue
- Badge prioritas jika Urgent/VIP
- Avatar inisial operator assigned (lingkaran kecil)

**Card visual states:**
- Normal: card putih, border abu
- Urgent: border kiri oranye 3px
- VIP: border kiri ungu 3px
- Overdue: border kiri merah 3px + background merah sangat muda

**Role-based column visibility:**
- `designer`: Antrian Desain, Sedang Desain
- `operator`: Antrian Cetak, Sedang Cetak, Finishing, Siap Ambil
- `owner` / `branch_manager`: semua 6 kolom
- `cashier`: read-only, semua 6 kolom (tidak ada tombol update)

**Modal detail (klik card):**
- Info lengkap item: produk, spesifikasi, customer, deadline, catatan operator
- Tombol "Update Status →" (advance ke stage berikutnya)
- Tombol "Lihat Detail SPK"
- Input pemakaian material (shortcut ke M07 usage input)

**Acceptance Criteria:**
- [MUST AC-081] Board real-time: update dari operator lain tampil tanpa refresh (WebSocket)
- [MUST AC-082] Header setiap kolom punya badge counter (jumlah card)
- [MUST AC-083] Filter bar: Semua / Urgent / Overdue / Saya (card assigned ke user yang login)
- [MUST AC-084] Klik card → modal, bukan navigate ke halaman lain
- [MUST AC-085] Update status dari modal → card pindah ke kolom berikutnya dengan animasi
- [MUST AC-086] Kolom "Review Pelanggan" tidak boleh ada
- [SHOULD AC-087] Drag-and-drop card antar kolom sebagai shortcut update status
- [EDGE AC-088] Board dengan 100+ card → virtualized rendering (hanya render card yang visible)

---

### M06 — Production Display Mode (TV/Tablet)

**User Story US-013:**
> Sebagai operator di lantai produksi, saya ingin melihat layar besar yang menampilkan antrian cetak dan item yang sedang dikerjakan, sehingga saya tidak perlu bolak-balik ke komputer kasir untuk tahu urutan pekerjaan.

**Layout (full screen, dark mode):**
```
┌──────────────────────────────────────────────────────────┐
│  🏪 Titaniumprint Surabaya Pusat          🕐 14:32:05    │
├──────────────────┬───────────────────────┬───────────────┤
│  ANTRIAN CETAK   │   SEDANG DIKERJAKAN   │   FINISHING   │
│  (30%)           │   (40%)               │   (30%)       │
│                  │                       │               │
│  SPK-0041        │  ┌─────────────────┐  │  SPK-0039     │
│  Banner 3×1m     │  │ Banner 5×2m     │  │  Kartu Nama   │
│  Budi Santoso    │  │ PT Maju Jaya    │  │  500 pcs      │
│  ⚠️ Hari ini     │  │ ⏱️ 00:23:15     │  │               │
│                  │  │ 🔴 URGENT       │  │  SPK-0038     │
│  SPK-0040        │  └─────────────────┘  │  Stiker A3    │
│  Stiker A3       │                       │  100 pcs      │
│  Rina Dewi       │                       │               │
└──────────────────┴───────────────────────┴───────────────┘
│ 🔔 Pesanan baru: Spanduk 3×1m — deadline 16:00           │
└──────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [MUST AC-089] Full screen tanpa sidebar/header navigasi Printeoo
- [MUST AC-090] Jam real-time update setiap detik
- [MUST AC-091] Audio TTS saat SPK baru masuk: "Pesanan baru masuk: {nama produk}, deadline {jam}" (Web Speech API)
- [MUST AC-092] Overlay "Ketuk untuk aktifkan audio" saat pertama buka
- [MUST AC-093] Tombol mute/unmute pojok layar
- [MUST AC-094] PIN exit (default: "1234", konfigurasi dari Settings)
- [MUST AC-095] Tombol "⚡ Simulasi SPK Masuk" untuk demo/testing
- [SHOULD AC-096] Auto-rotate item "Sedang Dikerjakan" jika ada multiple (berganti setiap 10 detik)
- [EDGE AC-097] Koneksi putus → tampilkan indikator offline kecil, data terakhir tetap tampil

---

### M07 — Inventory & Gudang

#### M07.1 Daftar Bahan

**User Story US-014:**
> Sebagai staff gudang, saya ingin mendaftarkan jenis bahan sekali ke sistem, sehingga setiap kali bahan datang dari supplier saya tinggal catat penerimaan tanpa perlu daftar ulang.

**Konsep penting:**
> Daftar Bahan = registrasi **jenis** bahan. Stok dan harga masuk lewat Catat Penerimaan.
> Nama modul ini adalah "Daftar Bahan" (bukan "Master Bahan").

**Form Tambah Bahan (fields):**
- Nama Bahan* — contoh: "Flexi China 340gr"
- Kategori* — dropdown: Media Cetak | Kertas | Tinta | Finishing | Aksesoris | Lainnya
- Satuan* — dropdown: Roll / Rim / Liter / Ml / Pcs / Pack / Kg / Meter
- Stok Minimum — angka, alert jika stok di bawah ini

**Helper text di form:**
> "Daftarkan jenis bahan ke sistem. Stok dan harga beli dicatat di Inventaris → Catat Penerimaan setiap kali barang datang dari supplier."

**Empty state (tabel kosong):**
```
Belum ada bahan terdaftar.

Cara kerjanya:
1. Daftarkan jenis bahan di sini (nama, kategori, satuan)
2. Catat penerimaan di Inventaris setiap kali barang datang dari supplier
3. Stok dan harga terupdate dari setiap penerimaan

[+ Tambah Bahan Pertama]
```

**Tabel Daftar Bahan — perilaku per state:**
- Bahan belum pernah diterima (stok = 0): kolom Aksi = `[Catat Penerimaan Pertama →]`
- Bahan sudah pernah diterima: kolom Aksi = `[Detail]`
- Kolom Stok / Harga rata-rata: tampilkan `—` dengan tooltip jika belum ada penerimaan

**Inline create dari form lain:**
Dropdown "Pilih Bahan" di form BOM dan form Catat Penerimaan:
```
[ketik nama bahan yang tidak ada...]
───────────────────────────────────
Tidak ditemukan: "Vinyl Korea"
[+ Daftarkan "Vinyl Korea" sebagai bahan baru →]
```
Klik → mini-modal tambah bahan (Nama, Kategori, Satuan) → setelah simpan, dropdown otomatis terpilih ke bahan baru.

**Acceptance Criteria:**
- [MUST AC-098] Nama modul di seluruh UI: "Daftar Bahan" (bukan "Master Bahan")
- [MUST AC-099] Form tidak punya field Harga Beli
- [MUST AC-100] Field Stok Minimum ada di form
- [MUST AC-101] Empty state 3-langkah sesuai spec di atas
- [MUST AC-102] Bahan tanpa stok menampilkan CTA "Catat Penerimaan Pertama"
- [MUST AC-103] Inline create berfungsi di dropdown BOM dan Catat Penerimaan
- [EDGE AC-104] Hapus bahan yang sudah punya riwayat penerimaan → soft delete, data historis tetap ada

**[DB] Tabel `inventory_items` (Daftar Bahan):**
```sql
id              UUID PRIMARY KEY
tenant_id       UUID REFERENCES tenants(id)
branch_id       UUID REFERENCES branches(id)
name            VARCHAR(255) NOT NULL
category        ENUM('media_cetak','kertas','tinta','finishing','aksesoris','lainnya')
unit            VARCHAR(50) NOT NULL
min_stock       DECIMAL(10,3) DEFAULT 0
current_stock   DECIMAL(10,3) DEFAULT 0  -- derived dari transactions, atau cached
deleted_at      TIMESTAMPTZ  -- soft delete
created_at      TIMESTAMPTZ DEFAULT NOW()
```

#### M07.2 Catat Penerimaan (Incoming)

**User Story US-015:**
> Sebagai staff gudang, saya ingin mencatat setiap bahan yang datang dari supplier lengkap dengan spesifikasi fisiknya, sehingga sistem bisa menghitung estimasi material secara akurat di setiap order.

**Form Catat Penerimaan:**
- Pilih bahan* (dengan inline create)
- Qty diterima* + satuan (auto-fill)
- Nomor batch* (auto-generate: `BATCH-{YYYYMMDD}-{3digit}`, atau input manual)
- Supplier* (autocomplete dari riwayat)
- Harga beli per satuan (Rp)*
- Tanggal terima (default: hari ini)
- Catatan (opsional)

**Section Spesifikasi Fisik Bahan (opsional, direkomendasikan):**
Muncul setelah bahan dipilih, field berbeda per kategori:

```
Kategori: Media Cetak / Stiker / Finishing (satuan: roll)
  → Panjang Roll* (meter)    contoh: 50
  → Lebar Roll* (meter)      contoh: 1.52
  → Ketebalan (mm, opsional) contoh: 0.8
  → Preview: "Luas 1 roll = 50 × 1.52 = 76 m² → 0,0132 roll per m²"

Kategori: Kertas (satuan: rim)
  → Isi per Rim* (lembar)    contoh: 500
  → Ukuran Kertas            dropdown: A4 / A3 / F4 / Custom

Kategori: Tinta (satuan: liter/ml)
  → Volume per Kemasan (ml)  contoh: 1000
  → Jenis Tinta              contoh: Pigment, Dye, Eco-Solvent

Kategori: Aksesoris (satuan: pcs/pack)
  → Isi per Pack (pcs)       contoh: 100
```

**Penyimpanan:** Spesifikasi fisik disimpan di level **batch** (bukan di master bahan), karena supplier berbeda bisa punya spesifikasi berbeda.

**Acceptance Criteria:**
- [MUST AC-105] Section Spesifikasi Fisik ada di form Catat Penerimaan
- [MUST AC-106] Field spesifikasi menyesuaikan kategori bahan yang dipilih
- [MUST AC-107] Preview kalkulasi otomatis muncul saat user input panjang × lebar roll
- [MUST AC-108] Spesifikasi tersimpan di level batch, bukan di level item
- [MUST AC-109] Setelah submit: stok `inventory_items.current_stock` bertambah
- [MUST AC-110] QR label yang di-generate mencantumkan spesifikasi fisik batch

**[DB] Tabel `material_batches`:**
```sql
id              UUID PRIMARY KEY
inventory_item_id UUID REFERENCES inventory_items(id)
batch_code      VARCHAR(50) UNIQUE NOT NULL
supplier        VARCHAR(255)
price_per_unit  BIGINT NOT NULL       -- harga beli per satuan (sen)
qty_received    DECIMAL(10,3) NOT NULL
qty_remaining   DECIMAL(10,3) NOT NULL
received_date   DATE NOT NULL
received_by     UUID REFERENCES users(id)
-- Spesifikasi fisik (nullable, set per kategori)
spec_length_m   DECIMAL(10,3)         -- roll: panjang
spec_width_m    DECIMAL(10,3)         -- roll: lebar
spec_thickness_mm DECIMAL(6,3)        -- roll: ketebalan
spec_sheets_per_rim INTEGER           -- kertas: isi per rim
spec_paper_size VARCHAR(20)           -- kertas: ukuran
spec_volume_ml  INTEGER               -- tinta: volume per kemasan
spec_ink_type   VARCHAR(100)          -- tinta: jenis
spec_pcs_per_pack INTEGER             -- aksesoris: isi per pack
spec_notes      TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

#### M07.3 Traceability Material (3 Layer)

**Konsep:**
```
Layer 1 — Estimasi (saat order dibuat):
  BOM × qty item × (1 + waste%) = estimasi kebutuhan material

Layer 2 — Usage aktual (saat produksi):
  Operator scan QR batch → input qty pakai + qty waste → tersimpan ke usageLog

Layer 3 — Rekonsiliasi (job costing):
  Estimasi vs aktual → deviasi → alert jika deviasi > threshold
  Cost per item = qty aktual × harga batch
```

**Acceptance Criteria:**
- [MUST AC-111] Estimasi BOM di-snapshot saat SPK dibuat (immutable — tidak berubah meski BOM di-edit)
- [MUST AC-112] Layer 2 input bisa via scan QR atau manual entry
- [MUST AC-113] Deviasi ditampilkan di SPK detail: "+15% dari estimasi"
- [SHOULD AC-114] Alert otomatis jika deviasi > 30% (konfigurasi dari Settings)

#### M07.4 Stok Opname

**User Story US-016:**
> Sebagai staff gudang, saya ingin melakukan stok opname dengan mencatat hitungan fisik setiap bahan, sehingga sistem bisa adjust stok sesuai kondisi nyata.

**Flow:**
```
Mulai Sesi Opname → Input Stok Fisik per Bahan → Review Selisih → Approve & Adjust
```

**Acceptance Criteria:**
- [MUST AC-115] Flow 4 langkah sesuai spesifikasi
- [MUST AC-116] Kolom "Selisih" auto-kalkulasi: hijau (0), merah (negatif), oranye (positif)
- [MUST AC-117] Alasan wajib diisi jika ada selisih sebelum bisa approve
- [MUST AC-118] Setelah approve: stok di-update, entry di `adjustment_log` dibuat
- [MUST AC-119] Riwayat sesi opname bisa dilihat kembali

#### M07.5 Purchase Order (PO)

**User Story US-017:**
> Sebagai staff gudang, saya ingin membuat PO ke supplier saat stok menipis, sehingga proses pembelian terdokumentasi dan owner bisa approve sebelum dikirim.

**Acceptance Criteria:**
- [MUST AC-120] Nomor PO auto-generate: `PO-{YYYYMMDD}-{3digit}`
- [MUST AC-121] Status PO: Draft → Dikirim → Partial → Diterima → Dibatalkan
- [MUST AC-122] Warehouse hanya bisa submit PO, tidak bisa approve
- [MUST AC-123] Alert otomatis di tabel Daftar Bahan: tombol "Buat PO" di baris bahan yang stok < minimum
- [MUST AC-124] Dari detail PO yang sudah Dikirim: tombol "Catat Penerimaan" → pre-fill form incoming
- [MUST AC-125] Warehouse tidak bisa melihat kolom harga di PO

#### M07.6 QR Label & Scan

**User Story US-018:**
> Sebagai operator, saya ingin scan QR di label bahan untuk langsung input usage ke SPK, sehingga tidak perlu ketik manual nama bahan dan batch ID.

**Generate QR:**
- Di tabel inventory: ikon QR per baris → modal label
- Data yang di-encode: `printeoo://scan?batch={batch_code}&item={item_name}&tenant={tenant_id}`
- Preview label: 50×30mm, tampilkan nama bahan, batch code, tanggal masuk, stok, spesifikasi fisik
- Tombol "Cetak Label" → `window.print()` hanya area label

**Scan QR (entry point di SPK detail & order new):**
- Tombol "📷 Scan QR Bahan" → buka modal kamera (getUserMedia API)
- Fallback: input manual batch code
- Saat ter-detect → auto-fill nama bahan + batch ID di form usage

**Acceptance Criteria:**
- [MUST AC-126] QR label mencantumkan spesifikasi fisik batch
- [MUST AC-127] Fallback input manual jika kamera tidak tersedia
- [MUST AC-128] Tombol "Simulasi Scan" untuk demo tanpa kamera fisik
- [SHOULD AC-129] QR code dibuat pure browser (tidak butuh server) menggunakan library qrcode.js

---

### M08 — Job Costing per Item

**User Story US-019:**
> Sebagai owner, saya ingin tahu berapa profit sebenarnya dari setiap item di setiap SPK — setelah dikurangi material, upah desain, dan upah cetak — sehingga saya bisa tahu produk mana yang paling profitable.

**Komponen cost per item:**
```
Revenue item        = qty × harga jual
- Material cost     = Σ (qty_aktual × harga_batch per unit)
- Labor cost desain = durasi desain × rate desainer (jam)
- Labor cost cetak  = qty × rate operator (per pcs) ATAU flat per SPK
- Labor cost pasang = rate tukang harian × durasi (untuk produk pemasangan)
─────────────────────────────────────────────────────
= Gross Profit per item
```

**Acceptance Criteria:**
- [MUST AC-130] Job cost dihitung per item, bukan per SPK keseluruhan
- [MUST AC-131] Material cost menggunakan harga dari batch yang di-scan/input (bukan harga average)
- [MUST AC-132] Jika material belum di-input: tampilkan estimasi dari BOM + harga batch terbaru
- [MUST AC-133] Deviasi material (estimasi vs aktual) ditampilkan dengan highlight jika > 20%
- [SHOULD AC-134] Dashboard owner: top 5 produk berdasarkan gross margin (bukan revenue)
- [EDGE AC-135] Item yang di-cancel: job cost di-mark cancelled, tidak masuk laporan profit

---

### M09 — POS & Kasir

**User Story US-020:**
> Sebagai kasir, saya ingin memproses pembayaran SPK dengan cepat — cash, transfer, atau QRIS — dan langsung cetak struk, sehingga antrian tidak menumpuk.

**Payment flow:**
```
Pilih SPK (status: ready atau delivered) → Input jumlah bayar → Pilih metode 
→ Kalkulasi kembalian → Konfirmasi → Update status SPK → Generate receipt
```

**Acceptance Criteria:**
- [MUST AC-136] Tampilkan sisa tagihan yang harus dibayar (total - DP)
- [MUST AC-137] Kalkulasi kembalian realtime untuk pembayaran cash
- [MUST AC-138] Metode: Cash / Transfer (tampilkan nomor rekening bisnis) / QRIS (tampilkan QR static)
- [MUST AC-139] Setelah konfirmasi: status pembayaran SPK → `lunas`, update `closed` jika sudah diambil
- [MUST AC-140] Receipt: bisa cetak thermal (80mm) atau A4
- [SHOULD AC-141] Tampilkan history bayar jika customer pernah bayar sebagian (cicilan DP)
- [EDGE AC-142] Input jumlah bayar kurang dari sisa tagihan → warning "Pembayaran kurang Rp X.XXX. Konfirmasi pembayaran parsial?"

---

### M10 — HR & Payroll

#### M10.1 Data Karyawan

**User Story US-021:**
> Sebagai HR admin, saya ingin kelola data lengkap setiap karyawan — kontrak, absensi, dan riwayat insentif — dalam satu tempat, sehingga proses payroll tidak butuh Excel lagi.

**Data karyawan:**
- Identitas: nama, NIK, alamat, nomor HP, foto
- Kontrak: tipe (bulanan/harian/freelance/borongan), tanggal mulai, gaji pokok
- Posisi + cabang + shift
- Rekening bank (untuk transfer gaji)
- Status: aktif / non-aktif / cuti

**Acceptance Criteria:**
- [MUST AC-143] Tipe kontrak menentukan cara hitung payroll: bulanan (flat), harian (× hari kerja), freelance (manual/borongan)
- [MUST AC-144] Riwayat perubahan kontrak tersimpan (tidak overwrite)
- [SHOULD AC-145] Import data karyawan dari Excel template

#### M10.2 Absensi

**Acceptance Criteria:**
- [MUST AC-146] Input absensi: manual oleh HR atau self-service oleh karyawan via Portal Karyawan
- [MUST AC-147] Status per hari: Hadir / Izin / Sakit / Alpha / Cuti
- [MUST AC-148] Jam masuk dan jam keluar bisa diinput (untuk lembur)
- [SHOULD AC-149] Laporan rekap absensi bulanan per karyawan

#### M10.9 Sistem Insentif per Item

**User Story US-022:**
> Sebagai operator, saya ingin mendapatkan insentif otomatis setiap item yang saya selesaikan, sehingga saya termotivasi untuk mengerjakan lebih banyak dengan kualitas yang baik.

**Konsep insentif:**
```
Konfigurasi (oleh owner/hr_admin):
  Per produk/kategori: Rp X per pcs, atau % dari harga jual

Kalkulasi (otomatis saat item → ready):
  insentif = qty × rate (atau % × harga_jual)

Akumulasi:
  Setiap akhir bulan → insentif total dikompilasi ke slip gaji
```

**Mini-toast saat item selesai:**
```
+Rp 2.500 insentif — Banner 3×1m ✅
```

**Acceptance Criteria:**
- [MUST AC-150] Konfigurasi insentif bisa diset per produk atau per kategori produk
- [MUST AC-151] Kalkulasi otomatis saat item status → `ready`
- [MUST AC-152] Mini-toast "+Rp X insentif" muncul ke operator yang assigned, 3 detik
- [MUST AC-153] Insentif bisa dilihat karyawan di Portal Karyawan (breakdown per item)
- [MUST AC-154] Insentif masuk ke komponen payroll bulan berjalan
- [EDGE AC-155] Item di-cancel setelah status `ready` → insentif di-revoke, dicatat di log

#### M10.10 Portal Karyawan

**User Story US-023:**
> Sebagai karyawan, saya ingin melihat ringkasan gaji, insentif, dan absensi saya sendiri tanpa harus tanya ke HR, sehingga saya lebih transparan tentang penghasilan saya.

**Content Portal Karyawan (slide-over panel, semua role kecuali display):**
- Ringkasan Bulan Ini: jam kerja, total insentif terkumpul, estimasi gaji
- Insentif Saya: tabel per item (tanggal, SPK, item, insentif) + total
- Informasi Saya: data pribadi, info kontrak, rekening
- Notifikasi & Teguran: history notif dan teguran yang diterima

**Acceptance Criteria:**
- [MUST AC-156] Accessible via ikon user di header untuk semua role kecuali `display`
- [MUST AC-157] Karyawan hanya bisa lihat data miliknya sendiri
- [MUST AC-158] Owner bisa lihat portal karyawan siapapun dari halaman Karyawan

---

### M11 — Akuntansi & Laporan Keuangan

**User Story US-024:**
> Sebagai owner atau akuntan, saya ingin laporan keuangan yang ter-update otomatis dari semua transaksi SPK, payroll, dan inventory, sehingga saya tidak perlu input manual ke software akuntansi terpisah.

**Modul ini tersedia mulai tier Business.**

**Reports yang tersedia:**
- P&L (Laba Rugi) — per bulan, per kuartal, per tahun
- Arus Kas — per periode
- Laporan Pajak PPN — per masa pajak
- Job Costing Summary — profitabilitas per produk/kategori

**Journal entries otomatis dari:**
- SPK dibuat → Piutang / Pendapatan
- Pembayaran diterima → Kas masuk
- Penerimaan material → Persediaan
- Payroll diproses → Beban gaji
- Material usage → COGS

**Acceptance Criteria:**
- [MUST AC-159] Semua jurnal otomatis berdasarkan transaksi, tidak ada input manual yang wajib
- [SHOULD AC-160] Export laporan ke Excel dan PDF
- [COULD AC-161] Integrasi dengan Accurate Online atau Jurnal.id

---

### M12 — Web-to-Print API

**User Story US-025:**
> Sebagai developer di sisi customer (e-commerce atau website print shop online), saya ingin menggunakan API Printeoo untuk otomatis buat SPK dari platform saya, sehingga tidak perlu input manual.

**Tersedia mulai tier Pro.**

**Acceptance Criteria:**
- [MUST AC-162] API key per tenant, bisa di-generate dan di-revoke dari Settings
- [MUST AC-163] POST `/api/v1/orders` menerima format yang sama dengan M04.1
- [MUST AC-164] Webhook ke URL tenant: event `order.created`, `item.status_changed`, `order.ready`
- [MUST AC-165] Rate limit: 100 req/menit per API key
- [SHOULD AC-166] Sandbox environment untuk testing

---

### M13 — Owner Dashboard

**User Story US-026:**
> Sebagai owner, saya ingin melihat kondisi bisnis hari ini dalam satu pandangan — revenue, order, produksi, stok — tanpa harus buka banyak halaman.

**Dashboard sections:**

**Baris 1 — Metric Cards (4 card):**
- Pesanan Hari Ini: count + trend % vs kemarin
- Revenue Hari Ini: Rp + trend %
- Selesai Hari Ini: count + completion rate %
- Perlu Perhatian: count SPK overdue (merah jika > 0)

**Baris 2 — Chart:**
- Revenue 7 hari (bar chart SVG)
- Toggle: Revenue / Volume Order / Gross Margin

**Baris 3 — Grid 2 kolom:**
- Kiri: Top 5 Produk Bulan Ini (nama, revenue, % share, mini bar)
- Kanan: Status Produksi Sekarang (count per stage)

**Alert box (conditional):**
- Merah jika ada SPK overdue: "X pesanan melewati deadline. Lihat →"
- Oranye jika ada bahan stok menipis: "X bahan hampir habis. Cek Inventaris →"

**Acceptance Criteria:**
- [MUST AC-167] Alert overdue hanya muncul jika ada SPK overdue
- [MUST AC-168] Klik metric card → navigate ke halaman terkait dengan filter yang sudah aktif
- [MUST AC-169] Semua angka real-time dari database (bukan hardcoded)
- [SHOULD AC-170] Dashboard owner bisa pilih range tanggal untuk semua metric

---

### M14 — Notification Center

**User Story US-027:**
> Sebagai owner atau kasir, saya ingin mendapat notifikasi penting yang relevan dengan peran saya, tanpa dibanjiri notifikasi yang tidak relevan.

**Notifikasi per role:**

| Event | owner | branch_mgr | cashier | designer | operator | warehouse | courier |
|---|---|---|---|---|---|---|---|
| SPK baru masuk | ✓ | ✓ | — | — | — | — | — |
| Item masuk antrian desain | — | — | — | ✓ | — | — | — |
| Item masuk antrian cetak | ✓ | ✓ | — | — | ✓ | — | — |
| Semua item → ready | ✓ | ✓ | ✓ | — | — | — | ✓ |
| Stok bahan di bawah minimum | ✓ | ✓ | — | — | — | ✓ | — |
| PO perlu diapprove | ✓ | ✓ | — | — | — | — | — |
| SPK overdue | ✓ | ✓ | ✓ | — | — | — | — |
| Insentif baru | — | — | — | ✓ | ✓ | ✓ | ✓ |

**Channels:**
- In-app (bell icon di header)
- WA (jika nomor HP terdaftar dan user opt-in)
- Email (untuk notif penting: SPK selesai ke customer, payroll diproses)

**Acceptance Criteria:**
- [MUST AC-171] Bell icon menampilkan badge count notifikasi yang belum dibaca
- [MUST AC-172] Klik notifikasi → navigate ke resource yang relevan
- [MUST AC-173] Mark all as read
- [SHOULD AC-174] User bisa konfigurasi channel per event dari Settings

---

### M15 — Product & Pricing Catalog

#### M15.1 Katalog Produk

**User Story US-028:**
> Sebagai owner, saya ingin mendefinisikan semua produk yang dijual beserta harganya satu kali, sehingga kasir tinggal pilih produk dan harga auto-fill tanpa perlu ingat-ingat.

**Tipe produk dan pricing:**
- `large_format`: harga per m² (banner, spanduk, backdrop)
- `flat`: harga per pcs (kartu nama, mug, kaos)
- `tiered`: harga berubah per qty range (brosur: 100 pcs = Rp X, 500 pcs = Rp Y)

**Acceptance Criteria:**
- [MUST AC-175] Setiap produk punya tipe pricing yang menentukan field di form order
- [MUST AC-176] Produk bisa dinonaktifkan (hidden dari form order) tanpa dihapus
- [SHOULD AC-177] Import katalog dari Excel template

#### M15.6 Bill of Materials (BOM)

**User Story US-029:**
> Sebagai owner, saya ingin mendefinisikan BOM per produk — bahan apa saja yang dibutuhkan, berapa qty per m² atau per pcs, plus waste factor — sehingga estimasi material otomatis di setiap order.

**Fields per BOM entry:**
- Produk (relasi ke katalog)
- Bahan (relasi ke Daftar Bahan — dengan inline create)
- Formula qty:
  - `flat`: X unit per order (contoh: 1 roll per banner)
  - `per_m2`: X unit per m² (contoh: 0.014 roll per m²)
  - `per_qty`: X unit per pcs ordered
- Waste factor (%) — **wajib ada, default: 5%**
- Satuan output

**Preview kalkulasi (interaktif di form BOM):**
- Input dimensi atau qty → estimasi material update realtime
- Breakdown formula: `formula × qty × (1 + waste%) = total estimasi`
- Referensi spesifikasi batch: "Menggunakan spek batch terbaru: 50m × 1.52m = 76 m²/roll"
- Jika belum ada batch dengan spesifikasi: warning + link "Catat Penerimaan →"

**Acceptance Criteria:**
- [MUST AC-178] BOM bisa punya multiple bahan per produk
- [MUST AC-179] Field waste wajib ada, tidak boleh kosong (default 5%)
- [MUST AC-180] Preview kalkulasi realtime dengan breakdown formula
- [MUST AC-181] Inline create bahan baru dari dropdown BOM
- [MUST AC-182] Warning di form order jika produk tidak punya BOM

---

### M17 — CRM Pelanggan

**User Story US-030:**
> Sebagai kasir atau owner, saya ingin lihat riwayat lengkap pesanan setiap customer, sehingga saya bisa kasih service lebih personal dan tahu pelanggan VIP saya siapa.

**Data per customer:**
- Nama, nomor HP, email (opsional), tipe (individu/perusahaan/instansi)
- Total SPK, total revenue, rata-rata nilai SPK
- SPK aktif (yang belum selesai)
- Riwayat SPK (semua, dengan filter status)
- Catatan internal (tidak terlihat customer)

**Acceptance Criteria:**
- [MUST AC-183] Search customer by nama atau nomor HP
- [MUST AC-184] Customer page: ringkasan + tabel riwayat SPK
- [SHOULD AC-185] Label otomatis: "VIP" jika total revenue > threshold (konfigurasi)
- [COULD AC-186] Export data customer ke Excel

---

### M19 — Manajemen Pengiriman

#### M19.1 Delivery Assignment

**User Story US-031:**
> Sebagai kasir atau owner, saya ingin assign SPK yang sudah siap ke kurir, sehingga pengiriman terdokumentasi dan saya bisa pantau statusnya.

**Flow:**
```
Semua item SPK → ready → Trigger notif ke kasir/owner → Assign kurir (manual atau auto)
→ Kurir terima assignment di app → Berangkat → Upload foto bukti kirim → Selesai
```

**Acceptance Criteria:**
- [MUST AC-187] Assign kurir: dari detail SPK atau dari halaman Pengiriman (tabel semua SPK ready)
- [MUST AC-188] Kurir terima notif (in-app + WA) saat di-assign
- [MUST AC-189] Kurir update status: "Dalam Perjalanan" → "Terkirim" / "Gagal Kirim"
- [MUST AC-190] Upload foto bukti saat "Terkirim" (opsional tapi disarankan)
- [MUST AC-191] Jika gagal kirim: wajib isi alasan, SPK kembali ke status "Siap Ambil"
- [SHOULD AC-192] Kurir micro-interface: hanya tampil delivery queue milik sendiri, tanpa sidebar penuh

#### M19.2 Delivery Queue (View Kasir)

**Acceptance Criteria:**
- [MUST AC-193] Tabel semua SPK status `ready` yang belum di-assign kurir
- [MUST AC-194] Filter: Belum Assign / Dalam Perjalanan / Selesai
- [MUST AC-195] Klik "Assign Kurir" → pilih kurir dari dropdown (list karyawan role `courier`)

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### 7.1 Performance

| Metric | Target |
|---|---|
| API response time (p95) | < 300ms |
| API response time (p99) | < 1s |
| Database query (p95) | < 100ms |
| Halaman tracking publik LCP | < 1.5s |
| Production board initial load | < 2s |
| Uptime (monthly) | 99.5% |

### 7.2 Scalability

- Arsitektur: stateless API workers, horizontal scaling
- Database: connection pooling (PgBouncer), read replicas untuk laporan berat
- Target awal: 1.000 tenant, 50.000 SPK/bulan
- Target 1 tahun: 10.000 tenant, 1 juta SPK/bulan

### 7.3 Security

- HTTPS-only, HSTS, CSP header
- JWT dengan RS256, refresh token rotation
- Row-Level Security PostgreSQL untuk tenant isolation
- Rate limiting per user dan per IP
- File upload: validasi MIME type + size limit (20MB per file, 100MB per SPK)
- PII encryption at rest: nomor HP, NIK karyawan, nomor rekening
- Audit log: semua aksi destructive dengan user, timestamp, IP, sebelum/sesudah

### 7.4 Accessibility

- WCAG 2.1 AA untuk semua halaman yang diakses karyawan
- Keyboard navigable untuk form utama
- Screen reader compatible untuk tabel data
- Minimum contrast 4.5:1 (teks normal), 3:1 (teks besar)

### 7.5 Observability

- Structured logging (JSON) dengan request_id, tenant_id, user_id
- Error tracking: Sentry
- Uptime monitoring: setiap 1 menit
- Alerting: email + Slack jika error rate > 1% atau p99 > 2s

---

## 8. DATA MODEL — KEY ENTITIES

### 8.1 Entity Relationship Summary

```
TENANT
  ├── has many: Branch, User, Subscription
  └── settings: JSONB (logo, wa_number, incentive_config, dll)

BRANCH
  ├── belongs to: Tenant
  └── has many: Order, InventoryItem, User, Machine

USER
  ├── belongs to: Tenant + Branch (untuk non-owner)
  ├── has one: Role
  └── has one: EmployeeProfile (semua role kecuali display)

ORDER (SPK)
  ├── belongs to: Branch + Customer
  ├── has many: OrderItem
  ├── has many: StatusHistory (level SPK: delivered, closed)
  ├── has many: File
  ├── has one: Nota / Invoice
  └── has one: DeliveryAssignment

ORDER_ITEM (unit produksi)
  ├── belongs to: Order + Product
  ├── has many: StatusHistory (lifecycle per item)
  ├── has many: MaterialUsage
  ├── has one: BOMEstimate (snapshot immutable saat order dibuat)
  ├── has one: JobCostItem
  └── has many: IncentiveRecord

CUSTOMER
  ├── belongs to: Tenant
  └── has many: Order

PRODUCT
  ├── belongs to: Tenant
  ├── has many: BOMEntry
  └── pricing_type: large_format | flat | tiered

BOM_ENTRY
  ├── belongs to: Product + InventoryItem
  ├── formula_type: flat | per_m2 | per_qty
  ├── qty_formula: DECIMAL
  └── waste_pct: DECIMAL (DEFAULT 5)

INVENTORY_ITEM (Daftar Bahan)
  ├── belongs to: Tenant + Branch
  ├── fields: name, category, unit, min_stock, current_stock
  └── has many: MaterialBatch

MATERIAL_BATCH
  ├── belongs to: InventoryItem
  ├── fields: batch_code, supplier, price_per_unit, qty_received, qty_remaining
  └── spec fields: length_m, width_m, thickness_mm, sheets_per_rim, volume_ml, dll

MATERIAL_USAGE
  ├── belongs to: OrderItem + MaterialBatch
  └── fields: qty_used, qty_waste, waste_category, operator_id

INCENTIVE_CONFIG
  ├── belongs to: Tenant + Product (atau category)
  └── fields: rate_type (per_pcs|pct_revenue), rate_value

INCENTIVE_RECORD
  ├── belongs to: OrderItem + User (operator)
  └── fields: amount, calculated_at, status (pending|confirmed|paid)

EMPLOYEE_PROFILE
  ├── belongs to: User
  └── fields: nik, address, phone, contract_type, base_salary, bank_account

DELIVERY_ASSIGNMENT
  ├── belongs to: Order + User (courier)
  └── fields: status, pickup_time, delivery_time, proof_photo_url, fail_reason
```

### 8.2 Key Indexes

```sql
-- Performance-critical indexes
CREATE INDEX idx_orders_tenant_branch_status ON orders(tenant_id, branch_id, status);
CREATE INDEX idx_orders_deadline ON orders(deadline) WHERE status NOT IN ('closed','cancelled');
CREATE INDEX idx_order_items_status ON order_items(status, order_id);
CREATE INDEX idx_material_usage_order_item ON material_usage(order_item_id);
CREATE INDEX idx_incentive_records_user_month ON incentive_records(user_id, date_trunc('month', calculated_at));

-- Tracking publik (frequently accessed by QR scan)
CREATE INDEX idx_orders_tracking_token ON orders(tracking_token);
```

---

## 9. DEVELOPMENT PRIORITIES (Sprint Order)

### Sprint 1–2: Foundation
- Database schema lengkap (semua tabel di Section 8)
- M01: Auth, tenant registration, onboarding wizard
- M02: User management, role assignment, permission enforcement middleware
- Navigation shell: sidebar role-based, header, breadcrumb

### Sprint 3–4: Core Operations (Daily Driver)
- M04: SPK multi-item — full lifecycle tanpa `design_review`
- M04.5: Nota Pesanan (cetak, WA, PDF)
- M04.6: Halaman tracking publik `/track/{token}`
- M15: Product catalog + BOM (waste field wajib + preview kalkulasi)
- M07.1: Daftar Bahan (form disederhanakan + inline create)
- M09: POS kasir

### Sprint 5–6: Production Floor
- M05: Production board per item (6 kolom, real-time WebSocket)
- M06: Production display TV mode (dark, TTS, simulasi)
- M03: Queue system (kasir + layar display)

### Sprint 7–8: Intelligence & Traceability
- M07.2: Catat Penerimaan + spesifikasi fisik per batch
- M07.6: QR label generate + scan
- M07.3: Traceability Layer 1 + 2 + 3
- M07.4: Stok Opname
- M07.5: Purchase Order
- M08: Job Costing per item
- M13: Owner Dashboard (live data)

### Sprint 9–10: People & Money
- M10.1–M10.2: HR + Absensi
- M10.9: Sistem Insentif per item
- M10.10: Portal Karyawan
- M11: Akuntansi dasar (jurnal otomatis + P&L)
- M17: CRM Pelanggan
- M19: Modul Pengiriman + kurir micro-interface

### Sprint 11–12: Scale & Integration
- M12: Web-to-Print API + Webhook
- M11: Pajak PPN
- M01: Multi-branch (Business tier)
- M02: Custom role (Enterprise tier)
- Billing & subscription management
- White-label (Enterprise tier)

---

## 10. OPEN QUESTIONS & DECISION LOG

### ✅ RESOLVED

| # | Pertanyaan | Keputusan | Rationale |
|---|---|---|---|
| R1 | SPK multi-item atau single? | Multi-item | Item = unit produksi, SPK = unit transaksi. Satu customer sering order banyak produk sekaligus |
| R2 | Traceability material — level? | 3 Layer (estimasi, aktual, rekonsiliasi) | Pemilik butuh tahu deviasi bahan untuk kontrol waste |
| R3 | Role kurir — terpisah? | Ya, role `courier` dengan micro-interface | Kurir tidak perlu akses ke SPK, customer, atau financial |
| R4 | "Review Pelanggan" di kanban? | Dihapus. Approval desain via WA di luar sistem | Menambah kompleksitas tanpa nilai — print shop approval terjadi di WA, bukan sistem |
| R5 | Spesifikasi fisik bahan di mana? | Di level batch saat Catat Penerimaan | Supplier berbeda bisa punya spesifikasi berbeda untuk bahan yang sama |
| R6 | Redundansi form Daftar Bahan vs Catat Penerimaan? | Daftar Bahan = jenis bahan saja (tanpa harga/stok). Catat Penerimaan = input stok fisik | Separation of concerns yang jelas |
| R7 | Nama "Master Bahan"? | Di-rename "Daftar Bahan" | "Master" terasa teknikal dan asing untuk user non-teknis |
| R8 | `design_review` di item status? | Dihapus | Approval desain sudah terjadi di WA, bukan sistem. Push-back ke `in_design` dengan catatan sebagai pengganti |

### ❓ MASIH OPEN

| # | Pertanyaan | Owner | Target Resolved |
|---|---|---|---|
| 1 | Harga final per tier | Ahmad | Sprint 1 |
| 2 | WA API provider: Fonnte vs WA Business Cloud API? | Ahmad | Sprint 3 (sebelum M04.5) |
| 3 | Hosting provider: Railway vs Render vs VPS? | Ahmad (+ Robbi) | Sprint 1 |
| 4 | Domain final: `printeoo.com` dan `printeoo.id` secured? | Ahmad | Sebelum launch |
| 5 | Offline strategy: full offline (IndexedDB sync) atau tolerant only? | Ahmad + Robbi | Sprint 2 |
| 6 | Printsoft migration tool: perlu dibangun? | Ahmad | Sprint 9 |
| 7 | Prefix antrian (A/B/C): definisi bisnis A = apa, B = apa? | Ahmad (user research) | Sprint 5 |
| 8 | Assign kurir: otomatis (round-robin/proximity) atau manual? | Ahmad | Sprint 9 |
| 9 | Insentif kurir: per SPK atau per km/pengiriman? | Ahmad | Sprint 9 |
| 10 | Payment gateway untuk subscription: Midtrans vs Xendit? | Ahmad | Sprint 11 |

---

## APPENDIX A — GLOSSARY

| Term | Definisi |
|---|---|
| SPK | Surat Perintah Kerja — dokumen order di Printeoo |
| Item | Satu baris produk dalam SPK (unit produksi) |
| Batch | Satu penerimaan bahan dari supplier dengan harga dan spesifikasi tertentu |
| BOM | Bill of Materials — daftar bahan yang dibutuhkan untuk membuat satu produk |
| Job Costing | Kalkulasi biaya dan profit per item/SPK |
| Traceability | Kemampuan trace setiap bahan dari penerimaan hingga pemakaian di SPK tertentu |
| Insentif | Bonus per-item yang di-earn operator saat menyelesaikan item produksi |
| Tracking Token | UUID unik per SPK untuk URL tracking publik (bukan nomor SPK sequential) |
| Large Format | Produk cetak yang dihitung per m² (banner, spanduk, backdrop, dll) |
| WIB | Waktu Indonesia Barat (UTC+7) — timezone default Printeoo |

---

## APPENDIX B — ACCEPTANCE CRITERIA INDEX

Semua AC dalam dokumen ini bernomor `AC-001` hingga `AC-195`. Implementasi dianggap **done** untuk sebuah modul jika:
1. Semua `[MUST]` AC untuk modul tersebut pass
2. Tidak ada console error atau exception yang tidak di-handle
3. Semua `[EDGE]` AC ditest dan hasilnya sesuai spec
4. Code review diapprove oleh minimal 1 developer lain

---

*Dokumen ini adalah living document. Setiap perubahan requirement harus dicatat di CHANGELOG sebelum diimplementasikan. Versi ini: 2.0 — 2026-05-25.*
