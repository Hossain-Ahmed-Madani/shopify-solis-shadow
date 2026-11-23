(function () {
    "use strict";

    /* 1. MOBILE OFF-CANVAS DRAWER
         ------------------------------------------------------------------ */
    const mobileDrawer = document.getElementById("mobileDrawer");
    const mobileBackdrop = document.getElementById("mobileDrawerBackdrop");
    const openMobileBtn = document.getElementById("openMobileMenuBtn");
    const closeMobileBtn = document.getElementById("closeMobileMenuBtn");

    function setMobileDrawer(open) {
        mobileDrawer.classList.toggle("is-open", open);
        mobileBackdrop.classList.toggle("is-open", open);
        mobileDrawer.setAttribute("aria-hidden", String(!open));
    }

    openMobileBtn.addEventListener("click", () => setMobileDrawer(true));
    closeMobileBtn.addEventListener("click", () => setMobileDrawer(false));
    mobileBackdrop.addEventListener("click", () => setMobileDrawer(false));

    document.querySelectorAll(".mobile-drawer__trigger, .mobile-drawer__back").forEach((btn) => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.target;
            document.querySelectorAll(".mobile-drawer__panel").forEach((p) => {
                p.classList.toggle("is-active", p.dataset.panel === target);
            });
        });
    });

    /* 2. SIDE CART DRAWER & ALL 3 STATES
         ------------------------------------------------------------------ */
    const cartDrawer = document.getElementById("cartDrawer");
    const cartBackdrop = document.getElementById("cartBackdrop");
    const cartItemsList = document.getElementById("cartItemsList");
    const drawerCountEl = document.getElementById("drawerCount");
    const headerCartCountEl = document.getElementById("headerCartCount");
    const subtotalEl = document.getElementById("cartSubtotal");
    const shippingTextEl = document.getElementById("shippingText");
    const shippingFillEl = document.getElementById("shippingFill");
    const toastEl = document.getElementById("toast");
    let toastTimer;

    const FREE_SHIPPING_THRESHOLD = 942;

    const defaultItems = [
        {
            id: "aurelia-band",
            title: "Aurelia Gold Band",
            variant: "18k Gold / Size 6",
            price: 580,
            qty: 1,
            img: "https://placehold.co/152x152/F6F2ED/242220?text=Band",
        },
        {
            id: "seraphina-pearl",
            title: "Seraphina Teardrop Pearl Earrings",
            variant: "18k Gold / Size 6",
            price: 320,
            qty: 1,
            img: "https://placehold.co/152x152/F6F2ED/242220?text=Pearls",
        },
    ];

    let cartItems = JSON.parse(JSON.stringify(defaultItems));

    function showToast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2500);
    }

    function formatUSD(num) {
        return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function renderCart() {
        const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

        drawerCountEl.textContent = String(totalQty);
        headerCartCountEl.textContent = String(totalQty);
        subtotalEl.textContent = formatUSD(subtotal);

        cartDrawer.classList.toggle("is-empty", cartItems.length === 0);

        const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
        const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
        shippingFillEl.style.width = pct + "%";
        shippingTextEl.innerHTML =
            remaining > 0 ? `You're <strong>$${remaining}</strong> away from free shipping.` : `You've unlocked <strong>complimentary express shipping</strong>.`;

        cartItemsList.innerHTML = cartItems
            .map(
                (item, idx) => /* HTML */ `
                    <div class="cart-item">
                        <div class="cart-item__media">
                            <img src="${item.img}" alt="${item.title}" class="cart-item__img" />
                        </div>
                        <div class="cart-item__content">
                            <div class="cart-item__top">
                                <div>
                                    <h3 class="cart-item__title">${item.title}</h3>
                                    <p class="cart-item__variant">${item.variant}</p>
                                </div>
                                <span class="cart-item__price">${formatUSD(item.price * item.qty)}</span>
                            </div>
                            <div class="cart-item__controls">
                                <div class="qty-stepper">
                                    <button type="button" class="qty-stepper__btn js-qty-dec" data-index="${idx}" aria-label="Decrease quantity">-</button>
                                    <span class="qty-stepper__val">${item.qty}</span>
                                    <button type="button" class="qty-stepper__btn js-qty-inc" data-index="${idx}" aria-label="Increase quantity">+</button>
                                </div>
                                <button type="button" class="cart-item__remove js-remove-item" data-index="${idx}">Remove</button>
                            </div>
                        </div>
                    </div>
                `,
            )
            .join("");
    }

    function openCartDrawer(stateMode) {
        if (stateMode === "empty") {
            cartItems = [];
            cartDrawer.classList.remove("hide-upsell");
        } else if (stateMode === "items") {
            if (cartItems.length === 0) cartItems = JSON.parse(JSON.stringify(defaultItems));
            cartDrawer.classList.add("hide-upsell");
        } else if (stateMode === "upsell") {
            if (cartItems.length === 0) cartItems = JSON.parse(JSON.stringify(defaultItems));
            cartDrawer.classList.remove("hide-upsell");
        }
        renderCart();
        cartDrawer.classList.add("is-open");
        cartBackdrop.classList.add("is-open");
    }

    function closeCartDrawer() {
        cartDrawer.classList.remove("is-open");
        cartBackdrop.classList.remove("is-open");
    }

    document.getElementById("openCartBtn").addEventListener("click", () => openCartDrawer("upsell"));
    document.getElementById("closeCartBtn").addEventListener("click", closeCartDrawer);
    cartBackdrop.addEventListener("click", closeCartDrawer);

    document.getElementById("btnStateEmpty").addEventListener("click", () => openCartDrawer("empty"));
    document.getElementById("btnStateItems").addEventListener("click", () => openCartDrawer("items"));
    document.getElementById("btnStateUpsell").addEventListener("click", () => openCartDrawer("upsell"));

    cartItemsList.addEventListener("click", (e) => {
        const inc = e.target.closest(".js-qty-inc");
        const dec = e.target.closest(".js-qty-dec");
        const rem = e.target.closest(".js-remove-item");
        if (inc) {
            cartItems[inc.dataset.index].qty += 1;
            renderCart();
        } else if (dec) {
            const i = dec.dataset.index;
            if (cartItems[i].qty > 1) {
                cartItems[i].qty -= 1;
            } else {
                cartItems.splice(i, 1);
            }
            renderCart();
        } else if (rem) {
            cartItems.splice(rem.dataset.index, 1);
            renderCart();
        }
    });

    document.querySelectorAll(".js-quick-add").forEach((btn) => {
        btn.addEventListener("click", () => {
            cartItems.push({
                id: btn.dataset.title.toLowerCase().replace(/\s+/g, "-"),
                title: btn.dataset.title,
                variant: btn.dataset.variant,
                price: Number(btn.dataset.price),
                qty: 1,
                img: btn.dataset.img,
            });
            renderCart();
            showToast(`${btn.dataset.title} added to bag.`);
        });
    });

    document.getElementById("accountBtn").addEventListener("click", () => {
        showToast("Sign in to access your Solis account.");
    });
    document.getElementById("checkoutBtn").addEventListener("click", () => {
        showToast("Proceeding to Solis secure checkout.");
    });
    document.getElementById("shopPayBtn").addEventListener("click", () => {
        showToast("Opening Shop Pay express checkout.");
    });

    /* 3. SWIPER.JS FOR UPSELL CAROUSEL
         ------------------------------------------------------------------ */
    if (typeof Swiper !== "undefined") {
        new Swiper(".cart-upsell-swiper", {
            slidesPerView: 1.65,
            spaceBetween: 14,
            navigation: {
                nextEl: ".upsell-next",
                prevEl: ".upsell-prev",
            },
            breakpoints: {
                420: { slidesPerView: 2.1, spaceBetween: 14 },
            },
        });
    }

    renderCart();
})();
