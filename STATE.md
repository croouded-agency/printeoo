# STATE.md — Printeoo Prototype Progress
**Last Updated:** 2026-05-23  
**Status Keseluruhan:** 🔴 Belum Dimulai  

> Update file ini setiap kali memulai atau menyelesaikan task.  
> Ini adalah memori kerja AI antar sesi. Jangan hapus entry yang sudah selesai.

---

## RINGKASAN PROGRESS

| Fase | Task | Selesai | Progress |
|---|---|---|---|
| 0 — Setup | 3 | 0 | 0% |
| 1 — Foundation | 4 | 0 | 0% |
| 2 — Core Pages | 6 | 0 | 0% |
| 3 — Production | 3 | 0 | 0% |
| 4 — Display & Audio | 2 | 0 | 0% |
| 5 — Supporting Pages | 3 | 0 | 0% |
| 6 — Polish & Integration | 3 | 0 | 0% |
| **Total** | **24** | **0** | **0%** |

---

## TASK LIST

---

### FASE 0 — SETUP STRUKTUR

#### TASK-001 — Buat struktur folder dan file kosong
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 10 menit  
**Deskripsi:**  
Buat semua file dan folder sesuai struktur di CLAUDE.md. File boleh kosong dulu, yang penting struktur ada.

**Checklist:**
- [ ] Buat folder `/prototype`
- [ ] Buat folder `/prototype/pages`
- [ ] Buat file `/prototype/index.html` (boilerplate saja)
- [ ] Buat file `/prototype/style.css` (kosong + komentar section)
- [ ] Buat file `/prototype/app.js` (kosong + komentar section)
- [ ] Buat file `/prototype/data.js` (kosong + komentar section)
- [ ] Buat semua file di `/prototype/pages/` (13 file html, boleh kosong)

**Output yang diharapkan:** Struktur folder lengkap, semua file ada meski kosong.  
**Progress Terakhir:** —  
**Catatan:** —

---

#### TASK-002 — Tulis data.js (semua dummy data)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 30 menit  
**Depends on:** TASK-001  
**Deskripsi:**  
Isi `data.js` dengan semua dummy data yang dibutuhkan prototype. Ini fondasi semua halaman.

**Checklist:**
- [ ] `APP_DATA.customers` — 20+ pelanggan (mix individual & perusahaan Indonesia)
- [ ] `APP_DATA.products` — 15+ produk print shop dengan pricing
- [ ] `APP_DATA.orders` — 30+ SPK dengan berbagai status, prioritas, tanggal relatif
- [ ] `APP_DATA.employees` — 10+ karyawan (mix tipe kontrak)
- [ ] `APP_DATA.inventory` — 15+ item bahan baku (2-3 yang hampir habis)
- [ ] `APP_DATA.dashboard` — metrics, chart data 7 hari, top produk
- [ ] `APP_DATA.branches` — 2 cabang (Surabaya Pusat, Surabaya Barat)
- [ ] `APP_DATA.queueNumbers` — state antrian awal
- [ ] Semua tanggal pakai offset dari `new Date()` bukan hard-coded
- [ ] Expose ke window: `window.APP_DATA = APP_DATA`

**Output yang diharapkan:** `data.js` lengkap, bisa di-load di browser tanpa error.  
**Progress Terakhir:** —  
**Catatan:** Lihat detail format data di CLAUDE.md section "DATA DUMMY"

---

#### TASK-003 — Tulis style.css (design system global)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 45 menit  
**Depends on:** TASK-001  
**Deskripsi:**  
Buat `style.css` dengan semua CSS variables, reset, komponen global, dan layout shell.

**Checklist:**
- [ ] CSS reset (box-sizing, margin, padding)
- [ ] CSS custom properties (semua variabel warna, font, spacing dari CLAUDE.md)
- [ ] Google Fonts import: Inter
- [ ] Layout: `.app-shell`, `.sidebar`, `.main-content`, `.header`
- [ ] Komponen: `.card`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- [ ] Badge status: semua warna sesuai CLAUDE.md
- [ ] Tabel: `.data-table` dengan hover state
- [ ] Form: input, select, textarea, label styling
- [ ] Modal: `.modal-overlay`, `.modal-box`
- [ ] Toast notification: `.toast`, `.toast-success`, `.toast-error`
- [ ] Sidebar nav item: active state, hover state
- [ ] Utility classes: `.text-muted`, `.text-danger`, `.flex`, `.gap-*`, dll

