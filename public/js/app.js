let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    checkAuth();

    if (document.getElementById('product-grid')) {
        loadProducts();
    }

    if (document.getElementById('cart-items')) {
        renderCart();
    }
});

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authLink = document.getElementById('auth-link');
    if (user && authLink) {
        authLink.textContent = 'Logout';
        authLink.href = '#';
        authLink.onclick = (e) => {
            e.preventDefault();
            api.logout();
        };
    }
}

async function loadProducts() {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;
    
    try {
        const products = await api.get('/products');
        productGrid.innerHTML = '';
        
        products.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Randomly assign badges for demo purposes
            let badgeHtml = '';
            if (index % 3 === 0) badgeHtml = '<span class="product-badge badge-bestseller">Best Seller</span>';
            else if (index % 5 === 0) badgeHtml = '<span class="product-badge badge-limited">Limited</span>';

            card.innerHTML = `
                <div class="product-image-wrap">
                    ${badgeHtml}
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <p class="product-cat">${product.category}</p>
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-rating">
                        <i class="fas fa-star"></i>
                        <span>${product.rating || '4.8'} (${product.reviews || '20'} reviews)</span>
                    </div>
                    <div class="product-price-row">
                        <p class="product-price">${product.price.toLocaleString()} ETB</p>
                        <button class="add-btn" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                    </div>
                </div>
                <div style="padding: 0 16px 16px;">
                    <a href="/product.html?id=${product.id}" class="btn btn-ghost" style="width: 100%; font-size: 12px; height: 32px; border: 1px solid var(--outline-variant);">View Details</a>
                </div>
            `;
            productGrid.appendChild(card);
        });
    } catch (err) {
        productGrid.innerHTML = '<p>Failed to load our refined collection. Please try again.</p>';
    }
}

function addToCart(id, name, price, image) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }
    saveCart();
    updateCartCount();
    // Subtle feedback could be added here
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = count;
    
    const countSummaryEl = document.getElementById('item-total-count');
    if (countSummaryEl) countSummaryEl.textContent = count;
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal-amount');
    const taxEl = document.getElementById('tax-amount');
    const cartTotalEl = document.getElementById('cart-total');
    
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<div style="text-align:center; padding: 48px;"><p class="body-lg">Your cart is empty.</p><a href="/shop.html" class="btn btn-primary" style="margin-top: 20px;">Start Shopping</a></div>';
        if (subtotalEl) subtotalEl.textContent = '0 ETB';
        if (taxEl) taxEl.textContent = '0 ETB';
        if (cartTotalEl) cartTotalEl.textContent = '0 ETB';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-header">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="title-lg">${item.price} ETB</p>
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

    const tax = total * 0.15; // 15% VAT
    const finalTotal = total + tax;

    if (subtotalEl) subtotalEl.textContent = `${total.toLocaleString()} ETB`;
    if (taxEl) taxEl.textContent = `${tax.toLocaleString()} ETB`;
    if (cartTotalEl) cartTotalEl.textContent = `${finalTotal.toLocaleString()} ETB`;
}

function updateQuantity(id, qty) {
    if (qty < 1) {
        removeFromCart(id);
        return;
    }
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity = parseInt(qty);
        saveCart();
        renderCart();
        updateCartCount();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
    updateCartCount();
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        renderCart();
        updateCartCount();
    }
}
