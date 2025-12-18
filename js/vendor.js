// ===================================
// Vendor Dashboard Logic
// ===================================

// Current logged-in vendor
let currentVendor = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkVendorAuth();
    setupAuthTabs();
    setupVendorForms();
    setupPetModal();
});

// Check if vendor is logged in
// Check if vendor is logged in
async function checkVendorAuth() {
    const token = TokenManager.getToken();
    const loggedInVendor = localStorage.getItem('currentVendor');

    if (token && loggedInVendor) {
        currentVendor = JSON.parse(loggedInVendor);
        showDashboard();
    } else {
        showAuth();
    }
}

// Show Auth Section
function showAuth() {
    document.getElementById('vendorAuth').style.display = 'block';
    document.getElementById('vendorDashboard').style.display = 'none';
}

// Show Dashboard
function showDashboard() {
    document.getElementById('vendorAuth').style.display = 'none';
    document.getElementById('vendorDashboard').style.display = 'block';

    if (currentVendor) {
        document.getElementById('vendorName').textContent = currentVendor.businessName;
        loadVendorData();
    }
}

// Setup Auth Tabs
function setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('vendorLoginForm');
    const registerForm = document.getElementById('vendorRegisterForm');

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

// Setup Vendor Forms
function setupVendorForms() {
    const loginForm = document.getElementById('vendorLoginForm');
    const registerForm = document.getElementById('vendorRegisterForm');
    const logoutBtn = document.getElementById('vendorLogout');

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await AuthAPI.vendorLogin(email, password);
        if (response.success) {
            currentVendor = response.data;
            showNotification('Login successful!', 'success');
            showDashboard();
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Invalid email or password!', 'error');
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
            currentVendor = response.data;
            showNotification('Registration successful!', 'success');
            showDashboard();
            e.target.reset();
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(error.message || 'Registration failed!', 'error');
    }
}

// Handle Logout
function handleLogout() {
    AuthAPI.logout();
    currentVendor = null;
    showNotification('Logged out successfully!', 'success');
    showAuth();
}

