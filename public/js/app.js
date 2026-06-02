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
    try {
        const products = await api.get('/products');
        productGrid.innerHTML = '';
        
        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">${product.price} ETB</p>
                    <button class="btn btn-primary add-to-cart" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image}')">
                        Add to Cart
                    </button>
                    <a href="/product.html?id=${product.id}" style="display:block; text-align:center; margin-top:10px; color:var(--text-muted); text-decoration:none; font-size:0.9rem;">View Details</a>
                </div>
            `;
            productGrid.appendChild(card);
        });
    } catch (err) {
        productGrid.innerHTML = '<p>Failed to load products.</p>';
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
    alert(`${name} added to cart!`);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.textContent = count;
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<tr><td colspan="4" style="text-align:center">Your cart is empty.</td></tr>';
        cartTotal.textContent = '0 ETB';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <img src="${item.image}" width="50" style="border-radius:5px">
                    <span>${item.name}</span>
                </div>
            </td>
            <td>${item.price} ETB</td>
            <td>
                <input type="number" value="${item.quantity}" min="1" style="width:50px; padding:5px;" onchange="updateQuantity('${item.id}', this.value)">
            </td>
            <td>${subtotal} ETB</td>
            <td><button class="btn" style="background:#ef4444; color:white; padding:5px 10px;" onclick="removeFromCart('${item.id}')">Remove</button></td>
        `;
        cartItems.appendChild(tr);
    });

    cartTotal.textContent = `${total} ETB`;
}

function updateQuantity(id, qty) {
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
