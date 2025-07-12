// Global variables
let currentUser = null;
let allItems = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadSustainabilityStats();
    loadItems();
    setupEventListeners();
    animateCounters();
});

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href').substring(1);
            scrollToSection(target);
        });
    });

    // Forms
    document.getElementById('loginForm').addEventListener('submit', handleUserRegistration);
    document.getElementById('shareForm').addEventListener('submit', handleItemShare);

    // Filters
    document.getElementById('categoryFilter').addEventListener('change', filterItems);
    document.getElementById('searchInput').addEventListener('input', debounce(filterItems, 300));
    document.getElementById('locationFilter').addEventListener('input', debounce(filterItems, 300));

    // Mobile menu
    document.querySelector('.hamburger').addEventListener('click', toggleMobileMenu);
}

// API Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`/api${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Connection error. Please try again.', 'error');
        return null;
    }
}

// Load sustainability stats
async function loadSustainabilityStats() {
    const stats = await apiCall('/sustainability-stats');
    if (stats) {
        document.getElementById('totalItems').textContent = stats.totalItems;
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('co2Saved').textContent = stats.co2Saved;
    }
}

// Load items
async function loadItems() {
    const items = await apiCall('/items');
    if (items) {
        allItems = items;
        displayItems(items);
    }
}

// Display items
function displayItems(items) {
    const grid = document.getElementById('itemsGrid');
    
    if (items.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                <h3>No items found</h3>
                <p>Try adjusting your filters or be the first to share an item!</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = items.map(item => `
        <div class="item-card" onclick="showItemDetails('${item._id}')">
            <div class="item-image">
                <i class="fas fa-${getItemIcon(item.category)}"></i>
            </div>
            <div class="item-info">
                <div class="item-title">${item.title}</div>
                <div class="item-details">
                    <span class="item-category">${item.category}</span>
                    <span class="item-size">Size ${item.size}</span>
                </div>
                <div class="item-description">${item.description.substring(0, 100)}...</div>
                <div class="item-footer">
                    <span class="item-location">
                        <i class="fas fa-map-marker-alt"></i> ${item.location}
                    </span>
                    <span class="item-condition condition-${item.condition}">${item.condition}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Get item icon based on category
function getItemIcon(category) {
    const icons = {
        'tops': 'tshirt',
        'bottoms': 'user-tie',
        'dresses': 'female',
        'outerwear': 'coat',
        'shoes': 'shoe-prints',
        'accessories': 'gem'
    };
    return icons[category] || 'tshirt';
}

// Filter items
function filterItems() {
    const category = document.getElementById('categoryFilter').value;
    const search = document.getElementById('searchInput').value.toLowerCase();
    const location = document.getElementById('locationFilter').value.toLowerCase();
    
    let filtered = allItems.filter(item => {
        const matchesCategory = !category || item.category === category;
        const matchesSearch = !search || item.title.toLowerCase().includes(search) || 
                             item.description.toLowerCase().includes(search);
        const matchesLocation = !location || item.location.toLowerCase().includes(location);
        
        return matchesCategory && matchesSearch && matchesLocation;
    });
    
    displayItems(filtered);
}

// Show item details
function showItemDetails(itemId) {
    const item = allItems.find(i => i._id === itemId);
    if (!item) return;
    
    const modal = document.getElementById('itemModal');
    const details = document.getElementById('itemDetails');
    
    details.innerHTML = `
        <div class="item-detail-header">
            <div class="item-detail-image">
                <i class="fas fa-${getItemIcon(item.category)}"></i>
            </div>
            <div class="item-detail-info">
                <h2>${item.title}</h2>
                <div class="item-meta">
                    <span class="category">${item.category}</span>
                    <span class="size">Size ${item.size}</span>
                    <span class="condition condition-${item.condition}">${item.condition}</span>
                </div>
                <div class="location">
                    <i class="fas fa-map-marker-alt"></i> ${item.location}
                </div>
            </div>
        </div>
        <div class="item-description">
            <h3>Description</h3>
            <p>${item.description}</p>
        </div>
        <div class="item-owner">
            <h3>Shared by</h3>
            <p>${item.owner ? item.owner.name : 'Community Member'}</p>
        </div>
        <div class="item-actions">
            <button class="btn-primary" onclick="requestItem('${item._id}')">
                <i class="fas fa-handshake"></i> Request Exchange
            </button>
            <button class="btn-secondary" onclick="shareItem('${item._id}')">
                <i class="fas fa-share"></i> Share
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Request item exchange
async function requestItem(itemId) {
    if (!currentUser) {
        showNotification('Please join the community first!', 'warning');
        openModal('loginModal');
        return;
    }
    
    const message = prompt('Add a message for the owner (optional):');
    
    const exchange = await apiCall('/exchanges', 'POST', {
        requester: currentUser._id,
        item: itemId,
        message: message || ''
    });
    
    if (exchange) {
        showNotification('Exchange request sent successfully!', 'success');
        closeModal('itemModal');
    }
}

// Handle user registration
async function handleUserRegistration(e) {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        location: document.getElementById('userLocation').value
    };
    
    const user = await apiCall('/users', 'POST', userData);
    
    if (user) {
        currentUser = user;
        showNotification(`Welcome to ReWear, ${user.name}!`, 'success');
        closeModal('loginModal');
        document.getElementById('loginForm').reset();
    }
}

// Handle item sharing
async function handleItemShare(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please join the community first!', 'warning');
        openModal('loginModal');
        return;
    }
    
    const itemData = {
        title: document.getElementById('itemTitle').value,
        category: document.getElementById('itemCategory').value,
        size: document.getElementById('itemSize').value,
        description: document.getElementById('itemDescription').value,
        condition: document.getElementById('itemCondition').value,
        location: document.getElementById('itemLocation').value,
        owner: currentUser._id,
        sustainabilityImpact: calculateSustainabilityImpact()
    };
    
    const item = await apiCall('/items', 'POST', itemData);
    
    if (item) {
        showNotification('Item shared successfully! Thank you for contributing to sustainability!', 'success');
        document.getElementById('shareForm').reset();
        loadItems();
        loadSustainabilityStats();
        
        // Add celebration animation
        celebrateShare();
    }
}

// Calculate sustainability impact
function calculateSustainabilityImpact() {
    // Simple calculation based on item category and condition
    const baseImpact = 10;
    const conditionMultiplier = {
        'new': 1.5,
        'excellent': 1.3,
        'good': 1.1,
        'fair': 1.0
    };
    
    const condition = document.getElementById('itemCondition').value;
    return Math.round(baseImpact * (conditionMultiplier[condition] || 1));
}

// Utility functions
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 20);
    });
}