**Output yang diharapkan:** Buka `index.html` → layout shell terlihat rapi meski belum ada konten.  
**Progress Terakhir:** —  
**Catatan:** Pure CSS, tidak ada framework eksternal

---

### FASE 1 — FOUNDATION (ROUTING & SHELL)

#### TASK-004 — index.html + app.js: shell layout & routing
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 45 menit  
**Depends on:** TASK-001, TASK-003  
**Deskripsi:**  
Buat `index.html` sebagai shell utama dan implement routing hash-based di `app.js`.

**Checklist index.html:**
- [ ] `<head>` lengkap: charset, viewport, title "Printeoo", link ke style.css
- [ ] `<body>` dengan struktur: `#app-shell` yang berisi `#sidebar` + `#main-content`
- [ ] Header: logo "Printeoo", breadcrumb placeholder, role switcher dropdown
- [ ] Sidebar: semua menu item (ikon + label Bahasa Indonesia)
- [ ] `<div id="app">` sebagai container konten halaman
- [ ] Script tags di bawah: data.js, app.js

**Checklist app.js:**
- [ ] `APP_STATE` object: currentRole, currentUser, currentBranch
- [ ] Hash router: listen `hashchange`, parse hash, load halaman
- [ ] `loadPage(pageName)` — fetch html dari `/pages/`, inject ke `#app`
- [ ] `updateSidebar(role)` — show/hide menu sesuai role
- [ ] Role switcher: dropdown handler → update `APP_STATE.currentRole` → re-render sidebar + reload halaman
- [ ] Default route: jika hash kosong → cek login state → redirect ke login atau dashboard
- [ ] `showToast(message, type)` — global function untuk notifikasi
- [ ] `formatCurrency(number)` — format Rp 1.234.000
- [ ] `formatDate(date)` — format "23 Mei 2026"
- [ ] `formatRelativeDate(date)` — "Hari ini", "Besok", "Kemarin", "2 hari lagi", "3 hari lalu"

**Output yang diharapkan:** Buka `index.html` → layout shell muncul, sidebar ada, role switcher berfungsi.  
**Progress Terakhir:** —  
**Catatan:** —

---

#### TASK-005 — Login page
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 30 menit  
**Depends on:** TASK-003, TASK-004  
**Deskripsi:**  
Halaman login yang clean, dengan shortcut masuk sebagai role tertentu.

**Checklist:**
- [ ] Layout: full screen, gradient background, card putih di tengah
- [ ] Logo Printeoo di atas card (teks+ikon sederhana, bukan image)
- [ ] Form: input email + password + tombol "Masuk"
- [ ] 4 tombol shortcut: "Masuk sebagai Owner", "Kasir", "Operator", "Display Mode"
- [ ] Klik tombol apapun → set role di APP_STATE → redirect ke dashboard (atau display sesuai role)
- [ ] Tidak ada sidebar/header di halaman ini (full screen)
- [ ] Tagline kecil di bawah: "Software print shop modern untuk Indonesia"

**Output yang diharapkan:** Buka `#/login` → halaman login tampil cantik, klik masuk → redirect benar.  
**Progress Terakhir:** —  
**Catatan:** —

---

#### TASK-006 — Owner Dashboard
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 60 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Dashboard owner yang data-rich dan visual. Ini halaman pertama yang dilihat Yanuar setelah login.

**Checklist:**
- [ ] Greeting: "Selamat pagi/siang/sore, [nama] ☀️" (dinamis berdasarkan jam)
- [ ] 4 metric cards baris atas (dengan ikon, angka besar, % perubahan dari kemarin)
  - Pesanan Hari Ini (angka + trend arrow)
  - Revenue Hari Ini (Rp format + trend)
  - Selesai Hari Ini (angka + % completion rate)
  - Overdue / Perlu Perhatian (angka merah jika > 0)
