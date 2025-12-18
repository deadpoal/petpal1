// ===================================
// PetPal - Main Application Logic
// ===================================

// Pet Data
const pets = [
    {
        id: 1,
        name: 'Bruno',
        breed: 'Golden Retriever',
        age: '3 months',
        gender: 'Male',
        price: 25000,
        badge: 'Popular',
        image: 'pet1'
    },
    {
        id: 2,
        name: 'Luna',
        breed: 'Persian Cat',
        age: '2 months',
        gender: 'Female',
        price: 15000,
        badge: 'New',
        image: 'pet2'
    },
    {
        id: 3,
        name: 'Rocky',
        breed: 'German Shepherd',
        age: '4 months',
        gender: 'Male',
        price: 30000,
        badge: 'Featured',
        image: 'pet3'
    },
    {
        id: 4,
        name: 'Milo',
        breed: 'Beagle',
        age: '3 months',
        gender: 'Male',
        price: 20000,
        badge: 'Popular',
        image: 'pet4'
    },
    {
        id: 5,
        name: 'Bella',
        breed: 'Siamese Cat',
        age: '2 months',
        gender: 'Female',
        price: 18000,
        badge: 'New',
        image: 'pet5'
    },
    {
        id: 6,
        name: 'Max',
        breed: 'Labrador',
        age: '4 months',
        gender: 'Male',
        price: 22000,
        badge: 'Featured',
        image: 'pet6'
    }
];

// Food Data
const foodItems = [
    {
        id: 1,
        name: 'Premium Dog Food',
        description: 'Nutritious dry food for adult dogs with real chicken and vegetables',
        price: 1299,
        image: 'food1'
    },
    {
        id: 2,
        name: 'Cat Treats Deluxe',
        description: 'Irresistible treats made with real fish and vitamins',
        price: 499,
        image: 'food2'
    },
    {
        id: 3,
        name: 'Puppy Growth Formula',
        description: 'Specially formulated for growing puppies with DHA',
        price: 1599,
        image: 'food3'
    },
    {
        id: 4,
        name: 'Kitten Milk Replacer',
        description: 'Complete nutrition for kittens and nursing cats',
        price: 799,
        image: 'food4'
    },
    {
        id: 5,
        name: 'Senior Dog Food',
        description: 'Easy to digest formula for senior dogs with joint support',
        price: 1399,
        image: 'food5'
    },
    {
        id: 6,
        name: 'Multi-Vitamin Treats',
        description: 'Healthy treats packed with essential vitamins and minerals',
        price: 599,
        image: 'food6'
    }
];

// Shopping Cart
let cart = [];
let currentCheckoutStep = 1;
let shippingCost = 99;

// ===================================
// Customer Authentication
// ===================================

// Check authentication on page load
function checkAuth() {
    // Check for JWT token
    const token = TokenManager.getToken();
    const customerData = localStorage.getItem('petpal_currentCustomer');
    const loginBtn = document.getElementById('loginBtn');

    if (token && customerData) {
        // User is logged in
        try {
            const customer = JSON.parse(customerData);
            showUserAccount(customer);
            if (loginBtn) loginBtn.style.display = 'none';
            return true;
        } catch (error) {
            console.error('Error parsing customer data:', error);
            // Clear invalid data
            TokenManager.removeToken();
            localStorage.removeItem('petpal_currentCustomer');
        }
    }

    // User is not logged in - show login button
    if (loginBtn) loginBtn.style.display = 'inline-block';
    return false;
}

// Show user account in navbar
function showUserAccount(customer) {
    const userAccount = document.getElementById('userAccount');
    const userName = document.getElementById('userName');
    const dropdownName = document.getElementById('dropdownName');
    const dropdownEmail = document.getElementById('dropdownEmail');
    const loginBtn = document.getElementById('loginBtn');

    if (userName) userName.textContent = customer.name.split(' ')[0]; // First name only
    if (dropdownName) dropdownName.textContent = customer.name;
    if (dropdownEmail) dropdownEmail.textContent = customer.email;
    if (userAccount) userAccount.style.display = 'block';
    if (loginBtn) loginBtn.style.display = 'none';
}

// Setup login button
function setupLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn && !loginBtn.onclick) {
        loginBtn.onclick = function () {
            window.location.href = 'customer-login.html';
        };
    }
}