function celebrateShare() {
    // Create confetti effect
    const colors = ['#4CAF50', '#45a049', '#a8e6a3', '#2d5a27'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createConfetti(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 10);
    }
}

function createConfetti(color) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${color};
        left: ${Math.random() * 100}vw;
        top: -10px;
        z-index: 9999;
        pointer-events: none;
        border-radius: 50%;
    `;
    
    document.body.appendChild(confetti);
    
    const animation = confetti.animate([
        { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
        { transform: `translateY(100vh) rotate(360deg)`, opacity: 0 }
    ], {
        duration: 3000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    animation.onfinish = () => confetti.remove();
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    }
    
    .notification-success { border-left: 4px solid #4CAF50; }
    .notification-error { border-left: 4px solid #f44336; }
    .notification-warning { border-left: 4px solid #ff9800; }
    .notification-info { border-left: 4px solid #2196F3; }
    
    .notification i {
        font-size: 1.2rem;
    }
    
    .notification-success i { color: #4CAF50; }
    .notification-error i { color: #f44336; }
    .notification-warning i { color: #ff9800; }
    .notification-info i { color: #2196F3; }
    
    .notification button {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
        margin-left: auto;
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .item-detail-header {
        display: flex;
        gap: 2rem;
        margin-bottom: 2rem;
    }
    
    .item-detail-image {
        width: 120px;
        height: 120px;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 3rem;
    }
    
    .item-detail-info h2 {
        margin-bottom: 1rem;
        color: #2d5a27;
    }
    
    .item-meta {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .item-meta span {
        background: #f0f0f0;
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.9rem;
    }
    
    .condition-new { background: #e8f5e8 !important; color: #2d5a27; }
    .condition-excellent { background: #e3f2fd !important; color: #1976d2; }
    .condition-good { background: #fff3e0 !important; color: #f57c00; }
    .condition-fair { background: #fce4ec !important; color: #c2185b; }
    
    .item-actions {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);