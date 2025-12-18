// Customer Login Page Logic
document.addEventListener('DOMContentLoaded', () => {
    // Don't auto-redirect - let user choose to login or register
    setupAuthTabs();
    setupCustomerForms();
});

function setupAuthTabs() {
    const loginForm = document.getElementById('customerLoginForm');
    const registerForm = document.getElementById('customerRegisterForm');
    const showRegisterBtn = document.getElementById('showRegisterForm');
    const showLoginBtn = document.getElementById('showLoginForm');

    // Show registration form
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', () => {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
    }

    // Show login form
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', () => {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }
}

// Setup Customer Forms
function setupCustomerForms() {
    const loginForm = document.getElementById('customerLoginForm');
    const registerForm = document.getElementById('customerRegisterForm');

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await AuthAPI.customerLogin(email, password);
        if (response.success) {
            showNotification('Welcome back, ' + response.data.name + '!', 'success');
            // Redirect to profile page after successful login
            setTimeout(() => {
                window.location.href = 'customer-profile.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Invalid email or password', 'error');
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await AuthAPI.customerRegister({ name, email, phone, password });
        if (response.success) {
            showNotification('Account created successfully! Redirecting to your profile...', 'success');
            // Redirect to profile page after successful registration
            setTimeout(() => {
                window.location.href = 'customer-profile.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(error.message || 'Registration failed. Please try again.', 'error');
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
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
