// Generate moving stars
function createStars() {
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 4 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';
        starsContainer.appendChild(star);
    }
}

// Load items from localStorage or use defaults
let items = JSON.parse(localStorage.getItem('shopItems')) || [
    { name: 'Netherite Sword (Enchanted)', price: 23, description: 'Powerful enchanted sword with assorted enchants', stock: 5, category: 'weapons' },
    { name: 'Netherite Pickaxe', price: 30, description: 'Durable enchanted pickaxe for mining', stock: 3, category: 'tools' },
    { name: 'Netherite Axe', price: 30, description: 'Sharp enchanted axe for chopping', stock: 4, category: 'tools' },
    { name: 'Netherite Armor (Full Set)', price: 70, description: 'Complete enchanted netherite armor set - 20% off deal!', stock: 2, category: 'armor' },
    { name: 'Netherite Armor (Individual Part)', price: 20, description: 'Individual enchanted netherite armor piece (Helmet, Chestplate, Leggings, or Boots)', stock: 10, category: 'armor' },
    { name: 'Diamond Armor (Full Set, Enchanted)', price: 0, description: 'Full enchanted diamond armor set available', stock: 1, category: 'armor' },
    { name: 'Food x64', price: 5, description: '64 Baked Potatoes - Perfect for long adventures', stock: 20, category: 'consumables' },
    { name: 'Elytra', price: 30, description: 'Wings for flying through the skies', stock: 3, category: 'tools' },
    { name: 'Fireworks x64', price: 15, description: '64 Fireworks for epic celebrations', stock: Infinity, category: 'consumables' },
    { name: 'Dragon Head 1x', price: 38, description: 'Rare dragon head trophy', stock: 3, category: 'decorative' },
    { name: 'Ancient Debris (Trade-in)', price: '10 diamonds = 3 Ancient Debris', description: 'Trade in your diamonds for Ancient Debris! Rate: 10 diamonds = 3 Ancient Debris', stock: Infinity, tradeIn: true, category: 'tradein' },
    { name: 'Netherite Ingots (Trade-in)', price: '15 diamonds = 3 Netherite Ingots', description: 'Trade in your diamonds for Netherite Ingots! Rate: 15 diamonds = 3 Netherite Ingots', stock: Infinity, tradeIn: true, category: 'tradein' }
];

// Basket system
let basket = JSON.parse(localStorage.getItem('basket')) || [];

// Save items to localStorage
function saveItems() {
    localStorage.setItem('shopItems', JSON.stringify(items));
}

// Basket functions
function saveBasket() {
    localStorage.setItem('basket', JSON.stringify(basket));
}

function addToBasket(itemName, quantity) {
    if (quantity <= 0) return;

    const existingItem = basket.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        basket.push({ name: itemName, quantity: quantity });
    }
    saveBasket();
    displayBasket();
    displayShop(); // Update stock display
}

function removeFromBasket(index) {
    basket.splice(index, 1);
    saveBasket();
    displayBasket();
    displayShop();
}

function updateBasketQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
        removeFromBasket(index);
        return;
    }
    basket[index].quantity = newQuantity;
    saveBasket();
    displayBasket();
}

function clearBasket() {
    basket = [];
    saveBasket();
    displayBasket();
    displayShop();
}

function getBasketTotal() {
    return basket.reduce((total, basketItem) => {
        const item = items.find(i => i.name === basketItem.name);
        if (item && !item.tradeIn) {
            return total + (item.price * basketItem.quantity);
        }
        return total;
    }, 0);
}

