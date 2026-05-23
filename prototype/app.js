// App state
const ROLE_USERS = {
  owner: { name: "Ahmad Fauzi", role: "owner", label: "Owner" },
  cashier: { name: "Siti Aminah", role: "cashier", label: "Kasir" },
  operator: { name: "Eko Pramono", role: "operator", label: "Operator" },
  display: { name: "Display Produksi", role: "display", label: "Display" },
};

const APP_STATE = {
  currentRole: localStorage.getItem("printeoo:role") || "owner",
  currentBranch: localStorage.getItem("printeoo:branch") || "Surabaya Pusat",
  currentUser: ROLE_USERS[localStorage.getItem("printeoo:role")] || ROLE_USERS.owner,
  isLoggedIn: localStorage.getItem("printeoo:isLoggedIn") !== "false",
  currentRoute: "",
  routeParams: {},
  orderFilters: {
    search: "",
    status: "all",
    date: "all",
    overdue: false,
  },
  productionFilter: "all",
  selectedProductionSpk: null,
  productionDisplayTimer: null,
  productionDisplayNotificationTimer: null,
  queueDisplayTimer: null,
  queueDisplayClockTimer: null,
  lastQueueSignature: "",
  audioEnabled: false,
  audioMuted: false,
  selectedProduct: null,
  selectedCustomer: null,
  currentOpnameSession: null,
  usagePeriod: "month",
  wastePeriod: "month",
};

window.APP_STATE = APP_STATE;

loadStoredOrders();
loadStoredInventory();

const ROUTES = {
  login: { page: "login", title: "Login", fullScreen: true },
  dashboard: { page: "dashboard", title: "Dashboard" },
  orders: { page: "orders", title: "Pesanan" },
  "order-new": { page: "order-new", title: "Pesanan Baru" },
  order: { page: "order-detail", title: "Detail SPK" },
  production: { page: "production", title: "Produksi" },
  "display-production": { page: "display-production", title: "Display Produksi", fullScreen: true },
  queue: { page: "queue", title: "Antrian" },
  "display-queue": { page: "display-queue", title: "Display Antrian", fullScreen: true },
  inventory: { page: "inventory", title: "Inventaris" },
  hr: { page: "hr", title: "Karyawan" },
  finance: { page: "finance", title: "Keuangan" },
  pricing: { page: "pricing", title: "Pricing", fullScreen: true },
  settings: { page: "pricing", title: "Pengaturan" },
};

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", hash: "#/dashboard", roles: ["owner"], icon: "dashboard" },
  { id: "orders", label: "Pesanan", hash: "#/orders", roles: ["owner", "cashier"], icon: "orders", badge: "overdue" },
  { id: "order-new", label: "+ Pesanan Baru", hash: "#/order-new", roles: ["owner", "cashier"], icon: "plus" },
  { id: "production", label: "Produksi", hash: "#/production", roles: ["owner", "operator"], icon: "production" },
  { id: "queue", label: "Antrian", hash: "#/queue", roles: ["owner", "cashier"], icon: "queue" },
  { id: "inventory", label: "Inventaris", hash: "#/inventory", roles: ["owner"], icon: "inventory" },
  { id: "hr", label: "Karyawan", hash: "#/hr", roles: ["owner"], icon: "users" },
  { id: "finance", label: "Keuangan", hash: "#/finance", roles: ["owner"], icon: "finance" },
  { id: "settings", label: "Pengaturan", hash: "#/settings", roles: ["owner"], icon: "settings" },
];

const ROLE_DEFAULT_ROUTES = {
  owner: "#/dashboard",
  cashier: "#/orders",
  operator: "#/production",
  display: "#/display-production",
};


const NO_SIDEBAR_ROUTES = ["display-production", "display-queue", "login", "pricing"];

// Routing
function parseHash() {
  const rawHash = window.location.hash.replace(/^#\/?/, "");
  const segments = rawHash.split("/").filter(Boolean);
  const route = segments[0] || "";

  if (route === "order" && segments[1]) {
    return { route: "order", params: { spkNumber: decodeURIComponent(segments[1]) } };
  }

  return { route, params: {} };
}

function normalizeRoute(route) {
  if (!route) {
    return APP_STATE.isLoggedIn ? ROLE_DEFAULT_ROUTES[APP_STATE.currentRole] : "#/login";
  }

  if (!ROUTES[route]) {
    return ROLE_DEFAULT_ROUTES[APP_STATE.currentRole] || "#/dashboard";
  }

  if (!APP_STATE.isLoggedIn && route !== "login") {
    return "#/login";
  }

  return null;
}

async function handleRoute() {
  const { route, params } = parseHash();
  const redirect = normalizeRoute(route);

  if (redirect) {
    window.location.hash = redirect;
    return;
  }

  const config = ROUTES[route];
  APP_STATE.currentRoute = route;
  APP_STATE.routeParams = params;

  if (!canAccessRoute(route, APP_STATE.currentRole)) {
    window.location.hash = ROLE_DEFAULT_ROUTES[APP_STATE.currentRole] || "#/dashboard";
    showToast("Menu tidak tersedia untuk role ini.", "warning");
    return;
  }

  updateShellVisibility(config.fullScreen);
  applySidebarState();
  updateBreadcrumb(config.title, params);
  updateSidebar(APP_STATE.currentRole);
  syncRoleSwitcher();

  await loadPage(config.page);
  initPage(route, params);
  window.dispatchEvent(new CustomEvent("printeoo:routechange", { detail: { route, params } }));
}

async function loadPage(pageName) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = '<div class="card"><p class="text-muted">Memuat halaman...</p></div>';

  try {
    const response = await fetch(`pages/${pageName}.html`, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Halaman ${pageName} tidak ditemukan`);
    }

    const html = await response.text();
    app.innerHTML = html.trim() || getEmptyPage(pageName);
  } catch (error) {
    app.innerHTML = getEmptyPage(pageName);
    console.warn(error);
  }

  app.focus({ preventScroll: true });
}

function getEmptyPage(pageName) {
  const route = Object.values(ROUTES).find((item) => item.page === pageName);
  const title = route ? route.title : "Halaman";

  return `
    <section class="card empty-state">
      <h1 class="page-title">${title}</h1>
      <p>Konten halaman ini akan diisi pada task berikutnya.</p>
    </section>
  `;
}

function updateShellVisibility(isFullScreen) {
  const shell = document.getElementById("app-shell");
  const sidebar = document.getElementById("sidebar");
  const header = document.getElementById("header");
  const app = document.getElementById("app");

  if (isFullScreen) {
    shell.classList.remove("app-shell");
    shell.classList.add("block");
    sidebar.classList.add("hidden");
    header.classList.add("hidden");
    app.classList.remove("page");
  } else {
    shell.classList.add("app-shell");
    shell.classList.remove("block");
    sidebar.classList.remove("hidden");
    header.classList.remove("hidden");
    app.classList.add("page");
  }
}

const SIDEBAR_STATE_KEY = "printeoo_sidebar_state";

function getSidebarState() {
  return localStorage.getItem(SIDEBAR_STATE_KEY) || "open";
}

function setSidebarState(state) {
  localStorage.setItem(SIDEBAR_STATE_KEY, state);
  applySidebarState();
}

function routeHidesSidebar() {
  return NO_SIDEBAR_ROUTES.includes(APP_STATE.currentRoute);
}

function applySidebarState() {
  const shell = document.getElementById("app-shell");
  const sidebar = document.getElementById("sidebar");
  const floatingToggle = document.getElementById("sidebar-toggle-floating");
  const inlineToggle = document.getElementById("sidebar-toggle");
  if (!shell || !sidebar || !floatingToggle || !inlineToggle) return;

  const hiddenForRoute = routeHidesSidebar();
  const state = hiddenForRoute ? "closed" : getSidebarState();
  const isOpen = state !== "closed";

  sidebar.classList.toggle("sidebar--open", isOpen && !hiddenForRoute);
  sidebar.classList.toggle("sidebar--closed", !isOpen || hiddenForRoute);
  shell.classList.toggle("app-shell--sidebar-closed", !isOpen || hiddenForRoute);
  shell.classList.toggle("app-shell--no-sidebar", hiddenForRoute);
  floatingToggle.classList.toggle("hidden", hiddenForRoute || isOpen);
  inlineToggle.textContent = isOpen ? "←" : "☰";
  inlineToggle.setAttribute("aria-label", isOpen ? "Tutup sidebar" : "Buka sidebar");
}

function updateBreadcrumb(title, params = {}) {
  const breadcrumb = document.getElementById("breadcrumb");
  const suffix = params.spkNumber ? ` / ${params.spkNumber}` : "";
  breadcrumb.textContent = `${title}${suffix}`;
  document.title = `${title} - Printeoo`;
}

function updateSidebar(role) {
  const nav = document.getElementById("sidebar-nav");
  const footer = document.getElementById("sidebar-footer");
  const visibleItems = MENU_ITEMS.filter((item) => item.roles.includes(role));
  const overdueCount = getOverdueOrders().length;

  nav.innerHTML = visibleItems.map((item) => {
    const isActive = getActiveMenuId() === item.id;
    const badge = item.badge === "overdue" && overdueCount > 0
      ? `<span class="nav-badge">${overdueCount}</span>`
      : "";

    return `
      <a class="nav-item${isActive ? " active" : ""}" href="${item.hash}" ${isActive ? 'aria-current="page"' : ""}>
        ${getIcon(item.icon)}
        <span>${item.label}</span>
        ${badge}
      </a>
    `;
  }).join("");

  footer.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="brand-mark brand-mark-sm" aria-hidden="true">${APP_STATE.currentUser.name.charAt(0)}</div>
      <div class="flex-1">
        <div class="font-semibold">${APP_STATE.currentUser.name}</div>
        <div class="text-xs text-muted">${APP_STATE.currentUser.label} · ${APP_STATE.currentBranch}</div>
      </div>
    </div>
    <button class="btn-secondary btn-sm w-full mt-4" type="button" data-action="logout">Keluar</button>
  `;
}

function getActiveMenuId() {
  if (APP_STATE.currentRoute === "order") return "orders";
  if (APP_STATE.currentRoute === "settings") return "settings";
  return APP_STATE.currentRoute;
}

function canAccessRoute(route, role) {
  if (route === "login" || route === "pricing") return true;
  if (role === "display") return route === "display-production" || route === "display-queue";
  if (route === "order") return role === "owner" || role === "cashier";
  if (route === "settings") return role === "owner";

  const menuItem = MENU_ITEMS.find((item) => item.id === route);
  return menuItem ? menuItem.roles.includes(role) : true;
}

function getOverdueOrders() {
  const today = new Date();
  return (window.APP_DATA?.orders || []).filter((order) => {
    const isDone = ["ready", "delivered", "closed"].includes(order.status);
    return new Date(order.deadlineAt) < today && !isDone;
  });
}

function initPage(route) {
  if (route === "dashboard") {
    renderDashboard();
  }

  if (route === "orders") {
    renderOrdersPage();
  }

  if (route === "order-new") {
    initOrderNewPage();
  }

  if (route === "order") {
    renderOrderDetailPage();
  }

  if (route === "production") {
    renderProductionBoard();
  }

  if (route === "display-production") {
    initProductionDisplay();
  }

  if (route === "queue") {
    initQueuePage();
  }

  if (route === "display-queue") {
    initQueueDisplay();
  }

  if (route === "inventory") {
    renderInventoryPage();
  }

  if (route === "hr") {
    renderHrPreview("employees");
  }

  if (route === "finance") {
    renderFinancePreview();
  }
}

function renderDashboard() {
  const dashboard = window.APP_DATA?.dashboard;
  if (!dashboard) return;

  const greetingEl = document.getElementById("dashboard-greeting");
  const metricsEl = document.getElementById("dashboard-metrics");
  const alertEl = document.getElementById("dashboard-alert");
  const chartEl = document.getElementById("revenue-chart");
  const topProductsEl = document.getElementById("top-products");
  const productionEl = document.getElementById("production-summary");

  if (!greetingEl || !metricsEl || !alertEl || !chartEl || !topProductsEl || !productionEl) return;

  const liveMetrics = getDashboardMetrics();
  const lowStockCount = (window.APP_DATA?.inventory || []).filter((item) => item.stock <= item.minStock).length;
  const revenueTrend = dashboard.revenueYesterday
    ? ((dashboard.revenueToday - dashboard.revenueYesterday) / dashboard.revenueYesterday) * 100
    : 0;
  const completionRate = liveMetrics.ordersToday
    ? Math.round((liveMetrics.completedToday / liveMetrics.ordersToday) * 100)
    : 0;

  greetingEl.textContent = `${getGreeting()}, ${APP_STATE.currentUser.name} ☀️`;

  alertEl.innerHTML = [
    liveMetrics.overdueOrders > 0
    ? `
      <a class="dashboard-alert" href="#/orders" data-dashboard-filter="overdue">
        <strong>${liveMetrics.overdueOrders} pesanan melewati deadline.</strong>
        <span>Lihat →</span>
      </a>
    `
    : "",
    lowStockCount > 0
    ? `
      <a class="dashboard-alert dashboard-alert-warning" href="#/inventory">
        <strong>${lowStockCount} bahan hampir habis.</strong>
        <span>Cek inventaris →</span>
      </a>
    `
    : "",
  ].join("");

  metricsEl.innerHTML = [
    {
      icon: "SPK",
      label: "Pesanan Hari Ini",
      value: liveMetrics.ordersToday,
      trend: "Aktif masuk hari ini",
      tone: "primary",
    },
    {
      icon: "Rp",
      label: "Revenue Hari Ini",
      value: formatCurrency(dashboard.revenueToday),
      trend: `${revenueTrend >= 0 ? "↑" : "↓"} ${Math.abs(revenueTrend).toFixed(1)}% dari kemarin`,
      tone: revenueTrend >= 0 ? "success" : "danger",
    },
    {
      icon: "OK",
      label: "Selesai Hari Ini",
      value: liveMetrics.completedToday,
      trend: `${completionRate}% completion rate`,
      tone: "success",
    },
    {
      icon: "!",
      label: "Overdue / Perlu Perhatian",
      value: liveMetrics.overdueOrders,
      trend: liveMetrics.overdueOrders > 0 ? "Butuh follow-up hari ini" : "Tidak ada overdue",
      tone: liveMetrics.overdueOrders > 0 ? "danger" : "success",
    },
  ].map((metric) => `
    <article class="metric-card metric-card-${metric.tone}" ${metric.label.startsWith("Overdue") ? 'data-dashboard-filter="overdue"' : ""}>
      <div class="metric-icon" aria-hidden="true">${metric.icon}</div>
      <div>
        <p class="metric-label">${metric.label}</p>
        <div class="metric-value">${metric.value}</div>
        <p class="metric-trend">${metric.trend}</p>
      </div>
    </article>
  `).join("");

  chartEl.innerHTML = buildRevenueChart(dashboard.revenueLast7Days);
  topProductsEl.innerHTML = dashboard.topProductsThisMonth.map((product, index) => `
    <div class="product-rank">
      <div class="product-rank-header">
        <span class="product-rank-name">${index + 1}. ${product.name}</span>
        <span class="font-semibold">${product.share}%</span>
      </div>
      <div class="mini-bar"><span style="width: ${product.share}%"></span></div>
    </div>
  `).join("");

  const productionLabels = {
    design_queue: "Antrian Desain",
    in_design: "Sedang Desain",
    printing: "Sedang Cetak",
    finishing: "Finishing",
    ready: "Siap Ambil",
  };

  productionEl.innerHTML = Object.entries(productionLabels).map(([key, label]) => `
    <a class="production-count" href="#/production">
      <span>${label}</span>
      <strong>${liveMetrics.productionStatus[key] || 0}</strong>
    </a>
  `).join("");
}

function getDashboardMetrics() {
  const orders = window.APP_DATA?.orders || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = (dateInput) => {
    const date = new Date(dateInput);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  return {
    ordersToday: orders.filter((order) => isToday(order.createdAt)).length,
    completedToday: orders.filter((order) => ["ready", "delivered", "closed"].includes(order.status) && isToday(order.updatedAt)).length,
    overdueOrders: orders.filter(isOrderOverdue).length,
    productionStatus: {
      design_queue: orders.filter((order) => order.status === "design_queue").length,
      in_design: orders.filter((order) => order.status === "in_design").length,
      printing: orders.filter((order) => order.status === "printing").length,
      finishing: orders.filter((order) => order.status === "finishing").length,
      ready: orders.filter((order) => order.status === "ready").length,
    },
  };
}

function renderOrdersPage() {
  const orders = window.APP_DATA?.orders || [];
  const statusSelect = document.getElementById("orders-status");
  const searchInput = document.getElementById("orders-search");
  const tableEl = document.getElementById("orders-table");

  if (!statusSelect || !searchInput || !tableEl) return;

  statusSelect.innerHTML = [
    '<option value="all">Semua status</option>',
    ...Object.entries(window.APP_DATA.statusLabels).map(([value, label]) => `<option value="${value}">${label}</option>`),
  ].join("");

  statusSelect.value = APP_STATE.orderFilters.status;
  searchInput.value = APP_STATE.orderFilters.search;
  document.querySelectorAll("[data-date-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.dateFilter === APP_STATE.orderFilters.date);
  });

  renderOrdersTable(orders);
}

function renderOrdersTable(orders) {
  const tableEl = document.getElementById("orders-table");
  const counterEl = document.getElementById("orders-counter");
  if (!tableEl || !counterEl) return;

  const filteredOrders = filterOrders(orders);
  counterEl.textContent = APP_STATE.orderFilters.overdue
    ? `Menampilkan ${filteredOrders.length} pesanan overdue dari ${orders.length} pesanan`
    : `Menampilkan ${filteredOrders.length} dari ${orders.length} pesanan`;

  if (filteredOrders.length === 0) {
    tableEl.innerHTML = `
      <section class="card empty-state">
        <div class="empty-illustration" aria-hidden="true">SPK</div>
        <h2 class="card-title">Tidak ada pesanan yang cocok</h2>
        <p>Ubah status, kata kunci, atau filter tanggal untuk melihat hasil lain.</p>
      </section>
    `;
    return;
  }

  tableEl.innerHTML = `
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>No. SPK</th>
            <th>Customer</th>
            <th>Produk</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Deadline</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${filteredOrders.map((order) => renderOrderRow(order)).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderOrderRow(order) {
  const overdue = isOrderOverdue(order);
  const detailHash = `#/order/${encodeURIComponent(order.spkNumber)}`;

  return `
    <tr class="${overdue ? "row-overdue" : ""}" data-order-link="${detailHash}">
      <td>
        <a class="table-link" href="${detailHash}">${order.spkNumber}</a>
      </td>
      <td>
        <div class="font-semibold">${order.customerName}</div>
        <div class="text-xs text-muted">${order.paymentStatus === "paid" ? "Lunas" : order.paymentStatus === "partial" ? "DP / Parsial" : "Belum bayar"}</div>
      </td>
      <td>${order.productName}</td>
      <td>${order.qty} ${order.unit}</td>
      <td>${formatCurrency(order.total)}</td>
      <td>
        <span class="${overdue ? "text-danger font-semibold" : ""}">${formatRelativeDate(order.deadlineAt)}</span>
      </td>
      <td>
        <span class="badge badge-${order.status}">${window.APP_DATA.statusLabels[order.status] || order.status}</span>
      </td>
      <td>
        <a class="btn-secondary btn-sm" href="${detailHash}">Detail</a>
      </td>
    </tr>
  `;
}

function filterOrders(orders) {
  const { search, status, date } = APP_STATE.orderFilters;
  const searchText = search.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesSearch = !searchText
      || order.customerName.toLowerCase().includes(searchText)
      || order.spkNumber.toLowerCase().includes(searchText);
    const matchesStatus = status === "all" || order.status === status;
    const matchesDate = matchesDateFilter(order.deadlineAt, date);
    const matchesOverdue = !APP_STATE.orderFilters.overdue || isOrderOverdue(order);

    return matchesSearch && matchesStatus && matchesDate && matchesOverdue;
  });
}

