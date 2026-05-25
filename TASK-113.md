# TASK-113 — Nota Pesanan: Cetak, Kirim WA, dan QR Tracking
**Priority:** 🔴 HIGH  
**Tanggal:** 2026-05-25  
**Konteks:** Baca `docs/printeoo-prd-v1.1.md` Section M04 dan M09 sebelum mulai.

---

## RINGKASAN FITUR

Nota pesanan adalah dokumen pertama yang customer pegang setelah order. Harus bisa:
1. Dicetak langsung di toko (walk-in)
2. Dikirim via WhatsApp sebagai link (order online/WA/telepon)
3. Di-download sebagai PDF
4. Berisi QR code untuk tracking status order — customer scan dari HP tanpa perlu login

---

## BAGIAN A — Halaman Nota (Print-Ready)

### A1. Buat route baru: `#/nota/{spk_id}`

Halaman ini berbeda dari halaman lain di prototype — **tidak ada sidebar, tidak ada header navigasi**. Murni dokumen yang siap cetak.

CSS wajib:
```css
/* Sembunyikan elemen non-dokumen saat print */
@media print {
  .sidebar, .topbar, .no-print { display: none !important; }
  .nota-container { width: 100%; margin: 0; padding: 0; }
  body { background: white; }
}

/* Layout nota di layar (preview sebelum cetak) */
.nota-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 32px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: sans-serif;
  background: white;
}
```

### A2. Struktur konten nota

```
┌─────────────────────────────────────┐
│  [LOGO BISNIS]                      │
│  [Nama Bisnis]                      │
│  [Nomor Telepon] · [Alamat Kota]    │
├─────────────────────────────────────┤
│  NOTA PESANAN                       │
│  [Nomor SPK]                        │
│  [Tanggal] · Kasir: [Nama Kasir]    │
├─────────────────────────────────────┤
│  Customer: [Nama Customer]          │
│  HP: [Nomor HP Customer]            │
├─────────────────────────────────────┤
│  PESANAN                            │
│                                     │
│  [Nama Item 1]                      │
│  [Qty] [unit] × Rp [harga]  Rp [total] │
│                                     │
│  [Nama Item 2]                      │
│  [Qty] [unit] × Rp [harga]  Rp [total] │
│                                     │
│  dst...                             │
├─────────────────────────────────────┤
│  Subtotal              Rp [subtotal]│
│  Diskon                Rp [diskon]  │  ← sembunyikan jika 0
│  Total                 Rp [total]   │
│  DP Dibayar            Rp [dp]      │
│  Sisa Tagihan          Rp [sisa]    │
├─────────────────────────────────────┤
│  Deadline: [DD MMMM YYYY], [HH:MM]  │
│  Prioritas: [Normal / Urgent / VIP] │
├─────────────────────────────────────┤
│  [QR CODE — 120×120px]              │
│  Scan untuk cek status pesanan      │
│  [Nomor SPK di bawah QR]            │
├─────────────────────────────────────┤
│  [Footer bisnis — dari pengaturan]  │
│  [Syarat & ketentuan — dari pengat.]│
└─────────────────────────────────────┘
```

**Data yang ditarik dari `APP_DATA`:**
- Info bisnis (nama, telepon, kota, logo, footer, syarat) → dari `APP_DATA.settings.business`
- Data SPK (nomor, tanggal, kasir, customer, items, total, dp, deadline, prioritas) → dari `APP_DATA.orders`

### A3. QR Code di nota

QR code meng-encode URL tracking customer:
```
https://app.printeoo.com/track?spk={spk_id}
```

URL ini adalah halaman tracking publik untuk customer — **berbeda** dari URL internal sistem. Customer tidak perlu login untuk melihat status ordernya.

**Untuk prototype:** gunakan library `qrcode.js` dari CDN untuk generate QR secara realtime di browser:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
```

Cara generate:
```javascript
new QRCode(document.getElementById('qrcode'), {
  text: `https://app.printeoo.com/track?spk=${spkId}`,
  width: 120,
  height: 120,
  colorDark: '#000000',
  colorLight: '#ffffff'
});
```

---

## BAGIAN B — Tombol Aksi di Detail SPK

Di halaman Detail SPK (`#/orders/{spk_id}`), tambahkan tiga tombol di area header (sejajar dengan tombol yang sudah ada):

