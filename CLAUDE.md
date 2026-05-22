# CLAUDE.md — Printeoo Prototype
**Instruksi ini harus dibaca sebelum mengerjakan task apapun.**

---

## APA INI?

Kamu sedang membangun **prototype interaktif Printeoo** — software manajemen print shop berbasis web untuk pasar Indonesia. Prototype ini dibuat untuk demo ke calon co-founder (Yanuar, pemilik Titaniumprint.id) agar dia memahami scope, potensi, dan visi produk secara visual dan interaktif.

Ini **bukan** aplikasi production. Tidak ada backend, tidak ada database, tidak ada server. Semua data dari `data.js`, semua state di memory/localStorage.

**Goal tunggal:** Saat Yanuar membuka file ini di browser, dia harus merasa seperti melihat software yang sudah jadi — bukan mockup.

---

## DOKUMEN REFERENSI

Sebelum mengerjakan fitur apapun, baca dokumen ini di repo:
- `docs/printeoo-architecture.md` — arsitektur lengkap, 18 modul, data model
- `docs/printeoo-prd.md` — PRD lengkap, user stories, acceptance criteria, flow per modul

Jika ada konflik antara instruksi di CLAUDE.md dan dokumen PRD, **PRD yang menang**.

---

## STRUKTUR FILE

```
/prototype
├── index.html          ← entry point, routing sederhana antar halaman
├── style.css           ← semua styling global
├── app.js              ← logic utama, routing, state management, event handlers
├── data.js             ← semua dummy data (orders, customers, products, employees, dll)
└── /pages
    ├── login.html          ← halaman login + role switcher
    ├── dashboard.html      ← owner dashboard
    ├── orders.html         ← daftar SPK
    ├── order-new.html      ← form input order baru
    ├── order-detail.html   ← detail SPK + timeline
    ├── production.html     ← kanban board produksi
    ├── display-production.html  ← full screen TV mode produksi + audio
    ├── queue.html          ← sistem antrian customer
    ├── display-queue.html  ← full screen layar antrian customer + audio
    ├── inventory.html      ← manajemen stok (coming soon tapi preview)
    ├── hr.html             ← HR & payroll (coming soon tapi preview)
    ├── finance.html        ← keuangan & laporan (coming soon tapi preview)
    └── pricing.html        ← halaman 5 tier pricing (landing page style)
```

---

## CARA ROUTING BEKERJA

Gunakan hash-based routing sederhana di `app.js`:

```javascript
// Contoh
window.location.hash = '#/dashboard'
window.location.hash = '#/orders'
window.location.hash = '#/order/SPK-SBY-20260523-0042'
```

`app.js` listen ke `hashchange` event dan load konten halaman yang sesuai ke dalam `<div id="app">` di `index.html`.

Sidebar navigasi di-render sekali, tetap ada di semua halaman (kecuali login, display-production, display-queue yang full screen).

---

## ROLE & STATE

Prototype punya 4 role yang bisa di-switch dari tombol di header:

```javascript
// Di app.js, state global
const APP_STATE = {
  currentRole: 'owner', // owner | cashier | operator | display
  currentBranch: 'Surabaya Pusat',
  currentUser: { name: 'Ahmad Fauzi', role: 'owner' }
}
```

**Efek role switching:**
- `owner` → semua menu sidebar muncul, semua data terlihat
- `cashier` → menu terbatas: Pesanan, Input Order, Antrian, Kasir
- `operator` → menu terbatas: Produksi saja
- `display` → tidak ada sidebar, langsung masuk display mode

Role switcher tampil sebagai dropdown kecil di pojok kanan atas header. Label: "Lihat sebagai: [Role]"

---

## DATA DUMMY (data.js)

Semua data dummy harus **terasa realistis untuk print shop Surabaya**. Bukan "John Doe" atau "Product 1".

### Pelanggan (20+ entries):
- Nama Indonesia: Budi Santoso, PT Maju Jaya Surabaya, Rina Dewi, CV Berkah Mandiri, Toko Sembako Pak Heri, Universitas Airlangga (dept. Humas), dll
- Mix: individual, perusahaan, instansi

### Produk (15+ entries):
- Banner Flexi China 340gr
- Spanduk Kain Anti Air
- Kartu Nama Art Carton 260gr (1 sisi / 2 sisi)
- Brosur A4 Full Color (1 lipatan / 2 lipatan)
- Stiker Vinyl Outdoor
- Undangan A5 Ivory 230gr
- X-Banner 60×160cm
- Roll Banner 85×200cm
- Nota/Kwitansi 2 ply
- Kalender Meja 2027
- Mug Cetak Full Wrap
- Kaos Sablon DTF
- Neon Box Akrilik Custom
- Billboard Besi + Pasang
- Backdrop Foto 3×2m

