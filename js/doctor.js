// ===================================
// Doctor Dashboard Logic
// ===================================

// Current logged-in doctor
let currentDoctor = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkDoctorAuth();
    setupAuthTabs();
    setupDoctorForms();
    setupProfile();
});

// Check if doctor is logged in
// Check if doctor is logged in
async function checkDoctorAuth() {
    const token = TokenManager.getToken();
    const loggedInDoctor = localStorage.getItem('currentDoctor');

    if (token && loggedInDoctor) {
        currentDoctor = JSON.parse(loggedInDoctor);
        showDashboard();
    } else {
        showAuth();
    }
}

// Show Auth Section
function showAuth() {
    document.getElementById('doctorAuth').style.display = 'block';
    document.getElementById('doctorDashboard').style.display = 'none';
}

// Show Dashboard
function showDashboard() {
    document.getElementById('doctorAuth').style.display = 'none';
    document.getElementById('doctorDashboard').style.display = 'block';

    if (currentDoctor) {
        document.getElementById('doctorName').textContent = 'Dr. ' + currentDoctor.name;
        loadDoctorData();
    }
}

// Setup Auth Tabs
function setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('doctorLoginForm');
    const registerForm = document.getElementById('doctorRegisterForm');

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

// Setup Doctor Forms
function setupDoctorForms() {
    const loginForm = document.getElementById('doctorLoginForm');
    const registerForm = document.getElementById('doctorRegisterForm');
    const logoutBtn = document.getElementById('doctorLogout');

    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', handleLogout);
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    console.log('=== DOCTOR LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password length:', password.length);

    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }

    const loginData = { email, password };
    console.log('Sending login data:', loginData);

    try {
        const response = await AuthAPI.doctorLogin(email, password);
        console.log('Login API response:', response);

        if (response && response.success && response.data) {
            console.log('Login successful, doctor data:', response.data);
            // Backend returns doctor data directly in response.data
            currentDoctor = {
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                phone: response.data.phone,
                specialization: response.data.specialization
            };
            localStorage.setItem('petpal_currentDoctor', JSON.stringify(currentDoctor));
            alert('Login successful!');
            showDashboard();
        } else {
            console.error('Login failed - response:', response);
            alert('Invalid email or password! Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error);
        console.error('Error details:', error.message);
        alert('Login failed: ' + (error.message || 'Please check your credentials'));
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const specialization = document.getElementById('regSpecialty').value;
    const qualification = document.getElementById('regQualification').value;
    const experience = document.getElementById('regExperience').value + ' years';
    const consultationFee = parseInt(document.getElementById('regFee').value);
    const clinicName = document.getElementById('regClinic').value;
    const clinicAddress = document.getElementById('regAddress').value;
    const password = document.getElementById('regPassword').value;

    try {
        const response = await AuthAPI.doctorRegister({
            name,
            email,
            phone,
            specialization,
            qualification,
            experience,
            consultationFee,
            clinicName,
            clinicAddress,
            password
        });

        if (response.success) {
            alert('Registration successful! Please login.');
            // Switch to login tab
            document.querySelector('[data-tab="login"]').click();
            e.target.reset();
        } else {
            alert('Registration failed: ' + (response.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Error during registration. Please try again.');
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('petpal_currentDoctor');
    currentDoctor = null;
    showNotification('Logged out successfully!', 'success');
    showAuth();
}

// Load Doctor Data
function loadDoctorData() {
    if (!currentDoctor) return;

    const doctors = JSON.parse(localStorage.getItem('petpal_doctors') || '[]');
    const doctor = doctors.find(d => d.id === currentDoctor.id);

    if (!doctor) return;

    currentDoctor = doctor;

    // Update stats
    document.getElementById('avgRating').textContent = doctor.averageRating.toFixed(1);
    document.getElementById('totalReviews').textContent = doctor.totalReviews;
    document.getElementById('totalConsultations').textContent = doctor.totalConsultations;

    // Render profile
    renderProfile(doctor);
    renderReviews(doctor.ratings || []);

    // Load consultations from API
    loadConsultations();
}

// Load Consultations
async function loadConsultations() {
    const consultationsList = document.getElementById('consultationsList');

    try {
        const response = await ConsultationsAPI.getDoctorConsultations();
        const consultations = response.data || [];

        if (consultations.length === 0) {
            consultationsList.innerHTML = '<p class="empty-message">No consultations yet. Customers will see you on the main page!</p>';
            return;
        }

        consultationsList.innerHTML = consultations.map(consultation => `
            <div class="consultation-card" style="background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #4CAF50;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 10px 0; color: #333;">
                            ${consultation.customerName}
                        </h3>
                        <p style="margin: 5px 0; color: #666;">
                            <strong>📱 Phone:</strong> ${consultation.customerPhone}
                        </p>
                        <p style="margin: 5px 0; color: #666;">
                            <strong>📧 Email:</strong> ${consultation.customerEmail}
                        </p>
                        <p style="margin: 5px 0; color: #666;">
                            <strong>🐾 Pet:</strong> ${consultation.petName} (${consultation.petType})
                        </p>
                        <p style="margin: 5px 0; color: #666;">
                            <strong>📅 Date:</strong> ${new Date(consultation.appointmentDate).toLocaleDateString()}
                        </p>
                        <p style="margin: 5px 0; color: #666;">
                            <strong>⏰ Time:</strong> ${consultation.appointmentTime}
                        </p>
                        <p style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                            <strong>Symptoms:</strong><br>
                            ${consultation.symptoms}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <span style="background: ${consultation.status === 'pending' ? '#ff9800' : '#4CAF50'}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px;">
                            ${consultation.status.toUpperCase()}
                        </span>
                        <p style="margin: 10px 0; font-size: 18px; font-weight: bold; color: #4CAF50;">
                            ₹${consultation.fee}
                        </p>
                    </div>
                </div>
            </div>
        `).join('');

        // Update total consultations count
        document.getElementById('totalConsultations').textContent = consultations.length;

    } catch (error) {
        console.error('Error loading consultations:', error);
        consultationsList.innerHTML = '<p class="empty-message">Error loading consultations. Please refresh the page.</p>';
    }
}

// Render Profile
function renderProfile(doctor) {
    const profileCard = document.getElementById('profileCard');

    profileCard.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                <span class="profile-icon">👨‍⚕️</span>
            </div>
            <div class="profile-details">
                <h3>Dr. ${doctor.name}</h3>
                <p class="profile-specialty">${doctor.specialty}</p>
                <p class="profile-qualification">${doctor.qualification}</p>
            </div>
        </div>
        <div class="profile-info">
            <div class="info-row">
                <span class="info-label">Experience:</span>
                <span class="info-value">${doctor.experience} years</span>
            </div>
            <div class="info-row">
                <span class="info-label">Consultation Fee:</span>
                <span class="info-value">₹${doctor.consultationFee}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Clinic:</span>
                <span class="info-value">${doctor.clinic}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${doctor.address}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">${doctor.phone}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Availability:</span>
                <span class="info-value">${doctor.availability}</span>
            </div>
            ${doctor.bio ? `
            <div class="info-row full-width">
                <span class="info-label">Bio:</span>
                <p class="doctor-bio">${doctor.bio}</p>
            </div>
            ` : ''}
        </div>
    `;
}

// Render Reviews
function renderReviews(ratings) {
    const reviewsList = document.getElementById('reviewsList');

    if (ratings.length === 0) {
        reviewsList.innerHTML = '<p class="empty-message">No reviews yet</p>';
        return;
    }

    reviewsList.innerHTML = ratings.map(rating => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-author">
                    <strong>${rating.customerName || 'Anonymous'}</strong>
                    <span class="review-date">${new Date(rating.date).toLocaleDateString()}</span>
                </div>
                <div class="review-rating">
                    ${'⭐'.repeat(rating.rating)}
                </div>
            </div>
            ${rating.review ? `<p class="review-text">${rating.review}</p>` : ''}
        </div>
    `).join('');
}

// Setup Profile Editing
function setupProfile() {
    const editBtn = document.getElementById('editProfileBtn');
    const modal = document.getElementById('editProfileModal');
    const closeBtn = document.getElementById('closeProfileModal');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const form = document.getElementById('editProfileForm');

    editBtn.addEventListener('click', openEditProfile);
    closeBtn.addEventListener('click', closeEditProfile);
    cancelBtn.addEventListener('click', closeEditProfile);
    form.addEventListener('submit', handleProfileEdit);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeEditProfile();
    });
}

function openEditProfile() {
    if (!currentDoctor) return;

    document.getElementById('editBio').value = currentDoctor.bio || '';
    document.getElementById('editFee').value = currentDoctor.consultationFee;
    document.getElementById('editAvailability').value = currentDoctor.availability;

    document.getElementById('editProfileModal').classList.add('active');
}

function closeEditProfile() {
    document.getElementById('editProfileModal').classList.remove('active');
}

function handleProfileEdit(e) {
    e.preventDefault();

    const bio = document.getElementById('editBio').value;
    const fee = parseInt(document.getElementById('editFee').value);
    const availability = document.getElementById('editAvailability').value;

    const doctors = JSON.parse(localStorage.getItem('petpal_doctors') || '[]');
    const doctorIndex = doctors.findIndex(d => d.id === currentDoctor.id);

    if (doctorIndex !== -1) {
        doctors[doctorIndex].bio = bio;
        doctors[doctorIndex].consultationFee = fee;
        doctors[doctorIndex].availability = availability;

        localStorage.setItem('petpal_doctors', JSON.stringify(doctors));
        currentDoctor = doctors[doctorIndex];
        localStorage.setItem('petpal_currentDoctor', JSON.stringify(currentDoctor));

        loadDoctorData();
        closeEditProfile();
        showNotification('Profile updated successfully!', 'success');
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