// Setup authentication system
function setupAuthentication() {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('customerLoginForm');
    const registerForm = document.getElementById('customerRegisterForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    // Tab switching
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });

    // Link switching
    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        registerTab.click();
    });

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        loginTab.click();
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('customerLoginEmail').value;
        const password = document.getElementById('customerLoginPassword').value;

        try {
            const response = await AuthAPI.customerLogin(email, password);
            if (response.success) {
                showNotification('Welcome back, ' + response.data.name + '!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        } catch (error) {
            showNotification('Invalid email or password');
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('customerRegName').value;
        const email = document.getElementById('customerRegEmail').value;
        const phone = document.getElementById('customerRegPhone').value;
        const password = document.getElementById('customerRegPassword').value;

        try {
            const response = await AuthAPI.customerRegister({ name, email, phone, password });
            if (response.success) {
                showNotification('Welcome to PetPal, ' + name + '!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        } catch (error) {
            showNotification(error.message || 'Registration failed');
        }
    });

    // Account dropdown toggle
    const accountBtn = document.getElementById('accountBtn');
    const accountDropdown = document.getElementById('accountDropdown');

    if (accountBtn) {
        accountBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            accountDropdown.classList.toggle('active');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        if (accountDropdown) {
            accountDropdown.classList.remove('active');
        }
    });

    // Logout functionality
    const logoutBtn = document.getElementById('customerLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('petpal_currentCustomer');
            showNotification('Logged out successfully');
            location.reload();
        });
    }

    // My Profile navigation
    const myProfileBtn = document.getElementById('myProfile');
    if (myProfileBtn) {
        myProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'customer-profile.html';
        });
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeDefaultDoctors();
    setupAuthentication();
    checkAuth();
    renderPets();
    renderFood();
    renderVets();
    setupNavigation();
    setupCart();
    setupMenuToggle();
    setupRatingModal();
    loadCart();
});

