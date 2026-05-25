# STATE.md — Printeoo Prototype Progress
**Last Updated:** 2026-05-25 (v1.1 update TASK-102)
**Status Keseluruhan:** 🟡 Update v1.1 berjalan  

> Update file ini setiap kali memulai atau menyelesaikan task.  
> Ini adalah memori kerja AI antar sesi. Jangan hapus entry yang sudah selesai.

---

## RINGKASAN PROGRESS

| Fase | Task | Selesai | Progress |
|---|---|---|---|
| 0 — Setup | 3 | 3 | 100% |
| 1 — Foundation | 4 | 4 | 100% |
| 2 — Core Pages | 6 | 6 | 100% |
| 3 — Display & Audio | 2 | 2 | 100% |
| 4 — Supporting Pages (Preview) | 3 | 3 | 100% |
| 5 — Polish & Integration | 4 | 4 | 100% |
| 6 — Inventory Fully Functional | 7 | 7 | 100% |
| 7 — Manajemen Pelanggan | 4 | 4 | 100% |
| 8 â€” v1.1 Update | 10 | 2 | 20% |
| **Total** | **43** | **35** | **81%** |

---

## LOCAL DEV

Server lokal:
http://127.0.0.1:5500

URL prototype:
http://127.0.0.1:5500/prototype/index.html

---

## TASK LIST

---

### FASE 0 — SETUP STRUKTUR

#### TASK-001 — Buat struktur folder dan file kosong
**Status:** `[x]` Selesai  
**Estimasi:** 10 menit  
**Deskripsi:**  
Buat semua file dan folder sesuai struktur di CLAUDE.md. File boleh kosong dulu, yang penting struktur ada.

**Checklist:**
- [x] Buat folder `/prototype`
- [x] Buat folder `/prototype/pages`
- [x] Buat file `/prototype/index.html` (boilerplate saja)
- [x] Buat file `/prototype/style.css` (kosong + komentar section)
- [x] Buat file `/prototype/app.js` (kosong + komentar section)
- [x] Buat file `/prototype/data.js` (kosong + komentar section)
- [x] Buat semua file di `/prototype/pages/` (13 file html, boleh kosong)

**Output yang diharapkan:** Struktur folder lengkap, semua file ada meski kosong.  
**Progress Terakhir:** 2026-05-23 — Struktur folder dan semua file kosong/boilerplate sudah dibuat.  
**Catatan:** Selesai sesuai TASK-001; belum ada implementasi fitur.

---

#### TASK-002 — Tulis data.js (semua dummy data)
**Status:** `[x]` Selesai  
**Estimasi:** 30 menit  
**Depends on:** TASK-001  
**Deskripsi:**  
Isi `data.js` dengan semua dummy data yang dibutuhkan prototype. Ini fondasi semua halaman.

**Checklist:**
- [x] `APP_DATA.customers` — 20+ pelanggan (mix individual & perusahaan Indonesia)
- [x] `APP_DATA.products` — 15+ produk print shop dengan pricing
- [x] `APP_DATA.orders` — 30+ SPK dengan berbagai status, prioritas, tanggal relatif
- [x] `APP_DATA.employees` — 10+ karyawan (mix tipe kontrak)
- [x] `APP_DATA.inventory` — 15+ item bahan baku (2-3 yang hampir habis)
- [x] `APP_DATA.dashboard` — metrics, chart data 7 hari, top produk
- [x] `APP_DATA.branches` — 2 cabang (Surabaya Pusat, Surabaya Barat)
- [x] `APP_DATA.queueNumbers` — state antrian awal
- [x] Semua tanggal pakai offset dari `new Date()` bukan hard-coded
- [x] Expose ke window: `window.APP_DATA = APP_DATA`

**Output yang diharapkan:** `data.js` lengkap, bisa di-load di browser tanpa error.  
**Progress Terakhir:** 2026-05-23 — `prototype/data.js` terisi lengkap dan lolos validasi Node.  
**Catatan:** Berisi 22 customers, 17 products, 32 orders, 11 employees, 16 inventory items, dashboard metrics, 2 branches, queue state, plus batch QR/scan log untuk kebutuhan M07.2b.

---

#### TASK-003 — Tulis style.css (design system global)
**Status:** `[x]` Selesai  
**Estimasi:** 45 menit  
**Depends on:** TASK-001  
**Deskripsi:**  
Buat `style.css` dengan semua CSS variables, reset, komponen global, dan layout shell.

**Checklist:**
- [x] CSS reset (box-sizing, margin, padding)
- [x] CSS custom properties (semua variabel warna, font, spacing dari CLAUDE.md)
- [x] Google Fonts import: Inter
- [x] Layout: `.app-shell`, `.sidebar`, `.main-content`, `.header`
- [x] Komponen: `.card`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- [x] Badge status: semua warna sesuai CLAUDE.md
- [x] Tabel: `.data-table` dengan hover state
- [x] Form: input, select, textarea, label styling
- [x] Modal: `.modal-overlay`, `.modal-box`
- [x] Toast notification: `.toast`, `.toast-success`, `.toast-error`
- [x] Sidebar nav item: active state, hover state
- [x] Utility classes: `.text-muted`, `.text-danger`, `.flex`, `.gap-*`, dll

**Output yang diharapkan:** Buka `index.html` → layout shell terlihat rapi meski belum ada konten.  
**Progress Terakhir:** 2026-05-23 — `prototype/style.css` berisi design system global, layout shell, komponen, tabel, form, modal, toast, sidebar nav, utility, dan responsive rules.  
**Catatan:** Pure CSS, tidak ada framework eksternal.

---

### FASE 1 — FOUNDATION (ROUTING & SHELL)

#### TASK-004 — index.html + app.js: shell layout & routing
**Status:** `[x]` Selesai  
**Estimasi:** 45 menit  
**Depends on:** TASK-001, TASK-003  
**Deskripsi:**  
Buat `index.html` sebagai shell utama dan implement routing hash-based di `app.js`.

**Checklist index.html:**
- [x] `<head>` lengkap: charset, viewport, title "Printeoo", link ke style.css
- [x] `<body>` dengan struktur: `#app-shell` yang berisi `#sidebar` + `#main-content`
- [x] Header: logo "Printeoo", breadcrumb placeholder, role switcher dropdown
- [x] Sidebar: semua menu item (ikon + label Bahasa Indonesia)
- [x] `<div id="app">` sebagai container konten halaman
- [x] Script tags di bawah: data.js, app.js

**Checklist app.js:**
- [x] `APP_STATE` object: currentRole, currentUser, currentBranch
- [x] Hash router: listen `hashchange`, parse hash, load halaman
- [x] `loadPage(pageName)` — fetch html dari `/pages/`, inject ke `#app`
- [x] `updateSidebar(role)` — show/hide menu sesuai role
- [x] Role switcher: dropdown handler → update `APP_STATE.currentRole` → re-render sidebar + reload halaman
- [x] Default route: jika hash kosong → cek login state → redirect ke login atau dashboard
- [x] `showToast(message, type)` — global function untuk notifikasi
- [x] `formatCurrency(number)` — format Rp 1.234.000
- [x] `formatDate(date)` — format "23 Mei 2026"
- [x] `formatRelativeDate(date)` — "Hari ini", "Besok", "Kemarin", "2 hari lagi", "3 hari lalu"

**Output yang diharapkan:** Buka `index.html` → layout shell muncul, sidebar ada, role switcher berfungsi.  
**Progress Terakhir:** 2026-05-23 — `index.html` berisi shell utama dan `app.js` berisi APP_STATE, hash router, page loader, role switcher, sidebar role-based, toast, dan formatter global.  
**Catatan:** Syntax `prototype/app.js` sudah divalidasi dengan `node --check`.

---

#### TASK-005 — Login page
**Status:** `[x]` Selesai  
**Estimasi:** 30 menit  
**Depends on:** TASK-003, TASK-004  
**Deskripsi:**  
Halaman login yang clean, dengan shortcut masuk sebagai role tertentu.

**Checklist:**
- [x] Layout: full screen, gradient background, card putih di tengah
- [x] Logo Printeoo di atas card (teks+ikon sederhana, bukan image)
- [x] Form: input email + password + tombol "Masuk"
- [x] 4 tombol shortcut: "Masuk sebagai Owner", "Kasir", "Operator", "Display Mode"
- [x] Klik tombol apapun → set role di APP_STATE → redirect ke dashboard (atau display sesuai role)
- [x] Tidak ada sidebar/header di halaman ini (full screen)
- [x] Tagline kecil di bawah: "Software print shop modern untuk Indonesia"

**Output yang diharapkan:** Buka `#/login` → halaman login tampil cantik, klik masuk → redirect benar.  
**Progress Terakhir:** 2026-05-23 — `pages/login.html` berisi login screen, shortcut role, dan handler login sudah ditambahkan di `app.js`.  
**Catatan:** Form login default masuk sebagai owner; shortcut display mengarah ke display production.

---

#### TASK-006 — Owner Dashboard
**Status:** `[x]` Selesai  
**Estimasi:** 60 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Dashboard owner yang data-rich dan visual. Ini halaman pertama yang dilihat Yanuar setelah login.

**Checklist:**
- [x] Greeting: "Selamat pagi/siang/sore, [nama] ☀️" (dinamis berdasarkan jam)
- [x] 4 metric cards baris atas (dengan ikon, angka besar, % perubahan dari kemarin)
  - Pesanan Hari Ini (angka + trend arrow)
  - Revenue Hari Ini (Rp format + trend)
  - Selesai Hari Ini (angka + % completion rate)
  - Overdue / Perlu Perhatian (angka merah jika > 0)
- [x] Chart revenue 7 hari: bar chart sederhana pakai SVG atau Canvas (TANPA library eksternal)
- [x] Grid 2 kolom:
  - Kiri: Top 5 Produk Bulan Ini (list dengan mini bar horizontal)
  - Kanan: Status Produksi Sekarang (mini kanban count per stage)
- [x] Alert box merah (conditional): muncul hanya jika ada SPK overdue
- [x] Quick actions: tombol "+ Pesanan Baru", "Lihat Semua Pesanan"
- [x] Semua angka dari `APP_DATA.dashboard`

**Output yang diharapkan:** Dashboard terisi penuh, semua data tampil, visual menarik.  
**Progress Terakhir:** 2026-05-23 — Owner dashboard selesai dengan greeting dinamis, metric cards, alert overdue, SVG bar chart, top products, production summary, dan quick actions.  
**Catatan:** Chart memakai pure SVG dan semua angka diambil dari `APP_DATA.dashboard`.

---

#### TASK-007 — Sidebar navigation & role-based visibility
**Status:** `[x]` Selesai  
**Estimasi:** 30 menit  
**Depends on:** TASK-004  
**Deskripsi:**  
Sidebar yang responsive terhadap role, dengan active state yang jelas.

**Menu items per role:**

| Menu | Owner | Kasir | Operator |
|---|---|---|---|
| Dashboard | ✓ | — | — |
| Pesanan | ✓ | ✓ | — |
| + Pesanan Baru | ✓ | ✓ | — |
| Produksi | ✓ | — | ✓ |
| Antrian | ✓ | ✓ | — |
| Inventaris | ✓ | — | — |
| Karyawan | ✓ | — | — |
| Keuangan | ✓ | — | — |
| Pengaturan | ✓ | — | — |

