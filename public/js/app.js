window.appCart = JSON.parse(localStorage.getItem('cart')) || [];
window.appWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
window.allCachedProducts = [];

document.addEventListener("DOMContentLoaded", () => {
    // Populate cache from demo if still empty
    if (window.allCachedProducts.length === 0 && typeof demoProducts !== 'undefined') {
        window.allCachedProducts = [...demoProducts];
    }
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

const demoProducts = [
  {
    id: "1",
    name: "Artisan Jebena (Large)",
    category: "Handmade Ceramic",
    price: 1450,
    image:
      "https://images.unsplash.com/photo-1594494024039-df071d64388e?w=800&q=80",
    rating: 4.9,
    reviews: 124,
  },
  {
    id: "2",
    name: "Modern Habesha Kemis",
    category: "Hand-spun Cotton",
    price: 8900,
    image:
      "https://images.unsplash.com/photo-1590033062325-17730e25603d?w=800&q=80",
    rating: 5.0,
    reviews: 86,
  },
  {
    id: "3",
    name: "Authentic Berbere Blend",
    category: "Organic Spices",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80",
    rating: 4.8,
    reviews: 210,
  },
  {
    id: "4",
    name: "Gonderine Filigree Cross",
    category: "Silver Jewelry",
    price: 3200,
    image:
      "https://images.unsplash.com/photo-1611085583191-a3b1a620e44a?w=800&q=80",
    rating: 4.9,
    reviews: 45,
  },
  {
    id: "5",
    name: "Sidama A-Grade Beans",
    category: "Coffee Beans",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80",
    rating: 4.7,
    reviews: 320,
  },
  {
    id: "6",
    name: "Woven Jijat Ceremony Mat",
    category: "Home Decor",
    price: 2100,
    image:
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80",
    rating: 4.6,
    reviews: 32,
  },
  {
    id: "7",
    name: "Ivory Teff (5kg Bag)",
    category: "Spices & Grains",
    price: 1850,
    image:
      "https://images.unsplash.com/photo-1615485290382-441e4d019cb5?w=800&q=80",
    rating: 4.9,
    reviews: 540,
  },
  {
    id: "8",
    name: "Hand-woven Netela Scarf",
    category: "Traditional Wear",
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
    rating: 4.8,
    reviews: 215,
  },
  {
    id: "9",
    name: "Lideta Porcelain Set",
    category: "Buna Essentials",
    price: 3400,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
    rating: 4.9,
    reviews: 78,
  },
  {
    id: "10",
    name: "Agelgil Basketry (S)",
    category: "Artifacts",
    price: 850,
    image:
      "https://images.unsplash.com/photo-1590736962231-5912384cda5a?w=800&q=80",
    rating: 4.5,
    reviews: 22,
  },
  {
    id: "11",
    name: "Ethiopian White Honey",
    category: "Organic Grains",
    price: 950,
    image:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80",
    rating: 5.0,
    reviews: 410,
  },
  {
    id: "12",
    name: "Leather Cross Sandals",
    category: "Handmade Shoes",
    price: 2400,
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    rating: 4.7,
    reviews: 56,
  },
  {
    id: "13",
    name: "Ebony Clay Gini Burner",
    category: "Incense",
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1578326457399-3b34dbbf23b8?w=800&q=80",
    rating: 4.6,
    reviews: 58,
  },
  {
    id: "14",
    name: "Hand-carved Meskel Cross",
    category: "Artifacts",
    price: 4500,
    image:
      "https://images.unsplash.com/photo-1611085583191-a3b1a620e44a?w=800&q=80",
    rating: 4.9,
    reviews: 34,
  },
];

async function loadProducts() {
  const productGrid = document.getElementById("product-grid");
  if (!productGrid) return;

  let products;
  try {
    products = await api.get("/products");
    if (!products || products.length === 0 || products.error) {
      products = demoProducts;
    }
  } catch (err) {
    console.warn("API inaccessible, using demo collection.");
    products = typeof demoProducts !== 'undefined' ? demoProducts : [];
  }

  window.allCachedProducts = products;
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
