// Ticket system
let tickets = JSON.parse(localStorage.getItem('tickets')) || [];

document.getElementById('ticketForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const discord = document.getElementById('discord').value.trim();
    const item = document.getElementById('item').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const message = document.getElementById('message').value.trim();

    // Enhanced validation
    if (!name) {
        showToast('Please enter your name', 'error');
        document.getElementById('name').focus();
        return;
    }

    if (!discord) {
        showToast('Please enter your Discord username', 'error');
        document.getElementById('discord').focus();
        return;
    }

    // Basic Discord username validation
    if (!discord.includes('#') && !discord.includes('@')) {
        showToast('Please enter a valid Discord username (e.g., username#1234 or @username)', 'error');
        document.getElementById('discord').focus();
        return;
    }

    if (!item || item === '') {
        showToast('Please select an item', 'error');
        document.getElementById('item').focus();
        return;
    }

    if (isNaN(quantity) || quantity < 1) {
        showToast('Please enter a valid quantity', 'error');
        document.getElementById('quantity').focus();
        return;
    }

    // Check stock availability for basket orders
    const isBasketOrder = item === 'Basket Order' && basket && basket.length > 0;
    if (isBasketOrder) {
        for (const basketItem of basket) {
            const shopItem = items.find(i => i.name === basketItem.name);
            if (shopItem && !shopItem.tradeIn && shopItem.stock < basketItem.quantity) {
                showToast(`Insufficient stock for ${basketItem.name}. Available: ${shopItem.stock}`, 'error');
                return;
            }
        }
    }

    // Check if this is a basket order
    const basketOrderCheck = item === 'Basket Order' && basket && basket.length > 0;
    const basketData = basketOrderCheck ? [...basket] : null;

    const ticket = {
        id: Date.now(),
        name,
        discord,
        item,
        quantity: parseInt(quantity),
        message,
        status: 'Open',
        response: '',
        timestamp: new Date().toISOString(),
        basket: basketData // Include basket data if it's a basket order
    };

    console.log('Creating ticket:', ticket); // Debug log
    console.log('Basket data:', basketData); // Debug log
    console.log('Message:', message); // Debug log

    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));

    // Send Discord webhook notification
    sendDiscordNotification(ticket);

    // Clear basket if it was a basket order
    if (basketOrderCheck) {
        clearBasket();
    }

    alert('Order submitted successfully! We will contact you via Discord.');
    this.reset();
    document.getElementById('quantity').value = '1'; // Reset quantity

    // Reset form state for basket orders
    const messageField = document.getElementById('message');
    messageField.readOnly = false;
    messageField.style.backgroundColor = '';
    messageField.style.cursor = '';

    // Remove basket notice if it exists
    const basketNotice = document.getElementById('basket-notice');
    if (basketNotice) {
        basketNotice.remove();
    }
});

