// ===================================
// API Configuration and Helper Functions
// ===================================

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_CONFIG = {
    // If running locally, use localhost. Otherwise, use the production backend URL.
    // REPLACE 'https://petpal-244j.onrender.com/api' with your actual new backend URL after deploying to Render.
    BASE_URL: isLocal ? 'http://localhost:5000/api' : 'https://petpal-244j.onrender.com/api',
    TIMEOUT: 10000
};

// Token Management
const TokenManager = {
    setToken(token) {
        localStorage.setItem('petpal_token', token);
    },

    getToken() {
        return localStorage.getItem('petpal_token');
    },

    removeToken() {
        localStorage.removeItem('petpal_token');
    },

    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

// HTTP Request Helper
const API = {
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...TokenManager.getAuthHeader(),
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // GET request
    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET'
        });
    },

    // POST request
    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    // PUT request
    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
};

// Authentication API
const AuthAPI = {
    // Customer Authentication
    async customerRegister(data) {
        const response = await API.post('/auth/customer/register', data);
        if (response.success && response.data.token) {
            TokenManager.setToken(response.data.token);
            localStorage.setItem('petpal_currentCustomer', JSON.stringify(response.data));
        }
        return response;
    },

    async customerLogin(email, password) {
        const response = await API.post('/auth/customer/login', { email, password });
        if (response.success && response.data.token) {
            TokenManager.setToken(response.data.token);
            localStorage.setItem('petpal_currentCustomer', JSON.stringify(response.data));
        }
        return response;
    },

    // Vendor Authentication
    async vendorRegister(data) {
        const response = await API.post('/auth/vendor/register', data);
        if (response.success && response.data.token) {
            TokenManager.setToken(response.data.token);
            localStorage.setItem('currentVendor', JSON.stringify(response.data));
        }
        return response;
    },

    async vendorLogin(email, password) {
        const response = await API.post('/auth/vendor/login', { email, password });
        if (response.success && response.data.token) {
            TokenManager.setToken(response.data.token);
            localStorage.setItem('currentVendor', JSON.stringify(response.data));
        }
        return response;
    },

    // Doctor Authentication
    async doctorRegister(data) {
        const response = await API.post('/auth/doctor/register', data);
        if (response.success && response.data.token) {
            TokenManager.setToken(response.data.token);
            localStorage.setItem('currentDoctor', JSON.stringify(response.data));
        }
        return response;
    },

    async doctorLogin(email, password) {
        const response = await API.post('/auth/doctor/login', { email, password });
        if (response.success && response.data.token) {
            TokenManager.setToken(response.data.token);
            localStorage.setItem('currentDoctor', JSON.stringify(response.data));
        }
        return response;
    },

    async updateWhatsAppSettings(whatsappApiKey, whatsappEnabled) {
        return API.put('/auth/doctor/whatsapp-settings', { whatsappApiKey, whatsappEnabled });
    },

    // Logout
    logout() {
        TokenManager.removeToken();
        localStorage.removeItem('petpal_currentCustomer');
        localStorage.removeItem('currentVendor');
        localStorage.removeItem('currentDoctor');
    }
};

// Pets API
const PetsAPI = {
    async getAll() {
        return API.get('/pets');
    },

    async getById(id) {
        return API.get(`/pets/${id}`);
    },

    async create(petData) {
        return API.post('/pets', petData);
    },

    async update(id, petData) {
        return API.put(`/pets/${id}`, petData);
    },

    async delete(id) {
        return API.delete(`/pets/${id}`);
    },

    async getVendorPets() {
        return API.get('/pets/vendor/my-pets');
    }
};

// Food API
const FoodAPI = {
    async getAll(category = null) {
        const endpoint = category ? `/food?category=${category}` : '/food';
        return API.get(endpoint);
    },

    async getById(id) {
        return API.get(`/food/${id}`);
    },

    async create(foodData) {
        return API.post('/food', foodData);
    },

    async update(id, foodData) {
        return API.put(`/food/${id}`, foodData);
    },

    async delete(id) {
        return API.delete(`/food/${id}`);
    }
};

// Orders API
const OrdersAPI = {
    async getAll() {
        return API.get('/orders');
    },

    async getById(id) {
        return API.get(`/orders/${id}`);
    },

    async create(orderData) {
        return API.post('/orders', orderData);
    }
};

// Consultations API
const ConsultationsAPI = {
    async getDoctors() {
        return API.get('/consultations/doctors');
    },

    async getAll() {
        return API.get('/consultations');
    },

    async create(consultationData) {
        return API.post('/consultations', consultationData);
    },

    async getDoctorConsultations() {
        return API.get('/consultations/doctor/my-consultations');
    },

    async update(id, data) {
        return API.put(`/consultations/${id}`, data);
    },

    // Notification methods
    async getNotifications() {
        return API.get('/consultations/doctor/notifications');
    },

    async markAsRead(id) {
        return API.put(`/consultations/doctor/notifications/${id}/read`);
    },

    async markAllAsRead() {
        return API.put('/consultations/doctor/notifications/mark-all-read');
    }
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.API_CONFIG = API_CONFIG;
    window.TokenManager = TokenManager;
    window.API = API;
    window.AuthAPI = AuthAPI;
    window.PetsAPI = PetsAPI;
    window.FoodAPI = FoodAPI;
    window.OrdersAPI = OrdersAPI;
    window.ConsultationsAPI = ConsultationsAPI;
}
