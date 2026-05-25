// App state
const ROLE_USERS = {
  owner: { name: "Yanuar Firnandy", role: "owner", label: "Owner" },
  branch_manager: { name: "Novi Rahma", role: "branch_manager", label: "Branch Manager" },
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
  selectedProductionItemId: null,
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
  poFilters: {
    status: "all",
    supplier: "all",
  },
  customerFilters: {
    search: "",
    type: "all",
    debt: "all",
    sort: "name",
  },
  customerDetailTab: "orders",
  customerOrderFilter: "all",
};

window.APP_STATE = APP_STATE;

loadStoredOrders();
loadStoredInventory();

const ROUTES = {
  login: { page: "login", title: "Login", fullScreen: true },
  dashboard: { page: "dashboard", title: "Dashboard" },
  orders: { page: "orders", title: "Pesanan" },
  customers: { page: "customers", title: "Pelanggan" },
  customer: { page: "customers", title: "Detail Pelanggan" },
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
  settings: { page: "settings", title: "Pengaturan" },
};

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", hash: "#/dashboard", roles: ["owner"], icon: "dashboard" },
  { id: "orders", label: "Pesanan", hash: "#/orders", roles: ["owner", "cashier"], icon: "orders", badge: "overdue" },
  { id: "customers", label: "Pelanggan", hash: "#/customers", roles: ["owner", "branch_manager", "cashier"], icon: "customers" },
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
  branch_manager: "#/customers",
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

  if (route === "customer" && segments[1]) {
    return { route: "customer", params: { customerId: decodeURIComponent(segments[1]) } };
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
  const suffix = params.spkNumber ? ` / ${params.spkNumber}` : params.customerId ? ` / ${params.customerId}` : "";
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
  if (APP_STATE.currentRoute === "customer") return "customers";
  if (APP_STATE.currentRoute === "settings") return "settings";
  return APP_STATE.currentRoute;
}

function canAccessRoute(route, role) {
  if (route === "login" || route === "pricing") return true;
  if (role === "display") return route === "display-production" || route === "display-queue";
  if (route === "order") return role === "owner" || role === "cashier";
  if (route === "customer") return role === "owner" || role === "branch_manager" || role === "cashier";
  if (route === "settings") return role === "owner";

  const menuItem = MENU_ITEMS.find((item) => item.id === route);
  return menuItem ? menuItem.roles.includes(role) : true;
}

function getOverdueOrders() {
  return (window.APP_DATA?.orders || []).filter(isOrderOverdue);
}