- [ ] Chart revenue 7 hari: bar chart sederhana pakai SVG atau Canvas (TANPA library eksternal)
- [ ] Grid 2 kolom:
  - Kiri: Top 5 Produk Bulan Ini (list dengan mini bar horizontal)
  - Kanan: Status Produksi Sekarang (mini kanban count per stage)
- [ ] Alert box merah (conditional): muncul hanya jika ada SPK overdue
- [ ] Quick actions: tombol "+ Pesanan Baru", "Lihat Semua Pesanan"
- [ ] Semua angka dari `APP_DATA.dashboard`

**Output yang diharapkan:** Dashboard terisi penuh, semua data tampil, visual menarik.  
**Progress Terakhir:** —  
**Catatan:** Chart pakai pure SVG/Canvas — jangan fetch library dari CDN

---

#### TASK-007 — Sidebar navigation & role-based visibility
**Status:** `[ ]` Belum dikerjakan  
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
- [ ] Ikon SVG inline untuk setiap menu (bukan font icon eksternal)
- [ ] Active state: menu yang aktif punya background biru muda + teks biru
- [ ] Hover state: background abu muda
- [ ] Badge merah pada "Pesanan" jika ada order overdue (dari APP_DATA)
- [ ] Bagian bawah sidebar: info user (nama + role) + tombol "Keluar"
- [ ] Logo Printeoo di atas sidebar

**Output yang diharapkan:** Ganti role → menu berubah sesuai. Klik menu → navigate ke halaman.  
**Progress Terakhir:** —  
**Catatan:** —

---

### FASE 2 — CORE PAGES

#### TASK-008 — Daftar Order (orders.html)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 60 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Tabel order yang interaktif dengan filter dan search.

**Checklist:**
- [ ] Header halaman: judul "Pesanan" + tombol "+ Pesanan Baru"
- [ ] Filter bar: dropdown Status (semua opsi), input Search, tombol filter cepat (Hari Ini / Minggu Ini / Semua)
- [ ] Tabel dengan kolom: No. SPK | Customer | Produk | Qty | Total | Deadline | Status | Aksi
- [ ] Status badge berwarna sesuai design system
- [ ] Deadline: tampilkan relative date (Hari ini, Besok, dll) — overdue tampilkan teks merah
- [ ] Row overdue: background #FFF5F5 (merah sangat muda)
- [ ] Kolom Aksi: tombol "Detail"
- [ ] Klik row atau tombol Detail → navigate ke `#/order/{spk_number}`
- [ ] Filter Status berfungsi (filter `APP_DATA.orders`)
- [ ] Search berfungsi (filter by nama customer atau nomor SPK)
- [ ] Filter tanggal berfungsi
- [ ] Empty state jika tidak ada hasil: ilustrasi + teks
- [ ] Counter: "Menampilkan X dari Y pesanan"

**Output yang diharapkan:** Tabel terisi data dummy, filter dan search berfungsi.  
**Progress Terakhir:** —  
**Catatan:** —

---

#### TASK-009 — Input Order Baru (order-new.html)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 75 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Form input order yang terasa smooth dan intelligent. Ini salah satu halaman yang paling sering dipakai.

**Checklist:**
- [ ] Layout: 3 section dengan divider (Data Customer / Detail Pesanan / Produksi & Pembayaran)
- [ ] **Section 1 — Data Customer:**
  - Input nama customer dengan autocomplete (type 2+ karakter → dropdown suggestion dari APP_DATA.customers)
  - Saat pilih customer existing: auto-fill nomor HP
  - Input nomor HP (auto-format saat type)
  - Radio: Walk-in / Online / Telepon
- [ ] **Section 2 — Detail Pesanan:**
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
- [ ] **Section 3 — Produksi & Pembayaran:**
  - Deadline: date picker + time picker
  - Prioritas: radio Normal / Urgent / VIP (Urgent dan VIP tampilkan badge preview)
  - Butuh desain: toggle Ya/Tidak
  - Catatan untuk operator: textarea
  - File upload: drop zone + browse (tampilkan nama file, tidak perlu real upload)
  - DP: input nominal
  - Metode DP: Cash / Transfer / QRIS
  - Sisa tagihan: auto-kalkulasi
