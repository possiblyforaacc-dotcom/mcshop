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
    { name: 'Netherite Sword (Enchanted)', price: 30, description: 'Powerful enchanted sword' },
    { name: 'Netherite Pickaxe', price: 40, description: 'Durable pickaxe for mining' },
    { name: 'Netherite Axe', price: 40, description: 'Sharp axe for chopping' },
    { name: 'Netherite Armor (Full Set)', price: 80, description: 'Complete set, 20% off deal!' },
    { name: 'Netherite Armor (Individual Part)', price: 20, description: 'Helmet, Chestplate, Leggings, or Boots' },
    { name: 'Diamond Armor (Full Set, Enchanted)', price: 0, description: 'Full enchanted diamond set available' }
];

// Display shop items
function displayShop() {
    const shop = document.getElementById('shop');
    items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="price">${item.price > 0 ? item.price + ' Diamonds' : 'Contact for Price'}</p>
            <button onclick="submitTicket('${item.name}')">Inquire</button>
        `;
        shop.appendChild(itemDiv);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    displayShop();
});