// Display basket
function displayBasket() {
    const basketDiv = document.getElementById('basket');
    const basketTotal = document.getElementById('basket-total');

    if (basket.length === 0) {
        basketDiv.innerHTML = '<p class="text-secondary">Your basket is empty</p>';
        basketTotal.textContent = 'Total: 0 Diamonds';
        return;
    }

    let basketHTML = '<h3>Your Basket</h3>';
    let total = 0;

    basket.forEach((basketItem, index) => {
        const item = items.find(i => i.name === basketItem.name);
        const itemTotal = item && !item.tradeIn ? item.price * basketItem.quantity : 0;
        total += itemTotal;

        basketHTML += `
            <div class="basket-item">
                <div class="basket-item-info">
                    <strong>${basketItem.name}</strong><br>
                    <small>Quantity:
                        <input type="number" value="${basketItem.quantity}" min="1" onchange="updateBasketQuantity(${index}, parseInt(this.value))" style="width: 60px;">
                        ${item && !item.tradeIn ? `× ${item.price} = ${itemTotal} diamonds` : '(Trade-in item)'}
                    </small>
                </div>
                <button class="btn-danger btn-small" onclick="removeFromBasket(${index})">Remove</button>
            </div>
        `;
    });

    basketHTML += `
        <div class="basket-actions">
            <button class="btn-secondary" onclick="clearBasket()">Clear Basket</button>
            <button class="btn-primary" onclick="checkout()">Checkout</button>
        </div>
    `;

    basketDiv.innerHTML = basketHTML;
    basketTotal.textContent = `Total: ${total} Diamonds`;
}