function matchesDateFilter(dateInput, filter) {
  if (filter === "all") return true;

  const date = new Date(dateInput);
  const now = new Date();
  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  if (filter === "today") {
    return date.getTime() === now.getTime();
  }

  if (filter === "week") {
    const end = new Date(now);
    end.setDate(now.getDate() + 7);
    return date >= now && date <= end;
  }

  return true;
}

function isOrderOverdue(order) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(order.deadlineAt);
  deadline.setHours(0, 0, 0, 0);
  const isDone = ["ready", "delivered", "closed"].includes(order.status);
  return deadline < today && !isDone;
}

function initOrderNewPage() {
  const productSelect = document.getElementById("order-product");
  const deadlineDate = document.getElementById("order-deadline-date");
  if (!productSelect || !deadlineDate) return;

  productSelect.innerHTML = [
    '<option value="">Pilih produk</option>',
    ...(window.APP_DATA?.products || []).map((product) => (
      `<option value="${product.id}">${product.name}</option>`
    )),
  ].join("");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  deadlineDate.value = toDateInputValue(tomorrow);
  updateOrderCalculation();
}

function renderCustomerSuggestions(query) {
  const suggestionsEl = document.getElementById("customer-suggestions");
  if (!suggestionsEl) return;

  const value = query.trim().toLowerCase();
  if (value.length < 2) {
    suggestionsEl.classList.add("hidden");
    suggestionsEl.innerHTML = "";
    return;
  }

  const matches = (window.APP_DATA?.customers || [])
    .filter((customer) => customer.name.toLowerCase().includes(value))
    .slice(0, 6);

  if (matches.length === 0) {
    suggestionsEl.innerHTML = '<div class="autocomplete-empty">Customer baru</div>';
    suggestionsEl.classList.remove("hidden");
    return;
  }

  suggestionsEl.innerHTML = matches.map((customer) => `
    <button type="button" class="autocomplete-option" data-customer-id="${customer.id}">
      <strong>${customer.name}</strong>
      <span>${customer.phone}</span>
    </button>
  `).join("");
  suggestionsEl.classList.remove("hidden");
}

function selectCustomer(customerId) {
  const customer = (window.APP_DATA?.customers || []).find((item) => item.id === customerId);
  if (!customer) return;

  APP_STATE.selectedCustomer = customer;
  document.getElementById("order-customer").value = customer.name;
  document.getElementById("order-customer-id").value = customer.id;
  document.getElementById("order-phone").value = formatPhone(customer.phone);
  document.getElementById("customer-suggestions").classList.add("hidden");
}

function selectProduct(productId) {
  const product = (window.APP_DATA?.products || []).find((item) => item.id === productId);
  APP_STATE.selectedProduct = product || null;

  const unitPrice = document.getElementById("order-unit-price");
  if (unitPrice) {
    unitPrice.value = product ? product.basePrice : "";
  }

  renderDynamicSpecs(product);
  updateOrderCalculation({ autoPrice: true });
}

function renderDynamicSpecs(product) {
  const specsEl = document.getElementById("dynamic-specs");
  const qtyHelp = document.getElementById("qty-help");
  if (!specsEl) return;

  if (!product) {
    specsEl.innerHTML = "";
    if (qtyHelp) qtyHelp.textContent = "Jumlah item pesanan.";
    return;
  }

  const isLargeFormat = /Banner|Spanduk|Backdrop|Billboard|Neon Box/i.test(product.name);
  const isTiered = /Brosur|Stiker/i.test(product.name);

  if (isLargeFormat) {
    specsEl.innerHTML = `
      <div class="spec-inline">
        <div class="form-group">
          <label for="order-width">Lebar (cm)</label>
          <input id="order-width" type="number" min="1" value="100" data-calc-field>
        </div>
        <div class="form-group">
          <label for="order-height">Tinggi (cm)</label>
          <input id="order-height" type="number" min="1" value="100" data-calc-field>
        </div>
      </div>
    `;
    if (qtyHelp) qtyHelp.textContent = "Qty otomatis dihitung dalam m² dari ukuran.";
    document.getElementById("order-qty").value = "1";
    document.getElementById("order-qty").readOnly = true;
    return;
  }

  document.getElementById("order-qty").readOnly = false;
  if (isTiered) {
    specsEl.innerHTML = `
      <div class="spec-info">
        Harga tier otomatis: 500+ diskon 10%, 1000+ diskon 18%.
      </div>
    `;
    if (qtyHelp) qtyHelp.textContent = `Minimal ${product.minQty} ${product.unit}.`;
    return;
  }

  specsEl.innerHTML = `
    <div class="spec-info">
      ${product.specs.join(" · ")}
    </div>
  `;
  if (qtyHelp) qtyHelp.textContent = `Minimal ${product.minQty} ${product.unit}.`;
}

function updateOrderCalculation(options = {}) {
  const product = APP_STATE.selectedProduct;
  const qtyInput = document.getElementById("order-qty");
  const unitPriceInput = document.getElementById("order-unit-price");
  if (!qtyInput || !unitPriceInput) return;

  if (product && /Banner|Spanduk|Backdrop|Billboard|Neon Box/i.test(product.name)) {
    const width = Number(document.getElementById("order-width")?.value || 100);
    const height = Number(document.getElementById("order-height")?.value || 100);
    const area = Math.max((width * height) / 10000, 0.01);
    qtyInput.value = area.toFixed(2);
  }

  if (product && options.autoPrice && /Brosur|Stiker/i.test(product.name)) {
    const qty = Number(qtyInput.value || 0);
    const tierMultiplier = qty >= 1000 ? 0.82 : qty >= 500 ? 0.9 : 1;
    unitPriceInput.value = Math.round(product.basePrice * tierMultiplier);
  }

  const qty = Number(qtyInput.value || 0);
  const unitPrice = Number(unitPriceInput.value || 0);
  const subtotal = Math.max(qty * unitPrice, 0);
  const discountType = document.getElementById("discount-type")?.value || "nominal";
  const discountValue = Number(document.getElementById("order-discount")?.value || 0);
  const discount = discountType === "percent" ? subtotal * Math.min(discountValue, 100) / 100 : discountValue;
  const grandTotal = Math.max(subtotal - discount, 0);
  const dp = Number(document.getElementById("order-dp")?.value || 0);
  const balance = Math.max(grandTotal - dp, 0);

  document.getElementById("order-total").textContent = formatCurrency(subtotal);
  document.getElementById("order-grand-total").textContent = formatCurrency(grandTotal);
  document.getElementById("order-balance").textContent = formatCurrency(balance);
}

function submitNewOrder(event) {
  event.preventDefault();

  const form = event.target;
  const product = APP_STATE.selectedProduct || (window.APP_DATA?.products || []).find((item) => item.id === form.productId.value);
  if (!product) {
    showToast("Pilih produk terlebih dahulu.", "error");
    return;
  }

  const customerName = form.customerName.value.trim() || "Customer Walk-in";
  const customerId = form.customerId.value || `NEW-${Date.now()}`;
  const deadlineAt = new Date(`${form.deadlineDate.value}T${form.deadlineTime.value || "16:00"}`);
  const qty = Number(form.qty.value || 1);
  const unitPrice = Number(form.unitPrice.value || product.basePrice);
  const subtotal = qty * unitPrice;
  const discountType = document.getElementById("discount-type").value;
  const discountValue = Number(document.getElementById("order-discount").value || 0);
  const discount = discountType === "percent" ? subtotal * Math.min(discountValue, 100) / 100 : discountValue;
  const total = Math.max(subtotal - discount, 0);
  const paidAmount = Math.min(Number(form.dp.value || 0), total);
  const priority = new FormData(form).get("priority") || "normal";
  const sequence = String((window.APP_DATA.orders || []).length + 1).padStart(4, "0");
  const spkNumber = `SPK-SBY-${toCompactDate(new Date())}-${sequence}`;
  const finishing = Array.from(form.querySelectorAll("input[name='finishing']:checked")).map((input) => input.value);

  const newOrder = {
    id: `ORD-${sequence}`,
    spkNumber,
    customerId,
    customerName,
    productId: product.id,
    productName: product.name,
    qty,
    unit: product.unit,
    total,
    paidAmount,
    paymentStatus: paidAmount <= 0 ? "unpaid" : paidAmount >= total ? "paid" : "partial",
    status: form.needsDesign.value === "yes" ? "design_queue" : "confirmed",
    priority,
    productionStage: form.needsDesign.value === "yes" ? "Antrian Desain" : "Antrian Cetak",
    branchId: "BR-SBY-PUSAT",
    createdAt: new Date().toISOString(),
    deadlineAt: deadlineAt.toISOString(),
    updatedAt: new Date().toISOString(),
    designerId: form.needsDesign.value === "yes" ? "EMP-003" : null,
    operatorId: null,
    notes: form.notes.value,
    channel: new FormData(form).get("channel") || "walk-in",
    phone: form.phone.value,
    finishing,
    files: document.getElementById("order-file").files[0]
      ? [{ name: document.getElementById("order-file").files[0].name, type: "file", uploadedAt: new Date().toISOString() }]
      : [],
    timeline: [
      { at: new Date().toISOString(), status: "created", user: APP_STATE.currentUser.name, note: "Order dibuat dari form input" },
    ],
  };

  window.APP_DATA.orders.unshift(newOrder);
  persistStoredOrders();
  updateSidebar(APP_STATE.currentRole);
  showToast(`Pesanan ${spkNumber} berhasil disimpan.`, "success");
  window.location.hash = `#/order/${encodeURIComponent(spkNumber)}`;
}

const ORDER_STAGES = [
  { status: "confirmed", label: "Terkonfirmasi" },
  { status: "design_queue", label: "Antrian Desain" },
  { status: "in_design", label: "Sedang Desain" },
  { status: "printing", label: "Cetak" },
  { status: "finishing", label: "Finishing" },
  { status: "ready", label: "Siap Ambil" },
  { status: "closed", label: "Selesai" },
];

const ORDER_ACTIONS = {
  confirmed: [
    { label: "Kirim ke Antrian Desain", nextStatus: "design_queue", note: "SPK masuk antrian desain" },
    { label: "Kirim ke Produksi", nextStatus: "printing", note: "SPK dikirim langsung ke produksi" },
  ],
  design_queue: [
    { label: "Mulai Desain", nextStatus: "in_design", note: "Desain mulai dikerjakan" },
  ],
  in_design: [
    { label: "Selesai Desain, Minta Approval", nextStatus: "printing", note: "Desain selesai dan masuk proses cetak" },
  ],
  printing: [
    { label: "Selesai Cetak, Masuk Finishing", nextStatus: "finishing", note: "Cetak selesai dan masuk finishing" },
  ],
  finishing: [
    { label: "Selesai, Siap Diambil", nextStatus: "ready", note: "Pesanan selesai dan siap diambil" },
  ],
  ready: [
    { label: "Tandai Sudah Diambil & Lunas", nextStatus: "closed", note: "Pesanan diambil customer dan ditutup" },
  ],
};

function renderOrderDetailPage() {
  const container = document.getElementById("order-detail-content");
  if (!container) return;

  const order = findOrderBySpk(APP_STATE.routeParams.spkNumber);
  if (!order) {
    container.innerHTML = `
      <section class="card empty-state">
        <div class="empty-illustration" aria-hidden="true">404</div>
        <h1 class="page-title">SPK tidak ditemukan</h1>
        <p>Nomor SPK tidak ada di data prototype.</p>
        <a class="btn-primary" href="#/orders">Kembali ke Pesanan</a>
      </section>
    `;
    return;
  }

  const statusLabel = window.APP_DATA.statusLabels[order.status] || order.status;
  const priorityClass = order.priority === "VIP" ? "badge-vip" : order.priority === "urgent" ? "badge-urgent" : "badge-confirmed";

  container.innerHTML = `
    <div class="detail-header">
      <div>
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="page-title">${order.spkNumber}</h1>
          <span class="badge badge-${order.status}">${statusLabel}</span>
          <span class="badge ${priorityClass}">${window.APP_DATA.priorityLabels[order.priority] || order.priority}</span>
        </div>
        <p class="page-subtitle">Dibuat ${formatDate(order.createdAt)} · Deadline ${formatRelativeDate(order.deadlineAt)}</p>
      </div>
      <div class="flex gap-3 flex-wrap">
        <button class="btn-secondary" type="button" data-action="print-spk">Cetak SPK</button>
        <button class="btn-secondary" type="button" data-action="duplicate-order">Duplikat</button>
        <button class="btn-danger" type="button" data-action="cancel-order">Batalkan</button>
      </div>
    </div>

    ${renderProgressTracker(order)}

    <section class="order-detail-grid">
      ${renderOrderInfoCard(order)}
      ${renderTimelineCard(order)}
      ${renderActionCard(order)}
    </section>
  `;
}