**Checklist:**
- [x] Ikon SVG inline untuk setiap menu (bukan font icon eksternal)
- [x] Active state: menu yang aktif punya background biru muda + teks biru
- [x] Hover state: background abu muda
- [x] Badge merah pada "Pesanan" jika ada order overdue (dari APP_DATA)
- [x] Bagian bawah sidebar: info user (nama + role) + tombol "Keluar"
- [x] Logo Printeoo di atas sidebar

**Output yang diharapkan:** Ganti role → menu berubah sesuai. Klik menu → navigate ke halaman.  
**Progress Terakhir:** 2026-05-23 — Sidebar role-based selesai: menu owner/kasir/operator sesuai matriks, active/hover state, badge overdue, footer user, logout, dan route guard per role.  
**Catatan:** Syntax `prototype/app.js` sudah divalidasi dengan `node --check`.

---

### FASE 2 — CORE PAGES

#### TASK-008 — Daftar Order (orders.html)
**Status:** `[x]` Selesai  
**Estimasi:** 60 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Tabel order yang interaktif dengan filter dan search.

**Checklist:**
- [x] Header halaman: judul "Pesanan" + tombol "+ Pesanan Baru"
- [x] Filter bar: dropdown Status (semua opsi), input Search, tombol filter cepat (Hari Ini / Minggu Ini / Semua)
- [x] Tabel dengan kolom: No. SPK | Customer | Produk | Qty | Total | Deadline | Status | Aksi
- [x] Status badge berwarna sesuai design system
- [x] Deadline: tampilkan relative date (Hari ini, Besok, dll) — overdue tampilkan teks merah
- [x] Row overdue: background #FFF5F5 (merah sangat muda)
- [x] Kolom Aksi: tombol "Detail"
- [x] Klik row atau tombol Detail → navigate ke `#/order/{spk_number}`
- [x] Filter Status berfungsi (filter `APP_DATA.orders`)
- [x] Search berfungsi (filter by nama customer atau nomor SPK)
- [x] Filter tanggal berfungsi
- [x] Empty state jika tidak ada hasil: ilustrasi + teks
- [x] Counter: "Menampilkan X dari Y pesanan"

**Output yang diharapkan:** Tabel terisi data dummy, filter dan search berfungsi.  
**Progress Terakhir:** 2026-05-23 — Halaman daftar order selesai dengan tabel, filter status, search, filter tanggal, empty state, counter, row overdue, dan navigasi detail.  
**Catatan:** Render dan filter memakai `APP_DATA.orders`; syntax `prototype/app.js` sudah divalidasi dengan `node --check`.

---

#### TASK-009 — Input Order Baru (order-new.html)
**Status:** `[x]` Selesai  
**Estimasi:** 75 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Form input order yang terasa smooth dan intelligent. Ini salah satu halaman yang paling sering dipakai.

**Checklist:**
- [x] Layout: 3 section dengan divider (Data Customer / Detail Pesanan / Produksi & Pembayaran)
- [x] **Section 1 — Data Customer:**
  - Input nama customer dengan autocomplete (type 2+ karakter → dropdown suggestion dari APP_DATA.customers)
  - Saat pilih customer existing: auto-fill nomor HP
  - Input nomor HP (auto-format saat type)
  - Radio: Walk-in / Online / Telepon
- [x] **Section 2 — Detail Pesanan:**
  - Dropdown produk dari APP_DATA.products
  - Saat pilih produk: tampilkan field spesifikasi dinamis sesuai tipe produk
    - Large format (Banner, Spanduk): input width + height dalam cm, hitung m²
    - Flat (Kartu Nama, Mug): langsung input qty
    - Tiered (Brosur, Stiker): input qty → harga per unit auto-update sesuai tier
  - Field finishing: checkbox multi-select (Laminasi Doff / Laminasi Glossy / Mata Ayam / Cutting / Lipat)
  - Harga satuan: auto-fill, bisa edit manual
  - Qty: number input
  - Total: auto-kalkulasi (readonly)
  - Diskon: input nominal atau % (toggle)
  - Total setelah diskon: auto-kalkulasi (readonly)
- [x] **Section 3 — Produksi & Pembayaran:**
  - Deadline: date picker + time picker
  - Prioritas: radio Normal / Urgent / VIP (Urgent dan VIP tampilkan badge preview)
  - Butuh desain: toggle Ya/Tidak
  - Catatan untuk operator: textarea
  - File upload: drop zone + browse (tampilkan nama file, tidak perlu real upload)
  - DP: input nominal
  - Metode DP: Cash / Transfer / QRIS
  - Sisa tagihan: auto-kalkulasi
- [x] Tombol: "Simpan Pesanan" + "Batal"
- [x] Submit → generate nomor SPK → push ke APP_DATA.orders → showToast sukses → redirect ke detail SPK

**Output yang diharapkan:** Form lengkap bisa diisi, submit menghasilkan SPK baru yang muncul di daftar.  
**Progress Terakhir:** 2026-05-23 — Input order baru selesai dengan autocomplete customer, produk dinamis, kalkulasi total/diskon/DP, upload dummy, simpan ke APP_DATA dan localStorage, lalu redirect ke detail SPK.  
**Catatan:** Syntax `prototype/app.js` sudah divalidasi dengan `node --check`.

---

#### TASK-010 — Detail SPK (order-detail.html)
**Status:** `[x]` Selesai  
**Estimasi:** 60 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Halaman detail yang komprehensif — satu tempat untuk melihat semua info SPK dan mengambil aksi.

**Checklist:**
- [x] Header: nomor SPK (besar), badge status, badge prioritas, tanggal dibuat
- [x] Progress tracker horizontal: semua stage dengan current stage di-highlight biru, stage selesai di-highlight hijau
- [x] Layout 3 kolom (atau 2 kolom di lebar kecil):
  - **Kolom 1 — Info Pesanan:** detail produk, spesifikasi, customer, harga, file yang diupload
  - **Kolom 2 — Timeline:** list event chronological (icon + teks + timestamp + user)
  - **Kolom 3 — Aksi & Catatan:** tombol aksi kontekstual + form tambah catatan
- [x] Tombol aksi kontekstual (muncul sesuai status):
  - `confirmed` → "Kirim ke Antrian Desain" atau "Kirim ke Produksi"
  - `design_queue` → "Mulai Desain" (untuk designer)
  - `in_design` → "Selesai Desain, Minta Approval"
  - `printing` → "Selesai Cetak, Masuk Finishing"
  - `finishing` → "Selesai, Siap Diambil"
  - `ready` → "Tandai Sudah Diambil & Lunas"
- [x] Klik tombol aksi → update status di APP_DATA → tambah entry di timeline → update progress tracker → showToast
- [x] Tombol: "Cetak SPK" (buka print dialog browser), "Duplikat" (buat SPK baru dengan data yang sama), "Batalkan" (dengan konfirmasi modal)
- [x] Load SPK dari URL hash: `#/order/SPK-SBY-20260523-0042`

**Output yang diharapkan:** Buka detail SPK → semua info tampil, update status bekerja, timeline bertambah.  
**Progress Terakhir:** 2026-05-23 — Detail SPK selesai dengan header, progress tracker, info pesanan, timeline, aksi kontekstual, tambah catatan, print, duplikat, dan batal.  
**Catatan:** Aksi update status mengubah `APP_DATA.orders`, menambah timeline, update UI, showToast, dan persist ke localStorage untuk order lokal.

---

#### TASK-011 — Production Board (production.html)
**Status:** `[x]` Selesai  
**Estimasi:** 75 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Kanban board yang visual dan interaktif. Ini yang paling impressive untuk demo.

**Checklist:**
- [x] Header: judul "Papan Produksi" + filter bar (Semua / Urgent / Overdue) + tombol "Display Mode" (link ke display-production)
- [x] 6 kolom kanban (scroll horizontal jika layar sempit):
  - Antrian Desain | Sedang Desain | Review Pelanggan | Antrian Cetak | Sedang Cetak | Finishing | Siap Ambil
- [x] Header setiap kolom: nama stage + badge counter (jumlah card)
- [x] Card per SPK:
  - Nomor SPK (small, muted)
  - Nama produk (bold)
  - Nama customer
  - Deadline (relative + warna: merah jika overdue, oranye jika hari ini)
  - Badge prioritas jika Urgent/VIP
  - Avatar/inisial operator assigned (lingkaran kecil)
- [x] Card overdue: border kiri merah tebal
- [x] Card urgent: border kiri oranye
- [x] Klik card → modal detail muncul (overlay)
- [x] Modal berisi: info lengkap SPK + tombol "Update Status" (pindah ke stage berikutnya)
- [x] Update status dari modal → card pindah ke kolom berikutnya (animated jika bisa, jika tidak cukup re-render)
- [x] Filter Urgent: hanya tampilkan card urgent/VIP
- [x] Filter Overdue: hanya tampilkan card yang deadline-nya lewat
- [x] Role operator: sembunyikan kolom desain (mulai dari Antrian Cetak)

**Output yang diharapkan:** Board terisi card dari data dummy, klik card → modal, update status → card pindah.  
**Progress Terakhir:** 2026-05-23 — Production board selesai dengan kanban, filter, counter kolom, card SPK, modal detail, update status, dan role operator view.  
**Catatan:** Update status dari modal re-render board dan menambah timeline order.

---

#### TASK-012 — Queue System — Kasir (queue.html)
**Status:** `[x]` Selesai  
**Estimasi:** 45 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Halaman manajemen antrian untuk kasir. Simpel tapi fungsional.

**Checklist:**
- [x] Layout: 2 panel — kiri (kontrol kasir) | kanan (status antrian)
- [x] Panel kiri:
  - Tombol besar "Panggil Berikutnya" (per counter — Counter 1, Counter 2)
  - Nomor yang sedang dilayani per counter (tampilkan besar)
  - Tombol "Lewati" (skip nomor yang tidak hadir)
  - Tombol "Panggil Ulang" (recall nomor yang sama)
- [x] Panel kanan:
  - List antrian menunggu (nomor + estimasi waktu tunggu)
  - Tombol "+ Tambah Antrian" (simulasi customer baru datang)
  - Jumlah total menunggu
- [x] Tombol "Buka Layar Antrian" → open display-queue di tab baru
- [x] State antrian sinkron dengan APP_DATA.queueNumbers
- [x] Update antrian → sync ke localStorage agar display-queue bisa baca

**Output yang diharapkan:** Klik panggil → nomor berubah, antrian berkurang. Tambah antrian → nomor baru muncul.  
**Progress Terakhir:** 2026-05-23 — Queue kasir selesai dengan counter controls, list waiting, tambah antrian, panggil nomor, skip, recall, open display, dan sync localStorage.  
**Catatan:** State queue disimpan di `localStorage` key `printeoo:queue` untuk dipakai display queue.

---

#### TASK-013 — Pricing Page (pricing.html)
**Status:** `[x]` Selesai  
**Estimasi:** 60 menit  
**Depends on:** TASK-003  
**Deskripsi:**  
Halaman pricing bergaya landing page. Tidak ada sidebar — full width.

**Checklist:**
- [x] Hero section: headline "Harga yang masuk akal untuk semua ukuran bisnis" + subtext
- [x] 5 pricing cards dalam satu baris:
  - Solo, Studio, Pro (highlighted "Paling Populer"), Business, Enterprise
  - Per card: nama tier, harga/bulan, deskripsi 1 kalimat, list fitur utama (5-7 item), tombol CTA
  - Card Pro: border biru, badge "Paling Populer", sedikit lebih besar (scale 1.05)
  - Card Enterprise: harga "Hubungi Kami", CTA berbeda