// Display shop items
function displayShop() {
    const shop = document.getElementById('shop');
    shop.innerHTML = '';
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item card';
        itemDiv.style.animationDelay = (index * 0.1) + 's';
        const stockText = item.stock > 0 ? `Stock: ${item.stock}` : 'Out of Stock';
        const stockClass = item.stock > 0 ? 'in-stock' : 'out-stock';

        let priceDisplay = '';
        let buttonHTML = '';

        if (item.tradeIn) {
            priceDisplay = `<p class="price" style="color: #FFD700; font-weight: bold;">${item.price}</p>`;
            buttonHTML = `<button class="btn-primary" onclick="submitTradeIn('${item.name}')" ${item.stock <= 0 ? 'disabled' : ''}>Trade In</button>`;
        } else {
            priceDisplay = `<p class="price">${item.price > 0 ? item.price + ' Diamonds' : 'Contact for Price'}</p>`;
            const maxQuantity = item.stock > 0 ? item.stock : 0;
            buttonHTML = `
                <div class="quantity-selector">
                    <input type="number" id="qty-${index}" min="1" max="${maxQuantity}" value="1" ${maxQuantity <= 0 ? 'disabled' : ''}>
                    <button class="btn-primary" onclick="addToBasket('${item.name}', parseInt(document.getElementById('qty-${index}').value))" ${maxQuantity <= 0 ? 'disabled' : ''}>Add to Basket</button>
                </div>
            `;
        }

        itemDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            ${priceDisplay}
            <p class="stock ${stockClass} badge">${stockText}</p>
            ${buttonHTML}
        `;
        shop.appendChild(itemDiv);
    });
}

// Checkout function
function checkout() {
    if (basket.length === 0) {
        alert('Your basket is empty!');
        return;
    }

    // Fill the form with basket contents
    const itemField = document.getElementById('item');
    const quantityField = document.getElementById('quantity');
    const messageField = document.getElementById('message');

    // Create basket summary
    let basketSummary = 'BASKET ORDER:\n\n';
    let totalDiamonds = 0;

    basket.forEach(basketItem => {
        const item = items.find(i => i.name === basketItem.name);
        if (item && !item.tradeIn) {
            const itemTotal = item.price * basketItem.quantity;
            totalDiamonds += itemTotal;
            basketSummary += `${basketItem.name} × ${basketItem.quantity} = ${itemTotal} diamonds\n`;
        } else if (item && item.tradeIn) {
            basketSummary += `${basketItem.name} × ${basketItem.quantity} (Trade-in)\n`;
        }
    });

    basketSummary += `\nTotal: ${totalDiamonds} diamonds\n\nAdditional message: `;

    // Auto-select "Basket Order" in dropdown
    itemField.value = 'Basket Order';
    quantityField.value = '1'; // Not used for basket orders
    messageField.value = basketSummary;

    // Make message field read-only for basket orders to prevent price changes
    messageField.readOnly = true;
    messageField.style.backgroundColor = '#f0f0f0';
    messageField.style.cursor = 'not-allowed';

    // Add a note that this is a basket order
    const formContainer = document.querySelector('.ticket-form');
    if (!document.getElementById('basket-notice')) {
        const notice = document.createElement('div');
        notice.id = 'basket-notice';
        notice.style.cssText = 'background: #e8f4fd; border: 2px solid #2196F3; border-radius: 10px; padding: 15px; margin-bottom: 20px; color: #0d47a1; font-weight: bold;';
        notice.innerHTML = '🛒 Basket Order - Order details are locked to prevent changes. Only add additional notes below if needed.';
        formContainer.insertBefore(notice, formContainer.firstChild);
    }

    // Scroll to form
    document.getElementById('ticketForm').scrollIntoView({ behavior: 'smooth' });
}

// Filtering and searching
let currentFilter = 'all';

function filterItems() {
    const searchTerm = document.getElementById('itemSearch').value.toLowerCase();
    const shop = document.getElementById('shop');
    const itemElements = shop.querySelectorAll('.item');

    itemElements.forEach((itemElement, index) => {
        const item = items[index];
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) ||
                             item.description.toLowerCase().includes(searchTerm);
        const matchesFilter = currentFilter === 'all' || item.category === currentFilter;

        if (matchesSearch && matchesFilter) {
            itemElement.style.display = 'block';
            itemElement.style.animationDelay = (Array.from(itemElements).indexOf(itemElement) * 0.1) + 's';
        } else {
            itemElement.style.display = 'none';
        }
    });
}

function filterByCategory(category) {
    currentFilter = category;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    filterItems();
}

// Toast notifications
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, duration);
}

// Enhanced add to basket with loading state
function addToBasketEnhanced(itemName, quantity) {
    if (quantity <= 0) return;

    // Find the item element and add loading state
    const itemElements = document.querySelectorAll('.item');
    let itemElement = null;
    items.forEach((item, index) => {
        if (item.name === itemName) {
            itemElement = itemElements[index];
        }
    });

    if (itemElement) {
        itemElement.classList.add('loading');
    }

    // Simulate processing time
    setTimeout(() => {
        addToBasket(itemName, quantity);
        if (itemElement) {
            itemElement.classList.remove('loading');
        }
        showToast(`Added ${quantity}x ${itemName} to basket!`, 'success');
    }, 500);
}

// Update the displayShop function to use enhanced add to basket
function displayShop() {
    const shop = document.getElementById('shop');
    shop.innerHTML = '';
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item card';
        itemDiv.style.animationDelay = (index * 0.1) + 's';
        const stockText = item.stock > 0 ? `Stock: ${item.stock}` : 'Out of Stock';
        const stockClass = item.stock > 0 ? 'in-stock' : 'out-stock';

        let priceDisplay = '';
        let buttonHTML = '';

        if (item.tradeIn) {
            priceDisplay = `<p class="price" style="color: #FFD700; font-weight: bold;">${item.price}</p>`;
            buttonHTML = `<button class="btn-primary" onclick="submitTradeIn('${item.name}')" ${item.stock <= 0 ? 'disabled' : ''}>Trade In</button>`;
        } else {
            priceDisplay = `<p class="price">${item.price > 0 ? item.price + ' Diamonds' : 'Contact for Price'}</p>`;
            const maxQuantity = item.stock > 0 ? item.stock : 0;
            buttonHTML = `
                <div class="quantity-selector">
                    <input type="number" id="qty-${index}" min="1" max="${maxQuantity}" value="1" ${maxQuantity <= 0 ? 'disabled' : ''}>
                    <button class="btn-primary" onclick="addToBasketEnhanced('${item.name}', parseInt(document.getElementById('qty-${index}').value))" ${maxQuantity <= 0 ? 'disabled' : ''}>Add to Basket</button>
                </div>
            `;
        }

        itemDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            ${priceDisplay}
            <p class="stock ${stockClass} badge">${stockText}</p>
            ${buttonHTML}
        `;
        shop.appendChild(itemDiv);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    displayShop();
    displayBasket();
});