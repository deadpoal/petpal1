// Consultation Modal Functions
let currentDoctorId = null;
let currentDoctorName = '';
let currentConsultationFee = 0;

function openConsultationModal(doctorId, doctorName, fee) {
    console.log('openConsultationModal called', { doctorId, doctorName, fee });

    // Check if user is logged in
    const token = TokenManager.getToken();
    console.log('Token check:', token ? 'Token exists' : 'No token');

    if (!token) {
        console.log('User not logged in, redirecting to login page...');
        alert('Please login first to book a consultation');
        console.log('About to redirect to customer-login.html');
        setTimeout(() => {
            window.location.href = 'customer-login.html';
        }, 100);
        return;
    }

    console.log('User is logged in, opening modal...');
    currentDoctorId = doctorId;
    currentDoctorName = doctorName;
    currentConsultationFee = fee;

    document.getElementById('consultDoctorName').textContent = doctorName;
    document.getElementById('consultFee').textContent = fee;
    document.getElementById('consultationModal').classList.add('active');

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('consultDate');
    if (dateInput) {
        dateInput.setAttribute('min', today);
    }
}

// Setup consultation modal
function setupConsultationModal() {
    const modal = document.getElementById('consultationModal');
    const closeBtn = document.getElementById('closeConsultation');
    const cancelBtn = document.getElementById('cancelConsultation');
    const form = document.getElementById('consultationForm');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            form.reset();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            form.reset();
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                form.reset();
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('=== CONSULTATION FORM SUBMITTED ===');

            const customerData = localStorage.getItem('petpal_currentCustomer');
            console.log('1. Customer data from localStorage:', customerData);

            if (!customerData) {
                alert('Please login to book consultation');
                window.location.href = 'customer-login.html';
                return;
            }

            try {
                const customer = JSON.parse(customerData);
                console.log('2. Parsed customer object:', customer);

                const date = document.getElementById('consultDate').value;
                const time = document.getElementById('consultTime').value;
                const symptoms = document.getElementById('consultIssue').value;

                console.log('3. Form values - Date:', date, 'Time:', time, 'Symptoms:', symptoms);

                if (!date || !time || !symptoms) {
                    alert('Please fill in all required fields');
                    return;
                }

                const consultationData = {
                    doctor: currentDoctorId,
                    customer: {
                        id: customer.id || customer._id,
                        name: customer.name,
                        email: customer.email,
                        phone: customer.phone || '0000000000'
                    },
                    petDetails: {
                        name: 'My Pet',
                        type: 'Dog',
                        age: '2 years',
                        breed: 'Mixed'
                    },
                    appointmentDate: date,
                    appointmentTime: time,
                    symptoms: symptoms,
                    consultationType: 'online',
                    fee: currentConsultationFee
                };

                console.log('4. Consultation data to send:', JSON.stringify(consultationData, null, 2));
                console.log('5. Calling ConsultationsAPI.create...');

                const response = await ConsultationsAPI.create(consultationData);

                console.log('6. API Response received:', response);

                if (response.success) {
                    console.log('7. SUCCESS! Booking confirmed');
                    alert('Consultation booked successfully! Dr. ' + currentDoctorName + ' will contact you soon.');
                    modal.classList.remove('active');
                    form.reset();
                } else {
                    console.error('8. FAILED! Response:', response);
                    alert('Failed to book consultation: ' + (response.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('9. ERROR caught:', error);
                console.error('Error details:', error.message, error.stack);
                alert('Error booking consultation. Please try again.');
            }
        });
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupConsultationModal);
} else {
    setupConsultationModal();
}
