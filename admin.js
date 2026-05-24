const config = window.PERA_SUPABASE || {};
const tableBody = document.querySelector("[data-orders-body]");
const adminStatus = document.querySelector("[data-admin-status]");
const exportButton = document.querySelector("[data-export-orders]");
let cachedOrders = [];

const configured = Boolean(config.url && config.anonKey && config.url.startsWith("https://"));

const setStatus = (message) => {
  if (adminStatus) adminStatus.textContent = message;
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
};

const escapeCell = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

const renderOrders = (orders) => {
  cachedOrders = orders;
  if (!tableBody) return;

  if (!orders.length) {
    tableBody.innerHTML = "<tr><td colspan=\"6\">Henüz kayıt yok.</td></tr>";
    return;
  }

  tableBody.innerHTML = orders.map((order) => `
    <tr>
      <td>${escapeCell(formatDate(order.created_at))}</td>
      <td>${escapeCell(order.customer_name)}</td>
      <td><a href="tel:${escapeCell(order.phone)}">${escapeCell(order.phone)}</a></td>
      <td>${escapeCell(order.product_type)}</td>
      <td><span class="status-pill">${escapeCell(order.status || "Yeni")}</span></td>
      <td>${escapeCell(order.note || "-")}</td>
    </tr>
  `).join("");
};

const loadLocalOrders = () => {
  const orders = JSON.parse(localStorage.getItem("pera_orders") || "[]");
  renderOrders(orders);
  setStatus(orders.length ? "Demo/local kayıtlar gösteriliyor." : "Supabase bağlı değil. Demo kayıtlar burada görünecek.");
};

const loadSupabaseOrders = async () => {
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  const supabase = createClient(config.url, config.anonKey);
  const table = config.ordersTable || "orders";
  const { data, error } = await supabase
    .from(table)
    .select("id,created_at,customer_name,phone,email,product_type,note,status")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  renderOrders(data || []);
  setStatus("Supabase kayıtları listeleniyor.");

  supabase
    .channel("pera-orders-admin")
    .on("postgres_changes", { event: "INSERT", schema: "public", table }, (payload) => {
      renderOrders([payload.new, ...cachedOrders].slice(0, 50));
      setStatus("Yeni sipariş talebi geldi.");
    })
    .subscribe();
};

const exportCsv = () => {
  const rows = [
    ["Tarih", "Müşteri", "Telefon", "E-posta", "Ürün", "Durum", "Not"],
    ...cachedOrders.map((order) => [
      formatDate(order.created_at),
      order.customer_name,
      order.phone,
      order.email || "",
      order.product_type,
      order.status || "Yeni",
      order.note || ""
    ])
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "pera-kece-siparisler.csv";
  link.click();
  URL.revokeObjectURL(url);
};

exportButton?.addEventListener("click", exportCsv);

if (configured) {
  loadSupabaseOrders().catch((error) => {
    loadLocalOrders();
    setStatus(`Supabase okuma kapalı veya yetkisiz: ${error.message}`);
  });
} else {
  loadLocalOrders();
}