// Load Vendor Data
async function loadVendorData() {
    if (!currentVendor) return;

    try {
        // Fetch vendor's pets from API
        const response = await PetsAPI.getVendorPets();
        const pets = response.data || [];

        const activePets = pets.filter(p => p.isAvailable !== false).length;
        const totalRevenue = pets.reduce((sum, pet) => sum + (pet.price || 0), 0);

        document.getElementById('totalPets').textContent = pets.length;
        document.getElementById('activePets').textContent = activePets;
        document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toLocaleString()}`;

        renderVendorListings(pets);
    } catch (error) {
        console.error('Error loading vendor data:', error);
        renderVendorListings([]);
    }
}

// Render Vendor Listings
function renderVendorListings(pets) {
    const listingsGrid = document.getElementById('vendorListings');

    if (pets.length === 0) {
        listingsGrid.innerHTML = '<p class="empty-message">No pets listed yet. Click "+ Add New Pet" to get started!</p>';
        return;
    }

    listingsGrid.innerHTML = pets.map(pet => `
        <div class="listing-card">
            <div class="listing-image" style="${pet.imageData ? `background-image: url('${pet.imageData}');` : ''} background-size: cover; background-position: center;"></div>
            <div class="listing-details">
                <h3 class="listing-name">${pet.name}</h3>
                <div class="listing-info">
                    <span>${pet.breed}</span>
                    <span>${pet.age}</span>
                    <span>${pet.gender}</span>
                    <span>${pet.category}</span>
                </div>
                <div class="listing-price">₹${pet.price.toLocaleString()}</div>
                <div class="listing-actions">
                    <button class="btn-edit" onclick="editPet('${pet._id}')">Edit</button>
                    <button class="btn-delete" onclick="deletePet('${pet._id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup Pet Modal
function setupPetModal() {
    const addPetBtn = document.getElementById('addPetBtn');
    const modal = document.getElementById('addPetModal');
    const closeBtn = document.getElementById('closePetModal');
    const cancelBtn = document.getElementById('cancelPetBtn');
    const form = document.getElementById('addPetForm');
    const imageInput = document.getElementById('petImage');

    addPetBtn.addEventListener('click', () => {
        openPetModal();
    });

    closeBtn.addEventListener('click', closePetModal);
    cancelBtn.addEventListener('click', closePetModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePetModal();
    });

    form.addEventListener('submit', handlePetSubmit);

    // Image preview
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('imagePreview');
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Open Pet Modal
function openPetModal(petId = null) {
    const modal = document.getElementById('addPetModal');
    const form = document.getElementById('addPetForm');
    const title = document.getElementById('petModalTitle');

    if (petId) {
        title.textContent = 'Edit Pet';
        const pet = currentVendor.pets.find(p => p.id === petId);
        if (pet) {
            document.getElementById('petName').value = pet.name;
            document.getElementById('petBreed').value = pet.breed;
            document.getElementById('petAge').value = pet.age;
            document.getElementById('petGender').value = pet.gender;
            document.getElementById('petCategory').value = pet.category;
            document.getElementById('petPrice').value = pet.price;
            document.getElementById('petDescription').value = pet.description;
            document.getElementById('petVaccinated').checked = pet.vaccinated;

            if (pet.imageData) {
                document.getElementById('imagePreview').innerHTML = `<img src="${pet.imageData}" alt="Preview">`;
            }

            form.dataset.editId = petId;
        }
    } else {
        title.textContent = 'Add New Pet';
        form.reset();
        document.getElementById('imagePreview').innerHTML = '';
        delete form.dataset.editId;
    }

    modal.classList.add('active');
}

// Close Pet Modal
function closePetModal() {
    const modal = document.getElementById('addPetModal');
    modal.classList.remove('active');
}

// Handle Pet Submit
async function handlePetSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const editId = form.dataset.editId || null;

    const petData = {
        name: document.getElementById('petName').value,
        breed: document.getElementById('petBreed').value,
        age: document.getElementById('petAge').value,
        gender: document.getElementById('petGender').value,
        category: document.getElementById('petCategory').value,
        price: parseFloat(document.getElementById('petPrice').value),
        description: document.getElementById('petDescription').value,
        vaccinated: document.getElementById('petVaccinated').checked
    };

    // Handle image
    const imageFile = document.getElementById('petImage').files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            petData.imageData = e.target.result;
            await savePet(petData, editId);
        };
        reader.readAsDataURL(imageFile);
    } else {
        // If no new image is selected, but there was an existing one, keep it.
        // This assumes the API handles updating without imageData if not provided.
        // Or, if editing, we might need to explicitly pass the old imageData if it exists.
        // For simplicity, we'll assume the backend handles this or we're not clearing it.
        // If it's an edit and no new image, we might want to retain the old one.
        // For now, we'll just call savePet without imageData if no new file.
        await savePet(petData, editId);
    }
}

async function savePet(petData, editId) {
    try {
        let response;
        if (editId) {
            response = await PetsAPI.update(editId, petData);
            showNotification('Pet updated successfully!', 'success');
        } else {
            response = await PetsAPI.create(petData);
            showNotification('Pet added successfully!', 'success');
        }

        closePetModal();
        loadVendorData();
    } catch (error) {
        console.error('Error saving pet:', error);
        showNotification('Failed to save pet. Please try again.', 'error');
    }
}

// Edit Pet
function editPet(petId) {
    openPetModal(petId);
}

// Delete Pet
async function deletePet(petId) {
    if (!confirm('Are you sure you want to delete this pet?')) return;

    try {
        await PetsAPI.delete(petId);
        showNotification('Pet deleted successfully!', 'success');
        loadVendorData();
    } catch (error) {
        console.error('Error deleting pet:', error);
        showNotification('Failed to delete pet. Please try again.', 'error');
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