- [ ] Tombol: "Simpan Pesanan" + "Batal"
- [ ] Submit → generate nomor SPK → push ke APP_DATA.orders → showToast sukses → redirect ke detail SPK

**Output yang diharapkan:** Form lengkap bisa diisi, submit menghasilkan SPK baru yang muncul di daftar.  
**Progress Terakhir:** —  
**Catatan:** Ini halaman paling complex — jangan rush

---

#### TASK-010 — Detail SPK (order-detail.html)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 60 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Halaman detail yang komprehensif — satu tempat untuk melihat semua info SPK dan mengambil aksi.

**Checklist:**
- [ ] Header: nomor SPK (besar), badge status, badge prioritas, tanggal dibuat
- [ ] Progress tracker horizontal: semua stage dengan current stage di-highlight biru, stage selesai di-highlight hijau
- [ ] Layout 3 kolom (atau 2 kolom di lebar kecil):
  - **Kolom 1 — Info Pesanan:** detail produk, spesifikasi, customer, harga, file yang diupload
  - **Kolom 2 — Timeline:** list event chronological (icon + teks + timestamp + user)
  - **Kolom 3 — Aksi & Catatan:** tombol aksi kontekstual + form tambah catatan
- [ ] Tombol aksi kontekstual (muncul sesuai status):
  - `confirmed` → "Kirim ke Antrian Desain" atau "Kirim ke Produksi"
  - `design_queue` → "Mulai Desain" (untuk designer)
  - `in_design` → "Selesai Desain, Minta Approval"
  - `printing` → "Selesai Cetak, Masuk Finishing"
  - `finishing` → "Selesai, Siap Diambil"
  - `ready` → "Tandai Sudah Diambil & Lunas"
- [ ] Klik tombol aksi → update status di APP_DATA → tambah entry di timeline → update progress tracker → showToast
- [ ] Tombol: "Cetak SPK" (buka print dialog browser), "Duplikat" (buat SPK baru dengan data yang sama), "Batalkan" (dengan konfirmasi modal)
- [ ] Load SPK dari URL hash: `#/order/SPK-SBY-20260523-0042`

**Output yang diharapkan:** Buka detail SPK → semua info tampil, update status bekerja, timeline bertambah.  
**Progress Terakhir:** —  
**Catatan:** —

---

#### TASK-011 — Production Board (production.html)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 75 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Kanban board yang visual dan interaktif. Ini yang paling impressive untuk demo.

**Checklist:**
- [ ] Header: judul "Papan Produksi" + filter bar (Semua / Urgent / Overdue) + tombol "Display Mode" (link ke display-production)
- [ ] 6 kolom kanban (scroll horizontal jika layar sempit):
  - Antrian Desain | Sedang Desain | Review Pelanggan | Antrian Cetak | Sedang Cetak | Finishing | Siap Ambil
- [ ] Header setiap kolom: nama stage + badge counter (jumlah card)
- [ ] Card per SPK:
  - Nomor SPK (small, muted)
  - Nama produk (bold)
  - Nama customer
  - Deadline (relative + warna: merah jika overdue, oranye jika hari ini)
  - Badge prioritas jika Urgent/VIP
  - Avatar/inisial operator assigned (lingkaran kecil)
- [ ] Card overdue: border kiri merah tebal
- [ ] Card urgent: border kiri oranye
- [ ] Klik card → modal detail muncul (overlay)
- [ ] Modal berisi: info lengkap SPK + tombol "Update Status" (pindah ke stage berikutnya)
- [ ] Update status dari modal → card pindah ke kolom berikutnya (animated jika bisa, jika tidak cukup re-render)
- [ ] Filter Urgent: hanya tampilkan card urgent/VIP
- [ ] Filter Overdue: hanya tampilkan card yang deadline-nya lewat
- [ ] Role operator: sembunyikan kolom desain (mulai dari Antrian Cetak)

