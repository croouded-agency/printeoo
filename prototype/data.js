// Dummy data
(function () {
  const today = new Date();
  today.setHours(9, 0, 0, 0);

  const addDays = (offset, hour = 9, minute = 0) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString();
  };

  const dateStamp = (offset = 0) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("");
  };

  const customers = [
    { id: "CUST-001", type: "individual", name: "Budi Santoso", phone: "0812-3456-7788", email: "budi.santoso@email.com", address: "Jl. Dharmahusada Indah, Surabaya", segment: "Retail" },
    { id: "CUST-002", type: "company", name: "PT Maju Jaya Surabaya", phone: "031-595-8821", email: "marketing@majujayasby.co.id", address: "Rungkut Industri, Surabaya", segment: "Corporate" },
    { id: "CUST-003", type: "individual", name: "Rina Dewi", phone: "0813-9988-2211", email: "rina.dewi@email.com", address: "Perumahan Pakuwon City, Surabaya", segment: "Retail" },
    { id: "CUST-004", type: "company", name: "CV Berkah Mandiri", phone: "031-734-9102", email: "admin@berkahmandiri.id", address: "Jl. Mayjen Sungkono, Surabaya", segment: "Corporate" },
    { id: "CUST-005", type: "business", name: "Toko Sembako Pak Heri", phone: "0857-3100-4455", email: "pakheri@warung.id", address: "Pasar Wonokromo, Surabaya", segment: "UMKM" },
    { id: "CUST-006", type: "institution", name: "Universitas Airlangga - Humas", phone: "031-503-5678", email: "humas@unair.ac.id", address: "Kampus C UNAIR, Mulyorejo", segment: "Instansi" },
    { id: "CUST-007", type: "business", name: "Kopi Tepi Kali", phone: "0821-4420-8811", email: "owner@kopitepikali.id", address: "Jl. Ketintang Baru, Surabaya", segment: "F&B" },
    { id: "CUST-008", type: "company", name: "PT Sinar Laut Logistik", phone: "031-328-1190", email: "procurement@sinarlaut.co.id", address: "Tanjung Perak, Surabaya", segment: "Corporate" },
    { id: "CUST-009", type: "individual", name: "Dewi Kartika", phone: "0819-5550-2311", email: "dewi.kartika@email.com", address: "Jl. Raya Darmo, Surabaya", segment: "Retail" },
    { id: "CUST-010", type: "institution", name: "SMA Negeri 5 Surabaya", phone: "031-534-5150", email: "tu@sman5sby.sch.id", address: "Jl. Kusuma Bangsa, Surabaya", segment: "Sekolah" },
    { id: "CUST-011", type: "business", name: "Salon Cantik Bu Lilis", phone: "0812-3009-1200", email: "lilis.salon@email.com", address: "Jl. Manukan Tama, Surabaya", segment: "UMKM" },
    { id: "CUST-012", type: "company", name: "PT Graha Properti Timur", phone: "031-731-2299", email: "sales@grahaproperti.co.id", address: "Citraland, Surabaya", segment: "Corporate" },
    { id: "CUST-013", type: "business", name: "Depot Rawon Bu Sari", phone: "0813-5700-4401", email: "rawonbusari@email.com", address: "Jl. Embong Malang, Surabaya", segment: "F&B" },
    { id: "CUST-014", type: "institution", name: "RS Mitra Keluarga Kenjeran", phone: "031-9900-1234", email: "pengadaan@rsmkk.co.id", address: "Kenjeran, Surabaya", segment: "Kesehatan" },
    { id: "CUST-015", type: "individual", name: "Agus Prasetyo", phone: "0822-4567-9900", email: "agus.prasetyo@email.com", address: "Jl. Ngagel Jaya, Surabaya", segment: "Retail" },
    { id: "CUST-016", type: "business", name: "Bengkel Jaya Motor", phone: "0856-4655-2121", email: "jayamotor@email.com", address: "Jl. Raya Menur, Surabaya", segment: "Otomotif" },
    { id: "CUST-017", type: "community", name: "Komunitas Lari Surabaya", phone: "0817-0220-1991", email: "admin@larisby.id", address: "Taman Bungkul, Surabaya", segment: "Komunitas" },
    { id: "CUST-018", type: "company", name: "PT Delta Digital Nusantara", phone: "031-843-7781", email: "office@deltadigital.id", address: "MERR, Surabaya", segment: "Corporate" },
    { id: "CUST-019", type: "business", name: "Toko Kue Lapis Legit Oma", phone: "0811-3300-8877", email: "oma.lapis@email.com", address: "Jl. Kedungdoro, Surabaya", segment: "F&B" },
    { id: "CUST-020", type: "institution", name: "Dinas Koperasi Kota Surabaya", phone: "031-545-7510", email: "event@dinkop-sby.go.id", address: "Jl. Tunjungan, Surabaya", segment: "Pemerintah" },
    { id: "CUST-021", type: "business", name: "Hijab Nabila Store", phone: "0812-5100-7722", email: "nabila.store@email.com", address: "Pusat Grosir Surabaya", segment: "Retail Fashion" },
    { id: "CUST-022", type: "company", name: "PT Artha Media Promosindo", phone: "031-567-0091", email: "project@arthamedia.id", address: "Jl. Basuki Rahmat, Surabaya", segment: "Agency" },
  ];

  const products = [
    { id: "PROD-001", name: "Banner Flexi China 340gr", category: "Large Format", unit: "m2", basePrice: 28000, minQty: 1, specs: ["Outdoor", "High resolution", "Finishing mata ayam"] },
    { id: "PROD-002", name: "Spanduk Kain Anti Air", category: "Large Format", unit: "m2", basePrice: 45000, minQty: 1, specs: ["Kain waterproof", "Cocok event indoor"] },
    { id: "PROD-003", name: "Kartu Nama Art Carton 260gr - 1 sisi", category: "Offset/Digital", unit: "box", basePrice: 65000, minQty: 1, specs: ["Isi 100", "Laminasi doff opsional"] },
    { id: "PROD-004", name: "Kartu Nama Art Carton 260gr - 2 sisi", category: "Offset/Digital", unit: "box", basePrice: 85000, minQty: 1, specs: ["Isi 100", "Full color bolak-balik"] },
    { id: "PROD-005", name: "Brosur A4 Full Color - 1 lipatan", category: "Offset/Digital", unit: "lembar", basePrice: 2500, minQty: 100, specs: ["Art paper 150gr", "Bi-fold"] },
    { id: "PROD-006", name: "Brosur A4 Full Color - 2 lipatan", category: "Offset/Digital", unit: "lembar", basePrice: 3000, minQty: 100, specs: ["Art paper 150gr", "Tri-fold"] },
    { id: "PROD-007", name: "Stiker Vinyl Outdoor", category: "Sticker", unit: "m2", basePrice: 55000, minQty: 1, specs: ["Tahan air", "Laminasi glossy"] },
    { id: "PROD-008", name: "Undangan A5 Ivory 230gr", category: "Invitation", unit: "pcs", basePrice: 4200, minQty: 50, specs: ["Ivory 230gr", "Cetak 2 sisi"] },
    { id: "PROD-009", name: "X-Banner 60x160cm", category: "Display", unit: "set", basePrice: 95000, minQty: 1, specs: ["Termasuk rangka", "Flexi 340gr"] },
    { id: "PROD-010", name: "Roll Banner 85x200cm", category: "Display", unit: "set", basePrice: 285000, minQty: 1, specs: ["Aluminium stand", "Tas pembawa"] },
    { id: "PROD-011", name: "Nota/Kwitansi 2 ply", category: "Stationery", unit: "buku", basePrice: 18000, minQty: 10, specs: ["NCR 2 ply", "Nomorator"] },
    { id: "PROD-012", name: "Kalender Meja 2027", category: "Merchandise", unit: "pcs", basePrice: 22000, minQty: 25, specs: ["13 lembar", "Dudukan hardboard"] },
    { id: "PROD-013", name: "Mug Cetak Full Wrap", category: "Merchandise", unit: "pcs", basePrice: 38000, minQty: 1, specs: ["Sublimasi", "Full wrap"] },
    { id: "PROD-014", name: "Kaos Sablon DTF", category: "Apparel", unit: "pcs", basePrice: 65000, minQty: 5, specs: ["Cotton combed", "Area A4"] },
    { id: "PROD-015", name: "Neon Box Akrilik Custom", category: "Signage", unit: "m2", basePrice: 1250000, minQty: 1, specs: ["Akrilik susu", "LED indoor/outdoor"] },
    { id: "PROD-016", name: "Billboard Besi + Pasang", category: "Signage", unit: "m2", basePrice: 1850000, minQty: 1, specs: ["Rangka hollow", "Termasuk instalasi Surabaya"] },
    { id: "PROD-017", name: "Backdrop Foto 3x2m", category: "Event", unit: "set", basePrice: 650000, minQty: 1, specs: ["Flexi Korea", "Rangka pipa"] },
  ];

  const statuses = ["draft", "confirmed", "design_queue", "in_design", "printing", "finishing", "ready", "delivered", "closed"];
  const productionStageByStatus = {
    draft: "Draft",
    confirmed: "Antrian Desain",
    design_queue: "Antrian Desain",
    in_design: "Sedang Desain",
    printing: "Sedang Cetak",
    finishing: "Finishing",
    ready: "Siap Ambil",
    delivered: "Diantar",
    closed: "Selesai",
  };

  const orderSeeds = [
    ["CUST-002", "PROD-001", 12, 336000, "urgent", "printing", -1, "DP 50%, banner grand opening gudang baru"],
    ["CUST-006", "PROD-005", 1500, 3750000, "VIP", "finishing", -1, "Brosur penerimaan mahasiswa baru"],
    ["CUST-014", "PROD-007", 8, 440000, "urgent", "in_design", -1, "Stiker arah poli klinik"],
    ["CUST-007", "PROD-009", 3, 285000, "normal", "ready", 0, "Promo menu kopi susu"],
    ["CUST-020", "PROD-017", 1, 650000, "VIP", "printing", 0, "Backdrop sosialisasi UMKM"],
    ["CUST-003", "PROD-008", 250, 1050000, "normal", "confirmed", 0, "Undangan lamaran keluarga"],
    ["CUST-010", "PROD-012", 120, 2640000, "normal", "design_queue", 1, "Kalender meja sekolah"],
    ["CUST-012", "PROD-015", 2, 2500000, "VIP", "finishing", 2, "Neon box kantor pemasaran"],
    ["CUST-005", "PROD-011", 30, 540000, "normal", "delivered", -2, "Nota toko sembako"],
    ["CUST-018", "PROD-004", 10, 850000, "normal", "closed", -3, "Kartu nama tim sales"],
    ["CUST-021", "PROD-007", 5, 275000, "urgent", "printing", 0, "Label packaging hijab"],
    ["CUST-016", "PROD-001", 6, 168000, "normal", "ready", 1, "Banner oli motor"],
    ["CUST-001", "PROD-013", 12, 456000, "normal", "confirmed", 2, "Mug reuni keluarga"],
    ["CUST-022", "PROD-016", 1, 5550000, "VIP", "in_design", 4, "Billboard campaign klien agency"],
    ["CUST-011", "PROD-002", 4, 180000, "normal", "draft", 3, "Spanduk promo treatment rambut"],
    ["CUST-008", "PROD-010", 4, 1140000, "urgent", "printing", 1, "Roll banner safety briefing"],
    ["CUST-004", "PROD-006", 800, 2400000, "normal", "finishing", 2, "Brosur company profile"],
    ["CUST-009", "PROD-003", 2, 130000, "normal", "closed", -4, "Kartu nama personal trainer"],
    ["CUST-013", "PROD-001", 9, 252000, "urgent", "ready", 0, "Banner menu rawon spesial"],
    ["CUST-015", "PROD-014", 24, 1560000, "normal", "printing", 3, "Kaos komunitas kantor"],
    ["CUST-017", "PROD-014", 80, 5200000, "VIP", "design_queue", 5, "Kaos event lari Minggu pagi"],
    ["CUST-019", "PROD-007", 3, 165000, "normal", "confirmed", 1, "Stiker kemasan lapis legit"],
    ["CUST-002", "PROD-011", 40, 720000, "normal", "delivered", -1, "Kwitansi gudang cabang"],
    ["CUST-006", "PROD-010", 6, 1710000, "VIP", "ready", 0, "Roll banner seminar kampus"],
    ["CUST-020", "PROD-005", 2500, 6250000, "urgent", "printing", 0, "Flyer bazar UMKM"],
    ["CUST-004", "PROD-001", 20, 560000, "normal", "finishing", 2, "Banner rekrutmen sales"],
    ["CUST-018", "PROD-012", 75, 1650000, "normal", "in_design", 6, "Kalender klien digital"],
    ["CUST-007", "PROD-013", 20, 760000, "normal", "closed", -5, "Mug pelanggan loyal"],
    ["CUST-012", "PROD-017", 2, 1300000, "urgent", "confirmed", 1, "Backdrop launching cluster"],
    ["CUST-014", "PROD-006", 1000, 3000000, "normal", "design_queue", 4, "Brosur layanan kesehatan"],
    ["CUST-021", "PROD-003", 5, 325000, "normal", "draft", 7, "Kartu nama owner butik"],
    ["CUST-008", "PROD-016", 1, 7400000, "VIP", "finishing", 3, "Papan billboard area pelabuhan"],
  ];

  const orders = orderSeeds.map((seed, index) => {
    const [customerId, productId, qty, total, priority, status, deadlineOffset, notes] = seed;
    const customer = customers.find((item) => item.id === customerId);
    const product = products.find((item) => item.id === productId);
    const createdOffset = Math.min(deadlineOffset - 4, -1);
    const sequence = String(index + 1).padStart(4, "0");

    return {
      id: `ORD-${sequence}`,
      spkNumber: `SPK-SBY-${dateStamp(createdOffset)}-${sequence}`,
      customerId,
      customerName: customer.name,
      productId,
      productName: product.name,
      qty,
      unit: product.unit,
      total,
      paidAmount: status === "draft" ? 0 : Math.round(total * (status === "closed" || status === "delivered" ? 1 : 0.5)),
      paymentStatus: status === "closed" || status === "delivered" ? "paid" : status === "draft" ? "unpaid" : "partial",
      status,
      priority,
      productionStage: productionStageByStatus[status],
      branchId: index % 5 === 0 ? "BR-SBY-BARAT" : "BR-SBY-PUSAT",
      createdAt: addDays(createdOffset, 10 + (index % 6), (index * 7) % 60),
      deadlineAt: addDays(deadlineOffset, 16, index % 2 === 0 ? 0 : 30),
      updatedAt: addDays(Math.min(deadlineOffset, 0), 11 + (index % 5), 15),
      designerId: ["EMP-003", "EMP-004"][index % 2],
      operatorId: ["EMP-005", "EMP-006", "EMP-007"][index % 3],
      notes,
      files: [
        { name: `desain-${sequence}.pdf`, type: "application/pdf", uploadedAt: addDays(createdOffset, 11, 0) },
      ],
      timeline: [
        { at: addDays(createdOffset, 10, 0), status: "created", user: "Siti Aminah", note: "Order dibuat dari kasir" },
        ...(status !== "draft" ? [{ at: addDays(createdOffset, 10, 20), status: "confirmed", user: "Ahmad Fauzi", note: "SPK dikonfirmasi" }] : []),
        ...(statuses.indexOf(status) >= statuses.indexOf("printing") ? [{ at: addDays(Math.min(deadlineOffset, -1), 9, 30), status: "printing", user: "Eko Pramono", note: "Masuk proses cetak" }] : []),
      ],
    };
  });

  const employees = [
    { id: "EMP-001", name: "Ahmad Fauzi", role: "owner", position: "Owner", contractType: "bulanan", branchId: "BR-SBY-PUSAT", salary: 12000000, phone: "0812-1111-2233" },
    { id: "EMP-002", name: "Siti Aminah", role: "cashier", position: "Kasir", contractType: "bulanan", branchId: "BR-SBY-PUSAT", salary: 4200000, phone: "0813-2222-3344" },
    { id: "EMP-003", name: "Dimas Pratama", role: "designer", position: "Desainer", contractType: "bulanan", branchId: "BR-SBY-PUSAT", salary: 5200000, phone: "0821-3333-4455" },
    { id: "EMP-004", name: "Maya Lestari", role: "designer", position: "Desainer", contractType: "freelance", branchId: "BR-SBY-BARAT", salary: 3500000, phone: "0857-4444-5566" },
    { id: "EMP-005", name: "Eko Pramono", role: "operator", position: "Operator Cetak", contractType: "bulanan", branchId: "BR-SBY-PUSAT", salary: 4800000, phone: "0812-5555-6677" },
    { id: "EMP-006", name: "Nur Hidayat", role: "operator", position: "Operator Cetak", contractType: "harian", branchId: "BR-SBY-PUSAT", salary: 175000, phone: "0819-6666-7788" },
    { id: "EMP-007", name: "Rizky Maulana", role: "operator", position: "Operator Finishing", contractType: "bulanan", branchId: "BR-SBY-PUSAT", salary: 4300000, phone: "0822-7777-8899" },
    { id: "EMP-008", name: "Taufik Hidayat", role: "warehouse", position: "Staff Gudang", contractType: "bulanan", branchId: "BR-SBY-PUSAT", salary: 3900000, phone: "0856-8888-9900" },
    { id: "EMP-009", name: "Novi Rahma", role: "finance", position: "Admin Keuangan", contractType: "bulanan", branchId: "BR-SBY-PUSAT", salary: 5000000, phone: "0811-9999-0011" },
    { id: "EMP-010", name: "Bayu Saputra", role: "installer", position: "Teknisi Pemasangan", contractType: "harian", branchId: "BR-SBY-BARAT", salary: 225000, phone: "0821-1010-2020" },
    { id: "EMP-011", name: "Lina Marlina", role: "cashier", position: "Kasir Cabang", contractType: "bulanan", branchId: "BR-SBY-BARAT", salary: 4000000, phone: "0813-3030-4040" },
  ];

  const inventory = [
    { id: "MAT-001", name: "Flexi China 340gr", category: "Media Cetak", unit: "roll", stock: 12, minStock: 4, avgCost: 650000, supplier: "UD Sumber Grafika", status: "safe" },
    { id: "MAT-002", name: "Flexi Korea 440gr", category: "Media Cetak", unit: "roll", stock: 3, minStock: 4, avgCost: 980000, supplier: "PT Media Visual Prima", status: "low" },
    { id: "MAT-003", name: "Art Paper 150gr", category: "Kertas", unit: "rim", stock: 45, minStock: 12, avgCost: 72000, supplier: "Toko Kertas Surabaya", status: "safe" },
    { id: "MAT-004", name: "Art Carton 260gr", category: "Kertas", unit: "rim", stock: 18, minStock: 8, avgCost: 96000, supplier: "Toko Kertas Surabaya", status: "safe" },
    { id: "MAT-005", name: "Ivory 230gr", category: "Kertas", unit: "rim", stock: 9, minStock: 6, avgCost: 105000, supplier: "CV Kertas Jaya", status: "safe" },
    { id: "MAT-006", name: "Tinta Cyan Epson", category: "Tinta", unit: "liter", stock: 2.5, minStock: 1, avgCost: 185000, supplier: "Inkindo Surabaya", status: "safe" },
    { id: "MAT-007", name: "Tinta Magenta Epson", category: "Tinta", unit: "liter", stock: 0.5, minStock: 1, avgCost: 185000, supplier: "Inkindo Surabaya", status: "low" },
    { id: "MAT-008", name: "Tinta Yellow Epson", category: "Tinta", unit: "liter", stock: 1.75, minStock: 1, avgCost: 185000, supplier: "Inkindo Surabaya", status: "safe" },
    { id: "MAT-009", name: "Tinta Black Epson", category: "Tinta", unit: "liter", stock: 3, minStock: 1, avgCost: 175000, supplier: "Inkindo Surabaya", status: "safe" },
    { id: "MAT-010", name: "Vinyl Outdoor Glossy", category: "Sticker", unit: "roll", stock: 5, minStock: 3, avgCost: 740000, supplier: "PT Media Visual Prima", status: "safe" },
    { id: "MAT-011", name: "Laminasi Doff 32cm", category: "Finishing", unit: "roll", stock: 2, minStock: 3, avgCost: 225000, supplier: "UD Sumber Grafika", status: "low" },
    { id: "MAT-012", name: "Laminasi Glossy 32cm", category: "Finishing", unit: "roll", stock: 6, minStock: 3, avgCost: 215000, supplier: "UD Sumber Grafika", status: "safe" },
    { id: "MAT-013", name: "Mata Ayam Banner", category: "Aksesoris", unit: "pack", stock: 14, minStock: 5, avgCost: 35000, supplier: "Toko Alat Reklame", status: "safe" },
    { id: "MAT-014", name: "Rangka X-Banner 60x160", category: "Display", unit: "pcs", stock: 28, minStock: 10, avgCost: 42000, supplier: "Toko Alat Reklame", status: "safe" },
    { id: "MAT-015", name: "Stand Roll Banner 85x200", category: "Display", unit: "pcs", stock: 11, minStock: 5, avgCost: 175000, supplier: "Toko Alat Reklame", status: "safe" },
    { id: "MAT-016", name: "NCR 2 Ply", category: "Kertas", unit: "rim", stock: 7, minStock: 4, avgCost: 118000, supplier: "CV Kertas Jaya", status: "safe" },
  ];

  const materialBatches = [
    { id: "8df16cf2-9d56-4478-9365-bdc7d27e5c01", materialId: "MAT-001", batchNumber: "BCH-FLX340-2605-001", receivedAt: addDays(-8), initialQty: 8, remainingQty: 5.5, unit: "roll", supplier: "UD Sumber Grafika", qrUrl: "app.printeoo.com/scan?b=8df16cf2-9d56-4478-9365-bdc7d27e5c01&t=tenant-printeoo-demo" },
    { id: "0ad42444-c590-4d99-8d02-3062da43d9e8", materialId: "MAT-002", batchNumber: "BCH-FLX440-2605-002", receivedAt: addDays(-5), initialQty: 4, remainingQty: 3, unit: "roll", supplier: "PT Media Visual Prima", qrUrl: "app.printeoo.com/scan?b=0ad42444-c590-4d99-8d02-3062da43d9e8&t=tenant-printeoo-demo" },
    { id: "f8b1e04c-60ac-4a89-a2a1-397aa493c2ee", materialId: "MAT-007", batchNumber: "BCH-INKM-2605-003", receivedAt: addDays(-12), initialQty: 2, remainingQty: 0.5, unit: "liter", supplier: "Inkindo Surabaya", qrUrl: "app.printeoo.com/scan?b=f8b1e04c-60ac-4a89-a2a1-397aa493c2ee&t=tenant-printeoo-demo" },
  ];

  const scanLogs = [
    { id: "SCAN-001", batchId: "8df16cf2-9d56-4478-9365-bdc7d27e5c01", scannedAt: addDays(-1, 13, 20), userId: "EMP-005", spkNumber: orders[0].spkNumber, action: "usage_input" },
    { id: "SCAN-002", batchId: "0ad42444-c590-4d99-8d02-3062da43d9e8", scannedAt: addDays(0, 8, 45), userId: "EMP-008", spkNumber: null, action: "stock_check" },
    { id: "SCAN-003", batchId: "f8b1e04c-60ac-4a89-a2a1-397aa493c2ee", scannedAt: addDays(0, 10, 15), userId: "EMP-006", spkNumber: orders[24].spkNumber, action: "usage_input" },
  ];

  const incomingLog = [
    { id: "INC-001", itemId: "MAT-001", itemName: "Flexi China 340gr", batchId: "BATCH-20260515-001", qty: 8, unit: "roll", supplier: "UD Sumber Grafika", pricePerUnit: 650000, totalPrice: 5200000, receivedDate: addDays(-8), receivedBy: "Ahmad Fauzi", notes: "Kondisi baik, tidak ada kerusakan" },
    { id: "INC-002", itemId: "MAT-002", itemName: "Flexi Korea 440gr", batchId: "BATCH-20260518-001", qty: 4, unit: "roll", supplier: "PT Media Visual Prima", pricePerUnit: 980000, totalPrice: 3920000, receivedDate: addDays(-5), receivedBy: "Siti Aminah", notes: "" },
    { id: "INC-003", itemId: "MAT-007", itemName: "Tinta Magenta Epson", batchId: "BATCH-20260511-001", qty: 2, unit: "liter", supplier: "Inkindo Surabaya", pricePerUnit: 185000, totalPrice: 370000, receivedDate: addDays(-12), receivedBy: "Ahmad Fauzi", notes: "Order ulang karena stok menipis" },
    { id: "INC-004", itemId: "MAT-003", itemName: "Art Paper 150gr", batchId: "BATCH-20260510-001", qty: 20, unit: "rim", supplier: "Toko Kertas Surabaya", pricePerUnit: 72000, totalPrice: 1440000, receivedDate: addDays(-13), receivedBy: "Siti Aminah", notes: "" },
    { id: "INC-005", itemId: "MAT-011", itemName: "Laminasi Doff 32cm", batchId: "BATCH-20260508-001", qty: 5, unit: "roll", supplier: "UD Sumber Grafika", pricePerUnit: 225000, totalPrice: 1125000, receivedDate: addDays(-15), receivedBy: "Ahmad Fauzi", notes: "Stok laminasi menipis setelah promo bulan lalu" },
    { id: "INC-006", itemId: "MAT-006", itemName: "Tinta Cyan Epson", batchId: "BATCH-20260505-001", qty: 3, unit: "liter", supplier: "Inkindo Surabaya", pricePerUnit: 185000, totalPrice: 555000, receivedDate: addDays(-18), receivedBy: "Siti Aminah", notes: "" },
    { id: "INC-007", itemId: "MAT-004", itemName: "Art Carton 260gr", batchId: "BATCH-20260503-001", qty: 12, unit: "rim", supplier: "Toko Kertas Surabaya", pricePerUnit: 96000, totalPrice: 1152000, receivedDate: addDays(-20), receivedBy: "Ahmad Fauzi", notes: "" },
    { id: "INC-008", itemId: "MAT-014", itemName: "Rangka X-Banner 60x160", batchId: "BATCH-20260501-001", qty: 15, unit: "pcs", supplier: "Toko Alat Reklame", pricePerUnit: 42000, totalPrice: 630000, receivedDate: addDays(-22), receivedBy: "Siti Aminah", notes: "Pembelian rutin bulanan" },
    { id: "INC-009", itemId: "MAT-010", itemName: "Vinyl Outdoor Glossy", batchId: "BATCH-20260428-001", qty: 4, unit: "roll", supplier: "PT Media Visual Prima", pricePerUnit: 740000, totalPrice: 2960000, receivedDate: addDays(-25), receivedBy: "Ahmad Fauzi", notes: "" },
    { id: "INC-010", itemId: "MAT-009", itemName: "Tinta Black Epson", batchId: "BATCH-20260425-001", qty: 4, unit: "liter", supplier: "Inkindo Surabaya", pricePerUnit: 175000, totalPrice: 700000, receivedDate: addDays(-28), receivedBy: "Siti Aminah", notes: "" },
    { id: "INC-011", itemId: "MAT-005", itemName: "Ivory 230gr", batchId: "BATCH-20260420-001", qty: 10, unit: "rim", supplier: "CV Kertas Jaya", pricePerUnit: 105000, totalPrice: 1050000, receivedDate: addDays(-33), receivedBy: "Ahmad Fauzi", notes: "Untuk produksi undangan musim nikah" },
    { id: "INC-012", itemId: "MAT-015", itemName: "Stand Roll Banner 85x200", batchId: "BATCH-20260415-001", qty: 8, unit: "pcs", supplier: "Toko Alat Reklame", pricePerUnit: 175000, totalPrice: 1400000, receivedDate: addDays(-38), receivedBy: "Siti Aminah", notes: "" },
  ];

  const usageLog = [
    { id: "USE-001", spkNumber: orders[0].spkNumber, productName: orders[0].productName, itemId: "MAT-001", itemName: "Flexi China 340gr", unit: "roll", qtyUsed: 1.2, qtyWaste: 0.08, wasteCategory: "cutting", unitCost: 650000, usedAt: addDays(0, 10, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-002", spkNumber: orders[1].spkNumber, productName: orders[1].productName, itemId: "MAT-003", itemName: "Art Paper 150gr", unit: "rim", qtyUsed: 2.5, qtyWaste: 0.2, wasteCategory: "misprint", unitCost: 72000, usedAt: addDays(0, 10, 30), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-003", spkNumber: orders[1].spkNumber, productName: orders[1].productName, itemId: "MAT-006", itemName: "Tinta Cyan Epson", unit: "liter", qtyUsed: 0.3, qtyWaste: 0.02, wasteCategory: "calibration", unitCost: 185000, usedAt: addDays(0, 10, 30), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-004", spkNumber: orders[1].spkNumber, productName: orders[1].productName, itemId: "MAT-007", itemName: "Tinta Magenta Epson", unit: "liter", qtyUsed: 0.25, qtyWaste: 0.01, wasteCategory: "calibration", unitCost: 185000, usedAt: addDays(0, 10, 30), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-005", spkNumber: orders[4].spkNumber, productName: orders[4].productName, itemId: "MAT-001", itemName: "Flexi China 340gr", unit: "roll", qtyUsed: 0.8, qtyWaste: 0.05, wasteCategory: "cutting", unitCost: 650000, usedAt: addDays(-1, 9, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-006", spkNumber: orders[10].spkNumber, productName: orders[10].productName, itemId: "MAT-010", itemName: "Vinyl Outdoor Glossy", unit: "roll", qtyUsed: 0.5, qtyWaste: 0.03, wasteCategory: "cutting", unitCost: 740000, usedAt: addDays(-1, 11, 0), operatorId: "EMP-007", operatorName: "Hendra Wijaya" },
    { id: "USE-007", spkNumber: orders[15].spkNumber, productName: orders[15].productName, itemId: "MAT-015", itemName: "Stand Roll Banner 85x200", unit: "pcs", qtyUsed: 4, qtyWaste: 0, wasteCategory: null, unitCost: 175000, usedAt: addDays(-1, 14, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-008", spkNumber: orders[18].spkNumber, productName: orders[18].productName, itemId: "MAT-001", itemName: "Flexi China 340gr", unit: "roll", qtyUsed: 0.9, qtyWaste: 0.06, wasteCategory: "cutting", unitCost: 650000, usedAt: addDays(-2, 9, 30), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-009", spkNumber: orders[18].spkNumber, productName: orders[18].productName, itemId: "MAT-013", itemName: "Mata Ayam Banner", unit: "pack", qtyUsed: 1, qtyWaste: 0, wasteCategory: null, unitCost: 35000, usedAt: addDays(-2, 9, 30), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-010", spkNumber: orders[16].spkNumber, productName: orders[16].productName, itemId: "MAT-003", itemName: "Art Paper 150gr", unit: "rim", qtyUsed: 3.0, qtyWaste: 0.3, wasteCategory: "misprint", unitCost: 72000, usedAt: addDays(-2, 13, 0), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-011", spkNumber: orders[16].spkNumber, productName: orders[16].productName, itemId: "MAT-008", itemName: "Tinta Yellow Epson", unit: "liter", qtyUsed: 0.4, qtyWaste: 0.02, wasteCategory: "calibration", unitCost: 185000, usedAt: addDays(-2, 13, 0), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-012", spkNumber: orders[9].spkNumber, productName: orders[9].productName, itemId: "MAT-004", itemName: "Art Carton 260gr", unit: "rim", qtyUsed: 0.5, qtyWaste: 0.02, wasteCategory: "cutting", unitCost: 96000, usedAt: addDays(-3, 10, 0), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-013", spkNumber: orders[9].spkNumber, productName: orders[9].productName, itemId: "MAT-009", itemName: "Tinta Black Epson", unit: "liter", qtyUsed: 0.1, qtyWaste: 0, wasteCategory: null, unitCost: 175000, usedAt: addDays(-3, 10, 0), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-014", spkNumber: orders[24].spkNumber, productName: orders[24].productName, itemId: "MAT-003", itemName: "Art Paper 150gr", unit: "rim", qtyUsed: 5.0, qtyWaste: 0.4, wasteCategory: "overflow", unitCost: 72000, usedAt: addDays(-3, 14, 0), operatorId: "EMP-007", operatorName: "Hendra Wijaya" },
    { id: "USE-015", spkNumber: orders[24].spkNumber, productName: orders[24].productName, itemId: "MAT-006", itemName: "Tinta Cyan Epson", unit: "liter", qtyUsed: 0.55, qtyWaste: 0.03, wasteCategory: "calibration", unitCost: 185000, usedAt: addDays(-3, 14, 0), operatorId: "EMP-007", operatorName: "Hendra Wijaya" },
    { id: "USE-016", spkNumber: orders[22].spkNumber, productName: orders[22].productName, itemId: "MAT-016", itemName: "NCR 2 Ply", unit: "rim", qtyUsed: 1.0, qtyWaste: 0, wasteCategory: null, unitCost: 118000, usedAt: addDays(-4, 9, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-017", spkNumber: orders[23].spkNumber, productName: orders[23].productName, itemId: "MAT-015", itemName: "Stand Roll Banner 85x200", unit: "pcs", qtyUsed: 6, qtyWaste: 0, wasteCategory: null, unitCost: 175000, usedAt: addDays(-4, 11, 30), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-018", spkNumber: orders[8].spkNumber, productName: orders[8].productName, itemId: "MAT-016", itemName: "NCR 2 Ply", unit: "rim", qtyUsed: 0.8, qtyWaste: 0, wasteCategory: null, unitCost: 118000, usedAt: addDays(-5, 9, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-019", spkNumber: orders[25].spkNumber, productName: orders[25].productName, itemId: "MAT-001", itemName: "Flexi China 340gr", unit: "roll", qtyUsed: 2.0, qtyWaste: 0.12, wasteCategory: "cutting", unitCost: 650000, usedAt: addDays(-5, 13, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-020", spkNumber: orders[25].spkNumber, productName: orders[25].productName, itemId: "MAT-013", itemName: "Mata Ayam Banner", unit: "pack", qtyUsed: 2, qtyWaste: 0, wasteCategory: null, unitCost: 35000, usedAt: addDays(-5, 13, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-021", spkNumber: orders[7].spkNumber, productName: orders[7].productName, itemId: "MAT-011", itemName: "Laminasi Doff 32cm", unit: "roll", qtyUsed: 1.0, qtyWaste: 0.05, wasteCategory: "cutting", unitCost: 225000, usedAt: addDays(-6, 10, 0), operatorId: "EMP-007", operatorName: "Hendra Wijaya" },
    { id: "USE-022", spkNumber: orders[17].spkNumber, productName: orders[17].productName, itemId: "MAT-004", itemName: "Art Carton 260gr", unit: "rim", qtyUsed: 0.3, qtyWaste: 0.01, wasteCategory: "cutting", unitCost: 96000, usedAt: addDays(-8, 10, 0), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-023", spkNumber: orders[3].spkNumber, productName: orders[3].productName, itemId: "MAT-015", itemName: "Stand Roll Banner 85x200", unit: "pcs", qtyUsed: 3, qtyWaste: 0, wasteCategory: null, unitCost: 175000, usedAt: addDays(-8, 14, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-024", spkNumber: orders[11].spkNumber, productName: orders[11].productName, itemId: "MAT-001", itemName: "Flexi China 340gr", unit: "roll", qtyUsed: 0.6, qtyWaste: 0.04, wasteCategory: "cutting", unitCost: 650000, usedAt: addDays(-10, 9, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-025", spkNumber: orders[11].spkNumber, productName: orders[11].productName, itemId: "MAT-013", itemName: "Mata Ayam Banner", unit: "pack", qtyUsed: 1, qtyWaste: 0, wasteCategory: null, unitCost: 35000, usedAt: addDays(-10, 9, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-026", spkNumber: orders[27].spkNumber, productName: orders[27].productName, itemId: "MAT-009", itemName: "Tinta Black Epson", unit: "liter", qtyUsed: 0.2, qtyWaste: 0.01, wasteCategory: "calibration", unitCost: 175000, usedAt: addDays(-12, 11, 0), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-027", spkNumber: orders[27].spkNumber, productName: orders[27].productName, itemId: "MAT-009", itemName: "Tinta Black Epson", unit: "liter", qtyUsed: 0.15, qtyWaste: 0, wasteCategory: null, unitCost: 175000, usedAt: addDays(-12, 11, 0), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-028", spkNumber: orders[19].spkNumber, productName: orders[19].productName, itemId: "MAT-008", itemName: "Tinta Yellow Epson", unit: "liter", qtyUsed: 0.3, qtyWaste: 0.02, wasteCategory: "overflow", unitCost: 185000, usedAt: addDays(-14, 10, 0), operatorId: "EMP-007", operatorName: "Hendra Wijaya" },
    { id: "USE-029", spkNumber: orders[19].spkNumber, productName: orders[19].productName, itemId: "MAT-009", itemName: "Tinta Black Epson", unit: "liter", qtyUsed: 0.25, qtyWaste: 0.01, wasteCategory: "overflow", unitCost: 175000, usedAt: addDays(-14, 10, 0), operatorId: "EMP-007", operatorName: "Hendra Wijaya" },
    { id: "USE-030", spkNumber: orders[0].spkNumber, productName: orders[0].productName, itemId: "MAT-001", itemName: "Flexi China 340gr", unit: "roll", qtyUsed: 1.5, qtyWaste: 0.1, wasteCategory: "cutting", unitCost: 650000, usedAt: addDays(-16, 9, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-031", spkNumber: orders[0].spkNumber, productName: orders[0].productName, itemId: "MAT-013", itemName: "Mata Ayam Banner", unit: "pack", qtyUsed: 2, qtyWaste: 0, wasteCategory: null, unitCost: 35000, usedAt: addDays(-16, 9, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-032", spkNumber: orders[16].spkNumber, productName: orders[16].productName, itemId: "MAT-003", itemName: "Art Paper 150gr", unit: "rim", qtyUsed: 2.0, qtyWaste: 0.15, wasteCategory: "misprint", unitCost: 72000, usedAt: addDays(-18, 13, 0), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-033", spkNumber: orders[16].spkNumber, productName: orders[16].productName, itemId: "MAT-012", itemName: "Laminasi Glossy 32cm", unit: "roll", qtyUsed: 0.8, qtyWaste: 0.04, wasteCategory: "cutting", unitCost: 215000, usedAt: addDays(-18, 13, 0), operatorId: "EMP-007", operatorName: "Hendra Wijaya" },
    { id: "USE-034", spkNumber: orders[9].spkNumber, productName: orders[9].productName, itemId: "MAT-004", itemName: "Art Carton 260gr", unit: "rim", qtyUsed: 0.4, qtyWaste: 0.02, wasteCategory: "cutting", unitCost: 96000, usedAt: addDays(-20, 10, 0), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-035", spkNumber: orders[9].spkNumber, productName: orders[9].productName, itemId: "MAT-011", itemName: "Laminasi Doff 32cm", unit: "roll", qtyUsed: 0.6, qtyWaste: 0.03, wasteCategory: "cutting", unitCost: 225000, usedAt: addDays(-20, 10, 0), operatorId: "EMP-007", operatorName: "Hendra Wijaya" },
    { id: "USE-036", spkNumber: orders[27].spkNumber, productName: orders[27].productName, itemId: "MAT-005", itemName: "Ivory 230gr", unit: "rim", qtyUsed: 1.0, qtyWaste: 0.05, wasteCategory: "misprint", unitCost: 105000, usedAt: addDays(-25, 9, 0), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-037", spkNumber: orders[27].spkNumber, productName: orders[27].productName, itemId: "MAT-007", itemName: "Tinta Magenta Epson", unit: "liter", qtyUsed: 0.2, qtyWaste: 0.01, wasteCategory: "calibration", unitCost: 185000, usedAt: addDays(-25, 9, 0), operatorId: "EMP-006", operatorName: "Rizal Firmansyah" },
    { id: "USE-038", spkNumber: orders[31].spkNumber, productName: orders[31].productName, itemId: "MAT-001", itemName: "Flexi China 340gr", unit: "roll", qtyUsed: 3.5, qtyWaste: 0.2, wasteCategory: "cutting", unitCost: 650000, usedAt: addDays(-28, 9, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
    { id: "USE-039", spkNumber: orders[31].spkNumber, productName: orders[31].productName, itemId: "MAT-009", itemName: "Tinta Black Epson", unit: "liter", qtyUsed: 0.45, qtyWaste: 0.02, wasteCategory: "overflow", unitCost: 175000, usedAt: addDays(-28, 9, 0), operatorId: "EMP-005", operatorName: "Eko Pramono" },
  ];

  const opnameSessions = [
    {
      id: "OPN-001",
      name: "Opname Awal Mei 2026",
      date: addDays(-22),
      createdBy: "Ahmad Fauzi",
      status: "approved",
      approvedAt: addDays(-22),
      notes: "Opname rutin bulanan",
      reason: "Semua stok sesuai. Selisih kecil di Flexi Korea kemungkinan sisa cutting yang belum dicatat.",
      items: [
        { itemId: "MAT-001", itemName: "Flexi China 340gr", unit: "roll", systemStock: 4, physicalStock: 4, diff: 0 },
        { itemId: "MAT-002", itemName: "Flexi Korea 440gr", unit: "roll", systemStock: 5, physicalStock: 4, diff: -1 },
        { itemId: "MAT-003", itemName: "Art Paper 150gr", unit: "rim", systemStock: 45, physicalStock: 45, diff: 0 },
        { itemId: "MAT-004", itemName: "Art Carton 260gr", unit: "rim", systemStock: 18, physicalStock: 18, diff: 0 },
        { itemId: "MAT-005", itemName: "Ivory 230gr", unit: "rim", systemStock: 9, physicalStock: 9, diff: 0 },
        { itemId: "MAT-006", itemName: "Tinta Cyan Epson", unit: "liter", systemStock: 2.5, physicalStock: 2.5, diff: 0 },
        { itemId: "MAT-007", itemName: "Tinta Magenta Epson", unit: "liter", systemStock: 2.5, physicalStock: 2.5, diff: 0 },
        { itemId: "MAT-008", itemName: "Tinta Yellow Epson", unit: "liter", systemStock: 1.75, physicalStock: 1.75, diff: 0 },
        { itemId: "MAT-009", itemName: "Tinta Black Epson", unit: "liter", systemStock: 3, physicalStock: 3, diff: 0 },
        { itemId: "MAT-010", itemName: "Vinyl Outdoor Glossy", unit: "roll", systemStock: 5, physicalStock: 5, diff: 0 },
        { itemId: "MAT-011", itemName: "Laminasi Doff 32cm", unit: "roll", systemStock: 2, physicalStock: 2, diff: 0 },
        { itemId: "MAT-012", itemName: "Laminasi Glossy 32cm", unit: "roll", systemStock: 6, physicalStock: 6, diff: 0 },
        { itemId: "MAT-013", itemName: "Mata Ayam Banner", unit: "pack", systemStock: 14, physicalStock: 14, diff: 0 },
        { itemId: "MAT-014", itemName: "Rangka X-Banner 60x160", unit: "pcs", systemStock: 28, physicalStock: 28, diff: 0 },
        { itemId: "MAT-015", itemName: "Stand Roll Banner 85x200", unit: "pcs", systemStock: 11, physicalStock: 11, diff: 0 },
        { itemId: "MAT-016", itemName: "NCR 2 Ply", unit: "rim", systemStock: 7, physicalStock: 7, diff: 0 },
      ],
    },
    {
      id: "OPN-002",
      name: "Opname Pasca Proyek Billboard Pakuwon",
      date: addDays(-10),
      createdBy: "Ahmad Fauzi",
      status: "approved",
      approvedAt: addDays(-10),
      notes: "Cek stok setelah penyelesaian proyek besar billboard Pakuwon Mall",
      reason: "Selisih tinta magenta karena bocor kecil saat pengisian. Sudah dibuatkan berita acara kerusakan.",
      items: [
        { itemId: "MAT-001", itemName: "Flexi China 340gr", unit: "roll", systemStock: 12, physicalStock: 12, diff: 0 },
        { itemId: "MAT-002", itemName: "Flexi Korea 440gr", unit: "roll", systemStock: 3, physicalStock: 3, diff: 0 },
        { itemId: "MAT-006", itemName: "Tinta Cyan Epson", unit: "liter", systemStock: 2.5, physicalStock: 2.5, diff: 0 },
        { itemId: "MAT-007", itemName: "Tinta Magenta Epson", unit: "liter", systemStock: 0.75, physicalStock: 0.5, diff: -0.25 },
        { itemId: "MAT-008", itemName: "Tinta Yellow Epson", unit: "liter", systemStock: 1.75, physicalStock: 1.75, diff: 0 },
        { itemId: "MAT-009", itemName: "Tinta Black Epson", unit: "liter", systemStock: 3, physicalStock: 3, diff: 0 },
        { itemId: "MAT-010", itemName: "Vinyl Outdoor Glossy", unit: "roll", systemStock: 5, physicalStock: 5, diff: 0 },
        { itemId: "MAT-013", itemName: "Mata Ayam Banner", unit: "pack", systemStock: 14, physicalStock: 14, diff: 0 },
      ],
    },
  ];

  const adjustmentLog = [
    { id: "ADJ-001", opnameId: "OPN-001", itemId: "MAT-002", itemName: "Flexi Korea 440gr", oldStock: 5, newStock: 4, diff: -1, unit: "roll", adjustedAt: addDays(-22), adjustedBy: "Ahmad Fauzi" },
    { id: "ADJ-002", opnameId: "OPN-002", itemId: "MAT-007", itemName: "Tinta Magenta Epson", oldStock: 0.75, newStock: 0.5, diff: -0.25, unit: "liter", adjustedAt: addDays(-10), adjustedBy: "Ahmad Fauzi" },
  ];

  const dashboard = {
    revenueToday: 4750000,
    revenueYesterday: 4100000,
    ordersToday: 24,
    completedToday: 18,
    overdueOrders: orders.filter((order) => new Date(order.deadlineAt) < today && !["ready", "delivered", "closed"].includes(order.status)).length,
    revenueLast7Days: [
      { date: addDays(-6), revenue: 3250000 },
      { date: addDays(-5), revenue: 3800000 },
      { date: addDays(-4), revenue: 2950000 },
      { date: addDays(-3), revenue: 5200000 },
      { date: addDays(-2), revenue: 4450000 },
      { date: addDays(-1), revenue: 4100000 },
      { date: addDays(0), revenue: 4750000 },
    ],
    topProductsThisMonth: [
      { productId: "PROD-001", name: "Banner Flexi China 340gr", share: 28 },
      { productId: "PROD-005", name: "Brosur A4 Full Color - 1 lipatan", share: 21 },
      { productId: "PROD-007", name: "Stiker Vinyl Outdoor", share: 17 },
      { productId: "PROD-014", name: "Kaos Sablon DTF", share: 12 },
      { productId: "PROD-010", name: "Roll Banner 85x200cm", share: 9 },
    ],
    productionStatus: {
      design_queue: orders.filter((order) => order.status === "design_queue").length,
      in_design: orders.filter((order) => order.status === "in_design").length,
      printing: orders.filter((order) => order.status === "printing").length,
      finishing: orders.filter((order) => order.status === "finishing").length,
      ready: orders.filter((order) => order.status === "ready").length,
    },
  };

  const branches = [
    { id: "BR-SBY-PUSAT", name: "Surabaya Pusat", address: "Jl. Basuki Rahmat No. 88, Surabaya", phone: "031-501-7788", openingHours: "08.00-21.00", counters: 3 },
    { id: "BR-SBY-BARAT", name: "Surabaya Barat", address: "Ruko Pakuwon Trade Center, Surabaya", phone: "031-734-2210", openingHours: "09.00-20.00", counters: 2 },
  ];

  const queueNumbers = {
    branchId: "BR-SBY-PUSAT",
    date: addDays(0),
    current: [
      { counter: 1, number: "A-014", calledAt: addDays(0, 9, 35), customerName: "Rina Dewi" },
      { counter: 2, number: "A-015", calledAt: addDays(0, 9, 42), customerName: "Toko Sembako Pak Heri" },
      { counter: 3, number: "B-004", calledAt: addDays(0, 9, 47), customerName: "PT Maju Jaya Surabaya" },
    ],
    waiting: [
      { number: "A-016", type: "order", customerName: "Agus Prasetyo", createdAt: addDays(0, 9, 50) },
      { number: "A-017", type: "pickup", customerName: "Depot Rawon Bu Sari", createdAt: addDays(0, 9, 54) },
      { number: "B-005", type: "consultation", customerName: "Komunitas Lari Surabaya", createdAt: addDays(0, 9, 58) },
      { number: "A-018", type: "order", customerName: "Hijab Nabila Store", createdAt: addDays(0, 10, 2) },
    ],
    lastNumber: 18,
    runningText: "Jam buka 08.00-21.00 WIB. Printeoo siap bantu cetak cepat, rapi, dan tepat deadline.",
  };

  const APP_DATA = {
    tenant: {
      id: "tenant-printeoo-demo",
      name: "Titanium Print Surabaya",
      city: "Surabaya",
    },
    customers,
    products,
    orders,
    employees,
    inventory,
    materialBatches,
    scanLogs,
    incomingLog,
    usageLog,
    opnameSessions,
    adjustmentLog,
    dashboard,
    branches,
    queueNumbers,
    statusLabels: {
      draft: "Draft",
      confirmed: "Terkonfirmasi",
      design_queue: "Antrian Desain",
      in_design: "Sedang Desain",
      printing: "Sedang Cetak",
      finishing: "Finishing",
      ready: "Siap Ambil",
      delivered: "Terkirim",
      closed: "Selesai",
      note: "Catatan",
      cancelled: "Dibatalkan",
    },
    priorityLabels: {
      normal: "Normal",
      urgent: "Urgent",
      VIP: "VIP",
    },
  };

  window.APP_DATA = APP_DATA;
})();
