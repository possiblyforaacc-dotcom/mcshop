// Ticket system
let tickets = JSON.parse(localStorage.getItem('tickets')) || [];

document.getElementById('ticketForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const discord = document.getElementById('discord').value;
    const item = document.getElementById('item').value;
    const quantity = document.getElementById('quantity').value;
    const message = document.getElementById('message').value;

    // Validate Discord username format
    if (!discord.trim()) {
        alert('Please enter your Discord username');
        return;
    }

    // Check if this is a basket order
    const isBasketOrder = item === 'Basket Order' && basket && basket.length > 0;

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
        basket: isBasketOrder ? [...basket] : null // Include basket data if it's a basket order
    };
    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));

    // Send Discord webhook notification
    sendDiscordNotification(ticket);

    // Clear basket if it was a basket order
    if (isBasketOrder) {
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
    const webhookURL = 'https://discord.com/api/webhooks/1439768220348317767/Wkm_TQXlCX_uHmaRst1us4n5vyOqrirVriYONeTYsY98VYTbcQ3xy0ly4l-OuJxXmwJK'; // Replace with your Discord webhook URL

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
            const shopItem = items.find(i => i.name === item.name);
            if (shopItem && !shopItem.tradeIn) {
                const itemTotal = shopItem.price * item.quantity;
                totalDiamonds += itemTotal;
                basketSummary += `${item.name} × ${item.quantity} = ${itemTotal} diamonds\n`;
            } else if (shopItem && shopItem.tradeIn) {
                basketSummary += `${item.name} × ${item.quantity} (Trade-in)\n`;
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
            content: `<@1160306193567338579> New order received!` // Mention the user
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

let currentTradeInItem = '';

function submitTradeIn(itemName) {
    currentTradeInItem = itemName;
    document.getElementById('tradeInTitle').textContent = itemName;
    document.getElementById('tradeInModal').style.display = 'flex';
    document.getElementById('tradeInDiamonds').value = '';
    document.getElementById('calculatorResult').innerHTML = '<p>Enter the number of diamonds above to see what you\'ll receive!</p>';
    document.getElementById('proceedTradeInBtn').disabled = true;
}

function closeTradeInModal() {
    document.getElementById('tradeInModal').style.display = 'none';
    currentTradeInItem = '';
}

function calculateTradeIn() {
    const diamonds = parseInt(document.getElementById('tradeInDiamonds').value) || 0;
    const resultDiv = document.getElementById('calculatorResult');
    const proceedBtn = document.getElementById('proceedTradeInBtn');

    if (diamonds <= 0) {
        resultDiv.innerHTML = '<p>Enter the number of diamonds above to see what you\'ll receive!</p>';
        proceedBtn.disabled = true;
        return;
    }

    let result = '';
    let canProceed = false;

    if (currentTradeInItem.includes('Ancient Debris')) {
        const ancientDebris = Math.floor(diamonds / 10) * 3;
        const remainder = diamonds % 10;
        result = `<p>You'll receive: <span class="result-highlight">${ancientDebris} Ancient Debris</span></p>`;
        if (remainder > 0) {
            result += `<p><small>You need ${10 - remainder} more diamonds for additional Ancient Debris</small></p>`;
        }
        canProceed = ancientDebris > 0;
    } else if (currentTradeInItem.includes('Netherite Ingots')) {
        const netheriteIngots = Math.floor(diamonds / 15) * 3;
        const remainder = diamonds % 15;
        result = `<p>You'll receive: <span class="result-highlight">${netheriteIngots} Netherite Ingots</span></p>`;
        if (remainder > 0) {
            result += `<p><small>You need ${15 - remainder} more diamonds for additional Netherite Ingots</small></p>`;
        }
        canProceed = netheriteIngots > 0;
    }

    resultDiv.innerHTML = result;
    proceedBtn.disabled = !canProceed;
}

function proceedWithTradeIn() {
    const diamonds = parseInt(document.getElementById('tradeInDiamonds').value);
    closeTradeInModal();

    // Fill the form with trade-in details
    document.getElementById('item').value = currentTradeInItem;
    document.getElementById('quantity').value = '1'; // Not used for trade-ins
    const messageField = document.getElementById('message');
    messageField.value = `TRADE-IN REQUEST: ${diamonds} diamonds\n\n` + messageField.value;

    // Scroll to form
    document.getElementById('ticketForm').scrollIntoView({ behavior: 'smooth' });
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
        const statusClass = ticket.status === 'Closed' ? 'status-closed' : ticket.status === 'Responded' ? 'status-responded' : 'status-open';
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
                const shopItem = items.find(i => i.name === item.name);
                if (shopItem && !shopItem.tradeIn) {
                    basketDetails += `${item.name} × ${item.quantity} = ${shopItem.price * item.quantity} diamonds<br>`;
                } else if (shopItem && shopItem.tradeIn) {
                    basketDetails += `${item.name} × ${item.quantity} (Trade-in)<br>`;
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
                        <button class="btn-danger" onclick="closeTicket(${ticket.id})">Close</button>
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

function closeTicket(id) {
    const ticket = tickets.find(t => t.id === id);
    ticket.status = 'Closed';

    // Reduce stock for basket orders
    if (ticket.basket && ticket.basket.length > 0) {
        ticket.basket.forEach(basketItem => {
            const shopItem = items.find(i => i.name === basketItem.name);
            if (shopItem && !shopItem.tradeIn && shopItem.stock > 0) {
                shopItem.stock = Math.max(0, shopItem.stock - basketItem.quantity);
            }
        });
        saveItems();
        displayRestock();
        displayShop();
    }
    // Reduce stock for single item orders (non-basket)
    else if (ticket.item !== 'Basket Order' && ticket.item !== 'Trade-in Request') {
        const shopItem = items.find(i => i.name === ticket.item);
        if (shopItem && !shopItem.tradeIn && shopItem.stock > 0) {
            shopItem.stock = Math.max(0, shopItem.stock - ticket.quantity);
            saveItems();
            displayRestock();
            displayShop();
        }
    }

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