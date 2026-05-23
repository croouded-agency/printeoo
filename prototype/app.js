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
  } else {
    tabContent.innerHTML = renderInventoryIncomingTab();
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
