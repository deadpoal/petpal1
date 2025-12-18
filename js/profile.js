// Customer Profile Page Logic
document.addEventListener('DOMContentLoaded', () => {
    checkCustomerAuth();
    loadProfileData();
    setupProfileActions();
});

function checkCustomerAuth() {
    const token = TokenManager.getToken();
    const customerData = localStorage.getItem('petpal_currentCustomer');

    if (!token || !customerData) {
        // Redirect to login if not authenticated
        window.location.href = 'customer-login.html';
        return;
    }
}

async function loadProfileData() {
    const customerData = localStorage.getItem('petpal_currentCustomer');

    if (!customerData) {
        window.location.href = 'customer-login.html';
        return;
    }

    try {
        const customer = JSON.parse(customerData);

        // Display profile information
        document.getElementById('profileName').textContent = customer.name;
        document.getElementById('profileEmail').textContent = customer.email;
        document.getElementById('profilePhone').textContent = customer.phone || 'Not provided';

        // Show joined date (use current date if not available)
        const joinedDate = customer.createdAt ? new Date(customer.createdAt) : new Date();
        document.getElementById('profileJoined').textContent = joinedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Load order history from API
        await loadOrderHistory(customer);

        // Load consultation history (if implemented)
        // await loadConsultationHistory(customer);
    } catch (error) {
        console.error('Error loading profile:', error);
        window.location.href = 'customer-login.html';
    }
}

function loadConsultationHistory(customer) {
    const consultations = JSON.parse(localStorage.getItem('petpal_consultations') || '[]');
    const customerConsultations = consultations.filter(c => c.customerId === customer.id);

    if (customerConsultations.length > 0) {
        // Add consultations section to order history card
        const orderHistoryCard = document.querySelector('.order-history-card');
        const consultSection = document.createElement('div');
        consultSection.innerHTML = `
            <h2 style="margin-top: 2rem;">Consultation History</h2>
            <div class="consult-list">
                ${customerConsultations.map(consult => `
                    <div class="order-card">
                        <div class="order-header">
                            <div>
                                <h3>Dr. ${consult.doctorName}</h3>
                                <p class="order-date">${new Date(consult.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</p>
                            </div>
                            <div class="order-total">₹${consult.fee.toLocaleString()}</div>
                        </div>
                        <div class="order-items">
                            <div class="order-item">
                                <span class="item-name">Date: ${consult.date}</span>
                                <span class="item-price">Time: ${consult.time}</span>
                            </div>
                            <div class="order-item" style="grid-column: 1 / -1;">
                                <span class="item-name">${consult.issue}</span>
                            </div>
                        </div>
                        <div class="order-footer">
                            <span class="order-status">
                                <span class="status-icon">✓</span> ${consult.status}
                            </span>
                            ${consult.canRate ? `<button class="btn-secondary" onclick="rateFromProfile('${consult.doctorId}')">Rate Doctor</button>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        orderHistoryCard.appendChild(consultSection);
    }
}

async function loadOrderHistory(customer) {
    const ordersList = document.getElementById('ordersList');

    try {
        // Fetch orders from API
        const response = await OrdersAPI.getAll();
        const customerOrders = response.data || [];

        if (customerOrders.length === 0) {
            ordersList.innerHTML = '<p class="empty-message">No orders yet. Start shopping to see your purchase history!</p>';
            return;
        }

        ordersList.innerHTML = customerOrders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <h3>Order #${order.orderId}</h3>
                        <p class="order-date">${new Date(order.createdAt || order.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</p>
                    </div>
                    <div class="order-total">₹${order.total.toLocaleString()}</div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span class="item-name">${item.name}</span>
                            <span class="item-price">₹${item.price.toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-footer">
                    <span class="order-status">
                        <span class="status-icon">✓</span> ${order.status || 'Order Placed'}
                    </span>
                    <span class="order-payment">${getPaymentLabel(order.payment.method || order.payment)}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
        ordersList.innerHTML = '<p class="empty-message">Error loading orders. Please try again later.</p>';
    }
}

function getPaymentLabel(method) {
    const labels = {
        'card': 'Card Payment',
        'upi': 'UPI',
        'netbanking': 'Net Banking',
        'cod': 'Cash on Delivery'
    };
    return labels[method] || method;
}

function setupProfileActions() {
    const logoutBtn = document.getElementById('profileLogout');
    const editBtn = document.getElementById('editInfoBtn');
    const editModal = document.getElementById('editModal');
    const closeBtn = document.getElementById('closeEditModal');
    const cancelBtn = document.getElementById('cancelEdit');
    const editForm = document.getElementById('editProfileForm');

    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            AuthAPI.logout();
            window.location.href = 'customer-login.html';
        }
    });

    editBtn.addEventListener('click', () => {
        const currentCustomerId = localStorage.getItem('petpal_currentCustomer');
        const customers = JSON.parse(localStorage.getItem('petpal_customers') || '[]');
        const customer = customers.find(c => c.id === currentCustomerId);

        if (customer) {
            document.getElementById('editName').value = customer.name;
            document.getElementById('editPhone').value = customer.phone || '';
            editModal.classList.add('active');
        }
    });

    closeBtn.addEventListener('click', () => {
        editModal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', () => {
        editModal.classList.remove('active');
    });

    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.classList.remove('active');
        }
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const currentCustomerId = localStorage.getItem('petpal_currentCustomer');
        const customers = JSON.parse(localStorage.getItem('petpal_customers') || '[]');
        const customerIndex = customers.findIndex(c => c.id === currentCustomerId);

        if (customerIndex !== -1) {
            customers[customerIndex].name = document.getElementById('editName').value;
            customers[customerIndex].phone = document.getElementById('editPhone').value;

            localStorage.setItem('petpal_customers', JSON.stringify(customers));

            editModal.classList.remove('active');
            loadProfileData();
            showNotification('Profile updated successfully!');
        }
    });
}

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
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
