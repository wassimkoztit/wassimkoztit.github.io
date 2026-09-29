/* ============================================================
   RESTAURANT — Menu + Cart with sessionStorage
   ============================================================ */

(() => {
    "use strict";

    /* ============================================================
       MENU DATA
       ============================================================ */

    const MENU = {
        food: [
            {
                id: "f1",
                name: "Margherita Pizza",
                desc: "Fresh mozzarella, tomato sauce, and basil on a wood-fired crust.",
                price: 75,
                image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600"
            },
            {
                id: "f2",
                name: "Classic Burger",
                desc: "Beef patty, cheddar, lettuce, tomato, and our signature sauce.",
                price: 65,
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600"
            },
            {
                id: "f3",
                name: "Grilled Salmon",
                desc: "Atlantic salmon with lemon butter, served with seasonal vegetables.",
                price: 120,
                image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600"
            },
            {
                id: "f4",
                name: "Chicken Tagine",
                desc: "Traditional Moroccan tagine with olives, lemon, and spices.",
                price: 85,
                image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600"
            },
            {
                id: "f5",
                name: "Pasta Carbonara",
                desc: "Creamy pasta with pancetta, egg yolk, and parmesan.",
                price: 70,
                image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600"
            },
            {
                id: "f6",
                name: "Caesar Salad",
                desc: "Romaine lettuce, croutons, parmesan, and classic Caesar dressing.",
                price: 55,
                image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600"
            }
        ],
        drinks: [
            {
                id: "d1",
                name: "Fresh Orange Juice",
                desc: "Freshly squeezed oranges, no added sugar.",
                price: 25,
                image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600"
            },
            {
                id: "d2",
                name: "Moroccan Mint Tea",
                desc: "Traditional green tea with fresh mint leaves.",
                price: 20,
                image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600"
            },
            {
                id: "d3",
                name: "Iced Coffee",
                desc: "Cold brew coffee with ice and milk.",
                price: 30,
                image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600"
            },
            {
                id: "d4",
                name: "Lemonade",
                desc: "Fresh lemonade with a hint of mint.",
                price: 22,
                image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600"
            },
            {
                id: "d5",
                name: "Smoothie Bowl",
                desc: "Mixed berries smoothie with granola topping.",
                price: 35,
                image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600"
            },
            {
                id: "d6",
                name: "Sparkling Water",
                desc: "Chilled sparkling mineral water.",
                price: 15,
                image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600"
            }
        ],
        desserts: [
            {
                id: "s1",
                name: "Chocolate Cake",
                desc: "Rich chocolate cake with dark chocolate ganache.",
                price: 45,
                image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600"
            },
            {
                id: "s2",
                name: "Crème Brûlée",
                desc: "Classic French vanilla custard with caramelized sugar.",
                price: 40,
                image: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=600"
            },
            {
                id: "s3",
                name: "Tiramisu",
                desc: "Italian coffee-flavored dessert with mascarpone.",
                price: 42,
                image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600"
            },
            {
                id: "s4",
                name: "Cheesecake",
                desc: "New York style cheesecake with berry compote.",
                price: 48,
                image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600"
            },
            {
                id: "s5",
                name: "Ice Cream Trio",
                desc: "Three scoops: vanilla, chocolate, and strawberry.",
                price: 35,
                image: "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=600"
            },
            {
                id: "s6",
                name: "Baklava",
                desc: "Traditional Moroccan pastry with honey and almonds.",
                price: 30,
                image: "https://images.unsplash.com/photo-1598110750624-207050c4f28c?w=600"
            }
        ]
    };


    /* ============================================================
       STATE
       ============================================================ */

    let cart = loadCart(); // [{ id, name, price, image, qty }]
    let currentCategory = "food";


    /* ============================================================
       DOM
       ============================================================ */

    const menuGrid     = document.getElementById("menuGrid");
    const cartBtn      = document.getElementById("cartBtn");
    const cartDrawer   = document.getElementById("cartDrawer");
    const cartClose    = document.getElementById("cartClose");
    const cartOverlay  = document.getElementById("cartOverlay");
    const cartBody     = document.getElementById("cartBody");
    const cartTotal    = document.getElementById("cartTotal");
    const cartCount    = document.getElementById("cartCount");
    const checkoutBtn  = document.getElementById("checkoutBtn");
    const toast        = document.getElementById("toast");

    const catButtons   = document.querySelectorAll(".cat-btn");


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
       MENU RENDERING
       ============================================================ */

    function renderMenu(category) {
        const items = MENU[category] || [];

        menuGrid.innerHTML = items.map(item => `
            <article class="menu-card">
                <img class="menu-image"
                     src="${item.image}"
                     alt="${item.name}"
                     loading="lazy">

                <div class="menu-info">
                    <h3 class="menu-name">${item.name}</h3>
                    <p class="menu-desc">${item.desc}</p>

                    <div class="menu-footer">
                        <span class="menu-price">${item.price.toFixed(2)} MAD</span>
                        <button class="add-btn"
                                data-id="${item.id}"
                                data-category="${category}">
                            <i class="fa-solid fa-plus"></i> Add
                        </button>
                    </div>
                </div>
            </article>
        `).join("");

        // Attach event listeners
        menuGrid.querySelectorAll(".add-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const cat = btn.dataset.category;
                addToCart(id, cat);
            });
        });
    }


    /* ============================================================
       CATEGORY SWITCHING
       ============================================================ */

    catButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const category = btn.dataset.category;
            if (category === currentCategory) return;

            currentCategory = category;

            catButtons.forEach(b => b.classList.toggle("active", b === btn));

            renderMenu(category);
        });
    });


    /* ============================================================
       CART LOGIC
       ============================================================ */

    function findItem(id) {
        for (const category of Object.values(MENU)) {
            const found = category.find(item => item.id === id);
            if (found) return found;
        }
        return null;
    }

    function addToCart(id, category) {
        const product = MENU[category]?.find(item => item.id === id);
        if (!product) return;

        const existing = cart.find(item => item.id === id);

        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                qty: 1
            });
        }

        saveCart();
        renderCart();
        updateCartCount();

        showToast(`Added "${product.name}" ✓`, "success");
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
            cart = cart.filter(i => i.id !== id);
        }

        saveCart();
        renderCart();
        updateCartCount();
    }

    function removeItem(id) {
        cart = cart.filter(i => i.id !== id);
        saveCart();
        renderCart();
        updateCartCount();
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
                    Your cart is empty.<br>
                    Add something delicious! 🍕
                </div>
            `;
            cartTotal.textContent = "0.00 MAD";
            checkoutBtn.disabled = true;
            return;
        }

        cartBody.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img class="cart-item-img" src="${item.image}" alt="${item.name}">

                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
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
            </div>
        `).join("");

        cartTotal.textContent = `${getCartTotal().toFixed(2)} MAD`;
        checkoutBtn.disabled = false;

        // Attach qty handlers
        cartBody.querySelectorAll(".qty-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const action = btn.dataset.action;

                if (action === "inc") increaseQty(id);
                if (action === "dec") decreaseQty(id);
            });
        });
    }


    function updateCartCount() {
        const count = getCartCount();
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? "inline-flex" : "none";
    }


    /* ============================================================
       CART DRAWER OPEN/CLOSE
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

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeCart();
    });


    /* ============================================================
       CHECKOUT
       ============================================================ */

    checkoutBtn.addEventListener("click", () => {
        if (!cart.length) return;

        const total = getCartTotal();
        const count = getCartCount();

        // Build the order summary (you can send this to a backend later)
        const order = {
            items: cart.map(i => ({
                id: i.id,
                name: i.name,
                price: i.price,
                qty: i.qty,
                subtotal: i.price * i.qty
            })),
            total: total,
            count: count,
            date: new Date().toISOString()
        };

        console.log("🛒 Order placed:", order);

        showToast(`Order confirmed — ${total.toFixed(2)} MAD`, "success");

        // Clear cart
        cart = [];
        saveCart();
        renderCart();
        updateCartCount();
        closeCart();

        // Optional: store last order for history
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
        renderMenu(currentCategory);
        renderCart();
        updateCartCount();
    }

    init();

})();