**Output yang diharapkan:** Board terisi card dari data dummy, klik card → modal, update status → card pindah.  
**Progress Terakhir:** —  
**Catatan:** Ini halaman yang paling banyak JS — beri waktu lebih

---

#### TASK-012 — Queue System — Kasir (queue.html)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 45 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Halaman manajemen antrian untuk kasir. Simpel tapi fungsional.

**Checklist:**
- [ ] Layout: 2 panel — kiri (kontrol kasir) | kanan (status antrian)
- [ ] Panel kiri:
  - Tombol besar "Panggil Berikutnya" (per counter — Counter 1, Counter 2)
  - Nomor yang sedang dilayani per counter (tampilkan besar)
  - Tombol "Lewati" (skip nomor yang tidak hadir)
  - Tombol "Panggil Ulang" (recall nomor yang sama)
- [ ] Panel kanan:
  - List antrian menunggu (nomor + estimasi waktu tunggu)
  - Tombol "+ Tambah Antrian" (simulasi customer baru datang)
  - Jumlah total menunggu
- [ ] Tombol "Buka Layar Antrian" → open display-queue di tab baru
- [ ] State antrian sinkron dengan APP_DATA.queueNumbers
- [ ] Update antrian → sync ke localStorage agar display-queue bisa baca

**Output yang diharapkan:** Klik panggil → nomor berubah, antrian berkurang. Tambah antrian → nomor baru muncul.  
**Progress Terakhir:** —  
**Catatan:** Gunakan localStorage untuk komunikasi antara queue.html dan display-queue.html (karena beda tab)

---

#### TASK-013 — Pricing Page (pricing.html)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 60 menit  
**Depends on:** TASK-003  
**Deskripsi:**  
Halaman pricing bergaya landing page. Tidak ada sidebar — full width.

**Checklist:**
- [ ] Hero section: headline "Harga yang masuk akal untuk semua ukuran bisnis" + subtext
- [ ] 5 pricing cards dalam satu baris:
  - Solo, Studio, Pro (highlighted "Paling Populer"), Business, Enterprise
  - Per card: nama tier, harga/bulan, deskripsi 1 kalimat, list fitur utama (5-7 item), tombol CTA
  - Card Pro: border biru, badge "Paling Populer", sedikit lebih besar (scale 1.05)
  - Card Enterprise: harga "Hubungi Kami", CTA berbeda
- [ ] Feature comparison table di bawah cards:
  - Kolom: Fitur | Solo | Studio | Pro | Business | Enterprise
  - Row: semua fitur utama dari PRD
  - ✓ / — untuk availability, teks untuk limit
- [ ] Tombol kembali ke app (link ke `#/dashboard`)
- [ ] Footer kecil: "Semua harga belum termasuk PPN. Gratis trial 14 hari."

**Output yang diharapkan:** Halaman pricing standalone yang bisa di-share ke Yanuar secara terpisah jika perlu.  
**Progress Terakhir:** —  
**Catatan:** Tidak ada sidebar di halaman ini

---

### FASE 3 — PRODUCTION DISPLAY & AUDIO

#### TASK-014 — Production Display TV Mode (display-production.html)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 75 menit  
**Depends on:** TASK-002, TASK-011  
**Deskripsi:**  
Halaman full-screen untuk TV/tablet di area produksi. Ini salah satu fitur paling impressive untuk demo.

**Checklist:**
- [ ] Full screen: tidak ada sidebar, tidak ada header Printeoo, tidak ada scroll
- [ ] Background: #0F172A (dark navy), teks terang
- [ ] Header bar tipis: nama cabang kiri, jam real-time kanan (update setiap detik)
- [ ] Layout 3 panel:
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
- [ ] Notification bar bawah:
    - Muncul saat ada SPK baru (slide up dari bawah, 5 detik, lalu hilang)
    - Teks: "🔔 Pesanan baru: [nama produk] — deadline [jam]"
- [ ] **DEMO BUTTON** (untuk presentasi ke Yanuar):
    - Tombol kecil pojok kanan bawah: "⚡ Simulasi SPK Masuk"
    - Klik → tambah SPK dummy ke antrian + trigger audio announcement
