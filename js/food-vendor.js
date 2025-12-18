// Food Vendor Dashboard Logic
let currentFoodVendor = null;

document.addEventListener('DOMContentLoaded', () => {
    checkFoodVendorAuth();
    setupAuthTabs();
    setupFoodVendorForms();
});

// Check Authentication
// Check Authentication
async function checkFoodVendorAuth() {
    const token = TokenManager.getToken();
    const loggedInVendor = localStorage.getItem('currentVendor');

    if (token && loggedInVendor) {
        currentFoodVendor = JSON.parse(loggedInVendor);
        showDashboard();
    } else {
        document.getElementById('foodVendorAuth').style.display = 'block';
        document.getElementById('foodVendorDashboard').style.display = 'none';
    }
}

// Setup Auth Tabs
function setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('foodVendorLoginForm');
    const registerForm = document.getElementById('foodVendorRegisterForm');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            if (tabName === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            } else {
                registerForm.classList.add('active');
                loginForm.classList.remove('active');
            }
        });
    });
}

// Setup Forms
function setupFoodVendorForms() {
    const loginForm = document.getElementById('foodVendorLoginForm');
    const registerForm = document.getElementById('foodVendorRegisterForm');
    const addFoodForm = document.getElementById('addFoodForm');
    const logoutBtn = document.getElementById('vendorLogout');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (addFoodForm) addFoodForm.addEventListener('submit', handleAddFood);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await AuthAPI.vendorLogin(email, password);
        if (response.success) {
            currentFoodVendor = response.data;
            showNotification('Login successful!', 'success');
            showDashboard();
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Invalid email or password', 'error');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();

    const businessName = document.getElementById('regBusinessName').value;
    const ownerName = document.getElementById('regOwnerName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const address = document.getElementById('regAddress').value;
    const password = document.getElementById('regPassword').value;

    // Validate phone number
    if (!/^[0-9]{10}$/.test(phone)) {
        showNotification('Phone number must be 10 digits', 'error');
        return;
    }

    try {
        const response = await AuthAPI.vendorRegister({
            businessName,
            ownerName,
            email,
            phone,
            address,
            password
        });

        if (response.success) {
            currentFoodVendor = response.data;
            showNotification('Registration successful!', 'success');
            showDashboard();
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(error.message || 'Registration failed', 'error');
    }
}

// Show Dashboard
function showDashboard() {
    document.getElementById('foodVendorAuth').style.display = 'none';
    document.getElementById('foodVendorDashboard').style.display = 'block';
    document.getElementById('vendorAccount').style.display = 'flex';
    document.getElementById('vendorName').textContent = currentFoodVendor.businessName;
    loadFoodProducts();
}

// Handle Add Food
async function handleAddFood(e) {
    e.preventDefault();

    const name = document.getElementById('foodName').value;
    const category = document.getElementById('foodCategory').value;
    const weight = document.getElementById('foodWeight').value;
    const description = document.getElementById('foodDescription').value;
    const price = parseFloat(document.getElementById('foodPrice').value);
    const imageInput = document.getElementById('foodImage');

    try {
        let imageData = null;

        // Handle image upload if provided
        if (imageInput.files && imageInput.files[0]) {
            const file = imageInput.files[0];

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }

            // Convert image to base64
            imageData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        const foodData = {
            name,
            category,
            weight,
            description,
            price,
            imageData: imageData || undefined
        };

        console.log('Adding food with data:', foodData);

        const response = await FoodAPI.create(foodData);

        console.log('Food API response:', response);

        // Check for success - handle different response formats
        if (response && (response.success || response.data)) {
            alert('Food item added successfully!');
            document.getElementById('addFoodForm').reset();
            loadFoodProducts();
        } else {
            alert('Failed to add food item: ' + (response?.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error adding food:', error);
        // Check if food was actually added despite error
        alert('Error adding food item. Please refresh to check if it was added.');
    }
}

// Load Food Products
async function loadFoodProducts() {
    const productsContainer = document.getElementById('foodProductsList');

    try {
        const response = await FoodAPI.getAll();
        const allFood = response.data || [];

        // Filter to show only current vendor's products
        const vendorProducts = allFood.filter(f => f.vendor && f.vendor._id === currentFoodVendor.id);

        if (vendorProducts.length === 0) {
            productsContainer.innerHTML = '<p class="empty-message">No products added yet</p>';
            return;
        }

        productsContainer.innerHTML = vendorProducts.map(product => `
            <div class="product-card">
                <div class="product-image ${product.image || 'food1'}" style="${product.imageData ? `background-image: url('${product.imageData}'); background-size: cover;` : ''}"></div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-category">${product.category.toUpperCase()} | ${product.weight}</p>
                    <p class="product-description">${product.description || 'No description'}</p>
                    <p class="product-price">₹${product.price.toLocaleString()}</p>
                    <button class="btn-danger" onclick="deleteFood('${product._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        productsContainer.innerHTML = '<p class="empty-message">Error loading products</p>';
    }
}

// Delete Food
async function deleteFood(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        await FoodAPI.delete(productId);
        showNotification('Product deleted successfully', 'success');
        loadFoodProducts();
    } catch (error) {
        console.error('Error deleting food:', error);
        showNotification('Failed to delete product', 'error');
    }
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        AuthAPI.logout();
        window.location.reload();
    }
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const gradient = type === 'success'
        ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${gradient};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        font-family: 'Outfit', sans-serif;
        font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}