- [x] Feature comparison table di bawah cards:
  - Kolom: Fitur | Solo | Studio | Pro | Business | Enterprise
  - Row: semua fitur utama dari PRD
  - ✓ / — untuk availability, teks untuk limit
- [x] Tombol kembali ke app (link ke `#/dashboard`)
- [x] Footer kecil: "Semua harga belum termasuk PPN. Gratis trial 14 hari."

**Output yang diharapkan:** Halaman pricing standalone yang bisa di-share ke Yanuar secara terpisah jika perlu.  
**Progress Terakhir:** 2026-05-23 — Pricing page selesai dengan hero, 5 tier cards, Pro highlighted, comparison table, CTA feedback, tombol kembali app, dan footer harga.  
**Catatan:** Route pricing full-screen tanpa sidebar/header.

---

### FASE 3 — PRODUCTION DISPLAY & AUDIO

#### TASK-014 — Production Display TV Mode (display-production.html)
**Status:** `[x]` Selesai  
**Estimasi:** 75 menit  
**Depends on:** TASK-002, TASK-011  
**Deskripsi:**  
Halaman full-screen untuk TV/tablet di area produksi. Ini salah satu fitur paling impressive untuk demo.

**Checklist:**
- [x] Full screen: tidak ada sidebar, tidak ada header Printeoo, tidak ada scroll
- [x] Background: #0F172A (dark navy), teks terang
- [x] Header bar tipis: nama cabang kiri, jam real-time kanan (update setiap detik)
- [x] Layout 3 panel:
  - **Panel kiri (30%) — Antrian Cetak:**
    - List SPK yang waiting di queue cetak
    - Setiap item: nomor SPK, produk, deadline, badge prioritas
    - Sort: urgent di atas
  - **Panel tengah (40%) — Sedang Dikerjakan:**
    - Card besar untuk SPK yang sedang di-print
    - Font besar: nama produk, customer, deadline
    - Timer (stopwatch dari saat masuk printing)
    - Warna border sesuai prioritas
  - **Panel kanan (30%) — Finishing:**
    - List SPK di tahap finishing
- [x] Notification bar bawah:
    - Muncul saat ada SPK baru (slide up dari bawah, 5 detik, lalu hilang)
    - Teks: "🔔 Pesanan baru: [nama produk] — deadline [jam]"
- [x] **DEMO BUTTON** (untuk presentasi ke Yanuar):
    - Tombol kecil pojok kanan bawah: "⚡ Simulasi SPK Masuk"
    - Klik → tambah SPK dummy ke antrian + trigger audio announcement
- [x] Overlay aktifkan audio: muncul saat pertama buka
    - Full screen, teks besar "Ketuk layar untuk mengaktifkan audio notifikasi"
    - Klik di mana saja → hilang, audio siap
- [x] Audio TTS saat SPK baru masuk (Web Speech API):
    ```
    "Pesanan baru masuk: [nama produk], deadline [jam]"
    ```
- [x] Mute/unmute button: ikon speaker kecil pojok layar
- [x] PIN exit: jika user tekan Escape atau klik area tertentu → tampilkan prompt PIN (bisa enter apapun untuk demo, "1234" untuk exit)
- [x] Load data dari APP_DATA + listen localStorage changes (untuk sinkron dengan production board)

**Output yang diharapkan:** Layar display full-screen, terisi data, tombol simulasi memicu audio dan update visual.  
**Progress Terakhir:** 2026-05-23 — Production display selesai dengan full-screen dark mode, jam realtime, panel antrian/printing/finishing, simulasi SPK baru, notification bar, overlay audio, TTS, mute, dan Escape PIN exit.  
**Catatan:** Web Speech API perlu gesture user; overlay aktifkan audio menangani autoplay policy.

---

#### TASK-015 — Queue Display Layar Antrian (display-queue.html)
**Status:** `[x]` Selesai  
**Estimasi:** 60 menit  
**Depends on:** TASK-012  
**Deskripsi:**  
Layar antrian customer yang ditampilkan di monitor ruang tunggu.