function renderProgressTracker(order) {
  const currentIndex = getStageIndex(order.status);
  return `
    <section class="card progress-card" aria-label="Progress SPK">
      <div class="progress-track">
        ${ORDER_STAGES.map((stage, index) => {
          const stateClass = index < currentIndex ? "done" : index === currentIndex ? "current" : "";
          return `
            <div class="progress-step ${stateClass}">
              <span>${index + 1}</span>
              <strong>${stage.label}</strong>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderOrderInfoCard(order) {
  const fileList = order.files?.length
    ? order.files.map((file) => `<li>${file.name}</li>`).join("")
    : "<li>Belum ada file</li>";
  const finishing = order.finishing?.length ? order.finishing.join(", ") : "Standar";

  return `
    <article class="card detail-card">
      <h2 class="card-title">Info Pesanan</h2>
      <dl class="detail-list">
        <div><dt>Customer</dt><dd>${order.customerName}</dd></div>
        <div><dt>Produk</dt><dd>${order.productName}</dd></div>
        <div><dt>Qty</dt><dd>${order.qty} ${order.unit}</dd></div>
        <div><dt>Finishing</dt><dd>${finishing}</dd></div>
        <div><dt>Total</dt><dd>${formatCurrency(order.total)}</dd></div>
        <div><dt>Dibayar</dt><dd>${formatCurrency(order.paidAmount || 0)}</dd></div>
        <div><dt>Sisa</dt><dd>${formatCurrency(Math.max(order.total - (order.paidAmount || 0), 0))}</dd></div>
        <div><dt>Deadline</dt><dd>${formatDate(order.deadlineAt)}</dd></div>
      </dl>
      <div class="mt-4">
        <h3 class="detail-subtitle">File Upload</h3>
        <ul class="file-list">${fileList}</ul>
      </div>
      ${["printing","finishing","ready","delivered","closed"].includes(order.status) ? `
      <div class="mt-4" style="border-top:1px solid var(--neutral-200);padding-top:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;flex-wrap:wrap">
          <h3 class="detail-subtitle" style="margin:0">Material & Waste</h3>
          <div style="display:flex;gap:6px">
            <button class="btn-secondary" type="button" data-action="open-qr-scan"
              style="font-size:12px;padding:5px 10px">📷 Scan QR</button>
            <button class="btn-primary" type="button"
              data-action="open-usage-waste-modal"
              data-spk-number="${order.spkNumber}"
              style="font-size:12px;padding:5px 10px">+ Catat Pemakaian</button>
          </div>
        </div>
        ${(() => {
          const usages = (window.APP_DATA?.usageLog || []).filter((u) => u.spkNumber === order.spkNumber);
          if (!usages.length) return `<p class="text-muted text-sm">Belum ada material dicatat untuk SPK ini.</p>`;
          const wasteCatLabels = { cutting:"Cutting",misprint:"Gagal Cetak",overflow:"Kelebihan",calibration:"Setup Loss",damage:"Kerusakan" };
          return `
            <div class="data-table" style="margin:0">
              <table>
                <thead><tr><th>Bahan</th><th>Qty Pakai</th><th>Waste</th><th>Kategori</th></tr></thead>
                <tbody>
                  ${usages.map((u) => `
                    <tr>
                      <td>${u.itemName}</td>
                      <td>${u.qtyUsed} ${u.unit}</td>
                      <td class="${u.qtyWaste > 0 ? "text-warning" : "text-muted"}">${u.qtyWaste} ${u.unit}</td>
                      <td class="text-xs text-muted">${u.wasteCategory ? (wasteCatLabels[u.wasteCategory] || u.wasteCategory) : "—"}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          `;
        })()}
      </div>
      ` : ""}
    </article>
  `;
}

function renderTimelineCard(order) {
  const timeline = [...(order.timeline || [])].sort((a, b) => new Date(a.at) - new Date(b.at));
  return `
    <article class="card detail-card">
      <h2 class="card-title">Timeline</h2>
      <div class="timeline-list">
        ${timeline.map((item) => `
          <div class="timeline-item">
            <span class="timeline-dot" aria-hidden="true"></span>
            <div>
              <strong>${window.APP_DATA.statusLabels[item.status] || item.status}</strong>
              <p>${item.note || "-"}</p>
              <small>${formatDate(item.at)} · ${item.user}</small>
            </div>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderActionCard(order) {
  const actions = ORDER_ACTIONS[order.status] || [];
  return `
    <article class="card detail-card">
      <h2 class="card-title">Aksi & Catatan</h2>
      <div class="action-stack">
        ${actions.length ? actions.map((action) => `
          <button class="btn-primary w-full" type="button" data-action="advance-order" data-status="${action.nextStatus}" data-note="${action.note}">
            ${action.label}
          </button>
        `).join("") : '<p class="text-muted">Tidak ada aksi lanjutan untuk status ini.</p>'}
      </div>

      <div class="form-group mt-4">
        <label for="detail-note">Tambah Catatan</label>
        <textarea id="detail-note" placeholder="Tambahkan catatan timeline internal"></textarea>
      </div>
      <button class="btn-secondary w-full mt-3" type="button" data-action="add-order-note">Tambah Catatan</button>

      <div class="note-box mt-4">
        <strong>Catatan operator</strong>
        <p>${order.notes || "Belum ada catatan operator."}</p>
      </div>
    </article>
  `;
}

function getStageIndex(status) {
  if (status === "draft") return 0;
  if (status === "delivered") return ORDER_STAGES.length - 1;
  const index = ORDER_STAGES.findIndex((stage) => stage.status === status);
  return index >= 0 ? index : 0;
}

function findOrderBySpk(spkNumber) {
  return (window.APP_DATA?.orders || []).find((order) => order.spkNumber === spkNumber);
}

function advanceCurrentOrder(nextStatus, note) {
  const order = findOrderBySpk(APP_STATE.routeParams.spkNumber);
  if (!order) return;

  order.status = nextStatus;
  order.updatedAt = new Date().toISOString();
  order.productionStage = window.APP_DATA.statusLabels[nextStatus] || nextStatus;
  if (nextStatus === "closed") {
    order.paidAmount = order.total;
    order.paymentStatus = "paid";
  }
  order.timeline = order.timeline || [];
  order.timeline.push({
    at: new Date().toISOString(),
    status: nextStatus,
    user: APP_STATE.currentUser.name,
    note,
  });

  persistStoredOrders();
  renderOrderDetailPage();
  updateSidebar(APP_STATE.currentRole);
  showToast(`Status SPK diperbarui ke ${window.APP_DATA.statusLabels[nextStatus] || nextStatus}.`, "success");
}

function addCurrentOrderNote() {
  const order = findOrderBySpk(APP_STATE.routeParams.spkNumber);
  const noteInput = document.getElementById("detail-note");
  if (!order || !noteInput || !noteInput.value.trim()) return;

  order.timeline = order.timeline || [];
  order.timeline.push({
    at: new Date().toISOString(),
    status: "note",
    user: APP_STATE.currentUser.name,
    note: noteInput.value.trim(),
  });
  persistStoredOrders();
  renderOrderDetailPage();
  showToast("Catatan ditambahkan ke timeline.", "success");
}

function duplicateCurrentOrder() {
  const order = findOrderBySpk(APP_STATE.routeParams.spkNumber);
  if (!order) return;

  const sequence = String((window.APP_DATA.orders || []).length + 1).padStart(4, "0");
  const spkNumber = `SPK-SBY-${toCompactDate(new Date())}-${sequence}`;
  const duplicated = {
    ...order,
    id: `ORD-${sequence}`,
    spkNumber,
    status: "draft",
    paidAmount: 0,
    paymentStatus: "unpaid",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      { at: new Date().toISOString(), status: "created", user: APP_STATE.currentUser.name, note: `Duplikat dari ${order.spkNumber}` },
    ],
  };

  window.APP_DATA.orders.unshift(duplicated);
  persistStoredOrders();
  showToast(`Duplikat dibuat: ${spkNumber}`, "success");
  window.location.hash = `#/order/${encodeURIComponent(spkNumber)}`;
}

function cancelCurrentOrder() {
  const order = findOrderBySpk(APP_STATE.routeParams.spkNumber);
  if (!order) return;

  const confirmed = window.confirm(`Batalkan ${order.spkNumber}?`);
  if (!confirmed) return;

  order.status = "draft";
  order.updatedAt = new Date().toISOString();
  order.timeline = order.timeline || [];
  order.timeline.push({
    at: new Date().toISOString(),
    status: "cancelled",
    user: APP_STATE.currentUser.name,
    note: "SPK dibatalkan dari halaman detail",
  });
  persistStoredOrders();
  renderOrderDetailPage();
  updateSidebar(APP_STATE.currentRole);
  showToast("SPK dibatalkan.", "warning");
}

const PRODUCTION_COLUMNS = [
  { id: "design_queue", label: "Antrian Desain", statuses: ["confirmed", "design_queue"], operatorHidden: true },
  { id: "in_design", label: "Sedang Desain", statuses: ["in_design"], operatorHidden: true },
  { id: "review", label: "Review Pelanggan", statuses: ["delivered"], operatorHidden: true },
  { id: "print_queue", label: "Antrian Cetak", statuses: ["draft"], printQueue: true },
  { id: "printing", label: "Sedang Cetak", statuses: ["printing"] },
  { id: "finishing", label: "Finishing", statuses: ["finishing"] },
  { id: "ready", label: "Siap Ambil", statuses: ["ready"] },
];

function renderProductionBoard() {
  const board = document.getElementById("production-board");
  if (!board) return;

  document.querySelectorAll("[data-production-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.productionFilter === APP_STATE.productionFilter);
  });

  const columns = PRODUCTION_COLUMNS.filter((column) => !(APP_STATE.currentRole === "operator" && column.operatorHidden));
  const activeOrders = getProductionOrders();

  board.innerHTML = columns.map((column) => {
    const orders = activeOrders.filter((order) => orderBelongsToColumn(order, column));
    return `
      <section class="kanban-column">
        <header class="kanban-column-header">
          <h2>${column.label}</h2>
          <span class="nav-badge">${orders.length}</span>
        </header>
        <div class="kanban-card-list">
          ${orders.length ? orders.map(renderProductionCard).join("") : '<div class="kanban-empty">Tidak ada SPK</div>'}
        </div>
      </section>
    `;
  }).join("");
}

function getProductionOrders() {
  return (window.APP_DATA?.orders || []).filter((order) => {
    const isActive = !["closed"].includes(order.status);
    const matchesFilter = APP_STATE.productionFilter === "all"
      || (APP_STATE.productionFilter === "urgent" && ["urgent", "VIP"].includes(order.priority))
      || (APP_STATE.productionFilter === "overdue" && isOrderOverdue(order));
    return isActive && matchesFilter;
  });
}

function orderBelongsToColumn(order, column) {
  if (column.printQueue) {
    return order.status === "draft" || (order.status === "confirmed" && order.productionStage === "Antrian Cetak");
  }
  return column.statuses.includes(order.status);
}

function renderProductionCard(order) {
  const overdue = isOrderOverdue(order);
  const dueToday = formatRelativeDate(order.deadlineAt) === "Hari ini";
  const priorityClass = order.priority === "VIP" ? "badge-vip" : order.priority === "urgent" ? "badge-urgent" : "";
  const cardTone = overdue ? "overdue" : ["urgent", "VIP"].includes(order.priority) ? "urgent" : "";
  const operator = (window.APP_DATA?.employees || []).find((employee) => employee.id === order.operatorId || employee.id === order.designerId);

  return `
    <article class="kanban-card ${cardTone}" data-production-spk="${order.spkNumber}">
      <div class="text-xs text-muted">${order.spkNumber}</div>
      <h3>${order.productName}</h3>
      <p>${order.customerName}</p>
      <div class="kanban-card-meta">
        <span class="${overdue ? "text-danger font-semibold" : dueToday ? "text-warning font-semibold" : "text-muted"}">${formatRelativeDate(order.deadlineAt)}</span>
        ${priorityClass ? `<span class="badge ${priorityClass}">${window.APP_DATA.priorityLabels[order.priority]}</span>` : ""}
      </div>
      <div class="kanban-card-footer">
        <span class="mini-avatar">${operator ? operator.name.charAt(0) : "?"}</span>
        <span>${operator ? operator.name : "Belum assigned"}</span>
      </div>
    </article>
  `;
}

function openProductionModal(spkNumber) {
  APP_STATE.selectedProductionSpk = spkNumber;
  const modalRoot = document.getElementById("production-modal-root");
  const order = findOrderBySpk(spkNumber);
  if (!modalRoot || !order) return;

  const nextAction = getNextProductionAction(order);
  modalRoot.innerHTML = `
    <div class="modal-overlay" data-action="close-production-modal">
      <section class="modal-box production-modal" role="dialog" aria-modal="true" aria-label="Detail produksi">
        <header class="modal-header">
          <div>
            <h2 class="card-title">${order.spkNumber}</h2>
            <p class="card-description">${order.customerName} · ${order.productName}</p>
          </div>
        </header>
        <div class="modal-body">
          <dl class="detail-list">
            <div><dt>Status</dt><dd>${window.APP_DATA.statusLabels[order.status] || order.status}</dd></div>
            <div><dt>Prioritas</dt><dd>${window.APP_DATA.priorityLabels[order.priority] || order.priority}</dd></div>
            <div><dt>Deadline</dt><dd>${formatRelativeDate(order.deadlineAt)}</dd></div>
            <div><dt>Qty</dt><dd>${order.qty} ${order.unit}</dd></div>
            <div><dt>Total</dt><dd>${formatCurrency(order.total)}</dd></div>
          </dl>
          <div class="note-box mt-4">
            <strong>Catatan</strong>
            <p>${order.notes || "Tidak ada catatan operator."}</p>
          </div>
        </div>
        <footer class="modal-footer">
          <button class="btn-secondary" type="button" data-action="close-production-modal">Tutup</button>
          ${nextAction ? `<button class="btn-primary" type="button" data-action="production-update-status" data-status="${nextAction.nextStatus}" data-note="${nextAction.note}">Update Status</button>` : ""}
        </footer>
      </section>
    </div>
  `;
}

function getNextProductionAction(order) {
  const actions = ORDER_ACTIONS[order.status] || [];
  return actions[0] || null;
}

function closeProductionModal() {
  const modalRoot = document.getElementById("production-modal-root");
  if (modalRoot) modalRoot.innerHTML = "";
  APP_STATE.selectedProductionSpk = null;
}

function updateProductionStatus(nextStatus, note) {
  const order = findOrderBySpk(APP_STATE.selectedProductionSpk);
  if (!order) return;

  order.status = nextStatus;
  order.updatedAt = new Date().toISOString();
  order.productionStage = window.APP_DATA.statusLabels[nextStatus] || nextStatus;
  order.timeline = order.timeline || [];
  order.timeline.push({
    at: new Date().toISOString(),
    status: nextStatus,
    user: APP_STATE.currentUser.name,
    note: note || "Status diperbarui dari papan produksi",
  });

  persistStoredOrders();
  closeProductionModal();
  renderProductionBoard();
  updateSidebar(APP_STATE.currentRole);
  showToast(`SPK pindah ke ${window.APP_DATA.statusLabels[nextStatus] || nextStatus}.`, "success");
}

function initQueuePage() {
  loadQueueState();
  renderQueuePage();
}

function renderQueuePage() {
  const countersEl = document.getElementById("queue-counters");
  const waitingEl = document.getElementById("queue-waiting-list");
  const countEl = document.getElementById("queue-waiting-count");
  const queue = window.APP_DATA?.queueNumbers;
  if (!countersEl || !waitingEl || !countEl || !queue) return;

  countersEl.innerHTML = queue.current.map((counter) => `
    <article class="card queue-counter-card">
      <div class="queue-counter-header">
        <span>Counter ${counter.counter}</span>
        <small>${counter.customerName || "Belum ada customer"}</small>
      </div>
      <div class="queue-current-number">${counter.number || "-"}</div>
      <div class="queue-actions">
        <button class="btn-primary" type="button" data-action="call-next-queue" data-counter="${counter.counter}">Panggil Berikutnya</button>
        <button class="btn-secondary btn-sm" type="button" data-action="recall-queue" data-counter="${counter.counter}">Panggil Ulang</button>
        <button class="btn-secondary btn-sm" type="button" data-action="skip-queue" data-counter="${counter.counter}">Lewati</button>
      </div>
    </article>
  `).join("");

  countEl.textContent = `${queue.waiting.length} menunggu`;
  waitingEl.innerHTML = queue.waiting.length
    ? queue.waiting.map((item, index) => `
      <div class="queue-waiting-item">
        <div>
          <strong>${item.number}</strong>
          <span>${item.customerName}</span>
        </div>
        <div class="queue-waiting-meta">
          <span>±${(index + 1) * 7} menit</span>
          <button class="btn-secondary btn-sm" type="button" data-action="call-specific-queue" data-number="${item.number}">Panggil</button>
        </div>
      </div>
    `).join("")
    : `
      <div class="empty-state">
        <div class="empty-illustration" aria-hidden="true">A</div>
        <p>Tidak ada antrian menunggu.</p>
      </div>
    `;
}

function callNextQueue(counterNumber) {
  const queue = window.APP_DATA.queueNumbers;
  const next = queue.waiting.shift();
  if (!next) {
    showToast("Tidak ada antrian menunggu.", "warning");
    return;
  }

  assignQueueToCounter(counterNumber, next);
}

function callSpecificQueue(counterNumber, queueNumber) {
  const queue = window.APP_DATA.queueNumbers;
  const index = queue.waiting.findIndex((item) => item.number === queueNumber);
  if (index < 0) return;

  const [selected] = queue.waiting.splice(index, 1);
  assignQueueToCounter(counterNumber, selected);
}

function assignQueueToCounter(counterNumber, item) {
  const queue = window.APP_DATA.queueNumbers;
  const counter = queue.current.find((entry) => String(entry.counter) === String(counterNumber)) || queue.current[0];
  counter.number = item.number;
  counter.customerName = item.customerName;
  counter.calledAt = new Date().toISOString();
  counter.type = item.type;

  persistQueueState();
  renderQueuePage();
  showToast(`${item.number} dipanggil ke Counter ${counter.counter}.`, "success");
}

function skipQueue(counterNumber) {
  const queue = window.APP_DATA.queueNumbers;
  const counter = queue.current.find((entry) => String(entry.counter) === String(counterNumber));
  if (!counter || !counter.number) return;

  counter.customerName = `${counter.customerName || "Customer"} (dilewati)`;
  persistQueueState();
  renderQueuePage();
  showToast(`${counter.number} dilewati.`, "warning");
}

function recallQueue(counterNumber) {
  const queue = window.APP_DATA.queueNumbers;
  const counter = queue.current.find((entry) => String(entry.counter) === String(counterNumber));
  if (!counter || !counter.number) return;

  counter.calledAt = new Date().toISOString();
  persistQueueState();
  renderQueuePage();
  showToast(`${counter.number} dipanggil ulang ke Counter ${counter.counter}.`, "success");
}

function addQueueNumber() {
  const queue = window.APP_DATA.queueNumbers;
  queue.lastNumber += 1;
  const number = `A-${String(queue.lastNumber).padStart(3, "0")}`;
  queue.waiting.push({
    number,
    type: "order",
    customerName: `Customer Walk-in ${queue.lastNumber}`,
    createdAt: new Date().toISOString(),
  });

  persistQueueState();
  renderQueuePage();
  showToast(`${number} ditambahkan ke antrian.`, "success");
}

function loadQueueState() {
  try {
    const stored = JSON.parse(localStorage.getItem("printeoo:queue") || "null");
    if (stored && window.APP_DATA?.queueNumbers) {
      window.APP_DATA.queueNumbers = stored;
    }
  } catch (error) {
    console.warn("Gagal membaca state antrian", error);
  }
}

function persistQueueState() {
  localStorage.setItem("printeoo:queue", JSON.stringify(window.APP_DATA.queueNumbers));
}

function initProductionDisplay() {
  clearInterval(APP_STATE.productionDisplayTimer);
  renderProductionDisplay();
  APP_STATE.productionDisplayTimer = window.setInterval(updateProductionDisplayClock, 1000);
  window.addEventListener("storage", handleProductionDisplayStorage);
}

function renderProductionDisplay(notificationText = "") {
  const root = document.getElementById("production-display-root");
  if (!root) return;

  const printQueue = getProductionDisplayOrders("print_queue");
  const printing = getProductionDisplayOrders("printing")[0];
  const finishing = getProductionDisplayOrders("finishing");

  root.innerHTML = `
    <div class="display-shell">
      <header class="display-header">
        <div>
          <strong>${window.APP_DATA?.tenant?.name || "Printeoo"}</strong>
          <span>${APP_STATE.currentBranch}</span>
        </div>
        <time id="production-display-clock"></time>
      </header>

      <main class="display-grid">
        <section class="display-panel display-panel-list">
          <h2>Antrian Cetak</h2>
          <div class="display-list">
            ${printQueue.length ? printQueue.map(renderDisplayListItem).join("") : '<div class="display-empty">Antrian kosong</div>'}
          </div>
        </section>

        <section class="display-panel display-panel-main">
          <h2>Sedang Dikerjakan</h2>
          ${printing ? renderDisplayMainCard(printing) : '<div class="display-empty display-empty-large">Belum ada SPK printing</div>'}
        </section>

        <section class="display-panel display-panel-list">
          <h2>Finishing</h2>
          <div class="display-list">
            ${finishing.length ? finishing.map(renderDisplayListItem).join("") : '<div class="display-empty">Belum ada finishing</div>'}
          </div>
        </section>
      </main>

      <div id="production-notification" class="display-notification ${notificationText ? "show" : ""}">${notificationText}</div>
      <button class="display-sim-button" type="button" data-action="simulate-production-order">⚡ Simulasi SPK Masuk</button>
      <button class="display-mute-button" type="button" data-action="toggle-production-audio">${APP_STATE.audioMuted ? "🔇" : "🔊"}</button>
      ${APP_STATE.audioEnabled ? "" : `
        <div class="audio-overlay" data-action="enable-production-audio">
          <div>Ketuk layar untuk mengaktifkan audio notifikasi</div>
        </div>
      `}
    </div>
  `;

  updateProductionDisplayClock();
}

function getProductionDisplayOrders(columnId) {
  const orders = window.APP_DATA?.orders || [];
  if (columnId === "print_queue") {
    return orders
      .filter((order) => order.status === "confirmed" || order.status === "draft")
      .sort(compareProductionPriority);
  }
  return orders
    .filter((order) => order.status === columnId)
    .sort(compareProductionPriority);
}

function compareProductionPriority(a, b) {
  const score = { VIP: 0, urgent: 1, normal: 2 };
  return (score[a.priority] ?? 2) - (score[b.priority] ?? 2)
    || new Date(a.deadlineAt) - new Date(b.deadlineAt);
}

function renderDisplayListItem(order) {
  const priorityClass = order.priority === "VIP" ? "badge-vip" : order.priority === "urgent" ? "badge-urgent" : "badge-confirmed";
  return `
    <article class="display-list-item">
      <div>
        <span>${order.spkNumber}</span>
        <strong>${order.productName}</strong>
        <p>${formatRelativeDate(order.deadlineAt)}</p>
      </div>
      <span class="badge ${priorityClass}">${window.APP_DATA.priorityLabels[order.priority] || order.priority}</span>
    </article>
  `;
}

function renderDisplayMainCard(order) {
  const priorityTone = order.priority === "VIP" ? "vip" : order.priority === "urgent" ? "urgent" : "";
  return `
    <article class="display-main-card ${priorityTone}">
      <span>${order.spkNumber}</span>
      <h3>${order.productName}</h3>
      <p>${order.customerName}</p>
      <div class="display-main-meta">
        <strong>Deadline ${formatRelativeDate(order.deadlineAt)}</strong>
        <span>Timer ${getPrintingTimer(order.updatedAt)}</span>
      </div>
    </article>
  `;
}

function getPrintingTimer(startInput) {
  const start = new Date(startInput || new Date());
  const diff = Math.max(Date.now() - start.getTime(), 0);
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateProductionDisplayClock() {
  const clock = document.getElementById("production-display-clock");
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());

  const mainCardTimer = document.querySelector(".display-main-meta span");
  const printing = getProductionDisplayOrders("printing")[0];
  if (mainCardTimer && printing) {
    mainCardTimer.textContent = `Timer ${getPrintingTimer(printing.updatedAt)}`;
  }
}

function simulateProductionOrder() {
  const product = window.APP_DATA.products[0];
  const customer = window.APP_DATA.customers[0];
  const sequence = String((window.APP_DATA.orders || []).length + 1).padStart(4, "0");
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + 4);

  const order = {
    id: `ORD-${sequence}`,
    spkNumber: `SPK-SBY-${toCompactDate(new Date())}-${sequence}`,
    customerId: customer.id,
    customerName: customer.name,
    productId: product.id,
    productName: product.name,
    qty: 6,
    unit: product.unit,
    total: product.basePrice * 6,
    paidAmount: product.basePrice * 3,
    paymentStatus: "partial",
    status: "confirmed",
    priority: "urgent",
    productionStage: "Antrian Cetak",
    branchId: "BR-SBY-PUSAT",
    createdAt: new Date().toISOString(),
    deadlineAt: deadline.toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "Simulasi SPK baru dari display produksi",
    files: [],
    timeline: [
      { at: new Date().toISOString(), status: "created", user: "Display Produksi", note: "SPK simulasi masuk" },
    ],
  };

  window.APP_DATA.orders.unshift(order);
  persistStoredOrders();
  const text = `Pesanan baru: ${order.productName} — deadline ${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(deadline)}`;
  renderProductionDisplay(`🔔 ${text}`);
  speakProduction(`Pesanan baru masuk: ${order.productName}, deadline ${new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(deadline)}`);

  clearTimeout(APP_STATE.productionDisplayNotificationTimer);
  APP_STATE.productionDisplayNotificationTimer = window.setTimeout(() => {
    renderProductionDisplay();
  }, 5000);
}

function speakProduction(text) {
  if (APP_STATE.audioMuted || !APP_STATE.audioEnabled || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "id-ID";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function handleProductionDisplayStorage(event) {
  if (event.key === "printeoo:orders" && APP_STATE.currentRoute === "display-production") {
    loadStoredOrders();
    renderProductionDisplay();
  }
}

function enableProductionAudio() {
  APP_STATE.audioEnabled = true;
  renderProductionDisplay();
  speakProduction("Audio notifikasi produksi aktif");
}

function initQueueDisplay() {
  clearInterval(APP_STATE.queueDisplayTimer);
  clearInterval(APP_STATE.queueDisplayClockTimer);
  loadQueueState();
  APP_STATE.lastQueueSignature = getQueueSignature();
  renderQueueDisplay();
  APP_STATE.queueDisplayTimer = window.setInterval(pollQueueDisplay, 500);
  APP_STATE.queueDisplayClockTimer = window.setInterval(updateQueueDisplayClock, 1000);
}

function renderQueueDisplay(animate = false) {
  const root = document.getElementById("queue-display-root");
  const queue = window.APP_DATA?.queueNumbers;
  if (!root || !queue) return;

  const branch = (window.APP_DATA?.branches || []).find((item) => item.id === queue.branchId) || window.APP_DATA?.branches?.[0];
  root.innerHTML = `
    <div class="queue-display-shell">
      <header class="queue-display-header">
        <div>
          <strong>${window.APP_DATA?.tenant?.name || "Printeoo"}</strong>
          <span>${branch?.name || APP_STATE.currentBranch}</span>
        </div>
        <time id="queue-display-clock"></time>
      </header>

      <main class="queue-now-grid">
        ${queue.current.map((counter) => `
          <article class="queue-now-card ${animate ? "queue-number-animate" : ""}">
            <span>SEDANG DILAYANI</span>
            <strong>${counter.number || "-"}</strong>
            <p>Counter ${counter.counter}</p>
          </article>
        `).join("")}
      </main>

      <section class="queue-display-waiting">
        <h2>Antrian Menunggu</h2>
        <div class="queue-display-numbers">
          ${queue.waiting.length ? queue.waiting.slice(0, 12).map((item) => `<span>${item.number}</span>`).join("") : "<span>Tidak ada antrian</span>"}
        </div>
      </section>

      <footer class="queue-running-text">
        <div>${queue.runningText || "Printeoo siap bantu cetak cepat, rapi, dan tepat deadline."}</div>
      </footer>

      ${APP_STATE.audioEnabled ? "" : `
        <div class="audio-overlay light" data-action="enable-queue-audio">
          <div>Ketuk layar untuk mengaktifkan audio antrian</div>
        </div>
      `}
    </div>
  `;
  updateQueueDisplayClock();
}

function pollQueueDisplay() {
  loadQueueState();
  const nextSignature = getQueueSignature();
  if (nextSignature !== APP_STATE.lastQueueSignature) {
    const changed = getChangedCounter(APP_STATE.lastQueueSignature, nextSignature);
    APP_STATE.lastQueueSignature = nextSignature;
    renderQueueDisplay(true);
    if (changed) {
      speakQueue(`Nomor ${changed.number}, silakan ke Counter ${changed.counter}`);
    }
  }
}

function getQueueSignature() {
  const queue = window.APP_DATA?.queueNumbers;
  if (!queue) return "";
  return queue.current.map((counter) => `${counter.counter}:${counter.number}:${counter.calledAt}`).join("|");
}

function getChangedCounter(previousSignature, nextSignature) {
  const previous = new Map(previousSignature.split("|").filter(Boolean).map((part) => {
    const [counter, number, calledAt] = part.split(":");
    return [counter, `${number}:${calledAt}`];
  }));
  const queue = window.APP_DATA?.queueNumbers;
  return queue?.current.find((counter) => previous.get(String(counter.counter)) !== `${counter.number}:${counter.calledAt}`);
}

function updateQueueDisplayClock() {
  const clock = document.getElementById("queue-display-clock");
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

function speakQueue(text) {
  if (APP_STATE.audioMuted || !APP_STATE.audioEnabled || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "id-ID";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

function enableQueueAudio() {
  APP_STATE.audioEnabled = true;
  renderQueueDisplay();
  speakQueue("Audio antrian aktif");
}

function renderInventoryPage(activeTab = "stok") {
  const alertEl = document.getElementById("inventory-alert");
  const tabContent = document.getElementById("inventory-tab-content");
  if (!alertEl || !tabContent) return;

  const inventory = window.APP_DATA?.inventory || [];

  document.querySelectorAll("[data-inv-tab]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.invTab === activeTab);
  });

  const lowStock = inventory.filter((item) => item.stock <= item.minStock);
  alertEl.innerHTML = lowStock.length
    ? `<div class="dashboard-alert"><strong>${lowStock.length} bahan menipis.</strong> <span>Segera lakukan pembelian.</span></div>`
    : "";

  if (activeTab === "stok") {
    tabContent.innerHTML = renderInventoryStokTab(inventory);
  } else if (activeTab === "incoming") {
    tabContent.innerHTML = renderInventoryIncomingTab();
  } else if (activeTab === "opname") {
    tabContent.innerHTML = renderInventoryOpnameTab();
  } else if (activeTab === "usage") {
    tabContent.innerHTML = renderInventoryUsageTab(APP_STATE.usagePeriod);
  } else if (activeTab === "waste") {
    tabContent.innerHTML = renderInventoryWasteTab(APP_STATE.wastePeriod);
  }
}

function renderInventoryStokTab(inventory) {
  return `
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Nama Bahan</th>
            <th>Kategori</th>
            <th>Stok</th>
            <th>Satuan</th>
            <th>Min. Stok</th>
            <th>Status</th>
            <th style="width:56px">QR</th>
          </tr>
        </thead>
        <tbody>
          ${inventory.map((item) => {
            const status = getInventoryStatus(item);
            return `
              <tr>
                <td><strong>${item.name}</strong><div class="text-xs text-muted">${item.supplier}</div></td>
                <td>${item.category}</td>
                <td><strong>${item.stock}</strong></td>
                <td>${item.unit}</td>
                <td>${item.minStock}</td>
                <td><span class="badge ${status.className}">${status.label}</span></td>
                <td>
                  <button class="btn-icon-qr" type="button" title="Cetak Label QR"
                    data-action="open-qr-label" data-item-id="${item.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3z"/><path d="M17 17h3v3h-3z"/><path d="M14 20h3"/><path d="M20 14v3"/></svg>
                  </button>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderInventoryIncomingTab() {
  const log = [...(window.APP_DATA?.incomingLog || [])].sort(
    (a, b) => new Date(b.receivedDate) - new Date(a.receivedDate)
  );

  if (!log.length) {
    return `<div class="card empty-state"><p class="text-muted">Belum ada penerimaan dicatat.</p></div>`;
  }

  return `
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Bahan</th>
            <th>Qty</th>
            <th>Batch ID</th>
            <th>Supplier</th>
            <th>Harga/Satuan</th>
            <th>Total</th>
            <th>Dicatat Oleh</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${log.map((entry) => `
            <tr>
              <td>${formatDate(new Date(entry.receivedDate))}</td>
              <td><strong>${entry.itemName}</strong></td>
              <td>${entry.qty} ${entry.unit}</td>
              <td><code class="text-xs text-muted">${entry.batchId}</code></td>
              <td>${entry.supplier}</td>
              <td>${formatCurrency(entry.pricePerUnit)}</td>
              <td><strong>${formatCurrency(entry.totalPrice)}</strong></td>
              <td>${entry.receivedBy}</td>
              <td><button class="btn-secondary text-xs" type="button"
                data-action="open-qr-label-batch"
                data-item-id="${entry.itemId}"
                data-batch-id="${entry.batchId}"
                data-item-name="${entry.itemName}"
                data-qty="${entry.qty}"
                data-unit="${entry.unit}"
                data-date="${entry.receivedDate}">Label QR</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function openIncomingModal() {
  const root = document.getElementById("inventory-modal-root");
  if (!root) return;

  const inventory = window.APP_DATA?.inventory || [];
  const suppliers = [...new Set(inventory.map((i) => i.supplier))];
  const today = new Date().toISOString().split("T")[0];

  root.innerHTML = `
    <div class="modal-overlay" id="incoming-modal">
      <div class="modal-box" style="max-width:560px">
        <div class="modal-header">
          <h2 class="modal-title">Catat Penerimaan Barang</h2>
          <button class="modal-close" type="button" data-action="close-incoming-modal" aria-label="Tutup">×</button>
        </div>
        <form id="incoming-form" novalidate>
          <div class="modal-form">
            <div class="form-group">
              <label class="form-label" for="incoming-item">Bahan *</label>
              <select class="form-select" id="incoming-item" name="itemId" required>
                <option value="">-- Pilih Bahan --</option>
                ${inventory.map((item) => `
                  <option value="${item.id}"
                    data-unit="${item.unit}"
                    data-supplier="${item.supplier}"
                    data-stock="${item.stock}">
                    ${item.name} (stok: ${item.stock} ${item.unit})
                  </option>
                `).join("")}
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="incoming-qty">Qty Diterima *</label>
                <input class="form-input" id="incoming-qty" name="qty" type="number" min="0.01" step="0.01" required placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label" for="incoming-unit">Satuan</label>
                <input class="form-input" id="incoming-unit" type="text" readonly placeholder="(auto-fill)">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="incoming-batch">Nomor Batch *</label>
              <input class="form-input" id="incoming-batch" name="batchId" type="text" required placeholder="BATCH-YYYYMMDD-001">
            </div>
            <div class="form-group">
              <label class="form-label" for="incoming-supplier">Supplier *</label>
              <input class="form-input" id="incoming-supplier" name="supplier" type="text" required list="incoming-supplier-list" placeholder="Nama supplier">
              <datalist id="incoming-supplier-list">
                ${suppliers.map((s) => `<option value="${s}">`).join("")}
              </datalist>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="incoming-price">Harga/Satuan (Rp) *</label>
                <input class="form-input" id="incoming-price" name="pricePerUnit" type="number" min="0" required placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label" for="incoming-date">Tanggal Terima *</label>
                <input class="form-input" id="incoming-date" name="receivedDate" type="date" value="${today}" required>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="incoming-notes">Catatan</label>
              <textarea class="form-input" id="incoming-notes" name="notes" rows="2" placeholder="Kondisi barang, keterangan lain (opsional)"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" type="button" data-action="close-incoming-modal">Batal</button>
            <button class="btn-primary" type="submit">Simpan Penerimaan</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById("incoming-batch").value = generateBatchId();

  document.getElementById("incoming-item").addEventListener("change", (e) => {
    const opt = e.target.selectedOptions[0];
    if (opt && opt.value) {
      document.getElementById("incoming-unit").value = opt.dataset.unit || "";
      if (!document.getElementById("incoming-supplier").value) {
        document.getElementById("incoming-supplier").value = opt.dataset.supplier || "";
      }
    } else {
      document.getElementById("incoming-unit").value = "";
    }
  });
}

function generateBatchId() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const seq = String((window.APP_DATA?.incomingLog?.length || 0) + 1).padStart(3, "0");
  return `BATCH-${date}-${seq}`;
}

function submitIncomingForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());

  if (!data.itemId || !data.qty || !data.batchId || !data.supplier || !data.receivedDate) {
    showToast("Mohon lengkapi semua field wajib.", "error");
    return;
  }

  const inventory = window.APP_DATA?.inventory || [];
  const item = inventory.find((i) => i.id === data.itemId);
  if (!item) return;

  const qty = parseFloat(data.qty);
  const pricePerUnit = parseFloat(data.pricePerUnit) || 0;

  item.stock = Math.round((item.stock + qty) * 100) / 100;
  if (item.stock > item.minStock) item.status = "safe";

  if (!window.APP_DATA.incomingLog) window.APP_DATA.incomingLog = [];
  const entry = {
    id: `INC-${String(window.APP_DATA.incomingLog.length + 1).padStart(3, "0")}`,
    itemId: data.itemId,
    itemName: item.name,
    batchId: data.batchId,
    qty,
    unit: item.unit,
    supplier: data.supplier,
    pricePerUnit,
    totalPrice: qty * pricePerUnit,
    receivedDate: new Date(data.receivedDate).toISOString(),
    receivedBy: APP_STATE.currentUser.name,
    notes: data.notes || "",
  };
  window.APP_DATA.incomingLog.push(entry);

  localStorage.setItem("printeoo:incoming_log", JSON.stringify(window.APP_DATA.incomingLog));
  const stockMap = {};
  inventory.forEach((i) => { stockMap[i.id] = i.stock; });
  localStorage.setItem("printeoo:inventory_stocks", JSON.stringify(stockMap));

  const root = document.getElementById("inventory-modal-root");
  if (root) root.innerHTML = "";

  showToast(`Penerimaan dicatat. Stok ${item.name} bertambah ${qty} ${item.unit}.`, "success");
  renderInventoryPage("incoming");
}

function getInventoryStatus(item) {
  if (item.stock <= 0) return { label: "Habis", className: "badge-overdue" };
  if (item.stock <= item.minStock) return { label: "Menipis", className: "badge-urgent" };
  return { label: "Aman", className: "badge-ready" };
}

function openQrLabelModal(itemId, prefillBatchId = null) {
  const root = document.getElementById("inventory-modal-root") || document.getElementById("global-modal-root");
  if (!root) return;

  const inventory = window.APP_DATA?.inventory || [];
  const item = inventory.find((i) => i.id === itemId);
  if (!item) return;

  const batches = (window.APP_DATA?.materialBatches || []).filter((b) => b.materialId === itemId);
  const incomingEntries = (window.APP_DATA?.incomingLog || []).filter((e) => e.itemId === itemId);

  // Build batch options: prefer materialBatches, fallback to incomingLog entries
  const batchOptions = batches.length
    ? batches.map((b) => ({ batchId: b.batchNumber, qty: b.initialQty, date: b.receivedAt }))
    : incomingEntries.slice(0, 5).map((e) => ({ batchId: e.batchId, qty: e.qty, date: e.receivedDate }));

  if (!batchOptions.length) {
    batchOptions.push({ batchId: `BATCH-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-001`, qty: item.stock, date: new Date().toISOString() });
  }

  const selectedBatch = batchOptions.find((b) => b.batchId === prefillBatchId) || batchOptions[0];

  root.innerHTML = `
    <div class="modal-overlay" id="qr-label-modal">
      <div class="modal-box" style="max-width:520px">
        <div class="modal-header">
          <h2 class="modal-title">Label QR Bahan</h2>
          <button class="modal-close" type="button" data-action="close-inventory-modal">×</button>
        </div>
        <div class="modal-form">
          ${batchOptions.length > 1 ? `
            <div class="form-group">
              <label class="form-label">Pilih Batch</label>
              <select class="form-select" id="qr-batch-select">
                ${batchOptions.map((b) => `
                  <option value="${b.batchId}" data-qty="${b.qty}" data-date="${b.date}"
                    ${b.batchId === selectedBatch.batchId ? "selected" : ""}>
                    ${b.batchId} — ${b.qty} ${item.unit}
                  </option>
                `).join("")}
              </select>
            </div>
          ` : ""}
          <div style="display:flex;justify-content:center;padding:8px 0">
            <div class="qr-label-sticker" id="qr-label-print-area">
              <div class="qr-label-left">
                <div class="qr-brand">
                  <span class="qr-brand-mark">P</span>
                  <span class="qr-brand-name">PRINTEOO</span>
                </div>
                <div id="qr-code-render" style="width:80px;height:80px"></div>
              </div>
              <div class="qr-label-right">
                <div class="qr-item-name">${item.name}</div>
                <div class="qr-detail">Batch: <strong id="qr-batch-display">${selectedBatch.batchId.replace("BATCH-","").replace(/-/g," ").trim()}</strong></div>
                <div class="qr-detail">Masuk: <strong>${formatDate(new Date(selectedBatch.date))}</strong></div>
                <div class="qr-detail qty">
                  <strong id="qr-qty-display">${selectedBatch.qty}</strong> ${item.unit}
                </div>
              </div>
            </div>
          </div>
          <p class="text-muted text-xs" style="text-align:center;margin-top:4px">
            Scan QR untuk akses info batch di sistem Printeoo
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" type="button" data-action="close-inventory-modal">Tutup</button>
          <button class="btn-secondary" type="button" data-action="download-qr-png">↓ Download PNG</button>
          <button class="btn-primary" type="button" data-action="print-qr-label">🖨 Cetak Label</button>
        </div>
      </div>
    </div>
  `;

  generateQrCode(
    `printeoo://scan?b=${selectedBatch.batchId}&t=demo&item=${encodeURIComponent(item.name)}`,
    "qr-code-render"
  );

  // Batch selector update
  const batchSelect = document.getElementById("qr-batch-select");
  if (batchSelect) {
    batchSelect.addEventListener("change", (e) => {
      const opt = e.target.selectedOptions[0];
      document.getElementById("qr-batch-display").textContent =
        opt.value.replace("BATCH-","").replace(/-/g," ").trim();
      document.getElementById("qr-qty-display").textContent = opt.dataset.qty;
      generateQrCode(
        `printeoo://scan?b=${opt.value}&t=demo&item=${encodeURIComponent(item.name)}`,
        "qr-code-render"
      );
    });
  }
}

function generateQrCode(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  if (window.QRCode) {
    new window.QRCode(container, {
      text: data,
      width: 80,
      height: 80,
      colorDark: "#111827",
      colorLight: "#ffffff",
      correctLevel: window.QRCode.CorrectLevel.M,
    });
  } else {
    // Fallback: show encoded text in small box
    container.innerHTML = `<div style="width:80px;height:80px;background:#F3F4F6;display:flex;align-items:center;justify-content:center;font-size:8px;color:#6B7280;text-align:center;word-break:break-all;padding:4px">${data.slice(0,40)}</div>`;
  }
}

function downloadQrPng() {
  const canvas = document.querySelector("#qr-code-render canvas");
  if (!canvas) {
    showToast("QR code belum termuat. Coba lagi sebentar.", "error");
    return;
  }
  const batchDisplay = document.getElementById("qr-batch-display");
  const filename = `qr-${(batchDisplay?.textContent || "label").replace(/\s+/g, "-")}.png`;
  canvas.toBlob((blob) => {
    if (!blob) { showToast("Gagal download.", "error"); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });
}

function openQrScanModal() {
  const root = document.getElementById("global-modal-root") || document.getElementById("inventory-modal-root");
  if (!root) return;

  const dummyBatches = [
    { batchId: "BCH-FLX340-2605-001", itemId: "MAT-001", itemName: "Flexi China 340gr", qty: 8, unit: "roll" },
    { batchId: "BCH-FLX440-2605-002", itemId: "MAT-002", itemName: "Flexi Korea 440gr", qty: 4, unit: "roll" },
    { batchId: "BCH-INKM-2605-003", itemId: "MAT-007", itemName: "Tinta Magenta Epson", qty: 2, unit: "liter" },
  ];

  root.innerHTML = `
    <div class="modal-overlay" id="qr-scan-modal">
      <div class="modal-box" style="max-width:440px">
        <div class="modal-header">
          <h2 class="modal-title">📷 Scan QR Bahan</h2>
          <button class="modal-close" type="button" data-action="close-inventory-modal">×</button>
        </div>
        <div class="modal-form">
          <div style="background:#0F172A;border-radius:8px;width:100%;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;margin-bottom:4px;position:relative;overflow:hidden">
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
              <div style="width:160px;height:160px;border:3px solid #2563EB;border-radius:8px;position:relative">
                <div style="position:absolute;top:-3px;left:-3px;width:24px;height:24px;border-top:4px solid #60A5FA;border-left:4px solid #60A5FA;border-radius:3px 0 0 0"></div>
                <div style="position:absolute;top:-3px;right:-3px;width:24px;height:24px;border-top:4px solid #60A5FA;border-right:4px solid #60A5FA;border-radius:0 3px 0 0"></div>
                <div style="position:absolute;bottom:-3px;left:-3px;width:24px;height:24px;border-bottom:4px solid #60A5FA;border-left:4px solid #60A5FA;border-radius:0 0 0 3px"></div>
                <div style="position:absolute;bottom:-3px;right:-3px;width:24px;height:24px;border-bottom:4px solid #60A5FA;border-right:4px solid #60A5FA;border-radius:0 0 3px 0"></div>
                <div style="position:absolute;top:50%;left:0;right:0;height:2px;background:rgba(96,165,250,0.5);transform:translateY(-50%)"></div>
              </div>
              <span style="color:#94A3B8;font-size:13px">Arahkan kamera ke QR code</span>
            </div>
          </div>
          <p class="text-muted text-xs" style="text-align:center">Kamera membutuhkan izin browser. Gunakan simulasi di bawah untuk demo.</p>

          <div style="border-top:1px solid var(--neutral-200);padding-top:16px;margin-top:4px">
            <p class="form-label" style="margin-bottom:8px">Masukkan Batch ID Manual</p>
            <div style="display:flex;gap:8px">
              <input class="form-input" id="qr-manual-batch" type="text" placeholder="BCH-FLX340-..." style="flex:1">
              <button class="btn-secondary" type="button" data-action="lookup-batch-manual">Cari</button>
            </div>
          </div>

          <div style="background:var(--primary-light);border:1px solid #BFDBFE;border-radius:8px;padding:14px">
            <p class="form-label" style="margin-bottom:10px;color:#1D4ED8">🎯 Simulasi Scan — Demo</p>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${dummyBatches.map((b) => `
                <button class="btn-secondary" type="button" style="text-align:left;font-size:13px"
                  data-action="simulate-qr-scan"
                  data-batch-id="${b.batchId}"
                  data-item-id="${b.itemId}"
                  data-item-name="${b.itemName}"
                  data-qty="${b.qty}"
                  data-unit="${b.unit}">
                  <code style="font-size:11px;color:#1D4ED8">${b.batchId}</code>
                  <span class="text-muted"> — ${b.itemName}</span>
                </button>
              `).join("")}
            </div>
          </div>
        </div>
        <div id="qr-scan-result" style="display:none;padding:12px 20px;background:#D1FAE5;border-top:1px solid #6EE7B7">
          <p style="font-size:13px;color:#065F46;font-weight:600">✓ Batch ditemukan:</p>
          <p id="qr-scan-result-text" style="font-size:14px;margin-top:4px"></p>
        </div>
      </div>
    </div>
  `;
}

function renderInventoryOpnameTab() {
  const sessions = [...(window.APP_DATA?.opnameSessions || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const rows = sessions.length
    ? sessions.map((s) => {
        const hasDiff = s.items.some((i) => i.diff !== 0);
        return `
          <tr>
            <td><strong>${s.name}</strong></td>
            <td>${formatDate(new Date(s.date))}</td>
            <td>${s.createdBy}</td>
            <td>${s.items.length} bahan</td>
            <td><span class="badge ${hasDiff ? "badge-urgent" : "badge-ready"}">${hasDiff ? "Ada Selisih" : "Sesuai"}</span></td>
            <td><span class="badge badge-confirmed">Disetujui</span></td>
            <td><button class="btn-secondary text-xs" type="button" data-action="view-opname-detail" data-opname-id="${s.id}">Lihat Detail</button></td>
          </tr>
        `;
      }).join("")
    : `<tr><td colspan="7" class="text-center text-muted" style="padding:24px">Belum ada sesi opname.</td></tr>`;

  return `
    <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
      <button class="btn-primary" type="button" data-action="start-opname-wizard">+ Mulai Opname Baru</button>
    </div>
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Nama Sesi</th>
            <th>Tanggal</th>
            <th>Dibuat Oleh</th>
            <th>Jumlah Item</th>
            <th>Hasil</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderOpnameSessionDetail(id) {
  const session = (window.APP_DATA?.opnameSessions || []).find((s) => s.id === id);
  if (!session) return;

  const tabContent = document.getElementById("inventory-tab-content");
  if (!tabContent) return;

  const diffItems = session.items.filter((i) => i.diff !== 0);
  const allRows = session.items.map((item) => {
    const diffClass = item.diff < 0 ? "color:#DC2626" : item.diff > 0 ? "color:#D97706" : "color:#16A34A";
    const diffLabel = item.diff === 0 ? "0" : (item.diff > 0 ? `+${item.diff}` : `${item.diff}`);
    return `
      <tr>
        <td><strong>${item.itemName}</strong></td>
        <td>${item.unit}</td>
        <td>${item.systemStock}</td>
        <td>${item.physicalStock}</td>
        <td style="${diffClass}"><strong>${diffLabel}</strong></td>
      </tr>
    `;
  }).join("");

  tabContent.innerHTML = `
    <div class="card mb-4">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div>
          <h2 style="font-size:18px;font-weight:600;margin:0">${session.name}</h2>
          <p class="text-muted text-sm" style="margin:4px 0 0">${formatDate(new Date(session.date))} &bull; ${session.createdBy}</p>
        </div>
        <button class="btn-secondary" type="button" data-action="back-to-opname-list">← Kembali</button>
      </div>
      ${session.notes ? `<p class="text-sm text-muted" style="margin-bottom:8px"><em>Catatan: ${session.notes}</em></p>` : ""}
      ${session.reason ? `<div style="background:#FEF9C3;border:1px solid #FDE047;border-radius:6px;padding:10px 14px;margin-bottom:12px;font-size:13px"><strong>Alasan penyesuaian:</strong> ${session.reason}</div>` : ""}
      <div style="display:flex;gap:16px;margin-bottom:16px">
        <div class="card" style="flex:1;text-align:center;padding:16px">
          <div style="font-size:24px;font-weight:700">${session.items.length}</div>
          <div class="text-muted text-xs">Total Item</div>
        </div>
        <div class="card" style="flex:1;text-align:center;padding:16px">
          <div style="font-size:24px;font-weight:700;color:#16A34A">${session.items.length - diffItems.length}</div>
          <div class="text-muted text-xs">Item Sesuai</div>
        </div>
        <div class="card" style="flex:1;text-align:center;padding:16px">
          <div style="font-size:24px;font-weight:700;color:#DC2626">${diffItems.length}</div>
          <div class="text-muted text-xs">Item Selisih</div>
        </div>
      </div>
    </div>
    <div class="data-table">
      <table>
        <thead>
          <tr><th>Bahan</th><th>Satuan</th><th>Stok Sistem</th><th>Stok Fisik</th><th>Selisih</th></tr>
        </thead>
        <tbody>${allRows}</tbody>
      </table>
    </div>
  `;
}

function startOpnameWizard() {
  const tabContent = document.getElementById("inventory-tab-content");
  if (!tabContent) return;

  document.querySelectorAll("[data-inv-tab]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.invTab === "opname");
  });

  APP_STATE.currentOpnameSession = null;
  renderOpnameStep1();
}

function renderOpnameStep1() {
  const tabContent = document.getElementById("inventory-tab-content");
  if (!tabContent) return;

  const today = new Date().toISOString().split("T")[0];

  tabContent.innerHTML = `
    <div class="card" style="max-width:560px;margin:0 auto">
      <div style="margin-bottom:20px">
        <div style="display:flex;gap:8px;margin-bottom:16px">
          <span style="background:#2563EB;color:#fff;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">1</span>
          <span style="background:#E5E7EB;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">2</span>
          <span style="background:#E5E7EB;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">3</span>
          <span class="text-muted text-sm" style="line-height:24px">Langkah 1 dari 3 — Buat Sesi Opname</span>
        </div>
        <h2 style="font-size:18px;font-weight:600;margin:0 0 4px">Mulai Stok Opname</h2>
        <p class="text-muted text-sm">Isi informasi sesi opname, lalu hitung stok fisik semua bahan.</p>
      </div>
      <form id="opname-step1-form" novalidate>
        <div class="form-group">
          <label class="form-label" for="opname-name">Nama Sesi *</label>
          <input class="form-input" id="opname-name" name="name" type="text" required
            placeholder="cth: Opname Akhir Mei 2026" value="Opname ${new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}">
        </div>
        <div class="form-group">
          <label class="form-label" for="opname-date">Tanggal Opname *</label>
          <input class="form-input" id="opname-date" name="date" type="date" value="${today}" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="opname-notes">Catatan (opsional)</label>
          <textarea class="form-input" id="opname-notes" name="notes" rows="2" placeholder="Konteks atau keterangan tambahan"></textarea>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px">
          <button class="btn-secondary" type="button" data-action="back-to-opname-list">Batal</button>
          <button class="btn-primary" type="submit">Lanjut: Input Stok Fisik →</button>
        </div>
      </form>
    </div>
  `;
}

function submitOpnameStep1(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.name || !data.date) {
    showToast("Nama sesi dan tanggal wajib diisi.", "error");
    return;
  }

  const sessions = window.APP_DATA?.opnameSessions || [];
  const id = `OPN-${String(sessions.length + 1).padStart(3, "0")}`;

  const inventory = window.APP_DATA?.inventory || [];
  APP_STATE.currentOpnameSession = {
    id,
    name: data.name,
    date: new Date(data.date).toISOString(),
    notes: data.notes || "",
    createdBy: APP_STATE.currentUser.name,
    step: 2,
    items: inventory.map((item) => ({
      itemId: item.id,
      itemName: item.name,
      unit: item.unit,
      systemStock: item.stock,
      physicalStock: null,
      diff: 0,
    })),
  };

  renderOpnameStep2();
}

function renderOpnameStep2() {
  const tabContent = document.getElementById("inventory-tab-content");
  if (!tabContent || !APP_STATE.currentOpnameSession) return;

  const session = APP_STATE.currentOpnameSession;
  const draft = loadOpnameDraft(session.id);

  const rows = session.items.map((item) => {
    const savedPhysical = draft ? draft[item.itemId] : null;
    const displayPhysical = savedPhysical !== null && savedPhysical !== undefined ? savedPhysical : "";
    const diff = savedPhysical !== null && savedPhysical !== undefined ? (savedPhysical - item.systemStock) : null;
    const diffLabel = diff === null ? "" : diff === 0 ? "0" : diff > 0 ? `+${diff}` : `${diff}`;
    const diffStyle = diff === null ? "" : diff === 0 ? "color:#16A34A;font-weight:600" : diff > 0 ? "color:#D97706;font-weight:600" : "color:#DC2626;font-weight:600";

    return `
      <tr>
        <td><strong>${item.itemName}</strong></td>
        <td>${item.unit}</td>
        <td>${item.systemStock}</td>
        <td>
          <input class="form-input opname-physical-input" type="number" min="0" step="0.01"
            style="width:90px;padding:4px 8px"
            data-item-id="${item.itemId}"
            data-system-stock="${item.systemStock}"
            value="${displayPhysical}"
            placeholder="0">
        </td>
        <td class="opname-diff-cell" data-diff-for="${item.itemId}" style="${diffStyle}">${diffLabel}</td>
      </tr>
    `;
  }).join("");

  tabContent.innerHTML = `
    <div style="margin-bottom:16px;display:flex;align-items:center;gap:8px">
      <span style="background:#E5E7EB;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">1</span>
      <span style="background:#2563EB;color:#fff;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">2</span>
      <span style="background:#E5E7EB;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">3</span>
      <span class="text-muted text-sm" style="line-height:24px">Langkah 2 dari 3 — Input Stok Fisik</span>
    </div>
    <div class="card mb-4" style="padding:12px 16px">
      <strong>${session.name}</strong>
      <span class="text-muted text-sm" style="margin-left:12px">${formatDate(new Date(session.date))}</span>
    </div>
    <div class="data-table" style="margin-bottom:16px">
      <table>
        <thead>
          <tr>
            <th>Bahan</th>
            <th>Satuan</th>
            <th>Stok Sistem</th>
            <th>Stok Fisik (input)</th>
            <th>Selisih</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button class="btn-secondary" type="button" data-action="back-to-opname-list">Batal</button>
      <button class="btn-secondary" type="button" data-action="save-opname-draft">Simpan Draft</button>
      <button class="btn-primary" type="button" data-action="proceed-opname-review">Lanjut: Review & Setujui →</button>
    </div>
  `;
}

function loadOpnameDraft(sessionId) {
  try {
    const raw = localStorage.getItem(`printeoo:opname_draft:${sessionId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveOpnameDraft() {
  if (!APP_STATE.currentOpnameSession) return;
  const session = APP_STATE.currentOpnameSession;
  const draft = {};
  document.querySelectorAll(".opname-physical-input").forEach((input) => {
    const val = input.value;
    if (val !== "") draft[input.dataset.itemId] = parseFloat(val);
  });
  localStorage.setItem(`printeoo:opname_draft:${session.id}`, JSON.stringify(draft));
  showToast("Draft tersimpan.", "success");
}

function proceedOpnameToReview() {
  if (!APP_STATE.currentOpnameSession) return;
  const session = APP_STATE.currentOpnameSession;

  session.items.forEach((item) => {
    const input = document.querySelector(`.opname-physical-input[data-item-id="${item.itemId}"]`);
    if (input && input.value !== "") {
      item.physicalStock = parseFloat(input.value);
      item.diff = Math.round((item.physicalStock - item.systemStock) * 1000) / 1000;
    } else {
      item.physicalStock = item.systemStock;
      item.diff = 0;
    }
  });

  session.step = 3;
  renderOpnameStep3();
}

function renderOpnameStep3() {
  const tabContent = document.getElementById("inventory-tab-content");
  if (!tabContent || !APP_STATE.currentOpnameSession) return;

  const session = APP_STATE.currentOpnameSession;
  const diffItems = session.items.filter((i) => i.diff !== 0);
  const allMatch = diffItems.length === 0;

  const diffRows = session.items.map((item) => {
    const diffLabel = item.diff === 0 ? "0" : item.diff > 0 ? `+${item.diff}` : `${item.diff}`;
    const diffStyle = item.diff < 0 ? "color:#DC2626;font-weight:600" : item.diff > 0 ? "color:#D97706;font-weight:600" : "color:#16A34A;font-weight:600";
    const rowBg = item.diff !== 0 ? "background:#FFF5F5" : "";
    return `
      <tr style="${rowBg}">
        <td><strong>${item.itemName}</strong></td>
        <td>${item.unit}</td>
        <td>${item.systemStock}</td>
        <td>${item.physicalStock}</td>
        <td style="${diffStyle}">${diffLabel}</td>
      </tr>
    `;
  }).join("");

  tabContent.innerHTML = `
    <div style="margin-bottom:16px;display:flex;align-items:center;gap:8px">
      <span style="background:#E5E7EB;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">1</span>
      <span style="background:#E5E7EB;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">2</span>
      <span style="background:#2563EB;color:#fff;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">3</span>
      <span class="text-muted text-sm" style="line-height:24px">Langkah 3 dari 3 — Review & Setujui</span>
    </div>
    <div class="card mb-4" style="padding:12px 16px;display:flex;gap:24px;align-items:center">
      <div><strong>${session.name}</strong><span class="text-muted text-sm" style="margin-left:8px">${formatDate(new Date(session.date))}</span></div>
      <div style="display:flex;gap:16px;margin-left:auto">
        <span style="font-size:13px"><span style="color:#16A34A;font-weight:600">${session.items.length - diffItems.length}</span> item sesuai</span>
        <span style="font-size:13px"><span style="color:#DC2626;font-weight:600">${diffItems.length}</span> item selisih</span>
      </div>
    </div>
    ${diffItems.length ? `<div style="background:#FEE2E2;border:1px solid #FCA5A5;border-radius:6px;padding:10px 14px;margin-bottom:12px;font-size:13px">⚠️ Ditemukan <strong>${diffItems.length} item</strong> dengan selisih stok. Stok sistem akan disesuaikan ke stok fisik setelah disetujui.</div>` : `<div style="background:#D1FAE5;border:1px solid #6EE7B7;border-radius:6px;padding:10px 14px;margin-bottom:12px;font-size:13px">✓ Semua stok fisik sesuai dengan sistem. Tidak ada penyesuaian diperlukan.</div>`}
    <div class="data-table" style="margin-bottom:16px">
      <table>
        <thead>
          <tr><th>Bahan</th><th>Satuan</th><th>Stok Sistem</th><th>Stok Fisik</th><th>Selisih</th></tr>
        </thead>
        <tbody>${diffRows}</tbody>
      </table>
    </div>
    <div class="card" style="padding:16px;margin-bottom:16px">
      <label class="form-label" for="opname-reason">Alasan Penyesuaian ${allMatch ? "(opsional)" : "*"}</label>
      <textarea class="form-input" id="opname-reason" rows="2" placeholder="cth: Selisih akibat sisa cutting yang belum dicatat, atau kehilangan minor"></textarea>
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button class="btn-secondary" type="button" data-action="back-to-opname-step2">← Kembali</button>
      <button class="btn-primary" type="button" data-action="approve-opname">Setujui & Simpan Opname</button>
    </div>
  `;
}

function approveOpname() {
  if (!APP_STATE.currentOpnameSession) return;
  const session = APP_STATE.currentOpnameSession;
  const reasonInput = document.getElementById("opname-reason");
  const reason = reasonInput ? reasonInput.value.trim() : "";

  const diffItems = session.items.filter((i) => i.diff !== 0);
  if (diffItems.length > 0 && !reason) {
    showToast("Alasan penyesuaian wajib diisi jika ada selisih.", "error");
    return;
  }

  session.reason = reason;
  session.status = "approved";
  session.approvedAt = new Date().toISOString();

  const inventory = window.APP_DATA?.inventory || [];
  if (!window.APP_DATA.adjustmentLog) window.APP_DATA.adjustmentLog = [];
  const sessions = window.APP_DATA?.opnameSessions || [];

  diffItems.forEach((item) => {
    const inv = inventory.find((i) => i.id === item.itemId);
    if (inv) {
      const adjId = `ADJ-${String(window.APP_DATA.adjustmentLog.length + 1).padStart(3, "0")}`;
      window.APP_DATA.adjustmentLog.push({
        id: adjId,
        opnameId: session.id,
        itemId: item.itemId,
        itemName: item.itemName,
        oldStock: item.systemStock,
        newStock: item.physicalStock,
        diff: item.diff,
        unit: item.unit,
        adjustedAt: new Date().toISOString(),
        adjustedBy: APP_STATE.currentUser.name,
      });
      inv.stock = item.physicalStock;
      if (inv.stock <= 0) inv.status = "empty";
      else if (inv.stock <= inv.minStock) inv.status = "low";
      else inv.status = "safe";
    }
  });

  if (!window.APP_DATA.opnameSessions) window.APP_DATA.opnameSessions = [];
  window.APP_DATA.opnameSessions.push(session);

  const stockMap = {};
  inventory.forEach((i) => { stockMap[i.id] = i.stock; });
  localStorage.setItem("printeoo:inventory_stocks", JSON.stringify(stockMap));
  localStorage.setItem("printeoo:opname_sessions", JSON.stringify(window.APP_DATA.opnameSessions));
  localStorage.setItem("printeoo:adjustment_log", JSON.stringify(window.APP_DATA.adjustmentLog));
  localStorage.removeItem(`printeoo:opname_draft:${session.id}`);

  APP_STATE.currentOpnameSession = null;

  showToast(
    diffItems.length
      ? `Opname selesai. ${diffItems.length} item stok disesuaikan.`
      : "Opname selesai. Semua stok sesuai, tidak ada perubahan.",
    "success"
  );
  renderInventoryPage("opname");
}

function getUsagePeriodRange(period) {
  const now = new Date();
  let start, end;

  if (period === "week") {
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0
    start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  } else if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    end = new Date(now);
    end.setHours(23, 59, 59, 999);
  } else if (period === "last_month") {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else {
    start = new Date(0);
    end = new Date();
  }

  return { start, end };
}

function filterUsageByPeriod(period) {
  const { start, end } = getUsagePeriodRange(period);
  return (window.APP_DATA?.usageLog || []).filter((entry) => {
    const d = new Date(entry.usedAt);
    return d >= start && d <= end;
  });
}

function renderInventoryUsageTab(period = "month") {
  const log = filterUsageByPeriod(period);

  const periods = [
    { key: "week", label: "Minggu Ini" },
    { key: "month", label: "Bulan Ini" },
    { key: "last_month", label: "Bulan Lalu" },
    { key: "all", label: "Semua" },
  ];

  const filterBar = `
    <div class="tabs mb-4" style="margin-bottom:16px">
      ${periods.map((p) => `
        <button class="tab-button ${period === p.key ? "active" : ""}" type="button" data-usage-period="${p.key}">${p.label}</button>
      `).join("")}
    </div>
  `;

  const totalUsageValue = log.reduce((sum, e) => sum + e.qtyUsed * e.unitCost, 0);
  const totalWasteValue = log.reduce((sum, e) => sum + e.qtyWaste * e.unitCost, 0);
  const wasteRate = totalUsageValue > 0 ? ((totalWasteValue / (totalUsageValue + totalWasteValue)) * 100).toFixed(1) : 0;

  const metricCards = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--neutral-500);margin-bottom:8px">Total Pemakaian</div>
        <div style="font-size:22px;font-weight:700;color:var(--neutral-900)">${formatCurrency(totalUsageValue)}</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--neutral-500);margin-bottom:8px">Total Waste</div>
        <div style="font-size:22px;font-weight:700;color:var(--warning)">${formatCurrency(totalWasteValue)}</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--neutral-500);margin-bottom:8px">Waste Rate</div>
        <div style="font-size:22px;font-weight:700;color:${wasteRate > 5 ? "var(--danger)" : "var(--success)"}">${wasteRate}%</div>
      </div>
    </div>
  `;

  const summarySection = renderUsageSummaryTable(log);
  const spkSection = renderUsagePerSpkTable(log);
  const chartSection = renderUsageBarChart(log, period);

  return `
    ${filterBar}
    ${log.length === 0 ? `<div class="card empty-state" style="text-align:center;padding:40px"><p class="text-muted">Tidak ada data penggunaan pada periode ini.</p></div>` : `
      ${metricCards}
      <div class="card mb-4" style="margin-bottom:24px">
        <h3 style="font-size:15px;font-weight:600;margin:0 0 16px">Grafik Pemakaian</h3>
        ${chartSection}
      </div>
      <div class="card mb-4" style="margin-bottom:24px">
        <h3 style="font-size:15px;font-weight:600;margin:0 0 16px">Ringkasan per Bahan</h3>
        ${summarySection}
      </div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="font-size:15px;font-weight:600;margin:0">Penggunaan per SPK</h3>
          <select class="form-select" id="usage-material-filter" style="width:200px;padding:6px 10px;font-size:13px">
            <option value="all">Semua Bahan</option>
            ${[...new Set(log.map((e) => e.itemId))].map((id) => {
              const e = log.find((x) => x.itemId === id);
              return `<option value="${id}">${e.itemName}</option>`;
            }).join("")}
          </select>
        </div>
        <div id="usage-spk-table">${spkSection}</div>
      </div>
    `}
  `;
}

function renderUsageSummaryTable(log) {
  const byItem = {};
  log.forEach((e) => {
    if (!byItem[e.itemId]) {
      byItem[e.itemId] = { itemName: e.itemName, unit: e.unit, qtyUsed: 0, qtyWaste: 0, value: 0 };
    }
    byItem[e.itemId].qtyUsed = Math.round((byItem[e.itemId].qtyUsed + e.qtyUsed) * 1000) / 1000;
    byItem[e.itemId].qtyWaste = Math.round((byItem[e.itemId].qtyWaste + e.qtyWaste) * 1000) / 1000;
    byItem[e.itemId].value += e.qtyUsed * e.unitCost;
  });

  const sorted = Object.values(byItem).sort((a, b) => b.value - a.value);

  const rows = sorted.map((item) => {
    const wasteRate = item.qtyUsed > 0 ? ((item.qtyWaste / item.qtyUsed) * 100).toFixed(1) : "0.0";
    const rateColor = parseFloat(wasteRate) > 8 ? "color:#DC2626" : parseFloat(wasteRate) > 4 ? "color:#D97706" : "color:#16A34A";
    return `
      <tr>
        <td><strong>${item.itemName}</strong></td>
        <td>${item.qtyUsed} ${item.unit}</td>
        <td>${item.qtyWaste} ${item.unit}</td>
        <td style="${rateColor}"><strong>${wasteRate}%</strong></td>
        <td><strong>${formatCurrency(item.value)}</strong></td>
      </tr>
    `;
  }).join("");

  return `
    <div class="data-table">
      <table>
        <thead><tr><th>Bahan</th><th>Qty Dipakai</th><th>Qty Waste</th><th>Waste Rate</th><th>Nilai Pemakaian</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderUsagePerSpkTable(log, materialFilter = "all") {
  const filtered = materialFilter === "all" ? log : log.filter((e) => e.itemId === materialFilter);

  const bySpk = {};
  filtered.forEach((e) => {
    if (!bySpk[e.spkNumber]) {
      bySpk[e.spkNumber] = { spkNumber: e.spkNumber, productName: e.productName, usedAt: e.usedAt, items: [], totalQty: 0, totalValue: 0 };
    }
    bySpk[e.spkNumber].items.push(`${e.itemName} (${e.qtyUsed} ${e.unit})`);
    bySpk[e.spkNumber].totalValue += e.qtyUsed * e.unitCost;
  });

  const rows = Object.values(bySpk)
    .sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt))
    .map((spk) => `
      <tr>
        <td><a href="#" onclick="event.preventDefault();window.location.hash='#/order/${spk.spkNumber}'" class="link-primary">${spk.spkNumber}</a></td>
        <td>${spk.productName}</td>
        <td class="text-sm text-muted">${spk.items.slice(0, 2).join(", ")}${spk.items.length > 2 ? ` +${spk.items.length - 2} lainnya` : ""}</td>
        <td><strong>${formatCurrency(spk.totalValue)}</strong></td>
        <td class="text-muted text-sm">${formatDate(new Date(spk.usedAt))}</td>
      </tr>
    `).join("");

  if (!rows) {
    return `<p class="text-muted text-sm" style="padding:16px 0">Tidak ada data untuk filter ini.</p>`;
  }

  return `
    <div class="data-table">
      <table>
        <thead><tr><th>No. SPK</th><th>Produk</th><th>Bahan Dipakai</th><th>Nilai Pemakaian</th><th>Tanggal</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderUsageBarChart(log, period) {
  if (!log.length) return `<p class="text-muted text-sm">Tidak ada data untuk ditampilkan.</p>`;

  const { start } = getUsagePeriodRange(period);
  const isWeek = period === "week";

  // Build date buckets
  const buckets = [];
  const msPerDay = 86400000;

  if (isWeek) {
    for (let i = 0; i < 7; i++) {
      const d = new Date(start.getTime() + i * msPerDay);
      buckets.push({
        label: d.toLocaleDateString("id-ID", { weekday: "short" }),
        date: d,
        usageValue: 0,
        wasteValue: 0,
      });
    }
  } else {
    // Group by week (up to 5 weeks)
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    let weekStart = new Date(start);
    let weekNum = 1;
    while (weekStart < end && weekNum <= 5) {
      const weekEnd = new Date(weekStart.getTime() + 7 * msPerDay);
      buckets.push({
        label: `Mgg ${weekNum}`,
        dateStart: weekStart,
        dateEnd: weekEnd,
        usageValue: 0,
        wasteValue: 0,
      });
      weekStart = new Date(weekEnd);
      weekNum++;
    }
  }

  log.forEach((e) => {
    const d = new Date(e.usedAt);
    if (isWeek) {
      const idx = buckets.findIndex((b) => {
        const bn = new Date(b.date);
        return d >= bn && d < new Date(bn.getTime() + msPerDay);
      });
      if (idx >= 0) {
        buckets[idx].usageValue += e.qtyUsed * e.unitCost;
        buckets[idx].wasteValue += e.qtyWaste * e.unitCost;
      }
    } else {
      const idx = buckets.findIndex((b) => d >= b.dateStart && d < b.dateEnd);
      if (idx >= 0) {
        buckets[idx].usageValue += e.qtyUsed * e.unitCost;
        buckets[idx].wasteValue += e.qtyWaste * e.unitCost;
      }
    }
  });

  const maxVal = Math.max(...buckets.map((b) => b.usageValue), 1);
  const chartW = 600;
  const chartH = 160;
  const padL = 60;
  const padB = 28;
  const barArea = chartW - padL - 16;
  const barWidth = Math.floor(barArea / buckets.length * 0.6);
  const barGap = Math.floor(barArea / buckets.length);

  const bars = buckets.map((b, i) => {
    const x = padL + i * barGap + (barGap - barWidth) / 2;
    const usageH = Math.max((b.usageValue / maxVal) * (chartH - padB - 8), 1);
    const wasteH = Math.max((b.wasteValue / maxVal) * (chartH - padB - 8), 0);
    const yUsage = chartH - padB - usageH;
    const yWaste = chartH - padB - wasteH;
    const labelY = chartH - padB + 14;
    return `
      <rect x="${x}" y="${yUsage}" width="${barWidth}" height="${usageH}" fill="#2563EB" rx="2" opacity="0.85">
        <title>${b.label}: ${formatCurrency(b.usageValue)}</title>
      </rect>
      ${b.wasteValue > 0 ? `<rect x="${x}" y="${yWaste}" width="${barWidth}" height="${wasteH}" fill="#D97706" rx="2" opacity="0.7"><title>Waste: ${formatCurrency(b.wasteValue)}</title></rect>` : ""}
      <text x="${x + barWidth / 2}" y="${labelY}" text-anchor="middle" font-size="10" fill="#6B7280">${b.label}</text>
    `;
  }).join("");

  // Y-axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map((frac) => {
    const val = maxVal * frac;
    const y = chartH - padB - frac * (chartH - padB - 8);
    const label = val >= 1000000 ? `${(val / 1000000).toFixed(1)}jt` : val >= 1000 ? `${(val / 1000).toFixed(0)}rb` : `${Math.round(val)}`;
    return `<text x="${padL - 6}" y="${y + 4}" text-anchor="end" font-size="9" fill="#9CA3AF">${label}</text>
             <line x1="${padL}" y1="${y}" x2="${chartW - 16}" y2="${y}" stroke="#F3F4F6" stroke-width="1"/>`;
  }).join("");

  return `
    <div style="display:flex;gap:16px;align-items:center;margin-bottom:8px;font-size:12px;color:var(--neutral-500)">
      <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;background:#2563EB;border-radius:2px;display:inline-block"></span> Pemakaian</span>
      <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;background:#D97706;border-radius:2px;display:inline-block"></span> Waste</span>
    </div>
    <svg width="100%" viewBox="0 0 ${chartW} ${chartH}" style="overflow:visible">
      ${yLabels}
      ${bars}
      <line x1="${padL}" y1="0" x2="${padL}" y2="${chartH - padB}" stroke="#E5E7EB" stroke-width="1"/>
    </svg>
  `;
}

function openUsageWasteModal(spkNumber) {
  const root = document.getElementById("global-modal-root");
  if (!root) return;

  const inventory = window.APP_DATA?.inventory || [];
  const today = new Date().toISOString().split("T")[0];

  root.innerHTML = `
    <div class="modal-overlay" id="usage-waste-modal">
      <div class="modal-box" style="max-width:520px">
        <div class="modal-header">
          <h2 class="modal-title">Catat Pemakaian Material</h2>
          <button class="modal-close" type="button" data-action="close-inventory-modal">×</button>
        </div>
        <form id="usage-waste-form" novalidate>
          <div class="modal-form">
            <div class="form-group">
              <label class="form-label" for="uw-item">Bahan *</label>
              <select class="form-select" id="uw-item" name="itemId" required>
                <option value="">-- Pilih Bahan --</option>
                ${inventory.map((item) => `
                  <option value="${item.id}" data-unit="${item.unit}" data-stock="${item.stock}" data-cost="${item.avgCost}">
                    ${item.name} (stok: ${item.stock} ${item.unit})
                  </option>
                `).join("")}
              </select>
            </div>
            <div id="uw-stock-warning" style="display:none;background:#FEF3C7;border:1px solid #FDE68A;border-radius:6px;padding:8px 12px;font-size:13px;color:#92400E"></div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="uw-qty-used">Qty Dipakai *</label>
                <input class="form-input" id="uw-qty-used" name="qtyUsed" type="number" min="0.001" step="0.001" required placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label" for="uw-unit">Satuan</label>
                <input class="form-input" id="uw-unit" type="text" readonly placeholder="(auto-fill)">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="uw-qty-waste">Qty Waste</label>
                <input class="form-input" id="uw-qty-waste" name="qtyWaste" type="number" min="0" step="0.001" value="0" placeholder="0">
              </div>
              <div class="form-group">
                <label class="form-label" for="uw-waste-cat">Kategori Waste</label>
                <select class="form-select" id="uw-waste-cat" name="wasteCategory">
                  <option value="">— Tidak ada waste —</option>
                  <option value="misprint">Gagal Cetak</option>
                  <option value="cutting">Trim Sisa</option>
                  <option value="damage">Kerusakan Bahan</option>
                  <option value="calibration">Setup Loss</option>
                  <option value="overflow">Lainnya</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="uw-notes">Catatan (opsional)</label>
              <textarea class="form-input" id="uw-notes" name="notes" rows="2" placeholder="Keterangan tambahan tentang pemakaian atau waste"></textarea>
            </div>
            <input type="hidden" name="spkNumber" value="${spkNumber}">
            <input type="hidden" name="usedAt" value="${today}">
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" type="button" data-action="close-inventory-modal">Batal</button>
            <button class="btn-primary" type="submit">Simpan Pemakaian</button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.getElementById("uw-item").addEventListener("change", (e) => {
    const opt = e.target.selectedOptions[0];
    if (opt?.value) {
      document.getElementById("uw-unit").value = opt.dataset.unit || "";
      checkUsageWasteStock();
    } else {
      document.getElementById("uw-unit").value = "";
    }
  });

  ["uw-qty-used", "uw-qty-waste"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", checkUsageWasteStock);
  });
}

function checkUsageWasteStock() {
  const itemSel = document.getElementById("uw-item");
  const qtyUsed = parseFloat(document.getElementById("uw-qty-used")?.value) || 0;
  const qtyWaste = parseFloat(document.getElementById("uw-qty-waste")?.value) || 0;
  const warning = document.getElementById("uw-stock-warning");
  if (!itemSel?.value || !warning) return;

  const opt = itemSel.selectedOptions[0];
  const stock = parseFloat(opt?.dataset.stock) || 0;
  const unit = opt?.dataset.unit || "";
  const total = qtyUsed + qtyWaste;

  if (total > stock) {
    warning.style.display = "block";
    warning.textContent = `⚠ Total pemakaian (${total} ${unit}) melebihi stok tersedia (${stock} ${unit}). Stok akan menjadi negatif.`;
  } else {
    warning.style.display = "none";
  }
}

function submitUsageWasteForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.itemId || !data.qtyUsed) {
    showToast("Bahan dan qty dipakai wajib diisi.", "error");
    return;
  }

  const inventory = window.APP_DATA?.inventory || [];
  const item = inventory.find((i) => i.id === data.itemId);
  if (!item) return;

  const qtyUsed = parseFloat(data.qtyUsed);
  const qtyWaste = parseFloat(data.qtyWaste) || 0;
  const totalConsumed = qtyUsed + qtyWaste;

  const order = findOrderBySpk(data.spkNumber);
  if (!window.APP_DATA.usageLog) window.APP_DATA.usageLog = [];

  const entry = {
    id: `USE-${String(window.APP_DATA.usageLog.length + 1).padStart(3, "0")}`,
    spkNumber: data.spkNumber,
    productName: order?.productName || "—",
    itemId: data.itemId,
    itemName: item.name,
    unit: item.unit,
    qtyUsed,
    qtyWaste,
    wasteCategory: data.wasteCategory || null,
    unitCost: item.avgCost || 0,
    usedAt: new Date(data.usedAt).toISOString(),
    operatorId: APP_STATE.currentUser?.id || "EMP-001",
    operatorName: APP_STATE.currentUser?.name || "—",
    notes: data.notes || "",
  };

  window.APP_DATA.usageLog.push(entry);

  item.stock = Math.max(Math.round((item.stock - totalConsumed) * 1000) / 1000, 0);
  if (item.stock <= 0) item.status = "empty";
  else if (item.stock <= item.minStock) item.status = "low";
  else item.status = "safe";

  const stockMap = {};
  inventory.forEach((i) => { stockMap[i.id] = i.stock; });
  localStorage.setItem("printeoo:inventory_stocks", JSON.stringify(stockMap));
  localStorage.setItem("printeoo:usage_log", JSON.stringify(window.APP_DATA.usageLog));

  const root = document.getElementById("global-modal-root");
  if (root) root.innerHTML = "";

  showToast(`Pemakaian ${item.name} ${qtyUsed} ${item.unit}${qtyWaste > 0 ? ` (waste: ${qtyWaste})` : ""} dicatat.`, "success");
  renderOrderDetailPage();
}

function renderInventoryWasteTab(period = "month") {
  const allLog = window.APP_DATA?.usageLog || [];
  const { start, end } = getUsagePeriodRange(period);
  const log = allLog.filter((e) => {
    const d = new Date(e.usedAt);
    return e.qtyWaste > 0 && d >= start && d <= end;
  });

  const periods = [
    { key: "week", label: "Minggu Ini" },
    { key: "month", label: "Bulan Ini" },
    { key: "last_month", label: "Bulan Lalu" },
    { key: "all", label: "Semua" },
  ];

  const filterBar = `
    <div class="tabs mb-4" style="margin-bottom:16px">
      ${periods.map((p) => `
        <button class="tab-button ${period === p.key ? "active" : ""}" type="button" data-waste-period="${p.key}">${p.label}</button>
      `).join("")}
    </div>
  `;

  if (!log.length) {
    return filterBar + `<div class="card empty-state" style="text-align:center;padding:40px"><p class="text-muted">Tidak ada data waste pada periode ini.</p></div>`;
  }

  const totalWasteValue = log.reduce((s, e) => s + e.qtyWaste * e.unitCost, 0);
  const totalUsageValue = allLog.filter((e) => { const d = new Date(e.usedAt); return d >= start && d <= end; })
    .reduce((s, e) => s + e.qtyUsed * e.unitCost, 0);
  const wasteRate = totalUsageValue > 0 ? ((totalWasteValue / (totalUsageValue + totalWasteValue)) * 100).toFixed(1) : 0;

  const byItem = {};
  log.forEach((e) => {
    if (!byItem[e.itemId]) byItem[e.itemId] = { name: e.itemName, value: 0 };
    byItem[e.itemId].value += e.qtyWaste * e.unitCost;
  });
  const topWasteItem = Object.values(byItem).sort((a, b) => b.value - a.value)[0];

  const metrics = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--neutral-500);margin-bottom:8px">Total Waste (Nilai)</div>
        <div style="font-size:22px;font-weight:700;color:var(--warning)">${formatCurrency(totalWasteValue)}</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--neutral-500);margin-bottom:8px">Waste Rate</div>
        <div style="font-size:22px;font-weight:700;color:${parseFloat(wasteRate) > 5 ? "var(--danger)" : "var(--success)"}">${wasteRate}%</div>
      </div>
      <div class="card" style="text-align:center;padding:20px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--neutral-500);margin-bottom:8px">Waste Tertinggi</div>
        <div style="font-size:15px;font-weight:700;color:var(--neutral-900)">${topWasteItem?.name || "—"}</div>
      </div>
    </div>
  `;

  const chart = renderWasteBarChart(log);

  const catLabels = { cutting:"Trim Sisa", misprint:"Gagal Cetak", damage:"Kerusakan", calibration:"Setup Loss", overflow:"Lainnya" };
  const allItems = [...new Set(log.map((e) => e.itemId))];
  const allCats = [...new Set(log.map((e) => e.wasteCategory).filter(Boolean))];

  const tableRows = [...log].sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt)).map((e) => `
    <tr>
      <td class="text-sm">${formatDate(new Date(e.usedAt))}</td>
      <td class="text-xs text-muted">${e.spkNumber}</td>
      <td><strong>${e.itemName}</strong></td>
      <td class="text-warning"><strong>${e.qtyWaste} ${e.unit}</strong></td>
      <td><span class="badge badge-urgent" style="font-size:11px">${catLabels[e.wasteCategory] || e.wasteCategory || "—"}</span></td>
      <td>${formatCurrency(e.qtyWaste * e.unitCost)}</td>
      <td class="text-muted text-xs">${e.operatorName}</td>
    </tr>
  `).join("");

  return `
    ${filterBar}
    ${metrics}
    <div class="card mb-4" style="margin-bottom:24px">
      <h3 style="font-size:15px;font-weight:600;margin:0 0 16px">Grafik Waste 7 Hari Terakhir</h3>
      ${chart}
    </div>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px">
        <h3 style="font-size:15px;font-weight:600;margin:0">Detail Waste</h3>
        <div style="display:flex;gap:8px">
          <select class="form-select" id="waste-item-filter" style="width:170px;padding:5px 10px;font-size:13px">
            <option value="all">Semua Bahan</option>
            ${allItems.map((id) => { const e = log.find((x) => x.itemId === id); return `<option value="${id}">${e.itemName}</option>`; }).join("")}
          </select>
          <select class="form-select" id="waste-cat-filter" style="width:150px;padding:5px 10px;font-size:13px">
            <option value="all">Semua Kategori</option>
            ${allCats.map((c) => `<option value="${c}">${catLabels[c] || c}</option>`).join("")}
          </select>
        </div>
      </div>
      <div id="waste-table-container">
        <div class="data-table">
          <table>
            <thead><tr><th>Tanggal</th><th>SPK</th><th>Bahan</th><th>Qty Waste</th><th>Kategori</th><th>Nilai Rp</th><th>Operator</th></tr></thead>
            <tbody id="waste-table-body">${tableRows}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderWasteBarChart(log) {
  if (!log.length) return `<p class="text-muted text-sm">Tidak ada data.</p>`;

  const msPerDay = 86400000;
  const now = new Date();
  const buckets = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * msPerDay);
    d.setHours(0, 0, 0, 0);
    buckets.push({ label: d.toLocaleDateString("id-ID", { weekday: "short" }), date: d, value: 0 });
  }

  log.forEach((e) => {
    const d = new Date(e.usedAt);
    d.setHours(0, 0, 0, 0);
    const idx = buckets.findIndex((b) => b.date.getTime() === d.getTime());
    if (idx >= 0) buckets[idx].value += e.qtyWaste * e.unitCost;
  });

  const maxVal = Math.max(...buckets.map((b) => b.value), 1);
  const W = 560; const H = 140; const padL = 55; const padB = 26;
  const barW = 36; const barGap = (W - padL - 16) / 7;

  const bars = buckets.map((b, i) => {
    const x = padL + i * barGap + (barGap - barW) / 2;
    const bH = Math.max((b.value / maxVal) * (H - padB - 6), b.value > 0 ? 2 : 0);
    const y = H - padB - bH;
    return `
      <rect x="${x}" y="${y}" width="${barW}" height="${bH}" fill="#D97706" rx="2" opacity="0.85">
        <title>${b.label}: ${formatCurrency(b.value)}</title>
      </rect>
      <text x="${x + barW / 2}" y="${H - padB + 14}" text-anchor="middle" font-size="10" fill="#6B7280">${b.label}</text>
    `;
  }).join("");

  const yLabels = [0, 0.5, 1].map((f) => {
    const v = maxVal * f; const y = H - padB - f * (H - padB - 6);
    const lbl = v >= 1000000 ? `${(v/1000000).toFixed(1)}jt` : v >= 1000 ? `${(v/1000).toFixed(0)}rb` : `${Math.round(v)}`;
    return `<text x="${padL - 5}" y="${y + 4}" text-anchor="end" font-size="9" fill="#9CA3AF">${lbl}</text>
             <line x1="${padL}" y1="${y}" x2="${W - 8}" y2="${y}" stroke="#F3F4F6" stroke-width="1"/>`;
  }).join("");

  return `<svg width="100%" viewBox="0 0 ${W} ${H}" style="overflow:visible">
    ${yLabels}${bars}
    <line x1="${padL}" y1="0" x2="${padL}" y2="${H - padB}" stroke="#E5E7EB" stroke-width="1"/>
  </svg>`;
}

function renderHrPreview(activeTab = "employees") {
  const content = document.getElementById("hr-tab-content");
  if (!content) return;

  document.querySelectorAll("[data-hr-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.hrTab === activeTab);
  });

  if (activeTab === "employees") {
    content.innerHTML = renderEmployeeTable();
    return;
  }

  content.innerHTML = renderLockedHrPreview(activeTab);
}

function renderEmployeeTable() {
  const employees = window.APP_DATA?.employees || [];
  return `
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Posisi</th>
            <th>Tipe Kontrak</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${employees.map((employee) => `
            <tr>
              <td><strong>${employee.name}</strong><div class="text-xs text-muted">${employee.phone}</div></td>
              <td>${employee.position}</td>
              <td><span class="badge ${getContractBadge(employee.contractType)}">${capitalize(employee.contractType)}</span></td>
              <td><span class="badge badge-ready">Aktif</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderLockedHrPreview(tab) {
  const isPayroll = tab === "payroll";
  return `
    <section class="locked-preview card">
      <div class="locked-preview-grid">
        <div class="preview-wireframe">
          <div></div><div></div><div></div><div></div>
        </div>
        <div>
          <span class="badge badge-printing">Segera Hadir</span>
          <h2>${isPayroll ? "Payroll Otomatis" : "Absensi Terintegrasi"}</h2>
          <p>${isPayroll ? "Hitung gaji bulanan, harian, freelance, dan upah pemasangan dari data pekerjaan aktual." : "Pantau kehadiran staff produksi, kasir, gudang, dan pemasangan dalam satu layar."}</p>
          <button class="btn-secondary" type="button" disabled title="Fitur ini aktif di tier Studio">Beritahu saya saat tersedia</button>
        </div>
      </div>
      <div class="locked-overlay">Terkunci sampai upgrade tier Studio</div>
    </section>
  `;
}

function getContractBadge(contractType) {
  const map = {
    bulanan: "badge-confirmed",
    harian: "badge-printing",
    freelance: "badge-urgent",
    borongan: "badge-vip",
  };
  return map[contractType] || "badge-confirmed";
}

function capitalize(value) {
  return String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);
}

function renderFinancePreview() {
  const container = document.getElementById("finance-preview");
  if (!container) return;

  const pnl = {
    revenue: 87500000,
    hpp: 52000000,
    grossProfit: 35500000,
    opex: 18000000,
    netProfit: 17500000,
  };

  container.innerHTML = `
    <section class="metric-grid">
      ${[
        ["Revenue bulan ini", pnl.revenue, "primary"],
        ["HPP", pnl.hpp, "warning"],
        ["Gross Profit", pnl.grossProfit, "success", "40.6%"],
        ["Beban Operasional", pnl.opex, "danger"],
        ["Net Profit", pnl.netProfit, "success", "20%"],
      ].map(([label, value, tone, suffix]) => `
        <article class="metric-card metric-card-${tone}">
          <div>
            <p class="metric-label">${label}</p>
            <div class="metric-value">${formatCurrency(value)}</div>
            ${suffix ? `<p class="metric-trend">${suffix}</p>` : ""}
          </div>
        </article>
      `).join("")}
    </section>

    <section class="card finance-chart-card">
      <h2 class="card-title">Revenue vs HPP vs Profit</h2>
      <div class="finance-chart mt-4">${buildFinanceChart(pnl)}</div>
    </section>

    <section class="preview-feature-grid mt-6">
      ${[
        ["JO", "Jurnal Otomatis", "Jurnal dari order, inventory, dan payroll terbentuk otomatis."],
        ["PPN", "Laporan Pajak PPN", "Pantau PPN keluaran dan masukan tanpa rekap manual."],
        ["EF", "Export e-Faktur", "Siapkan data faktur pajak untuk proses e-Faktur."],
      ].map(([icon, title, description]) => `
        <article class="card preview-feature-card locked-mini-card">
          <div class="preview-icon">${icon}</div>
          <h2>${title}</h2>
          <p>${description}</p>
          <span class="badge badge-printing">Terkunci</span>
        </article>
      `).join("")}
    </section>
  `;
}

function buildFinanceChart(pnl) {
  const rows = [
    ["Revenue", pnl.revenue, "#2563EB"],
    ["HPP", pnl.hpp, "#D97706"],
    ["Gross Profit", pnl.grossProfit, "#16A34A"],
    ["Net Profit", pnl.netProfit, "#059669"],
  ];
  const width = 760;
  const height = 260;
  const maxValue = Math.max(...rows.map((row) => row[1]));

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Chart finance preview">
      ${rows.map(([label, value, color], index) => {
        const barWidth = Math.round((value / maxValue) * 560);
        const y = 36 + index * 52;
        return `
          <g>
            <text x="0" y="${y + 22}" class="finance-chart-label">${label}</text>
            <rect x="150" y="${y}" width="${barWidth}" height="30" rx="6" fill="${color}"></rect>
            <text x="${160 + barWidth}" y="${y + 21}" class="finance-chart-value">${formatCurrency(value)}</text>
          </g>
        `;
      }).join("")}
    </svg>
  `;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function buildRevenueChart(rows) {
  const width = 760;
  const height = 260;
  const padding = 32;
  const maxRevenue = Math.max(...rows.map((row) => row.revenue));
  const barWidth = (width - padding * 2) / rows.length - 14;

  const bars = rows.map((row, index) => {
    const barHeight = Math.round(((height - padding * 2) * row.revenue) / maxRevenue);
    const x = padding + index * (barWidth + 14);
    const y = height - padding - barHeight;
    const label = new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(new Date(row.date));

    return `
      <g>
        <rect class="chart-bar" x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="6"></rect>
        <text x="${x + barWidth / 2}" y="${height - 8}" text-anchor="middle">${label}</text>
        <title>${label}: ${formatCurrency(row.revenue)}</title>
      </g>
    `;
  }).join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Chart revenue 7 hari terakhir">
      <line class="chart-axis" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}"></line>
      ${bars}
    </svg>
  `;
}

// Event handlers
function setupEventHandlers() {
  window.addEventListener("hashchange", handleRoute);

  document.getElementById("role-switcher").addEventListener("change", (event) => {
    setRole(event.target.value);
  });

  document.getElementById("sidebar-toggle").addEventListener("click", () => {
    setSidebarState(getSidebarState() === "closed" ? "open" : "closed");
  });

  document.getElementById("sidebar-toggle-floating").addEventListener("click", () => {
    setSidebarState("open");
  });

  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-action='login']");
    const orderForm = event.target.closest("#order-new-form");
    const incomingForm = event.target.closest("#incoming-form");
    const opnameStep1Form = event.target.closest("#opname-step1-form");

    if (form) {
      event.preventDefault();
      loginAsRole("owner");
      return;
    }

    if (orderForm) {
      submitNewOrder(event);
      return;
    }

    if (incomingForm) {
      event.preventDefault();
      submitIncomingForm(incomingForm);
      return;
    }

    if (opnameStep1Form) {
      event.preventDefault();
      submitOpnameStep1(opnameStep1Form);
      return;
    }

    const usageWasteForm = event.target.closest("#usage-waste-form");
    if (usageWasteForm) {
      event.preventDefault();
      submitUsageWasteForm(usageWasteForm);
    }
  });

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    const dateFilterButton = event.target.closest("[data-date-filter]");
    const orderRow = event.target.closest("[data-order-link]");
    const customerOption = event.target.closest("[data-customer-id]");
    const productionFilterButton = event.target.closest("[data-production-filter]");
    const productionCard = event.target.closest("[data-production-spk]");
    const hrTabButton = event.target.closest("[data-hr-tab]");
    const invTabButton = event.target.closest("[data-inv-tab]");
    const usagePeriodButton = event.target.closest("[data-usage-period]");
    const wastePeriodButton = event.target.closest("[data-waste-period]");
    const dashboardFilter = event.target.closest("[data-dashboard-filter]");

    if (customerOption) {
      selectCustomer(customerOption.dataset.customerId);
      return;
    }

    if (hrTabButton) {
      renderHrPreview(hrTabButton.dataset.hrTab);
      return;
    }

    if (invTabButton) {
      renderInventoryPage(invTabButton.dataset.invTab);
      return;
    }

    if (usagePeriodButton) {
      APP_STATE.usagePeriod = usagePeriodButton.dataset.usagePeriod;
      const tabContent = document.getElementById("inventory-tab-content");
      if (tabContent) tabContent.innerHTML = renderInventoryUsageTab(APP_STATE.usagePeriod);
      return;
    }

    if (wastePeriodButton) {
      APP_STATE.wastePeriod = wastePeriodButton.dataset.wastePeriod;
      const tabContent = document.getElementById("inventory-tab-content");
      if (tabContent) tabContent.innerHTML = renderInventoryWasteTab(APP_STATE.wastePeriod);
      return;
    }

    if (dashboardFilter?.dataset.dashboardFilter === "overdue") {
      APP_STATE.orderFilters = { search: "", status: "all", date: "all", overdue: true };
      window.location.hash = "#/orders";
      return;
    }

    if (productionFilterButton) {
      APP_STATE.productionFilter = productionFilterButton.dataset.productionFilter || "all";
      renderProductionBoard();
      return;
    }

    if (productionCard) {
      openProductionModal(productionCard.dataset.productionSpk);
      return;
    }

    if (dateFilterButton) {
      APP_STATE.orderFilters.date = dateFilterButton.dataset.dateFilter || "all";
      APP_STATE.orderFilters.overdue = false;
      document.querySelectorAll("[data-date-filter]").forEach((button) => {
        button.classList.toggle("active", button === dateFilterButton);
      });
      renderOrdersTable(window.APP_DATA?.orders || []);
      return;
    }

    if (orderRow && !event.target.closest("a, button")) {
      window.location.hash = orderRow.dataset.orderLink;
      return;
    }

    if (actionButton) {
      if (actionButton.dataset.action === "logout") {
        logout();
        return;
      }

      if (actionButton.dataset.action === "open-incoming-modal") {
        openIncomingModal();
        return;
      }

      if (actionButton.dataset.action === "close-incoming-modal") {
        const root = document.getElementById("inventory-modal-root");
        if (root) root.innerHTML = "";
        return;
      }

      if (actionButton.dataset.action === "open-usage-report") {
        renderInventoryPage("usage");
        return;
      }

      if (actionButton.dataset.action === "open-usage-waste-modal") {
        openUsageWasteModal(actionButton.dataset.spkNumber);
        return;
      }

      if (actionButton.dataset.action === "open-qr-label") {
        openQrLabelModal(actionButton.dataset.itemId);
        return;
      }

      if (actionButton.dataset.action === "open-qr-label-batch") {
        openQrLabelModal(actionButton.dataset.itemId, actionButton.dataset.batchId);
        return;
      }

      if (actionButton.dataset.action === "close-inventory-modal") {
        const r1 = document.getElementById("inventory-modal-root");
        const r2 = document.getElementById("global-modal-root");
        if (r1) r1.innerHTML = "";
        if (r2) r2.innerHTML = "";
        return;
      }

      if (actionButton.dataset.action === "download-qr-png") {
        downloadQrPng();
        return;
      }

      if (actionButton.dataset.action === "print-qr-label") {
        window.print();
        return;
      }

      if (actionButton.dataset.action === "open-qr-scan") {
        openQrScanModal();
        return;
      }

      if (actionButton.dataset.action === "lookup-batch-manual") {
        const input = document.getElementById("qr-manual-batch");
        const batchId = input?.value?.trim();
        if (!batchId) { showToast("Masukkan Batch ID terlebih dahulu.", "error"); return; }
        const batch = (window.APP_DATA?.materialBatches || []).find((b) => b.batchNumber === batchId);
        const entry = (window.APP_DATA?.incomingLog || []).find((e) => e.batchId === batchId);
        const resultEl = document.getElementById("qr-scan-result");
        const resultText = document.getElementById("qr-scan-result-text");
        if (resultEl && resultText) {
          if (batch || entry) {
            const name = batch
              ? (window.APP_DATA?.inventory || []).find((i) => i.id === batch.materialId)?.name || "—"
              : entry.itemName;
            const qty = batch ? batch.initialQty : entry.qty;
            const unit = batch ? batch.unit : entry.unit;
            resultEl.style.display = "block";
            resultText.textContent = `${name} — ${qty} ${unit} (Batch: ${batchId})`;
            showToast(`Batch ditemukan: ${name}`, "success");
          } else {
            resultEl.style.display = "none";
            showToast("Batch ID tidak ditemukan.", "error");
          }
        }
        return;
      }

      if (actionButton.dataset.action === "simulate-qr-scan") {
        const { batchId, itemName, qty, unit } = actionButton.dataset;
        const resultEl = document.getElementById("qr-scan-result");
        const resultText = document.getElementById("qr-scan-result-text");
        if (resultEl && resultText) {
          resultEl.style.display = "block";
          resultText.textContent = `${itemName} — ${qty} ${unit} (Batch: ${batchId})`;
        }
        showToast(`✓ Simulasi scan: ${itemName}`, "success");
        return;
      }

      if (actionButton.dataset.action === "open-opname-view") {
        renderInventoryPage("opname");
        return;
      }

      if (actionButton.dataset.action === "start-opname-wizard") {
        startOpnameWizard();
        return;
      }

      if (actionButton.dataset.action === "back-to-opname-list") {
        APP_STATE.currentOpnameSession = null;
        renderInventoryPage("opname");
        return;
      }

      if (actionButton.dataset.action === "save-opname-draft") {
        saveOpnameDraft();
        return;
      }

      if (actionButton.dataset.action === "proceed-opname-review") {
        proceedOpnameToReview();
        return;
      }

      if (actionButton.dataset.action === "back-to-opname-step2") {
        if (APP_STATE.currentOpnameSession) APP_STATE.currentOpnameSession.step = 2;
        renderOpnameStep2();
        return;
      }

      if (actionButton.dataset.action === "approve-opname") {
        approveOpname();
        return;
      }

      if (actionButton.dataset.action === "view-opname-detail") {
        renderOpnameSessionDetail(actionButton.dataset.opnameId);
        return;
      }

      if (actionButton.dataset.action === "login-role") {
        loginAsRole(actionButton.dataset.role || "owner");
        return;
      }

      if (actionButton.dataset.action === "advance-order") {
        advanceCurrentOrder(actionButton.dataset.status, actionButton.dataset.note);
        return;
      }

      if (actionButton.dataset.action === "add-order-note") {
        addCurrentOrderNote();
        return;
      }

      if (actionButton.dataset.action === "print-spk") {
        window.print();
        return;
      }

      if (actionButton.dataset.action === "duplicate-order") {
        duplicateCurrentOrder();
        return;
      }

      if (actionButton.dataset.action === "cancel-order") {
        cancelCurrentOrder();
        return;
      }

      if (actionButton.dataset.action === "close-production-modal") {
        if (actionButton.classList.contains("modal-overlay") && event.target !== actionButton) return;
        closeProductionModal();
        return;
      }

      if (actionButton.dataset.action === "production-update-status") {
        updateProductionStatus(actionButton.dataset.status, actionButton.dataset.note);
        return;
      }

      if (actionButton.dataset.action === "call-next-queue") {
        callNextQueue(actionButton.dataset.counter);
        return;
      }

      if (actionButton.dataset.action === "call-specific-queue") {
        callSpecificQueue("1", actionButton.dataset.number);
        return;
      }

      if (actionButton.dataset.action === "skip-queue") {
        skipQueue(actionButton.dataset.counter);
        return;
      }

      if (actionButton.dataset.action === "recall-queue") {
        recallQueue(actionButton.dataset.counter);
        return;
      }

      if (actionButton.dataset.action === "add-queue-number") {
        addQueueNumber();
        return;
      }

      if (actionButton.dataset.action === "open-queue-display") {
        window.open("#/display-queue", "_blank");
        return;
      }

      if (actionButton.dataset.action === "pricing-cta") {
        showToast(`CTA ${actionButton.dataset.tier} diklik. Demo feedback aktif.`, "success");
        return;
      }

      if (actionButton.dataset.action === "simulate-production-order") {
        simulateProductionOrder();
        return;
      }

      if (actionButton.dataset.action === "toggle-production-audio") {
        APP_STATE.audioMuted = !APP_STATE.audioMuted;
        renderProductionDisplay();
        return;
      }

      if (actionButton.dataset.action === "enable-production-audio") {
        enableProductionAudio();
        return;
      }

      if (actionButton.dataset.action === "enable-queue-audio") {
        enableQueueAudio();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && APP_STATE.currentRoute === "display-production") {
      const pin = window.prompt("Masukkan PIN untuk keluar display mode");
      if (pin) {
        window.location.hash = "#/production";
      }
    }
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "orders-search") {
      APP_STATE.orderFilters.search = event.target.value;
      APP_STATE.orderFilters.overdue = false;
      renderOrdersTable(window.APP_DATA?.orders || []);
    }

    if (event.target.id === "order-customer") {
      APP_STATE.selectedCustomer = null;
      document.getElementById("order-customer-id").value = "";
      renderCustomerSuggestions(event.target.value);
    }

    if (event.target.id === "order-phone") {
      event.target.value = formatPhone(event.target.value);
    }

    if (event.target.matches(".opname-physical-input")) {
      const input = event.target;
      const systemStock = parseFloat(input.dataset.systemStock);
      const physical = input.value !== "" ? parseFloat(input.value) : null;
      const diffCell = document.querySelector(`.opname-diff-cell[data-diff-for="${input.dataset.itemId}"]`);
      if (diffCell) {
        if (physical === null) {
          diffCell.textContent = "";
          diffCell.style.cssText = "";
        } else {
          const diff = Math.round((physical - systemStock) * 1000) / 1000;
          diffCell.textContent = diff === 0 ? "0" : diff > 0 ? `+${diff}` : `${diff}`;
          diffCell.style.cssText = diff === 0 ? "color:#16A34A;font-weight:600" : diff < 0 ? "color:#DC2626;font-weight:600" : "color:#D97706;font-weight:600";
        }
      }
      return;
    }

    if (event.target.matches("#order-qty, [data-calc-field]")) {
      updateOrderCalculation({ autoPrice: true });
    }

    if (event.target.matches("#order-unit-price, #order-discount, #order-dp")) {
      updateOrderCalculation();
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.id === "orders-status") {
      APP_STATE.orderFilters.status = event.target.value;
      APP_STATE.orderFilters.overdue = false;
      renderOrdersTable(window.APP_DATA?.orders || []);
    }

    if (event.target.id === "order-product") {
      selectProduct(event.target.value);
    }

    if (event.target.id === "discount-type") {
      updateOrderCalculation();
    }

    if (event.target.id === "order-file") {
      const fileName = document.getElementById("file-name");
      fileName.textContent = event.target.files[0]?.name || "Drop file atau klik untuk browse";
    }

    if (event.target.id === "usage-material-filter") {
      const spkTableEl = document.getElementById("usage-spk-table");
      if (spkTableEl) {
        const log = filterUsageByPeriod(APP_STATE.usagePeriod);
        spkTableEl.innerHTML = renderUsagePerSpkTable(log, event.target.value);
      }
    }

    if (event.target.id === "waste-item-filter" || event.target.id === "waste-cat-filter") {
      const itemFilter = document.getElementById("waste-item-filter")?.value || "all";
      const catFilter = document.getElementById("waste-cat-filter")?.value || "all";
      const { start, end } = getUsagePeriodRange(APP_STATE.wastePeriod);
      const allLog = window.APP_DATA?.usageLog || [];
      const filtered = allLog.filter((e) => {
        const d = new Date(e.usedAt);
        return e.qtyWaste > 0 && d >= start && d <= end
          && (itemFilter === "all" || e.itemId === itemFilter)
          && (catFilter === "all" || e.wasteCategory === catFilter);
      });
      const catLabels = { cutting:"Trim Sisa", misprint:"Gagal Cetak", damage:"Kerusakan", calibration:"Setup Loss", overflow:"Lainnya" };
      const tbody = document.getElementById("waste-table-body");
      if (tbody) {
        tbody.innerHTML = filtered.sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt)).map((e) => `
          <tr>
            <td class="text-sm">${formatDate(new Date(e.usedAt))}</td>
            <td class="text-xs text-muted">${e.spkNumber}</td>
            <td><strong>${e.itemName}</strong></td>
            <td class="text-warning"><strong>${e.qtyWaste} ${e.unit}</strong></td>
            <td><span class="badge badge-urgent" style="font-size:11px">${catLabels[e.wasteCategory] || e.wasteCategory || "—"}</span></td>
            <td>${formatCurrency(e.qtyWaste * e.unitCost)}</td>
            <td class="text-muted text-xs">${e.operatorName}</td>
          </tr>
        `).join("") || `<tr><td colspan="7" class="text-center text-muted" style="padding:16px">Tidak ada data untuk filter ini.</td></tr>`;
      }
    }
  });
}

