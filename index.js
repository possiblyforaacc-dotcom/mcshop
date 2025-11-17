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
    { name: 'Netherite Armor (Full Set)', price: 80, description: 'Complete enchanted netherite armor set - 20% off deal!', stock: 2, category: 'armor' },
    { name: 'Netherite Armor (Individual Part)', price: 20, description: 'Individual enchanted netherite armor piece (Helmet, Chestplate, Leggings, or Boots)', stock: 10, category: 'armor' },
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
        if (basketItem.diamondsNeeded) {
            // New trade-in format
            return total + basketItem.diamondsNeeded;
        } else {
            // Regular items or legacy trade-ins
            const item = items.find(i => i.name === basketItem.name);
            if (item && !item.tradeIn) {
                const salePrice = getSalePrice(item);
                return total + (salePrice * basketItem.quantity);
            }
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
        let displayText = '';
        let itemTotal = 0;

        if (basketItem.tradeInType) {
            // New trade-in format
            displayText = `Quantity: ${basketItem.quantity} ${basketItem.tradeInType} = ${basketItem.diamondsNeeded} diamonds`;
        } else if (item && !item.tradeIn) {
            // Regular item
            const salePrice = getSalePrice(item);
            const isOnSale = isItemOnSale(item);
            itemTotal = salePrice * basketItem.quantity;
            total += itemTotal;

            if (isOnSale && salePrice < item.price) {
                displayText = `Quantity: <input type="number" value="${basketItem.quantity}" min="1" onchange="updateBasketQuantity(${index}, parseInt(this.value))" style="width: 60px;"> × <span style="text-decoration: line-through; color: var(--text-secondary);">${item.price}</span> <span style="color: #FF5722; font-weight: bold;">${salePrice}</span> = ${itemTotal} diamonds`;
            } else {
                displayText = `Quantity: <input type="number" value="${basketItem.quantity}" min="1" onchange="updateBasketQuantity(${index}, parseInt(this.value))" style="width: 60px;"> × ${item.price} = ${itemTotal} diamonds`;
            }
        } else {
            // Legacy trade-in
            displayText = `Quantity: ${basketItem.quantity} (Trade-in item)`;
        }

        basketHTML += `
            <div class="basket-item">
                <div class="basket-item-info">
                    <strong>${basketItem.name}</strong><br>
                    <small>${displayText}</small>
                </div>
                <button class="btn-danger btn-small" onclick="removeFromBasket(${index})">Remove</button>
            </div>
        `;
    });

    // Add promo code section
    basketHTML += `
        <div class="promo-section">
            <input type="text" id="promoCode" placeholder="Enter promo code" style="padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; background: rgba(255, 255, 255, 0.1); color: var(--text-primary); margin-right: 10px;">
            <button class="btn-secondary" onclick="applyPromoCode(document.getElementById('promoCode').value)" style="padding: 8px 16px;">Apply</button>
            ${appliedPromoCode ? `<button class="btn-danger" onclick="removePromoCode()" style="padding: 8px 16px; margin-left: 10px;">Remove</button>` : ''}
        </div>
    `;

    basketHTML += `
        <div class="basket-actions">
            <button class="btn-secondary" onclick="clearBasket()">Clear Basket</button>
            <button class="btn-primary" onclick="checkout()">Checkout</button>
        </div>
    `;

    basketDiv.innerHTML = basketHTML;

    // Update total with discount
    const finalTotal = calculateDiscountedTotal();
    let totalText = `Total: ${finalTotal} Diamonds`;
    if (appliedPromoCode && finalTotal < total) {
        const savings = total - finalTotal;
        totalText += ` (Saved ${savings} diamonds with ${appliedPromoCode.description})`;
    }
    basketTotal.textContent = totalText;
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

        // Add hover tooltip with more details
        itemDiv.title = `${item.name}\n${item.description}\nPrice: ${item.price > 0 ? item.price + ' diamonds' : 'Contact for price'}\nStock: ${item.stock}`;
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
        if (basketItem.tradeInType) {
            // New trade-in format
            basketSummary += `${basketItem.name}: ${basketItem.quantity} ${basketItem.tradeInType} = ${basketItem.diamondsNeeded} diamonds\n`;
        } else {
            // Regular items or legacy trade-ins
            const item = items.find(i => i.name === basketItem.name);
            if (item && !item.tradeIn) {
                const itemTotal = item.price * basketItem.quantity;
                totalDiamonds += itemTotal;
                basketSummary += `${basketItem.name} × ${basketItem.quantity} = ${itemTotal} diamonds\n`;
            } else if (item && item.tradeIn) {
                basketSummary += `${basketItem.name} × ${basketItem.quantity} (Trade-in)\n`;
            }
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
        displayBasket(); // Refresh basket display
        animateBasketUpdate(); // Add bounce animation

        if (itemElement) {
            itemElement.classList.remove('loading');
            addItemAnimation(itemElement); // Re-animate the item
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

// Low stock warnings
function checkLowStock() {
    const lowStockItems = items.filter(item => !item.tradeIn && item.stock > 0 && item.stock <= 3);
    if (lowStockItems.length > 0) {
        const itemNames = lowStockItems.map(item => `${item.name} (${item.stock})`).join(', ');
        showToast(`⚠️ Low stock alert: ${itemNames}`, 'warning', 5000);
    }
}

// Admin statistics
function updateAdminStats() {
    if (document.getElementById('adminContent') && document.getElementById('adminContent').style.display === 'block') {
        const totalTickets = tickets.length;
        const openTickets = tickets.filter(t => t.status === 'Open').length;
        const completedOrders = tickets.filter(t => t.status === 'Completed').length;
        const totalRevenue = tickets
            .filter(t => t.status === 'Completed')
            .reduce((sum, ticket) => {
                if (ticket.basket && ticket.basket.length > 0) {
                    return sum + ticket.basket.reduce((basketSum, item) => {
                        const shopItem = items.find(i => i.name === item.name);
                        return basketSum + (shopItem && !shopItem.tradeIn ? shopItem.price * item.quantity : 0);
                    }, 0);
                } else {
                    const shopItem = items.find(i => i.name === ticket.item);
                    return sum + (shopItem && !shopItem.tradeIn ? shopItem.price * ticket.quantity : 0);
                }
            }, 0);

        // Add stats to admin panel
        const statsDiv = document.createElement('div');
        statsDiv.id = 'admin-stats';
        statsDiv.innerHTML = `
            <h4>📊 Shop Statistics</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div class="stat-card">
                    <strong>${totalTickets}</strong><br>
                    <small>Total Orders</small>
                </div>
                <div class="stat-card">
                    <strong>${openTickets}</strong><br>
                    <small>Open Tickets</small>
                </div>
                <div class="stat-card">
                    <strong>${completedOrders}</strong><br>
                    <small>Completed Orders</small>
                </div>
                <div class="stat-card">
                    <strong>${totalRevenue}</strong><br>
                    <small>Total Diamonds</small>
                </div>
            </div>
        `;

        const existingStats = document.getElementById('admin-stats');
        if (existingStats) {
            existingStats.replaceWith(statsDiv);
        } else {
            document.getElementById('adminContent').insertBefore(statsDiv, document.getElementById('tickets'));
        }
    }
}

// Enhanced admin panel opening
function openAdmin() {
    document.getElementById('adminModal').style.display = 'flex';
    // Check for low stock when opening admin
    setTimeout(checkLowStock, 500);
    // Show tickets by default
    showTickets();
}

// Admin section navigation
function showAnalytics() {
    hideAllAdminSections();
    document.getElementById('analyticsSection').style.display = 'block';
    displayAnalytics();
}

function showBulkOperations() {
    hideAllAdminSections();
    document.getElementById('bulkOperationsSection').style.display = 'block';
}

function showTickets() {
    hideAllAdminSections();
    document.getElementById('ticketsSection').style.display = 'block';
    displayTickets();
}

function showRestock() {
    hideAllAdminSections();
    document.getElementById('restockSection').style.display = 'block';
    displayRestock();
}

function hideAllAdminSections() {
    document.getElementById('analyticsSection').style.display = 'none';
    document.getElementById('bulkOperationsSection').style.display = 'none';
    document.getElementById('saleManagerSection').style.display = 'none';
    document.getElementById('ticketsSection').style.display = 'none';
    document.getElementById('restockSection').style.display = 'none';
}

function displayAnalytics() {
    const analyticsContent = document.getElementById('analyticsContent');
    const report = generateAnalyticsReport();

    analyticsContent.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div class="stat-card">
                <strong>${report.totalOrders}</strong><br>
                <small>Total Orders</small>
            </div>
            <div class="stat-card">
                <strong>${report.completedOrders}</strong><br>
                <small>Completed Orders</small>
            </div>
            <div class="stat-card">
                <strong>${report.totalRevenue}</strong><br>
                <small>Total Revenue (Diamonds)</small>
            </div>
            <div class="stat-card">
                <strong>${report.averageOrderValue}</strong><br>
                <small>Avg Order Value</small>
            </div>
            <div class="stat-card">
                <strong>${report.conversionRate}%</strong><br>
                <small>Conversion Rate</small>
            </div>
            <div class="stat-card">
                <strong>${report.customerRetention}%</strong><br>
                <small>Customer Retention</small>
            </div>
        </div>

        <div style="margin-bottom: 30px;">
            <h4>🏆 Top Selling Items</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                ${report.topSellingItems.map(item => `
                    <div class="stat-card">
                        <strong>${item.quantity}</strong><br>
                        <small>${item.name}</small>
                    </div>
                `).join('')}
            </div>
        </div>

        <div>
            <h4>📈 Recent Activity</h4>
            <div id="recentActivity"></div>
        </div>
    `;

    // Add recent activity
    displayRecentActivity();
}

function displayRecentActivity() {
    const recentActivity = document.getElementById('recentActivity');
    const recentTickets = tickets.slice(-10).reverse(); // Last 10 tickets

    if (recentTickets.length === 0) {
        recentActivity.innerHTML = '<p>No recent activity</p>';
        return;
    }

    recentActivity.innerHTML = recentTickets.map(ticket => `
        <div class="card" style="margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${ticket.discord}</strong>
                    <span class="status-badge status-${ticket.status.toLowerCase()}">${ticket.status}</span>
                </div>
                <small>${new Date(ticket.timestamp).toLocaleString()}</small>
            </div>
            <div style="margin-top: 5px;">
                ${ticket.basket ? ticket.basket.map(item => {
                    if (item.tradeInType) {
                        return `${item.name}: ${item.quantity} ${item.tradeInType}`;
                    } else {
                        return `${item.name} × ${item.quantity}`;
                    }
                }).join(', ') : ticket.item + ' × ' + ticket.quantity}
            </div>
        </div>
    `).join('');
}

// Theme management
let currentTheme = localStorage.getItem('theme') || 'dark';

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    applyTheme();

    // Update toggle button
    const toggleBtn = document.querySelector('.theme-toggle');
    toggleBtn.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
    toggleBtn.classList.toggle('light', currentTheme === 'light');

    showToast(`Switched to ${currentTheme} mode`, 'success');
}

function applyTheme() {
    document.body.className = `${currentTheme}-mode`;
}

// Favorites/Wishlist system
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function toggleFavorite(itemName) {
    const index = favorites.indexOf(itemName);
    if (index > -1) {
        favorites.splice(index, 1);
        showToast(`Removed ${itemName} from favorites`, 'success');
    } else {
        favorites.push(itemName);
        showToast(`Added ${itemName} to favorites`, 'success');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayShop(); // Refresh to show favorite status
}

function isFavorite(itemName) {
    return favorites.includes(itemName);
}

// Item Comparison system
let comparisonItems = JSON.parse(localStorage.getItem('comparisonItems')) || [];

function toggleCompare(itemName) {
    const index = comparisonItems.indexOf(itemName);
    if (index > -1) {
        comparisonItems.splice(index, 1);
        showToast(`Removed ${itemName} from comparison`, 'success');
    } else {
        if (comparisonItems.length >= 4) {
            showToast('You can compare up to 4 items at once', 'error');
            return;
        }
        comparisonItems.push(itemName);
        showToast(`Added ${itemName} to comparison`, 'success');
    }
    localStorage.setItem('comparisonItems', JSON.stringify(comparisonItems));
    displayShop(); // Refresh to show comparison status
    updateComparisonBadge();
}

function isInComparison(itemName) {
    return comparisonItems.includes(itemName);
}

function updateComparisonBadge() {
    // Update comparison button badge
    const compareBtn = document.querySelector('.compare-btn');
    if (comparisonItems.length > 0) {
        compareBtn.innerHTML = `⚖️<span class="badge-count">${comparisonItems.length}</span>`;
    } else {
        compareBtn.innerHTML = '⚖️';
    }
}

// Recently viewed items
let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

function addToRecentlyViewed(itemName) {
    // Remove if already exists
    const index = recentlyViewed.indexOf(itemName);
    if (index > -1) {
        recentlyViewed.splice(index, 1);
    }

    // Add to beginning
    recentlyViewed.unshift(itemName);

    // Keep only last 10
    if (recentlyViewed.length > 10) {
        recentlyViewed = recentlyViewed.slice(0, 10);
    }

    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
}

// Shopping history
let shoppingHistory = JSON.parse(localStorage.getItem('shoppingHistory')) || [];

function addToShoppingHistory(orderData) {
    shoppingHistory.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        items: orderData.basket || [],
        total: getBasketTotal(),
        status: 'completed'
    });

    // Keep only last 50 orders
    if (shoppingHistory.length > 50) {
        shoppingHistory = shoppingHistory.slice(0, 50);
    }

    localStorage.setItem('shoppingHistory', JSON.stringify(shoppingHistory));
}

// Promotional codes system
const promoCodes = {
    'WELCOME10': { discount: 10, type: 'percentage', description: '10% off welcome discount' },
    'SAVE5': { discount: 5, type: 'fixed', description: 'Save 5 diamonds' },
    'MEGASALE': { discount: 25, type: 'percentage', description: 'Mega sale 25% off' },
    'LOYALTY': { discount: 15, type: 'percentage', description: 'Loyalty discount' }
};

let appliedPromoCode = null;

function applyPromoCode(code) {
    const upperCode = code.toUpperCase().trim();

    if (!promoCodes[upperCode]) {
        showToast('Invalid promo code', 'error');
        return false;
    }

    appliedPromoCode = promoCodes[upperCode];
    showToast(`Applied: ${appliedPromoCode.description}`, 'success');
    displayBasket(); // Refresh to show discount
    return true;
}

function removePromoCode() {
    appliedPromoCode = null;
    showToast('Promo code removed', 'success');
    displayBasket();
}

function calculateDiscountedTotal() {
    let total = getBasketTotal();

    if (appliedPromoCode) {
        if (appliedPromoCode.type === 'percentage') {
            total = total * (1 - appliedPromoCode.discount / 100);
        } else if (appliedPromoCode.type === 'fixed') {
            total = Math.max(0, total - appliedPromoCode.discount);
        }
    }

    return Math.round(total);
}

// Enhanced displayShop with favorites and recently viewed
function displayShop() {
    const shop = document.getElementById('shop');
    shop.innerHTML = '';
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item card';
        itemDiv.style.animationDelay = (index * 0.1) + 's';

        // Add click handler for recently viewed
        itemDiv.onclick = () => addToRecentlyViewed(item.name);

        const stockText = item.stock > 0 ? `Stock: ${item.stock}` : 'Out of Stock';
        const stockClass = item.stock > 0 ? 'in-stock' : 'out-stock';
        const isFav = isFavorite(item.name);

        let priceDisplay = '';
        let buttonHTML = '';
        let saleBadge = '';

        if (item.tradeIn) {
            priceDisplay = `<p class="price" style="color: #FFD700; font-weight: bold;">${item.price}</p>`;
            buttonHTML = `<button class="btn-primary" onclick="submitTradeIn()" ${item.stock <= 0 ? 'disabled' : ''}>Trade In</button>`;
        } else {
            const originalPrice = item.price;
            const salePrice = getSalePrice(item);
            const isOnSale = isItemOnSale(item);

            if (isOnSale && salePrice < originalPrice) {
                priceDisplay = `
                    <p class="price">
                        <span style="text-decoration: line-through; color: var(--text-secondary); font-size: 0.9em;">${originalPrice} Diamonds</span><br>
                        <span style="color: #FF5722; font-weight: bold; font-size: 1.1em;">${salePrice} Diamonds</span>
                    </p>
                `;
                saleBadge = `<div class="sale-badge">SALE!</div>`;
            } else {
                priceDisplay = `<p class="price">${item.price > 0 ? item.price + ' Diamonds' : 'Contact for Price'}</p>`;
            }

            const maxQuantity = item.stock > 0 ? item.stock : 0;
            buttonHTML = `
                <div class="quantity-selector">
                    <input type="number" id="qty-${index}" min="1" max="${maxQuantity}" value="1" ${maxQuantity <= 0 ? 'disabled' : ''}>
                    <button class="btn-primary" onclick="addToBasketEnhanced('${item.name}', parseInt(document.getElementById('qty-${index}').value))" ${maxQuantity <= 0 ? 'disabled' : ''}>Add to Basket</button>
                </div>
            `;
        }

        const favoriteIcon = isFav ? '❤️' : '🤍';

        const compareIcon = isInComparison(item.name) ? '✅' : '⚖️';
        const compareTitle = isInComparison(item.name) ? 'Remove from comparison' : 'Add to comparison';

        const rating = getItemRating(item.name);
        const reviewCount = getItemReviewCount(item.name);
        const starsHTML = rating > 0 ? generateStars(rating) : '';

        itemDiv.innerHTML = `
            <div class="item-header">
                <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite('${item.name}')" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">${favoriteIcon}</button>
                <button class="compare-item-btn" onclick="event.stopPropagation(); toggleCompare('${item.name}')" title="${compareTitle}">${compareIcon}</button>
                ${saleBadge}
            </div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            ${priceDisplay}
            <p class="stock ${stockClass} badge">${stockText}</p>
            ${rating > 0 ? `<div class="item-rating"><div class="stars">${starsHTML}</div><span class="rating-text">${rating} (${reviewCount} reviews)</span></div>` : ''}
            <div class="item-actions">
                ${buttonHTML}
                <button class="btn-secondary" onclick="openReviewModal('${item.name}')" style="margin-top: 10px;">⭐ Review</button>
            </div>
        `;

        // Add hover tooltip with more details
        itemDiv.title = `${item.name}\n${item.description}\nPrice: ${item.price > 0 ? item.price + ' diamonds' : 'Contact for price'}\nStock: ${item.stock}\nCategory: ${item.category || 'General'}`;

        shop.appendChild(itemDiv);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('itemSearch').focus();
    }

    // Ctrl/Cmd + B: Open basket (scroll to basket)
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        document.getElementById('basket').scrollIntoView({ behavior: 'smooth' });
    }

    // Ctrl/Cmd + T: Toggle theme
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        toggleTheme();
    }

    // Escape: Close modals
    if (e.key === 'Escape') {
        closeTradeInModal();
        closeAdmin();
    }

    // Ctrl/Cmd + Enter: Submit form (when focused on form elements)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.closest('#ticketForm')) {
            e.preventDefault();
            document.getElementById('ticketForm').dispatchEvent(new Event('submit'));
        }
    }
});

// Enhanced animations
function addItemAnimation(itemElement) {
    itemElement.style.animation = 'none';
    itemElement.offsetHeight; // Trigger reflow
    itemElement.style.animation = 'fadeInUp 0.6s ease-out';
}

function animateBasketUpdate() {
    const basket = document.getElementById('basket');
    basket.style.animation = 'none';
    basket.offsetHeight; // Trigger reflow
    basket.style.animation = 'bounce 0.5s ease-out';
}

// Browser notifications
let notificationsEnabled = localStorage.getItem('notificationsEnabled') === 'true';

function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            notificationsEnabled = permission === 'granted';
            localStorage.setItem('notificationsEnabled', notificationsEnabled);
            if (notificationsEnabled) {
                showToast('Notifications enabled!', 'success');
            }
        });
    }
}

function sendBrowserNotification(title, body, icon = '/favicon.ico') {
    if (notificationsEnabled && 'Notification' in window && document.hidden) {
        new Notification(title, { body, icon });
    }
}

// Item reviews and ratings
let itemReviews = JSON.parse(localStorage.getItem('itemReviews')) || {};

function addItemReview(itemName, rating, comment) {
    if (!itemReviews[itemName]) {
        itemReviews[itemName] = [];
    }

    itemReviews[itemName].push({
        id: Date.now(),
        rating: rating,
        comment: comment,
        date: new Date().toISOString()
    });

    localStorage.setItem('itemReviews', JSON.stringify(itemReviews));
    showToast('Review submitted!', 'success');
}

function getItemRating(itemName) {
    const reviews = itemReviews[itemName] || [];
    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
}

function getItemReviewCount(itemName) {
    return itemReviews[itemName]?.length || 0;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '⭐';
    }

    if (hasHalfStar) {
        stars += '⭐'; // For now, just show full stars
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }

    return stars;
}

function openReviewModal(itemName) {
    // Create review modal if it doesn't exist
    let reviewModal = document.getElementById('reviewModal');
    if (!reviewModal) {
        reviewModal = document.createElement('div');
        reviewModal.id = 'reviewModal';
        reviewModal.className = 'modal';
        reviewModal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="closeReviewModal()">&times;</span>
                <h2>Review ${itemName}</h2>
                <div class="review-form">
                    <div class="rating-section">
                        <label>Your Rating:</label>
                        <div class="star-rating" id="reviewStars">
                            <span class="star" data-rating="1">⭐</span>
                            <span class="star" data-rating="2">⭐</span>
                            <span class="star" data-rating="3">⭐</span>
                            <span class="star" data-rating="4">⭐</span>
                            <span class="star" data-rating="5">⭐</span>
                        </div>
                    </div>
                    <div class="review-input">
                        <label for="reviewComment">Your Review (optional):</label>
                        <textarea id="reviewComment" placeholder="Share your thoughts about this item..." rows="4"></textarea>
                    </div>
                    <div class="review-actions">
                        <button class="btn-primary" onclick="submitReview('${itemName}')">Submit Review</button>
                        <button class="btn-secondary" onclick="closeReviewModal()">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(reviewModal);

        // Initialize star rating for review modal
        const reviewStars = reviewModal.querySelectorAll('.star');
        reviewStars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                updateReviewStarDisplay(rating);
            });
        });
    }

    document.getElementById('reviewModal').style.display = 'flex';
    currentReviewItem = itemName;
    resetReviewForm();
}

function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.style.display = 'none';
        resetReviewForm();
    }
}

function resetReviewForm() {
    document.querySelectorAll('#reviewStars .star').forEach(star => {
        star.classList.remove('active');
    });
    document.getElementById('reviewComment').value = '';
    currentReviewRating = 0;
}

let currentReviewRating = 0;
let currentReviewItem = '';

function updateReviewStarDisplay(rating) {
    currentReviewRating = rating;
    const stars = document.querySelectorAll('#reviewStars .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function submitReview(itemName) {
    if (currentReviewRating === 0) {
        showToast('Please select a rating', 'error');
        return;
    }

    const comment = document.getElementById('reviewComment').value.trim();
    addItemReview(itemName, currentReviewRating, comment);

    closeReviewModal();
    displayShop(); // Refresh to show updated ratings
}

// Advanced admin analytics
function generateAnalyticsReport() {
    const report = {
        totalOrders: tickets.length,
        completedOrders: tickets.filter(t => t.status === 'Completed').length,
        totalRevenue: tickets
            .filter(t => t.status === 'Completed')
            .reduce((sum, ticket) => {
                if (ticket.basket && ticket.basket.length > 0) {
                    return sum + ticket.basket.reduce((basketSum, item) => {
                        if (item.tradeInType) {
                            return basketSum + item.diamondsNeeded;
                        } else {
                            const shopItem = items.find(i => i.name === item.name);
                            return basketSum + (shopItem && !shopItem.tradeIn ? shopItem.price * item.quantity : 0);
                        }
                    }, 0);
                }
                return sum;
            }, 0),
        topSellingItems: getTopSellingItems(),
        customerRetention: calculateCustomerRetention(),
        averageOrderValue: 0,
        conversionRate: 0
    };

    report.averageOrderValue = report.totalOrders > 0 ? (report.totalRevenue / report.totalOrders).toFixed(2) : 0;
    report.conversionRate = report.totalOrders > 0 ? ((report.completedOrders / report.totalOrders) * 100).toFixed(1) : 0;

    return report;
}

function getTopSellingItems() {
    const itemSales = {};

    tickets.filter(t => t.status === 'Completed').forEach(ticket => {
        if (ticket.basket && ticket.basket.length > 0) {
            ticket.basket.forEach(item => {
                if (!item.tradeInType) { // Only count regular items
                    itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity;
                }
            });
        }
    });

    return Object.entries(itemSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, quantity]) => ({ name, quantity }));
}

function calculateCustomerRetention() {
    // Simple retention calculation based on repeat orders
    const customers = {};
    tickets.forEach(ticket => {
        if (!customers[ticket.discord]) {
            customers[ticket.discord] = { orders: 0, completed: 0 };
        }
        customers[ticket.discord].orders++;
        if (ticket.status === 'Completed') {
            customers[ticket.discord].completed++;
        }
    });

    const repeatCustomers = Object.values(customers).filter(customer => customer.orders > 1).length;
    const totalCustomers = Object.keys(customers).length;

    return totalCustomers > 0 ? ((repeatCustomers / totalCustomers) * 100).toFixed(1) : 0;
}

// Sale management system
let currentSale = JSON.parse(localStorage.getItem('currentSale')) || {
    enabled: false,
    percentage: 0,
    name: '',
    startTime: null,
    categorySales: {}
};

// Bulk admin operations
function bulkUpdateStock(percentage) {
    items.forEach(item => {
        if (!item.tradeIn) {
            item.stock = Math.max(0, Math.floor(item.stock * (1 + percentage / 100)));
        }
    });
    saveItems();
    displayRestock();
    displayShop();
    showToast(`Stock updated by ${percentage > 0 ? '+' : ''}${percentage}%`, 'success');
}

function bulkUpdatePrices(percentage) {
    items.forEach(item => {
        if (!item.tradeIn && item.price > 0) {
            item.price = Math.max(1, Math.floor(item.price * (1 + percentage / 100)));
        }
    });
    saveItems();
    displayRestock();
    displayShop();
    showToast(`Prices updated by ${percentage > 0 ? '+' : ''}${percentage}%`, 'success');
}

// Sale management functions
function showSaleManager() {
    hideAllAdminSections();
    document.getElementById('saleManagerSection').style.display = 'block';
    loadSaleSettings();
}

function loadSaleSettings() {
    // Load global sale settings
    document.querySelector(`input[name="saleStatus"][value="${currentSale.enabled ? 'enabled' : 'disabled'}"]`).checked = true;
    document.getElementById('salePercentage').value = currentSale.percentage;
    document.getElementById('currentPercentage').textContent = currentSale.percentage + '%';
    document.getElementById('saleName').value = currentSale.name || '';

    // Update current sale status display
    updateCurrentSaleStatus();
}

function updateSalePercentage(value) {
    document.getElementById('currentPercentage').textContent = value + '%';
}

function updateCategorySalePercentage(value) {
    document.getElementById('currentCategoryPercentage').textContent = value + '%';
}

function toggleSale(enabled) {
    currentSale.enabled = enabled;
    if (!enabled) {
        currentSale.percentage = 0;
        currentSale.name = '';
        document.getElementById('salePercentage').value = 0;
        document.getElementById('currentPercentage').textContent = '0%';
        document.getElementById('saleName').value = '';
    }
    saveSaleSettings();
    updateCurrentSaleStatus();
    displayShop(); // Refresh shop to show/hide sale prices
}

function applySaleSettings() {
    const percentage = parseInt(document.getElementById('salePercentage').value);
    const name = document.getElementById('saleName').value.trim();

    if (percentage < 0 || percentage > 100) {
        showToast('Sale percentage must be between 0 and 100', 'error');
        return;
    }

    currentSale.enabled = true;
    currentSale.percentage = percentage;
    currentSale.name = name;
    currentSale.startTime = new Date().toISOString();

    saveSaleSettings();
    updateCurrentSaleStatus();
    displayShop(); // Refresh shop to show sale prices
    showToast(`Sale "${name}" applied with ${percentage}% discount!`, 'success');
}

function applyCategorySale() {
    const category = document.getElementById('categorySelect').value;
    const percentage = parseInt(document.getElementById('categorySalePercentage').value);

    if (percentage < 0 || percentage > 100) {
        showToast('Category sale percentage must be between 0 and 100', 'error');
        return;
    }

    if (!currentSale.categorySales) {
        currentSale.categorySales = {};
    }

    if (percentage === 0) {
        delete currentSale.categorySales[category];
    } else {
        currentSale.categorySales[category] = {
            percentage: percentage,
            startTime: new Date().toISOString()
        };
    }

    saveSaleSettings();
    displayShop(); // Refresh shop to show category sale prices
    showToast(`Category sale applied: ${percentage}% off ${category}`, 'success');
}

function endSale() {
    currentSale.enabled = false;
    currentSale.percentage = 0;
    currentSale.name = '';
    currentSale.categorySales = {};
    currentSale.startTime = null;

    saveSaleSettings();
    updateCurrentSaleStatus();
    displayShop(); // Refresh shop to remove sale prices
    showToast('Sale ended', 'success');
}

function saveSaleSettings() {
    localStorage.setItem('currentSale', JSON.stringify(currentSale));
}

function updateCurrentSaleStatus() {
    const statusDiv = document.getElementById('currentSaleStatus');

    if (currentSale.enabled && currentSale.percentage > 0) {
        let statusHTML = `
            <div style="background: rgba(76, 175, 80, 0.1); border: 1px solid #4CAF50; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <h4 style="color: #4CAF50; margin: 0 0 10px 0;">🎉 ${currentSale.name || 'Active Sale'}</h4>
                <p style="margin: 5px 0;"><strong>Global Discount:</strong> ${currentSale.percentage}% off all items</p>
                <p style="margin: 5px 0;"><strong>Started:</strong> ${currentSale.startTime ? new Date(currentSale.startTime).toLocaleString() : 'Unknown'}</p>
            </div>
        `;

        // Add category sales
        if (currentSale.categorySales && Object.keys(currentSale.categorySales).length > 0) {
            statusHTML += '<h5>Category Sales:</h5>';
            Object.entries(currentSale.categorySales).forEach(([category, sale]) => {
                statusHTML += `
                    <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #FFC107; border-radius: 6px; padding: 8px; margin: 5px 0;">
                        <strong>${category}:</strong> ${sale.percentage}% off
                    </div>
                `;
            });
        }

        statusDiv.innerHTML = statusHTML;
    } else {
        statusDiv.innerHTML = '<p style="color: var(--text-secondary);">No active sale</p>';
    }
}

// Get sale price for an item
function getSalePrice(item) {
    if (!item || item.tradeIn || item.price <= 0) {
        return item.price;
    }

    let discountPercentage = 0;

    // Check category-specific sale first
    if (currentSale.categorySales && currentSale.categorySales[item.category]) {
        discountPercentage = Math.max(discountPercentage, currentSale.categorySales[item.category].percentage);
    }

    // Check global sale
    if (currentSale.enabled) {
        discountPercentage = Math.max(discountPercentage, currentSale.percentage);
    }

    if (discountPercentage > 0) {
        return Math.max(1, Math.floor(item.price * (1 - discountPercentage / 100)));
    }

    return item.price;
}

// Check if item is on sale
function isItemOnSale(item) {
    if (!item || item.tradeIn || item.price <= 0) {
        return false;
    }

    if (currentSale.enabled && currentSale.percentage > 0) {
        return true;
    }

    if (currentSale.categorySales && currentSale.categorySales[item.category]) {
        return true;
    }

    return false;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    applyTheme();
    displayShop();
    displayBasket();

    // Update theme toggle button
    const toggleBtn = document.querySelector('.theme-toggle');
    toggleBtn.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
    toggleBtn.classList.toggle('light', currentTheme === 'light');

    // Update comparison badge
    updateComparisonBadge();

    // Check for low stock on page load
    setTimeout(checkLowStock, 1000);

    // Add keyboard shortcuts hint
    showKeyboardHints();

    // Initialize star rating
    initializeStarRating();

    // Request notification permission
    setTimeout(() => {
        if (!notificationsEnabled && 'Notification' in window && Notification.permission === 'default') {
            showToast('🔔 Enable notifications for order updates?', 'success', 5000);
            setTimeout(requestNotificationPermission, 1000);
        }
    }, 3000);
});

function showKeyboardHints() {
    setTimeout(() => {
        showToast('💡 Pro tip: Press Ctrl+K to search, Ctrl+B for basket, Ctrl+T to toggle theme!', 'success', 4000);
    }, 2000);
}

// Comparison and History functions
function openComparison() {
    document.getElementById('comparisonModal').style.display = 'flex';
    displayComparison();
}

function closeComparison() {
    document.getElementById('comparisonModal').style.display = 'none';
}

function displayComparison() {
    const content = document.getElementById('comparisonContent');

    if (comparisonItems.length === 0) {
        content.innerHTML = '<p class="text-center">Add items to compare by clicking the ⚖️ button on items in the shop!</p>';
        return;
    }

    let tableHTML = '<table class="comparison-table"><thead><tr><th>Item</th>';

    // Get all items for comparison
    const compareItems = comparisonItems.map(name => items.find(item => item.name === name)).filter(item => item);

    // Add headers for each item
    compareItems.forEach(item => {
        tableHTML += `<th class="item-name">${item.name}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    // Add comparison rows
    const properties = [
        { label: 'Price', key: 'price' },
        { label: 'Stock', key: 'stock' },
        { label: 'Category', key: 'category' },
        { label: 'Trade-in', key: 'tradeIn' }
    ];

    properties.forEach(prop => {
        tableHTML += `<tr><td><strong>${prop.label}</strong></td>`;
        compareItems.forEach(item => {
            let value = item[prop.key];
            if (prop.key === 'tradeIn') {
                value = item.tradeIn ? 'Yes' : 'No';
            } else if (prop.key === 'price') {
                value = item.price > 0 ? `${item.price} diamonds` : 'Contact for price';
            }
            tableHTML += `<td>${value}</td>`;
        });
        tableHTML += '</tr>';
    });

    // Add description row
    tableHTML += '<tr><td><strong>Description</strong></td>';
    compareItems.forEach(item => {
        tableHTML += `<td>${item.description}</td>`;
    });
    tableHTML += '</tr>';

    // Add remove buttons row
    tableHTML += '<tr><td><strong>Actions</strong></td>';
    compareItems.forEach(item => {
        tableHTML += `<td><button class="remove-compare" onclick="toggleCompare('${item.name}')">Remove</button></td>`;
    });
    tableHTML += '</tr>';

    tableHTML += '</tbody></table>';
    content.innerHTML = tableHTML;
}

function openHistory() {
    document.getElementById('historyModal').style.display = 'flex';
    displayHistory();
}

function closeHistory() {
    document.getElementById('historyModal').style.display = 'none';
}

function displayHistory() {
    const content = document.getElementById('historyContent');

    if (!shoppingHistory || shoppingHistory.length === 0) {
        content.innerHTML = '<p class="text-center">Your completed orders will appear here!</p>';
        return;
    }

    let historyHTML = '';
    shoppingHistory.forEach(order => {
        const date = new Date(order.date).toLocaleDateString();
        const time = new Date(order.date).toLocaleTimeString();

        historyHTML += `
            <div class="history-item">
                <h4>Order #${order.id}</h4>
                <div class="history-date">${date} at ${time}</div>
                <div class="history-items">
                    ${order.items.map(item => {
                        if (item.tradeInType) {
                            return `${item.name}: ${item.quantity} ${item.tradeInType}`;
                        } else {
                            const shopItem = items.find(i => i.name === item.name);
                            return `${item.name} × ${item.quantity} (${shopItem ? shopItem.price * item.quantity : 0} diamonds)`;
                        }
                    }).join('<br>')}
                </div>
                <div class="history-total">Total: ${order.total} diamonds</div>
            </div>
        `;
    });

    content.innerHTML = historyHTML;
}

// Customer feedback system
let customerFeedback = JSON.parse(localStorage.getItem('customerFeedback')) || [];
let currentRating = 0;

function openFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'flex';
    resetFeedbackForm();
}

function closeFeedbackModal() {
    document.getElementById('feedbackModal').style.display = 'none';
    resetFeedbackForm();
}

function resetFeedbackForm() {
    currentRating = 0;
    document.getElementById('feedbackText').value = '';
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
    });
}