- [ ] Overlay aktifkan audio: muncul saat pertama buka
    - Full screen, teks besar "Ketuk layar untuk mengaktifkan audio notifikasi"
    - Klik di mana saja → hilang, audio siap
- [ ] Audio TTS saat SPK baru masuk (Web Speech API):
    ```
    "Pesanan baru masuk: [nama produk], deadline [jam]"
    ```
- [ ] Mute/unmute button: ikon speaker kecil pojok layar
- [ ] PIN exit: jika user tekan Escape atau klik area tertentu → tampilkan prompt PIN (bisa enter apapun untuk demo, "1234" untuk exit)
- [ ] Load data dari APP_DATA + listen localStorage changes (untuk sinkron dengan production board)

**Output yang diharapkan:** Layar display full-screen, terisi data, tombol simulasi memicu audio dan update visual.  
**Progress Terakhir:** —  
**Catatan:** Test audio di Chrome dulu (Web Speech API paling stabil di Chrome)

---

#### TASK-015 — Queue Display Layar Antrian (display-queue.html)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 60 menit  
**Depends on:** TASK-012  
**Deskripsi:**  
Layar antrian customer yang ditampilkan di monitor ruang tunggu.

**Checklist:**
- [ ] Full screen, tidak ada sidebar/header
- [ ] Background: putih atau biru sangat muda (#EFF6FF)
- [ ] Layout:
  - Header: logo/nama bisnis + jam real-time
  - Bagian utama (2/3 layar): nomor yang sedang dilayani (font 120-160px bold)
    - Label atas: "SEDANG DILAYANI"
    - Jika ada 2 counter: tampilkan 2 box side by side
  - Bagian bawah (1/3 layar): antrian menunggu (nomor-nomor kecil)
  - Footer: running text (marquee CSS) — jam buka, tagline
- [ ] Audio TTS saat nomor dipanggil:
    ```
    "Nomor A-015, silakan ke Counter 1"
    ```
- [ ] Sinkron dengan queue.html via localStorage (polling setiap 500ms)
- [ ] Overlay aktifkan audio (sama seperti display production)
- [ ] Animasi saat nomor berganti: nomor lama fade out, nomor baru fade in + scale
- [ ] Konfigurasi nama bisnis dan running text dari APP_DATA

**Output yang diharapkan:** Layar antrian berjalan, sinkron saat kasir panggil nomor dari queue.html.  
**Progress Terakhir:** —  
**Catatan:** —

---

### FASE 4 — HALAMAN "SEGERA HADIR"

#### TASK-016 — Inventory Preview (inventory.html)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 30 menit  
**Depends on:** TASK-002, TASK-004  
**Deskripsi:**  
Halaman inventory yang menampilkan preview fitur dengan badge "Segera Hadir" tapi tetap terasa valuable.

**Checklist:**
- [ ] Header: "Inventaris & Gudang" + badge "Tersedia di Tier Studio ke atas"
- [ ] Tampilkan tabel stok bahan baku (dari APP_DATA.inventory) — READ ONLY, tidak bisa edit
- [ ] Kolom: Nama Bahan | Kategori | Stok | Satuan | Min. Stok | Status
- [ ] Status stok: badge hijau (aman) / oranye (menipis) / merah (habis)
- [ ] Alert box: "2 bahan hampir habis. Segera lakukan pembelian."
- [ ] Tombol-tombol yang ada tapi disabled dengan tooltip "Fitur ini aktif di tier Studio":
    - "+ Catat Penerimaan", "Stok Opname", "Lihat Laporan Penggunaan"
- [ ] Section bawah: preview card untuk sub-fitur yang akan datang:
    - "Scan QR Bahan", "Laporan Waste", "Purchase Order", "Traceability per SPK"
    - Setiap card: ikon + judul + deskripsi 1 kalimat + badge "Segera Hadir"

**Output yang diharapkan:** Halaman terisi data stok, komunikasikan value fitur tanpa bisa di-edit.  
**Progress Terakhir:** —  
**Catatan:** —

---

#### TASK-017 — HR & Payroll Preview (hr.html)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 30 menit  
**Depends on:** TASK-002, TASK-004  

**Checklist:**
- [ ] Header: "Karyawan & Payroll" + badge "Tersedia di Tier Studio ke atas"
- [ ] Tab: Karyawan | Absensi | Payroll
- [ ] Tab Karyawan: tabel karyawan dari APP_DATA.employees (READ ONLY)
  - Kolom: Nama | Posisi | Tipe Kontrak | Status
  - Badge tipe kontrak: Bulanan / Harian / Freelance / Borongan
- [ ] Tab Absensi & Payroll: tampilkan preview terkunci dengan overlay
- [ ] Highlight khusus: card feature "Upah Pemasangan Variable"
  - Deskripsi: "Hitung otomatis biaya tukang harian untuk proyek pemasangan billboard, spanduk besar, dan neon box. Terintegrasi langsung ke job costing setiap SPK."
  - Ini adalah pain point spesifik Yanuar — beri emphasis visual

**Output yang diharapkan:** Halaman terisi data karyawan, pain point pemasangan ter-highlight.  
**Progress Terakhir:** —  
**Catatan:** —

---

#### TASK-018 — Finance Preview (finance.html)
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 30 menit  
**Depends on:** TASK-002, TASK-004  

**Checklist:**
- [ ] Header: "Keuangan & Laporan" + badge "Tersedia di Tier Business"
- [ ] Tampilkan preview P&L dengan data dummy (semua angka, tidak interaktif):
  - Revenue bulan ini: Rp 87.500.000
  - HPP: Rp 52.000.000
  - Gross Profit: Rp 35.500.000 (40.6%)
  - Beban Operasional: Rp 18.000.000
  - Net Profit: Rp 17.500.000 (20%)
- [ ] Chart sederhana: revenue vs HPP vs profit (bar chart SVG)
- [ ] Preview cards terkunci: Jurnal Otomatis, Laporan Pajak PPN, Export e-Faktur
- [ ] Callout box: "Semua transaksi dari pesanan, inventory, dan payroll masuk otomatis ke laporan ini. Tidak perlu input manual."

**Output yang diharapkan:** Terlihat powerful bahkan sebagai preview.  
**Progress Terakhir:** —  
**Catatan:** —

---

### FASE 5 — POLISH & INTEGRATION

#### TASK-019 — Integrasi antar halaman & konsistensi data
**Status:** `[ ]` Belum dikerjakan  
**Estimasi:** 45 menit  
**Depends on:** Semua task fase 1-4  
**Deskripsi:**  
Pastikan semua halaman saling terhubung dengan data yang konsisten.

**Checklist:**
- [ ] Order baru dari order-new.html → muncul di orders.html dan production.html
- [ ] Update status dari order-detail.html → reflect di production board
- [ ] Update status dari production board → reflect di order-detail
- [ ] Dashboard metric hari ini → konsisten dengan jumlah order di orders.html
- [ ] Stok inventory → alert di dashboard jika ada yang menipis
- [ ] Nomor antrian di queue.html ↔ display-queue.html via localStorage
- [ ] Navigasi dari dashboard cards → ke halaman terkait dengan filter yang sudah aktif
  - Klik "3 Overdue" di dashboard → buka orders.html dengan filter overdue
  - Klik "Produksi Sekarang" → buka production.html
- [ ] Breadcrumb di header → aktif dan benar sesuai halaman

**Output yang diharapkan:** Flow demo yang seamless tanpa data yang inkonsisten.  
**Progress Terakhir:** —  
**Catatan:** —

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

---

## NEXT TASK

**Task berikutnya yang harus dikerjakan: TASK-001**

Instruksi untuk AI:
> Baca CLAUDE.md dulu, lalu kerjakan TASK-001: buat struktur folder dan semua file kosong sesuai spesifikasi di CLAUDE.md. Setelah selesai, update STATE.md: ubah status TASK-001 menjadi `[x]` dan catat di tabel Catatan Sesi.