function loginAsRole(role) {
  APP_STATE.isLoggedIn = true;
  localStorage.setItem("printeoo:isLoggedIn", "true");
  setRole(role);
}

function setRole(role) {
  APP_STATE.currentRole = role;
  APP_STATE.currentUser = ROLE_USERS[role] || ROLE_USERS.owner;
  APP_STATE.isLoggedIn = true;

  localStorage.setItem("printeoo:role", role);
  localStorage.setItem("printeoo:isLoggedIn", String(APP_STATE.isLoggedIn));

  if (role === "display") {
    window.location.hash = ROLE_DEFAULT_ROUTES.display;
  } else {
    window.location.hash = ROLE_DEFAULT_ROUTES[role];
  }

  updateSidebar(role);
  syncRoleSwitcher();
  showToast(`Tampilan diganti ke ${APP_STATE.currentUser.label}`, "success");
}

function syncRoleSwitcher() {
  const roleSwitcher = document.getElementById("role-switcher");
  roleSwitcher.value = APP_STATE.currentRole;
}

function logout() {
  APP_STATE.isLoggedIn = false;
  localStorage.setItem("printeoo:isLoggedIn", "false");
  window.location.hash = "#/login";
  showToast("Anda keluar dari prototype.", "success");
}

// Utilities
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.remove();
  }, 3200);
}

