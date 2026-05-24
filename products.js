(() => {
  const storageKey = "pera_products";

  const defaultProducts = [
    {
      id: "menekse-kece-bros",
      name: "Menekşe Keçe Broş",
      category: "Keçe Aksesuar",
      price: 450,
      discountPrice: null,
      badge: "El Yapımı",
      image: "assets/premium-accessories.jpg",
      shortDescription: "El işçiliğiyle hazırlanmış çiçek motifli keçe broş.",
      description: "Günlük kombinlere zarif bir el emeği dokusu katan menekşe formunda keçe broş."
    },
    {
      id: "papatya-kece-canta",
      name: "Papatya Keçe Çanta",
      category: "Keçe Çanta",
      price: 1250,
      discountPrice: null,
      badge: "Özel Motif",
      image: "assets/premium-hero.jpg",
      shortDescription: "Motif işlemeli, butik üretim keçe çanta.",
      description: "Pera Keçe atölyesinin motif diliyle hazırlanan, günlük kullanım için zarif bir keçe çanta."
    },
    {
      id: "hayat-agaci-duvar-susu",
      name: "Hayat Ağacı Duvar Süsü",
      category: "Dekoratif Ürün",
      price: 850,
      discountPrice: null,
      badge: "Sanat Ürünü",
      image: "assets/premium-home.jpg",
      shortDescription: "Kültürel motiflerle hazırlanmış dekoratif keçe pano.",
      description: "Yaşam ağacı temasını keçe dokusu ve el işçiliğiyle buluşturan dekoratif sanat ürünü."
    },
    {
      id: "nazar-kece-anahtarlik",
      name: "Nazar Keçe Anahtarlık",
      category: "Keçe Aksesuar",
      price: 250,
      discountPrice: null,
      badge: "Hediye",
      image: "assets/product-bros.jpg",
      shortDescription: "Küçük, anlamlı ve el yapımı keçe anahtarlık.",
      description: "Nazar temasını modern bir keçe aksesuarına dönüştüren hafif ve anlamlı bir hediye."
    },
    {
      id: "orman-mantar-dekor",
      name: "Orman Mantar Dekor",
      category: "Dekoratif Ürün",
      price: 690,
      discountPrice: null,
      badge: "Dekor",
      image: "assets/product-coaster.jpg",
      shortDescription: "Doğadan ilham alan dekoratif keçe obje.",
      description: "Masa, raf veya hediye köşelerinde sıcak bir atölye hissi oluşturan dekoratif keçe obje."
    },
    {
      id: "lale-kece-bros",
      name: "Lale Keçe Broş",
      category: "Keçe Aksesuar",
      price: 420,
      discountPrice: null,
      badge: "Kültürel Motif",
      image: "assets/product-bird.jpg",
      shortDescription: "Lale esintili, zarif keçe broş.",
      description: "Kültürel motiflerden ilham alan, sıcak renk paletiyle hazırlanmış el yapımı keçe broş."
    }
  ];

  const parsePrice = (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
    const normalized = String(value)
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    const number = Number(normalized);
    return Number.isFinite(number) && number >= 0 ? number : null;
  };

  const formatPrice = (value) =>
    `${new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(value || 0))} TL`;

  const slugify = (value) =>
    String(value || "urun")
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const makeId = (name) => `${slugify(name)}-${Date.now().toString(36)}`;

  const normalize = (product) => ({
    id: String(product.id || makeId(product.name)),
    name: String(product.name || "").trim(),
    category: String(product.category || "Keçe Ürün").trim(),
    price: parsePrice(product.price) || 0,
    discountPrice: parsePrice(product.discountPrice),
    badge: String(product.badge || "El Yapımı").trim(),
    image: String(product.image || "assets/premium-accessories.jpg").trim(),
    shortDescription: String(product.shortDescription || "").trim(),
    description: String(product.description || "").trim(),
    createdAt: product.createdAt || new Date().toISOString(),
    source: product.source || "local"
  });

  const readLocal = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return Array.isArray(stored) ? stored.map(normalize).filter((product) => product.name) : [];
    } catch {
      return [];
    }
  };

  const writeLocal = (products) => {
    localStorage.setItem(storageKey, JSON.stringify(products.map(normalize)));
  };

  const getAll = () => [...readLocal(), ...defaultProducts.map(normalize)];

  const findById = (id) => getAll().find((product) => product.id === id);

  const upsertLocal = (payload) => {
    const product = normalize({
      ...payload,
      id: payload.id || makeId(payload.name),
      source: "local"
    });
    const products = readLocal();
    const index = products.findIndex((item) => item.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    writeLocal(products);
    return product;
  };

  const removeLocal = (id) => {
    writeLocal(readLocal().filter((product) => product.id !== id));
  };

  window.PeraCatalog = {
    defaults: defaultProducts.map(normalize),
    findById,
    formatPrice,
    getAll,
    getLocal: readLocal,
    makeId,
    parsePrice,
    removeLocal,
    upsertLocal
  };
})();