// Discord webhook integration
function sendDiscordNotification(ticket) {
    const webhookURL = 'https://discord.com/api/webhooks/1440062296628920371/mANkQKBChzaC8Ye1Uh4qAbORUixOw2h3upcSzRUFPo7-cokSuXxP8T8zkvX7y3UuuIZs'; // Replace with your Discord webhook URL

    if (webhookURL === 'YOUR_DISCORD_WEBHOOK_URL') {
        console.log('Discord webhook not configured. Please set YOUR_DISCORD_WEBHOOK_URL in app.js');
        return;
    }

    const isTradeIn = ticket.item.includes('Trade-in') || ticket.message.includes('TRADE-IN REQUEST');
    const isBasketOrder = ticket.basket && ticket.basket.length > 0;

    let embedTitle = '🛒 New Order Received!';
    let embedColor = 0x8B5CF6; // Purple for regular orders

    if (isTradeIn) {
        embedTitle = '🔄 New Trade-in Request!';
        embedColor = 0xFFD700; // Gold for trade-ins
    } else if (isBasketOrder) {
        embedTitle = '🛒 New Basket Order Received!';
        embedColor = 0x10B981; // Green for basket orders
    }

    const fields = [
        {
            name: '👤 Customer',
            value: ticket.name,
            inline: true
        },
        {
            name: '💬 Discord',
            value: ticket.discord,
            inline: true
        }
    ];

    if (isBasketOrder) {
        // For basket orders, show basket contents
        let basketSummary = '';
        let totalDiamonds = 0;

        ticket.basket.forEach(item => {
            if (item.tradeInType) {
                // New trade-in format
                basketSummary += `${item.name}: ${item.quantity} ${item.tradeInType} = ${item.diamondsNeeded} diamonds\n`;
            } else {
                // Regular items or legacy trade-ins
                const shopItem = items.find(i => i.name === item.name);
                if (shopItem && !shopItem.tradeIn) {
                    const itemTotal = shopItem.price * item.quantity;
                    totalDiamonds += itemTotal;
                    basketSummary += `${item.name} × ${item.quantity} = ${itemTotal} diamonds\n`;
                } else if (shopItem && shopItem.tradeIn) {
                    basketSummary += `${item.name} × ${item.quantity} (Trade-in)\n`;
                }
            }
        });

        fields.push(
            {
                name: '🛒 Basket Contents',
                value: basketSummary || 'No items',
                inline: false
            },
            {
                name: '💎 Total Diamonds',
                value: totalDiamonds.toString(),
                inline: true
            }
        );
    } else {
        // For single item orders
        fields.push(
            {
                name: '📦 Item',
                value: ticket.item,
                inline: false
            },
            {
                name: '🔢 Quantity',
                value: ticket.quantity.toString(),
                inline: true
            },
            {
                name: isTradeIn ? '🔄 Trade Calculation' : '💎 Total Diamonds',
                value: calculateTotalDiamonds(ticket),
                inline: true
            }
        );
    }

    fields.push({
        name: '📝 Message',
        value: ticket.message || 'No additional message',
        inline: false
    });

    const embed = {
        title: embedTitle,
        color: embedColor,
        fields: fields,
        timestamp: ticket.timestamp,
        footer: {
            text: `Order ID: ${ticket.id}`
        }
    };

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            embeds: [embed],
            content: `<@1160306193567338579> <@1167488721680076812> New order received!` // Mention the user
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to send Discord notification');
        }
        console.log('Discord notification sent successfully');
    })
    .catch(error => {
        console.error('Error sending Discord notification:', error);
    });
}

function calculateTotalDiamonds(ticket) {
    // Check if this is a trade-in request
    if (ticket.item.includes('Trade-in') || ticket.message.includes('TRADE-IN REQUEST')) {
        // Extract number of diamonds from message
        const diamondMatch = ticket.message.match(/(\d+)\s*diamonds?/i);
        if (diamondMatch) {
            const diamonds = parseInt(diamondMatch[1]);

            // Check which trade-in item this is
            if (ticket.item.includes('Ancient Debris')) {
                // 10 diamonds = 3 Ancient Debris
                const ancientDebris = Math.floor(diamonds / 10) * 3;
                return `${diamonds} diamonds → ${ancientDebris} Ancient Debris`;
            } else if (ticket.item.includes('Netherite Ingots')) {
                // 15 diamonds = 3 Netherite Ingots
                const netheriteIngots = Math.floor(diamonds / 15) * 3;
                return `${diamonds} diamonds → ${netheriteIngots} Netherite Ingots`;
            }
        }
        return 'Trade-in: Specify diamond amount';
    }

    // Extract price from item string (e.g., "Netherite Sword (30 diamonds)" -> 30)
    const priceMatch = ticket.item.match(/\((\d+) diamonds?\)/i);
    if (priceMatch) {
        const unitPrice = parseInt(priceMatch[1]);
        return (unitPrice * ticket.quantity).toString();
    }
    return 'Contact for pricing';
}

function submitTicket(itemName) {
    document.getElementById('item').value = itemName;
    document.getElementById('ticketForm').scrollIntoView({ behavior: 'smooth' });
}

let selectedTradeInItem = '';

function submitTradeIn(itemName) {
    document.getElementById('tradeInModal').style.display = 'flex';
    resetTradeInSelection();

    // Pre-select the appropriate trade-in option based on the item clicked
    if (itemName === 'Ancient Debris (Trade-in)') {
        selectTradeInItem('Ancient Debris');
    } else if (itemName === 'Netherite Ingots (Trade-in)') {
        selectTradeInItem('Netherite Ingots');
    } else if (itemName === 'Netherite Ingots to Diamonds') {
        selectTradeInItem('Netherite Ingots');
    } else if (itemName === 'Ancient Debris to Diamonds') {
        selectTradeInItem('Ancient Debris');
    }
}

