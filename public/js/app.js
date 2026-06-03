window.appCart = JSON.parse(localStorage.getItem('cart')) || [];
window.appWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
window.allCachedProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  checkAuth();
  updateActiveNav();

  if (document.getElementById("product-grid")) {
    loadProducts();
  }

  if (document.getElementById("cart-items")) {
    renderCart();
  }
});

function updateActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a, .tab-item");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === path || (path === "index.html" && href === "/")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  const authBtn = document.getElementById("auth-link-btn");
  if (user && authBtn) {
    authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
    authBtn.title = "Logout";
    authBtn.onclick = (e) => {
      e.preventDefault();
      if (confirm("Logout from HabeshaMart?")) {
        api.logout();
      }
    };
  }
}


async function loadProducts() {
  const productGrid = document.getElementById("product-grid");
  if (!productGrid) return;

  let products = [];
  try {
    const response = await api.get("/products");
    products = response;
    
    // Check if we got an error object or non-array
    if (!products || products.error || !Array.isArray(products)) {
        console.error("API Error or invalid format:", products);
        products = [];
    }
  } catch (err) {
    console.error("Critical API Failure:", err);
    products = [];
  }

  window.allCachedProducts = products;
  
  if (products.length === 0) {
    productGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px;">
            <i class="fas fa-box-open" style="font-size: 48px; color: var(--outline-variant); margin-bottom: 20px;"></i>
            <h3 class="headline-md">No products found in Neon DB</h3>
            <p class="body-md">Ensure you have run "node seed.js" and checked your DATABASE_URL.</p>
        </div>
    `;
    return;
  }

  productGrid.innerHTML = "";

  products.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.style.cursor = "pointer";
    card.onclick = (e) => {
      if (e.target.closest(".add-to-cart-sm") || e.target.closest(".wishlist-btn")) return;
      location.href = "product.html?id=" + product.id;
    };

    const isWishlisted = window.appWishlist.some(
      (item) => String(item.id) === String(product.id),
    );

    // stars for rating
    const fullStars = Math.floor(product.rating || 0);
    const halfStar = (product.rating || 0) % 1 >= 0.5 ? 1 : 0;
    let starsHtml = "";
    for(let i=0; i<fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
    if(halfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    for(let i=fullStars+halfStar; i<5; i++) starsHtml += '<i class="far fa-star"></i>';

    card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <button class="wishlist-btn ${isWishlisted ? "active" : ""}" onclick="event.stopPropagation(); toggleWishlist('${product.id}')">
                    <i class="${isWishlisted ? "fas" : "far"} fa-heart"></i>
                </button>
                ${product.badge ? `<span class="product-badge badge-${product.badge.toLowerCase()}">${product.badge}</span>` : ""}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category ? product.category.toUpperCase() : "HERITAGE"}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    <span class="stars">${starsHtml}</span>
                    <span class="reviews-count">(${product.reviews || 0})</span>
                </div>
                <div class="product-footer">
                    <div class="product-price">${product.price.toLocaleString()} ETB</div>
                    <button class="add-to-cart-sm" onclick="event.stopPropagation(); addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
        `;
    productGrid.appendChild(card);
  });
}

function toggleWishlist(id) {
  // Ensure we have products to toggle
  if (!window.allCachedProducts || window.allCachedProducts.length === 0) {
    window.allCachedProducts = typeof demoProducts !== 'undefined' ? [...demoProducts] : [];
  }

  const product = window.allCachedProducts.find((p) => String(p.id) === String(id));
  if (!product) {
    console.error("Product not found for wishlist toggle:", id);
    return;
  }

  const index = window.appWishlist.findIndex((item) => String(item.id) === String(id));
  if (index === -1) {
    window.appWishlist.push(product);
  } else {
    window.appWishlist.splice(index, 1);
  }

  localStorage.setItem("wishlist", JSON.stringify(window.appWishlist));
  updateCartCount();

  // Instant UI Sync across any element that might represent this product
  const isNowWishlisted = window.appWishlist.some((item) => String(item.id) === String(id));
  const allRelatedBtns = document.querySelectorAll(`button[onclick*="'${id}'"]`);

  allRelatedBtns.forEach((btn) => {
    if (btn.classList.contains('wishlist-btn') || btn.classList.contains('wishlist-btn-large') || btn.classList.contains('active')) {
        btn.classList.toggle("active", isNowWishlisted);
        const heartIcon = btn.querySelector("i");
        if (heartIcon) {
            heartIcon.className = isNowWishlisted ? "fas fa-heart" : "far fa-heart";
            // Add a small pulse animation for feedback
            btn.style.transform = 'scale(1.25)';
            setTimeout(() => btn.style.transform = '', 200);
        }
    }
  });

  // Specifically handle the wishlist page refresh
  if (typeof renderWishlist === "function") renderWishlist();
}

function addToCart(id, name, price, image) {
  const existing = window.appCart.find((item) => String(item.id) === String(id));
  if (existing) {
    existing.quantity += 1;
  } else {
    window.appCart.push({ id, name, price, image, quantity: 1 });
  }
  saveCart();
  updateCartCount();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(window.appCart));
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    cartCount.textContent = window.appCart.reduce(
      (total, item) => total + item.quantity,
      0,
    );
  }
  const wishlistCount = document.getElementById("wishlist-count");
  if (wishlistCount) {
    wishlistCount.textContent = window.appWishlist.length;
  }
  const countSummaryEl = document.getElementById("item-total-count");
  if (countSummaryEl)
    countSummaryEl.textContent = window.appCart.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("subtotal-amount");
  const taxEl = document.getElementById("tax-amount");
  const cartTotalEl = document.getElementById("cart-total");

  if (!cartItems) return;

  if (window.appCart.length === 0) {
    cartItems.innerHTML =
      '<div style="text-align:center; padding: 48px;"><p class="body-lg">Your cart is empty.</p><a href="shop.html" class="btn btn-primary" style="margin-top: 20px;">Start Shopping</a></div>';
    if (subtotalEl) subtotalEl.textContent = "0 ETB";
    if (taxEl) taxEl.textContent = "0 ETB";
    if (cartTotalEl) cartTotalEl.textContent = "0 ETB";
    return;
  }

  cartItems.innerHTML = "";
  let total = 0;

  window.appCart.forEach((item) => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-header">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="title-lg">${item.price.toLocaleString()} ETB</p>
                </div>
                <p class="cart-item-meta">Category: Authentic Heritage</p>
                <div class="cart-item-actions">
                    <div class="qty-selector">
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" value="${item.quantity}" class="qty-input" readonly>
                        <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')"><i class="far fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    cartItems.appendChild(itemDiv);
  });

  const tax = total * 0.15;
  const finalTotal = total + tax;

  if (subtotalEl) subtotalEl.textContent = `${total.toLocaleString()} ETB`;
  if (taxEl) taxEl.textContent = `${tax.toLocaleString()} ETB`;
  if (cartTotalEl)
    cartTotalEl.textContent = `${finalTotal.toLocaleString()} ETB`;
}

function updateQuantity(id, newQty) {
  if (newQty < 1) return removeFromCart(id);
  const item = window.appCart.find((i) => String(i.id) === String(id));
  if (item) {
    item.quantity = newQty;
    saveCart();
    updateCartCount();
    renderCart();
  }
}

function removeFromCart(id) {
  const index = window.appCart.findIndex((i) => String(i.id) === String(id));
  if (index !== -1) {
    window.appCart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCart();
  }
}

function clearCart() {
  if (confirm("Clear all items from your heritage cart?")) {
    window.appCart = [];
    saveCart();
    updateCartCount();
    renderCart();
  }
}
