// Initialize EmailJS
(function() {
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your EmailJS public key
})();

// Ticket system
let tickets = JSON.parse(localStorage.getItem('tickets')) || [];

document.getElementById('ticketForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const item = document.getElementById('item').value;
    const message = document.getElementById('message').value;
    const ticket = {
        id: Date.now(),
        name,
        email,
        item,
        message,
        status: 'Open',
        response: ''
    };
    tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(tickets));

    // Send email to admin
    const adminEmailParams = {
        from_name: name,
        from_email: email,
        item: item,
        message: message,
        ticket_id: ticket.id
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_ADMIN_TEMPLATE_ID', adminEmailParams)
        .then(function(response) {
            console.log('Admin notification sent:', response);
        }, function(error) {
            console.log('Failed to send admin notification:', error);
        });

    alert('Ticket submitted successfully! We will respond via email.');
    this.reset();
});

function submitTicket(itemName) {
    document.getElementById('item').value = itemName;
    document.getElementById('ticketForm').scrollIntoView();
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
        ticketsDiv.innerHTML += '<p>No tickets yet.</p>';
        return;
    }
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.innerHTML = `
        <thead>
            <tr style="background: rgba(76, 175, 80, 0.2);">
                <th style="padding: 10px; border: 1px solid #4CAF50; color: #FFD700;">Customer</th>
                <th style="padding: 10px; border: 1px solid #4CAF50; color: #FFD700;">Item</th>
                <th style="padding: 10px; border: 1px solid #4CAF50; color: #FFD700;">Message</th>
                <th style="padding: 10px; border: 1px solid #4CAF50; color: #FFD700;">Status</th>
                <th style="padding: 10px; border: 1px solid #4CAF50; color: #FFD700;">Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        row.style.background = ticket.status === 'Closed' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)';
        row.innerHTML = `
            <td style="padding: 10px; border: 1px solid #4CAF50; color: #E0E0E0;">${ticket.name}<br><small>${ticket.email}</small></td>
            <td style="padding: 10px; border: 1px solid #4CAF50; color: #E0E0E0;">${ticket.item}</td>
            <td style="padding: 10px; border: 1px solid #4CAF50; color: #E0E0E0;">${ticket.message}</td>
            <td style="padding: 10px; border: 1px solid #4CAF50; color: ${ticket.status === 'Closed' ? '#F44336' : ticket.status === 'Responded' ? '#4CAF50' : '#FFC107'};">${ticket.status}</td>
            <td style="padding: 10px; border: 1px solid #4CAF50;">
                <textarea id="response-${ticket.id}" placeholder="Your response..." style="width: 100%; min-height: 60px; background: rgba(255, 255, 255, 0.1); border: 1px solid #4CAF50; border-radius: 5px; color: #fff; padding: 5px;">${ticket.response}</textarea>
                <button onclick="respondToTicket(${ticket.id})" style="margin-top: 5px;">Respond</button>
                <button onclick="closeTicket(${ticket.id})" style="margin-top: 5px; background: #F44336;">Close</button>
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

    // Send email to customer
    const customerEmailParams = {
        to_name: ticket.name,
        to_email: ticket.email,
        item: ticket.item,
        original_message: ticket.message,
        response: response,
        ticket_id: ticket.id
    };

    emailjs.send('YOUR_SERVICE_ID', 'YOUR_CUSTOMER_TEMPLATE_ID', customerEmailParams)
        .then(function(response) {
            console.log('Customer response sent:', response);
            alert('Response sent successfully!');
        }, function(error) {
            console.log('Failed to send customer response:', error);
            alert('Response saved but email failed to send. Check console for details.');
        });

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
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.innerHTML = `
        <thead>
            <tr style="background: rgba(76, 175, 80, 0.2);">
                <th style="padding: 10px; border: 1px solid #4CAF50; color: #FFD700;">Item</th>
                <th style="padding: 10px; border: 1px solid #4CAF50; color: #FFD700;">Current Stock</th>
                <th style="padding: 10px; border: 1px solid #4CAF50; color: #FFD700;">Price</th>
                <th style="padding: 10px; border: 1px solid #4CAF50; color: #FFD700;">Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.style.background = 'rgba(255, 255, 255, 0.1)';
        row.innerHTML = `
            <td style="padding: 10px; border: 1px solid #4CAF50; color: #E0E0E0;">${item.name}</td>
            <td style="padding: 10px; border: 1px solid #4CAF50; color: #E0E0E0;">
                <input type="number" id="stock-${index}" value="${item.stock}" min="0" style="width: 60px; background: rgba(255, 255, 255, 0.1); border: 1px solid #4CAF50; border-radius: 5px; color: #fff; padding: 5px;">
            </td>
            <td style="padding: 10px; border: 1px solid #4CAF50; color: #E0E0E0;">
                <input type="number" id="price-${index}" value="${item.price}" min="0" style="width: 80px; background: rgba(255, 255, 255, 0.1); border: 1px solid #4CAF50; border-radius: 5px; color: #fff; padding: 5px;">
            </td>
            <td style="padding: 10px; border: 1px solid #4CAF50;">
                <button onclick="updateStock(${index})" style="margin-right: 5px;">Update Stock</button>
                <button onclick="updatePrice(${index})">Update Price</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    restockDiv.appendChild(table);
}

function updatePrice(index) {
    const newPrice = document.getElementById(`price-${index}`).value;
    items[index].price = parseInt(newPrice);
    displayRestock();
    // In a real app, save to server, but here just in memory
}

function updateStock(index) {
    const newStock = document.getElementById(`stock-${index}`).value;
    items[index].stock = parseInt(newStock);
    displayRestock();
    // Update shop display
    displayShop();
}

function toggleAvailability(index) {
    items[index].available = items[index].available !== false ? false : true;
    displayRestock();
}