function initializeStarRating() {
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            currentRating = rating;
            updateStarDisplay(rating);
        });
    });
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function submitFeedback() {
    if (currentRating === 0) {
        showToast('Please select a rating', 'error');
        return;
    }

    const feedback = {
        id: Date.now(),
        rating: currentRating,
        comment: document.getElementById('feedbackText').value.trim(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };

    customerFeedback.push(feedback);
    localStorage.setItem('customerFeedback', JSON.stringify(customerFeedback));

    // Send feedback to Discord
    sendFeedbackNotification(feedback);

    closeFeedbackModal();
    showToast('Thank you for your feedback!', 'success');
}

function sendFeedbackNotification(feedback) {
    const webhookURL = 'https://discord.com/api/webhooks/1439768220348317767/Wkm_TQXlCX_uHmaRst1us4n5vyOqrirVriYONeTYsY98VYTbcQ3xy0ly4l-OuJxXmwJK';

    if (webhookURL === 'YOUR_DISCORD_WEBHOOK_URL') {
        console.log('Discord webhook not configured');
        return;
    }

    const stars = '⭐'.repeat(feedback.rating);

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            embeds: [{
                title: '💬 New Customer Feedback',
                color: 0x9C27B0, // Purple
                fields: [
                    {
                        name: 'Rating',
                        value: `${stars} (${feedback.rating}/5)`,
                        inline: true
                    },
                    {
                        name: 'Comment',
                        value: feedback.comment || 'No comment provided',
                        inline: false
                    },
                    {
                        name: 'Timestamp',
                        value: new Date(feedback.timestamp).toLocaleString(),
                        inline: true
                    }
                ],
                footer: {
                    text: `Feedback ID: ${feedback.id}`
                }
            }]
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to send feedback notification');
        }
        console.log('Feedback notification sent successfully');
    })
    .catch(error => {
        console.error('Error sending feedback notification:', error);
    });
}