function initPage(route, params = {}) {
  if (route === "dashboard") {
    renderDashboard();
  }

  if (route === "orders") {
    renderOrdersPage();
  }

  if (route === "customers") {
    renderCustomersPage();
  }

  if (route === "customer") {
    renderCustomerDetailPage(params.customerId);
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

  if (route === "settings") {
    renderSettingsPage();
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
  const topCustomersEl = document.getElementById("top-customers");
  const productionEl = document.getElementById("production-summary");

  if (!greetingEl || !metricsEl || !alertEl || !chartEl || !topProductsEl || !topCustomersEl || !productionEl) return;

  const liveMetrics = getDashboardMetrics();
  const lowStockCount = (window.APP_DATA?.inventory || []).filter((item) => item.stock <= item.minStock).length;
  const revenueTrend = dashboard.revenueYesterday
    ? ((dashboard.revenueToday - dashboard.revenueYesterday) / dashboard.revenueYesterday) * 100
    : 0;
  const activeToday = Math.max(liveMetrics.ordersToday, liveMetrics.completedToday);
  const completionRate = activeToday
    ? Math.round((liveMetrics.completedToday / activeToday) * 100)
    : null;

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
      trend: "Order baru masuk hari ini",
      tone: "primary",
    },
    {
      icon: "Rp",
      label: "Revenue Hari Ini",
      value: formatCurrency(dashboard.revenueToday),
      trend: `Termasuk pelunasan order sebelumnya · ${revenueTrend >= 0 ? "naik" : "turun"} ${Math.abs(revenueTrend).toFixed(1)}% dari kemarin`,
      tone: revenueTrend >= 0 ? "success" : "danger",
    },
    {
      icon: "OK",
      label: "Selesai Hari Ini",
      value: liveMetrics.completedToday,
      trend: completionRate === null ? "Completion rate belum tersedia" : `${completionRate}% completion rate`,
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

  topCustomersEl.innerHTML = renderTopCustomersThisMonth();

  const productionLabels = {
    design_queue: "Antrian Desain",
    in_design: "Sedang Desain",
    production_queue: "Antrian Cetak",
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

function getTopCustomersThisMonth() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const customersById = Object.fromEntries((window.APP_DATA?.customers || []).map((customer) => [customer.id, customer]));
  const rows = {};

  (window.APP_DATA?.orders || [])
    .filter((order) => ["delivered", "closed"].includes(order.status))
    .filter((order) => {
      const date = new Date(order.updatedAt || order.createdAt);
      return date >= monthStart && date < monthEnd;
    })
    .forEach((order) => {
      const customerId = order.customerId || "walk-in";
      if (!rows[customerId]) {
        rows[customerId] = {
          customerId,
          name: customersById[customerId]?.name || order.customerName || "Customer Walk-in",
          spending: 0,
          orderCount: 0,
        };
      }
      rows[customerId].spending += Number(order.total) || 0;
      rows[customerId].orderCount += 1;
    });

  return Object.values(rows)
    .sort((a, b) => b.spending - a.spending)
    .slice(0, 5);
}

function renderTopCustomersThisMonth() {
  const rows = getTopCustomersThisMonth();
  if (!rows.length) {
    return `<p class="text-muted">Belum ada order selesai bulan ini.</p>`;
  }

  const max = Math.max(...rows.map((row) => row.spending), 1);
  return rows.map((row, index) => `
    <a class="product-rank" href="#/customer/${encodeURIComponent(row.customerId)}">
      <div class="product-rank-header">
        <span class="product-rank-name">${index + 1}. ${row.name}</span>
        <span class="font-semibold">${formatCurrency(row.spending)}</span>
      </div>
      <div class="flex justify-between text-xs text-muted">
        <span>${row.orderCount} order selesai</span>
        <span>${Math.round((row.spending / max) * 100)}%</span>
      </div>
      <div class="mini-bar"><span style="width: ${Math.max((row.spending / max) * 100, 8)}%"></span></div>
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
      production_queue: orders.filter((order) => order.status === "production_queue").length,
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
    const activeFilter = APP_STATE.orderFilters.overdue ? "overdue" : APP_STATE.orderFilters.date;
    button.classList.toggle("active", button.dataset.dateFilter === activeFilter);
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
  const items = getOrderItems(order);
  const firstItem = items[0];
  const extraCount = Math.max(items.length - 1, 0);
  const productLabel = firstItem?.product || order.productName || "-";
  const qtyLabel = items.length > 1
    ? `${items.length} item`
    : `${firstItem?.qty ?? order.qty} ${firstItem?.unit || order.unit || ""}`.trim();
  const displayStatus = getOrderStatus(order);
  const statusLabel = window.APP_DATA.statusLabels[displayStatus] || displayStatus;
  const statusTooltip = getOrderStatusBreakdown(order);

  return `
    <tr class="${overdue ? "row-overdue" : ""}" data-order-link="${detailHash}">
      <td>
        <a class="table-link" href="${detailHash}">${order.spkNumber}</a>
      </td>
      <td>
        <div class="font-semibold">${order.customerName}</div>
        <div class="text-xs text-muted">${order.paymentStatus === "paid" ? "Lunas" : order.paymentStatus === "partial" ? "DP / Parsial" : "Belum bayar"}</div>
      </td>
      <td>
        <div class="order-product-cell">
          <span>${productLabel}</span>
          ${extraCount ? `<span class="badge badge-draft">+${extraCount} lagi</span>` : ""}
        </div>
      </td>
      <td>${qtyLabel}</td>
      <td>${formatCurrency(order.total)}</td>
      <td>
        <span class="${overdue ? "text-danger font-semibold" : ""}">${formatRelativeDate(order.deadlineAt)}</span>
      </td>
      <td>
        <span class="badge badge-${displayStatus}" title="${escapeAttr(statusTooltip)}">${statusLabel}</span>
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
    const displayStatus = getOrderStatus(order);
    const matchesSearch = !searchText
      || order.customerName.toLowerCase().includes(searchText)
      || order.spkNumber.toLowerCase().includes(searchText)
      || getOrderItems(order).some((item) => String(item.product || "").toLowerCase().includes(searchText));
    const matchesStatus = status === "all" || displayStatus === status;
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
  const hasUnfinishedItem = getOrderItems(order).some((item) => item.status !== "ready");
  const legacyDone = !order.items?.length && ["ready", "delivered", "closed"].includes(order.status);
  return deadline < today && hasUnfinishedItem && !legacyDone;
}

function getOrderItems(order) {
  if (Array.isArray(order.items) && order.items.length) return order.items;
  return [{
    itemId: `${order.spkNumber || order.id}-LEGACY-01`,
    seq: 1,
    product: order.productName || "-",
    qty: order.qty || 0,
    unit: order.unit || "",
    status: order.status || "confirmed",
  }];
}

function getOrderStatus(order) {
  if (typeof window.getOrderDerivedStatus === "function" && Array.isArray(order.items) && order.items.length) {
    return window.getOrderDerivedStatus(order);
  }
  return order.derivedStatus || order.status || "confirmed";
}

function getOrderStatusBreakdown(order) {
  const items = getOrderItems(order);
  const counts = items.reduce((acc, item) => {
    const status = item.status || "confirmed";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([status, count]) => `${count} item ${window.APP_DATA.statusLabels[status] || status}`)
    .join(", ");
}

function getCustomerTypeMeta(type) {
  const map = {
    individual: { label: "Individual", className: "badge-draft" },
    perusahaan: { label: "Perusahaan", className: "badge-confirmed" },
    instansi: { label: "Instansi", className: "badge-ready" },
  };
  return map[type] || map.individual;
}

function getFilteredCustomers() {
  const filters = APP_STATE.customerFilters;
  const search = filters.search.trim().toLowerCase();
  return [...(window.APP_DATA?.customers || [])]
    .filter((customer) => {
      const matchesSearch = !search
        || customer.name.toLowerCase().includes(search)
        || String(customer.phone || "").toLowerCase().includes(search)
        || String(customer.email || "").toLowerCase().includes(search);
      const matchesType = filters.type === "all" || customer.type === filters.type;
      const hasDebt = Number(customer.outstandingDebt || 0) > 0;
      const matchesDebt = filters.debt === "all"
        || (filters.debt === "debt" && hasDebt)
        || (filters.debt === "clear" && !hasDebt);
      return matchesSearch && matchesType && matchesDebt;
    })
    .sort((a, b) => {
      if (filters.sort === "spending") return (b.totalSpending || 0) - (a.totalSpending || 0);
      if (filters.sort === "last_order") return new Date(b.lastOrderDate || 0) - new Date(a.lastOrderDate || 0);
      return a.name.localeCompare(b.name, "id-ID");
    });
}

function getCustomerStats(customers) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const activeCutoff = new Date(now);
  activeCutoff.setMonth(activeCutoff.getMonth() - 3);
  return {
    total: customers.length,
    newThisMonth: customers.filter((customer) => new Date(customer.createdAt) >= monthStart).length,
    debt: customers.reduce((sum, customer) => sum + (Number(customer.outstandingDebt) || 0), 0),
    active: customers.filter((customer) => customer.lastOrderDate && new Date(customer.lastOrderDate) >= activeCutoff).length,
  };
}

function renderCustomersPage() {
  const customers = window.APP_DATA?.customers || [];
  const statsEl = document.getElementById("customer-stats");
  const tableEl = document.getElementById("customers-table-container");
  const counterEl = document.getElementById("customers-counter");
  const searchEl = document.getElementById("customers-search");
  const typeEl = document.getElementById("customers-type-filter");
  const debtEl = document.getElementById("customers-debt-filter");
  const sortEl = document.getElementById("customers-sort");
  if (!statsEl || !tableEl || !counterEl) return;

  if (searchEl) searchEl.value = APP_STATE.customerFilters.search;
  if (typeEl) typeEl.value = APP_STATE.customerFilters.type;
  if (debtEl) debtEl.value = APP_STATE.customerFilters.debt;
  if (sortEl) sortEl.value = APP_STATE.customerFilters.sort;

  const stats = getCustomerStats(customers);
  statsEl.innerHTML = `
    <article class="metric-card"><span>Total Pelanggan</span><strong>${stats.total}</strong></article>
    <article class="metric-card"><span>Pelanggan Baru Bulan Ini</span><strong>${stats.newThisMonth}</strong></article>
    <article class="metric-card"><span>Total Piutang</span><strong>${formatCurrency(stats.debt)}</strong></article>
    <article class="metric-card"><span>Pelanggan Aktif</span><strong>${stats.active}</strong></article>
  `;

  const filtered = getFilteredCustomers();
  counterEl.textContent = `Menampilkan ${filtered.length} dari ${customers.length} pelanggan`;

  if (!filtered.length) {
    tableEl.innerHTML = `
      <div class="card empty-state" style="text-align:center;padding:40px">
        <div class="empty-illustration" aria-hidden="true">CRM</div>
        <h2 class="card-title">Pelanggan tidak ditemukan</h2>
        <p class="text-muted">Coba ubah filter atau tambahkan pelanggan baru.</p>
        <button class="btn-primary" type="button" data-action="open-customer-modal">Tambah Pelanggan Baru</button>
      </div>
    `;
    return;
  }

  tableEl.innerHTML = `
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Tipe</th>
            <th>No. HP</th>
            <th>Total Order</th>
            <th>Total Spending</th>
            <th>Piutang</th>
            <th>Order Terakhir</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map((customer) => renderCustomerRow(customer)).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCustomerRow(customer) {
  const meta = getCustomerTypeMeta(customer.type);
  const debt = Number(customer.outstandingDebt || 0);
  return `
    <tr data-customer-row="${customer.id}">
      <td><strong>${customer.name}</strong><div class="text-xs text-muted">${customer.email || customer.address || "-"}</div></td>
      <td><span class="badge ${meta.className}">${meta.label}</span></td>
      <td>${customer.phone}</td>
      <td>${customer.totalOrders || 0}</td>
      <td><strong>${formatCurrency(customer.totalSpending || 0)}</strong></td>
      <td>${debt > 0 ? `<span class="text-danger font-semibold">⚠ ${formatCurrency(debt)}</span>` : `<span class="text-success font-semibold">Lunas</span>`}</td>
      <td>${customer.lastOrderDate ? formatRelativeDate(customer.lastOrderDate) : "Belum ada"}</td>
      <td>
        <div class="flex gap-2 flex-wrap">
          <button class="btn-secondary text-xs" type="button" data-action="view-customer-detail" data-customer-id="${customer.id}">Detail</button>
          <button class="btn-primary text-xs" type="button" data-action="new-order-for-customer" data-customer-id="${customer.id}">Buat Order</button>
        </div>
      </td>
    </tr>
  `;
}

function openCustomerModal(customerId = null) {
  const root = document.getElementById("customer-modal-root") || document.getElementById("global-modal-root");
  if (!root) return;
  const customer = customerId
    ? (window.APP_DATA?.customers || []).find((item) => item.id === customerId)
    : null;
  const isEdit = Boolean(customer);
  const selectedType = customer?.type || "individual";

  root.innerHTML = `
    <div class="modal-overlay" id="customer-modal">
      <div class="modal-box" style="max-width:620px">
        <div class="modal-header">
          <h2 class="modal-title">${isEdit ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}</h2>
          <button class="modal-close" type="button" data-action="close-customer-modal" aria-label="Tutup">×</button>
        </div>
        <form id="customer-form" data-mode="${isEdit ? "edit" : "add"}" data-customer-id="${customer?.id || ""}" novalidate>
          <div class="modal-form">
            <div class="form-group">
              <label class="form-label">Tipe Pelanggan *</label>
              <div class="flex gap-3 flex-wrap">
                <label><input type="radio" name="type" value="individual" ${selectedType === "individual" ? "checked" : ""}> Individual</label>
                <label><input type="radio" name="type" value="perusahaan" ${selectedType === "perusahaan" ? "checked" : ""}> Perusahaan</label>
                <label><input type="radio" name="type" value="instansi" ${selectedType === "instansi" ? "checked" : ""}> Instansi</label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="customer-name" id="customer-name-label">${selectedType === "individual" ? "Nama Lengkap *" : "Nama Perusahaan *"}</label>
              <input class="form-input" id="customer-name" name="name" required placeholder="Nama pelanggan" value="${escapeAttr(customer?.name || "")}">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="customer-phone">Nomor HP *</label>
                <input class="form-input" id="customer-phone" name="phone" required placeholder="0812-xxxx-xxxx" value="${escapeAttr(customer?.phone || "")}">
                <p class="text-danger text-xs hidden" id="customer-phone-error">Nomor HP sudah terdaftar.</p>
              </div>
              <div class="form-group">
                <label class="form-label" for="customer-email">Email</label>
                <input class="form-input" id="customer-email" name="email" type="email" placeholder="email@domain.com" value="${escapeAttr(customer?.email || "")}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="customer-address">Alamat</label>
              <textarea class="form-input" id="customer-address" name="address" rows="2" placeholder="Alamat pelanggan">${escapeHtml(customer?.address || "")}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="customer-notes">Catatan internal</label>
              <textarea class="form-input" id="customer-notes" name="notes" rows="2" placeholder="Preferensi, PIC, termin pembayaran, atau catatan relasi">${escapeHtml(customer?.notes || "")}</textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" type="button" data-action="close-customer-modal">Batal</button>
            <button class="btn-primary" type="submit">${isEdit ? "Simpan Perubahan" : "Simpan Pelanggan"}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function closeCustomerModal() {
  const root = document.getElementById("customer-modal-root") || document.getElementById("global-modal-root");
  if (root) root.innerHTML = "";
}

function submitCustomerForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const phone = String(data.phone || "").trim();
  const normalizedPhone = phone.replace(/\D/g, "");
  const isEdit = form.dataset.mode === "edit";
  const existingCustomerId = form.dataset.customerId;
  const exists = (window.APP_DATA?.customers || []).some((customer) => (
    customer.id !== existingCustomerId
    && String(customer.phone || "").replace(/\D/g, "") === normalizedPhone
  ));
  const errorEl = document.getElementById("customer-phone-error");

  if (!data.name || !phone) {
    showToast("Nama dan nomor HP wajib diisi.", "error");
    return;
  }

  if (exists) {
    if (errorEl) errorEl.classList.remove("hidden");
    showToast("Nomor HP sudah terdaftar.", "error");
    return;
  }

  if (isEdit) {
    const customer = (window.APP_DATA?.customers || []).find((item) => item.id === existingCustomerId);
    if (!customer) {
      showToast("Data pelanggan tidak ditemukan.", "error");
      return;
    }

    customer.type = data.type || "individual";
    customer.name = data.name.trim();
    customer.phone = phone;
    customer.email = data.email || "";
    customer.address = data.address || "";
    customer.segment = data.type === "individual" ? "Retail" : data.type === "instansi" ? "Instansi" : "Corporate";
    customer.notes = data.notes || "";
    customer.updatedAt = new Date().toISOString();

    (window.APP_DATA?.orders || []).forEach((order) => {
      if (order.customerId === customer.id) order.customerName = customer.name;
    });

    closeCustomerModal();
    showToast("Data pelanggan berhasil diperbarui.", "success");
    if (APP_STATE.currentRoute === "customer") {
      renderCustomerDetailPage(customer.id);
    } else {
      renderCustomersPage();
    }
    return;
  }

  if (!window.APP_DATA.customers) window.APP_DATA.customers = [];
  const nextId = `CUST-${String(window.APP_DATA.customers.length + 1).padStart(3, "0")}`;
  window.APP_DATA.customers.push({
    id: nextId,
    type: data.type || "individual",
    name: data.name.trim(),
    phone,
    email: data.email || "",
    address: data.address || "",
    segment: data.type === "individual" ? "Retail" : data.type === "instansi" ? "Instansi" : "Corporate",
    totalSpending: 0,
    totalOrders: 0,
    outstandingDebt: 0,
    lastOrderDate: null,
    notes: data.notes || "",
    createdAt: new Date().toISOString(),
  });

  closeCustomerModal();
  renderCustomersPage();
  showToast("Pelanggan baru berhasil ditambahkan", "success");
}

function startOrderForCustomer(customerId) {
  const customer = (window.APP_DATA?.customers || []).find((item) => item.id === customerId);
  if (!customer) return;
  localStorage.setItem("printeoo:prefill_customer", JSON.stringify(customer));
  window.location.hash = "#/order-new";
}

function getCustomerOrders(customerId) {
  return (window.APP_DATA?.orders || [])
    .filter((order) => order.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getCustomerInitials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";
}

function renderCustomerDetailPage(customerId) {
  const app = document.getElementById("app");
  const customer = (window.APP_DATA?.customers || []).find((item) => item.id === customerId);
  if (!app) return;

  if (!customer) {
    app.innerHTML = `
      <section class="card empty-state">
        <h1 class="page-title">Pelanggan tidak ditemukan</h1>
        <p class="text-muted">Data pelanggan ini tidak tersedia.</p>
        <a class="btn-secondary" href="#/customers">Kembali ke Daftar Pelanggan</a>
      </section>
    `;
    return;
  }

  updateBreadcrumb(`Pelanggan → ${customer.name}`, { customerId: "" });
  const orders = getCustomerOrders(customer.id);
  const typeMeta = getCustomerTypeMeta(customer.type);
  const averageOrder = customer.totalOrders > 0 ? customer.totalSpending / customer.totalOrders : 0;
  const debt = Number(customer.outstandingDebt || 0);
  const avatarColor = customer.type === "individual" ? "#6B7280" : customer.type === "instansi" ? "#16A34A" : "#2563EB";

  app.innerHTML = `
    <section class="customers-page" data-page="customer-detail">
      <div class="page-header">
        <div>
          <a class="btn-secondary btn-sm" href="#/customers">← Kembali ke Daftar Pelanggan</a>
        </div>
      </div>

      <article class="card" style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap">
          <div style="display:flex;gap:16px;align-items:center">
            <div style="width:64px;height:64px;border-radius:999px;background:${avatarColor};color:white;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">${getCustomerInitials(customer.name)}</div>
            <div>
              <h1 class="page-title" style="margin:0">${customer.name}</h1>
              <div class="flex gap-2 flex-wrap" style="margin-top:6px">
                <span class="badge ${typeMeta.className}">${typeMeta.label}</span>
                <span class="text-sm text-muted">${customer.phone}</span>
                ${customer.email ? `<span class="text-sm text-muted">${customer.email}</span>` : ""}
              </div>
            </div>
          </div>
          <div class="flex gap-2 flex-wrap">
            <button class="btn-secondary" type="button" data-action="open-customer-edit" data-customer-id="${customer.id}">Edit</button>
            <button class="btn-primary" type="button" data-action="new-order-for-customer" data-customer-id="${customer.id}">Buat Order Baru</button>
            ${debt > 0 ? `<button class="btn-secondary" type="button" data-action="open-payment-modal" data-customer-id="${customer.id}">Catat Pembayaran Piutang</button>` : ""}
          </div>
        </div>
      </article>

      <section class="metric-grid" style="margin-bottom:16px">
        <article class="metric-card"><span>Total Order</span><strong>${customer.totalOrders || orders.length}</strong></article>
        <article class="metric-card"><span>Total Spending</span><strong>${formatCurrency(customer.totalSpending || 0)}</strong></article>
        <article class="metric-card"><span>Rata-rata Nilai Order</span><strong>${formatCurrency(averageOrder)}</strong></article>
        <article class="metric-card"><span>Piutang Saat Ini</span><strong class="${debt > 0 ? "text-danger" : "text-success"}">${debt > 0 ? formatCurrency(debt) : "Lunas"}</strong></article>
      </section>

      <div class="tabs mb-4" style="margin-bottom:16px">
        ${[
          ["orders", "Riwayat Pesanan"],
          ["products", "Produk Favorit"],
          ["payments", "Piutang & Pembayaran"],
          ["notes", "Catatan"],
        ].map(([key, label]) => `<button class="tab-button ${APP_STATE.customerDetailTab === key ? "active" : ""}" type="button" data-customer-tab="${key}" data-customer-id="${customer.id}">${label}</button>`).join("")}
      </div>

      <div id="customer-detail-tab">
        ${renderCustomerDetailTab(customer, orders)}
      </div>
    </section>
  `;
}

function renderCustomerDetailTab(customer, orders) {
  if (APP_STATE.customerDetailTab === "products") return renderCustomerProductsTab(orders);
  if (APP_STATE.customerDetailTab === "payments") return renderCustomerPaymentsTab(customer, orders);
  if (APP_STATE.customerDetailTab === "notes") return renderCustomerNotesTab(customer);
  return renderCustomerOrdersTab(customer, orders);
}

function renderCustomerOrdersTab(customer, orders) {
  const filter = APP_STATE.customerOrderFilter;
  const filtered = orders.filter((order) => {
    if (filter === "active") return !["delivered", "closed", "cancelled"].includes(order.status);
    if (filter === "done") return ["delivered", "closed"].includes(order.status);
    if (filter === "cancelled") return order.status === "cancelled";
    return true;
  });

  const filterButtons = `
    <div class="tabs" style="margin-bottom:12px">
      ${[
        ["all", "Semua"],
        ["active", "Aktif"],
        ["done", "Selesai"],
        ["cancelled", "Dibatalkan"],
      ].map(([key, label]) => `<button class="tab-button ${filter === key ? "active" : ""}" type="button" data-customer-order-filter="${key}" data-customer-id="${customer.id}">${label}</button>`).join("")}
    </div>
  `;

  if (!filtered.length) {
    return filterButtons + `<div class="card empty-state"><p class="text-muted">Belum ada order untuk filter ini.</p></div>`;
  }

  return `
    ${filterButtons}
    <div class="data-table">
      <table>
        <thead><tr><th>No. SPK</th><th>Produk</th><th>Qty</th><th>Total</th><th>Status</th><th>Deadline</th><th>Aksi</th></tr></thead>
        <tbody>
          ${filtered.map((order) => `
            <tr>
              <td><a class="table-link" href="#/order/${encodeURIComponent(order.spkNumber)}">${order.spkNumber}</a></td>
              <td>${order.productName}</td>
              <td>${order.qty} ${order.unit}</td>
              <td><strong>${formatCurrency(order.total)}</strong></td>
              <td><span class="badge badge-${order.status}">${window.APP_DATA.statusLabels[order.status] || order.status}</span></td>
              <td>${formatRelativeDate(order.deadlineAt)}</td>
              <td><a class="btn-secondary btn-sm" href="#/order/${encodeURIComponent(order.spkNumber)}">Detail</a></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function getCustomerProductRows(orders) {
  const map = {};
  orders.forEach((order) => {
    if (!map[order.productId]) {
      map[order.productId] = { productName: order.productName, count: 0, qty: 0, value: 0 };
    }
    map[order.productId].count += 1;
    map[order.productId].qty += Number(order.qty) || 0;
    map[order.productId].value += Number(order.total) || 0;
  });
  return Object.values(map).sort((a, b) => b.count - a.count);
}

function renderCustomerProductsTab(orders) {
  const rows = getCustomerProductRows(orders);
  if (!rows.length) return `<div class="card empty-state"><p class="text-muted">Belum ada produk favorit karena pelanggan belum punya order.</p></div>`;
  const max = Math.max(...rows.slice(0, 5).map((row) => row.count), 1);
  const chart = `
    <div class="card" style="margin-bottom:16px">
      <h3 style="font-size:15px;font-weight:600;margin:0 0 12px">Top 5 Produk</h3>
      <svg viewBox="0 0 720 190" width="100%" role="img" aria-label="Bar chart produk favorit">
        ${rows.slice(0, 5).map((row, idx) => {
          const width = Math.max((row.count / max) * 460, 20);
          const y = 20 + idx * 32;
          return `<g><text x="0" y="${y + 18}" font-size="12" fill="#374151">${row.productName.slice(0, 34)}</text><rect x="250" y="${y}" width="${width}" height="20" rx="4" fill="#2563EB"/><text x="${260 + width}" y="${y + 15}" font-size="12" fill="#374151">${row.count} order</text></g>`;
        }).join("")}
      </svg>
    </div>
  `;
  return `
    ${chart}
    <div class="data-table">
      <table>
        <thead><tr><th>Produk</th><th>Jumlah Order</th><th>Total Qty</th><th>Total Nilai</th></tr></thead>
        <tbody>
          ${rows.map((row) => `<tr><td><strong>${row.productName}</strong></td><td>${row.count}</td><td>${Math.round(row.qty * 100) / 100}</td><td>${formatCurrency(row.value)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function getOutstandingOrders(orders) {
  return orders.filter((order) => Math.max(order.total - (order.paidAmount || 0), 0) > 0 && order.status !== "cancelled");
}

function renderCustomerPaymentsTab(customer, orders) {
  const debtOrders = getOutstandingOrders(orders);
  const totalDebt = debtOrders.reduce((sum, order) => sum + Math.max(order.total - (order.paidAmount || 0), 0), 0);
  const paymentRows = orders
    .filter((order) => (order.paidAmount || 0) > 0)
    .map((order) => `<tr><td>${formatDate(order.updatedAt || order.createdAt)}</td><td>${order.spkNumber}</td><td>${formatCurrency(order.paidAmount)}</td><td>Transfer / Kasir</td></tr>`)
    .join("");

  if (!totalDebt) {
    return `
      <div class="card" style="border-color:#BBF7D0;background:#F0FDF4;margin-bottom:16px">
        <strong class="text-success">✓ Tidak ada piutang outstanding</strong>
      </div>
      ${renderPaymentHistoryTable(paymentRows)}
    `;
  }

  return `
    <div class="card" style="margin-bottom:16px">
      <div class="card-section-header">
        <div>
          <h3 class="card-title">Total Piutang: ${formatCurrency(totalDebt)}</h3>
          <p class="card-description">${debtOrders.length} SPK belum lunas.</p>
        </div>
        <button class="btn-primary" type="button" data-action="open-payment-modal" data-customer-id="${customer.id}">Catat Pembayaran</button>
      </div>
    </div>
    <div class="data-table" style="margin-bottom:16px">
      <table>
        <thead><tr><th>No. SPK</th><th>Nilai SPK</th><th>Sudah Dibayar</th><th>Sisa</th><th>Jatuh Tempo</th><th>Aksi</th></tr></thead>
        <tbody>
          ${debtOrders.map((order) => {
            const balance = Math.max(order.total - (order.paidAmount || 0), 0);
            return `<tr><td>${order.spkNumber}</td><td>${formatCurrency(order.total)}</td><td>${formatCurrency(order.paidAmount || 0)}</td><td class="text-danger font-semibold">${formatCurrency(balance)}</td><td>${formatRelativeDate(order.deadlineAt)}</td><td><button class="btn-secondary btn-sm" type="button" data-action="open-payment-modal" data-customer-id="${customer.id}" data-spk-number="${order.spkNumber}">Catat Pembayaran</button></td></tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
    ${renderPaymentHistoryTable(paymentRows)}
  `;
}

function renderPaymentHistoryTable(paymentRows) {
  return `
    <div class="card">
      <h3 style="font-size:15px;font-weight:600;margin:0 0 12px">Riwayat Pembayaran</h3>
      ${paymentRows ? `<div class="data-table"><table><thead><tr><th>Tanggal</th><th>SPK</th><th>Nominal</th><th>Metode</th></tr></thead><tbody>${paymentRows}</tbody></table></div>` : `<p class="text-muted">Belum ada pembayaran tercatat.</p>`}
    </div>
  `;
}

function renderCustomerNotesTab(customer) {
  return `
    <div class="card">
      <div class="form-group">
        <label class="form-label" for="customer-notes-detail">Catatan internal</label>
        <textarea class="form-input" id="customer-notes-detail" rows="5">${customer.notes || ""}</textarea>
      </div>
      <div class="flex gap-3 flex-wrap items-center">
        <button class="btn-primary" type="button" data-action="save-customer-notes" data-customer-id="${customer.id}">Simpan Catatan</button>
        <span class="text-sm text-muted">Pelanggan sejak ${formatDate(customer.createdAt)} · Terakhir update ${formatDate(customer.updatedAt || customer.createdAt)}</span>
      </div>
    </div>
  `;
}

function openPaymentModal(customerId, spkNumber = "") {
  const root = document.getElementById("global-modal-root");
  const customer = (window.APP_DATA?.customers || []).find((item) => item.id === customerId);
  const orders = getOutstandingOrders(getCustomerOrders(customerId));
  if (!root || !customer) return;
  const selected = orders.find((order) => order.spkNumber === spkNumber) || orders[0];
  const balance = selected ? Math.max(selected.total - (selected.paidAmount || 0), 0) : 0;

  root.innerHTML = `
    <div class="modal-overlay" id="payment-modal">
      <div class="modal-box" style="max-width:520px">
        <div class="modal-header">
          <h2 class="modal-title">Catat Pembayaran Piutang</h2>
          <button class="modal-close" type="button" data-action="close-payment-modal" aria-label="Tutup">×</button>
        </div>
        <form id="customer-payment-form" data-customer-id="${customer.id}" novalidate>
          <div class="modal-form">
            <div class="form-group">
              <label class="form-label" for="payment-spk">SPK</label>
              <select class="form-select" id="payment-spk" name="spkNumber" required>
                ${orders.map((order) => `<option value="${order.spkNumber}" ${selected?.spkNumber === order.spkNumber ? "selected" : ""}>${order.spkNumber} - sisa ${formatCurrency(Math.max(order.total - (order.paidAmount || 0), 0))}</option>`).join("")}
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="payment-amount">Nominal</label>
                <input class="form-input" id="payment-amount" name="amount" type="number" min="1" value="${balance}" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="payment-method">Metode</label>
                <select class="form-select" id="payment-method" name="method">
                  <option value="transfer">Transfer</option>
                  <option value="cash">Tunai</option>
                  <option value="qris">QRIS</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" type="button" data-action="close-payment-modal">Batal</button>
            <button class="btn-primary" type="submit">Simpan Pembayaran</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function closePaymentModal() {
  const root = document.getElementById("global-modal-root");
  if (root) root.innerHTML = "";
}

function submitCustomerPayment(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const customer = (window.APP_DATA?.customers || []).find((item) => item.id === form.dataset.customerId);
  const order = (window.APP_DATA?.orders || []).find((item) => item.spkNumber === data.spkNumber);
  if (!customer || !order) return;
  const amount = Math.max(Number(data.amount) || 0, 0);
  const balance = Math.max(order.total - (order.paidAmount || 0), 0);
  const paid = Math.min(amount, balance);
  if (paid <= 0) {
    showToast("Nominal pembayaran tidak valid.", "error");
    return;
  }
  order.paidAmount = Math.min((order.paidAmount || 0) + paid, order.total);
  order.paymentStatus = order.paidAmount >= order.total ? "paid" : "partial";
  order.updatedAt = new Date().toISOString();
  customer.outstandingDebt = Math.max((customer.outstandingDebt || 0) - paid, 0);
  customer.updatedAt = new Date().toISOString();
  closePaymentModal();
  showToast("Pembayaran piutang berhasil dicatat.", "success");
  renderCustomerDetailPage(customer.id);
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

  try {
    const prefill = localStorage.getItem("printeoo:prefill_customer");
    if (prefill) {
      const customer = JSON.parse(prefill);
      APP_STATE.selectedCustomer = customer;
      document.getElementById("order-customer").value = customer.name || "";
      document.getElementById("order-customer-id").value = customer.id || "";
      document.getElementById("order-phone").value = formatPhone(customer.phone || "");
      renderOrderCustomerInfo(customer);
      localStorage.removeItem("printeoo:prefill_customer");
    }
  } catch (e) {}

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
  renderOrderCustomerInfo(customer);
}

function renderOrderCustomerInfo(customer) {
  const infoEl = document.getElementById("order-customer-info");
  if (!infoEl) return;

  if (!customer) {
    infoEl.innerHTML = "";
    return;
  }

  const meta = getCustomerTypeMeta(customer.type);
  const debt = Number(customer.outstandingDebt || 0);
  infoEl.innerHTML = `
    <div class="card" style="background:var(--neutral-50);padding:14px">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">
        <div>
          <div class="flex gap-2 flex-wrap items-center">
            <strong>${customer.name}</strong>
            <span class="badge ${meta.className}">${meta.label}</span>
          </div>
          <p class="text-sm text-muted" style="margin:6px 0 0">${customer.totalOrders || 0} order lifetime · ${formatCurrency(customer.totalSpending || 0)} total spending</p>
          ${debt > 0 ? `<p class="text-sm" style="margin:8px 0 0;color:var(--warning);font-weight:600">Pelanggan ini memiliki piutang ${formatCurrency(debt)}. Pastikan sudah dikonfirmasi.</p>` : `<p class="text-sm text-success" style="margin:8px 0 0;font-weight:600">Tidak ada piutang outstanding.</p>`}
        </div>
        <a class="btn-secondary btn-sm" href="#/customer/${encodeURIComponent(customer.id)}" target="_blank" rel="noopener">Lihat Detail Pelanggan</a>
      </div>
    </div>
  `;
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
  const existingCustomer = (window.APP_DATA?.customers || []).find((customer) => customer.id === customerId);
  if (existingCustomer) {
    existingCustomer.totalOrders = (Number(existingCustomer.totalOrders) || 0) + 1;
    existingCustomer.totalSpending = (Number(existingCustomer.totalSpending) || 0) + total;
    existingCustomer.outstandingDebt = (Number(existingCustomer.outstandingDebt) || 0) + Math.max(total - paidAmount, 0);
    existingCustomer.lastOrderDate = newOrder.createdAt;
    existingCustomer.updatedAt = newOrder.createdAt;
  }
  persistStoredOrders();
  updateSidebar(APP_STATE.currentRole);
  showToast(`Pesanan ${spkNumber} berhasil disimpan.`, "success");
  window.location.hash = `#/order/${encodeURIComponent(spkNumber)}`;
}

const ORDER_STAGES = [
  { status: "confirmed", label: "Terkonfirmasi" },
  { status: "design_queue", label: "Antrian Desain" },
  { status: "in_design", label: "Sedang Desain" },
  { status: "production_queue", label: "Antrian Cetak" },
  { status: "printing", label: "Sedang Cetak" },
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
    { label: "Kirim ke Antrian Cetak", nextStatus: "production_queue", note: "Desain selesai dan masuk antrian cetak" },
    { label: "Catat Revisi Desain", nextStatus: "in_design", note: "Revisi desain dicatat dan tetap dikerjakan" },
  ],
  production_queue: [
    { label: "Mulai Cetak", nextStatus: "printing", note: "Pesanan mulai proses cetak" },
  ],
  printing: [
    { label: "Selesai Cetak, Masuk Finishing", nextStatus: "finishing", note: "Cetak selesai dan masuk finishing" },
  ],
  finishing: [
    { label: "Selesai, Siap Diambil", nextStatus: "ready", note: "Pesanan selesai dan siap diambil" },
  ],
  ready: [
    { label: "Tandai Diambil", customAction: "mark-order-picked-up", note: "Pesanan ditandai sudah diambil customer" },
    { label: "Tandai Lunas", customAction: "mark-order-paid", secondary: true, note: "Pembayaran pesanan ditandai lunas" },
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

  const displayStatus = getOrderStatus(order);
  const statusLabel = window.APP_DATA.statusLabels[displayStatus] || displayStatus;
  const priorityClass = order.priority === "VIP" ? "badge-vip" : order.priority === "urgent" ? "badge-urgent" : "badge-confirmed";
  const items = getOrderItems(order);

  container.innerHTML = `
    <div class="detail-header">
      <div>
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="page-title">${order.spkNumber}</h1>
          <span class="badge badge-${displayStatus}">${statusLabel}</span>
          <span class="badge ${priorityClass}">${window.APP_DATA.priorityLabels[order.priority] || order.priority}</span>
        </div>
        <p class="page-subtitle">Dibuat ${formatDate(order.createdAt)} · Deadline ${formatRelativeDate(order.deadlineAt)} · ${items.length} item · Total ${formatCurrency(order.total)}</p>
      </div>
      <div class="flex gap-3 flex-wrap">
        <button class="btn-secondary" type="button" data-action="print-spk">Cetak SPK</button>
        <button class="btn-secondary" type="button" data-action="duplicate-order">Duplikat</button>
        <details class="more-actions">
          <summary class="btn-secondary">Lainnya</summary>
          <div class="more-actions-menu">
            <button class="btn-secondary btn-outline-danger" type="button" data-action="cancel-order">Batalkan SPK</button>
          </div>
        </details>
      </div>
    </div>

    ${renderProgressTracker(order)}

    <section class="order-detail-grid">
      ${renderOrderInfoCardV2(order)}
      ${renderTimelineCard(order)}
      ${renderActionCard(order)}
    </section>
  `;
}

function renderProgressTracker(order) {
  const currentStatus = getOrderStatus(order);
  const currentIndex = getStageIndex(currentStatus);
  const summary = getOrderStatusBreakdown(order);
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
      <p class="progress-summary">${getOrderItems(order).length} item: ${summary}</p>
    </section>
  `;
}

function renderOrderInfoCard(order) {
  const fileList = order.files?.length
    ? order.files.map((file) => `<li>${file.name}</li>`).join("")
    : "<li>Belum ada file</li>";
  const finishing = order.finishing?.length ? order.finishing.join(", ") : "Standar";
  const customer = (window.APP_DATA?.customers || []).find((item) => item.id === order.customerId);
  const customerLabel = customer
    ? `<a class="table-link" href="#/customer/${encodeURIComponent(customer.id)}">${order.customerName}</a>`
    : order.customerName;

  return `
    <article class="card detail-card">
      <h2 class="card-title">Info Pesanan</h2>
      <dl class="detail-list">
        <div><dt>Customer</dt><dd>${customerLabel}</dd></div>
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
                <thead><tr><th>Bahan</th><th>Qty Pakai</th><th>Waste</th><th>Batch</th><th>Kategori</th></tr></thead>
                <tbody>
                  ${usages.map((u, index) => {
                    const batch = getBatchById(u.batchId) || getFallbackBatchForUsage(u, index);
                    const batchId = u.batchId || batch?.batchId;
                    return `
                    <tr>
                      <td>${u.itemName}</td>
                      <td>${u.qtyUsed} ${u.unit}</td>
                      <td class="${u.qtyWaste > 0 ? "text-warning" : "text-muted"}">${u.qtyWaste} ${u.unit}</td>
                      <td>
                        ${batchId ? `
                          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start">
                            <code class="text-xs text-muted">${batchId}</code>
                            <button class="btn-secondary text-xs" type="button" data-action="open-batch-usage" data-batch-id="${batchId}">
                              Lihat Batch
                            </button>
                          </div>
                        ` : `
                          <button class="btn-secondary text-xs" type="button" data-action="open-item-batches" data-item-id="${u.itemId}">
                            Pilih Batch
                          </button>
                        `}
                      </td>
                      <td class="text-xs text-muted">${u.wasteCategory ? (wasteCatLabels[u.wasteCategory] || u.wasteCategory) : "—"}</td>
                    </tr>
                  `; }).join("")}
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

function renderOrderInfoCardV2(order) {
  const fileList = order.files?.length
    ? order.files.map((file) => `<li>${escapeHtml(file.name)}</li>`).join("")
    : "<li>Belum ada file</li>";
  const customer = (window.APP_DATA?.customers || []).find((item) => item.id === order.customerId);
  const customerLabel = customer
    ? `<a class="table-link" href="#/customer/${encodeURIComponent(customer.id)}">${escapeHtml(order.customerName)}</a>`
    : escapeHtml(order.customerName);
  const items = getOrderItems(order);

  return `
    <article class="card detail-card">
      <h2 class="card-title">Daftar Item</h2>
      <dl class="detail-list">
        <div><dt>Customer</dt><dd>${customerLabel}</dd></div>
        <div><dt>Jumlah Item</dt><dd>${items.length} item</dd></div>
        <div><dt>Total</dt><dd>${formatCurrency(order.total)}</dd></div>
        <div><dt>Dibayar</dt><dd>${formatCurrency(order.paidAmount || 0)}</dd></div>
        <div><dt>Sisa</dt><dd>${formatCurrency(Math.max(order.total - (order.paidAmount || 0), 0))}</dd></div>
        <div><dt>Deadline</dt><dd>${formatDate(order.deadlineAt)}</dd></div>
      </dl>

      <div class="order-item-list">
        ${items.map((item) => renderOrderDetailItem(order, item)).join("")}
      </div>

      <div class="mt-4">
        <h3 class="detail-subtitle">File Upload</h3>
        <ul class="file-list">${fileList}</ul>
      </div>

      ${shouldShowMaterialSection(order) ? `
        <div class="mt-4" style="border-top:1px solid var(--neutral-200);padding-top:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;flex-wrap:wrap">
            <h3 class="detail-subtitle" style="margin:0">Material & Waste per Item</h3>
            <div style="display:flex;gap:6px">
              <button class="btn-secondary" type="button" data-action="open-qr-scan" style="font-size:12px;padding:5px 10px">Scan QR</button>
              <button class="btn-primary" type="button" data-action="open-usage-waste-modal" data-spk-number="${order.spkNumber}" style="font-size:12px;padding:5px 10px">+ Catat Pemakaian</button>
            </div>
          </div>
          <div class="material-accordion">
            ${items.map((item) => renderMaterialWasteForItem(order, item)).join("")}
          </div>
        </div>
      ` : ""}
    </article>
  `;
}

function renderOrderDetailItem(order, item) {
  const status = item.status || getOrderStatus(order);
  const estimateText = formatMaterialRows(item.materialEstimate);
  const actualText = formatMaterialRows(item.materialActual, true);
  const deviationText = formatItemDeviation(item);

  return `
    <section class="order-item-card">
      <div class="order-item-card-header">
        <div>
          <span class="text-xs text-muted">ITEM ${item.seq || 1}</span>
          <h3>${escapeHtml(item.product || order.productName || "-")}</h3>
        </div>
        <span class="badge badge-${status}">${window.APP_DATA.statusLabels[status] || status}</span>
      </div>
      <p class="text-sm text-muted">${item.qty || 0} ${item.unit || ""} · ${formatCurrency(item.total || 0)} · ${escapeHtml(item.assignedTo || "Belum assigned")}</p>
      <p class="text-sm"><strong>Estimasi:</strong> ${estimateText}</p>
      <p class="text-sm"><strong>Aktual:</strong> ${actualText}</p>
      <p class="text-sm ${deviationText.includes('+') ? "text-warning" : "text-muted"}"><strong>Deviasi:</strong> ${deviationText}</p>
      ${item.notes ? `<p class="text-xs text-muted">${escapeHtml(item.notes)}</p>` : ""}
    </section>
  `;
}

function formatMaterialRows(rows = [], includeBatch = false) {
  if (!rows.length) return "belum direcord";
  return rows.map((row) => {
    const batch = includeBatch && row.batch ? ` (${row.batch})` : "";
    return `${row.qty} ${row.unit} ${row.material}${batch}`;
  }).join(", ");
}

function formatItemDeviation(item) {
  const estimate = item.materialEstimate || [];
  const actual = item.materialActual || [];
  if (!estimate.length) return "-";
  if (!actual.length) return "belum ada aktual";
  const firstEstimate = estimate[0];
  const firstActual = actual.find((row) => row.material === firstEstimate.material) || actual[0];
  const diff = Math.round(((Number(firstActual.qty) || 0) - (Number(firstEstimate.qty) || 0)) * 100) / 100;
  const pct = firstEstimate.qty ? Math.round((diff / firstEstimate.qty) * 1000) / 10 : 0;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff} ${firstEstimate.unit} (${sign}${pct}%)`;
}

function shouldShowMaterialSection(order) {
  return getOrderItems(order).some((item) => ["printing", "finishing", "ready"].includes(item.status));
}

function renderMaterialWasteForItem(order, item) {
  const usages = (window.APP_DATA?.usageLog || []).filter((u) => (
    u.spkNumber === order.spkNumber
    && (!u.orderItemId || u.orderItemId === item.itemId || u.productName === item.product)
  ));
  const rows = usages.length
    ? usages.map((usage, index) => renderUsageRow(usage, index)).join("")
    : `<tr><td colspan="5" class="text-muted text-sm">Belum ada material dicatat untuk item ini.</td></tr>`;

  return `
    <details class="material-item" open>
      <summary>Material — Item ${item.seq || 1}: ${escapeHtml(item.product || order.productName || "-")}</summary>
      <div class="data-table" style="margin-top:10px">
        <table>
          <thead><tr><th>Bahan</th><th>Qty Pakai</th><th>Waste</th><th>Batch</th><th>Kategori</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </details>
  `;
}

function renderUsageRow(usage, index) {
  const wasteCatLabels = { cutting: "Cutting", misprint: "Gagal Cetak", overflow: "Kelebihan", calibration: "Setup Loss", damage: "Kerusakan" };
  const batch = getBatchById(usage.batchId) || getFallbackBatchForUsage(usage, index);
  const batchId = usage.batchId || batch?.batchId;
  return `
    <tr>
      <td>${escapeHtml(usage.itemName)}</td>
      <td>${usage.qtyUsed} ${usage.unit}</td>
      <td class="${usage.qtyWaste > 0 ? "text-warning" : "text-muted"}">${usage.qtyWaste} ${usage.unit}</td>
      <td>
        ${batchId ? `
          <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-start">
            <code class="text-xs text-muted">${batchId}</code>
            <button class="btn-secondary text-xs" type="button" data-action="open-batch-usage" data-batch-id="${batchId}">Lihat Batch</button>
          </div>
        ` : `
          <button class="btn-secondary text-xs" type="button" data-action="open-item-batches" data-item-id="${usage.itemId}">Pilih Batch</button>
        `}
      </td>
      <td class="text-xs text-muted">${usage.wasteCategory ? (wasteCatLabels[usage.wasteCategory] || usage.wasteCategory) : "-"}</td>
    </tr>
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
  const displayStatus = getOrderStatus(order);
  let actions = ORDER_ACTIONS[displayStatus] || [];
  if (displayStatus === "ready") {
    actions = actions.filter((action) => {
      if (action.customAction === "mark-order-picked-up") return !["delivered", "closed"].includes(order.status);
      if (action.customAction === "mark-order-paid") return order.paymentStatus !== "paid";
      return true;
    });
  }
  return `
    <article class="card detail-card">
      <h2 class="card-title">Aksi & Catatan</h2>
      <div class="action-stack">
        ${actions.length ? actions.map((action) => `
          <button class="${action.secondary ? "btn-secondary" : "btn-primary"} w-full" type="button" data-action="${action.customAction || "advance-order"}" data-status="${action.nextStatus || ""}" data-note="${action.note}">
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

  const currentStatus = getOrderStatus(order);
  if (Array.isArray(order.items) && order.items.length) {
    order.items.forEach((item) => {
      if (item.status === currentStatus) item.status = nextStatus;
    });
    order.derivedStatus = getOrderStatus(order);
    order.status = ["delivered", "closed"].includes(order.status) ? order.status : order.derivedStatus;
  } else {
    order.status = nextStatus;
  }
  order.updatedAt = new Date().toISOString();
  order.productionStage = window.APP_DATA.statusLabels[getOrderStatus(order)] || getOrderStatus(order);
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

function markCurrentOrderPickedUp() {
  const order = findOrderBySpk(APP_STATE.routeParams.spkNumber);
  if (!order) return;
  order.status = "delivered";
  order.updatedAt = new Date().toISOString();
  order.timeline = order.timeline || [];
  order.timeline.push({
    at: new Date().toISOString(),
    status: "delivered",
    user: APP_STATE.currentUser.name,
    note: "Pesanan ditandai sudah diambil customer",
  });
  persistStoredOrders();
  renderOrderDetailPage();
  showToast("Pesanan ditandai sudah diambil.", "success");
}

function markCurrentOrderPaid() {
  const order = findOrderBySpk(APP_STATE.routeParams.spkNumber);
  if (!order) return;
  order.paidAmount = order.total;
  order.paymentStatus = "paid";
  order.status = order.status === "delivered" ? "closed" : order.status;
  order.updatedAt = new Date().toISOString();
  order.timeline = order.timeline || [];
  order.timeline.push({
    at: new Date().toISOString(),
    status: order.status === "closed" ? "closed" : "payment",
    user: APP_STATE.currentUser.name,
    note: "Pembayaran pesanan ditandai lunas",
  });
  persistStoredOrders();
  renderOrderDetailPage();
  showToast("Pembayaran ditandai lunas.", "success");
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
    derivedStatus: "confirmed",
    items: getOrderItems(order).map((item, index) => ({
      ...item,
      itemId: `ITEM-${sequence}-${String(index + 1).padStart(2, "0")}`,
      seq: index + 1,
      status: "confirmed",
      materialActual: [],
    })),
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
  { id: "print_queue", label: "Antrian Cetak", statuses: ["production_queue"], printQueue: true },
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
  const activeItems = getProductionItems();
  const scrollHint = document.getElementById("production-scroll-hint");
  if (scrollHint) {
    scrollHint.textContent = columns.length > 3
      ? "Geser horizontal untuk melihat semua kolom produksi."
      : "";
  }

  board.innerHTML = columns.map((column) => {
    const items = activeItems.filter((productionItem) => itemBelongsToColumn(productionItem, column));
    return `
      <section class="kanban-column">
        <header class="kanban-column-header">
          <h2>${column.label}</h2>
          <span class="nav-badge">${items.length}</span>
        </header>
        <div class="kanban-card-list">
          ${items.length ? items.map(renderProductionCard).join("") : '<div class="kanban-empty">Tidak ada item</div>'}
        </div>
      </section>
    `;
  }).join("");
}

function getProductionItems() {
  return (window.APP_DATA?.orders || []).flatMap((order) => {
    const isActive = !["cancelled", "closed", "delivered"].includes(order.status);
    if (!isActive) return [];

    const items = getOrderItems(order);
    return items.map((item, index) => ({
      order,
      item,
      itemIndex: index + 1,
      itemTotal: items.length,
    })).filter(({ item }) => {
      const isItemOpen = !["ready", "delivered", "closed", "cancelled"].includes(item.status);
      return APP_STATE.productionFilter === "all"
        || (APP_STATE.productionFilter === "urgent" && ["urgent", "VIP"].includes(order.priority))
        || (APP_STATE.productionFilter === "overdue" && isOrderOverdue(order) && isItemOpen);
    });
  });
}

function itemBelongsToColumn(productionItem, column) {
  const itemStatus = productionItem.item.status || productionItem.order.status || "confirmed";
  return column.statuses.includes(itemStatus);
}

function renderProductionCard(productionItem) {
  const { order, item, itemIndex, itemTotal } = productionItem;
  const overdue = isOrderOverdue(order);
  const dueToday = formatRelativeDate(order.deadlineAt) === "Hari ini";
  const priorityClass = order.priority === "VIP" ? "badge-vip" : order.priority === "urgent" ? "badge-urgent" : "";
  const cardTone = overdue ? "overdue" : ["urgent", "VIP"].includes(order.priority) ? "urgent" : "";
  const assignee = item.assignedTo || "";
  const operator = (window.APP_DATA?.employees || []).find((employee) => employee.name === assignee || employee.id === order.operatorId || employee.id === order.designerId);
  const assigneeName = assignee || operator?.name || "Belum assigned";
  const itemLabel = `Item ${item.seq || itemIndex}/${itemTotal}`;

  return `
    <article class="kanban-card ${cardTone}" data-production-spk="${escapeAttr(order.spkNumber)}" data-production-item-id="${escapeAttr(item.itemId)}">
      <div class="kanban-item-label">${order.spkNumber} · ${itemLabel}</div>
      <h3>${item.product}</h3>
      <p>${order.customerName}</p>
      <div class="kanban-card-meta">
        <span class="${overdue ? "text-danger font-semibold" : dueToday ? "text-warning font-semibold" : "text-muted"}">${formatRelativeDate(order.deadlineAt)}</span>
        ${priorityClass ? `<span class="badge ${priorityClass}">${window.APP_DATA.priorityLabels[order.priority]}</span>` : ""}
      </div>
      <div class="kanban-card-meta">
        <span class="badge badge-${item.status || "confirmed"}">${window.APP_DATA.statusLabels[item.status] || item.status || "Terkonfirmasi"}</span>
        <span class="text-xs text-muted">${item.qty || 0} ${item.unit || ""}</span>
      </div>
      <div class="kanban-card-footer">
        <span class="mini-avatar">${assigneeName.charAt(0)}</span>
        <span>${assigneeName}</span>
      </div>
    </article>
  `;
}

function openProductionModal(spkNumber, itemId) {
  APP_STATE.selectedProductionSpk = spkNumber;
  APP_STATE.selectedProductionItemId = itemId || null;
  const modalRoot = document.getElementById("production-modal-root");
  const order = findOrderBySpk(spkNumber);
  if (!modalRoot || !order) return;

  const items = getOrderItems(order);
  const item = items.find((candidate) => candidate.itemId === itemId) || items[0];
  const itemIndex = Math.max(items.findIndex((candidate) => candidate.itemId === item.itemId), 0) + 1;
  const itemLabel = `Item ${item.seq || itemIndex}/${items.length}`;
  const nextAction = getNextProductionAction(item);
  const materialRows = formatMaterialRows(item.materialEstimate || [], false) || `<p class="text-muted text-sm">Belum ada estimasi material.</p>`;
  modalRoot.innerHTML = `
    <div class="modal-overlay" data-action="close-production-modal">
      <section class="modal-box production-modal" role="dialog" aria-modal="true" aria-label="Detail produksi">
        <header class="modal-header">
          <div>
            <h2 class="card-title">${order.spkNumber}</h2>
            <p class="card-description">${order.customerName} · ${itemLabel}</p>
          </div>
        </header>
        <div class="modal-body">
          <dl class="detail-list">
            <div><dt>Produk</dt><dd>${item.product}</dd></div>
            <div><dt>Status Item</dt><dd>${window.APP_DATA.statusLabels[item.status] || item.status}</dd></div>
            <div><dt>Prioritas</dt><dd>${window.APP_DATA.priorityLabels[order.priority] || order.priority}</dd></div>
            <div><dt>Deadline</dt><dd>${formatRelativeDate(order.deadlineAt)}</dd></div>
            <div><dt>Qty</dt><dd>${item.qty} ${item.unit}</dd></div>
            <div><dt>Assignee</dt><dd>${item.assignedTo || "Belum assigned"}</dd></div>
            <div><dt>Total Item</dt><dd>${formatCurrency(item.total)}</dd></div>
          </dl>
          <div class="note-box mt-4">
            <strong>Estimasi Material</strong>
            ${materialRows}
          </div>
          <div class="note-box mt-4">
            <strong>Catatan</strong>
            <p>${item.notes || order.notes || "Tidak ada catatan operator."}</p>
          </div>
        </div>
        <footer class="modal-footer">
          <a class="btn-secondary" href="#/order/${encodeURIComponent(order.spkNumber)}" data-action="close-production-modal">Buka Detail SPK Lengkap →</a>
          <button class="btn-secondary" type="button" data-action="close-production-modal">Tutup</button>
          ${nextAction ? `<button class="btn-primary" type="button" data-action="production-update-status" data-status="${nextAction.nextStatus}" data-note="${nextAction.note}">${nextAction.label}</button>` : ""}
        </footer>
      </section>
    </div>
  `;
}

function getNextProductionAction(item) {
  const actions = ORDER_ACTIONS[item.status] || [];
  return actions.find((action) => action.nextStatus) || null;
}

function closeProductionModal() {
  const modalRoot = document.getElementById("production-modal-root");
  if (modalRoot) modalRoot.innerHTML = "";
  APP_STATE.selectedProductionSpk = null;
  APP_STATE.selectedProductionItemId = null;
}

function updateProductionStatus(nextStatus, note) {
  const order = findOrderBySpk(APP_STATE.selectedProductionSpk);
  if (!order) return;
  const items = getOrderItems(order);
  const item = items.find((candidate) => candidate.itemId === APP_STATE.selectedProductionItemId) || items[0];
  if (!item) return;

  item.status = nextStatus;
  const derivedStatus = getOrderStatus(order);
  order.derivedStatus = derivedStatus;
  if (!["delivered", "closed", "cancelled"].includes(order.status)) {
    order.status = derivedStatus;
  }
  order.updatedAt = new Date().toISOString();
  order.productionStage = window.APP_DATA.statusLabels[derivedStatus] || derivedStatus;
  order.timeline = order.timeline || [];
  order.timeline.push({
    at: new Date().toISOString(),
    status: nextStatus,
    user: APP_STATE.currentUser.name,
    note: `${item.product}: ${note || "Status item diperbarui dari papan produksi"}`,
  });

  persistStoredOrders();
  closeProductionModal();
  renderProductionBoard();
  updateSidebar(APP_STATE.currentRole);
  showToast(`Item pindah ke ${window.APP_DATA.statusLabels[nextStatus] || nextStatus}.`, "success");
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
    ? `<div class="dashboard-alert"><strong>${lowStock.length} bahan menipis.</strong> <span>Segera lakukan pembelian.</span> <button class="btn-secondary" type="button" data-action="open-po-modal" data-item-id="${lowStock[0].id}" style="margin-left:auto">Buat PO</button></div>`
    : "";

  if (activeTab === "stok") {
    tabContent.innerHTML = renderInventoryStokTab(inventory);
  } else if (activeTab === "incoming") {
    tabContent.innerHTML = renderInventoryIncomingTab();
  } else if (activeTab === "opname") {
    tabContent.innerHTML = renderInventoryOpnameTab();
  } else if (activeTab === "po") {
    tabContent.innerHTML = renderInventoryPurchaseOrderTab();
  } else if (activeTab === "usage") {
    tabContent.innerHTML = renderInventoryUsageTab(APP_STATE.usagePeriod);
  } else if (activeTab === "waste") {
    tabContent.innerHTML = renderInventoryWasteTab(APP_STATE.wastePeriod);
  }
}

function renderInventoryStokTab(inventory) {
  return `
    ${renderScanBatchPanel()}
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Nama Bahan</th>
            <th>Kategori</th>
            <th>Stok</th>
            <th>Batch</th>
            <th>Satuan</th>
            <th>Min. Stok</th>
            <th>Status</th>
            <th>Aksi</th>
            <th style="width:56px">QR</th>
          </tr>
        </thead>
        <tbody>
          ${inventory.map((item) => {
            const status = getInventoryStatus(item);
            const activeBatches = getInventoryBatches(item.id).filter((batch) => batch.status === "aktif" || batch.qtyRemaining > 0);
            return `
              <tr>
                <td><strong>${item.name}</strong><div class="text-xs text-muted">${item.supplier}</div></td>
                <td>${item.category}</td>
                <td><strong>${item.stock}</strong></td>
                <td>
                  <button class="btn-secondary text-xs" type="button" data-action="open-item-batches" data-item-id="${item.id}">
                    ${activeBatches.length} batch
                  </button>
                </td>
                <td>${item.unit}</td>
                <td>${item.minStock}</td>
                <td><span class="badge ${status.className}">${status.label}</span></td>
                <td>
                  ${item.stock <= item.minStock ? `<button class="btn-secondary text-xs" type="button" data-action="open-po-modal" data-item-id="${item.id}">Buat PO</button>` : `<span class="text-xs text-muted">-</span>`}
                </td>
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

function getAllBatches() {
  const explicit = window.APP_DATA?.batches || [];
  if (explicit.length) return explicit;

  return (window.APP_DATA?.incomingLog || []).map((entry) => ({
    batchId: entry.batchId,
    itemId: entry.itemId,
    itemName: entry.itemName,
    qtyInitial: entry.qty,
    qtyRemaining: entry.qty,
    unit: entry.unit,
    supplier: entry.supplier,
    receivedDate: entry.receivedDate,
    pricePerUnit: entry.pricePerUnit,
    status: entry.qty > 0 ? "aktif" : "habis",
  }));
}

function getBatchById(batchId) {
  if (!batchId) return null;
  return getAllBatches().find((batch) => batch.batchId === batchId || batch.id === batchId || batch.batchNumber === batchId) || null;
}

function getInventoryBatches(itemId) {
  return getAllBatches().filter((batch) => batch.itemId === itemId || batch.materialId === itemId);
}

function getFallbackBatchForUsage(entry, index = 0) {
  const batches = getInventoryBatches(entry.itemId);
  if (!batches.length) return null;
  const active = batches.filter((batch) => batch.status === "aktif" || batch.qtyRemaining > 0);
  return (active.length ? active : batches)[index % (active.length || batches.length)];
}

function backfillUsageBatchIds() {
  const usageLog = window.APP_DATA?.usageLog || [];
  let changed = false;
  usageLog.forEach((entry, index) => {
    if (entry.batchId) return;
    const batch = getFallbackBatchForUsage(entry, index);
    if (batch?.batchId) {
      entry.batchId = batch.batchId;
      changed = true;
    }
  });
  return changed;
}

function getBatchUsageLog(batchId) {
  return (window.APP_DATA?.usageLog || []).filter((entry) => entry.batchId === batchId);
}

function renderScanBatchPanel() {
  return `
    <div class="card mb-4" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:end;gap:12px;flex-wrap:wrap">
        <div>
          <h3 class="card-title" style="font-size:16px;margin:0">Scan Batch</h3>
          <p class="card-description">Masukkan Batch ID atau gunakan flow scan QR untuk melihat riwayat material lengkap.</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input class="form-input" id="batch-trace-input" type="text" placeholder="Contoh: BATCH-20260515-001" style="min-width:260px">
          <button class="btn-primary" type="button" data-action="lookup-batch-trace">Cari Batch</button>
          <button class="btn-secondary" type="button" data-action="open-qr-scan">Scan QR</button>
        </div>
      </div>
    </div>
  `;
}

function openItemBatchesModal(itemId) {
  const root = document.getElementById("inventory-modal-root") || document.getElementById("global-modal-root");
  const item = (window.APP_DATA?.inventory || []).find((inv) => inv.id === itemId);
  if (!root || !item) return;

  const batches = getInventoryBatches(itemId).sort((a, b) => new Date(b.receivedDate) - new Date(a.receivedDate));
  const rows = batches.map((batch) => {
    const used = Math.max((Number(batch.qtyInitial) || 0) - (Number(batch.qtyRemaining) || 0), 0);
    const status = batch.status === "habis" || batch.qtyRemaining <= 0 ? "habis" : "aktif";
    return `
      <tr>
        <td><code class="text-xs">${batch.batchId}</code></td>
        <td>${formatDate(new Date(batch.receivedDate))}</td>
        <td>${batch.supplier}</td>
        <td>${batch.qtyInitial} ${batch.unit}</td>
        <td>${Math.round(used * 1000) / 1000} ${batch.unit}</td>
        <td>${batch.qtyRemaining} ${batch.unit}</td>
        <td><span class="badge ${status === "aktif" ? "badge-ready" : "badge-draft"}">${status === "aktif" ? "Aktif" : "Habis"}</span></td>
        <td><button class="btn-secondary text-xs" type="button" data-action="open-batch-usage" data-batch-id="${batch.batchId}">Lihat Penggunaan</button></td>
      </tr>
    `;
  }).join("");

  root.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-box" style="max-width:940px">
        <div class="modal-header">
          <h2 class="modal-title">Batch Bahan ${item.name}</h2>
          <button class="modal-close" type="button" data-action="close-inventory-modal" aria-label="Tutup">×</button>
        </div>
        ${batches.length ? `
          <div class="data-table">
            <table>
              <thead><tr><th>Batch ID</th><th>Masuk</th><th>Supplier</th><th>Qty Awal</th><th>Qty Terpakai</th><th>Qty Tersisa</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        ` : `<div class="card empty-state"><p class="text-muted">Belum ada batch untuk bahan ini.</p></div>`}
      </div>
    </div>
  `;
}

function openBatchUsageModal(batchId) {
  const root = document.getElementById("inventory-modal-root") || document.getElementById("global-modal-root");
  const batch = getBatchById(batchId);
  if (!root) return;
  if (!batch) {
    showToast("Batch ID tidak ditemukan.", "error");
    return;
  }

  const usages = getBatchUsageLog(batch.batchId).sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt));
  const totalUsed = usages.reduce((sum, entry) => sum + (Number(entry.qtyUsed) || 0) + (Number(entry.qtyWaste) || 0), 0);
  const percent = batch.qtyInitial > 0 ? Math.min((totalUsed / batch.qtyInitial) * 100, 100).toFixed(1) : "0.0";
  const rows = usages.map((entry) => {
    const order = findOrderBySpk(entry.spkNumber);
    return `
      <tr>
        <td><button class="btn-secondary text-xs" type="button" data-action="navigate-spk" data-spk-number="${entry.spkNumber}">${entry.spkNumber}</button></td>
        <td>${order?.customerName || "-"}</td>
        <td>${entry.productName}</td>
        <td>${entry.qtyUsed} ${entry.unit}</td>
        <td>${entry.qtyWaste || 0} ${entry.unit}</td>
        <td>${formatDate(new Date(entry.usedAt))}</td>
        <td>${entry.operatorName}</td>
      </tr>
    `;
  }).join("");

  root.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-box" style="max-width:980px">
        <div class="modal-header">
          <h2 class="modal-title">Penggunaan Batch ${batch.batchId}</h2>
          <button class="modal-close" type="button" data-action="close-inventory-modal" aria-label="Tutup">×</button>
        </div>
        <div class="grid" style="margin-bottom:16px">
          <div class="col-4"><div class="text-xs text-muted">Bahan</div><strong>${batch.itemName}</strong></div>
          <div class="col-4"><div class="text-xs text-muted">Tanggal Masuk</div><strong>${formatDate(new Date(batch.receivedDate))}</strong></div>
          <div class="col-4"><div class="text-xs text-muted">Supplier</div><strong>${batch.supplier}</strong></div>
          <div class="col-4"><div class="text-xs text-muted">Qty Awal</div><strong>${batch.qtyInitial} ${batch.unit}</strong></div>
          <div class="col-4"><div class="text-xs text-muted">Qty Tersisa</div><strong>${batch.qtyRemaining} ${batch.unit}</strong></div>
          <div class="col-4"><div class="text-xs text-muted">Status</div><span class="badge ${batch.status === "aktif" ? "badge-ready" : "badge-draft"}">${batch.status === "aktif" ? "Aktif" : "Habis"}</span></div>
        </div>
        <h3 style="font-size:15px;font-weight:600;margin:0 0 12px">SPK yang menggunakan batch ini</h3>
        ${usages.length ? `
          <div class="data-table">
            <table>
              <thead><tr><th>No. SPK</th><th>Customer</th><th>Produk</th><th>Qty Dipakai</th><th>Qty Waste</th><th>Tanggal</th><th>Operator</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <p class="text-sm text-muted" style="margin:12px 0 0">Total terpakai: ${Math.round(totalUsed * 1000) / 1000} ${batch.unit} dari ${batch.qtyInitial} ${batch.unit} awal (${percent}% terpakai)</p>
        ` : `<div class="card empty-state"><p class="text-muted">Belum ada SPK yang memakai batch ini.</p></div>`}
      </div>
    </div>
  `;
}

function getPoStatusMeta(status) {
  const map = {
    draft: { label: "Draft", className: "badge-draft" },
    sent: { label: "Dikirim", className: "badge-confirmed" },
    partial: { label: "Partial", className: "badge-printing" },
    received: { label: "Diterima", className: "badge-ready" },
    cancelled: { label: "Dibatalkan", className: "badge-overdue" },
  };
  return map[status] || map.draft;
}

function getPurchaseOrderTotal(po) {
  return (po.items || []).reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.pricePerUnit) || 0), 0);
}

function getPurchaseOrderById(poId) {
  return (window.APP_DATA?.purchaseOrders || []).find((po) => po.id === poId);
}

function generatePurchaseOrderId() {
  const d = new Date();
  const date = toCompactDate(d);
  const sameDayCount = (window.APP_DATA?.purchaseOrders || []).filter((po) => po.id.includes(`PO-${date}`)).length + 1;
  return `PO-${date}-${String(sameDayCount).padStart(3, "0")}`;
}

function persistPurchaseOrders() {
  localStorage.setItem("printeoo:purchase_orders", JSON.stringify(window.APP_DATA?.purchaseOrders || []));
}

function renderInventoryPurchaseOrderTab() {
  const purchaseOrders = window.APP_DATA?.purchaseOrders || [];
  const inventory = window.APP_DATA?.inventory || [];
  const suppliers = [...new Set([
    ...purchaseOrders.map((po) => po.supplier),
    ...inventory.map((item) => item.supplier),
  ].filter(Boolean))].sort();

  const filtered = purchaseOrders
    .filter((po) => APP_STATE.poFilters.status === "all" || po.status === APP_STATE.poFilters.status)
    .filter((po) => APP_STATE.poFilters.supplier === "all" || po.supplier === APP_STATE.poFilters.supplier)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const rows = filtered.map((po) => {
    const meta = getPoStatusMeta(po.status);
    const itemSummary = (po.items || []).map((item) => `${item.itemName} (${item.qty} ${item.unit})`).join(", ");
    return `
      <tr>
        <td><strong>${po.id}</strong></td>
        <td>${po.supplier}</td>
        <td class="text-sm">${itemSummary}</td>
        <td><strong>${formatCurrency(getPurchaseOrderTotal(po))}</strong></td>
        <td>${formatDate(new Date(po.createdAt))}</td>
        <td><span class="badge ${meta.className}">${meta.label}</span></td>
        <td>
          <button class="btn-secondary text-xs" type="button" data-action="view-po-detail" data-po-id="${po.id}">Detail</button>
        </td>
      </tr>
    `;
  }).join("");

  return `
    <div class="card mb-4" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px">
      <div>
        <h2 class="card-title" style="margin:0">Purchase Order</h2>
        <p class="card-description">Buat dan pantau PO bahan ke supplier sampai barang diterima.</p>
      </div>
      <button class="btn-primary" type="button" data-action="open-po-modal">+ Buat PO Baru</button>
    </div>
    <div class="card mb-4" style="display:flex;gap:12px;align-items:end;flex-wrap:wrap;margin-bottom:16px">
      <div class="form-group" style="margin:0;min-width:180px">
        <label class="form-label" for="po-status-filter">Status</label>
        <select class="form-select" id="po-status-filter">
          ${[
            ["all", "Semua Status"],
            ["draft", "Draft"],
            ["sent", "Dikirim"],
            ["partial", "Partial"],
            ["received", "Diterima"],
            ["cancelled", "Dibatalkan"],
          ].map(([value, label]) => `<option value="${value}" ${APP_STATE.poFilters.status === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </div>
      <div class="form-group" style="margin:0;min-width:220px">
        <label class="form-label" for="po-supplier-filter">Supplier</label>
        <select class="form-select" id="po-supplier-filter">
          <option value="all">Semua Supplier</option>
          ${suppliers.map((supplier) => `<option value="${supplier}" ${APP_STATE.poFilters.supplier === supplier ? "selected" : ""}>${supplier}</option>`).join("")}
        </select>
      </div>
      <span class="text-sm text-muted">Menampilkan ${filtered.length} dari ${purchaseOrders.length} PO</span>
    </div>
    ${filtered.length ? `
      <div class="data-table">
        <table>
          <thead>
            <tr>
              <th>No. PO</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Total Nilai</th>
              <th>Tgl Dibuat</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    ` : `<div class="card empty-state"><p class="text-muted">Tidak ada PO sesuai filter.</p></div>`}
  `;
}

function getPoItemRow(item = {}, index = 0) {
  const inventory = window.APP_DATA?.inventory || [];
  const selectedItem = inventory.find((i) => i.id === item.itemId);
  const unit = item.unit || selectedItem?.unit || "";
  const price = item.pricePerUnit ?? selectedItem?.avgCost ?? 0;
  return `
    <tr data-po-item-row>
      <td>
        <select class="form-select" name="itemId" data-po-item-select required>
          <option value="">Pilih bahan</option>
          ${inventory.map((inv) => `<option value="${inv.id}" data-unit="${inv.unit}" data-price="${inv.avgCost}" data-supplier="${inv.supplier}" ${item.itemId === inv.id ? "selected" : ""}>${inv.name}</option>`).join("")}
        </select>
      </td>
      <td><input class="form-input" name="qty" type="number" min="0.01" step="0.01" value="${item.qty || ""}" placeholder="0" data-po-line-input required></td>
      <td><input class="form-input" name="unit" type="text" value="${unit}" readonly data-po-unit></td>
      <td><input class="form-input" name="pricePerUnit" type="number" min="0" value="${price}" data-po-line-input required></td>
      <td><strong data-po-line-subtotal>${formatCurrency((Number(item.qty) || 0) * (Number(price) || 0))}</strong></td>
      <td><button class="btn-secondary text-xs" type="button" data-action="remove-po-item" ${index === 0 ? "disabled" : ""}>Hapus</button></td>
    </tr>
  `;
}

function openPurchaseOrderModal(prefillItemId = null) {
  const root = document.getElementById("inventory-modal-root");
  if (!root) return;

  const inventory = window.APP_DATA?.inventory || [];
  const prefillItem = inventory.find((item) => item.id === prefillItemId);
  const suppliers = [...new Set(inventory.map((item) => item.supplier))].sort();
  const today = toDateInputValue(new Date());
  const expected = toDateInputValue(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const initialItem = prefillItem
    ? { itemId: prefillItem.id, qty: Math.max(prefillItem.minStock * 2 - prefillItem.stock, prefillItem.minStock), unit: prefillItem.unit, pricePerUnit: prefillItem.avgCost }
    : {};

  root.innerHTML = `
    <div class="modal-overlay" id="po-modal">
      <div class="modal-box" style="max-width:960px">
        <div class="modal-header">
          <h2 class="modal-title">Buat Purchase Order</h2>
          <button class="modal-close" type="button" data-action="close-inventory-modal" aria-label="Tutup">×</button>
        </div>
        <form id="po-form" novalidate>
          <div class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="po-id">Nomor PO</label>
                <input class="form-input" id="po-id" name="id" value="${generatePurchaseOrderId()}" readonly>
              </div>
              <div class="form-group">
                <label class="form-label" for="po-supplier">Supplier *</label>
                <input class="form-input" id="po-supplier" name="supplier" list="po-supplier-list" required value="${prefillItem?.supplier || ""}" placeholder="Nama supplier">
                <datalist id="po-supplier-list">${suppliers.map((supplier) => `<option value="${supplier}">`).join("")}</datalist>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="po-created">Tanggal PO *</label>
                <input class="form-input" id="po-created" name="createdAt" type="date" value="${today}" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="po-expected">Estimasi Terima *</label>
                <input class="form-input" id="po-expected" name="expectedAt" type="date" value="${expected}" required>
              </div>
            </div>
            <div class="data-table" style="margin:0">
              <table>
                <thead>
                  <tr><th>Bahan</th><th>Qty Order</th><th>Satuan</th><th>Harga Satuan</th><th>Subtotal</th><th></th></tr>
                </thead>
                <tbody id="po-items-body">${getPoItemRow(initialItem, 0)}</tbody>
              </table>
            </div>
            <button class="btn-secondary" type="button" data-action="add-po-item">+ Tambah Bahan</button>
            <div style="display:flex;justify-content:flex-end;font-size:18px;font-weight:700">
              Total PO: <span id="po-total" style="margin-left:8px">${formatCurrency(0)}</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="po-notes">Catatan ke supplier</label>
              <textarea class="form-input" id="po-notes" name="notes" rows="2" placeholder="Catatan pengiriman, kontak, atau instruksi khusus"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" type="button" data-action="close-inventory-modal">Batal</button>
            <button class="btn-secondary" type="submit" data-po-submit-status="draft">Simpan Draft</button>
            <button class="btn-primary" type="submit" data-po-submit-status="sent">Kirim PO</button>
          </div>
        </form>
      </div>
    </div>
  `;

  updatePurchaseOrderTotals();
}

function updatePurchaseOrderTotals() {
  let total = 0;
  document.querySelectorAll("[data-po-item-row]").forEach((row) => {
    const qty = parseFloat(row.querySelector("[name='qty']")?.value) || 0;
    const price = parseFloat(row.querySelector("[name='pricePerUnit']")?.value) || 0;
    const subtotal = qty * price;
    total += subtotal;
    const subtotalEl = row.querySelector("[data-po-line-subtotal]");
    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  });
  const totalEl = document.getElementById("po-total");
  if (totalEl) totalEl.textContent = formatCurrency(total);
}

function submitPurchaseOrderForm(form, submitter) {
  const formData = Object.fromEntries(new FormData(form).entries());
  const rows = [...form.querySelectorAll("[data-po-item-row]")];
  const inventory = window.APP_DATA?.inventory || [];
  const items = rows.map((row) => {
    const itemId = row.querySelector("[name='itemId']")?.value;
    const item = inventory.find((inv) => inv.id === itemId);
    return {
      itemId,
      itemName: item?.name || "",
      qty: parseFloat(row.querySelector("[name='qty']")?.value) || 0,
      receivedQty: 0,
      unit: item?.unit || row.querySelector("[name='unit']")?.value || "",
      pricePerUnit: parseFloat(row.querySelector("[name='pricePerUnit']")?.value) || 0,
    };
  }).filter((item) => item.itemId && item.qty > 0);

  if (!formData.supplier || !formData.createdAt || !formData.expectedAt || !items.length) {
    showToast("Lengkapi supplier, tanggal, dan minimal satu item PO.", "error");
    return;
  }

  if (!window.APP_DATA.purchaseOrders) window.APP_DATA.purchaseOrders = [];
  const status = submitter?.dataset.poSubmitStatus || "draft";
  const po = {
    id: formData.id || generatePurchaseOrderId(),
    supplier: formData.supplier,
    status,
    createdAt: new Date(formData.createdAt).toISOString(),
    expectedAt: new Date(formData.expectedAt).toISOString(),
    notes: formData.notes || "",
    createdBy: APP_STATE.currentUser.name,
    sentAt: status === "sent" ? new Date().toISOString() : null,
    receivedAt: null,
    items,
  };

  window.APP_DATA.purchaseOrders.push(po);
  persistPurchaseOrders();

  const root = document.getElementById("inventory-modal-root");
  if (root) root.innerHTML = "";
  showToast(status === "sent" ? "PO berhasil dikirim ke supplier." : "Draft PO tersimpan.", "success");
  renderInventoryPage("po");
}

function renderPurchaseOrderDetail(poId) {
  const po = getPurchaseOrderById(poId);
  const tabContent = document.getElementById("inventory-tab-content");
  if (!po || !tabContent) return;

  const meta = getPoStatusMeta(po.status);
  const timeline = [
    { label: "Draft", done: true, at: po.createdAt },
    { label: "Dikirim", done: ["sent", "partial", "received"].includes(po.status), at: po.sentAt },
    { label: po.status === "partial" ? "Partial" : "Diterima", done: ["partial", "received"].includes(po.status), at: po.receivedAt },
  ];

  const rows = po.items.map((item) => {
    const remaining = Math.max((Number(item.qty) || 0) - (Number(item.receivedQty) || 0), 0);
    return `
      <tr>
        <td><strong>${item.itemName}</strong></td>
        <td>${item.qty} ${item.unit}</td>
        <td>${item.receivedQty || 0} ${item.unit}</td>
        <td>${remaining} ${item.unit}</td>
        <td>${formatCurrency(item.pricePerUnit)}</td>
        <td><strong>${formatCurrency(item.qty * item.pricePerUnit)}</strong></td>
      </tr>
    `;
  }).join("");

  tabContent.innerHTML = `
    <div class="card mb-4" style="margin-bottom:16px">
      <button class="btn-secondary" type="button" data-action="back-to-po-list" style="margin-bottom:16px">Kembali ke Daftar PO</button>
      <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap">
        <div>
          <h2 class="card-title" style="margin:0">${po.id}</h2>
          <p class="card-description">${po.supplier} · dibuat ${formatDate(new Date(po.createdAt))} · estimasi ${formatDate(new Date(po.expectedAt))}</p>
        </div>
        <span class="badge ${meta.className}" style="align-self:flex-start">${meta.label}</span>
      </div>
      <div class="grid" style="margin-top:18px">
        <div class="col-4"><div class="text-xs text-muted">Total Nilai</div><strong>${formatCurrency(getPurchaseOrderTotal(po))}</strong></div>
        <div class="col-4"><div class="text-xs text-muted">Dibuat oleh</div><strong>${po.createdBy || "-"}</strong></div>
        <div class="col-4"><div class="text-xs text-muted">Catatan</div><strong>${po.notes || "-"}</strong></div>
      </div>
    </div>
    <div class="card mb-4" style="margin-bottom:16px">
      <h3 style="font-size:15px;font-weight:600;margin:0 0 14px">Status Timeline</h3>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${timeline.map((step) => `<span class="badge ${step.done ? "badge-ready" : "badge-draft"}">${step.label}${step.at ? ` · ${formatDate(new Date(step.at))}` : ""}</span>`).join("")}
      </div>
    </div>
    <div class="data-table">
      <table>
        <thead><tr><th>Bahan</th><th>Qty Order</th><th>Sudah Diterima</th><th>Sisa</th><th>Harga</th><th>Subtotal</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="card" style="margin-top:16px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
      ${po.status === "draft" ? `<button class="btn-primary" type="button" data-action="send-po" data-po-id="${po.id}">Kirim PO</button>` : ""}
      ${["sent", "partial"].includes(po.status) ? `<button class="btn-primary" type="button" data-action="open-po-receive" data-po-id="${po.id}">Catat Penerimaan</button>` : ""}
      ${!["received", "cancelled"].includes(po.status) ? `<button class="btn-secondary" type="button" data-action="cancel-po" data-po-id="${po.id}">Batalkan PO</button>` : ""}
    </div>
  `;
}

function openPurchaseOrderReceiveModal(poId) {
  const po = getPurchaseOrderById(poId);
  const root = document.getElementById("inventory-modal-root");
  if (!po || !root) return;
  const today = toDateInputValue(new Date());
  const rows = po.items.map((item) => {
    const remaining = Math.max((Number(item.qty) || 0) - (Number(item.receivedQty) || 0), 0);
    return `
      <tr data-po-receive-row data-item-id="${item.itemId}">
        <td><strong>${item.itemName}</strong><div class="text-xs text-muted">Sisa: ${remaining} ${item.unit}</div></td>
        <td><input class="form-input" name="receivedQty" type="number" min="0" max="${remaining}" step="0.01" value="${remaining}" ${remaining <= 0 ? "disabled" : ""}></td>
        <td>${item.unit}</td>
      </tr>
    `;
  }).join("");

  root.innerHTML = `
    <div class="modal-overlay" id="po-receive-modal">
      <div class="modal-box" style="max-width:720px">
        <div class="modal-header">
          <h2 class="modal-title">Catat Penerimaan dari ${po.id}</h2>
          <button class="modal-close" type="button" data-action="close-inventory-modal" aria-label="Tutup">×</button>
        </div>
        <form id="po-receive-form" data-po-id="${po.id}" novalidate>
          <div class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="po-receive-date">Tanggal Terima</label>
                <input class="form-input" id="po-receive-date" name="receivedDate" type="date" value="${today}" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="po-receive-batch-prefix">Prefix Batch</label>
                <input class="form-input" id="po-receive-batch-prefix" name="batchPrefix" value="PO-${toCompactDate(new Date())}">
              </div>
            </div>
            <div class="data-table" style="margin:0">
              <table>
                <thead><tr><th>Bahan</th><th>Qty Diterima</th><th>Satuan</th></tr></thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" type="button" data-action="close-inventory-modal">Batal</button>
            <button class="btn-primary" type="submit">Simpan Penerimaan</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function submitPurchaseOrderReceiveForm(form) {
  const po = getPurchaseOrderById(form.dataset.poId);
  if (!po) return;

  const receivedDate = form.querySelector("[name='receivedDate']")?.value;
  const batchPrefix = form.querySelector("[name='batchPrefix']")?.value || `PO-${toCompactDate(new Date())}`;
  const inventory = window.APP_DATA?.inventory || [];
  if (!window.APP_DATA.incomingLog) window.APP_DATA.incomingLog = [];

  let acceptedCount = 0;
  form.querySelectorAll("[data-po-receive-row]").forEach((row, idx) => {
    const qty = parseFloat(row.querySelector("[name='receivedQty']")?.value) || 0;
    if (qty <= 0) return;

    const itemId = row.dataset.itemId;
    const poItem = po.items.find((item) => item.itemId === itemId);
    const inventoryItem = inventory.find((item) => item.id === itemId);
    if (!poItem || !inventoryItem) return;

    const remaining = Math.max((Number(poItem.qty) || 0) - (Number(poItem.receivedQty) || 0), 0);
    const acceptedQty = Math.min(qty, remaining);
    if (acceptedQty <= 0) return;

    poItem.receivedQty = Math.round(((Number(poItem.receivedQty) || 0) + acceptedQty) * 100) / 100;
    inventoryItem.stock = Math.round((inventoryItem.stock + acceptedQty) * 100) / 100;
    if (inventoryItem.stock <= 0) inventoryItem.status = "empty";
    else if (inventoryItem.stock <= inventoryItem.minStock) inventoryItem.status = "low";
    else inventoryItem.status = "safe";

    window.APP_DATA.incomingLog.push({
      id: `INC-${String(window.APP_DATA.incomingLog.length + 1).padStart(3, "0")}`,
      itemId,
      itemName: inventoryItem.name,
      batchId: `${batchPrefix}-${String(idx + 1).padStart(3, "0")}`,
      qty: acceptedQty,
      unit: inventoryItem.unit,
      supplier: po.supplier,
      pricePerUnit: poItem.pricePerUnit,
      totalPrice: acceptedQty * poItem.pricePerUnit,
      receivedDate: new Date(receivedDate).toISOString(),
      receivedBy: APP_STATE.currentUser.name,
      notes: `Penerimaan dari ${po.id}`,
    });

    if (!window.APP_DATA.batches) window.APP_DATA.batches = [];
    window.APP_DATA.batches.push({
      batchId: `${batchPrefix}-${String(idx + 1).padStart(3, "0")}`,
      itemId,
      itemName: inventoryItem.name,
      qtyInitial: acceptedQty,
      qtyRemaining: acceptedQty,
      unit: inventoryItem.unit,
      supplier: po.supplier,
      receivedDate: new Date(receivedDate).toISOString(),
      pricePerUnit: poItem.pricePerUnit,
      status: "aktif",
    });
    acceptedCount += 1;
  });

  if (!acceptedCount) {
    showToast("Tidak ada qty penerimaan yang dicatat.", "error");
    return;
  }

  const allReceived = po.items.every((item) => (Number(item.receivedQty) || 0) >= (Number(item.qty) || 0));
  po.status = allReceived ? "received" : "partial";
  po.receivedAt = allReceived ? new Date().toISOString() : po.receivedAt;

  persistPurchaseOrders();
  localStorage.setItem("printeoo:incoming_log", JSON.stringify(window.APP_DATA.incomingLog));
  localStorage.setItem("printeoo:batches", JSON.stringify(window.APP_DATA.batches || []));
  const stockMap = {};
  inventory.forEach((item) => { stockMap[item.id] = item.stock; });
  localStorage.setItem("printeoo:inventory_stocks", JSON.stringify(stockMap));

  const root = document.getElementById("inventory-modal-root");
  if (root) root.innerHTML = "";
  showToast(allReceived ? "PO diterima penuh dan stok bertambah." : "Penerimaan partial dicatat.", "success");
  renderPurchaseOrderDetail(po.id);
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

  if (!window.APP_DATA.batches) window.APP_DATA.batches = [];
  window.APP_DATA.batches.push({
    batchId: data.batchId,
    itemId: data.itemId,
    itemName: item.name,
    qtyInitial: qty,
    qtyRemaining: qty,
    unit: item.unit,
    supplier: data.supplier,
    receivedDate: new Date(data.receivedDate).toISOString(),
    pricePerUnit,
    status: "aktif",
  });

  localStorage.setItem("printeoo:incoming_log", JSON.stringify(window.APP_DATA.incomingLog));
  localStorage.setItem("printeoo:batches", JSON.stringify(window.APP_DATA.batches));
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
  const order = findOrderBySpk(spkNumber);
  const orderItems = order ? getOrderItems(order) : [];

  root.innerHTML = `
    <div class="modal-overlay" id="usage-waste-modal">
      <div class="modal-box" style="max-width:520px">
        <div class="modal-header">
          <h2 class="modal-title">Catat Pemakaian Material</h2>
          <button class="modal-close" type="button" data-action="close-inventory-modal">×</button>
        </div>
        <form id="usage-waste-form" novalidate>
          <div class="modal-form">
            ${orderItems.length ? `
              <div class="form-group">
                <label class="form-label" for="uw-order-item">Item SPK *</label>
                <select class="form-select" id="uw-order-item" name="orderItemId" required>
                  ${orderItems.map((item) => `<option value="${item.itemId}">Item ${item.seq || 1} - ${escapeHtml(item.product || order.productName || "-")}</option>`).join("")}
                </select>
              </div>
            ` : ""}
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
            <div class="form-group">
              <label class="form-label" for="uw-batch">Batch</label>
              <select class="form-select" id="uw-batch" name="batchId">
                <option value="">Pilih bahan dulu</option>
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
      updateUsageWasteBatchOptions(e.target.value);
      checkUsageWasteStock();
    } else {
      document.getElementById("uw-unit").value = "";
      updateUsageWasteBatchOptions(null);
    }
  });

  ["uw-qty-used", "uw-qty-waste"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", checkUsageWasteStock);
  });
}

function updateUsageWasteBatchOptions(itemId) {
  const select = document.getElementById("uw-batch");
  if (!select) return;
  const batches = itemId ? getInventoryBatches(itemId) : [];
  select.innerHTML = batches.length
    ? batches.map((batch) => `<option value="${batch.batchId}">${batch.batchId} — sisa ${batch.qtyRemaining} ${batch.unit}</option>`).join("")
    : `<option value="">Tidak ada batch tercatat</option>`;
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
  const orderItem = getOrderItems(order || {}).find((orderLine) => orderLine.itemId === data.orderItemId);
  if (!window.APP_DATA.usageLog) window.APP_DATA.usageLog = [];

  const entry = {
    id: `USE-${String(window.APP_DATA.usageLog.length + 1).padStart(3, "0")}`,
    spkNumber: data.spkNumber,
    orderItemId: data.orderItemId || null,
    productName: orderItem?.product || order?.productName || "-",
    itemId: data.itemId,
    itemName: item.name,
    batchId: data.batchId || null,
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
  if (orderItem) {
    orderItem.materialActual = orderItem.materialActual || [];
    orderItem.materialActual.push({
      material: item.name,
      qty: qtyUsed,
      unit: item.unit,
      batch: data.batchId || null,
    });
  }

  item.stock = Math.max(Math.round((item.stock - totalConsumed) * 1000) / 1000, 0);
  if (item.stock <= 0) item.status = "empty";
  else if (item.stock <= item.minStock) item.status = "low";
  else item.status = "safe";

  const batch = getBatchById(data.batchId);
  if (batch) {
    batch.qtyRemaining = Math.max(Math.round((batch.qtyRemaining - totalConsumed) * 1000) / 1000, 0);
    batch.status = batch.qtyRemaining > 0 ? "aktif" : "habis";
    localStorage.setItem("printeoo:batches", JSON.stringify(window.APP_DATA.batches || []));
  }

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
        const barWidth = Math.round((value / maxValue) * 470);
        const y = 36 + index * 52;
        return `
          <g>
            <text x="0" y="${y + 22}" class="finance-chart-label">${label}</text>
            <rect x="150" y="${y}" width="${barWidth}" height="30" rx="6" fill="${color}"></rect>
            <text x="${170 + barWidth}" y="${y + 21}" class="finance-chart-value">${formatCompactCurrency(value)}</text>
          </g>
        `;
      }).join("")}
    </svg>
  `;
}

// ─── SETTINGS PAGE ───────────────────────────────────────────────────────────

function renderSettingsPage(activeTab = "profil") {
  const container = document.getElementById("settings-tab-content");
  if (!container) return;

  document.querySelectorAll("[data-settings-tab]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.settingsTab === activeTab);
  });

  if (activeTab === "profil") container.innerHTML = renderSettingsProfilTab();
  else if (activeTab === "cabang") container.innerHTML = renderSettingsCabangTab();
  else if (activeTab === "users") container.innerHTML = renderSettingsUsersTab();
  else if (activeTab === "notifikasi") container.innerHTML = renderSettingsNotifikasiTab();
  else if (activeTab === "tampilan") container.innerHTML = renderSettingsTampilanTab();
  else if (activeTab === "langganan") container.innerHTML = renderSettingsLanggananTab();
}

function renderSettingsProfilTab() {
  const t = APP_DATA.tenant;
  const branch = APP_DATA.branches[0];
  return `
    <div class="settings-grid">
      <section class="card settings-section">
        <h2 class="settings-section-title">Identitas Bisnis</h2>
        <p class="settings-section-desc">Informasi ini tampil di SPK, invoice, dan dokumen cetak.</p>
        <div class="settings-form">
          <div class="content-grid">
            <div class="col-6">
              <label class="form-label">Nama Bisnis</label>
              <input class="form-input" type="text" value="${escapeAttr(t.name)}" readonly>
            </div>
            <div class="col-6">
              <label class="form-label">Kota</label>
              <input class="form-input" type="text" value="${escapeAttr(t.city)}" readonly>
            </div>
            <div class="col-6">
              <label class="form-label">Nomor Telepon Utama</label>
              <input class="form-input" type="tel" value="${escapeAttr(branch.phone)}" readonly>
            </div>
            <div class="col-6">
              <label class="form-label">Email Bisnis</label>
              <input class="form-input" type="email" value="admin@titaniumprint.id" readonly>
            </div>
            <div class="col-12">
              <label class="form-label">Alamat Utama</label>
              <input class="form-input" type="text" value="${escapeAttr(branch.address)}" readonly>
            </div>
            <div class="col-6">
              <label class="form-label">NPWP</label>
              <input class="form-input" type="text" value="01.234.567.8-601.000" readonly>
            </div>
            <div class="col-6">
              <label class="form-label">Jam Operasional (default)</label>
              <input class="form-input" type="text" value="${escapeAttr(branch.openingHours)} WIB" readonly>
            </div>
          </div>
          <div class="settings-action-row">
            <span class="text-muted text-sm">Demo mode — perubahan tidak disimpan.</span>
            <button class="btn-primary" type="button" onclick="showToast('Perubahan profil berhasil disimpan.','success')">Simpan Perubahan</button>
          </div>
        </div>
      </section>

      <section class="card settings-section">
        <h2 class="settings-section-title">Logo & Branding</h2>
        <p class="settings-section-desc">Logo tampil di header aplikasi dan dokumen cetak.</p>
        <div class="settings-logo-area">
          <div class="settings-logo-preview">
            <span style="font-size:32px;font-weight:800;color:var(--primary)">P</span>
          </div>
          <div>
            <p class="text-sm" style="margin-bottom:8px">Format: PNG atau SVG. Ukuran maksimum 500KB. Rekomendasi 200×60px.</p>
            <button class="btn-secondary" type="button" onclick="showToast('Fitur upload logo aktif di paket Studio ke atas.','success')">Ganti Logo</button>
          </div>
        </div>
      </section>

      <section class="card settings-section">
        <h2 class="settings-section-title">Format Dokumen</h2>
        <p class="settings-section-desc">Konfigurasi tampilan nomor SPK, invoice, dan kwitansi.</p>
        <div class="content-grid">
          <div class="col-6">
            <label class="form-label">Format Nomor SPK</label>
            <input class="form-input" type="text" value="SPK-SBY-YYYYMMDD-XXXX" readonly>
            <p class="text-xs text-muted" style="margin-top:4px">Contoh: SPK-SBY-20260523-0042</p>
          </div>
          <div class="col-6">
            <label class="form-label">Prefix Nomor Antrian</label>
            <div class="flex gap-2">
              <input class="form-input" type="text" value="A" style="max-width:60px" readonly>
              <input class="form-input" type="text" value="B" style="max-width:60px" readonly>
              <input class="form-input" type="text" value="C" style="max-width:60px" readonly>
            </div>
          </div>
          <div class="col-6">
            <label class="form-label">Footer Invoice</label>
            <input class="form-input" type="text" value="Terima kasih atas kepercayaan Anda." readonly>
          </div>
          <div class="col-6">
            <label class="form-label">Syarat & Ketentuan Pembayaran</label>
            <input class="form-input" type="text" value="Pembayaran DP minimal 50% sebelum produksi." readonly>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderSettingsCabangTab() {
  const branches = APP_DATA.branches;
  return `
    <div class="settings-grid">
      <section class="card settings-section">
        <div class="card-section-header">
          <div>
            <h2 class="settings-section-title">Daftar Cabang</h2>
            <p class="settings-section-desc">Kelola lokasi operasional bisnis Anda.</p>
          </div>
          <button class="btn-primary" type="button" onclick="showToast('Fitur tambah cabang aktif di paket Business ke atas.','success')">+ Tambah Cabang</button>
        </div>
        <div class="data-table mt-4">
          <table>
            <thead>
              <tr>
                <th>Nama Cabang</th>
                <th>Alamat</th>
                <th>Telepon</th>
                <th>Jam Operasional</th>
                <th>Counter</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${branches.map((b) => `
                <tr>
                  <td><strong>${escapeHtml(b.name)}</strong></td>
                  <td class="text-sm text-muted">${escapeHtml(b.address)}</td>
                  <td class="text-sm">${escapeHtml(b.phone)}</td>
                  <td class="text-sm">${escapeHtml(b.openingHours)} WIB</td>
                  <td class="text-sm text-center">${b.counters}</td>
                  <td><span class="badge badge-ready">Aktif</span></td>
                  <td>
                    <button class="btn-secondary" style="padding:4px 10px;font-size:12px" type="button"
                      onclick="showToast('Pengaturan cabang ${escapeAttr(b.name)} disimpan.','success')">Edit</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card settings-section">
        <h2 class="settings-section-title">Pengaturan Counter Antrian</h2>
        <p class="settings-section-desc">Jumlah counter aktif menentukan kapasitas layanan per cabang.</p>
        <div class="content-grid">
          ${branches.map((b) => `
            <div class="col-6">
              <label class="form-label">${escapeHtml(b.name)}</label>
              <div class="flex gap-2 items-center">
                <input class="form-input" type="number" value="${b.counters}" min="1" max="10" style="max-width:80px" readonly>
                <span class="text-sm text-muted">counter aktif</span>
              </div>
            </div>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderSettingsUsersTab() {
  const employees = APP_DATA.employees;
  const roleColors = {
    owner: "badge-VIP",
    cashier: "badge-confirmed",
    designer: "badge-printing",
    operator: "badge-finishing",
    warehouse: "badge-overdue",
    courier: "badge-confirmed",
    finance: "badge-ready",
    installer: "badge-urgent",
  };
  const roleLabels = {
    owner: "Owner", cashier: "Kasir", designer: "Desainer",
    operator: "Operator", warehouse: "Gudang", courier: "Kurir", finance: "Keuangan", installer: "Teknisi",
  };
  const accessRows = [
    ["Dashboard & Laporan", "Ya", "-", "-", "-", "-", "-"],
    ["Input & Kelola Pesanan", "Ya", "Ya", "-", "-", "R", "-"],
    ["Papan Produksi", "Ya", "R", "Ya", "Ya", "-", "-"],
    ["Antrian Customer", "Ya", "Ya", "-", "-", "-", "-"],
    ["Inventaris", "Ya", "-", "R", "-", "Ya", "-"],
    ["Purchase Order", "Ya", "-", "-", "-", "Submit", "-"],
    ["Pengiriman", "Ya", "Ya", "-", "-", "-", "Milik sendiri"],
    ["Portal Karyawan", "Ya", "Ya", "Ya", "Ya", "Ya", "Ya"],
    ["Karyawan & Payroll", "Ya", "-", "-", "-", "-", "-"],
    ["Keuangan", "Ya", "-", "-", "-", "-", "-"],
    ["Pengaturan", "Ya", "-", "-", "-", "-", "-"],
  ];
  return `
    <div class="settings-grid">
      <section class="card settings-section">
        <div class="card-section-header">
          <div>
            <h2 class="settings-section-title">Pengguna Aktif</h2>
            <p class="settings-section-desc">Kelola akun, role, dan hak akses setiap pengguna.</p>
          </div>
          <button class="btn-primary" type="button" onclick="showToast('Undangan berhasil dikirim ke email pengguna baru.','success')">+ Undang Pengguna</button>
        </div>
        <div class="data-table mt-4">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Jabatan</th>
                <th>Role Akses</th>
                <th>Tipe Kontrak</th>
                <th>Cabang</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map((e) => {
                const branch = APP_DATA.branches.find((b) => b.id === e.branchId);
                return `
                  <tr>
                    <td>
                      <div class="flex items-center gap-2">
                        <div class="customer-avatar" style="width:30px;height:30px;font-size:11px;background:var(--primary-light);color:var(--primary)">
                          ${getCustomerInitials(e.name)}
                        </div>
                        <strong>${escapeHtml(e.name)}</strong>
                      </div>
                    </td>
                    <td class="text-sm">${escapeHtml(e.position)}</td>
                    <td><span class="badge ${roleColors[e.role] || "badge-confirmed"}">${roleLabels[e.role] || e.role}</span></td>
                    <td class="text-sm">${capitalize(e.contractType)}</td>
                    <td class="text-sm text-muted">${branch ? branch.name : "—"}</td>
                    <td><span class="badge badge-ready">Aktif</span></td>
                    <td>
                      <button class="btn-secondary" style="padding:4px 10px;font-size:12px" type="button"
                        onclick="showToast('Pengaturan ${escapeAttr(e.name)} diperbarui.','success')">Edit</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <section class="card settings-section">
        <h2 class="settings-section-title">Matriks Hak Akses</h2>
        <p class="settings-section-desc">Ringkasan menu yang bisa diakses per role.</p>
        <div class="data-table mt-4">
          <table>
            <thead>
              <tr>
                <th>Fitur</th>
                <th>Owner</th>
                <th>Kasir</th>
                <th>Operator</th>
                <th>Desainer</th>
                <th>Gudang</th>
                <th>Kurir</th>
              </tr>
            </thead>
            <tbody>
              ${accessRows.map(([feat, ...cols]) => `
                <tr>
                  <td>${feat}</td>
                  ${cols.map((v) => `<td class="text-center ${v !== "-" ? "text-success" : "text-muted"}">${v}</td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

function renderSettingsNotifikasiTab() {
  const notifGroups = [
    {
      title: "Pesanan & Produksi",
      items: [
        ["SPK baru masuk", true, "Notifikasi saat kasir membuat pesanan baru"],
        ["Pesanan mendekat deadline", true, "Alert 2 jam sebelum deadline"],
        ["Pesanan overdue", true, "Alert jika deadline terlewat dan belum selesai"],
        ["Status produksi berubah", false, "Notifikasi setiap perubahan stage produksi"],
        ["Pesanan siap diambil", true, "Notif ke customer saat status = Siap Ambil"],
        ["Notifikasi Kurir", true, "Kirim WA ke kurir saat pesanan siap diantar"],
        ["Kurir belum di-assign", false, "Notif ke manager jika 30 menit belum ada kurir"],
      ],
    },
    {
      title: "Inventaris & Stok",
      items: [
        ["Stok bahan menipis", true, "Alert jika stok di bawah minimum"],
        ["Stok habis", true, "Alert prioritas saat stok = 0"],
        ["PO belum diterima lewat estimasi", false, "Pengingat jika PO melewati tanggal estimasi terima"],
      ],
    },
    {
      title: "Keuangan & Pembayaran",
      items: [
        ["Pembayaran DP diterima", true, "Konfirmasi saat kasir mencatat DP"],
        ["Piutang jatuh tempo", true, "Pengingat piutang yang belum dilunasi"],
        ["Laporan harian otomatis", false, "Ringkasan omzet dikirim setiap pukul 21.00"],
      ],
    },
    {
      title: "Sistem",
      items: [
        ["Login dari perangkat baru", true, "Alert keamanan saat ada login perangkat tak dikenal"],
        ["Update versi aplikasi", false, "Informasi saat ada versi baru Printeoo"],
      ],
    },
  ];

  return `
    <div class="settings-grid">
      <section class="card settings-section">
        <h2 class="settings-section-title">Saluran Notifikasi</h2>
        <p class="settings-section-desc">Pilih cara Printeoo mengirimkan notifikasi ke tim Anda.</p>
        <div class="notif-channel-grid">
          ${[
            ["WA", "WhatsApp Business", "Notif langsung ke nomor WA operator", true],
            ["Email", "Email", "Ringkasan harian dan alert penting", false],
            ["Browser", "Browser Push", "Pop-up saat aplikasi dibuka di Chrome/Edge", true],
          ].map(([icon, label, desc, enabled]) => `
            <div class="notif-channel-card ${enabled ? "notif-channel-active" : ""}">
              <div class="notif-channel-icon">${icon}</div>
              <div class="flex-1">
                <div style="font-weight:600;font-size:var(--text-sm)">${label}</div>
                <div class="text-xs text-muted">${desc}</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" ${enabled ? "checked" : ""} onchange="showToast('Pengaturan notifikasi disimpan.','success')">
                <span class="toggle-slider"></span>
              </label>
            </div>
          `).join("")}
        </div>
      </section>

      ${notifGroups.map((group) => `
        <section class="card settings-section">
          <h2 class="settings-section-title">${group.title}</h2>
          <div class="notif-item-list">
            ${group.items.map(([label, enabled, desc]) => `
              <div class="notif-item">
                <div class="flex-1">
                  <div style="font-weight:500;font-size:var(--text-sm)">${label}</div>
                  <div class="text-xs text-muted">${desc}</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" ${enabled ? "checked" : ""} onchange="showToast('Pengaturan notifikasi disimpan.','success')">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            `).join("")}
          </div>
        </section>
      `).join("")}
    </div>
  `;
}

function renderSettingsTampilanTab() {
  return `
    <div class="settings-grid">
      <section class="card settings-section">
        <h2 class="settings-section-title">Bahasa & Zona Waktu</h2>
        <div class="content-grid">
          <div class="col-6">
            <label class="form-label">Bahasa Aplikasi</label>
            <select class="form-select" onchange="showToast('Bahasa diperbarui.','success')">
              <option selected>Bahasa Indonesia</option>
              <option>English</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label">Zona Waktu</label>
            <select class="form-select" onchange="showToast('Zona waktu diperbarui.','success')">
              <option selected>WIB — UTC+7 (Jakarta, Surabaya)</option>
              <option>WITA — UTC+8 (Makassar, Bali)</option>
              <option>WIT — UTC+9 (Jayapura)</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label">Format Tanggal</label>
            <select class="form-select" onchange="showToast('Format tanggal diperbarui.','success')">
              <option selected>23 Mei 2026</option>
              <option>23/05/2026</option>
              <option>2026-05-23</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label">Format Mata Uang</label>
            <select class="form-select" onchange="showToast('Format mata uang diperbarui.','success')">
              <option selected>Rp 1.234.000</option>
              <option>IDR 1,234,000</option>
            </select>
          </div>
        </div>
      </section>

      <section class="card settings-section">
        <h2 class="settings-section-title">Tampilan Antarmuka</h2>
        <div class="notif-item-list">
          ${[
            ["Mode Gelap (Dark Mode)", false, "Tersedia di versi berikutnya", true],
            ["Tampilkan foto di kartu produksi", true, "Foto produk muncul di kanban board", false],
            ["Animasi & transisi", true, "Matikan untuk performa lebih cepat di perangkat lama", false],
            ["Tampilkan salam di dashboard", true, "Ucapan pagi/siang/sore di header dashboard", false],
            ["Kolom tabel kompak", false, "Kurangi padding tabel untuk menampilkan lebih banyak baris", false],
          ].map(([label, enabled, desc, disabled]) => `
            <div class="notif-item ${disabled ? "is-disabled" : ""}" ${disabled ? 'title="Tersedia di versi berikutnya"' : ""}>
              <div class="flex-1">
                <div style="font-weight:500;font-size:var(--text-sm)">${label}</div>
                <div class="text-xs text-muted">${desc}</div>
              </div>
              <label class="toggle-switch ${disabled ? "toggle-switch-disabled" : ""}">
                <input type="checkbox" ${enabled ? "checked" : ""} ${disabled ? "disabled" : "onchange=\"showToast('Preferensi tampilan disimpan.','success')\""} aria-label="${escapeAttr(label)}">
                <span class="toggle-slider"></span>
              </label>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="card settings-section">
        <h2 class="settings-section-title">Display Mode (TV/Layar Publik)</h2>
        <p class="settings-section-desc">Pengaturan khusus untuk Production Display dan Queue Display.</p>
        <div class="content-grid">
          <div class="col-6">
            <label class="form-label">Interval Refresh Display</label>
            <select class="form-select" onchange="showToast('Pengaturan display disimpan.','success')">
              <option>5 detik</option>
              <option selected>10 detik</option>
              <option>30 detik</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label">Volume TTS (Text-to-Speech)</label>
            <select class="form-select" onchange="showToast('Volume TTS diperbarui.','success')">
              <option>Pelan</option>
              <option selected>Normal</option>
              <option>Keras</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label">Kecepatan Suara Antrian</label>
            <select class="form-select" onchange="showToast('Kecepatan suara diperbarui.','success')">
              <option>Lambat</option>
              <option selected>Normal (0.9x)</option>
              <option>Cepat</option>
            </select>
          </div>
          <div class="col-6">
            <label class="form-label">PIN Keluar Display Mode</label>
            <input class="form-input" type="password" value="1234" readonly>
            <p class="text-xs text-muted" style="margin-top:4px">Tekan Escape di Display Mode lalu masukkan PIN.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderSettingsLanggananTab() {
  const currentPlan = "Pro";
  const planColors = { Solo: "#6B7280", Studio: "#2563EB", Pro: "#7C3AED", Business: "#D97706", Enterprise: "#111827" };
  const plans = [
    { name: "Solo", price: "Rp 149rb", desc: "Operator mandiri", cta: "Downgrade", ctaClass: "btn-secondary" },
    { name: "Studio", price: "Rp 399rb", desc: "Print shop kecil", cta: "Downgrade", ctaClass: "btn-secondary" },
    { name: "Pro", price: "Rp 899rb", desc: "Kontrol produksi & stok", cta: "Paket Aktif", ctaClass: "btn-primary", current: true },
    { name: "Business", price: "Rp 1,9jt", desc: "Multi-cabang & laporan", cta: "Upgrade", ctaClass: "btn-primary" },
    { name: "Enterprise", price: "Hubungi Kami", desc: "Grup besar & SLA khusus", cta: "Hubungi Kami", ctaClass: "btn-secondary" },
  ];

  return `
    <div class="settings-grid">
      <section class="card settings-section">
        <h2 class="settings-section-title">Status Langganan</h2>
        <div class="flex gap-4 items-center" style="padding:16px 0">
          <div class="settings-plan-badge" style="background:${planColors[currentPlan]}20;border:2px solid ${planColors[currentPlan]};color:${planColors[currentPlan]}">
            ${currentPlan}
          </div>
          <div>
            <div style="font-weight:600;font-size:var(--text-md)">Paket ${currentPlan} — Aktif</div>
            <div class="text-sm text-muted">Diperpanjang otomatis pada <strong>23 Juni 2026</strong> · Rp 899.000/bulan</div>
          </div>
          <button class="btn-secondary" style="margin-left:auto" type="button"
            onclick="showToast('Tagihan akan dikirim ke email admin@titaniumprint.id.','success')">Lihat Tagihan</button>
        </div>
        <div class="settings-usage-grid">
          ${[
            ["SPK Bulan Ini", "1.247", "2.000", 62],
            ["Pengguna Aktif", "11", "15", 73],
            ["Cabang", "2", "3", 67],
            ["Storage File", "1,2 GB", "5 GB", 24],
          ].map(([label, used, limit, pct]) => `
            <div class="settings-usage-item">
              <div class="flex justify-between text-sm mb-1">
                <span style="font-weight:500">${label}</span>
                <span class="text-muted">${used} / ${limit}</span>
              </div>
              <div class="settings-usage-bar">
                <div class="settings-usage-fill ${pct > 80 ? "settings-usage-warn" : ""}" style="width:${pct}%"></div>
              </div>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="card settings-section">
        <h2 class="settings-section-title">Pilihan Paket</h2>
        <p class="settings-section-desc">Upgrade atau downgrade kapan saja. Perubahan berlaku di awal siklus billing berikutnya.</p>
        <div class="settings-plan-grid">
          ${plans.map((p) => `
            <article class="settings-plan-card ${p.current ? "settings-plan-current" : ""}">
              ${p.current ? `<div class="settings-plan-current-badge">Paket Aktif</div>` : ""}
              <h3 style="font-size:var(--text-md);font-weight:700;color:${planColors[p.name]}">${p.name}</h3>
              <div style="font-size:var(--text-xl);font-weight:800;margin:8px 0">${p.price}<span style="font-size:var(--text-sm);font-weight:400;color:var(--neutral-500)">/bln</span></div>
              <p class="text-sm text-muted" style="margin-bottom:12px">${p.desc}</p>
              <button class="${p.ctaClass} w-full" type="button"
                onclick="showToast('${p.current ? "Anda sudah berada di paket " + p.name + "." : "Tim kami akan menghubungi Anda untuk proses " + (p.cta === "Upgrade" ? "upgrade" : "perubahan") + " ke " + p.name + "."}','success')">
                ${p.cta}
              </button>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="card settings-section">
        <h2 class="settings-section-title">Perbandingan Fitur</h2>
        <div class="data-table mt-4">
          <table>
            <thead>
              <tr>
                <th>Fitur</th>
                <th>Solo</th><th>Studio</th><th>Pro</th><th>Business</th><th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              ${[
                ["SPK per bulan", "100", "500", "2.000", "Unlimited", "Unlimited"],
                ["User", "1", "5", "15", "40", "Unlimited"],
                ["Production board", "—", "✓", "✓", "✓", "✓"],
                ["Queue display + audio", "—", "✓", "✓", "✓", "✓"],
                ["Inventory tracking", "—", "Dasar", "QR batch", "Multi-cabang", "Custom"],
                ["Job costing", "—", "—", "✓", "✓", "✓"],
                ["HR & payroll", "—", "—", "Dasar", "✓", "✓"],
                ["Finance report", "—", "—", "Ringkas", "Lengkap", "Custom"],
                ["Web-to-print API", "—", "—", "—", "✓", "Custom"],
                ["Support", "Email", "Email", "Prioritas", "Prioritas", "Dedicated"],
              ].map(([feat, ...cols]) => `
                <tr>
                  <td>${feat}</td>
                  ${cols.map((v, i) => `
                    <td class="text-center ${i === 2 ? "settings-plan-highlight-col" : ""} ${v === "✓" ? "text-success" : v === "—" ? "text-muted" : ""}">
                      ${v === "✓" ? "✓" : v === "—" ? "—" : `<span class="text-xs">${v}</span>`}
                    </td>
                  `).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <p class="text-xs text-muted" style="margin-top:12px">Semua harga belum termasuk PPN. Gratis trial 14 hari.
          <a href="#/pricing" style="color:var(--primary);text-decoration:none;margin-left:8px">Lihat halaman pricing lengkap →</a>
        </p>
      </section>
    </div>
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
        <text x="${x + barWidth / 2}" y="${Math.max(y - 8, 14)}" text-anchor="middle" class="chart-value-label">${formatCompactCurrency(row.revenue)}</text>
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

function formatCompactCurrency(value) {
  const number = Number(value) || 0;
  if (number >= 1000000000) return `Rp ${(number / 1000000000).toFixed(1).replace(".", ",")} M`;
  if (number >= 1000000) return `Rp ${(number / 1000000).toFixed(1).replace(".", ",")} jt`;
  if (number >= 1000) return `Rp ${Math.round(number / 1000)} rb`;
  return formatCurrency(number);
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
    const poForm = event.target.closest("#po-form");
    const poReceiveForm = event.target.closest("#po-receive-form");
    const customerForm = event.target.closest("#customer-form");
    const customerPaymentForm = event.target.closest("#customer-payment-form");
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

    if (poForm) {
      event.preventDefault();
      submitPurchaseOrderForm(poForm, event.submitter);
      return;
    }

    if (poReceiveForm) {
      event.preventDefault();
      submitPurchaseOrderReceiveForm(poReceiveForm);
      return;
    }

    if (customerForm) {
      event.preventDefault();
      submitCustomerForm(customerForm);
      return;
    }

    if (customerPaymentForm) {
      event.preventDefault();
      submitCustomerPayment(customerPaymentForm);
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
    const customerRow = event.target.closest("[data-customer-row]");
    const customerOption = event.target.closest(".autocomplete-option[data-customer-id]");
    const productionFilterButton = event.target.closest("[data-production-filter]");
    const productionCard = event.target.closest("[data-production-spk]");
    const hrTabButton = event.target.closest("[data-hr-tab]");
    const settingsTabButton = event.target.closest("[data-settings-tab]");
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

    if (settingsTabButton) {
      renderSettingsPage(settingsTabButton.dataset.settingsTab);
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
      openProductionModal(productionCard.dataset.productionSpk, productionCard.dataset.productionItemId);
      return;
    }

    if (dateFilterButton) {
      const filter = dateFilterButton.dataset.dateFilter || "all";
      APP_STATE.orderFilters.date = filter === "overdue" ? "all" : filter;
      APP_STATE.orderFilters.overdue = filter === "overdue";
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

    if (customerRow && !event.target.closest("a, button")) {
      window.location.hash = `#/customer/${customerRow.dataset.customerRow}`;
      return;
    }

    const customerTabButton = event.target.closest("[data-customer-tab]");
    if (customerTabButton) {
      APP_STATE.customerDetailTab = customerTabButton.dataset.customerTab || "orders";
      renderCustomerDetailPage(customerTabButton.dataset.customerId);
      return;
    }

    const customerOrderFilterButton = event.target.closest("[data-customer-order-filter]");
    if (customerOrderFilterButton) {
      APP_STATE.customerOrderFilter = customerOrderFilterButton.dataset.customerOrderFilter || "all";
      APP_STATE.customerDetailTab = "orders";
      renderCustomerDetailPage(customerOrderFilterButton.dataset.customerId);
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

      if (actionButton.dataset.action === "open-customer-modal") {
        openCustomerModal();
        return;
      }

      if (actionButton.dataset.action === "open-customer-edit") {
        openCustomerModal(actionButton.dataset.customerId);
        return;
      }

      if (actionButton.dataset.action === "close-customer-modal") {
        closeCustomerModal();
        return;
      }

      if (actionButton.dataset.action === "new-order-for-customer") {
        startOrderForCustomer(actionButton.dataset.customerId);
        return;
      }

      if (actionButton.dataset.action === "view-customer-detail") {
        window.location.hash = `#/customer/${actionButton.dataset.customerId}`;
        return;
      }

      if (actionButton.dataset.action === "open-payment-modal") {
        openPaymentModal(actionButton.dataset.customerId, actionButton.dataset.spkNumber || "");
        return;
      }

      if (actionButton.dataset.action === "close-payment-modal") {
        closePaymentModal();
        return;
      }

      if (actionButton.dataset.action === "save-customer-notes") {
        const customer = (window.APP_DATA?.customers || []).find((item) => item.id === actionButton.dataset.customerId);
        if (customer) {
          customer.notes = document.getElementById("customer-notes-detail")?.value || "";
          customer.updatedAt = new Date().toISOString();
          showToast("Catatan pelanggan disimpan.", "success");
          renderCustomerDetailPage(customer.id);
        }
        return;
      }

      if (actionButton.dataset.action === "open-po-modal") {
        openPurchaseOrderModal(actionButton.dataset.itemId || null);
        return;
      }

      if (actionButton.dataset.action === "add-po-item") {
        const body = document.getElementById("po-items-body");
        if (body) {
          body.insertAdjacentHTML("beforeend", getPoItemRow({}, body.querySelectorAll("[data-po-item-row]").length));
          updatePurchaseOrderTotals();
        }
        return;
      }

      if (actionButton.dataset.action === "remove-po-item") {
        actionButton.closest("[data-po-item-row]")?.remove();
        updatePurchaseOrderTotals();
        return;
      }

      if (actionButton.dataset.action === "view-po-detail") {
        renderPurchaseOrderDetail(actionButton.dataset.poId);
        return;
      }

      if (actionButton.dataset.action === "back-to-po-list") {
        renderInventoryPage("po");
        return;
      }

      if (actionButton.dataset.action === "send-po") {
        const po = getPurchaseOrderById(actionButton.dataset.poId);
        if (po) {
          po.status = "sent";
          po.sentAt = new Date().toISOString();
          persistPurchaseOrders();
          showToast("PO dikirim ke supplier.", "success");
          renderPurchaseOrderDetail(po.id);
        }
        return;
      }

      if (actionButton.dataset.action === "cancel-po") {
        const po = getPurchaseOrderById(actionButton.dataset.poId);
        if (po) {
          po.status = "cancelled";
          persistPurchaseOrders();
          showToast("PO dibatalkan.", "success");
          renderPurchaseOrderDetail(po.id);
        }
        return;
      }

      if (actionButton.dataset.action === "open-po-receive") {
        openPurchaseOrderReceiveModal(actionButton.dataset.poId);
        return;
      }

      if (actionButton.dataset.action === "open-item-batches") {
        openItemBatchesModal(actionButton.dataset.itemId);
        return;
      }

      if (actionButton.dataset.action === "open-batch-usage") {
        openBatchUsageModal(actionButton.dataset.batchId);
        return;
      }

      if (actionButton.dataset.action === "lookup-batch-trace") {
        const batchId = document.getElementById("batch-trace-input")?.value?.trim();
        if (!batchId) {
          showToast("Masukkan Batch ID terlebih dahulu.", "error");
          return;
        }
        openBatchUsageModal(batchId);
        return;
      }

      if (actionButton.dataset.action === "navigate-spk") {
        const r1 = document.getElementById("inventory-modal-root");
        const r2 = document.getElementById("global-modal-root");
        if (r1) r1.innerHTML = "";
        if (r2) r2.innerHTML = "";
        window.location.hash = `#/order/${actionButton.dataset.spkNumber}`;
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

      if (actionButton.dataset.action === "mark-order-picked-up") {
        markCurrentOrderPickedUp();
        return;
      }

      if (actionButton.dataset.action === "mark-order-paid") {
        markCurrentOrderPaid();
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
      renderOrderCustomerInfo(null);
      renderCustomerSuggestions(event.target.value);
    }

    if (event.target.id === "order-phone") {
      event.target.value = formatPhone(event.target.value);
    }

    if (event.target.id === "customers-search") {
      APP_STATE.customerFilters.search = event.target.value;
      renderCustomersPage();
      return;
    }

    if (event.target.id === "customer-phone") {
      event.target.value = formatPhone(event.target.value);
      document.getElementById("customer-phone-error")?.classList.add("hidden");
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

    if (event.target.matches("[data-po-line-input]")) {
      updatePurchaseOrderTotals();
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

    if (event.target.matches("[data-po-item-select]")) {
      const row = event.target.closest("[data-po-item-row]");
      const opt = event.target.selectedOptions[0];
      if (row && opt) {
        row.querySelector("[data-po-unit]").value = opt.dataset.unit || "";
        row.querySelector("[name='pricePerUnit']").value = opt.dataset.price || 0;
        const supplierInput = document.getElementById("po-supplier");
        if (supplierInput && !supplierInput.value) supplierInput.value = opt.dataset.supplier || "";
        updatePurchaseOrderTotals();
      }
    }

    if (event.target.id === "po-status-filter" || event.target.id === "po-supplier-filter") {
      APP_STATE.poFilters.status = document.getElementById("po-status-filter")?.value || "all";
      APP_STATE.poFilters.supplier = document.getElementById("po-supplier-filter")?.value || "all";
      const tabContent = document.getElementById("inventory-tab-content");
      if (tabContent) tabContent.innerHTML = renderInventoryPurchaseOrderTab();
    }

    if (event.target.matches("input[name='type']")) {
      const label = document.getElementById("customer-name-label");
      if (label) label.textContent = event.target.value === "individual" ? "Nama Lengkap *" : "Nama Perusahaan *";
    }

    if (event.target.id === "customers-type-filter" || event.target.id === "customers-debt-filter" || event.target.id === "customers-sort") {
      APP_STATE.customerFilters.type = document.getElementById("customers-type-filter")?.value || "all";
      APP_STATE.customerFilters.debt = document.getElementById("customers-debt-filter")?.value || "all";
      APP_STATE.customerFilters.sort = document.getElementById("customers-sort")?.value || "name";
      renderCustomersPage();
      return;
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
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
    const storedBatches = localStorage.getItem("printeoo:batches");
    if (storedBatches && window.APP_DATA) {
      const parsed = JSON.parse(storedBatches);
      const existingIds = new Set((window.APP_DATA.batches || []).map((batch) => batch.batchId));
      const newEntries = parsed.filter((batch) => !existingIds.has(batch.batchId));
      if (!window.APP_DATA.batches) window.APP_DATA.batches = [];
      window.APP_DATA.batches.push(...newEntries);
    }
  } catch (e) {}

  try {
    const storedPo = localStorage.getItem("printeoo:purchase_orders");
    if (storedPo && window.APP_DATA) {
      const parsed = JSON.parse(storedPo);
      const existingIds = new Set((window.APP_DATA.purchaseOrders || []).map((po) => po.id));
      const newEntries = parsed.filter((po) => !existingIds.has(po.id));
      if (!window.APP_DATA.purchaseOrders) window.APP_DATA.purchaseOrders = [];
      window.APP_DATA.purchaseOrders.push(...newEntries);
    }
  } catch (e) {}

  try {
    if (backfillUsageBatchIds()) {
      localStorage.setItem("printeoo:usage_log", JSON.stringify(window.APP_DATA.usageLog || []));
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
    customers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
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
