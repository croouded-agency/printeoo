# STATE.md — Printeoo Prototype Progress
**Last Updated:** 2026-05-23  
**Status Keseluruhan:** 🟡 Dalam Progress  

> Update file ini setiap kali memulai atau menyelesaikan task.  
> Ini adalah memori kerja AI antar sesi. Jangan hapus entry yang sudah selesai.

---

## RINGKASAN PROGRESS

| Fase | Task | Selesai | Progress |
|---|---|---|---|
| 0 — Setup | 3 | 3 | 100% |
| 1 — Foundation | 4 | 4 | 100% |
| 2 — Core Pages | 6 | 3 | 50% |
| 3 — Production | 3 | 2 | 67% |
| 4 — Display & Audio | 2 | 2 | 100% |
| 5 — Supporting Pages | 3 | 3 | 100% |
| 6 — Polish & Integration | 3 | 1 | 33% |
| **Total** | **24** | **19** | **79%** |

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
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 30 menit  
**Depends on:** TASK-019  

**Checklist:**
- [ ] Test di Chrome (priority) — semua fitur termasuk audio
- [ ] Test di Safari (iOS) — terutama audio TTS
- [ ] Test di Firefox
- [ ] Test lebar 1280px (desktop minimum)
- [ ] Test lebar 1024px (laptop kecil)
- [ ] Test lebar 768px (tablet landscape)
- [ ] Production display dan queue display: test di tab penuh (F11)
- [ ] Tidak ada console error di halaman manapun
- [ ] Tidak ada layout broken di semua lebar yang di-test

**Output yang diharapkan:** Prototype berjalan clean di semua kondisi test.  
**Progress Terakhir:** —  
**Catatan:** —

---

#### TASK-021 — Demo script preparation (data & flow)
**Status:** `[ ]` Belum dikerjakan  
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
- [ ] Ada minimal 5 SPK dengan status berbeda di production board untuk terlihat sibuk
- [ ] Ada 1-2 SPK overdue yang visible di dashboard dan board
- [ ] Ada 1 SPK urgent yang highlighted
- [ ] Revenue dashboard: angka yang impressive tapi realistis
- [ ] Antrian: sudah ada 5-8 nomor menunggu saat display dibuka
- [ ] Semua tombol "Simulasi" bekerja dengan mulus

**Output yang diharapkan:** Flow demo 10 menit bisa dilakukan tanpa hitch.  
**Progress Terakhir:** —  
**Catatan:** —

---

#### TASK-022 — Final QA checklist
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 30 menit  
**Depends on:** TASK-021  

**Checklist:**
- [ ] Semua 13 halaman bisa dibuka tanpa error
- [ ] Semua link navigasi sidebar bekerja
- [ ] Role switcher bekerja di semua halaman
- [ ] Audio TTS bekerja di production display dan queue display (Chrome)
- [ ] Form input order bisa disubmit dan data muncul di orders list
- [ ] Production board kanban: klik card, modal muncul, update status bekerja
- [ ] Dashboard angka masuk akal dan konsisten
- [ ] Tidak ada teks placeholder "Lorem ipsum" atau "TODO" yang terlihat
- [ ] Semua teks UI dalam Bahasa Indonesia
- [ ] Pricing page: 5 tier tampil dengan benar, card Pro ter-highlight
- [ ] Preview halaman Segera Hadir: terlihat informatif bukan kosong
- [ ] File bisa dibuka langsung dari filesystem (tidak butuh server)

**Output yang diharapkan:** Prototype siap demo, bisa dibuka langsung dengan double-click index.html.  
**Progress Terakhir:** —  
**Catatan:** —

---

## BUGS & ISSUES

*Catat di sini setiap bug yang ditemukan saat development.*

| ID | Ditemukan di Task | Deskripsi | Status | Solusi |
|---|---|---|---|---|
| — | — | Belum ada bug tercatat | — | — |

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

---

## NEXT TASK

**Task berikutnya yang harus dikerjakan: TASK-020**

Instruksi untuk AI:
> Baca CLAUDE.md dulu, lalu kerjakan TASK-020: lakukan polish visual dan microcopy di seluruh prototype, pastikan tampilan demo rapi, empty/loading states jelas, dan Bahasa Indonesia konsisten. Setelah selesai, update STATE.md: ubah status TASK-020 menjadi `[x]` dan catat di tabel Catatan Sesi.