function closeTradeInModal() {
    document.getElementById('tradeInModal').style.display = 'none';
    resetTradeInSelection();
}

function resetTradeInSelection() {
    selectedTradeInItem = '';
    document.querySelectorAll('.trade-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.getElementById('quantitySection').style.display = 'none';
    document.getElementById('tradeInQuantity').value = '';
    document.getElementById('costDisplay').innerHTML = '<p>Select a quantity above to see the diamond cost!</p>';
    document.getElementById('addToBasketBtn').disabled = true;
}

function selectTradeInItem(itemName) {
    selectedTradeInItem = itemName;

    // Update UI
    document.querySelectorAll('.trade-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Find and select the clicked option
    const options = document.querySelectorAll('.trade-option');
    options.forEach(option => {
        if (option.querySelector('h3').textContent === itemName) {
            option.classList.add('selected');
        }
    });

    // Show quantity section
    document.getElementById('quantitySection').style.display = 'block';
    document.getElementById('tradeInQuantity').focus();
}

function calculateTradeInCost() {
    const quantity = parseInt(document.getElementById('tradeInQuantity').value) || 0;
    const costDisplay = document.getElementById('costDisplay');
    const addBtn = document.getElementById('addToBasketBtn');

    if (quantity <= 0) {
        costDisplay.innerHTML = '<p>Select a quantity above to see the diamond cost!</p>';
        addBtn.disabled = true;
        return;
    }

    let diamondsNeeded = 0;
    let itemName = '';

    if (selectedTradeInItem === 'Ancient Debris') {
        // 10 diamonds = 3 Ancient Debris, so for X Ancient Debris: (X / 3) * 10 diamonds
        diamondsNeeded = Math.ceil((quantity / 3) * 10);
        itemName = 'Ancient Debris';
    } else if (selectedTradeInItem === 'Netherite Ingots') {
        // 15 diamonds = 3 Netherite Ingots, so for X Netherite Ingots: (X / 3) * 15 diamonds
        diamondsNeeded = Math.ceil((quantity / 3) * 15);
        itemName = 'Netherite Ingots';
    }

    costDisplay.innerHTML = `
        <p>You want: <span class="cost-highlight">${quantity} ${itemName}</span></p>
        <p>Diamonds needed: <span class="cost-highlight">${diamondsNeeded} diamonds</span></p>
        <p><small>This ensures you get at least the quantity you requested</small></p>
    `;

    addBtn.disabled = false;
}

function addTradeInToBasket() {
    const quantity = parseInt(document.getElementById('tradeInQuantity').value);
    if (!selectedTradeInItem || quantity <= 0) return;

    // Calculate diamonds needed
    let diamondsNeeded = 0;
    let itemName = '';

    if (selectedTradeInItem === 'Ancient Debris') {
        diamondsNeeded = Math.ceil((quantity / 3) * 10);
        itemName = 'Ancient Debris (Trade-in)';
    } else if (selectedTradeInItem === 'Netherite Ingots') {
        diamondsNeeded = Math.ceil((quantity / 3) * 15);
        itemName = 'Netherite Ingots (Trade-in)';
    }

    // Add to basket with special trade-in data
    const basketItem = {
        name: itemName,
        quantity: quantity,
        diamondsNeeded: diamondsNeeded,
        tradeInType: selectedTradeInItem
    };

    // Check if this trade-in type is already in basket
    const existingIndex = basket.findIndex(item => item.name === itemName);
    if (existingIndex >= 0) {
        basket[existingIndex] = basketItem;
    } else {
        basket.push(basketItem);
    }

    saveBasket();
    displayBasket();
    closeTradeInModal();

    showToast(`Added ${quantity} ${selectedTradeInItem} trade-in to basket!`, 'success');
}

// Admin functions
function openAdmin() {
    document.getElementById('adminModal').style.display = 'flex';
}

function closeAdmin() {
    document.getElementById('adminModal').style.display = 'none';
    document.getElementById('adminContent').style.display = 'none';
    document.getElementById('adminPass').value = '';
}

function checkPassword() {
    const pass = document.getElementById('adminPass').value;
    if (pass === 'Himgyiocc1#') {
        document.getElementById('adminContent').style.display = 'block';
        displayTickets();
        displayRestock();
    } else {
        alert('Incorrect password');
    }
}

function displayTickets() {
    const ticketsDiv = document.getElementById('tickets');
    ticketsDiv.innerHTML = '<h3>Customer Tickets</h3>';

    // Update admin stats
    updateAdminStats();
    if (tickets.length === 0) {
        ticketsDiv.innerHTML += '<p class="text-secondary">No tickets yet.</p>';
        return;
    }
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Customer</th>
                <th>Item</th>
                <th>Message</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        const statusClass = ticket.status === 'Closed' ? 'status-closed' :
                           ticket.status === 'Responded' ? 'status-responded' :
                           ticket.status === 'Completed' ? 'status-completed' : 'status-open';
        const quantity = ticket.quantity || 1;
        const totalDiamonds = calculateTotalDiamonds(ticket);
        const isBasketOrder = ticket.basket && ticket.basket.length > 0;

        let itemDisplay = ticket.item;
        if (isBasketOrder) {
            itemDisplay = 'Basket Order';
        }
        itemDisplay += `<br><small class="text-secondary">Qty: ${quantity}</small>`;

        let basketDetails = '';
        if (isBasketOrder) {
            basketDetails = '<strong>Basket Contents:</strong><br>';
            ticket.basket.forEach(item => {
                if (item.tradeInType) {
                    // New trade-in format
                    basketDetails += `${item.name}: ${item.quantity} ${item.tradeInType} = ${item.diamondsNeeded} diamonds<br>`;
                } else {
                    // Regular items or legacy trade-ins
                    const shopItem = items.find(i => i.name === item.name);
                    if (shopItem && !shopItem.tradeIn) {
                        basketDetails += `${item.name} × ${item.quantity} = ${shopItem.price * item.quantity} diamonds<br>`;
                    } else if (shopItem && shopItem.tradeIn) {
                        basketDetails += `${item.name} × ${item.quantity} (Trade-in)<br>`;
                    }
                }
            });
        }

        row.innerHTML = `
            <td>${ticket.name}<br><small class="text-secondary">${ticket.discord}</small></td>
            <td>${itemDisplay}</td>
            <td>${basketDetails}${ticket.message}</td>
            <td><span class="status-badge ${statusClass}">${ticket.status}</span><br><small class="text-secondary">${totalDiamonds} diamonds</small></td>
            <td>
                <div class="form-group">
                    <textarea id="response-${ticket.id}" placeholder="Your response..." class="w-100" rows="3">${ticket.response}</textarea>
                    <div class="flex space-between mt-1">
                        <button class="btn-primary" onclick="respondToTicket(${ticket.id})">Respond</button>
                        ${ticket.status !== 'Completed' ? `<button class="btn-success" onclick="completeOrder(${ticket.id})" title="Mark as completed and reduce stock">Complete Order</button>` : ''}
                        <button class="btn-danger" onclick="closeTicket(${ticket.id})" title="Close ticket without completing">Close</button>
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    ticketsDiv.appendChild(table);
}

function respondToTicket(id) {
    const response = document.getElementById(`response-${id}`).value;
    const ticket = tickets.find(t => t.id === id);
    ticket.response = response;
    ticket.status = 'Responded';
    localStorage.setItem('tickets', JSON.stringify(tickets));
    alert('Response saved! Contact customer via Discord: ' + ticket.discord);
    displayTickets();
}

function completeOrder(id) {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    // Mark as completed
    ticket.status = 'Completed';
    ticket.completedAt = new Date().toISOString();

    // Add to shopping history
    addToShoppingHistory(ticket);

    // Reduce stock for basket orders (only for regular items, not trade-ins)
    if (ticket.basket && ticket.basket.length > 0) {
        ticket.basket.forEach(basketItem => {
            // Skip trade-in items - they don't reduce stock
            if (basketItem.tradeInType) {
                console.log(`Skipping stock reduction for trade-in: ${basketItem.name}`);
                return;
            }

            const shopItem = items.find(i => i.name === basketItem.name);
            if (shopItem && !shopItem.tradeIn && shopItem.stock > 0) {
                shopItem.stock = Math.max(0, shopItem.stock - basketItem.quantity);
                console.log(`Reduced stock for ${basketItem.name}: ${shopItem.stock + basketItem.quantity} → ${shopItem.stock}`);
            }
        });
    }
    // Reduce stock for single item orders (non-basket)
    else if (ticket.item !== 'Basket Order' && !ticket.item.includes('Trade-in')) {
        const shopItem = items.find(i => i.name === ticket.item);
        if (shopItem && !shopItem.tradeIn && shopItem.stock > 0) {
            shopItem.stock = Math.max(0, shopItem.stock - ticket.quantity);
            console.log(`Reduced stock for ${ticket.item}: ${shopItem.stock + ticket.quantity} → ${shopItem.stock}`);
        }
    }

    saveItems();
    localStorage.setItem('tickets', JSON.stringify(tickets));
    displayRestock();
    displayShop();
    displayTickets();

    // Send completion notification
    sendCompletionNotification(ticket);

    showToast('Order completed successfully!', 'success');
}

function closeTicket(id) {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return;

    ticket.status = 'Closed';
    localStorage.setItem('tickets', JSON.stringify(tickets));
    displayTickets();
}

function displayRestock() {
    const restockDiv = document.getElementById('restock');
    restockDiv.innerHTML = '<h3>Restock Management</h3>';
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Item</th>
                <th>Current Stock</th>
                <th>Price</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>
                <input type="number" id="stock-${index}" value="${item.stock}" min="0" class="form-control" style="width: 80px;">
            </td>
            <td>
                <input type="number" id="price-${index}" value="${item.price}" min="0" class="form-control" style="width: 100px;">
            </td>
            <td>
                <div class="flex space-between">
                    <button class="btn-secondary" onclick="updateStock(${index})">Update Stock</button>
                    <button class="btn-primary" onclick="updatePrice(${index})">Update Price</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    restockDiv.appendChild(table);
}

function updatePrice(index) {
    const newPrice = document.getElementById(`price-${index}`).value;
    items[index].price = parseInt(newPrice);
    saveItems();
    displayRestock();
    displayShop();
}

function updateStock(index) {
    const newStock = document.getElementById(`stock-${index}`).value;
    items[index].stock = parseInt(newStock);
    saveItems();
    displayRestock();
    displayShop();
}

function toggleAvailability(index) {
    items[index].available = items[index].available !== false ? false : true;
    displayRestock();
}

// Send completion notification to Discord
function sendCompletionNotification(ticket) {
    const webhookURL = 'https://discord.com/api/webhooks/1440062296628920371/mANkQKBChzaC8Ye1Uh4qAbORUixOw2h3upcSzRUFPo7-cokSuXxP8T8zkvX7y3UuuIZs';

    if (webhookURL === 'YOUR_DISCORD_WEBHOOK_URL') {
        console.log('Discord webhook not configured');
        return;
    }

    const isBasketOrder = ticket.basket && ticket.basket.length > 0;

    let completionMessage = '';
    if (isBasketOrder) {
        completionMessage = `✅ **Order Completed!**\nCustomer: ${ticket.name}\nBasket order has been fulfilled and stock updated.`;
    } else {
        completionMessage = `✅ **Order Completed!**\nCustomer: ${ticket.name}\nItem: ${ticket.item}\nOrder has been fulfilled and stock updated.`;
    }

    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: `<@1160306193567338579> ${completionMessage}`,
            embeds: [{
                title: '🎉 Order Completed Successfully!',
                color: 0x10B981, // Green
                fields: [
                    {
                        name: '👤 Customer',
                        value: ticket.name,
                        inline: true
                    },
                    {
                        name: '📦 Order Type',
                        value: isBasketOrder ? 'Basket Order' : 'Single Item',
                        inline: true
                    },
                    {
                        name: '⏰ Completed At',
                        value: new Date(ticket.completedAt).toLocaleString(),
                        inline: true
                    }
                ],
                footer: {
                    text: `Order ID: ${ticket.id}`
                }
            }]
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to send completion notification');
        }
        console.log('Completion notification sent successfully');
    })
    .catch(error => {
        console.error('Error sending completion notification:', error);
    });
}