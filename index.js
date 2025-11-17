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
        if (basketItem.diamondsNeeded) {
            // New trade-in format
            return total + basketItem.diamondsNeeded;
        } else {
            // Regular items or legacy trade-ins
            const item = items.find(i => i.name === basketItem.name);
            if (item && !item.tradeIn) {
                return total + (item.price * basketItem.quantity);
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
            itemTotal = item.price * basketItem.quantity;
            total += itemTotal;
            displayText = `Quantity: <input type="number" value="${basketItem.quantity}" min="1" onchange="updateBasketQuantity(${index}, parseInt(this.value))" style="width: 60px;"> × ${item.price} = ${itemTotal} diamonds`;
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

        if (item.tradeIn) {
            priceDisplay = `<p class="price" style="color: #FFD700; font-weight: bold;">${item.price}</p>`;
            buttonHTML = `<button class="btn-primary" onclick="submitTradeIn()" ${item.stock <= 0 ? 'disabled' : ''}>Trade In</button>`;
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

        const favoriteIcon = isFav ? '❤️' : '🤍';

        itemDiv.innerHTML = `
            <div class="item-header">
                <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite('${item.name}')" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">${favoriteIcon}</button>
            </div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            ${priceDisplay}
            <p class="stock ${stockClass} badge">${stockText}</p>
            ${buttonHTML}
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

    // Check for low stock on page load
    setTimeout(checkLowStock, 1000);

    // Add keyboard shortcuts hint
    showKeyboardHints();

    // Initialize star rating
    initializeStarRating();
});

function showKeyboardHints() {
    setTimeout(() => {
        showToast('💡 Pro tip: Press Ctrl+K to search, Ctrl+B for basket, Ctrl+T to toggle theme!', 'success', 4000);
    }, 2000);
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