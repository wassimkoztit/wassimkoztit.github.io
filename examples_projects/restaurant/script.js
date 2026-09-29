/* ============================================================
   RESTAURANT — i18n + Navbar Back + Cart + Product Modal
   ============================================================ */

(() => {
    "use strict";

    /* ============================================================
       MENU DATA (IDs only — text comes from translations.js)
       ============================================================ */

    const MENU = {
        food: [
            { id: "f1", price: 75, subcategory: "pizza",    trending: true,  image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600" },
            { id: "f2", price: 65, subcategory: "burger",   trending: true,  image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600" },
            { id: "f3", price: 120, subcategory: "seafood", trending: false, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600" },
            { id: "f4", price: 85, subcategory: "moroccan", trending: true,  image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600" },
            { id: "f5", price: 70, subcategory: "pasta",    trending: false, image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600" },
            { id: "f6", price: 55, subcategory: "salad",    trending: false, image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600" },
            { id: "f7", price: 85, subcategory: "pizza",    trending: true,  image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600" },
            { id: "f8", price: 85, subcategory: "burger",   trending: false, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600" }
        ],
        drinks: [
            { id: "d1", price: 25, subcategory: "juices", trending: true,  image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600" },
            { id: "d2", price: 20, subcategory: "tea",    trending: true,  image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600" },
            { id: "d3", price: 30, subcategory: "coffee", trending: true,  image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600" },
            { id: "d4", price: 22, subcategory: "juices", trending: false, image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600" },
            { id: "d5", price: 35, subcategory: "juices", trending: false, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600" },
            { id: "d6", price: 15, subcategory: "water",  trending: false, image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600" },
            { id: "d7", price: 28, subcategory: "coffee", trending: false, image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600" },
            { id: "d8", price: 20, subcategory: "coffee", trending: false, image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600" }
        ],
        desserts: [
            { id: "s1", price: 45, subcategory: "cakes",     trending: true,  image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600" },
            { id: "s2", price: 40, subcategory: "cakes",     trending: false, image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600" },
            { id: "s3", price: 42, subcategory: "cakes",     trending: true,  image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600" },
            { id: "s4", price: 48, subcategory: "cakes",     trending: false, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600" },
            { id: "s5", price: 35, subcategory: "ice-cream", trending: true,  image: "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=600" },
            { id: "s6", price: 30, subcategory: "pastry",    trending: false, image: "https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=600" }
        ]
    };

    // Category cover images
    const CATEGORY_IMAGES = {
        trending: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
        food:     "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
        drinks:   "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600",
        desserts: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600"
    };

    // Subcategory cover images
    const SUBCATEGORY_IMAGES = {
        pizza:         "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600",
        burger:        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
        pasta:         "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600",
        seafood:       "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600",
        moroccan:      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600",
        salad:         "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600",
        coffee:        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",
        juices:        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600",
        tea:           "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600",
        water:         "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600",
        cakes:         "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
        "ice-cream":   "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=600",
        pastry:        "https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=600"
    };


    /* ============================================================
       I18N — LANGUAGE SYSTEM
       ============================================================ */

    const SUPPORTED_LANGS = ["en", "fr", "es"];
    const LANG_STORAGE_KEY = "restaurant_lang";

    const LANG_FLAGS = {
        en: "https://flagcdn.com/w40/gb.png",
        fr: "https://flagcdn.com/w40/fr.png",
        es: "https://flagcdn.com/w40/es.png"
    };

    const LANG_LABELS = {
        en: "EN",
        fr: "FR",
        es: "ES"
    };

    let currentLang = loadLang();

    function loadLang() {
        try {
            const saved = localStorage.getItem(LANG_STORAGE_KEY);
            if (saved && SUPPORTED_LANGS.includes(saved)) return saved;

            const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
            if (SUPPORTED_LANGS.includes(browserLang)) return browserLang;

            return "en";
        } catch {
            return "en";
        }
    }

    function saveLang(lang) {
        try {
            localStorage.setItem(LANG_STORAGE_KEY, lang);
        } catch (err) {
            console.warn("Could not save language:", err);
        }
    }

    function t(key) {
        const dict = window.TRANSLATIONS?.[currentLang]
                  || window.TRANSLATIONS?.en
                  || {};
        return dict[key] ?? key;
    }

    function tItems(count) {
        return `${count} ${count === 1 ? t("items") : t("itemsPlural")}`;
    }

    function getProductName(id) {
        const dict = window.TRANSLATIONS?.[currentLang]
                  || window.TRANSLATIONS?.en
                  || {};
        return dict.products?.[id]?.name || id;
    }

    function getProductDesc(id) {
        const dict = window.TRANSLATIONS?.[currentLang]
                  || window.TRANSLATIONS?.en
                  || {};
        return dict.products?.[id]?.desc || "";
    }

    function updateLangButton() {
        const btnFlagImg = document.querySelector("#currentLangFlag img");
        if (btnFlagImg) {
            btnFlagImg.src = LANG_FLAGS[currentLang] || LANG_FLAGS.en;
            btnFlagImg.alt = currentLang.toUpperCase();
        }

        const label = document.getElementById("currentLangLabel");
        if (label) {
            label.textContent = LANG_LABELS[currentLang] || "EN";
        }
    }

    function applyTranslations() {
        document.documentElement.lang = currentLang;

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.dataset.i18n;
            const translation = t(key);
            if (translation) el.textContent = translation;
        });

        updateLangButton();

        document.querySelectorAll(".lang-option").forEach(opt => {
            opt.classList.toggle("active", opt.dataset.lang === currentLang);
        });

        renderCategoryOptions();
        renderCart();

        if (stepSubcategories.style.display !== "none") {
            subcategoryTitle.textContent = getCategoryLabel(currentCategory);
        }

        if (stepMenu.style.display !== "none") {
            renderMenu(currentCategory);
            updateMenuTitle();
        }

        // Update navbar back after text/layout changes
        updateNavBackBtn();
    }

    function getCategoryLabel(categoryKey) {
        const map = {
            trending: "catTrending",
            food: "catFood",
            drinks: "catDrinks",
            desserts: "catDesserts"
        };
        return t(map[categoryKey] || categoryKey);
    }

    function getSubcategoryLabel(subKey) {
        const map = {
            all: "subAll",
            pizza: "subPizza",
            burger: "subBurger",
            pasta: "subPasta",
            seafood: "subSeafood",
            moroccan: "subMoroccan",
            salad: "subSalad",
            coffee: "subCoffee",
            juices: "subJuices",
            tea: "subTea",
            water: "subWater",
            cakes: "subCakes",
            "ice-cream": "subIceCream",
            pastry: "subPastry"
        };
        return t(map[subKey] || subKey);
    }


    /* ============================================================
       STATE
       ============================================================ */

    let cart = loadCart();
    let currentCategory = "trending";
    let currentSubcategory = "all";

    let modalProduct = null;
    let modalQty = 1;


    /* ============================================================
       DOM — MAIN
       ============================================================ */

    const cartBtn     = document.getElementById("cartBtn");
    const cartDrawer  = document.getElementById("cartDrawer");
    const cartClose   = document.getElementById("cartClose");
    const cartOverlay = document.getElementById("cartOverlay");
    const cartBody    = document.getElementById("cartBody");
    const cartTotal   = document.getElementById("cartTotal");
    const cartCount   = document.getElementById("cartCount");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const toast       = document.getElementById("toast");

    const langSwitcher = document.getElementById("langSwitcher");
    const langBtn      = document.getElementById("langBtn");
    const langMenu     = document.getElementById("langMenu");

    const navBackBtn   = document.getElementById("navBackBtn");


    /* ============================================================
       DOM — STEPS
       ============================================================ */

    const stepCategories     = document.getElementById("stepCategories");
    const stepSubcategories  = document.getElementById("stepSubcategories");
    const stepMenu           = document.getElementById("stepMenu");

    const categoryOptions    = document.getElementById("categoryOptions");
    const subcategoryOptions = document.getElementById("subcategoryOptions");
    const subcategoryTitle   = document.getElementById("subcategoryTitle");
    const menuTitle          = document.getElementById("menuTitle");
    const menuSubtitle       = document.getElementById("menuSubtitle");

    const backToCategories    = document.getElementById("backToCategories");
    const backToSubcategories = document.getElementById("backToSubcategories");

    const menuGrid            = document.getElementById("menuGrid");


    /* ============================================================
       DOM — PRODUCT MODAL
       ============================================================ */

    const productModal        = document.getElementById("productModal");
    const productModalOverlay = document.getElementById("productModalOverlay");
    const productModalClose   = document.getElementById("productModalClose");
    const productModalImage   = document.getElementById("productModalImage");
    const productModalName    = document.getElementById("productModalName");
    const productModalDesc    = document.getElementById("productModalDesc");
    const productModalPrice   = document.getElementById("productModalPrice");
    const productModalQty     = document.getElementById("productModalQty");
    const productModalTotal   = document.getElementById("productModalTotal");
    const productModalAdd     = document.getElementById("productModalAdd");


    /* ============================================================
       LANGUAGE SWITCHER
       ============================================================ */

    langBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        langSwitcher.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
        if (!langSwitcher.contains(e.target)) {
            langSwitcher.classList.remove("open");
        }
    });

    langMenu.querySelectorAll(".lang-option").forEach(btn => {
        btn.addEventListener("click", () => {
            const lang = btn.dataset.lang;
            if (lang === currentLang) {
                langSwitcher.classList.remove("open");
                return;
            }

            currentLang = lang;
            saveLang(lang);
            applyTranslations();

            langSwitcher.classList.remove("open");
        });
    });


    /* ============================================================
       SESSION STORAGE
       ============================================================ */

    function loadCart() {
        try {
            const raw = sessionStorage.getItem("restaurant_cart");
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveCart() {
        try {
            sessionStorage.setItem("restaurant_cart", JSON.stringify(cart));
        } catch (err) {
            console.warn("Could not save cart:", err);
        }
    }


    /* ============================================================
       TRENDING
       ============================================================ */

    function getTrendingItems() {
        const all = [];

        for (const [cat, items] of Object.entries(MENU)) {
            items.forEach(item => {
                if (item.trending) {
                    all.push({ ...item, category: cat });
                }
            });
        }

        return all.sort((a, b) => b.price - a.price);
    }


    /* ============================================================
       STEP NAVIGATION
       ============================================================ */

    function showStep(step) {
        stepCategories.style.display    = step === "categories" ? "block" : "none";
        stepSubcategories.style.display = step === "subcategories" ? "block" : "none";
        stepMenu.style.display          = step === "menu" ? "block" : "none";

        const section = document.querySelector(".steps-section");
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 80,
                behavior: "smooth"
            });
        }

        // Update nav-back visibility after the scroll settles
        setTimeout(updateNavBackBtn, 350);
    }


    /* ============================================================
       NAVBAR BACK BUTTON
       ============================================================ */

    function getActiveStepBack() {
        if (stepSubcategories.style.display !== "none") {
            return backToCategories;
        }
        if (stepMenu.style.display !== "none") {
            return backToSubcategories;
        }
        return null;
    }

    function updateNavBackBtn() {
        const activeBack = getActiveStepBack();

        if (!activeBack) {
            navBackBtn.classList.remove("visible");
            return;
        }

        const rect = activeBack.getBoundingClientRect();
        const headerHeight = 80;

        if (rect.bottom < headerHeight) {
            navBackBtn.classList.add("visible");
        } else {
            navBackBtn.classList.remove("visible");
        }
    }

    let scrollTicking = false;
    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                updateNavBackBtn();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    window.addEventListener("resize", updateNavBackBtn);

    // Navbar back button — delegates click to the active step-back
    navBackBtn.addEventListener("click", () => {
        const activeBack = getActiveStepBack();
        if (activeBack) activeBack.click();
    });


    /* ============================================================
       STEP 1: CATEGORIES
       ============================================================ */

    function renderCategoryOptions() {
        const categories = [
            { key: "trending", labelKey: "catTrending", trending: true },
            { key: "food",     labelKey: "catFood" },
            { key: "drinks",   labelKey: "catDrinks" },
            { key: "desserts", labelKey: "catDesserts" }
        ];

        categoryOptions.innerHTML = categories.map(cat => {
            const count = cat.key === "trending"
                ? getTrendingItems().length
                : (MENU[cat.key] || []).length;

            const img = CATEGORY_IMAGES[cat.key] || "";
            const label = t(cat.labelKey);

            return `
                <button class="step-option ${cat.trending ? "trending" : ""}"
                        data-category="${cat.key}">
                    <div class="step-option-image">
                        <img src="${img}" alt="${label}" loading="lazy">
                        <div class="step-option-overlay"></div>
                    </div>
                    <div class="step-option-content">
                        <div class="step-option-name">${label}</div>
                        <div class="step-option-count">${tItems(count)}</div>
                    </div>
                </button>
            `;
        }).join("");

        categoryOptions.querySelectorAll(".step-option").forEach(btn => {
            btn.addEventListener("click", () => {
                openCategory(btn.dataset.category);
            });
        });
    }


    /* ============================================================
       STEP 2: SUBCATEGORIES
       ============================================================ */

    function openCategory(category) {
        currentCategory = category;
        currentSubcategory = "all";

        if (category === "trending") {
            const trendingItems = getTrendingItems();

            menuTitle.textContent = t("hotRightNow");
            menuSubtitle.textContent = tItems(trendingItems.length);

            renderMenu("trending");
            showStep("menu");
            return;
        }

        const items = MENU[category] || [];

        const counts = {};
        items.forEach(item => {
            const sub = item.subcategory || "other";
            counts[sub] = (counts[sub] || 0) + 1;
        });

        const subKeys = Object.keys(counts);

        subcategoryTitle.textContent = getCategoryLabel(category);

        const allOption = `
            <button class="step-option" data-subcategory="all">
                <div class="step-option-image">
                    <img src="${CATEGORY_IMAGES[category] || ""}" alt="${t("subAll")}" loading="lazy">
                    <div class="step-option-overlay"></div>
                </div>
                <div class="step-option-content">
                    <div class="step-option-name">${t("subAll")}</div>
                    <div class="step-option-count">${tItems(items.length)}</div>
                </div>
            </button>
        `;

        const subOptions = subKeys.map(sub => `
            <button class="step-option" data-subcategory="${sub}">
                <div class="step-option-image">
                    <img src="${SUBCATEGORY_IMAGES[sub] || CATEGORY_IMAGES[category] || ""}"
                         alt="${getSubcategoryLabel(sub)}"
                         loading="lazy">
                    <div class="step-option-overlay"></div>
                </div>
                <div class="step-option-content">
                    <div class="step-option-name">${getSubcategoryLabel(sub)}</div>
                    <div class="step-option-count">${tItems(counts[sub])}</div>
                </div>
            </button>
        `).join("");

        subcategoryOptions.innerHTML = allOption + subOptions;

        subcategoryOptions.querySelectorAll(".step-option").forEach(btn => {
            btn.addEventListener("click", () => {
                const sub = btn.dataset.subcategory;
                currentSubcategory = sub;

                const filtered = sub === "all"
                    ? MENU[category]
                    : MENU[category].filter(i => i.subcategory === sub);

                menuTitle.textContent = sub === "all"
                    ? getCategoryLabel(category)
                    : getSubcategoryLabel(sub);

                menuSubtitle.textContent = tItems(filtered.length);

                renderMenu(category);
                showStep("menu");
            });
        });

        showStep("subcategories");
    }


    /* ============================================================
       UPDATE MENU TITLE
       ============================================================ */

    function updateMenuTitle() {
        if (currentCategory === "trending") {
            menuTitle.textContent = t("hotRightNow");
            menuSubtitle.textContent = tItems(getTrendingItems().length);
            return;
        }

        const items = MENU[currentCategory] || [];
        const filtered = currentSubcategory === "all"
            ? items
            : items.filter(i => i.subcategory === currentSubcategory);

        menuTitle.textContent = currentSubcategory === "all"
            ? getCategoryLabel(currentCategory)
            : getSubcategoryLabel(currentSubcategory);

        menuSubtitle.textContent = tItems(filtered.length);
    }


    /* ============================================================
       STEP 3: MENU
       ============================================================ */

    function renderMenu(category) {
        let items;

        if (category === "trending") {
            items = getTrendingItems();
        } else {
            items = MENU[category] || [];
            if (currentSubcategory !== "all") {
                items = items.filter(item => item.subcategory === currentSubcategory);
            }
        }

        if (!items.length) {
            menuGrid.innerHTML = `
                <div class="menu-empty">
                    <i class="fa-solid fa-utensils"></i>
                    <p>${t("noItems")}</p>
                </div>
            `;
            return;
        }

        menuGrid.innerHTML = items.map(item => {
            const itemCategory = item.category || category;
            const name = getProductName(item.id);
            const desc = getProductDesc(item.id);

            const trendingBadge = item.trending
                ? `<span class="trending-badge"><i class="fa-solid fa-fire"></i> ${t("popular")}</span>`
                : "";

            return `
                <article class="menu-card"
                         data-id="${item.id}"
                         data-category="${itemCategory}">
                    ${trendingBadge}
                    <img class="menu-image"
                         src="${item.image}"
                         alt="${name}"
                         loading="lazy">

                    <div class="menu-info">
                        <h3 class="menu-name">${name}</h3>
                        <p class="menu-desc">${desc}</p>

                        <div class="menu-footer">
                            <span class="menu-price">${item.price.toFixed(2)} MAD</span>
                            <button class="add-btn"
                                    data-id="${item.id}"
                                    data-category="${itemCategory}">
                                <i class="fa-solid fa-plus"></i> ${t("add")}
                            </button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        menuGrid.querySelectorAll(".menu-card").forEach(card => {
            card.addEventListener("click", (e) => {
                if (e.target.closest(".add-btn")) return;
                openProductModal(card.dataset.id, card.dataset.category);
            });
        });

        menuGrid.querySelectorAll(".add-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                addToCart(btn.dataset.id, btn.dataset.category);
            });
        });
    }


    /* ============================================================
       BACK BUTTONS (original)
       ============================================================ */

    backToCategories.addEventListener("click", () => {
        showStep("categories");
    });

    backToSubcategories.addEventListener("click", () => {
        if (currentCategory === "trending") {
            showStep("categories");
        } else {
            openCategory(currentCategory);
            showStep("subcategories");
        }
    });


    /* ============================================================
       FIND PRODUCT
       ============================================================ */

    function findProduct(id, category) {
        let product = MENU[category]?.find(item => item.id === id);

        if (!product) {
            for (const items of Object.values(MENU)) {
                product = items.find(item => item.id === id);
                if (product) break;
            }
        }

        return product || null;
    }


    /* ============================================================
       CART LOGIC
       ============================================================ */

    function addToCart(id, category) {
        const product = findProduct(id, category);
        if (!product) return;

        const name = getProductName(id);
        const existing = cart.find(item => item.id === id);

        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({
                id: product.id,
                name: name,
                price: product.price,
                image: product.image,
                qty: 1
            });
        }

        saveCart();
        renderCart();
        updateCartCount();

        showToast(`${t("added")} "${name}" ✓`, "success");
    }

    function increaseQty(id) {
        const item = cart.find(i => i.id === id);
        if (!item) return;
        item.qty += 1;
        saveCart();
        renderCart();
        updateCartCount();
    }

    function decreaseQty(id) {
        const item = cart.find(i => i.id === id);
        if (!item) return;

        item.qty -= 1;
        if (item.qty <= 0) {
            removeItem(id);
            return;
        }

        saveCart();
        renderCart();
        updateCartCount();
    }

    function removeItem(id) {
        const item = cart.find(i => i.id === id);
        if (!item) return;

        const name = getProductName(id);
        cart = cart.filter(i => i.id !== id);
        saveCart();
        renderCart();
        updateCartCount();

        showToast(`${t("removed")} "${name}"`, "danger");
    }

    function getCartTotal() {
        return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    }

    function getCartCount() {
        return cart.reduce((sum, item) => sum + item.qty, 0);
    }


    /* ============================================================
       CART RENDERING
       ============================================================ */

    function renderCart() {
        if (!cart.length) {
            cartBody.innerHTML = `
                <div class="cart-empty">
                    <i class="fa-solid fa-bag-shopping"></i>
                    ${t("emptyCart")}
                </div>
            `;
            cartTotal.textContent = "0.00 MAD";
            checkoutBtn.disabled = true;
            return;
        }

        cartBody.innerHTML = cart.map(item => {
            const name = getProductName(item.id);

            return `
                <div class="cart-item" data-id="${item.id}">
                    <img class="cart-item-img" src="${item.image}" alt="${name}">

                    <div class="cart-item-info">
                        <div class="cart-item-name">${name}</div>
                        <div class="cart-item-price">${item.price.toFixed(2)} MAD</div>
                    </div>

                    <div class="cart-qty">
                        <button class="qty-btn" data-action="dec" data-id="${item.id}">
                            <i class="fa-solid fa-minus"></i>
                        </button>
                        <span class="qty-value">${item.qty}</span>
                        <button class="qty-btn" data-action="inc" data-id="${item.id}">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>

                    <button class="cart-item-remove" data-id="${item.id}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
        }).join("");

        cartTotal.textContent = `${getCartTotal().toFixed(2)} MAD`;
        checkoutBtn.disabled = false;

        cartBody.querySelectorAll(".qty-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const action = btn.dataset.action;
                if (action === "inc") increaseQty(id);
                if (action === "dec") decreaseQty(id);
            });
        });

        cartBody.querySelectorAll(".cart-item-remove").forEach(btn => {
            btn.addEventListener("click", () => removeItem(btn.dataset.id));
        });
    }

    function updateCartCount() {
        const count = getCartCount();
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? "inline-flex" : "none";
    }


    /* ============================================================
       CART DRAWER
       ============================================================ */

    function openCart() {
        cartDrawer.classList.add("active");
        cartOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeCart() {
        cartDrawer.classList.remove("active");
        cartOverlay.classList.remove("active");
        document.body.style.overflow = "";
    }

    cartBtn.addEventListener("click", openCart);
    cartClose.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);


    /* ============================================================
       PRODUCT MODAL
       ============================================================ */

    function openProductModal(id, category) {
        const product = findProduct(id, category);
        if (!product) return;

        modalProduct = { ...product, category };
        modalQty = 1;

        const name = getProductName(product.id);
        const desc = getProductDesc(product.id);

        productModalImage.src = product.image;
        productModalImage.alt = name;
        productModalName.textContent = name;
        productModalDesc.textContent = desc;
        productModalPrice.textContent = `${product.price.toFixed(2)} MAD`;

        updateModalQtyUI();

        productModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function closeProductModal() {
        productModal.classList.remove("active");
        if (!cartDrawer.classList.contains("active")) {
            document.body.style.overflow = "";
        }
        modalProduct = null;
        modalQty = 1;
    }

    function updateModalQtyUI() {
        if (!modalProduct) return;

        productModalQty.textContent = modalQty;

        const decBtn = productModal.querySelector('.qty-selector-btn[data-action="dec"]');
        if (decBtn) decBtn.disabled = modalQty <= 1;

        const total = modalProduct.price * modalQty;
        productModalTotal.textContent = `${total.toFixed(2)} MAD`;
    }

    productModalClose.addEventListener("click", closeProductModal);
    productModalOverlay.addEventListener("click", closeProductModal);

    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (productModal.classList.contains("active")) {
            closeProductModal();
        } else if (cartDrawer.classList.contains("active")) {
            closeCart();
        }
    });

    productModal.querySelectorAll(".qty-selector-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            if (action === "inc") modalQty += 1;
            else if (action === "dec" && modalQty > 1) modalQty -= 1;
            updateModalQtyUI();
        });
    });

    productModalAdd.addEventListener("click", () => {
        if (!modalProduct) return;

        const name = getProductName(modalProduct.id);
        const existing = cart.find(i => i.id === modalProduct.id);

        if (existing) {
            existing.qty += modalQty;
            existing.name = name;
        } else {
            cart.push({
                id: modalProduct.id,
                name: name,
                price: modalProduct.price,
                image: modalProduct.image,
                qty: modalQty
            });
        }

        saveCart();
        renderCart();
        updateCartCount();

        showToast(`${t("added")} ${modalQty}× "${name}" ✓`, "success");
        closeProductModal();
    });


    /* ============================================================
       CHECKOUT
       ============================================================ */

    checkoutBtn.addEventListener("click", () => {
        if (!cart.length) return;

        const total = getCartTotal();
        const count = getCartCount();

        const order = {
            items: cart.map(i => ({
                id: i.id,
                name: getProductName(i.id),
                price: i.price,
                qty: i.qty,
                subtotal: i.price * i.qty
            })),
            total: total,
            count: count,
            lang: currentLang,
            date: new Date().toISOString()
        };

        console.log("🛒 Order placed:", order);

        showToast(`${t("orderConfirmed")} — ${total.toFixed(2)} MAD`, "success");

        cart = [];
        saveCart();
        renderCart();
        updateCartCount();
        closeCart();

        sessionStorage.setItem("restaurant_last_order", JSON.stringify(order));
    });


    /* ============================================================
       TOAST
       ============================================================ */

    let toastTimer = null;

    function showToast(message, type = "") {
        toast.textContent = message;
        toast.className = "toast show " + type;

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2400);
    }


    /* ============================================================
       INIT
       ============================================================ */

    function init() {
        applyTranslations();
        renderCart();
        updateCartCount();
        showStep("categories");
    }

    init();

})();