function formatCurrency(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number || 0);
}

function formatDate(dateInput) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateInput));
}

function formatRelativeDate(dateInput) {
  const target = new Date(dateInput);
  const current = new Date();
  target.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - current) / 86400000);

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Besok";
  if (diffDays === -1) return "Kemarin";
  if (diffDays > 1) return `${diffDays} hari lagi`;
  return `${Math.abs(diffDays)} hari lalu`;
}

function toDateInputValue(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function toCompactDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
}

function formatPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 4) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
}

function loadStoredInventory() {
  try {
    const storedLog = localStorage.getItem("printeoo:incoming_log");
    if (storedLog && window.APP_DATA) {
      const parsed = JSON.parse(storedLog);
      const existingIds = new Set((window.APP_DATA.incomingLog || []).map((e) => e.id));
      const newEntries = parsed.filter((e) => !existingIds.has(e.id));
      if (!window.APP_DATA.incomingLog) window.APP_DATA.incomingLog = [];
      window.APP_DATA.incomingLog.push(...newEntries);
    }
  } catch (e) {}

  try {
    const storedStocks = localStorage.getItem("printeoo:inventory_stocks");
    if (storedStocks && window.APP_DATA?.inventory) {
      const stocks = JSON.parse(storedStocks);
      window.APP_DATA.inventory.forEach((item) => {
        if (stocks[item.id] !== undefined) {
          item.stock = stocks[item.id];
          if (item.stock <= 0) item.status = "empty";
          else if (item.stock <= item.minStock) item.status = "low";
          else item.status = "safe";
        }
      });
    }
  } catch (e) {}

  try {
    const storedUsage = localStorage.getItem("printeoo:usage_log");
    if (storedUsage && window.APP_DATA) {
      const parsed = JSON.parse(storedUsage);
      const existingIds = new Set((window.APP_DATA.usageLog || []).map((e) => e.id));
      const newEntries = parsed.filter((e) => !existingIds.has(e.id));
      if (!window.APP_DATA.usageLog) window.APP_DATA.usageLog = [];
      window.APP_DATA.usageLog.push(...newEntries);
    }
  } catch (e) {}

  try {
    const storedSessions = localStorage.getItem("printeoo:opname_sessions");
    if (storedSessions && window.APP_DATA) {
      const parsed = JSON.parse(storedSessions);
      const existingIds = new Set((window.APP_DATA.opnameSessions || []).map((s) => s.id));
      const newSessions = parsed.filter((s) => !existingIds.has(s.id));
      if (!window.APP_DATA.opnameSessions) window.APP_DATA.opnameSessions = [];
      window.APP_DATA.opnameSessions.push(...newSessions);
    }
  } catch (e) {}

  try {
    const storedAdj = localStorage.getItem("printeoo:adjustment_log");
    if (storedAdj && window.APP_DATA) {
      const parsed = JSON.parse(storedAdj);
      const existingIds = new Set((window.APP_DATA.adjustmentLog || []).map((a) => a.id));
      const newAdj = parsed.filter((a) => !existingIds.has(a.id));
      if (!window.APP_DATA.adjustmentLog) window.APP_DATA.adjustmentLog = [];
      window.APP_DATA.adjustmentLog.push(...newAdj);
    }
  } catch (e) {}
}