```
[Cetak Nota]  [Kirim WA]  [Download PDF]  [⋯ Lainnya]
```

### B1. Tombol "Cetak Nota"

```javascript
// Buka halaman nota di tab baru, langsung trigger print dialog
window.open(`#/nota/${spkId}`, '_blank');
// Di halaman nota: auto-trigger window.print() setelah konten loaded
window.onload = () => {
  setTimeout(() => window.print(), 500); // delay untuk pastikan QR ter-render
}
```

### B2. Tombol "Kirim WA"

Buka WhatsApp dengan nomor customer pre-filled dan pesan yang sudah diformat:

```javascript
const nomorHP = order.customerPhone.replace(/\D/g, ''); // hapus karakter non-angka
const pesan = encodeURIComponent(
  `Halo ${order.customer}, berikut nota pesanan Anda:\n\n` +
  `📋 *${order.id}*\n` +
  `📅 Deadline: ${order.deadline}\n` +
  `💰 Total: Rp ${formatRupiah(order.total)}\n` +
  `💳 DP: Rp ${formatRupiah(order.dp)}\n` +
  `📦 Sisa: Rp ${formatRupiah(order.total - order.dp)}\n\n` +
  `Cek status pesanan: https://app.printeoo.com/track?spk=${order.id}\n\n` +
  `Terima kasih sudah mempercayakan pesanan Anda kepada kami! 🙏`
);
window.open(`https://wa.me/62${nomorHP}?text=${pesan}`, '_blank');
```

### B3. Tombol "Download PDF"

Untuk prototype: gunakan `window.print()` dengan CSS `@media print` yang sudah diset di halaman nota. Ini menghasilkan output yang bisa di-save as PDF dari browser.

Alternatif yang lebih baik jika sudah ada library jsPDF di prototype — gunakan itu. Jika belum ada, cukup dengan print dialog browser.

---

## BAGIAN C — Halaman Tracking Customer (Publik)

Route baru: `#/track/{spk_id}`

Halaman ini **mobile-first**, tanpa sidebar, tanpa login. Ini yang customer buka saat scan QR di nota.

### C1. Layout halaman tracking

```
┌─────────────────────────────────┐
│  [Logo Bisnis]                  │
│  Titanium Print Surabaya        │
├─────────────────────────────────┤
│  Status Pesanan                 │
│  SPK-SBY-20260525-0001          │
│                                 │
│  ● Terkonfirmasi  ✓             │
│  ● Desain         ✓             │
│  ● Produksi       ⟳ (sedang)   │  ← stage aktif
│  ○ Finishing                    │
│  ○ Siap Ambil                   │
│  ○ Selesai                      │
│                                 │
│  Status: Sedang Diproduksi      │
│  Terakhir update: 25 Mei, 10:30 │
├─────────────────────────────────┤
│  Detail Pesanan                 │
│  Banner Flexi China 3×4m        │
│  Spanduk Kain Anti Air 6×1m     │
│                                 │
│  Deadline: 28 Mei 2026, 16:00   │
├─────────────────────────────────┤
│  Ada pertanyaan?                │
│  [Hubungi via WA]               │
│  031-501-7788                   │
└─────────────────────────────────┘
```

### C2. Data yang ditampilkan di tracking

**Tampilkan:**
- Nomor SPK
- Status produksi (derived dari items — stage mana yang sedang berjalan)
- Progress visual (milestone sederhana, bukan kanban detail)
- Nama item-item yang dipesan (tanpa harga)
- Deadline
- Kontak bisnis

**Jangan tampilkan:**
- Harga, total, DP, sisa tagihan
- Nama operator/desainer yang assigned
- Catatan internal
- Detail material
- Informasi bisnis internal apapun

### C3. Milestone tracking untuk customer

Sederhanakan status internal menjadi 5 milestone yang mudah dipahami customer:

