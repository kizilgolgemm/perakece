const config = window.PERA_SUPABASE || {};
const orderForm = document.querySelector("[data-order-form]");
const orderStatus = document.querySelector("[data-order-status]");
let supabaseClientPromise;

const isConfigured = () =>
  Boolean(config.url && config.anonKey && config.url.startsWith("https://"));

const getSupabase = async () => {
  if (!isConfigured()) return null;
  if (!supabaseClientPromise) {
    supabaseClientPromise = import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm")
      .then(({ createClient }) => createClient(config.url, config.anonKey));
  }
  return supabaseClientPromise;
};

const setOrderStatus = (message, state = "idle") => {
  if (!orderStatus) return;
  orderStatus.textContent = message;
  orderStatus.dataset.state = state;
};

const makeOrderCode = () => `PK-${Date.now().toString(36).toUpperCase().slice(-6)}`;

const saveLocalOrder = (payload) => {
  const orders = JSON.parse(localStorage.getItem("pera_orders") || "[]");
  const order = {
    ...payload,
    id: crypto.randomUUID ? crypto.randomUUID() : makeOrderCode(),
    order_code: makeOrderCode(),
    created_at: new Date().toISOString(),
    status: "Yeni"
  };
  orders.unshift(order);
  localStorage.setItem("pera_orders", JSON.stringify(orders.slice(0, 100)));
  return order;
};

orderForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = orderForm.querySelector("button[type='submit']");
  const formData = new FormData(orderForm);
  const payload = {
    customer_name: String(formData.get("customer_name") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    email: String(formData.get("email") || "").trim() || null,
    product_type: String(formData.get("product_type") || "").trim(),
    note: String(formData.get("note") || "").trim() || null,
    consent_kvkk: formData.get("consent_kvkk") === "on",
    source: "perakece.com.tr",
    status: "Yeni"
  };

  if (!payload.customer_name || !payload.phone || !payload.product_type || !payload.consent_kvkk) {
    setOrderStatus("Lütfen zorunlu alanları doldurun.", "error");
    return;
  }

  submitButton.disabled = true;
  setOrderStatus("Talebiniz kaydediliyor...", "loading");

  try {
    const supabase = await getSupabase();

    if (supabase) {
      const { error } = await supabase
        .from(config.ordersTable || "orders")
        .insert(payload);

      if (error) throw error;
      setOrderStatus("Talebiniz alındı. En kısa sürede sizinle iletişime geçilecek.", "success");
    } else {
      const order = saveLocalOrder(payload);
      setOrderStatus(`Demo kayıt oluşturuldu: ${order.order_code}. Supabase bilgileri eklenince gerçek kayıt aktif olacak.`, "success");
    }

    orderForm.reset();
  } catch (error) {
    setOrderStatus(`Kayıt alınamadı: ${error.message || "Lütfen tekrar deneyin."}`, "error");
  } finally {
    submitButton.disabled = false;
  }
});