### SPK (30+ entries):
- Mix status: draft, confirmed, design_queue, in_design, printing, finishing, ready, delivered, closed
- Mix prioritas: normal, urgent, VIP
- Tanggal relatif dari "hari ini" (gunakan offset dari new Date())
- Beberapa yang overdue (deadline kemarin, status belum selesai)
- Beberapa yang urgent hari ini

### Karyawan (10+ entries):
- Mix tipe: bulanan, harian, freelance
- Posisi: Kasir, Desainer, Operator Cetak, Operator Finishing, Staff Gudang

### Inventory (15+ entries):
- Flexi China 340gr (Roll) — stok: 12 roll
- Flexi Korea 440gr (Roll) — stok: 3 roll ← sengaja hampir habis
- Art Paper 150gr (Rim) — stok: 45 rim
- Tinta Cyan Epson (Liter) — stok: 2.5 liter
- Tinta Magenta Epson (Liter) — stok: 0.5 liter ← sengaja hampir habis
- dst...

### Dashboard Metrics (untuk owner dashboard):
- Revenue hari ini: Rp 4.750.000
- Revenue kemarin: Rp 4.100.000 (untuk hitung % naik)
- Order hari ini: 24
- Order selesai: 18
- SPK overdue: 3
- Data chart 7 hari terakhir (array angka revenue harian)
- Top produk bulan ini (5 produk dengan % share)

---

## VISUAL & DESIGN SYSTEM

### Prinsip
- **Bersih dan terang** — background putih atau abu sangat muda, bukan dark mode
- **Modern tapi familiar** — mirip Notion/Linear tapi semua teks Bahasa Indonesia
- **Legible di semua ukuran** — font minimum 14px untuk konten, 12px untuk label kecil
- **Kontras tinggi** — semua teks harus WCAG AA compliant

### Warna

```css
:root {
  --primary: #2563EB;        /* Biru utama — CTA, active state */
  --primary-light: #EFF6FF;  /* Background highlight biru muda */
  --success: #16A34A;        /* Hijau — selesai, lunas, stok aman */
  --warning: #D97706;        /* Oranye — urgent, hampir habis */
  --danger: #DC2626;         /* Merah — overdue, error, stok habis */
  --neutral-50: #F9FAFB;     /* Background halaman */
  --neutral-100: #F3F4F6;    /* Background card, sidebar */
  --neutral-200: #E5E7EB;    /* Border, divider */
  --neutral-500: #6B7280;    /* Text muted, label */
  --neutral-700: #374151;    /* Text sekunder */
  --neutral-900: #111827;    /* Text utama */
  --white: #FFFFFF;
}
```

### Typography

```css
/* Font stack */
font-family: 'Inter', 'Plus Jakarta Sans', system-ui, sans-serif;

/* Scale */
--text-xs: 12px;    /* label tabel, badge */
--text-sm: 13px;    /* body tabel, metadata */
--text-base: 14px;  /* body utama */
--text-md: 16px;    /* subheading */
--text-lg: 18px;    /* heading section */
--text-xl: 24px;    /* heading halaman */
--text-2xl: 32px;   /* angka besar di dashboard */
```

### Layout

```
┌──────────────────────────────────────────────────────┐
│  HEADER (60px) — logo + breadcrumb + role switcher   │
├───────────┬──────────────────────────────────────────┤
│           │                                          │
│  SIDEBAR  │  MAIN CONTENT                            │
│  (220px)  │  padding: 24px                           │
│           │                                          │
│           │                                          │
└───────────┴──────────────────────────────────────────┘
```

### Komponen Standar

**Badge Status:**
```css
.badge-confirmed  { background: #DBEAFE; color: #1D4ED8; }
.badge-printing   { background: #FEF3C7; color: #92400E; }
.badge-ready      { background: #D1FAE5; color: #065F46; }
.badge-overdue    { background: #FEE2E2; color: #991B1B; }
.badge-urgent     { background: #FED7AA; color: #9A3412; }
```

**Card:**
```css
.card {
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
```

**Tombol:**
```css
.btn-primary   { background: var(--primary); color: white; }
.btn-secondary { background: white; border: 1px solid var(--neutral-200); }
.btn-danger    { background: var(--danger); color: white; }
/* Semua tombol: border-radius 6px, padding 8px 16px, font-size 14px */
```

---

## HALAMAN-HALAMAN & BEHAVIOUR

### 1. Login (pages/login.html)
- Form email + password (tidak perlu validasi real, apapun bisa login)
- Tombol "Masuk" → set role = owner, redirect ke dashboard
- Di bawah form: 4 tombol shortcut "Masuk sebagai: Owner / Kasir / Operator / Display"
- Background: gradient biru muda, card putih di tengah, logo Printeoo