```javascript
function getCustomerMilestone(itemStatuses) {
  // Ambil status paling maju dari semua item
  const allStatuses = itemStatuses;
  
  if (allStatuses.every(s => s === 'ready' || s === 'delivered' || s === 'closed'))
    return 'siap_ambil';
  if (allStatuses.some(s => s === 'finishing'))
    return 'finishing';
  if (allStatuses.some(s => s === 'printing'))
    return 'produksi';
  if (allStatuses.some(s => s === 'in_design' || s === 'design_queue'))
    return 'desain';
  return 'terkonfirmasi';
}

const milestones = ['terkonfirmasi', 'desain', 'produksi', 'finishing', 'siap_ambil'];
```

---

## BAGIAN D — Integrasi di Halaman Lain

### D1. Setelah submit form Pesanan Baru

Saat kasir berhasil simpan order baru, tampilkan modal sukses dengan tiga opsi:

```
✅ Pesanan berhasil disimpan!
SPK-SBY-20260525-0042

[🖨️ Cetak Nota Sekarang]
[📱 Kirim WA ke Customer]
[📋 Lihat Detail SPK]
```

### D2. Di daftar pesanan (list SPK)

Tambahkan opsi "Cetak Nota" di kolom Aksi (sejajar dengan tombol "Detail") — atau masukkan ke dropdown jika kolom sudah penuh.

---

## DATA DUMMY

Pastikan `APP_DATA.settings.business` memiliki data untuk nota:

```javascript
APP_DATA.settings = {
  business: {
    name: 'Titanium Print Surabaya',
    phone: '031-501-7788',
    city: 'Surabaya',
    address: 'Jl. Basuki Rahmat No. 88, Surabaya',
    logoText: 'TP', // placeholder jika belum ada file logo
    invoiceFooter: 'Terima kasih atas kepercayaan Anda.',
    paymentTerms: 'Pembayaran DP minimal 50% sebelum produksi dimulai.',
    npwp: '01.234.567.8-601.000'
  }
}
```

---

## ACCEPTANCE CRITERIA

- [ ] Route `#/nota/{spk_id}` merender halaman nota yang bersih tanpa sidebar/header
- [ ] Nota menampilkan semua item SPK dengan qty, harga satuan, dan total per item
- [ ] Nota menampilkan subtotal, diskon (jika ada), total, DP, dan sisa tagihan
- [ ] QR code ter-generate dan tampil di nota (gunakan qrcode.js dari CDN)
- [ ] Tombol "Cetak Nota" di detail SPK membuka tab baru dan trigger print dialog
- [ ] Tombol "Kirim WA" membuka WhatsApp dengan pesan pre-filled dan nomor customer
- [ ] Tombol "Download PDF" berfungsi (minimal via print dialog browser)
- [ ] Route `#/track/{spk_id}` merender halaman tracking publik mobile-friendly
- [ ] Halaman tracking menampilkan 5 milestone yang disederhanakan
- [ ] Halaman tracking tidak menampilkan harga atau informasi internal
- [ ] Modal sukses muncul setelah input pesanan baru dengan opsi cetak/kirim WA
- [ ] Format tanggal Indonesia (DD MMMM YYYY) di semua output nota
- [ ] Format waktu 24 jam di semua output nota
- [ ] Tidak ada error di console browser
- [ ] Update `STATE.md` setelah selesai

---

## CATATAN UNTUK PRODUCTION (bukan untuk prototype)

Hal-hal berikut tidak perlu diimplementasikan di prototype tapi perlu dicatat untuk Robbi saat build production:

1. **Halaman `/track` harus benar-benar publik** — tidak butuh auth, tapi tetap rate-limited untuk mencegah enumeration SPK
2. **SPK ID di QR jangan sequential** — gunakan UUID atau hash agar orang tidak bisa menebak nomor SPK orang lain
3. **Kirim WA via API** — di production, kirim nota sebagai PDF attachment via WA Business API (bukan hanya buka link wa.me)
4. **Generate PDF server-side** — gunakan library seperti Puppeteer atau wkhtmltopdf untuk PDF yang konsisten lintas device
5. **Logo bisnis** — di production, tampilkan logo dari file yang diupload owner di Pengaturan → Profil Bisnis