function loadStoredOrders() {
  try {
    const stored = JSON.parse(localStorage.getItem("printeoo:orders") || "[]");
    if (Array.isArray(stored) && window.APP_DATA?.orders) {
      const existingSpk = new Set(window.APP_DATA.orders.map((order) => order.spkNumber));
      const newOrders = stored.filter((order) => !existingSpk.has(order.spkNumber));
      window.APP_DATA.orders.unshift(...newOrders);
    }
  } catch (error) {
    console.warn("Gagal membaca order lokal", error);
  }
}

function persistStoredOrders() {
  const localOrders = (window.APP_DATA?.orders || []).filter((order) => order.id.startsWith("ORD-00") && order.timeline?.[0]?.note === "Order dibuat dari form input");
  localStorage.setItem("printeoo:orders", JSON.stringify(localOrders));
}

function getIcon(name) {
  const icons = {
    dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 13h8V3H3v10Z"/><path d="M13 21h8V11h-8v10Z"/><path d="M13 3v6h8V3h-8Z"/><path d="M3 21h8v-6H3v6Z"/></svg>',
    orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
    production: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6"/><path d="M10 20H4v-6"/><path d="m20 4-7 7"/><path d="m4 20 7-7"/></svg>',
    queue: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    inventory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><path d="M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>',
    finance: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.14.31.23.65.23 1H21a2 2 0 1 1 0 4h-1.37c0 .35-.09.69-.23 1Z"/></svg>',
  };

  return icons[name] || icons.dashboard;
}

window.showToast = showToast;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatRelativeDate = formatRelativeDate;
window.loadPage = loadPage;
window.updateSidebar = updateSidebar;

document.addEventListener("DOMContentLoaded", () => {
  setupEventHandlers();
  applySidebarState();
  handleRoute();
});