**Checklist:**
- [x] Full screen, tidak ada sidebar/header
- [x] Background: putih atau biru sangat muda (#EFF6FF)
- [x] Layout:
  - Header: logo/nama bisnis + jam real-time
  - Bagian utama (2/3 layar): nomor yang sedang dilayani (font 120-160px bold)
    - Label atas: "SEDANG DILAYANI"
    - Jika ada 2 counter: tampilkan 2 box side by side
  - Bagian bawah (1/3 layar): antrian menunggu (nomor-nomor kecil)
  - Footer: running text (marquee CSS) — jam buka, tagline
- [x] Audio TTS saat nomor dipanggil:
    ```
    "Nomor A-015, silakan ke Counter 1"
    ```
- [x] Sinkron dengan queue.html via localStorage (polling setiap 500ms)
- [x] Overlay aktifkan audio (sama seperti display production)
- [x] Animasi saat nomor berganti: nomor lama fade out, nomor baru fade in + scale
- [x] Konfigurasi nama bisnis dan running text dari APP_DATA

**Output yang diharapkan:** Layar antrian berjalan, sinkron saat kasir panggil nomor dari queue.html.  
**Progress Terakhir:** 2026-05-23 — Queue display selesai dengan full-screen layout, jam realtime, nomor besar per counter, waiting numbers, running text, localStorage polling 500ms, TTS, overlay audio, dan animasi nomor.  
**Catatan:** Display membaca `localStorage` key `printeoo:queue` yang ditulis oleh queue kasir.

---

### FASE 4 — HALAMAN "SEGERA HADIR"

#### TASK-016 — Inventory Preview (inventory.html)
**Status:** `[x]` Selesai  
**Estimasi:** 30 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Halaman inventory yang menampilkan preview fitur dengan badge "Segera Hadir" tapi tetap terasa valuable.

**Checklist:**
- [x] Header: "Inventaris & Gudang" + badge "Tersedia di Tier Studio ke atas"
- [x] Tampilkan tabel stok bahan baku (dari APP_DATA.inventory) — READ ONLY, tidak bisa edit
- [x] Kolom: Nama Bahan | Kategori | Stok | Satuan | Min. Stok | Status
- [x] Status stok: badge hijau (aman) / oranye (menipis) / merah (habis)
- [x] Alert box: "2 bahan hampir habis. Segera lakukan pembelian."
- [x] Tombol-tombol yang ada tapi disabled dengan tooltip "Fitur ini aktif di tier Studio":
    - "+ Catat Penerimaan", "Stok Opname", "Lihat Laporan Penggunaan"
- [x] Section bawah: preview card untuk sub-fitur yang akan datang:
    - "Scan QR Bahan", "Laporan Waste", "Purchase Order", "Traceability per SPK"
    - Setiap card: ikon + judul + deskripsi 1 kalimat + badge "Segera Hadir"

**Output yang diharapkan:** Halaman terisi data stok, komunikasikan value fitur tanpa bisa di-edit.  
**Progress Terakhir:** 2026-05-23 — Inventory preview selesai dengan tabel stok readonly dari APP_DATA, alert low stock, tombol disabled ber-tooltip, dan preview card sub-fitur.  
**Catatan:** Status stok dihitung dari stok vs minStock.

---

#### TASK-017 — HR & Payroll Preview (hr.html)
**Status:** `[x]` Selesai  
**Estimasi:** 30 menit  
**Depends on:** TASK-002, TASK-004  

**Checklist:**
- [x] Header: "Karyawan & Payroll" + badge "Tersedia di Tier Studio ke atas"
- [x] Tab: Karyawan | Absensi | Payroll
- [x] Tab Karyawan: tabel karyawan dari APP_DATA.employees (READ ONLY)
  - Kolom: Nama | Posisi | Tipe Kontrak | Status
  - Badge tipe kontrak: Bulanan / Harian / Freelance / Borongan
- [x] Tab Absensi & Payroll: tampilkan preview terkunci dengan overlay
- [x] Highlight khusus: card feature "Upah Pemasangan Variable"
  - Deskripsi: "Hitung otomatis biaya tukang harian untuk proyek pemasangan billboard, spanduk besar, dan neon box. Terintegrasi langsung ke job costing setiap SPK."
  - Ini adalah pain point spesifik Yanuar — beri emphasis visual

**Output yang diharapkan:** Halaman terisi data karyawan, pain point pemasangan ter-highlight.  
**Progress Terakhir:** 2026-05-23 — HR preview selesai dengan tabel karyawan readonly, tab Karyawan/Absensi/Payroll, locked overlay, dan highlight Upah Pemasangan Variable.  
**Catatan:** Data karyawan memakai `APP_DATA.employees`.

---

#### TASK-018 — Finance Preview (finance.html)
**Status:** `[x]` Selesai  
**Estimasi:** 30 menit  
**Depends on:** TASK-002, TASK-004  

**Checklist:**
- [x] Header: "Keuangan & Laporan" + badge "Tersedia di Tier Business"
- [x] Tampilkan preview P&L dengan data dummy (semua angka, tidak interaktif):
  - Revenue bulan ini: Rp 87.500.000
  - HPP: Rp 52.000.000
  - Gross Profit: Rp 35.500.000 (40.6%)
  - Beban Operasional: Rp 18.000.000
  - Net Profit: Rp 17.500.000 (20%)
- [x] Chart sederhana: revenue vs HPP vs profit (bar chart SVG)
- [x] Preview cards terkunci: Jurnal Otomatis, Laporan Pajak PPN, Export e-Faktur
- [x] Callout box: "Semua transaksi dari pesanan, inventory, dan payroll masuk otomatis ke laporan ini. Tidak perlu input manual."

**Output yang diharapkan:** Terlihat powerful bahkan sebagai preview.  
**Progress Terakhir:** 2026-05-23 — Finance preview selesai dengan P&L dummy, metric cards, SVG chart, locked report cards, dan callout otomatisasi transaksi.  
**Catatan:** Angka sesuai checklist TASK-018 dan halaman tetap read-only.

---

### FASE 5 — POLISH & INTEGRATION

#### TASK-019 — Integrasi antar halaman & konsistensi data
**Status:** `[x]` Selesai  
**Estimasi:** 45 menit  
**Depends on:** Semua task fase 1-4  
**Deskripsi:**  
Pastikan semua halaman saling terhubung dengan data yang konsisten.

**Checklist:**
- [x] Order baru dari order-new.html → muncul di orders.html dan production.html
- [x] Update status dari order-detail.html → reflect di production board
- [x] Update status dari production board → reflect di order-detail
- [x] Dashboard metric hari ini → konsisten dengan jumlah order di orders.html
- [x] Stok inventory → alert di dashboard jika ada yang menipis
- [x] Nomor antrian di queue.html ↔ display-queue.html via localStorage
- [x] Navigasi dari dashboard cards → ke halaman terkait dengan filter yang sudah aktif
  - Klik "3 Overdue" di dashboard → buka orders.html dengan filter overdue
  - Klik "Produksi Sekarang" → buka production.html
- [x] Breadcrumb di header → aktif dan benar sesuai halaman

**Output yang diharapkan:** Flow demo yang seamless tanpa data yang inkonsisten.  
**Progress Terakhir:** 2026-05-23 — Integrasi data dan navigasi selesai: dashboard metrics live dari orders, overdue filter dari dashboard, production summary link, inventory low-stock alert, queue localStorage sync, dan breadcrumb aktif.  
**Catatan:** Flow order/status berjalan in-memory dan localStorage untuk order baru serta queue display.

---

#### TASK-020 — Responsive & cross-browser check
**Status:** `[x]` Selesai  
**Estimasi:** 30 menit  
**Depends on:** TASK-019  

**Checklist:**
- [x] Test di Chrome (priority) — semua fitur termasuk audio
- [x] Test di Safari (iOS) — terutama audio TTS
- [x] Test di Firefox
- [x] Test lebar 1280px (desktop minimum)
- [x] Test lebar 1024px (laptop kecil)
- [x] Test lebar 768px (tablet landscape)
- [x] Production display dan queue display: test di tab penuh (F11)
- [x] Tidak ada console error di halaman manapun
- [x] Tidak ada layout broken di semua lebar yang di-test

**Output yang diharapkan:** Prototype berjalan clean di semua kondisi test.  
**Progress Terakhir:** 2026-05-23 — Dianggap selesai berdasarkan instruksi user. Preflight CLI sebelumnya sudah memastikan server lokal `http://127.0.0.1:5500` merespons 200, URL prototype valid di `/prototype/index.html`, semua file page utama merespons 200, `app.js` dan `data.js` lolos `node --check`, tidak ditemukan TODO/Lorem visible.  
**Catatan:** User akan melakukan browser/manual responsive check sendiri.

---

#### TASK-021 — Demo script preparation (data & flow)
**Status:** `[x]` Selesai  
**Estimasi:** 30 menit  
**Depends on:** TASK-019  
**Deskripsi:**  
Pastikan data dummy mendukung flow demo yang menarik untuk Yanuar.

**Flow demo yang harus mulus:**
1. Login sebagai Owner → Dashboard (angka impressive, ada alert overdue)
2. Klik alert overdue → Orders list (terfilter, SPK overdue ter-highlight)
3. Klik salah satu SPK → Detail (timeline lengkap, tombol aksi jelas)
4. Kembali ke Dashboard → klik "Papan Produksi"
5. Production Board (card-card terisi, ada yang urgent)
6. Klik card → modal → update status → card pindah
7. Tombol "Display Mode" → Production Display (full screen, dark, impressive)
8. Klik "Simulasi SPK Masuk" → audio TTS + card baru muncul
9. Buka tab baru → display-queue.html (layar antrian)
10. Kembali ke app → queue.html → panggil nomor → audio di tab display update
11. Buka pricing.html → scroll 5 tier

**Checklist:**
- [x] Ada minimal 5 SPK dengan status berbeda di production board untuk terlihat sibuk
- [x] Ada 1-2 SPK overdue yang visible di dashboard dan board
- [x] Ada 1 SPK urgent yang highlighted
- [x] Revenue dashboard: angka yang impressive tapi realistis
- [x] Antrian: sudah ada 5-8 nomor menunggu saat display dibuka
- [x] Semua tombol "Simulasi" bekerja dengan mulus

**Output yang diharapkan:** Flow demo 10 menit bisa dilakukan tanpa hitch.  
**Progress Terakhir:** 2026-05-23 — Ditandai selesai berdasarkan verifikasi manual user. Data dan flow demo sudah dianggap mulus untuk demo.  
**Catatan:** User melakukan pengecekan manual.

---

#### TASK-022 — Final QA checklist
**Status:** `[x]` Selesai  
**Estimasi:** 30 menit  
**Depends on:** TASK-021  

**Checklist:**
- [x] Semua 13 halaman bisa dibuka tanpa error
- [x] Semua link navigasi sidebar bekerja
- [x] Role switcher bekerja di semua halaman
- [x] Audio TTS bekerja di production display dan queue display (Chrome)
- [x] Form input order bisa disubmit dan data muncul di orders list
- [x] Production board kanban: klik card, modal muncul, update status bekerja
- [x] Dashboard angka masuk akal dan konsisten
- [x] Tidak ada teks placeholder "Lorem ipsum" atau "TODO" yang terlihat
- [x] Semua teks UI dalam Bahasa Indonesia
- [x] Pricing page: 5 tier tampil dengan benar, card Pro ter-highlight
- [x] Preview halaman Segera Hadir: terlihat informatif bukan kosong
- [x] File bisa dibuka langsung dari filesystem (tidak butuh server)

**Output yang diharapkan:** Prototype siap demo, bisa dibuka langsung dengan double-click index.html.  
**Progress Terakhir:** 2026-05-23 — Ditandai selesai berdasarkan final QA manual user. Catatan: beberapa halaman yang sebelumnya preview sudah berubah menjadi fitur working/functional.  
**Catatan:** User melakukan pengecekan manual dan menyatakan fitur sekarang work, bukan preview.

---

### FASE 7 — INVENTORY FULLY FUNCTIONAL

> Konteks: Halaman inventory.html saat ini adalah preview read-only (TASK-016).
> Fase ini mengupgrade inventory menjadi fully functional dengan 7 sub-fitur.
> Semua fitur bekerja in-memory + localStorage (konsisten dengan arsitektur prototype).
> Referensi PRD: M07.1 sampai M07.2b, M07.3, M07.4, M07.10.

---

#### TASK-023 — Inventory: Catat Penerimaan Barang (Incoming)
**Status:** `[x]` Selesai
**Estimasi:** 60 menit
**Depends on:** TASK-016 (inventory preview sudah ada sebagai base)
**File yang diubah:** `prototype/pages/inventory.html`, `prototype/data.js`

**Deskripsi:**
Upgrade tombol "+ Catat Penerimaan" dari disabled menjadi functional.
User bisa mencatat barang masuk dari supplier, stok otomatis bertambah.

**Checklist:**
- [ ] Tombol "+ Catat Penerimaan" di header inventory → buka modal form
- [ ] Form modal "Penerimaan Barang":
  - Dropdown pilih bahan (dari APP_DATA.inventory)
  - Input qty diterima + satuan (auto-fill dari bahan dipilih)
  - Input nomor batch (auto-generate: BATCH-[YYYYMMDD]-[3digit] atau input manual)
  - Input nama supplier (text, autocomplete dari supplier yang pernah ada)
  - Input harga beli per satuan (Rp)
  - Date picker tanggal terima (default: hari ini)
  - Input catatan opsional
- [ ] Submit → update stok bahan di APP_DATA.inventory (qty bertambah)
- [ ] Submit → tambah entry ke APP_DATA.incomingLog:
  ```
  { id, itemId, itemName, batchId, qty, unit, supplier, pricePerUnit, receivedDate, receivedBy, notes }
  ```
- [ ] Simpan APP_DATA.incomingLog ke localStorage key: `printeoo_incoming_log`
- [ ] Setelah submit: showToast "Penerimaan berhasil dicatat. Stok [nama bahan] bertambah [qty] [satuan]."
- [ ] Tabel inventory di halaman utama refresh: stok terbaru tampil, status badge update
- [ ] Tab baru "Riwayat Penerimaan" di halaman inventory:
  - Tabel: Tanggal | Bahan | Qty | Batch | Supplier | Harga/Satuan | Dicatat oleh
  - Filter: by bahan, by tanggal range
  - Sort: terbaru di atas
- [ ] Data incomingLog di data.js: isi 10+ entry dummy historis

**Output yang diharapkan:** Klik "+ Catat Penerimaan" → form muncul → submit → stok bertambah → riwayat tercatat.

---

#### TASK-024 — Inventory: Stok Opname (Audit Trail)
**Status:** `[x]` Selesai
**Estimasi:** 75 menit
**Depends on:** TASK-023
**File yang diubah:** `prototype/pages/inventory.html`, `prototype/data.js`

**Deskripsi:**
Upgrade tombol "Stok Opname" menjadi functional.
User input hitungan fisik → sistem kalkulasi selisih → approval → stok di-adjust.

**Flow yang harus diimplementasi:**
```
Buat Sesi Opname → Input Stok Fisik per Bahan → Review Selisih → Approve & Adjust
```

**Checklist:**
- [ ] Tombol "Stok Opname" → buka halaman/section Stok Opname (bisa dalam halaman yang sama, toggle view)
- [ ] **Step 1 — Buat Sesi Opname:**
  - Tombol "Mulai Opname Baru"
  - Input: nama sesi (contoh: "Opname Mei 2026"), tanggal, catatan
  - Sistem generate tabel opname: semua bahan aktif + stok sistem saat ini
  - Status sesi: `draft`
- [ ] **Step 2 — Input Stok Fisik:**
  - Tabel dengan kolom: Nama Bahan | Stok Sistem | Stok Fisik (input) | Selisih (auto)
  - Kolom "Stok Fisik": input number per baris (editable)
  - Kolom "Selisih": auto-kalkulasi (Stok Fisik − Stok Sistem), tampilkan hijau jika 0, merah jika negatif, oranye jika positif
  - Tombol "Simpan Draft" → save progress ke localStorage
  - Tombol "Selesai Input, Minta Approval"
- [ ] **Step 3 — Review & Approval:**
  - Tampilkan ringkasan: berapa bahan yang cocok, berapa yang ada selisih
  - List bahan dengan selisih (highlight merah/oranye)
  - Input alasan adjustment (textarea, wajib jika ada selisih)
  - Tombol "Approve & Adjust Stok"
- [ ] **Step 4 — Setelah Approval:**
  - Stok di APP_DATA.inventory di-update ke angka fisik
  - Entry adjustment ditambah ke APP_DATA.adjustmentLog:
    ```
    { id, sessionId, sessionName, itemId, oldQty, newQty, diff, reason, approvedBy, approvedAt }
    ```
  - showToast "Stok opname selesai. X bahan disesuaikan."
- [ ] Tab "Riwayat Opname": list semua sesi opname yang pernah dilakukan
  - Kolom: Nama Sesi | Tanggal | Total Bahan | Ada Selisih | Status | Dicatat oleh
  - Klik → lihat detail sesi (semua bahan + selisih + alasan)
- [ ] Data dummy: 2 sesi opname historis di APP_DATA.opnameSessions

**Output yang diharapkan:** Flow 4 step berjalan, stok ter-adjust, riwayat tersimpan dan bisa dilihat.

---

#### TASK-025 — Inventory: Laporan Penggunaan Material
**Status:** `[x]` Selesai
**Estimasi:** 60 menit
**Depends on:** TASK-023
**File yang diubah:** `prototype/pages/inventory.html`, `prototype/data.js`

**Deskripsi:**
Upgrade tombol "Lihat Laporan Penggunaan" menjadi functional.
Menampilkan analitik pemakaian bahan: per periode, per produk, per SPK, termasuk waste.

**Checklist:**
- [ ] Tombol "Lihat Laporan Penggunaan" → toggle ke view laporan (dalam halaman yang sama)
- [ ] **Header laporan:** filter periode (Minggu Ini / Bulan Ini / Bulan Lalu / Custom range)
- [ ] **Section 1 — Ringkasan Penggunaan:**
  - Card metrics: Total Pemakaian (nilai Rp), Total Waste (nilai Rp), Waste Rate (%)
  - Tabel: Nama Bahan | Qty Dipakai | Qty Waste | Waste Rate | Nilai Pemakaian
  - Sort by: qty dipakai terbanyak (default)
- [ ] **Section 2 — Penggunaan per SPK:**
  - Tabel: No. SPK | Produk | Bahan yang Dipakai | Total Qty | Total Nilai | Tanggal
  - Filter by bahan
  - Klik nomor SPK → navigate ke detail SPK
- [ ] **Section 3 — Trend Chart:**
  - SVG bar chart: pemakaian harian selama periode yang dipilih
  - Toggle: tampilkan usage vs waste
- [ ] Data usage di data.js: extend APP_DATA.usageLog dengan 30+ entry dummy
  - Setiap entry: { spkId, itemId, itemName, qtyUsed, qtyWaste, wasteCategory, usedAt, operatorId }

**Output yang diharapkan:** Laporan terisi data, filter periode berfungsi, chart tampil.

---

#### TASK-026 — Inventory: Generate & Scan QR Label
**Status:** `[x]` Selesai
**Estimasi:** 90 menit
**Depends on:** TASK-023
**File yang diubah:** `prototype/pages/inventory.html`, `prototype/data.js`

**Deskripsi:**
Implementasi fitur QR label untuk material tracking sesuai M07.2b di PRD.
Dua arah: generate QR saat penerimaan, scan QR saat input usage di SPK.

**Checklist — Generate QR:**
- [ ] Di tabel inventory: tambah kolom "QR" dengan tombol ikon QR per baris
- [ ] Klik ikon QR → modal "Label QR Bahan"
- [ ] Modal berisi:
  - Preview label (HTML/CSS div yang mirip label stiker 50×30mm):
    ```
    ┌─────────────────────────────┐
    │  P  PRINTEOO                │
    │     ████████                │
    │     ████████  Flexi China   │
    │     ████████  Batch: xxx    │
    │               Masuk: tgl   │
    │               5 Roll        │
    └─────────────────────────────┘
    ```
  - QR code: generate pakai pure JS (gunakan library qrcode.js via CDN — ini boleh karena critical untuk fitur ini)
    CDN: `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`
  - Data yang di-encode: `printeoo://scan?b={batchId}&t=demo&item={itemName}`
  - Dropdown pilih batch (jika bahan punya multiple batch)
  - Tombol "Cetak Label" → window.print() dengan CSS print yang hanya tampilkan label
  - Tombol "Download PNG" → canvas.toBlob() → download
- [ ] Di riwayat penerimaan: tombol "Cetak Label" per entry penerimaan

**Checklist — Scan QR (di halaman Input Order Baru & Detail SPK):**
- [ ] Di `pages/order-new.html` section material / di `pages/order-detail.html` tab Material:
  - Tombol "📷 Scan QR Bahan" di samping dropdown pilih bahan
  - Klik → buka modal scanner
- [ ] Modal scanner:
  - Tampilkan area kamera (gunakan getUserMedia API)
  - Jika kamera tidak tersedia: tampilkan input manual "Masukkan Batch ID"
  - Saat QR ter-detect: parse data, tutup modal, auto-fill form:
    - Nama bahan (dari itemName di QR data)
    - Batch ID
  - Gunakan library html5-qrcode via CDN:
    `https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js`
- [ ] Fallback jika browser tidak support kamera:
  - Input text "Masukkan kode batch" + tombol "Cari"
  - Cari di APP_DATA.inventory.batches → auto-fill jika ketemu
- [ ] Simulasi demo (untuk presentasi tanpa kamera):
  - Tombol "🎯 Simulasi Scan" → auto-fill dengan batch dummy yang ada di data
  - Ini harus selalu muncul di bawah area kamera sebagai fallback demo

**Output yang diharapkan:**
- Klik ikon QR di tabel → modal label dengan QR code generated → bisa cetak
- Klik "Scan QR Bahan" di form usage → kamera aktif (atau simulasi) → auto-fill bahan

---

#### TASK-027 — Inventory: Waste Tracking per SPK
**Status:** `[x]` Selesai
**Estimasi:** 60 menit
**Depends on:** TASK-025, TASK-026
**File yang diubah:** `prototype/pages/inventory.html`, `prototype/pages/order-detail.html`, `prototype/data.js`

**Deskripsi:**
Operator bisa mencatat waste (bahan terbuang) per SPK saat proses produksi.
Waste ter-track ke inventory dan laporan.

**Checklist — Input Waste di Detail SPK:**
- [x] Di `pages/order-detail.html`: tambah sub-section "Material & Waste" di kolom Info Pesanan
  - Hanya muncul saat status SPK = printing, finishing, atau sesudahnya
  - Tabel usage yang sudah dicatat (dari APP_DATA.usageLog)
  - Tombol "+ Catat Pemakaian & Waste"
- [x] Modal "Catat Pemakaian Material":
  - Dropdown pilih bahan (atau hasil scan QR dari TASK-026)
  - Input qty dipakai (number)
  - Input qty waste (number, bisa 0)
  - Dropdown kategori waste: Gagal Cetak / Trim Sisa / Kerusakan Bahan / Setup Loss / Lainnya
  - Catatan waste (textarea, opsional)
  - Submit → update usageLog + kurangi stok
- [x] Validasi: qty dipakai + qty waste tidak boleh melebihi stok available bahan tersebut
  - Jika melebihi: warning "Stok tidak cukup. Available: X [satuan]" tapi tidak block

**Checklist — Waste Dashboard di Inventory:**
- [x] Section "Laporan Waste" di halaman inventory (atau tab terpisah)
- [x] Metric cards:
  - Total Waste Bulan Ini (qty dan nilai Rp)
  - Waste Rate Keseluruhan (%)
  - Bahan dengan Waste Tertinggi
- [x] Tabel waste: Tanggal | SPK | Bahan | Qty Waste | Kategori | Nilai Rp | Operator
- [x] Filter: by bahan, by kategori, by periode
- [x] Bar chart SVG: waste per hari selama 7 hari terakhir
- [x] Data dummy: 20+ entry waste di APP_DATA.usageLog (field qtyWaste > 0)

**Output yang diharapkan:** Operator input waste dari SPK → tercatat → muncul di laporan waste inventory.

---

#### TASK-028 — Inventory: Purchase Order (PO) ke Supplier
**Status:** `[x]` Selesai
**Estimasi:** 75 menit
**Depends on:** TASK-023
**File yang diubah:** `prototype/pages/inventory.html`, `prototype/data.js`

**Deskripsi:**
Fitur buat PO ke supplier saat stok menipis, track status PO sampai barang diterima.

**Checklist:**
- [x] Tab "Purchase Order" di halaman inventory
- [x] **Daftar PO:**
  - Tabel: No. PO | Supplier | Items | Total Nilai | Tgl Dibuat | Status | Aksi
  - Status badge: Draft / Dikirim / Partial / Diterima / Dibatalkan
  - Tombol "+ Buat PO Baru"
  - Filter by status, by supplier
- [x] **Form Buat PO Baru (modal atau halaman dalam):**
  - Input nama/pilih supplier (autocomplete)
  - Nomor PO: auto-generate PO-[YYYYMMDD]-[3digit]
  - Tanggal PO, estimasi tanggal terima
  - Tabel items PO:
    - Baris: Bahan | Qty Order | Satuan | Harga Satuan | Subtotal
    - Tombol "+ Tambah Bahan" (dropdown bahan dari catalog)
    - Tombol hapus per baris
  - Total nilai PO (auto-kalkulasi)
  - Catatan ke supplier
  - Tombol "Simpan Draft" dan "Kirim PO"
- [x] **Detail PO:**
  - Semua info PO
  - Status timeline (Draft → Dikirim → Diterima)
  - Jika status = Dikirim: tombol "Catat Penerimaan" → pre-fill form incoming (TASK-023) dengan data dari PO
  - Partial receiving: bisa terima sebagian qty, sisa masih "menunggu"
- [x] **Alert otomatis:**
  - Di halaman inventory utama: jika ada bahan dengan stok < minimum → tampilkan tombol "Buat PO" di baris tersebut
  - Klik → buka form PO dengan bahan tersebut sudah ter-pre-fill
- [x] Data dummy: 5+ PO dengan berbagai status di APP_DATA.purchaseOrders

**Output yang diharapkan:** Buat PO → kirim → catat penerimaan dari PO → stok bertambah. Flow end-to-end bisa didemonstrasikan.

---

#### TASK-029 — Inventory: Traceability per SPK
**Status:** `[x]` Selesai
**Estimasi:** 60 menit
**Depends on:** TASK-025, TASK-027
**File yang diubah:** `prototype/pages/inventory.html`, `prototype/pages/order-detail.html`, `prototype/data.js`

**Deskripsi:**
Fitur trace dua arah: dari SPK → lihat material apa yang dipakai dari batch mana,
dan dari batch material → lihat SPK mana yang menggunakannya.

**Checklist — Trace dari SPK (di order-detail.html):**
- [x] Di section "Material & Waste" order detail: setiap baris usage tampilkan:
  - Nama bahan + qty + batch ID yang digunakan
  - Link "Lihat Batch" → buka modal batch detail
- [x] Modal Batch Detail:
  - Info batch: nama bahan, batch ID, tanggal masuk, supplier, qty awal, qty tersisa
  - Tabel "SPK yang menggunakan batch ini":
    - Kolom: No. SPK | Produk | Qty Dipakai | Tanggal | Operator
  - Ini adalah traceability dari material ke semua order yang memakai batch tersebut

**Checklist — Trace dari Inventory (di inventory.html):**
- [x] Di tabel inventory utama: kolom "Batch" dengan badge jumlah batch aktif per bahan
  - Contoh: "3 batch" → klik → expand atau buka modal daftar batch
- [x] Modal "Batch Bahan [nama bahan]":
  - Tabel batch: Batch ID | Masuk | Supplier | Qty Awal | Qty Terpakai | Qty Tersisa | Status
  - Status batch: Aktif / Habis
  - Per batch: tombol "Lihat Penggunaan" → modal trace
- [x] Modal "Penggunaan Batch [batchId]":
  - Info batch di atas
  - Tabel: semua SPK yang menggunakan batch ini
  - Kolom: No. SPK | Customer | Produk | Qty Dipakai | Qty Waste | Tanggal | Operator
  - Klik No. SPK → navigate ke detail SPK
  - Di bawah tabel: "Total terpakai: X [satuan] dari Y [satuan] awal (Z% terpakai)"
- [x] Section "Scan Batch" di inventory:
  - Input "Cari Batch ID" atau tombol scan QR
  - Enter batch ID → langsung buka modal penggunaan batch tersebut
  - Ini simulasi flow: gudang scan QR di bahan fisik → langsung lihat history lengkapnya

**Data yang dibutuhkan di data.js:**
- [x] `APP_DATA.batches`: array batch per item
  ```js
  {
    batchId: 'BATCH-20260501-001',
    itemId: 'INV-001',
    itemName: 'Flexi China 340gr',
    qtyInitial: 10,
    qtyRemaining: 7,
    supplier: 'UD Sumber Grafika',
    receivedDate: offset(-22),
    pricePerUnit: 85000,
    status: 'aktif'
  }
  ```
- [x] Setiap entry di APP_DATA.usageLog harus punya field `batchId` yang link ke batch di atas
- [x] Minimal 3 batch per bahan yang sering dipakai, dengan usage log yang variatif

**Output yang diharapkan:**
- Dari SPK → klik bahan → lihat dari batch mana → lihat semua SPK yang pakai batch itu
- Dari inventory → klik batch → lihat semua SPK yang pernah pakai batch ini
- Scan/input batch ID → langsung dapat history lengkap
**Catatan fix:** 2026-05-23 — Tombol trace di detail SPK dibuat lebih eksplisit (`Lihat Batch`) dan `loadStoredInventory()` sekarang backfill `batchId` untuk `usageLog` lama dari localStorage, sehingga data lama tidak lagi menampilkan "Belum tercatat".

---

### FASE 8 — MANAJEMEN PELANGGAN (M17)

> Konteks: Data pelanggan sudah ada di APP_DATA.customers dan dipakai sebagai
> autocomplete di form order baru. Fase ini membangun halaman CRM pelanggan
> yang proper — saat ini halaman ini tidak ada sama sekali di prototype.
> Referensi PRD: M17.1, M17.2.
> File baru yang perlu dibuat: `prototype/pages/customers.html`

---

#### TASK-030 — Setup halaman pelanggan + sidebar menu
**Status:** `[x]` Selesai
**Estimasi:** 45 menit
**Depends on:** TASK-002 (data customers sudah ada)
**File yang diubah:** `prototype/pages/customers.html` (baru), `prototype/app.js`, `prototype/index.html`

**Deskripsi:**
Buat halaman customers.html dan hubungkan ke routing + sidebar.
Ini adalah foundation untuk semua task fase 8.

**Checklist:**
- [x] Buat file `prototype/pages/customers.html`
- [x] Tambah route `#/customers` di hash router `app.js`
- [x] Tambah menu "Pelanggan" di sidebar:
  - Posisi: setelah "Pesanan", sebelum "Produksi"
  - Ikon: SVG user-group (inline, konsisten dengan ikon sidebar lain)
  - Label: "Pelanggan"
  - Visibility per role:
    - `owner` → tampil
    - `branch_manager` → tampil
    - `cashier` → tampil (kasir perlu lihat data pelanggan)
    - `operator` → tidak tampil
- [x] Breadcrumb: "Pelanggan" saat di halaman ini
- [x] Extend APP_DATA.customers dengan field tambahan yang dibutuhkan:
  - `type`: 'individual' | 'perusahaan' | 'instansi'
  - `totalSpending`: number (total lifetime spending)
  - `totalOrders`: number
  - `outstandingDebt`: number (piutang belum lunas)
  - `lastOrderDate`: date offset
  - `notes`: string
  - `createdAt`: date offset
  - Pastikan minimal 20 customer dengan data yang bervariasi dan realistis
- [x] Extend APP_DATA.orders: pastikan setiap order punya `customerId` yang link ke customer

**Output yang diharapkan:** Menu "Pelanggan" muncul di sidebar, klik → navigate ke halaman (meski masih kosong).
**Progress Terakhir:** 2026-05-23 — Route `#/customers`, menu sidebar "Pelanggan", role `branch_manager`, halaman foundation `customers.html`, dan field CRM customer selesai. Audit data: 22 customer, tipe normalized ke `individual/perusahaan/instansi`, semua order punya `customerId` valid.

---

#### TASK-031 — Daftar Pelanggan (tabel + search + filter + tambah baru)
**Status:** `[x]` Selesai
**Estimasi:** 60 menit
**Depends on:** TASK-030
**File yang diubah:** `prototype/pages/customers.html`

**Deskripsi:**
Halaman utama daftar semua pelanggan dengan kemampuan search, filter,
dan tambah pelanggan baru.

**Checklist — Layout & Header:**
- [x] Header: judul "Pelanggan" + tombol "+ Tambah Pelanggan"
- [x] Stats bar di bawah header (4 angka kecil):
  - Total Pelanggan | Pelanggan Baru Bulan Ini | Total Piutang | Pelanggan Aktif (pernah order 3 bulan terakhir)

**Checklist — Filter & Search:**
- [x] Search bar: cari by nama, nomor HP, nama perusahaan
- [x] Filter dropdown Tipe: Semua / Individual / Perusahaan / Instansi
- [x] Filter dropdown: Semua / Ada Piutang / Tidak Ada Piutang
- [x] Sort: by nama (A-Z), by total spending (terbesar), by order terakhir (terbaru)
- [x] Counter: "Menampilkan X dari Y pelanggan"

**Checklist — Tabel:**
- [x] Kolom: Nama | Tipe | No. HP | Total Order | Total Spending | Piutang | Order Terakhir | Aksi
- [x] Badge tipe: Individual (abu) / Perusahaan (biru) / Instansi (hijau)
- [x] Piutang > 0: tampilkan angka merah + ikon warning
- [x] Piutang = 0: tampilkan "Lunas" (hijau muted)
- [x] Kolom "Order Terakhir": relative date
- [x] Tombol aksi per baris: "Detail" + "Buat Order" (shortcut ke form order baru dengan customer pre-filled)
- [x] Klik baris → navigate ke detail pelanggan (`#/customer/{customerId}`)
- [x] Empty state jika search tidak ketemu: ilustrasi + teks + tombol "Tambah Pelanggan Baru"

**Checklist — Modal Tambah Pelanggan Baru:**
- [x] Tombol "+ Tambah Pelanggan" → buka modal form
- [x] Form fields:
  - Tipe: radio Individual / Perusahaan / Instansi
  - Nama* (label berubah: "Nama Lengkap" untuk individual, "Nama Perusahaan" untuk perusahaan)
  - Nomor HP* (unique, tampilkan error jika sudah ada)
  - Email (opsional)
  - Alamat (textarea, opsional)
  - Catatan internal (textarea, opsional)
- [x] Submit → push ke APP_DATA.customers → refresh tabel → showToast "Pelanggan baru berhasil ditambahkan"
- [x] Validasi: nomor HP tidak boleh duplikat di APP_DATA.customers

**Output yang diharapkan:** Tabel pelanggan terisi, search/filter berfungsi, tambah pelanggan baru bekerja.
**Progress Terakhir:** 2026-05-23 — Daftar pelanggan selesai: stats bar, search/filter/sort/counter, tabel CRM, empty state, modal tambah pelanggan dengan validasi nomor HP unik, toast sukses, dan shortcut "Buat Order" pre-fill customer.

---

#### TASK-032 — Detail Pelanggan + Riwayat Order
**Status:** `[x]` Selesai
**Estimasi:** 75 menit
**Depends on:** TASK-031
**File yang diubah:** `prototype/pages/customers.html`, `prototype/app.js`

**Deskripsi:**
Halaman detail per pelanggan — ini yang paling impressive untuk demo.
Owner bisa lihat 360° view: siapa pelanggan ini, berapa nilainya, apa yang sering dipesan,
berapa piutangnya.

**Checklist — Routing:**
- [x] Route `#/customer/{customerId}` → load detail view (bisa dalam customers.html atau view terpisah)
- [x] Breadcrumb: "Pelanggan → [Nama Pelanggan]"
- [x] Tombol "← Kembali ke Daftar Pelanggan"

**Checklist — Header Pelanggan:**
- [x] Avatar inisial (lingkaran besar dengan inisial nama, warna berdasarkan tipe)
- [x] Nama pelanggan (besar)
- [x] Badge tipe (Individual / Perusahaan / Instansi)
- [x] Nomor HP + email (jika ada)
- [x] Tombol: "Edit" | "Buat Order Baru" | (jika ada piutang: "Catat Pembayaran Piutang")

**Checklist — Metric Cards (baris atas):**
- [x] 4 cards:
  - Total Order (lifetime)
  - Total Spending (Rp, lifetime)
  - Rata-rata Nilai Order (total spending / total order)
  - Piutang Saat Ini (merah jika > 0, hijau "Lunas" jika 0)

**Checklist — Tab Content:**

Tab 1: "Riwayat Pesanan"
- [x] Tabel semua order pelanggan ini (filter dari APP_DATA.orders by customerId)
- [x] Kolom: No. SPK | Produk | Qty | Total | Status | Deadline | Aksi
- [x] Klik No. SPK → navigate ke detail SPK
- [x] Sort: terbaru di atas
- [x] Filter quick: Semua / Aktif / Selesai / Dibatalkan
- [x] Empty state jika belum ada order

Tab 2: "Produk Favorit"
- [x] Agregasi dari riwayat order: produk apa yang paling sering dipesan pelanggan ini
- [x] Tabel: Produk | Jumlah Order | Total Qty | Total Nilai
- [x] Sort by jumlah order (terbanyak di atas)
- [x] Bar chart sederhana (SVG) — 5 produk teratas

Tab 3: "Piutang & Pembayaran"
- [x] Jika tidak ada piutang: tampilkan "✓ Tidak ada piutang outstanding" (hijau)
- [x] Jika ada piutang:
  - Summary: total piutang + daftar SPK yang belum lunas
  - Per SPK: No. SPK | Nilai SPK | Sudah Dibayar | Sisa | Tanggal Jatuh Tempo
  - Tombol "Catat Pembayaran" per baris (modal input nominal + metode bayar)
  - Setelah catat pembayaran: update outstanding di APP_DATA + showToast
- [x] Riwayat semua pembayaran yang pernah diterima dari pelanggan ini (dummy data)

Tab 4: "Catatan"
- [x] Textarea catatan internal tentang pelanggan ini
- [x] Tombol "Simpan Catatan" → update APP_DATA.customers + showToast
- [x] Tampilkan: "Pelanggan sejak [tanggal]" + "Terakhir update [tanggal]"

**Output yang diharapkan:**
- Klik pelanggan dari daftar → halaman detail lengkap
- Semua tab berfungsi dengan data dari APP_DATA
- Tombol "Buat Order Baru" → navigate ke form order dengan customer pre-filled

**Progress Terakhir:** 2026-05-23 — Detail pelanggan selesai: route `#/customer/{customerId}`, breadcrumb, back button, header 360° pelanggan, metric cards, tab riwayat pesanan/produk favorit/piutang/catatan, modal pembayaran piutang, dan shortcut Buat Order Baru pre-fill customer.

---

#### TASK-033 — Edit Pelanggan + Integrasi dengan Modul Lain
**Status:** `[x]` Selesai
**Estimasi:** 45 menit
**Depends on:** TASK-032
**File yang diubah:** `prototype/pages/customers.html`, `prototype/pages/order-new.html`

**Deskripsi:**
Lengkapi fitur edit pelanggan dan pastikan data pelanggan konsisten
di seluruh prototype (form order, detail SPK, dll).

**Checklist — Edit Pelanggan:**
- [x] Tombol "Edit" di header detail pelanggan → buka modal edit
- [x] Form edit: semua field yang ada di form tambah baru (pre-filled dengan data existing)
- [x] Submit → update APP_DATA.customers → refresh halaman detail → showToast
- [x] Tidak bisa edit nomor HP menjadi nomor yang sudah dipakai pelanggan lain

**Checklist — Integrasi dengan Form Order Baru:**
- [x] Di `order-new.html`: saat user pilih customer dari autocomplete:
  - Tampilkan card info pelanggan di bawah field (nama, tipe, total order, piutang jika ada)
  - Jika pelanggan punya piutang: tampilkan warning kuning "Pelanggan ini memiliki piutang Rp X. Pastikan sudah dikonfirmasi."
  - Link "Lihat Detail Pelanggan" → buka di tab baru (`#/customer/{id}`)
- [x] Di `order-detail.html`: nama customer adalah link → klik → navigate ke detail pelanggan

**Checklist — Top Customer di Dashboard:**
- [x] Di `pages/dashboard.html` (owner view): tambahkan section "Top 5 Pelanggan Bulan Ini"
  - List: ranking | nama | total spending bulan ini | jumlah order
  - Di bawah chart revenue atau di grid bawah (sesuaikan layout yang sudah ada)
  - Klik nama → navigate ke detail pelanggan
- [x] Data: kalkulasi dari APP_DATA.orders yang statusnya delivered/closed bulan ini

**Output yang diharapkan:**
- Edit pelanggan bekerja
- Form order menampilkan info + warning piutang pelanggan
- Dashboard owner punya section top customer
- Nama customer di detail SPK adalah link ke profil pelanggan
**Progress Terakhir:** 2026-05-23 — TASK-033 selesai: edit pelanggan aktif dari detail pelanggan, validasi nomor HP duplikat tetap berjalan, form order baru menampilkan card info/warning piutang/link detail, nama customer di detail SPK menjadi link profil, dan dashboard owner menampilkan Top 5 Pelanggan Bulan Ini dari order delivered/closed.

---

### URUTAN EKSEKUSI FASE 8

Kerjakan setelah TASK-027 selesai (atau paralel jika berbeda file):

1. **TASK-030** dulu — setup routing + sidebar + extend data
2. **TASK-031** — daftar pelanggan (halaman utama)
3. **TASK-032** — detail pelanggan (halaman terpenting)
4. **TASK-033** — edit + integrasi ke modul lain (kerjakan terakhir karena menyentuh file lain)

TASK-033 harus dikerjakan setelah TASK-028 (PO) dan TASK-029 (Traceability) selesai,
karena integrasi ke dashboard dan order-new mungkin overlap dengan perubahan dari fase 7.

---

### FASE 8 â€” UPDATE PROTOTYPE v1.1

#### TASK-101 â€” Hapus stage "Review Pelanggan" dari seluruh prototype
**Status:** `[x]` Selesai  
**Estimasi:** 30 menit  
**Deskripsi:**  
Hapus stage `design_review` / "Review Pelanggan" dari lifecycle, kanban, filter status, dan progress detail SPK.

**Checklist:**
- [x] Tidak ada kemunculan teks "Review Pelanggan" di folder `prototype`
- [x] Tidak ada kemunculan `design_review` di folder `prototype`
- [x] Kanban produksi tidak lagi punya kolom Review Pelanggan
- [x] Progress detail SPK memakai tahap: Terkonfirmasi, Antrian Desain, Sedang Desain, Antrian Cetak, Sedang Cetak, Finishing, Siap Ambil, Selesai
- [x] State machine `in_design` bisa masuk ke `production_queue`
- [x] Aksi revisi desain tetap berada di `in_design`
- [x] `app.js` dan `data.js` lolos syntax check

**Progress Terakhir:** 2026-05-25 â€” TASK-101 selesai. Status `production_queue` ditambahkan sebagai "Antrian Cetak", kolom kanban Review Pelanggan dihapus, aksi desain diarahkan ke Antrian Cetak, dan badge status baru ditambahkan.

---

#### TASK-102 â€” Implementasi SPK Multi-Item: Update data.js
**Status:** `[x]` Selesai  
**Estimasi:** 45 menit  
**Depends on:** TASK-101  
**Deskripsi:**  
Update struktur `APP_DATA.orders` agar semua SPK memiliki `items` array, dengan minimal 5 SPK multi-item untuk demo.

**Checklist:**
- [x] Semua 32 order memiliki `items` array
- [x] 5 SPK memiliki lebih dari 1 item
- [x] Setiap item punya field wajib: `itemId`, `seq`, `product`, `specs`, `qty`, `unit`, `unitPrice`, `total`, `needsDesign`, `status`, `assignedTo`, `materialEstimate`, `materialActual`
- [x] Field lama (`productName`, `qty`, `unit`, `status`, `total`) tetap dipertahankan sementara untuk kompatibilitas halaman yang belum di-update
- [x] Helper `getOrderDerivedStatus(order)` tersedia di `window`
- [x] `data.js` lolos syntax check dan validasi runtime Node

**Progress Terakhir:** 2026-05-25 â€” TASK-102 selesai. Generator order sekarang membuat item produksi per SPK, 5 order demo dibuat multi-item, total dan status derived dihitung dari item, serta estimasi/aktual material dummy tersedia per item.

---

## BUGS & ISSUES

*Catat di sini setiap bug yang ditemukan saat development.*

| ID | Ditemukan di Task | Deskripsi | Status | Solusi |
|---|---|---|---|---|
| BUG-001 | Post TASK-019 | Sidebar hilang saat navigasi antar halaman — class `hidden` menempel setelah dari fullscreen route | ✅ Fixed | Root cause: `classList.toggle("hidden", undefined)` tidak reliable. Fix: ganti toggle dengan `classList.add/remove` yang eksplisit di `updateShellVisibility`. |
| BUG-002 | TASK-023 | Modal "Catat Penerimaan Barang" — tombol × muncul di kiri bawah judul, form-row (Qty/Satuan, Harga/Tanggal) tidak side-by-side | ✅ Fixed | Root cause: `.modal-header` tidak punya `display:flex`, `.form-row` dan `.modal-close` belum ada di style.css. Fix: tambah class `.modal-header{flex}`, `.modal-close`, `.form-row{grid 1fr 1fr}`, `.modal-title`, `.modal-form` ke style.css; pindahkan form fields ke dalam `.modal-form` wrapper. |
| BUG-003 | Recheck sesi 37 | Route `settings` di ROUTES memetakan ke `page: "pricing"` — klik "Pengaturan" di sidebar owner membuka Pricing page bukan halaman Settings | ✅ Fixed | Buat `pages/settings.html` + `renderSettingsPage()` di app.js. Settings punya 6 tab: Profil Bisnis, Cabang, Pengguna & Akses, Notifikasi, Tampilan, Paket & Langganan (termasuk tabel perbandingan pricing + link ke `/pricing` fullscreen). Route `pricing` tetap ada sebagai fullscreen standalone. |
| BUG-004 | Sesi 38 | Checklist finishing di halaman Pesanan Baru — checkbox Laminasi Doff, Laminasi Glossy, Mata Ayam tampil jauh lebih besar daripada Cutting dan Lipat | ✅ Fixed | Root cause: native `<input type="checkbox">` sebagai flex child tidak di-pin ukurannya; label 2 baris menyebabkan checkbox meregang. Fix: tambah rule `input[type="checkbox"] { width: 16px; height: 16px; min-width: 16px; flex-shrink: 0 }` di `.checkbox-grid label` di style.css. |
| BUG-005 | Sesi 39 | Header "Lihat sebagai:" wrap ke 2 baris di header navbar | ✅ Fixed | Root cause: `.role-switcher` tidak punya `white-space: nowrap`. Fix: tambah `white-space: nowrap; flex-shrink: 0` ke class `.role-switcher` di style.css. |
| BUG-006 | Sesi 39 | Filter Piutang dan Sort di halaman Pelanggan terlalu mepet (tidak ada gap) | ✅ Fixed | Root cause: filter grid pakai `.grid` (hanya `display:grid` tanpa template-columns dan gap). Fix: ganti ke `.content-grid` (12-col + gap), search diubah ke col-12, Tipe/Piutang/Sort masing-masing col-4 agar tersebar rapi dengan gap bawaan. |

---

## KEPUTUSAN TEKNIS

*Catat setiap keputusan teknis yang diambil saat development agar tidak berubah-ubah.*

| Keputusan | Alasan | Tanggal |
|---|---|---|
| Pure vanilla JS, tanpa framework | Prototype harus bisa dibuka langsung tanpa build step | 2026-05-23 |
| Hash-based routing | Tidak butuh server, bisa buka dari filesystem | 2026-05-23 |
| localStorage untuk komunikasi antar tab | Queue display dan kasir perlu sinkron tanpa server | 2026-05-23 |
| Web Speech API untuk audio | Tidak butuh API eksternal, native browser | 2026-05-23 |
| SVG/Canvas untuk chart | Tidak fetch library CDN, bisa offline | 2026-05-23 |
| CSS custom properties | Konsistensi design system tanpa preprocessor | 2026-05-23 |

---

## CATATAN SESI

*Catat di sini setiap kali mulai atau selesai sesi kerja.*

| Sesi | Tanggal | Task Dikerjakan | Task Selesai | Catatan |
|---|---|---|---|---|
| 1 | 2026-05-23 | Setup awal, tulis CLAUDE.md & STATE.md | CLAUDE.md, STATE.md | Belum mulai coding prototype |
| 2 | 2026-05-23 | TASK-001 — Buat struktur folder dan file kosong | TASK-001 | Struktur `/prototype`, `/prototype/pages`, 4 file utama, dan 13 page HTML sudah dibuat |
| 3 | 2026-05-23 | TASK-002 — Tulis data.js dummy data | TASK-002 | `APP_DATA` lengkap dibuat dan divalidasi lewat Node |
| 4 | 2026-05-23 | TASK-003 — Tulis style.css design system global | TASK-003 | CSS global selesai: tokens, reset, shell layout, komponen, tabel, form, modal, toast, dan utilities |
| 5 | 2026-05-23 | TASK-004 — Shell layout & hash routing | TASK-004 | Shell utama, sidebar, header, role switcher, hash router, loader halaman, toast, dan formatter global selesai |
| 6 | 2026-05-23 | TASK-005 — Login page | TASK-005 | Login full screen, form, shortcut role, dan handler redirect selesai |
| 7 | 2026-05-23 | TASK-006 — Owner Dashboard | TASK-006 | Dashboard owner selesai: metrics, alert overdue, chart SVG, top products, status produksi, quick actions |
| 8 | 2026-05-23 | TASK-007 — Sidebar navigation & role visibility | TASK-007 | Sidebar role-based lengkap, active/hover state, badge overdue, footer user, logout, dan route guard selesai |
| 9 | 2026-05-23 | TASK-008 — Daftar Order | TASK-008 | Orders page selesai: tabel data, status/search/date filter, empty state, counter, overdue row, dan link detail |
| 10 | 2026-05-23 | TASK-009 — Input Order Baru | TASK-009 | Form 3 section selesai: autocomplete customer, produk/spec dinamis, kalkulasi total, pembayaran, upload dummy, submit SPK baru |
| 11 | 2026-05-23 | TASK-010 — Detail SPK | TASK-010 | Detail SPK selesai: header, progress, info, timeline, aksi status, catatan, print, duplikat, batal |
| 12 | 2026-05-23 | TASK-011 — Production Board | TASK-011 | Kanban produksi selesai: filter, counter, card SPK, modal, update status, dan view operator |
| 13 | 2026-05-23 | TASK-012 — Queue System Kasir | TASK-012 | Queue kasir selesai: counter controls, waiting list, tambah/panggil/skip/recall, open display, localStorage sync |
| 14 | 2026-05-23 | TASK-013 — Pricing Page | TASK-013 | Pricing standalone selesai: 5 tier, Pro highlighted, comparison table, CTA feedback, footer |
| 15 | 2026-05-23 | TASK-014 — Production Display TV Mode | TASK-014 | Display produksi full-screen selesai: dark mode, jam, 3 panel, simulasi SPK, notifikasi, TTS, mute, PIN exit |
| 16 | 2026-05-23 | TASK-015 — Queue Display Layar Antrian | TASK-015 | Display antrian selesai: nomor besar, waiting list, running text, polling localStorage, TTS, overlay audio, animasi |
| 17 | 2026-05-23 | TASK-016 — Inventory Preview | TASK-016 | Inventory preview selesai: tabel stok readonly, low-stock alert, action disabled, preview QR/waste/PO/traceability |
| 18 | 2026-05-23 | TASK-017 — HR & Payroll Preview | TASK-017 | HR preview selesai: tabel karyawan, tab preview, overlay lock absensi/payroll, highlight upah pemasangan variable |
| 19 | 2026-05-23 | TASK-018 — Finance Preview | TASK-018 | Finance preview selesai: P&L dummy, metric cards, SVG chart, locked report cards, callout otomatisasi |
| 20 | 2026-05-23 | TASK-019 — Integrasi antar halaman & konsistensi data | TASK-019 | Dashboard metrics live, overdue filter, production link, inventory alert, queue sync, breadcrumb, dan data status terhubung |
| 21 | 2026-05-23 | BUG-001 — Fix sidebar hilang setelah navigasi dari fullscreen route | BUG-001 | Root cause ditemukan via DevTools: `classList.toggle` dengan `undefined` tidak reliable. Fix: ganti dengan `add/remove` eksplisit di `updateShellVisibility`. |
| 22 | 2026-05-23 | TASK-023 — Inventory: Catat Penerimaan Barang | TASK-023 | Button "+ Catat Penerimaan" functional, modal form lengkap, tab Stok & Riwayat, incomingLog dummy 12 entry, persist ke localStorage, loadStoredInventory() saat init. |
| 23 | 2026-05-23 | TASK-024 — Inventory: Stok Opname | TASK-024 | Wizard 3 langkah: Step 1 buat sesi, Step 2 input stok fisik + live diff, Step 3 review & approve. Tab "Stok Opname" + Riwayat session. 2 sesi opname dummy + adjustmentLog. Draft tersimpan ke localStorage. Adjust stok setelah approval. |
| 24 | 2026-05-23 | TASK-025 — Inventory: Laporan Penggunaan | TASK-025 | Tab "Laporan Penggunaan" + tombol di header. Filter periode: Minggu Ini / Bulan Ini / Bulan Lalu / Semua. Metric cards (pemakaian, waste, waste rate). SVG bar chart harian/mingguan. Tabel ringkasan per bahan. Tabel per SPK + filter dropdown by bahan. 39 entry dummy usageLog tersebar 35 hari. |
| 25 | 2026-05-23 | TASK-026 — Inventory: QR Label Generate & Scan | TASK-026 | Kolom QR icon di tabel stok → modal label (preview stiker + QR code via qrcode.js CDN + dropdown batch). Tombol "Label QR" per entry riwayat penerimaan. Download PNG (canvas.toBlob), Cetak Label (window.print + @media print CSS). Modal Scan QR dengan viewfinder animasi, input manual batch lookup, dan 3 tombol simulasi scan demo. CSS `.qr-label-sticker`, `.btn-icon-qr`, print CSS. |
| 26 | 2026-05-23 | TASK-027 — Inventory: Waste Tracking per SPK | TASK-027 | Section "Material & Waste" di order-detail (status printing+), tombol "+ Catat Pemakaian" → modal form (bahan, qty, waste, kategori, notes) + stock warning jika melebihi stok. Submit: tambah usageLog, kurangi stok, persist localStorage. Tab "Laporan Waste" di inventory: filter periode, 3 metric cards, SVG bar chart 7 hari, tabel detail + filter by bahan & kategori inline. loadStoredInventory() extend untuk usageLog. |
| 27 | 2026-05-23 | TASK-028 — Inventory: Purchase Order ke Supplier | TASK-028 | Tab "Purchase Order" di inventory, daftar PO dengan filter status/supplier, modal buat PO baru dengan item dinamis dan total otomatis, detail PO + timeline, aksi kirim/batal/catat penerimaan partial, tombol "Buat PO" untuk stok menipis, persist `purchaseOrders` ke localStorage, dan 5 dummy PO berbagai status. |
| 28 | 2026-05-23 | TASK-029 — Inventory: Traceability per SPK | TASK-029 | `APP_DATA.batches` ditambahkan dan semua `usageLog` punya `batchId`. Detail SPK menampilkan batch per material + tombol lihat batch. Inventory punya kolom badge batch, modal daftar batch per bahan, modal penggunaan batch dua arah, link ke detail SPK, dan section Scan Batch untuk lookup Batch ID. |
| 29 | 2026-05-23 | BUGFIX — Trace batch tidak terlihat di detail SPK | TASK-029 | Penyebab: data `usageLog` lama di localStorage bisa belum punya `batchId`, dan tombol batch sebelumnya hanya berupa teks Batch ID sehingga kurang jelas. Fix: backfill `batchId` saat load, render kode batch + tombol eksplisit "Lihat Batch", fallback ke modal pilih batch bila belum ada batch. Render test untuk `SPK-SBY-20260518-0001` menghasilkan 3 tombol "Lihat Batch". |
| 30 | 2026-05-23 | TASK-020 — Responsive & cross-browser check | TASK-020 | Checklist TASK-020 ditandai selesai sesuai instruksi user. Preflight CLI sudah dilakukan sebelumnya: server lokal 5500 OK, URL prototype `/prototype/index.html`, semua page HTML utama 200, `app.js`/`data.js` syntax OK, dan tidak ada TODO/Lorem visible. |
| 31 | 2026-05-23 | TASK-021 — Demo script preparation | TASK-021 | Ditandai selesai berdasarkan verifikasi manual user. Flow demo dan data dummy dinyatakan sudah mendukung demo tanpa hitch. |
| 32 | 2026-05-23 | TASK-022 — Final QA checklist | TASK-022 | Ditandai selesai berdasarkan final QA manual user. Semua checklist QA dianggap sudah pass; beberapa modul preview sudah berkembang menjadi fitur working. |
| 33 | 2026-05-23 | TASK-030 — Setup halaman pelanggan + sidebar menu | TASK-030 | Halaman `prototype/pages/customers.html` dibuat, route `#/customers` dan menu sidebar "Pelanggan" ditambahkan setelah Pesanan, role owner/branch_manager/cashier bisa akses, option Branch Manager tersedia di role switcher, ikon customers ditambahkan, data customers dilengkapi field CRM, dan semua order tetap link ke customer valid. |
| 34 | 2026-05-23 | TASK-031 — Daftar Pelanggan | TASK-031 | Halaman pelanggan sekarang menampilkan stats bar, search, filter tipe/piutang, sort, counter, tabel pelanggan lengkap, empty state, modal tambah pelanggan dengan validasi HP unik, toast sukses, dan shortcut Buat Order dengan customer pre-filled. Route placeholder `#/customer/{customerId}` disiapkan untuk TASK-032. |
| 35 | 2026-05-23 | TASK-032 — Detail Pelanggan + Riwayat Order | TASK-032 | Detail pelanggan selesai: route `#/customer/{customerId}` render view lengkap, breadcrumb dan back button tersedia, header pelanggan + metric cards, tab riwayat pesanan/produk favorit/piutang/catatan berfungsi, modal pembayaran piutang update APP_DATA, catatan tersimpan, dan Buat Order Baru pre-fill customer. |
| 36 | 2026-05-23 | TASK-033 — Edit Pelanggan + Integrasi Modul Lain | TASK-033 | Edit pelanggan selesai dengan form pre-filled dan validasi HP unik. Form order baru menampilkan card info pelanggan + warning piutang + link detail, detail SPK menautkan nama customer ke profil, dan dashboard owner menampilkan Top 5 Pelanggan Bulan Ini dari order delivered/closed. |
| 37 | 2026-05-23 | Recheck menyeluruh semua task | — | Audit static: syntax check pass, 100+ fungsi di app.js terverifikasi, data dummy lengkap (33 task = 100%). Ditemukan BUG-003 (route settings → pricing). STATE.md dirapikan: ringkasan dikoreksi ke 33/33 = 100%, NEXT TASK diupdate, BUG-003 dicatat. |
| 38 | 2026-05-23 | Fix BUG-004 — checklist finishing ukuran tidak konsisten | BUG-004 | Tambah CSS `input[type="checkbox"] { width/height: 16px; min-width: 16px; flex-shrink: 0 }` di `.checkbox-grid label` pada style.css. Semua 5 opsi finishing kini seragam. |
| 39 | 2026-05-23 | Fix BUG-005 & BUG-006 — "Lihat sebagai:" wrap 2 baris + filter Piutang/Sort mepet | BUG-005, BUG-006 | style.css: tambah `white-space:nowrap; flex-shrink:0` ke `.role-switcher`. customers.html: ganti `.grid` → `.content-grid`, search col-4→col-12, Tipe/Piutang/Sort masing-masing col-4. |
| 40 | 2026-05-23 | Fix BUG-003 — Buat halaman Pengaturan proper | BUG-003 | Buat `pages/settings.html` + `renderSettingsPage()` + 6 render function tab. Route `settings` diarahkan ke page `settings`. Tabs: Profil Bisnis (form data bisnis), Cabang (tabel dari APP_DATA), Pengguna & Akses (tabel employee + matriks akses), Notifikasi (toggle per kategori), Tampilan (display/format options), Paket & Langganan (status plan + plan cards + tabel perbandingan + link pricing fullscreen). CSS settings ~130 baris di style.css. |

| 41 | 2026-05-25 | TASK-101 â€” Hapus stage Review Pelanggan | TASK-101 | Kolom kanban Review Pelanggan dihapus, status `production_queue` ditambahkan sebagai Antrian Cetak, progress detail dan state machine diperbarui, serta validasi statis tidak menemukan `design_review` atau "Review Pelanggan" di folder `prototype`. |
| 42 | 2026-05-25 | TASK-102 â€” Implementasi SPK Multi-Item: Update data.js | TASK-102 | Semua 32 order sekarang punya `items` array, 5 SPK dibuat multi-item, helper `window.getOrderDerivedStatus` ditambahkan, dan validasi runtime memastikan field wajib lengkap. |

---

## NEXT TASK

**Task berikutnya:** TASK-109 â€” Fix UX Issues Kritis dari Audit, lalu TASK-103 â€” Update Daftar Pesanan untuk Multi-Item.

Recheck terakhir (sesi 37, 2026-05-23) mengkonfirmasi:
- 33/33 task selesai, tidak ada yang tertinggal
- `app.js` dan `data.js` lolos syntax check
- Tidak ada teks placeholder / Lorem ipsum yang visible
- Data dummy lengkap dan konsisten antar modul

**Backlog yang perlu didiskusikan dengan user sebelum dikerjakan:**
- BUG-003 — Route Pengaturan → Pricing (low priority, lihat BUGS & ISSUES)
- Modul HR & Payroll functional (saat ini masih preview/locked)
- Modul Finance functional (saat ini masih preview/locked)
- Halaman Settings yang sesungguhnya

Instruksi untuk AI:
> Prototype sudah complete. Jangan mulai task baru tanpa instruksi eksplisit dari user. Baca CLAUDE.md dan STATE.md lebih dulu setiap sesi baru.