// Render Pets
async function renderPets() {
    const petsGrid = document.getElementById('petsGrid');

    try {
        // Fetch pets from API
        const response = await PetsAPI.getAll();
        const allPets = response.data || [];

        if (allPets.length === 0) {
            petsGrid.innerHTML = '<p class="empty-message">No pets available at the moment.</p>';
            return;
        }

        petsGrid.innerHTML = allPets.map(pet => {
            // Create proper image display
            let imageHtml;
            if (pet.imageData) {
                // Use imageData from API as background image
                imageHtml = `<div class="pet-image" style="background-image: url('${pet.imageData}'); background-size: cover; background-position: center;">`;
            } else {
                // Fallback to CSS class
                imageHtml = `<div class="pet-image ${pet.image || 'pet1'}">`;
            }

            return `
                <div class="pet-card">
                    ${imageHtml}
                        ${pet.badge ? `<span class="pet-badge badge-${pet.badge.toLowerCase()}">${pet.badge}</span>` : ''}
                    </div>
                    <div class="pet-details">
                        <h3 class="pet-name">${pet.name}</h3>
                        <p class="pet-breed">${pet.breed}</p>
                        <div class="pet-info">
                            <span>📅 ${pet.age}</span>
                            <span>${pet.gender === 'Male' ? '♂️' : '♀️'} ${pet.gender}</span>
                        </div>
                        <div class="pet-footer">
                            <div class="pet-price">₹${pet.price.toLocaleString()}</div>
                            <button class="add-to-cart-btn" onclick="addToCart('${pet._id}', 'pet', '${pet.name}', ${pet.price}, '${pet.imageData || ''}')">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error fetching pets:', error);
        petsGrid.innerHTML = '<p class="empty-message">Error loading pets. Please try again later.</p>';
    }
}

// Get vendor pets from localStorage (deprecated - now using API)
function getVendorPets() {
    // This function is deprecated but kept for backward compatibility
    return [];
}

// Render Food Items
async function renderFood() {
    console.log('=== renderFood called ===');
    const foodGrid = document.getElementById('foodGrid');
    console.log('foodGrid element:', foodGrid);
    if (!foodGrid) return;

    try {
        console.log('Fetching food from API...');
        // Fetch food from API
        const response = await FoodAPI.getAll();
        console.log('Food API response:', response);
        const allFood = response.data || [];
        console.log('Food array:', allFood, 'Length:', allFood.length);

        if (allFood.length === 0) {
            foodGrid.innerHTML = '<p class="empty-message">No food items available at the moment.</p>';
            return;
        }

        foodGrid.innerHTML = allFood.map(food => {
            // Create proper image display
            let imageHtml;
            if (food.imageData) {
                imageHtml = `<div class="food-image" style="background-image: url('${food.imageData}'); background-size: cover; background-position: center;"></div>`;
            } else {
                imageHtml = `<div class="food-image ${food.image || 'food1'}"></div>`;
            }

            return `
                <div class="food-card">
                    ${imageHtml}
                    <div class="food-info">
                        <h3>${food.name}</h3>
                        <p class="food-category">${food.category ? food.category.toUpperCase() : ''} ${food.weight ? '| ' + food.weight : ''}</p>
                        ${food.description ? `<p class="food-description">${food.description}</p>` : ''}
                        ${food.vendorName ? `<p class="food-vendor">By: ${food.vendorName}</p>` : ''}
                        <div class="food-footer">
                            <span class="food-price">₹${food.price.toLocaleString()}</span>
                            <button class="btn-primary" onclick="addToCart('${food._id}', 'food', '${food.name}', ${food.price}, '${food.imageData || ''}')">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error fetching food:', error);
        foodGrid.innerHTML = '<p class="empty-message">Error loading food items. Please try again later.</p>';
    }
}

// Add to Cart
function addToCart(id, type, name, price, image) {
    // Check if item already exists in cart
    const existingItem = cart.find(i => i.id === id && i.type === type);

    if (existingItem) {
        showNotification('Item already in cart!');
        return;
    }

    // Add item to cart with provided data
    cart.push({
        id: id,
        name: name,
        price: price,
        image: image,
        type: type
    });

    saveCart();
    updateCartUI();
    showNotification('Added to cart!');
}

// Remove from Cart
function removeFromCart(id, type) {
    cart = cart.filter(item => !(item.id === id && item.type === type));
    saveCart();
    updateCartUI();
}

// Update Cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    cartCount.textContent = cart.length;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '₹0';
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image ${item.image}"></div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
                <button class="cart-item-remove" onclick="removeFromCart('${item.id}', '${item.type}')">
                    Remove
                </button>
            </div>
        </div>
    `).join('');

    cartTotal.textContent = `₹${total.toLocaleString()}`;
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load Cart from LocalStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Setup Cart Modal
function setupCart() {
    const cartBtn = document.getElementById('cartBtn');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');

    cartBtn.addEventListener('click', () => {
        cartModal.classList.add('active');
    });

    closeCart.addEventListener('click', () => {
        cartModal.classList.remove('active');
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Your cart is empty!');
            return;
        }

        // Check if user is logged in as customer
        const token = TokenManager.getToken();
        const customerData = localStorage.getItem('petpal_currentCustomer');
        const doctorData = localStorage.getItem('currentDoctor');
        const vendorData = localStorage.getItem('currentVendor');

        console.log('Checkout - Token:', token ? 'exists' : 'none');
        console.log('Checkout - Customer data:', customerData ? 'exists' : 'none');
        console.log('Checkout - Doctor data:', doctorData ? 'exists' : 'none');
        console.log('Checkout - Vendor data:', vendorData ? 'exists' : 'none');

        if (!token) {
            showNotification('Please login as a customer to place orders');
            setTimeout(() => {
                window.location.href = 'customer-login.html';
            }, 1500);
            return;
        }

        // Check if logged in as doctor or vendor (they have their own localStorage keys)
        if (doctorData && !customerData) {
            console.log('Detected doctor login, blocking checkout');
            showNotification('⚠️ You are logged in as a DOCTOR. Please logout and login as a CUSTOMER to place orders.');
            cartModal.classList.remove('active');
            return;
        }

        if (vendorData && !customerData) {
            console.log('Detected vendor login, blocking checkout');
            showNotification('⚠️ You are logged in as a VENDOR. Please logout and login as a CUSTOMER to place orders.');
            cartModal.classList.remove('active');
            return;
        }

        if (!customerData) {
            console.log('No customer data found, redirecting to login');
            showNotification('Please login as a customer to place orders');
            setTimeout(() => {
                window.location.href = 'customer-login.html';
            }, 1500);
            return;
        }

        console.log('Customer verified, proceeding to checkout');
        // Close cart modal and open checkout modal
        cartModal.classList.remove('active');
        openCheckoutModal();
    });

    // Close on outside click
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.classList.remove('active');
        }
    });
}

// Setup Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Don't prevent default for external links (vendor/doctor/food-vendor dashboards)
            if (href === 'vendor-dashboard.html' ||
                href === 'doctor-dashboard.html' ||
                href === 'food-vendor-dashboard.html') {
                return; // Allow normal navigation
            }

            e.preventDefault();

            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            link.classList.add('active');

            // Smooth scroll to section
            if (href.startsWith('#')) {
                const section = document.querySelector(href);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Update active link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section[id]');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Setup Menu Toggle (Mobile)
function setupMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        font-family: 'Outfit', sans-serif;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Checkout Functions
function openCheckoutModal() {
    const checkoutModal = document.getElementById('checkoutModal');
    if (!checkoutModal) return;

    currentCheckoutStep = 1;
    checkoutModal.classList.add('active');
    goToCheckoutStep(1);
    populateCheckoutItems();
    setupCheckoutListeners();
}

function setupCheckoutListeners() {
    const closeCheckout = document.getElementById('closeCheckout');
    if (closeCheckout) {
        closeCheckout.onclick = () => document.getElementById('checkoutModal').classList.remove('active');
    }

    // Add Continue to Address button handler
    const proceedToAddress = document.getElementById('proceedToAddress');
    if (proceedToAddress) {
        proceedToAddress.onclick = () => goToCheckoutStep(2);
    }

    // Add Continue to Payment button handler
    const proceedToPayment = document.getElementById('proceedToPayment');
    if (proceedToPayment) {
        proceedToPayment.onclick = () => {
            if (validateAddressForm()) goToCheckoutStep(3);
        };
    }

    const prevBtns = document.querySelectorAll('.prev-btn');
    prevBtns.forEach(btn => btn.onclick = () => goToCheckoutStep(currentCheckoutStep - 1));

    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.onsubmit = async (e) => {
            e.preventDefault();

            // Get selected payment method
            const selectedPayment = document.querySelector('input[name="payment"]:checked');
            if (!selectedPayment) {
                showNotification('Please select a payment method');
                return;
            }

            // Directly process the order without confirmation dialog
            await completeOrder(e);
        };
    }

    const continueShopping = document.getElementById('continueShopping');
    if (continueShopping) {
        continueShopping.onclick = () => {
            document.getElementById('checkoutModal').classList.remove('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
    }
}

function goToCheckoutStep(step) {
    currentCheckoutStep = step;

    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        const stepEl = document.getElementById('checkoutStep' + i);
        if (stepEl) stepEl.style.display = 'none';
    }

    // Show current step
    const currentStepEl = document.getElementById('checkoutStep' + step);
    if (currentStepEl) currentStepEl.style.display = 'block';

    // Update progress indicators
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((el, index) => {
        if (index + 1 < step) {
            el.classList.add('completed');
            el.classList.remove('active');
        } else if (index + 1 === step) {
            el.classList.add('active');
            el.classList.remove('completed');
        } else {
            el.classList.remove('active', 'completed');
        }
    });
}

function populateCheckoutItems() {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const grandTotal = subtotal + shippingCost;
    document.getElementById('checkoutItems').innerHTML = cart.map(item =>
        '<div class="checkout-item"><div class="checkout-item-image ' + item.image +
        '"></div><div class="checkout-item-details"><div class="checkout-item-name">' + item.name +
        '</div><div class="checkout-item-price">₹' + item.price.toLocaleString() + '</div></div></div>'
    ).join('');
    document.getElementById('checkoutSubtotal').textContent = '₹' + subtotal.toLocaleString();
    document.getElementById('checkoutShipping').textContent = '₹' + shippingCost;
    document.getElementById('checkoutGrandTotal').textContent = '₹' + grandTotal.toLocaleString();
}

function validateAddressForm() {
    const form = document.getElementById('addressForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    return true;
}

async function completeOrder(e) {
    e.preventDefault();

    // Check if user is logged in as customer
    const token = TokenManager.getToken();
    const customerData = localStorage.getItem('petpal_currentCustomer');
    const doctorData = localStorage.getItem('currentDoctor');
    const vendorData = localStorage.getItem('currentVendor');

    if (!token) {
        showNotification('Please login as a customer to complete your order');
        document.getElementById('checkoutModal').classList.remove('active');
        window.location.href = 'customer-login.html';
        return;
    }

    // Check if logged in as doctor or vendor instead of customer
    if (doctorData || vendorData) {
        showNotification('⚠️ You are logged in as a ' + (doctorData ? 'DOCTOR' : 'VENDOR') + '. Please logout and login as a CUSTOMER to place orders.');
        document.getElementById('checkoutModal').classList.remove('active');
        // Show logout option
        if (confirm('Would you like to logout now and login as a customer?')) {
            AuthAPI.logout();
            window.location.href = 'customer-login.html';
        }
        return;
    }

    if (!customerData) {
        showNotification('Please login as a customer to complete your order');
        document.getElementById('checkoutModal').classList.remove('active');
        window.location.href = 'customer-login.html';
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const grandTotal = subtotal + shippingCost;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    const paymentLabels = {
        'card': 'Credit/Debit Card',
        'upi': 'UPI',
        'netbanking': 'Net Banking',
        'cod': 'Cash on Delivery'
    };

    const shippingData = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        zipcode: document.getElementById('zip').value
    };

    // Prepare order data for API
    const orderData = {
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            type: item.type
        })),
        shippingDetails: shippingData,
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        shipping: shippingCost,
        total: grandTotal
    };

    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        // Create order via API
        const response = await OrdersAPI.create(orderData);

        if (response.success) {
            const order = response.data;

            // Display order confirmation
            document.getElementById('orderId').textContent = order.orderId;
            document.getElementById('orderTotal').textContent = '₹' + grandTotal.toLocaleString();
            document.getElementById('orderPayment').textContent = paymentLabels[paymentMethod];

            // Clear cart
            cart = [];
            saveCart();
            updateCartUI();

            // Show success step
            goToCheckoutStep(4);
            showNotification('Order placed successfully!');
        } else {
            throw new Error(response.message || 'Failed to create order');
        }
    } catch (error) {
        console.error('Order creation error:', error);

        // Check if it's an authorization error
        if (error.message && error.message.includes('not authorized')) {
            showNotification('⚠️ Authorization Error: You must be logged in as a CUSTOMER to place orders. Please logout and login with a customer account.');
            document.getElementById('checkoutModal').classList.remove('active');

            // Offer to logout
            setTimeout(() => {
                if (confirm('You are not logged in as a customer. Would you like to logout and login as a customer now?')) {
                    AuthAPI.logout();
                    window.location.href = 'customer-login.html';
                }
            }, 1000);
        } else {
            showNotification('Failed to place order: ' + error.message);
        }

        // Re-enable button
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Confirm Order';
            submitBtn.disabled = false;
        }
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize default doctors
function initializeDefaultDoctors() {
    const doctors = JSON.parse(localStorage.getItem('petpal_doctors') || '[]');
    if (doctors.length === 0) {
        const defaultDoctors = [
            {
                id: 'doctor_default_1',
                name: 'Sarah Johnson',
                email: 'sarah@petpal.com',
                phone: '+91 98765 43210',
                specialty: 'Small Animals Specialist',
                qualification: 'BVSc, MVSc',
                experience: 10,
                consultationFee: 500,
                clinic: 'Pet Care Clinic',
                address: '123 Main Street, Mumbai',
                password: 'demo123',
                bio: 'Experienced veterinarian specializing in small animals with over 10 years of practice.',
                availability: 'Mon-Fri 9AM-6PM',
                ratings: [],
                averageRating: 4.9,
                totalReviews: 120,
                totalConsultations: 450,
                createdAt: new Date().toISOString()
            },
            {
                id: 'doctor_default_2',
                name: 'Michael Chen',
                email: 'michael@petpal.com',
                phone: '+91 98765 43211',
                specialty: 'Exotic Pets Expert',
                qualification: 'BVSc, PhD',
                experience: 8,
                consultationFee: 600,
                clinic: 'Exotic Pet Hospital',
                address: '456 Park Avenue, Delhi',
                password: 'demo123',
                bio: 'Specialized in exotic pets including birds, reptiles, and small mammals.',
                availability: 'Mon-Sat 10AM-7PM',
                ratings: [],
                averageRating: 4.8,
                totalReviews: 95,
                totalConsultations: 380,
                createdAt: new Date().toISOString()
            },
            {
                id: 'doctor_default_3',
                name: 'Emily Davis',
                email: 'emily@petpal.com',
                phone: '+91 98765 43212',
                specialty: 'General Practice',
                qualification: 'BVSc',
                experience: 15,
                consultationFee: 450,
                clinic: 'Happy Paws Veterinary',
                address: '789 Lake Road, Bangalore',
                password: 'demo123',
                bio: 'General practice veterinarian with a focus on preventive care and wellness.',
                availability: 'Mon-Sun 8AM-8PM',
                ratings: [],
                averageRating: 5.0,
                totalReviews: 150,
                totalConsultations: 600,
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('petpal_doctors', JSON.stringify(defaultDoctors));
    }
}

// Initialize consultation modal
if (typeof setupConsultationModal === 'function') {
    setTimeout(() => setupConsultationModal(), 500);
}
