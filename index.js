// Generate moving stars
function createStars() {
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 2 + 's';
        starsContainer.appendChild(star);
    }
}

// Shop items data
const items = [
    { name: 'Netherite Sword (Enchanted)', price: 30, description: 'Powerful enchanted sword', stock: 5 },
    { name: 'Netherite Pickaxe', price: 40, description: 'Durable pickaxe for mining', stock: 3 },
    { name: 'Netherite Axe', price: 40, description: 'Sharp axe for chopping', stock: 4 },
    { name: 'Netherite Armor (Full Set)', price: 80, description: 'Complete set, 20% off deal!', stock: 2 },
    { name: 'Netherite Armor (Individual Part)', price: 20, description: 'Helmet, Chestplate, Leggings, or Boots', stock: 10 },
    { name: 'Diamond Armor (Full Set, Enchanted)', price: 0, description: 'Full enchanted diamond set available', stock: 1 }
];

// Display shop items
function displayShop() {
    const shop = document.getElementById('shop');
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        const stockText = item.stock > 0 ? `Stock: ${item.stock}` : 'Out of Stock';
        const stockClass = item.stock > 0 ? 'in-stock' : 'out-stock';
        itemDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="price">${item.price > 0 ? item.price + ' Diamonds' : 'Contact for Price'}</p>
            <p class="stock ${stockClass}">${stockText}</p>
            <button onclick="submitTicket('${item.name}')" ${item.stock <= 0 ? 'disabled' : ''}>Inquire</button>
        `;
        shop.appendChild(itemDiv);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    displayShop();
});