// ===================================
// Doctor/Vet Functions
// ===================================

let currentRatingDoctorId = null;

async function renderVets() {
    console.log('=== renderVets called ===');
    const vetsGrid = document.getElementById('vetsGrid');
    console.log('vetsGrid element:', vetsGrid);

    try {
        console.log('Fetching doctors from API...');
        const response = await ConsultationsAPI.getDoctors();
        console.log('API response:', response);
        const doctors = response.data || [];
        console.log('Doctors array:', doctors, 'Length:', doctors.length);

        if (doctors.length === 0) {
            vetsGrid.innerHTML = '<p style="text-align: center; color: var(--gray-600); padding: 2rem;">No veterinarians available yet. <a href="doctor-dashboard.html" style="color: var(--primary-color); font-weight: 600;">Join as a Doctor</a></p>';
            return;
        }

        vetsGrid.innerHTML = doctors.map(doctor => {
            const rating = doctor.rating || 0;
            const stars = '⭐'.repeat(Math.round(rating));
            const imageUrl = doctor.imageData || '';
            const imageStyle = imageUrl ? `style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"` : '';

            return `
            <div class="vet-card">
                <div class="vet-image" ${imageStyle}>
                    ${!imageUrl ? '<div style="background: var(--gradient-primary); height: 100%; display: flex; align-items: center; justify-content: center; font-size: 4rem;">👨‍⚕️</div>' : ''}
                </div>
                <div class="vet-info">
                    <h3 class="vet-name">Dr. ${doctor.name}</h3>
                    <p class="vet-specialty">${doctor.specialization}</p>
                    <p style="color: var(--gray-600); font-size: 0.9rem; margin: 0.5rem 0;">${doctor.qualification} | ${doctor.experience}</p>
                    <p style="color: var(--primary-color); font-weight: 600; margin: 0.5rem 0;">Consultation: ₹${doctor.consultationFee}</p>
                    <div class="vet-rating">
                        <span class="stars">${stars || '☆☆☆☆☆'}</span>
                        <span class="rating-text">${rating.toFixed(1)}</span>
                    </div>
                    <button class="btn-primary" onclick="openConsultationModal('${doctor._id}', '${doctor.name}', ${doctor.consultationFee})" style="margin-bottom: 0.5rem;">Book Consultation</button>
                </div>
            </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading doctors:', error);
        vetsGrid.innerHTML = '<p style="text-align: center; color: var(--gray-600); padding: 2rem;">Error loading doctors. Please try again later.</p>';
    }
}

function openRatingModal(doctorId) {
    const doctors = JSON.parse(localStorage.getItem('petpal_doctors') || '[]');
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    currentRatingDoctorId = doctorId;
    document.getElementById('ratingDoctorName').textContent = doctor.name;
    document.getElementById('ratingModal').classList.add('active');
    setupStarRating();
}

function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    const ratingValue = document.getElementById('ratingValue');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.dataset.rating;
            ratingValue.value = rating;

            stars.forEach(s => s.classList.remove('active'));
            for (let i = 0; i < rating; i++) {
                stars[i].classList.add('active');
                stars[i].textContent = '★';
            }
            for (let i = rating; i < 5; i++) {
                stars[i].textContent = '☆';
            }
        });
    });
}

function setupRatingModal() {
    const modal = document.getElementById('ratingModal');
    const closeBtn = document.getElementById('closeRating');
    const cancelBtn = document.getElementById('cancelRating');
    const form = document.getElementById('ratingForm');

    closeBtn.addEventListener('click', closeRatingModal);
    cancelBtn.addEventListener('click', closeRatingModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeRatingModal();
    });

    form.addEventListener('submit', submitRating);
}

function closeRatingModal() {
    document.getElementById('ratingModal').classList.remove('active');
    document.getElementById('ratingForm').reset();
    document.getElementById('ratingValue').value = '';
    document.querySelectorAll('.star').forEach(s => {
        s.classList.remove('active');
        s.textContent = '☆';
    });
    currentRatingDoctorId = null;
}

function submitRating(e) {
    e.preventDefault();

    const rating = parseInt(document.getElementById('ratingValue').value);
    const review = document.getElementById('ratingReview').value;

    if (!rating || rating < 1 || rating > 5) {
        showNotification('Please select a rating');
        return;
    }

    const currentCustomer = localStorage.getItem('petpal_currentCustomer');
    if (!currentCustomer) {
        showNotification('Please login to rate');
        return;
    }

    const customers = JSON.parse(localStorage.getItem('petpal_customers') || '[]');
    const customer = customers.find(c => c.id === currentCustomer);

    const newRating = {
        id: 'rating_' + Date.now(),
        customerId: currentCustomer,
        customerName: customer?.name || 'Anonymous',
        rating,
        review,
        date: new Date().toISOString()
    };

    const doctors = JSON.parse(localStorage.getItem('petpal_doctors') || '[]');
    const doctorIndex = doctors.findIndex(d => d.id === currentRatingDoctorId);

    if (doctorIndex !== -1) {
        if (!doctors[doctorIndex].ratings) doctors[doctorIndex].ratings = [];
        doctors[doctorIndex].ratings.push(newRating);

        const allRatings = doctors[doctorIndex].ratings;
        const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
        doctors[doctorIndex].averageRating = avgRating;
        doctors[doctorIndex].totalReviews = allRatings.length;
        doctors[doctorIndex].totalConsultations = (doctors[doctorIndex].totalConsultations || 0) + 1;

        localStorage.setItem('petpal_doctors', JSON.stringify(doctors));

        showNotification('Thank you for your rating!');
        closeRatingModal();
        renderVets();
    }
}
