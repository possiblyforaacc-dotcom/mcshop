// Ticket system
let tickets = JSON.parse(localStorage.getItem('tickets')) || [];

document.getElementById('ticketForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const discord = document.getElementById('discord').value;
    const item = document.getElementById('item').value;
    const message = document.getElementById('message').value;
    const ticket = {
        id: Date.now(),
        name,
        discord,
        item,
        message,
        status: 'Open',
        response: ''
    };
    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));
    alert('Ticket submitted successfully! We will contact you via Discord.');
    this.reset();
});

function submitTicket(itemName) {
    document.getElementById('item').value = itemName;
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
        row.innerHTML = `
            <td>${ticket.name}<br><small class="text-secondary">${ticket.discord}</small></td>
            <td>${ticket.item}</td>
            <td>${ticket.message}</td>
            <td><span class="status-badge ${statusClass}">${ticket.status}</span></td>
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