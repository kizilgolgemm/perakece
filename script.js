const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const cartCount = document.querySelector("[data-cart-count]");
const cartButton = document.querySelector(".cart-button");
let cartTotal = 0;

const catalog = window.PeraCatalog;

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};

const makeProductPrice = (product) => {
  const hasDiscount = Number(product.discountPrice) > 0 && Number(product.discountPrice) < Number(product.price);
  if (!catalog) return `<strong>${escapeHtml(product.price)}</strong>`;
  if (!hasDiscount) return `<strong class="product-price">${catalog.formatPrice(product.price)}</strong>`;
  return `
    <strong class="product-price has-discount">
      <span>${catalog.formatPrice(product.discountPrice)}</span>
      <del>${catalog.formatPrice(product.price)}</del>
    </strong>
  `;
};

const renderProductGrids = () => {
  if (!catalog) return;

  document.querySelectorAll("[data-products-grid]").forEach((grid) => {
    const limit = Number(grid.dataset.productsLimit || 0);
    const products = catalog.getAll().slice(0, limit || undefined);

    grid.innerHTML = products.map((product, index) => `
      <article class="product-card reveal delay-${index % 3}" data-product-id="${escapeHtml(product.id)}">
        <button class="heart" type="button" aria-label="Favoriye ekle">♡</button>
        <a class="product-link" href="urun.html?id=${encodeURIComponent(product.id)}" aria-label="${escapeHtml(product.name)} ürününü incele">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
          <span class="product-badge">${escapeHtml(product.badge)}</span>
          <h3>${escapeHtml(product.name)}</h3>
          ${makeProductPrice(product)}
        </a>
      </article>
    `).join("");
  });
};

const renderProductDetail = () => {
  const shell = document.querySelector("[data-product-detail]");
  if (!shell || !catalog) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const product = catalog.findById(id);

  if (!product) {
    shell.innerHTML = `
      <section class="product-empty">
        <p class="section-kicker">Ürün Bulunamadı</p>
        <h1>Bu ürün yayında görünmüyor</h1>
        <p>Ürün kaldırılmış olabilir. Mağaza bölümünden diğer ürünleri inceleyebilirsiniz.</p>
        <a class="button button-primary" href="index.html#urunler">Ürünlere Dön</a>
      </section>
    `;
    return;
  }

  const message = encodeURIComponent(`Merhaba Pera Keçe, ${product.name} ürünü hakkında bilgi almak istiyorum.`);
  document.title = `${product.name} | Pera Keçe`;
  shell.innerHTML = `
    <section class="product-detail reveal is-visible">
      <div class="product-detail-media">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />
      </div>
      <div class="product-detail-copy">
        <p class="section-kicker">${escapeHtml(product.category)}</p>
        <h1>${escapeHtml(product.name)}</h1>
        <div class="product-detail-price">${makeProductPrice(product)}</div>
        <p>${escapeHtml(product.description || product.shortDescription || "El yapımı Pera Keçe ürünü.")}</p>
        <div class="product-detail-tags">
          <span>${escapeHtml(product.badge)}</span>
          <span>El emeği</span>
          <span>Özel sipariş alınır</span>
        </div>
        <div class="hero-actions">
          <a class="button button-primary" href="https://wa.me/905548702907?text=${message}" target="_blank" rel="noopener">WhatsApp ile Sor <span>→</span></a>
          <a class="button button-ghost" href="index.html#siparis">Sipariş Talebi Bırak</a>
        </div>
      </div>
    </section>
  `;
};

const setupRevealObserver = () => {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -36px 0px" }
  );

  reveals.forEach((item) => revealObserver.observe(item));
};

setHeaderState();
renderProductGrids();
renderProductDetail();
setupRevealObserver();

window.addEventListener("scroll", setHeaderState, { passive: true });

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  nav?.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("nav-open", !isOpen);
});

nav?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    menuToggle?.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }
});

document.querySelectorAll("[data-add-cart]").forEach((button) => {
  button.addEventListener("click", () => {
    cartTotal += 1;
    if (cartCount) cartCount.textContent = String(cartTotal);
    cartButton?.classList.remove("is-bumped");
    window.requestAnimationFrame(() => cartButton?.classList.add("is-bumped"));
  });
});
