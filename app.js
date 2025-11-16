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
    alert('Ticket submitted successfully!');
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
    ticketsDiv.innerHTML = '';
    tickets.forEach(ticket => {
        const ticketDiv = document.createElement('div');
        ticketDiv.className = 'item';
        ticketDiv.innerHTML = `
            <h4>${ticket.name} - ${ticket.item}</h4>
            <p><strong>Email:</strong> ${ticket.email}</p>
            <p><strong>Message:</strong> ${ticket.message}</p>
            <p><strong>Status:</strong> ${ticket.status}</p>
            <textarea id="response-${ticket.id}" placeholder="Response">${ticket.response}</textarea>
            <button onclick="respondToTicket(${ticket.id})">Respond</button>
            <button onclick="closeTicket(${ticket.id})">Close</button>
        `;
        ticketsDiv.appendChild(ticketDiv);
    });
}

function respondToTicket(id) {
    const response = document.getElementById(`response-${id}`).value;
    const ticket = tickets.find(t => t.id === id);
    ticket.response = response;
    ticket.status = 'Responded';
    localStorage.setItem('tickets', JSON.stringify(tickets));
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
    restockDiv.innerHTML = '';
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <h4>${item.name}</h4>
            <p>Current Price: ${item.price} Diamonds</p>
            <input type="number" id="price-${index}" value="${item.price}" min="0">
            <button onclick="updatePrice(${index})">Update Price</button>
            <button onclick="toggleAvailability(${index})">${item.available !== false ? 'Mark Unavailable' : 'Mark Available'}</button>
        `;
        restockDiv.appendChild(itemDiv);
    });
}

function updatePrice(index) {
    const newPrice = document.getElementById(`price-${index}`).value;
    items[index].price = parseInt(newPrice);
    displayRestock();
    // In a real app, save to server, but here just in memory
}

function toggleAvailability(index) {
    items[index].available = items[index].available !== false ? false : true;
    displayRestock();
}