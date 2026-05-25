# TASK-116 — Portal Karyawan: Owner View, Role Clarity, dan Konfigurasi Insentif
**Priority:** 🔴 HIGH  
**Tanggal:** 2026-05-25  
**Konteks:** Baca `docs/printeoo-prd-v1.2.md` Section 3 (Role Definitions) dan M10.9–M10.10 sebelum mulai.

---

## LATAR BELAKANG

Tiga masalah yang saling terkait ditemukan saat review Portal Karyawan dengan role Owner:

1. Owner melihat Portal Karyawan yang sama dengan karyawan — ini tidak tepat secara mental model
2. Tidak ada halaman konfigurasi insentif untuk owner, padahal fitur insentif sudah tampil di Portal Karyawan karyawan
3. Hubungan dan batasan antara role `owner` dan `branch_manager` belum tercermin dengan jelas di UI

---

## PERUBAHAN 1 — Portal Karyawan: Pisahkan Experience Owner vs Karyawan

### Prinsip yang harus dipegang:
> Owner adalah pemilik bisnis — bukan karyawan. Menampilkan "Hari Hadir", "Hari Absen", dan "Insentif" untuk owner menciptakan kebingungan karena itu bukan konteks mental owner saat membuka sistem.

### Yang harus diubah:

**Untuk role `owner` dan `branch_manager`:**

Tautan "Portal Saya" di sidebar tetap ada — tapi saat dibuka, konten yang ditampilkan **berbeda** dari Portal Karyawan biasa.

Ganti nama halaman untuk owner menjadi: **"Profil & Akun Saya"** (bukan "Portal Karyawan")

Konten untuk owner:
```
Profil & Akun Saya
Halo, Yanuar Firnandy 👋

[Tab: Profil Bisnis Saya]  [Tab: Pengaturan Akun]  [Tab: Teguran & Pengumuman]

── Tab Profil Bisnis Saya ──
Nama:          Yanuar Firnandy
Role:          Owner
Cabang:        Surabaya Pusat (dan semua cabang)
Bergabung:     [tanggal daftar]
Email:         [email]

── Tab Pengaturan Akun ──
Ganti Password
Preferensi notifikasi personal

── Tab Teguran & Pengumuman ──
Pengumuman yang dikirim ke semua staff
(owner tidak bisa ditegur oleh sistem — tab ini hanya tampilkan pengumuman)
```

**Tidak ada:** Hari Hadir, Hari Absen, Insentif, Item Selesai — semua itu adalah metrik karyawan, bukan owner.

**Untuk role selain `owner` dan `branch_manager`:** Portal Karyawan tetap seperti sekarang.

---

## PERUBAHAN 2 — Klarifikasi Hubungan Owner vs Branch Manager di UI

### Di halaman Pengaturan → Pengguna & Akses:

Tambahkan deskripsi singkat di bawah setiap role saat owner manage user. Ini membantu owner memahami perbedaan sebelum assign role:

```
Owner
Akses penuh ke semua cabang, modul, dan pengaturan bisnis.
Termasuk billing, subscription, dan manajemen user global.

Branch Manager  
Akses penuh ke satu cabang yang ditugaskan.
Tidak bisa akses cabang lain, billing, atau subscription.

Kasir
Input order, proses pembayaran, kelola antrian.

Desainer
Lihat dan kerjakan antrian desain yang di-assign.

Operator
Lihat dan update status produksi yang di-assign.

Gudang
Kelola inventory, catat penerimaan barang, cetak label QR.

Kurir
Lihat dan update status pengiriman yang di-assign.
```

### Catatan untuk prototype:
Deskripsi ini cukup ditampilkan sebagai tooltip saat hover nama role, atau sebagai teks kecil di bawah nama role di tabel Pengguna Aktif.

---

## PERUBAHAN 3 — Tambah Halaman Konfigurasi Insentif untuk Owner

Fitur insentif sudah tampil di Portal Karyawan tapi owner belum bisa mengkonfigurasinya. Ini harus diselesaikan bersamaan — tidak bisa tampilkan output (Portal Karyawan) tanpa ada input (konfigurasi insentif).

### Lokasi di navigasi:
**Karyawan → tab "Insentif"** (tab baru di halaman Karyawan, sejajar dengan Karyawan / Absensi / Payroll)

### Layout halaman Konfigurasi Insentif:

```
Karyawan & Payroll
[Tab: Karyawan]  [Tab: Absensi]  [Tab: Payroll]  [Tab: Insentif]  ← tab baru

── Tab Insentif ──

Pengaturan Insentif Karyawan
Tentukan siapa yang mendapat insentif dan bagaimana cara menghitungnya.
Insentif dihitung otomatis setiap kali item SPK diselesaikan.

STATUS: Aktif / Nonaktif  [toggle]

─────────────────────────────────────────
KONFIGURASI PER ROLE

Role            Eligible?   Tipe Perhitungan      Nilai        Berlaku Mulai
─────────────────────────────────────────
Desainer        [✓ toggle]  [Flat per item ▼]     [Rp 5.000]   [01 Mei 2026]
Operator        [✓ toggle]  [% dari harga item ▼] [1.5 %    ]  [01 Mei 2026]
Finishing       [✓ toggle]  [Flat per item ▼]     [Rp 3.000]   [01 Mei 2026]
Kurir           [ toggle ]  [Flat per SPK ▼]      [Rp 10.000]  [—          ]
Gudang          [ toggle ]  —                     —            —

[+ Simpan Konfigurasi]
─────────────────────────────────────────

RIWAYAT INSENTIF BULAN INI

Filter: [Semua Role ▼]  [Semua Status ▼]  [Mei 2026 ▼]

KARYAWAN        ROLE      SPK/ITEM              NILAI      STATUS
Eko Pramono     Operator  SPK-001 · Item 1      Rp 8.500   Belum Dibayar
Maya Lestari    Desainer  SPK-001 · Item 2      Rp 5.000   Belum Dibayar
Rizky Maulana   Operator  SPK-003 · Item 1      Rp 6.500   Belum Dibayar

Total Belum Dibayar: Rp 20.000
[Approve Semua]  [Export]
```

### Tipe perhitungan yang tersedia (dropdown):
- **Flat per item** — Rp X setiap item selesai (apapun produknya)
- **% dari harga item** — Y% dari harga jual item
- **Flat per SPK** — Rp X setiap SPK closed

### Data dummy untuk tab Insentif:
Tambahkan beberapa entri insentif yang sudah terkonfigurasi dan beberapa riwayat insentif per karyawan agar tab tidak kosong saat demo. Gunakan karyawan yang sudah ada di `APP_DATA` (Eko Pramono, Maya Lestari, Rizky Maulana, dll).

---

## PERUBAHAN 4 — Update Sidebar: Link "Portal Saya" sesuai Role

Saat ini link "Portal Saya" di sidebar menuju halaman yang sama untuk semua role. Setelah Perubahan 1, link ini harus mengarah ke konten yang sesuai:

| Role | Label di sidebar | Halaman yang dibuka |
|---|---|---|
| owner, branch_manager | "Profil & Akun Saya" | Halaman profil owner (Perubahan 1) |
| Semua role lain | "Portal Saya" | Portal Karyawan yang sudah ada |

Cukup ubah label dan konten yang dirender — route bisa tetap `#/portal-saya`.

---

## ACCEPTANCE CRITERIA

- [ ] Owner membuka "Portal Saya" → melihat "Profil & Akun Saya", bukan Portal Karyawan
- [ ] Halaman owner tidak menampilkan Hari Hadir, Hari Absen, atau Insentif
- [ ] Halaman owner menampilkan informasi profil, pengaturan akun, dan pengumuman
- [ ] Label di sidebar untuk owner berubah menjadi "Profil & Akun Saya"
- [ ] Karyawan non-owner tetap melihat Portal Karyawan yang sama seperti sekarang
- [ ] Tab "Insentif" ada di halaman Karyawan & Payroll
- [ ] Tab Insentif menampilkan konfigurasi per role dengan toggle eligible, tipe perhitungan, nilai, dan tanggal berlaku
- [ ] Tab Insentif menampilkan riwayat insentif bulan ini dengan data dummy yang realistis
- [ ] Deskripsi singkat role tampil di halaman Pengguna & Akses
- [ ] Tidak ada error di console browser
- [ ] Update `STATE.md` setelah selesai

---

## PATCH STATE.md

Tambahkan ke section KEPUTUSAN TEKNIS di STATE.md:

```
[2026-05-25] Owner dan branch_manager tidak menggunakan Portal Karyawan.
Mereka menggunakan "Profil & Akun Saya" — konten berbeda, tanpa metrik karyawan.
Alasan: owner adalah pemilik bisnis, bukan karyawan. Mental model berbeda.

[2026-05-25] Konfigurasi insentif ada di Karyawan → tab Insentif.
Hanya owner dan hr_admin yang bisa mengkonfigurasi.
Output (riwayat insentif per karyawan) tampil di Portal Karyawan masing-masing.

[2026-05-25] Role owner = akses semua cabang + billing + user management global.
Role branch_manager = akses satu cabang yang ditugaskan, tanpa billing/subscription.
Untuk "manager kepercayaan" yang pegang semua: gunakan role owner (co-owner).
```
