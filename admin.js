const config = window.PERA_SUPABASE || {};
const catalog = window.PeraCatalog;

const loginCard = document.querySelector("[data-admin-login]");
const loginForm = document.querySelector("[data-admin-login-form]");
const loginStatus = document.querySelector("[data-admin-login-status]");
const adminContent = document.querySelector("[data-admin-content]");
const logoutButton = document.querySelector("[data-admin-logout]");

const tableBody = document.querySelector("[data-orders-body]");
const adminStatus = document.querySelector("[data-admin-status]");
const exportButton = document.querySelector("[data-export-orders]");

const productForm = document.querySelector("[data-product-form]");
const productStatus = document.querySelector("[data-product-status]");
const productImageInput = document.querySelector("[data-product-image]");
const productImagePreview = document.querySelector("[data-product-image-preview]");
const productList = document.querySelector("[data-products-admin-list]");
const productResetButton = document.querySelector("[data-product-reset]");

const adminUsername = "nurcanatescaglayan";
const credentialHash = "08a79b3f2b3c60b56e111fefa0082bbf63d3dfe064d52da70f977619b307f549";
const legacyCredential = "bnVyY2FuYXRlc2NhZ2xheWFuOlNjMjEwNzg4";
const sessionKey = "pera_admin_session";

let cachedOrders = [];
let selectedImageData = "";
let editingProduct = null;
let initialized = false;
let supabaseClientPromise;

const configured = Boolean(config.url && config.anonKey && config.url.startsWith("https://"));

const escapeCell = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

const setStatus = (message) => {
  if (adminStatus) adminStatus.textContent = message;
};

const setLoginStatus = (message, state = "idle") => {
  if (!loginStatus) return;
  loginStatus.textContent = message;
  loginStatus.dataset.state = state;
};

const setProductStatus = (message, state = "idle") => {
  if (!productStatus) return;
  productStatus.textContent = message;
  productStatus.dataset.state = state;
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

const sha256 = async (value) => {
  if (!window.crypto?.subtle) return "";
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
};

const encodeLegacy = (value) => btoa(unescape(encodeURIComponent(value)));

const validateLogin = async (username, password) => {
  const credential = `${username}:${password}`;
  if (username !== adminUsername) return false;

  const digest = await sha256(credential);
  if (digest) return digest === credentialHash;

  return encodeLegacy(credential) === legacyCredential;
};

const showAdmin = () => {
  if (loginCard) loginCard.hidden = true;
  if (adminContent) adminContent.hidden = false;
  sessionStorage.setItem(sessionKey, credentialHash);
  initializeAdmin();
};

const showLogin = () => {
  if (loginCard) loginCard.hidden = false;
  if (adminContent) adminContent.hidden = true;
  sessionStorage.removeItem(sessionKey);
};

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

const getSupabase = async () => {
  if (!configured) return null;
  if (!supabaseClientPromise) {
    supabaseClientPromise = import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm")
      .then(({ createClient }) => createClient(config.url, config.anonKey));
  }
  return supabaseClientPromise;
};

const loadSupabaseOrders = async () => {
  const supabase = await getSupabase();
  if (!supabase) {
    loadLocalOrders();
    return;
  }

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

const setImagePreview = (src) => {
  if (!productImagePreview) return;
  if (!src) {
    productImagePreview.innerHTML = "<span>Fotoğraf önizleme</span>";
    return;
  }
  productImagePreview.innerHTML = `<img src="${escapeCell(src)}" alt="Ürün fotoğrafı önizleme" />`;
};

const resizeImage = (file) => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    const maxSize = 1200;
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(objectUrl);
    resolve(canvas.toDataURL("image/jpeg", 0.84));
  };
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error("Fotoğraf okunamadı."));
  };
  image.src = objectUrl;
});

const resetProductForm = () => {
  productForm?.reset();
  const idInput = productForm?.elements.namedItem("product_id");
  if (idInput) idInput.value = "";
  selectedImageData = "";
  editingProduct = null;
  setImagePreview("");
  setProductStatus("");
};

const renderAdminProducts = () => {
  if (!catalog || !productList) return;
  const products = catalog.getLocal();

  if (!products.length) {
    productList.innerHTML = `
      <div class="admin-empty">
        <strong>Henüz admin ürünü eklenmedi.</strong>
        <span>Ürün eklediğinizde mağaza kartlarında en üstte görünür.</span>
      </div>
    `;
    return;
  }

  productList.innerHTML = products.map((product) => {
    const hasDiscount = Number(product.discountPrice) > 0 && Number(product.discountPrice) < Number(product.price);
    return `
      <article class="admin-product-item">
        <img src="${escapeCell(product.image)}" alt="${escapeCell(product.name)}" />
        <div>
          <span>${escapeCell(product.category)}</span>
          <h3>${escapeCell(product.name)}</h3>
          <p>${escapeCell(product.shortDescription || product.description || "Açıklama girilmedi.")}</p>
          <strong>
            ${hasDiscount ? `${catalog.formatPrice(product.discountPrice)} <del>${catalog.formatPrice(product.price)}</del>` : catalog.formatPrice(product.price)}
          </strong>
        </div>
        <div class="admin-product-actions">
          <a class="button button-ghost" href="urun.html?id=${encodeURIComponent(product.id)}" target="_blank" rel="noopener">Aç</a>
          <button class="button button-ghost" type="button" data-edit-product="${escapeCell(product.id)}">Düzenle</button>
          <button class="button button-ghost" type="button" data-delete-product="${escapeCell(product.id)}">Sil</button>
        </div>
      </article>
    `;
  }).join("");
};