### 2. Dashboard (pages/dashboard.html)
- Hanya muncul untuk role: owner, branch_manager
- 4 metric card baris atas: Pesanan Hari Ini, Revenue Hari Ini, Selesai Hari Ini, Overdue
- Chart revenue 7 hari (gunakan canvas atau SVG sederhana — JANGAN pakai library chart eksternal CDN karena mungkin tidak tersedia offline)
- Grid 2 kolom bawah: Top Produk Bulan Ini (list dengan bar sederhana) + Status Produksi Sekarang (mini board)
- Alert box merah jika ada SPK overdue: "3 pesanan melewati deadline. Lihat →"

### 3. Daftar Order (pages/orders.html)
- Tabel dengan kolom: No. SPK, Customer, Produk, Qty, Total, Deadline, Status, Aksi
- Filter bar: dropdown Status, input Search, tombol "Hari Ini" / "Minggu Ini" / "Semua"
- Row overdue: background merah sangat muda (#FFF5F5)
- Klik row atau tombol "Detail" → navigate ke order-detail
- Tombol "+ Pesanan Baru" di pojok kanan atas → navigate ke order-new
- Pagination sederhana (25 per halaman, tapi data dummy bisa kurang)

### 4. Input Order Baru (pages/order-new.html)
- Form 3 section: Data Customer, Detail Pesanan, Produksi & Pembayaran
- Customer: input dengan autocomplete dari data dummy (type → dropdown suggestion muncul)
- Produk: dropdown → spesifikasi muncul dinamis sesuai produk dipilih
- Harga: auto-fill dari data produk, bisa di-edit manual
- Total: auto-kalkulasi saat qty atau harga berubah
- Submit → generate SPK baru, simpan ke localStorage, redirect ke detail SPK baru
- Nomor SPK auto: SPK-SBY-[YYYYMMDD]-[increment]

### 5. Detail SPK (pages/order-detail.html)
- Header: nomor SPK besar, badge status, prioritas
- Progress bar horizontal: semua stage dengan stage aktif di-highlight
- 3 kolom: Info Pesanan | Timeline Status | File & Catatan
- Timeline: list event chronological (dibuat, dikonfirmasi, masuk produksi, dll) dengan timestamp dan user
- Tombol aksi kontekstual sesuai status:
  - confirmed → "Mulai Desain" atau "Kirim ke Produksi"
  - ready → "Tandai Diambil"
  - delivered → "Lunas & Tutup"
- Simulasi ubah status: klik tombol → status berubah, timeline bertambah, toast notification muncul

### 6. Production Board (pages/production.html)
- Kanban 6 kolom: Antrian Desain | Sedang Desain | Review | Antrian Cetak | Sedang Cetak | Finishing | Siap Ambil
- Card: nomor SPK, produk, customer, deadline (relative), badge prioritas
- Klik card → modal detail SPK (bukan navigate)
- Di modal: tombol "Update Status" → pindah ke kolom berikutnya
- Filter bar atas: "Semua" / "Urgent" / "Overdue"
- Counter per kolom (badge angka di header kolom)
- Role operator: hanya tampilkan kolom Antrian Cetak → Siap Ambil

### 7. Production Display — TV Mode (pages/display-production.html)
- Full screen, tidak ada sidebar/header Printeoo
- Dark background (#0F172A), teks terang
- 3 panel: Antrian Cetak (list) | Sedang Dikerjakan (card besar) | Finishing (list)
- Header: nama cabang + jam real-time (update setiap detik)
- Tombol "Simulasi SPK Baru Masuk" (untuk demo) → tambah card ke antrian + trigger audio
- Audio: Web Speech API, TTS bahasa Indonesia
  ```javascript
  const speak = (text) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'id-ID'
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  }
  speak('Pesanan baru masuk: Banner tiga kali satu meter, deadline jam empat sore')
  ```
- Overlay "Ketuk untuk aktifkan audio" saat pertama buka (workaround autoplay policy)
- Tombol kecil mute/unmute pojok kanan bawah

### 8. Queue System (pages/queue.html)
- Halaman untuk kasir: tombol besar "Panggil Berikutnya" per counter
- List antrian menunggu (nomor A-001, A-002, dst)
- Klik "Panggil" → nomor berikutnya dipanggil, update display
- Simulasi: tombol "Tambah Antrian Baru" (seperti customer baru datang)

### 9. Queue Display — Layar Antrian (pages/display-queue.html)
- Full screen, background putih/biru muda, teks besar
- Layout: lihat spesifikasi di PRD M03.2
- Nomor yang sedang dilayani: font 120px bold
- Audio TTS saat dipanggil: "Nomor A-015, silakan ke Counter 1"
- Running text bawah: jam buka, tagline bisnis (dari data dummy)
- Overlay aktifkan audio saat pertama buka

### 10. Halaman "Segera Hadir" (inventory, hr, finance)
- Bukan halaman kosong — tampilkan preview yang menarik
- Layout: hero text "Fitur ini sedang dalam pengembangan" + ilustrasi SVG sederhana
- Di bawahnya: preview screenshot/wireframe dari fitur (bisa div dengan styling saja)
- Badge "Tersedia di Tier Pro" atau "Tersedia di Tier Business"
- Tombol "Beritahu saya saat tersedia" (non-functional, tapi ada)

### 11. Pricing Page (pages/pricing.html)
- Halaman landing page style, tidak ada sidebar
- 5 tier dalam 5 card: Solo, Studio, Pro, Business, Enterprise
- Card Pro di-highlight sebagai "Paling Populer" (border biru, badge)
- Feature comparison table di bawah cards
- Tombol CTA per tier: "Mulai Gratis" (Solo/Studio), "Coba 14 Hari" (Pro/Business), "Hubungi Kami" (Enterprise)
- Semua CTA non-functional tapi ada visual feedback saat diklik

---

## INTERAKTIVITAS YANG HARUS BEKERJA

Ini daftar interaksi minimum yang harus functional untuk demo:

- [ ] Role switcher → tampilan berubah sesuai role
- [ ] Login → redirect ke dashboard
- [ ] Klik menu sidebar → navigate ke halaman
- [ ] Input order baru → SPK tersimpan, muncul di daftar order
- [ ] Update status SPK → timeline bertambah, badge berubah
- [ ] Production board → klik card, modal muncul, update status
- [ ] Display production → tombol simulasi → card muncul + audio TTS
- [ ] Display queue → panggil nomor → layar update + audio TTS
- [ ] Filter daftar order → hasil berubah
- [ ] Search customer di form order → autocomplete muncul
- [ ] Dashboard metric cards → angka dari data.js

---

## YANG TIDAK PERLU DIIMPLEMENTASIKAN

Untuk prototype ini, **skip** hal berikut:
- Form validation yang ketat (semua submit boleh berhasil)
- Real file upload (cukup tampilkan nama file dummy)
- Kalkulasi pajak yang akurat
- Integrasi WA / API eksternal apapun
- Responsive mobile (optimize untuk desktop 1280px+, tablet 768px+)
- Animasi kompleks (transisi sederhana cukup)
- Error handling edge case

---

## KONVENSI KODING

### HTML
- Semantic HTML5 (gunakan `<main>`, `<nav>`, `<section>`, `<article>`)
- Semua teks UI dalam Bahasa Indonesia
- ID untuk elemen yang di-manipulasi JS, class untuk styling

### CSS
- Semua di `style.css`, tidak ada inline style kecuali nilai dinamis dari JS
- Gunakan CSS custom properties (variabel) dari design system di atas
- Naming: BEM ringan — `.card`, `.card__title`, `.card--highlighted`
- Tidak menggunakan framework CSS eksternal (Tailwind dll) — pure CSS saja

### JavaScript
- Vanilla JS, tidak ada framework, tidak ada npm
- Semua di `app.js` kecuali data (di `data.js`)
- State global di objek `APP_STATE` dan `APP_DATA`
- Event delegation untuk list item (jangan attach listener per item)
- Komentar Bahasa Indonesia untuk logika bisnis yang tidak obvious

### Data
- Semua dummy data di `data.js` sebagai const yang di-export ke window
- Format tanggal: selalu gunakan offset dari `new Date()` bukan hard-coded
  ```javascript
  // Contoh: deadline besok
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  ```

---

## CARA KERJA DENGAN STATE.md

- Sebelum mulai task: baca STATE.md, cek task mana yang `[ ]` dan belum dikerjakan
- Setelah selesai task: update STATE.md — ubah `[ ]` ke `[x]`, tambahkan catatan jika ada
- Jika menemukan bug saat mengerjakan task: tambahkan ke section Bugs di STATE.md
- Jika task tidak bisa selesai (token habis, dll): catat progress di STATE.md di field "Progress Terakhir"
- Jangan mulai task baru sebelum task sebelumnya selesai dan di-mark di STATE.md

---

## DEFINITION OF DONE (per task)

Sebuah task dianggap selesai jika:
1. File yang relevan sudah ditulis/diupdate
2. Halaman bisa dibuka di browser tanpa error di console
3. Semua interaksi yang disebutkan di task bekerja
4. Visual konsisten dengan design system (warna, font, spacing)
5. STATE.md sudah diupdate

