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
    { name: 'Netherite Sword (Enchanted)', price: 23, description: 'Powerful enchanted sword with assorted enchants', stock: 5 },
    { name: 'Netherite Pickaxe', price: 30, description: 'Durable enchanted pickaxe for mining', stock: 3 },
    { name: 'Netherite Axe', price: 30, description: 'Sharp enchanted axe for chopping', stock: 4 },
    { name: 'Netherite Armor (Full Set)', price: 70, description: 'Complete enchanted netherite armor set - 20% off deal!', stock: 2 },
    { name: 'Netherite Armor (Individual Part)', price: 20, description: 'Individual enchanted netherite armor piece (Helmet, Chestplate, Leggings, or Boots)', stock: 10 },
    { name: 'Diamond Armor (Full Set, Enchanted)', price: 0, description: 'Full enchanted diamond armor set available', stock: 1 },
    { name: 'Food x64', price: 5, description: '64 Baked Potatoes - Perfect for long adventures', stock: 20 },
    { name: 'Elytra', price: 30, description: 'Wings for flying through the skies', stock: 3 },
    { name: 'Fireworks x64', price: 15, description: '64 Fireworks for epic celebrations', stock: Infinity },
    { name: 'Dragon Head 1x', price: 38, description: 'Rare dragon head trophy', stock: 3 }
];

// Save items to localStorage
function saveItems() {
    localStorage.setItem('shopItems', JSON.stringify(items));
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
        itemDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="price">${item.price > 0 ? item.price + ' Diamonds' : 'Contact for Price'}</p>
            <p class="stock ${stockClass} badge">${stockText}</p>
            <button class="btn-primary" onclick="submitTicket('${item.name}')" ${item.stock <= 0 ? 'disabled' : ''}>Inquire</button>
        `;
        shop.appendChild(itemDiv);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    displayShop();
});