const fillProductForm = (id) => {
  if (!catalog || !productForm) return;
  const product = catalog.getLocal().find((item) => item.id === id);
  if (!product) return;

  editingProduct = product;
  selectedImageData = product.image;
  productForm.elements.namedItem("product_id").value = product.id;
  productForm.elements.namedItem("name").value = product.name;
  productForm.elements.namedItem("category").value = product.category;
  productForm.elements.namedItem("price").value = product.price;
  productForm.elements.namedItem("discount_price").value = product.discountPrice || "";
  productForm.elements.namedItem("badge").value = product.badge;
  productForm.elements.namedItem("short_description").value = product.shortDescription;
  productForm.elements.namedItem("description").value = product.description;
  setImagePreview(product.image);
  setProductStatus("Ürün düzenleme için forma alındı.", "success");
  productForm.scrollIntoView({ behavior: "smooth", block: "start" });
};

const handleProductSubmit = async (event) => {
  event.preventDefault();
  if (!catalog || !productForm) return;

  const formData = new FormData(productForm);
  const name = String(formData.get("name") || "").trim();
  const price = catalog.parsePrice(formData.get("price"));
  const discountPrice = catalog.parsePrice(formData.get("discount_price"));

  if (!name || !price) {
    setProductStatus("Ürün adı ve fiyat zorunludur.", "error");
    return;
  }

  if (discountPrice && discountPrice >= price) {
    setProductStatus("İndirimli fiyat, normal fiyattan düşük olmalıdır.", "error");
    return;
  }

  if (!selectedImageData && !editingProduct?.image) {
    setProductStatus("Lütfen ürün fotoğrafı yükleyin.", "error");
    return;
  }

  try {
    catalog.upsertLocal({
      id: String(formData.get("product_id") || "").trim(),
      name,
      category: String(formData.get("category") || "Keçe Ürün").trim(),
      price,
      discountPrice,
      badge: String(formData.get("badge") || "El Yapımı").trim(),
      image: selectedImageData || editingProduct.image,
      shortDescription: String(formData.get("short_description") || "").trim(),
      description: String(formData.get("description") || "").trim()
    });
    resetProductForm();
    renderAdminProducts();
    setProductStatus("Ürün kaydedildi. Ana sayfadaki ürün kartlarında görünecek.", "success");
  } catch (error) {
    setProductStatus(`Ürün kaydedilemedi: ${error.message || "Tarayıcı depolama alanı dolu olabilir."}`, "error");
  }
};

const initializeAdmin = () => {
  if (initialized) return;
  initialized = true;

  exportButton?.addEventListener("click", exportCsv);
  productForm?.addEventListener("submit", handleProductSubmit);
  productResetButton?.addEventListener("click", resetProductForm);

  productImageInput?.addEventListener("change", async () => {
    const file = productImageInput.files?.[0];
    if (!file) return;
    setProductStatus("Fotoğraf hazırlanıyor...");
    try {
      selectedImageData = await resizeImage(file);
      setImagePreview(selectedImageData);
      setProductStatus("Fotoğraf hazır.", "success");
    } catch (error) {
      setProductStatus(error.message || "Fotoğraf hazırlanamadı.", "error");
    }
  });

  productList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const editId = target.dataset.editProduct;
    const deleteId = target.dataset.deleteProduct;

    if (editId) {
      fillProductForm(editId);
    }

    if (deleteId && catalog && confirm("Bu ürünü silmek istiyor musunuz?")) {
      catalog.removeLocal(deleteId);
      renderAdminProducts();
      resetProductForm();
      setProductStatus("Ürün silindi.", "success");
    }
  });

  if (configured) {
    loadSupabaseOrders().catch((error) => {
      loadLocalOrders();
      setStatus(`Supabase okuma kapalı veya yetkisiz: ${error.message}`);
    });
  } else {
    loadLocalOrders();
  }

  renderAdminProducts();
};

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  setLoginStatus("Kontrol ediliyor...");

  if (await validateLogin(username, password)) {
    setLoginStatus("");
    showAdmin();
    return;
  }

  setLoginStatus("Kullanıcı adı veya parola hatalı.", "error");
});

logoutButton?.addEventListener("click", showLogin);

if (sessionStorage.getItem(sessionKey) === credentialHash) {
  showAdmin();
} else {
  showLogin();
}
