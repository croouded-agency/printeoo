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
    { id: "PROD-001", name: "Banner Flexi China 340gr", category: "Large Format", unit: "m2", basePrice: 28000, minQty: 1, description: "Banner outdoor ekonomis untuk promosi toko, event, dan signage sementara.", specs: ["Outdoor", "High resolution", "Finishing mata ayam"],
      bom: [
        { material: "Flexi China 340gr", qty: 0.0132, unit: "roll", wasteFactor: 0.08 },
        { material: "Mata Ayam Banner", qty: 8, unit: "pcs", wasteFactor: 0.05 },
      ]
    },
    { id: "PROD-002", name: "Spanduk Kain Anti Air", category: "Large Format", unit: "m2", basePrice: 45000, minQty: 1, description: "Spanduk kain yang lebih lentur dan tahan cipratan air untuk kebutuhan indoor maupun semi outdoor.", specs: ["Kain waterproof", "Cocok event indoor"],
      bom: [
        { material: "Spanduk Kain Anti Air", qty: 0.0089, unit: "roll", wasteFactor: 0.06 },
      ]
    },
    { id: "PROD-003", name: "Kartu Nama Art Carton 260gr - 1 sisi", category: "Offset/Digital", unit: "box", basePrice: 65000, minQty: 1, specs: ["Isi 100", "Laminasi doff opsional"], bom: [] },
    { id: "PROD-004", name: "Kartu Nama Art Carton 260gr - 2 sisi", category: "Offset/Digital", unit: "box", basePrice: 85000, minQty: 1, specs: ["Isi 100", "Full color bolak-balik"], bom: [] },
    { id: "PROD-005", name: "Brosur A4 Full Color - 1 lipatan", category: "Offset/Digital", unit: "lembar", basePrice: 2500, minQty: 100, description: "Brosur promosi A4 full color dengan satu lipatan untuk kebutuhan promo, event, dan company profile ringkas.", specs: ["Art paper 150gr", "Bi-fold"],
      bom: [
        { material: "Art Paper 150gr", qty: 0.002, unit: "rim", wasteFactor: 0.05 },
        { material: "Tinta CMYK", qty: 2, unit: "ml", wasteFactor: 0.10 },
      ]
    },
    { id: "PROD-006", name: "Brosur A4 Full Color - 2 lipatan", category: "Offset/Digital", unit: "lembar", basePrice: 3000, minQty: 100, specs: ["Art paper 150gr", "Tri-fold"], bom: [] },
    { id: "PROD-007", name: "Stiker Vinyl Outdoor", category: "Sticker", unit: "m2", basePrice: 55000, minQty: 1, description: "Stiker outdoor tahan air untuk label, branding, dan cutting contour sederhana.", specs: ["Tahan air", "Laminasi glossy"],
      bom: [
        { material: "Vinyl Outdoor Glossy", qty: 0.012, unit: "roll", wasteFactor: 0.08 },
      ]
    },
    { id: "PROD-008", name: "Undangan A5 Ivory 230gr", category: "Invitation", unit: "pcs", basePrice: 4200, minQty: 50, specs: ["Ivory 230gr", "Cetak 2 sisi"], bom: [] },
    { id: "PROD-009", name: "X-Banner 60×160cm", category: "Display", unit: "set", basePrice: 95000, minQty: 1, description: "Paket X-Banner lengkap dengan media cetak dan rangka display siap pasang untuk promosi cepat.", specs: ["Termasuk rangka", "Flexi 340gr"],
      bom: [
        { material: "Flexi China 340gr", qty: 0.60, unit: "m²", wasteFactor: 0.05 },
        { material: "Tinta CMYK", qty: 12, unit: "ml", wasteFactor: 0.10 },
        { material: "Stand X-Banner", qty: 1, unit: "pcs", wasteFactor: 0 },
      ]
    },
    { id: "PROD-010", name: "Roll Banner 85x200cm", category: "Display", unit: "set", basePrice: 285000, minQty: 1, specs: ["Aluminium stand", "Tas pembawa"], bom: [] },
    { id: "PROD-011", name: "Nota/Kwitansi 2 ply", category: "Stationery", unit: "buku", basePrice: 18000, minQty: 10, specs: ["NCR 2 ply", "Nomorator"], bom: [] },
    { id: "PROD-012", name: "Kalender Meja 2027", category: "Merchandise", unit: "pcs", basePrice: 22000, minQty: 25, specs: ["13 lembar", "Dudukan hardboard"], bom: [] },
    { id: "PROD-013", name: "Mug Cetak Full Wrap", category: "Merchandise", unit: "pcs", basePrice: 38000, minQty: 1, specs: ["Sublimasi", "Full wrap"], bom: [] },
    { id: "PROD-014", name: "Kaos Sablon DTF", category: "Apparel", unit: "pcs", basePrice: 65000, minQty: 5, specs: ["Cotton combed", "Area A4"], bom: [] },
    { id: "PROD-015", name: "Neon Box Akrilik Custom", category: "Signage", unit: "m2", basePrice: 1250000, minQty: 1, specs: ["Akrilik susu", "LED indoor/outdoor"], bom: [] },
    { id: "PROD-016", name: "Billboard Besi + Pasang", category: "Signage", unit: "m2", basePrice: 1850000, minQty: 1, specs: ["Rangka hollow", "Termasuk instalasi Surabaya"],
      bom: [
        { material: "Flexi China 340gr", formulaType: "per_m2", formulaValue: 0.111, wasteFactor: 0.08, unit: "roll" },
        { material: "Tinta Cyan Epson", formulaType: "per_m2", formulaValue: 0.006, wasteFactor: 0.10, unit: "liter" },
      ]
    },
    { id: "PROD-017", name: "Backdrop Foto 3x2m", category: "Event", unit: "set", basePrice: 650000, minQty: 1, specs: ["Flexi Korea", "Rangka pipa"],
      bom: [
        { material: "Flexi Korea 440gr", formulaType: "flat", formulaValue: 0.72, wasteFactor: 0.08, unit: "roll" },
        { material: "Mata Ayam Banner", formulaType: "flat", formulaValue: 24, wasteFactor: 0.05, unit: "pcs" },
      ]
    },
  ];

  const statuses = ["draft", "confirmed", "design_queue", "in_design", "production_queue", "printing", "finishing", "ready", "delivered", "closed"];
  const productionStageByStatus = {
    draft: "Draft",
    confirmed: "Antrian Desain",
    design_queue: "Antrian Desain",
    in_design: "Sedang Desain",
    production_queue: "Antrian Cetak",
    printing: "Sedang Cetak",
    finishing: "Finishing",
    ready: "Siap Ambil",
    delivered: "Diantar",
    closed: "Selesai",
  };
  const statusPriority = ["confirmed", "design_queue", "in_design", "production_queue", "printing", "finishing", "ready"];

  function getOrderDerivedStatus(order) {
    if (!order.items || order.items.length === 0) return "confirmed";
    const lowestPriority = Math.min(...order.items.map((item) => {
      const index = statusPriority.indexOf(item.status);
      return index >= 0 ? index : 0;
    }));
    return statusPriority[lowestPriority] || "confirmed";
  }

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

  const multiItemOverrides = {
    0: [
      { productId: "PROD-001", qty: 12, total: 336000, status: "printing", specs: { width: 300, height: 400, finishing: ["Mata Ayam"] }, notes: "Banner grand opening gudang baru" },
      { productId: "PROD-002", qty: 6, total: 270000, status: "production_queue", specs: { width: 200, height: 300, finishing: ["Jahit tepi"] }, notes: "Spanduk kain untuk area resepsionis" },
      { productId: "PROD-005", qty: 500, total: 1250000, status: "ready", specs: { finishing: ["Lipat 1"] }, notes: "Flyer grand opening untuk sales" },
    ],
    1: [
      { productId: "PROD-005", qty: 1500, total: 3750000, status: "finishing", specs: { finishing: ["Lipat 1"] }, notes: "Brosur penerimaan mahasiswa baru" },
      { productId: "PROD-010", qty: 2, total: 570000, status: "ready", specs: { finishing: ["Stand roll banner"] }, notes: "Roll banner booth pameran kampus" },
    ],
    4: [
      { productId: "PROD-017", qty: 1, total: 650000, status: "printing", specs: { width: 300, height: 200, finishing: ["Rangka pipa"] }, notes: "Backdrop sosialisasi UMKM" },
      { productId: "PROD-004", qty: 12, total: 1020000, status: "production_queue", specs: { finishing: ["Laminasi Doff"] }, notes: "Kartu nama panitia event" },
      { productId: "PROD-005", qty: 1000, total: 2500000, status: "ready", specs: { finishing: ["Lipat 1"] }, notes: "Flyer program pendampingan UMKM" },
    ],
    7: [
      { productId: "PROD-015", qty: 2, total: 2500000, status: "finishing", specs: { width: 100, height: 100, finishing: ["Akrilik susu", "LED"] }, notes: "Neon box kantor pemasaran" },
      { productId: "PROD-017", qty: 1, total: 650000, status: "printing", specs: { width: 300, height: 200, finishing: ["Rangka pipa"] }, notes: "Backdrop launching cluster" },
    ],
    24: [
      { productId: "PROD-005", qty: 2500, total: 6250000, status: "printing", specs: { finishing: ["Lipat 1"] }, notes: "Flyer bazar UMKM" },
      { productId: "PROD-001", qty: 10, total: 280000, status: "production_queue", specs: { width: 250, height: 400, finishing: ["Mata Ayam"] }, notes: "Banner arah lokasi bazar" },
    ],
  };

  const materialEstimateForProduct = (product, qty, specs = {}) => {
    if (/Banner|X-Banner/i.test(product.name)) {
      const area = Number(qty) || Math.max(((specs.width || 100) * (specs.height || 100)) / 10000, 1);
      return [
        { material: "Flexi China 340gr", qty: Math.round((area / 9) * 1.08 * 100) / 100, unit: "roll" },
        { material: "Mata Ayam Banner", qty: Math.max(Math.ceil(area * 4), 4), unit: "pcs" },
      ];
    }
    if (/Spanduk Kain/i.test(product.name)) {
      return [{ material: "Spanduk Kain Anti Air", qty: Math.round(((Number(qty) || 1) / 9) * 1.1 * 100) / 100, unit: "roll" }];
    }
    if (/Brosur/i.test(product.name)) {
      return [
        { material: "Art Paper 150gr", qty: Math.round((Number(qty) / 500) * 100) / 100, unit: "rim" },
        { material: "Tinta CMYK Epson", qty: Math.round((Number(qty) / 2500) * 100) / 100, unit: "liter" },
      ];
    }
    if (/Kartu Nama/i.test(product.name)) {
      return [{ material: "Art Carton 260gr", qty: Math.max(Math.round((Number(qty) / 10) * 100) / 100, 0.1), unit: "rim" }];
    }
    if (/Stiker/i.test(product.name)) {
      return [{ material: "Vinyl Outdoor Glossy", qty: Math.round(((Number(qty) || 1) / 8) * 100) / 100, unit: "roll" }];
    }
    if (/Backdrop|Billboard|Neon Box/i.test(product.name)) {
      return [
        { material: "Flexi Korea 440gr", qty: Math.round((Number(qty) || 1) * 0.8 * 100) / 100, unit: "roll" },
        { material: "Rangka Besi/Akrilik", qty: Number(qty) || 1, unit: "set" },
      ];
    }
    return [{ material: "Material produksi standar", qty: Number(qty) || 1, unit: product.unit }];
  };

  const materialActualForItem = (itemStatus, estimates) => {
    if (statuses.indexOf(itemStatus) < statuses.indexOf("printing")) return [];
    return estimates.slice(0, 2).map((estimate, index) => ({
      material: estimate.material,
      qty: Math.round(estimate.qty * (index === 0 ? 1.04 : 1) * 100) / 100,
      unit: estimate.unit,
      batch: index === 0 ? "BATCH-20260515-001" : "BATCH-LEGACY-001",
    }));
  };

  const createOrderItem = (orderSequence, seq, definition, fallbackStatus) => {
    const product = products.find((item) => item.id === definition.productId);
    const qty = Number(definition.qty) || 1;
    const total = Number(definition.total) || qty * product.basePrice;
    const rawStatus = definition.status || fallbackStatus;
    const status = rawStatus === "delivered" || rawStatus === "closed"
      ? "ready"
      : rawStatus === "draft"
        ? "confirmed"
        : rawStatus;
    const materialEstimate = materialEstimateForProduct(product, qty, definition.specs);
    const assignee = ["confirmed", "design_queue", "in_design"].includes(status)
      ? ["Dimas Pratama", "Maya Lestari"][seq % 2]
      : ["Eko Pramono", "Nur Hidayat", "Rizky Maulana"][seq % 3];

    return {
      itemId: `ITEM-${orderSequence}-${String(seq).padStart(2, "0")}`,
      seq,
      product: product.name,
      productId: product.id,
      specs: definition.specs || { finishing: ["Standar"] },
      qty,
      unit: product.unit,
      unitPrice: Math.round(total / qty),
      total,
      needsDesign: ["design_queue", "in_design"].includes(status),
      status,
      assignedTo: definition.assignedTo || assignee,
      notes: definition.notes || "",
      materialEstimate,
      materialActual: materialActualForItem(status, materialEstimate),
    };
  };

  const orders = orderSeeds.map((seed, index) => {
    const [customerId, productId, qty, total, priority, status, deadlineOffset, notes] = seed;
    const customer = customers.find((item) => item.id === customerId);
    const product = products.find((item) => item.id === productId);
    const createdOffset = Math.min(deadlineOffset - 4, -1);
    const sequence = String(index + 1).padStart(4, "0");
    const itemDefinitions = multiItemOverrides[index] || [
      { productId, qty, total, status, specs: { finishing: ["Standar"] }, notes },
    ];
    const items = itemDefinitions.map((definition, itemIndex) => createOrderItem(sequence, itemIndex + 1, definition, status));
    const orderTotal = items.reduce((sum, item) => sum + item.total, 0);
    const derivedStatus = getOrderDerivedStatus({ items });
    const primaryItem = items[0];

    return {
      id: `ORD-${sequence}`,
      spkNumber: `SPK-SBY-${dateStamp(createdOffset)}-${sequence}`,
      customerId,
      customerName: customer.name,
      productId: primaryItem.productId,
      productName: primaryItem.product,
      qty: primaryItem.qty,
      unit: primaryItem.unit,
      total: orderTotal,
      paidAmount: derivedStatus === "draft" ? 0 : Math.round(orderTotal * (status === "closed" || status === "delivered" ? 1 : 0.5)),
      paymentStatus: status === "closed" || status === "delivered" ? "paid" : status === "draft" ? "unpaid" : "partial",
      status: ["delivered", "closed", "draft"].includes(status) ? status : derivedStatus,
      derivedStatus,
      items,
      priority,
      productionStage: productionStageByStatus[["delivered", "closed", "draft"].includes(status) ? status : derivedStatus],
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
        ...(status !== "draft" ? [{ at: addDays(createdOffset, 10, 20), status: "confirmed", user: "Yanuar Firnandy", note: "SPK dikonfirmasi" }] : []),
        ...(statuses.indexOf(status) >= statuses.indexOf("printing") ? [{ at: addDays(Math.min(deadlineOffset, -1), 9, 30), status: "printing", user: "Eko Pramono", note: "Masuk proses cetak" }] : []),
      ],
    };
  });

  customers.forEach((customer, index) => {
    const customerOrders = orders.filter((order) => order.customerId === customer.id);
    const latestOrder = customerOrders
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    const totalSpending = customerOrders.reduce((sum, order) => sum + order.total, 0);
    const outstandingDebt = customerOrders.reduce((sum, order) => (
      ["paid", "cancelled"].includes(order.paymentStatus)
        ? sum
        : sum + Math.max(order.total - (order.paidAmount || 0), 0)
    ), 0);
    const typeMap = {
      individual: "individual",
      institution: "instansi",
      community: "instansi",
      company: "perusahaan",
      business: "perusahaan",
    };

    customer.type = typeMap[customer.type] || "perusahaan";
    customer.totalSpending = totalSpending;
    customer.totalOrders = customerOrders.length;
    customer.outstandingDebt = outstandingDebt;
    customer.lastOrderDate = latestOrder?.createdAt || null;
    customer.createdAt = addDays(-180 + index * 5, 9, 0);
    customer.notes = customerOrders.length
      ? `Pelanggan ${customer.segment}; ${customerOrders.length} order tercatat di prototype.`
      : `Pelanggan ${customer.segment}; belum ada order aktif.`;
  });

  const employees = [
    { id: "EMP-001", name: "Yanuar Firnandy", role: "owner", position: "Owner", contractType: "bulanan", branchId: "BR-SBY-PUSAT", salary: 12000000, phone: "0812-1111-2233" },
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
    { id: "INC-001", itemId: "MAT-001", itemName: "Flexi China 340gr", batchId: "BATCH-20260515-001", qty: 8, unit: "roll", supplier: "UD Sumber Grafika", pricePerUnit: 650000, totalPrice: 5200000, receivedDate: addDays(-8), receivedBy: "Yanuar Firnandy", notes: "Kondisi baik, tidak ada kerusakan" },
    { id: "INC-002", itemId: "MAT-002", itemName: "Flexi Korea 440gr", batchId: "BATCH-20260518-001", qty: 4, unit: "roll", supplier: "PT Media Visual Prima", pricePerUnit: 980000, totalPrice: 3920000, receivedDate: addDays(-5), receivedBy: "Siti Aminah", notes: "" },
    { id: "INC-003", itemId: "MAT-007", itemName: "Tinta Magenta Epson", batchId: "BATCH-20260511-001", qty: 2, unit: "liter", supplier: "Inkindo Surabaya", pricePerUnit: 185000, totalPrice: 370000, receivedDate: addDays(-12), receivedBy: "Yanuar Firnandy", notes: "Order ulang karena stok menipis" },
    { id: "INC-004", itemId: "MAT-003", itemName: "Art Paper 150gr", batchId: "BATCH-20260510-001", qty: 20, unit: "rim", supplier: "Toko Kertas Surabaya", pricePerUnit: 72000, totalPrice: 1440000, receivedDate: addDays(-13), receivedBy: "Siti Aminah", notes: "" },
    { id: "INC-005", itemId: "MAT-011", itemName: "Laminasi Doff 32cm", batchId: "BATCH-20260508-001", qty: 5, unit: "roll", supplier: "UD Sumber Grafika", pricePerUnit: 225000, totalPrice: 1125000, receivedDate: addDays(-15), receivedBy: "Yanuar Firnandy", notes: "Stok laminasi menipis setelah promo bulan lalu" },
    { id: "INC-006", itemId: "MAT-006", itemName: "Tinta Cyan Epson", batchId: "BATCH-20260505-001", qty: 3, unit: "liter", supplier: "Inkindo Surabaya", pricePerUnit: 185000, totalPrice: 555000, receivedDate: addDays(-18), receivedBy: "Siti Aminah", notes: "" },
    { id: "INC-007", itemId: "MAT-004", itemName: "Art Carton 260gr", batchId: "BATCH-20260503-001", qty: 12, unit: "rim", supplier: "Toko Kertas Surabaya", pricePerUnit: 96000, totalPrice: 1152000, receivedDate: addDays(-20), receivedBy: "Yanuar Firnandy", notes: "" },
    { id: "INC-008", itemId: "MAT-014", itemName: "Rangka X-Banner 60x160", batchId: "BATCH-20260501-001", qty: 15, unit: "pcs", supplier: "Toko Alat Reklame", pricePerUnit: 42000, totalPrice: 630000, receivedDate: addDays(-22), receivedBy: "Siti Aminah", notes: "Pembelian rutin bulanan" },
    { id: "INC-009", itemId: "MAT-010", itemName: "Vinyl Outdoor Glossy", batchId: "BATCH-20260428-001", qty: 4, unit: "roll", supplier: "PT Media Visual Prima", pricePerUnit: 740000, totalPrice: 2960000, receivedDate: addDays(-25), receivedBy: "Yanuar Firnandy", notes: "" },
    { id: "INC-010", itemId: "MAT-009", itemName: "Tinta Black Epson", batchId: "BATCH-20260425-001", qty: 4, unit: "liter", supplier: "Inkindo Surabaya", pricePerUnit: 175000, totalPrice: 700000, receivedDate: addDays(-28), receivedBy: "Siti Aminah", notes: "" },
    { id: "INC-011", itemId: "MAT-005", itemName: "Ivory 230gr", batchId: "BATCH-20260420-001", qty: 10, unit: "rim", supplier: "CV Kertas Jaya", pricePerUnit: 105000, totalPrice: 1050000, receivedDate: addDays(-33), receivedBy: "Yanuar Firnandy", notes: "Untuk produksi undangan musim nikah" },
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

  const batches = [
    { batchId: "BATCH-20260515-001", itemId: "MAT-001", itemName: "Flexi China 340gr", qtyInitial: 8, qtyRemaining: 3.2, unit: "roll", supplier: "UD Sumber Grafika", receivedDate: addDays(-8), pricePerUnit: 650000, status: "aktif", specs: { type: "roll", panjangRoll: 50, lebarRoll: 1.52, ketebalan: "340gr", luasPerUnit: 76, kebutuhanPerM2: 0.0132 } },
    { batchId: "BATCH-20260502-002", itemId: "MAT-001", itemName: "Flexi China 340gr", qtyInitial: 6, qtyRemaining: 1.1, unit: "roll", supplier: "UD Sumber Grafika", receivedDate: addDays(-21), pricePerUnit: 640000, status: "aktif", specs: { type: "roll", panjangRoll: 50, lebarRoll: 1.52, ketebalan: "340gr", luasPerUnit: 76, kebutuhanPerM2: 0.0132 } },
    { batchId: "BATCH-20260418-003", itemId: "MAT-001", itemName: "Flexi China 340gr", qtyInitial: 10, qtyRemaining: 0, unit: "roll", supplier: "UD Sumber Grafika", receivedDate: addDays(-35), pricePerUnit: 635000, status: "habis", specs: { type: "roll", panjangRoll: 50, lebarRoll: 1.52, ketebalan: "340gr", luasPerUnit: 76, kebutuhanPerM2: 0.0132 } },
    { batchId: "BATCH-20260510-001", itemId: "MAT-003", itemName: "Art Paper 150gr", qtyInitial: 20, qtyRemaining: 12.5, unit: "rim", supplier: "Toko Kertas Surabaya", receivedDate: addDays(-13), pricePerUnit: 72000, status: "aktif", specs: { type: "paper", isiPerRim: 500, ukuranKertas: "A4", customWidthCm: 21, customHeightCm: 29.7, kebutuhanPerLembar: 0.002 } },
    { batchId: "BATCH-20260429-002", itemId: "MAT-003", itemName: "Art Paper 150gr", qtyInitial: 25, qtyRemaining: 8.7, unit: "rim", supplier: "Toko Kertas Surabaya", receivedDate: addDays(-24), pricePerUnit: 71000, status: "aktif" },
    { batchId: "BATCH-20260412-003", itemId: "MAT-003", itemName: "Art Paper 150gr", qtyInitial: 30, qtyRemaining: 0, unit: "rim", supplier: "Toko Kertas Surabaya", receivedDate: addDays(-41), pricePerUnit: 70500, status: "habis" },
    { batchId: "BATCH-20260511-001", itemId: "MAT-007", itemName: "Tinta Magenta Epson", qtyInitial: 2, qtyRemaining: 0.5, unit: "liter", supplier: "Inkindo Surabaya", receivedDate: addDays(-12), pricePerUnit: 185000, status: "aktif", specs: { type: "ink", volumePerKemasan: 1, volumeUnit: "liter", jenisTinta: "Dye Ink Epson" } },
    { batchId: "BATCH-20260427-002", itemId: "MAT-007", itemName: "Tinta Magenta Epson", qtyInitial: 2, qtyRemaining: 0, unit: "liter", supplier: "Inkindo Surabaya", receivedDate: addDays(-26), pricePerUnit: 182000, status: "habis" },
    { batchId: "BATCH-20260408-003", itemId: "MAT-007", itemName: "Tinta Magenta Epson", qtyInitial: 3, qtyRemaining: 0, unit: "liter", supplier: "Inkindo Surabaya", receivedDate: addDays(-45), pricePerUnit: 180000, status: "habis" },
    { batchId: "BATCH-20260505-001", itemId: "MAT-006", itemName: "Tinta Cyan Epson", qtyInitial: 3, qtyRemaining: 2.5, unit: "liter", supplier: "Inkindo Surabaya", receivedDate: addDays(-18), pricePerUnit: 185000, status: "aktif", specs: { type: "ink", volumePerKemasan: 1, volumeUnit: "liter", jenisTinta: "Dye Ink Epson" } },
    { batchId: "BATCH-20260425-001", itemId: "MAT-009", itemName: "Tinta Black Epson", qtyInitial: 4, qtyRemaining: 2.1, unit: "liter", supplier: "Inkindo Surabaya", receivedDate: addDays(-28), pricePerUnit: 175000, status: "aktif", specs: { type: "ink", volumePerKemasan: 1, volumeUnit: "liter", jenisTinta: "Dye Ink Epson" } },
    { batchId: "BATCH-20260410-002", itemId: "MAT-009", itemName: "Tinta Black Epson", qtyInitial: 3, qtyRemaining: 0.4, unit: "liter", supplier: "Inkindo Surabaya", receivedDate: addDays(-43), pricePerUnit: 172000, status: "aktif" },
    { batchId: "BATCH-20260328-003", itemId: "MAT-009", itemName: "Tinta Black Epson", qtyInitial: 5, qtyRemaining: 0, unit: "liter", supplier: "Inkindo Surabaya", receivedDate: addDays(-56), pricePerUnit: 170000, status: "habis" },
    { batchId: "BATCH-20260508-001", itemId: "MAT-011", itemName: "Laminasi Doff 32cm", qtyInitial: 5, qtyRemaining: 2, unit: "roll", supplier: "UD Sumber Grafika", receivedDate: addDays(-15), pricePerUnit: 225000, status: "aktif", specs: { type: "roll", panjangRoll: 100, lebarRoll: 0.32, ketebalan: "Doff 32cm", luasPerUnit: 32, kebutuhanPerM2: 0.0313 } },
    { batchId: "BATCH-20260422-002", itemId: "MAT-011", itemName: "Laminasi Doff 32cm", qtyInitial: 4, qtyRemaining: 0, unit: "roll", supplier: "UD Sumber Grafika", receivedDate: addDays(-31), pricePerUnit: 220000, status: "habis" },
    { batchId: "BATCH-20260405-003", itemId: "MAT-011", itemName: "Laminasi Doff 32cm", qtyInitial: 6, qtyRemaining: 0, unit: "roll", supplier: "UD Sumber Grafika", receivedDate: addDays(-48), pricePerUnit: 218000, status: "habis" },
    { batchId: "BATCH-20260501-001", itemId: "MAT-014", itemName: "Rangka X-Banner 60x160", qtyInitial: 15, qtyRemaining: 9, unit: "pcs", supplier: "Toko Alat Reklame", receivedDate: addDays(-22), pricePerUnit: 42000, status: "aktif", specs: { type: "pack", isiPerPack: 1 } },
    { batchId: "BATCH-20260428-001", itemId: "MAT-010", itemName: "Vinyl Outdoor Glossy", qtyInitial: 4, qtyRemaining: 2.5, unit: "roll", supplier: "PT Media Visual Prima", receivedDate: addDays(-25), pricePerUnit: 740000, status: "aktif", specs: { type: "roll", panjangRoll: 50, lebarRoll: 1.27, ketebalan: "Glossy outdoor", luasPerUnit: 63.5, kebutuhanPerM2: 0.0157 } },
  ];

  [...new Set(usageLog.map((entry) => entry.itemId))].forEach((itemId, index) => {
    if (batches.some((batch) => batch.itemId === itemId)) return;
    const item = inventory.find((inv) => inv.id === itemId);
    const usedQty = usageLog
      .filter((entry) => entry.itemId === itemId)
      .reduce((sum, entry) => sum + entry.qtyUsed + (entry.qtyWaste || 0), 0);
    if (!item) return;
    batches.push({
      batchId: `BATCH-LEGACY-${String(index + 1).padStart(3, "0")}`,
      itemId,
      itemName: item.name,
      qtyInitial: Math.round((usedQty + item.stock) * 1000) / 1000,
      qtyRemaining: item.stock,
      unit: item.unit,
      supplier: item.supplier,
      receivedDate: addDays(-34 - index),
      pricePerUnit: item.avgCost,
      status: item.stock > 0 ? "aktif" : "habis",
    });
  });

  const batchIdsByItem = batches.reduce((acc, batch) => {
    if (!acc[batch.itemId]) acc[batch.itemId] = [];
    acc[batch.itemId].push(batch.batchId);
    return acc;
  }, {});
  usageLog.forEach((entry, index) => {
    const options = batchIdsByItem[entry.itemId];
    if (options?.length) entry.batchId = options[index % options.length];
  });

  const opnameSessions = [
    {
      id: "OPN-001",
      name: "Opname Awal Mei 2026",
      date: addDays(-22),
      createdBy: "Yanuar Firnandy",
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
      createdBy: "Yanuar Firnandy",
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
    { id: "ADJ-001", opnameId: "OPN-001", itemId: "MAT-002", itemName: "Flexi Korea 440gr", oldStock: 5, newStock: 4, diff: -1, unit: "roll", adjustedAt: addDays(-22), adjustedBy: "Yanuar Firnandy" },
    { id: "ADJ-002", opnameId: "OPN-002", itemId: "MAT-007", itemName: "Tinta Magenta Epson", oldStock: 0.75, newStock: 0.5, diff: -0.25, unit: "liter", adjustedAt: addDays(-10), adjustedBy: "Yanuar Firnandy" },
  ];

  const purchaseOrders = [
    {
      id: "PO-20260523-001",
      supplier: "Inkindo Surabaya",
      status: "sent",
      createdAt: addDays(0, 9, 15),
      expectedAt: addDays(2, 15, 0),
      notes: "Prioritas untuk stok tinta magenta yang menipis.",
      createdBy: "Yanuar Firnandy",
      sentAt: addDays(0, 9, 40),
      receivedAt: null,
      items: [
        { itemId: "MAT-007", itemName: "Tinta Magenta Epson", qty: 5, receivedQty: 0, unit: "liter", pricePerUnit: 185000 },
        { itemId: "MAT-006", itemName: "Tinta Cyan Epson", qty: 3, receivedQty: 0, unit: "liter", pricePerUnit: 185000 },
      ],
    },
    {
      id: "PO-20260522-002",
      supplier: "UD Sumber Grafika",
      status: "partial",
      createdAt: addDays(-1, 11, 0),
      expectedAt: addDays(1, 14, 0),
      notes: "Sebagian laminasi doff sudah diterima, sisa menyusul.",
      createdBy: "Siti Aminah",
      sentAt: addDays(-1, 11, 25),
      receivedAt: null,
      items: [
        { itemId: "MAT-011", itemName: "Laminasi Doff 32cm", qty: 6, receivedQty: 2, unit: "roll", pricePerUnit: 225000 },
        { itemId: "MAT-001", itemName: "Flexi China 340gr", qty: 5, receivedQty: 0, unit: "roll", pricePerUnit: 650000 },
      ],
    },
    {
      id: "PO-20260519-003",
      supplier: "Toko Alat Reklame",
      status: "received",
      createdAt: addDays(-4, 10, 30),
      expectedAt: addDays(-2, 15, 0),
      notes: "Stok display untuk kebutuhan roll banner kampus.",
      createdBy: "Yanuar Firnandy",
      sentAt: addDays(-4, 11, 0),
      receivedAt: addDays(-2, 14, 10),
      items: [
        { itemId: "MAT-015", itemName: "Stand Roll Banner 85x200", qty: 8, receivedQty: 8, unit: "pcs", pricePerUnit: 175000 },
        { itemId: "MAT-014", itemName: "Rangka X-Banner 60x160", qty: 12, receivedQty: 12, unit: "pcs", pricePerUnit: 42000 },
      ],
    },
    {
      id: "PO-20260518-004",
      supplier: "Toko Kertas Surabaya",
      status: "draft",
      createdAt: addDays(-5, 13, 20),
      expectedAt: addDays(3, 15, 0),
      notes: "Draft pembelian kertas untuk promo brosur akhir bulan.",
      createdBy: "Siti Aminah",
      sentAt: null,
      receivedAt: null,
      items: [
        { itemId: "MAT-003", itemName: "Art Paper 150gr", qty: 20, receivedQty: 0, unit: "rim", pricePerUnit: 72000 },
        { itemId: "MAT-004", itemName: "Art Carton 260gr", qty: 10, receivedQty: 0, unit: "rim", pricePerUnit: 96000 },
      ],
    },
    {
      id: "PO-20260516-005",
      supplier: "PT Media Visual Prima",
      status: "cancelled",
      createdAt: addDays(-7, 10, 0),
      expectedAt: addDays(-3, 15, 0),
      notes: "Dibatalkan karena supplier tidak bisa kirim Flexi Korea minggu ini.",
      createdBy: "Yanuar Firnandy",
      sentAt: addDays(-7, 10, 20),
      receivedAt: null,
      items: [
        { itemId: "MAT-002", itemName: "Flexi Korea 440gr", qty: 6, receivedQty: 0, unit: "roll", pricePerUnit: 980000 },
      ],
    },
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
      production_queue: orders.filter((order) => order.status === "production_queue").length,
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

  const deliveries = [
    {
      id: "DEL-001",
      orderId: "ORD-0006",
      customer: "Kopi Tepi Kali",
      address: "Jl. Ketintang Baru No. 22, Surabaya",
      phone: "0821-4420-8811",
      productSummary: "Mug Cetak Full Wrap (3 pcs)",
      courierName: "Budi Kurir",
      courierPhone: "0812-9000-1111",
      branchId: "BR-SBY-PUSAT",
      status: "assigned",
      assignedAt: addDays(0, 8, 0),
      pickedUpAt: null,
      deliveredAt: null,
      notes: null,
    },
    {
      id: "DEL-002",
      orderId: "ORD-0014",
      customer: "Depot Rawon Bu Sari",
      address: "Jl. Embong Malang No. 7, Surabaya",
      phone: "0813-5700-4401",
      productSummary: "Banner Flexi China 340gr (9 m²)",
      courierName: "Budi Kurir",
      courierPhone: "0812-9000-1111",
      branchId: "BR-SBY-PUSAT",
      status: "sedang_diantar",
      assignedAt: addDays(0, 8, 0),
      pickedUpAt: addDays(0, 9, 15),
      deliveredAt: null,
      notes: "Customer minta diantar ke pintu belakang restoran",
    },
    {
      id: "DEL-003",
      orderId: "ORD-0011",
      customer: "Bengkel Jaya Motor",
      address: "Jl. Raya Menur No. 45, Surabaya",
      phone: "0856-4655-2121",
      productSummary: "Banner Flexi China 340gr (6 m²)",
      courierName: "Budi Kurir",
      courierPhone: "0812-9000-1111",
      branchId: "BR-SBY-PUSAT",
      status: "terkirim",
      assignedAt: addDays(0, 7, 30),
      pickedUpAt: addDays(0, 8, 0),
      deliveredAt: addDays(0, 10, 30),
      notes: null,
    },
  ];

  // ── PORTAL KARYAWAN DATA ──
  const incentives = {
    "Eko Pramono": [
      { id: "INC-EP-001", date: addDays(-0), spk: "SPK-SBY-20260525-0001", item: "Banner Flexi China 3×4m", amount: 8500, status: "pending" },
      { id: "INC-EP-002", date: addDays(-1), spk: "SPK-SBY-20260524-0003", item: "Spanduk Kain Anti Air 6m²", amount: 5000, status: "pending" },
      { id: "INC-EP-003", date: addDays(-1), spk: "SPK-SBY-20260524-0003", item: "X-Banner 60×160cm (2 pcs)", amount: 4000, status: "pending" },
      { id: "INC-EP-004", date: addDays(-3), spk: "SPK-SBY-20260522-0007", item: "Roll Banner 85×200cm", amount: 6500, status: "pending" },
      { id: "INC-EP-005", date: addDays(-5), spk: "SPK-SBY-20260520-0011", item: "Backdrop Foto 3×2m", amount: 9000, status: "pending" },
      { id: "INC-EP-006", date: addDays(-8), spk: "SPK-SBY-20260517-0015", item: "Banner Flexi China 5×2m", amount: 7500, status: "paid", paidAt: addDays(-2) },
      { id: "INC-EP-007", date: addDays(-10), spk: "SPK-SBY-20260515-0009", item: "Spanduk Kain Anti Air 4m²", amount: 3500, status: "paid", paidAt: addDays(-2) },
      { id: "INC-EP-008", date: addDays(-12), spk: "SPK-SBY-20260513-0002", item: "Billboard Besi + Pasang", amount: 15000, status: "paid", paidAt: addDays(-2) },
    ],
    "Rizky Maulana": [
      { id: "INC-RM-001", date: addDays(-0), spk: "SPK-SBY-20260525-0002", item: "Laminasi Brosur A4 (500 pcs)", amount: 3000, status: "pending" },
      { id: "INC-RM-002", date: addDays(-2), spk: "SPK-SBY-20260523-0004", item: "Cutting Stiker Vinyl (200 pcs)", amount: 4500, status: "pending" },
      { id: "INC-RM-003", date: addDays(-4), spk: "SPK-SBY-20260521-0006", item: "Lipat + Laminasi Kalender", amount: 5500, status: "paid", paidAt: addDays(-1) },
    ],
    "Siti Aminah": [
      { id: "INC-SA-001", date: addDays(-0), spk: "SPK-SBY-20260525-0004", item: "Transaksi kasir — 8 order", amount: 12000, status: "pending" },
      { id: "INC-SA-002", date: addDays(-1), spk: null, item: "Komisi pelunasan piutang — PT Maju Jaya", amount: 25000, status: "pending" },
      { id: "INC-SA-003", date: addDays(-7), spk: null, item: "Transaksi kasir — 12 order", amount: 18000, status: "paid", paidAt: addDays(-3) },
    ],
    "Budi Kurir": [
      { id: "INC-BK-001", date: addDays(-0), spk: "SPK-SBY-20260525-0001", item: "Pengiriman — Kopi Tepi Kali", amount: 15000, status: "pending" },
      { id: "INC-BK-002", date: addDays(-1), spk: "SPK-SBY-20260524-0005", item: "Pengiriman — Depot Rawon Bu Sari", amount: 20000, status: "pending" },
      { id: "INC-BK-003", date: addDays(-3), spk: "SPK-SBY-20260522-0003", item: "Pengiriman — Bengkel Jaya Motor", amount: 15000, status: "paid", paidAt: addDays(-1) },
    ],
  };

  const incentiveConfig = {
    active: true,
    roles: [
      { role: "designer", label: "Desainer",  eligible: true,  calcType: "flat_per_item", value: 5000,  since: "01 Mei 2026" },
      { role: "operator", label: "Operator",  eligible: true,  calcType: "pct_of_item",  value: 1.5,   since: "01 Mei 2026" },
      { role: "finishing",label: "Finishing", eligible: true,  calcType: "flat_per_item", value: 3000,  since: "01 Mei 2026" },
      { role: "courier",  label: "Kurir",     eligible: false, calcType: "flat_per_spk",  value: 10000, since: null },
      { role: "warehouse",label: "Gudang",    eligible: false, calcType: "flat_per_item", value: 2000,  since: null },
    ],
  };

  const incentiveHistory = [
    { id: "INC-H-001", employeeName: "Eko Pramono",   role: "Operator", spk: "SPK-SBY-20260525-0001", item: "SPK-001 · Item 1 — Banner Flexi", amount: 8500,  status: "pending" },
    { id: "INC-H-002", employeeName: "Maya Lestari",  role: "Desainer", spk: "SPK-SBY-20260525-0001", item: "SPK-001 · Item 2 — Kartu Nama",   amount: 5000,  status: "pending" },
    { id: "INC-H-003", employeeName: "Rizky Maulana", role: "Operator", spk: "SPK-SBY-20260523-0003", item: "SPK-003 · Item 1 — Spanduk Kain",  amount: 6500,  status: "pending" },
    { id: "INC-H-004", employeeName: "Eko Pramono",   role: "Operator", spk: "SPK-SBY-20260523-0003", item: "SPK-003 · Item 2 — Backdrop 3×2m", amount: 9000,  status: "pending" },
    { id: "INC-H-005", employeeName: "Maya Lestari",  role: "Desainer", spk: "SPK-SBY-20260522-0007", item: "SPK-007 · Item 1 — Brosur A4",     amount: 5000,  status: "pending" },
    { id: "INC-H-006", employeeName: "Rizky Maulana", role: "Finishing",spk: "SPK-SBY-20260521-0006", item: "SPK-006 · Laminasi Kalender",       amount: 3000,  status: "paid"    },
    { id: "INC-H-007", employeeName: "Eko Pramono",   role: "Operator", spk: "SPK-SBY-20260520-0011", item: "SPK-011 · Item 1 — Mug Cetak",     amount: 6500,  status: "paid"    },
  ];

  const portalAnnouncements = [
    { id: "ANN-001", title: "Libur Waisak 12 Mei 2026", body: "Operasional tutup pada Senin 12 Mei 2026. Pesanan yang sudah masuk akan diproses mulai 13 Mei.", date: addDays(-13), type: "info" },
    { id: "ANN-002", title: "Perubahan jadwal lembur Juni", body: "Mulai Juni 2026, lembur hari Sabtu dibatasi maksimal 4 jam. Kompensasi lembur tetap Rp 35.000/jam.", date: addDays(-5), type: "info" },
    { id: "ANN-003", title: "Target produksi bulan Mei", body: "Alhamdulillah, bulan April kita melampaui target 15%. Bulan Mei target dinaikkan menjadi 420 item. Semangat!", date: addDays(-2), type: "positive" },
  ];

  const portalWarnings = {
    "Eko Pramono": [
      { id: "WRN-EP-001", date: addDays(-45), title: "Keterlambatan Finishing", body: "SPK-SBY-20260410-0022: Finishing melebihi estimasi 3 jam. Harap lebih memperhatikan estimasi waktu per item.", issuedBy: "Yanuar Firnandy", status: "acknowledged" },
    ],
    "Siti Aminah": [],
    "Rizky Maulana": [],
    "Budi Kurir": [],
  };

  const portalAttendance = {
    "Eko Pramono": { hadir: 18, absen: 2, terlambat: 1, bulan: "Mei 2026" },
    "Siti Aminah": { hadir: 19, absen: 1, terlambat: 0, bulan: "Mei 2026" },
    "Rizky Maulana": { hadir: 17, absen: 3, terlambat: 2, bulan: "Mei 2026" },
    "Budi Kurir": { hadir: 16, absen: 4, terlambat: 1, bulan: "Mei 2026" },
    "Yanuar Firnandy": { hadir: 20, absen: 0, terlambat: 0, bulan: "Mei 2026" },
  };

  const APP_DATA = {
    tenant: {
      id: "tenant-printeoo-demo",
      name: "Titanium Print Surabaya",
      city: "Surabaya",
    },
    settings: {
      business: {
        name: "Titanium Print Surabaya",
        phone: "031-501-7788",
        city: "Surabaya",
        address: "Jl. Basuki Rahmat No. 88, Surabaya",
        logoText: "TP",
        invoiceFooter: "Terima kasih atas kepercayaan Anda.",
        paymentTerms: "Pembayaran DP minimal 50% sebelum produksi dimulai.",
        npwp: "01.234.567.8-601.000",
      },
    },
    customers,
    products,
    orders,
    employees,
    inventory,
    materialBatches,
    batches,
    scanLogs,
    incomingLog,
    usageLog,
    opnameSessions,
    adjustmentLog,
    purchaseOrders,
    deliveries,
    incentiveConfig,
    incentiveHistory,
    incentives,
    portalAnnouncements,
    portalWarnings,
    portalAttendance,
    dashboard,
    branches,
    queueNumbers,
    statusLabels: {
      draft: "Draft",
      confirmed: "Terkonfirmasi",
      design_queue: "Antrian Desain",
      in_design: "Sedang Desain",
      production_queue: "Antrian Cetak",
      printing: "Sedang Cetak",
      finishing: "Finishing",
      ready: "Siap Ambil",
      delivered: "Terkirim",
      closed: "Selesai",
      note: "Catatan",
      payment: "Pembayaran",
      cancelled: "Dibatalkan",
    },
    priorityLabels: {
      normal: "Normal",
      urgent: "Urgent",
      VIP: "VIP",
    },
  };

  window.APP_DATA = APP_DATA;
  window.getOrderDerivedStatus = getOrderDerivedStatus;
})();
