const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const Doctor = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public
router.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find({ availability: true })
            .select('-password')
            .sort('-rating');

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/consultations
// @desc    Get customer's consultations
// @access  Private (Customer only)
router.get('/', protect, authorize('customer'), async (req, res) => {
    try {
        const consultations = await Consultation.find({ 'customer.id': req.user._id })
            .populate('doctor', 'name specialization consultationFee')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: consultations.length,
            data: consultations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/consultations
// @desc    Book a consultation
// @access  Private (Customer only)
router.post('/', protect, authorize('customer'), async (req, res) => {
    try {
        console.log('=== CREATING CONSULTATION ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const { doctor, customer, petDetails, appointmentDate, appointmentTime, symptoms, consultationType, fee } = req.body;

        // Validate required fields
        if (!doctor || !customer || !appointmentDate || !appointmentTime || !symptoms) {
            console.error('Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if doctor exists
        const doctorExists = await Doctor.findById(doctor);
        if (!doctorExists) {
            console.error('Doctor not found with ID:', doctor);
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Create consultation with FLAT structure
        const consultationData = {
            doctor: doctor,
            customerId: customer.id,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            petName: petDetails?.name || 'My Pet',
            petType: petDetails?.type || 'Dog',
            petAge: petDetails?.age || '2 years',
            petBreed: petDetails?.breed || 'Mixed',
            appointmentDate: new Date(appointmentDate),
            appointmentTime: appointmentTime,
            symptoms: symptoms,
            consultationType: consultationType || 'online',
            fee: fee || 500,
            status: 'pending'
        };

        console.log('Consultation data to save:', JSON.stringify(consultationData, null, 2));

        const consultation = new Consultation(consultationData);
        await consultation.save();

        console.log('✅ Consultation saved successfully:', consultation._id);

        // Add consultation to doctor's list
        doctorExists.consultations.push(consultation._id);
        await doctorExists.save();

        // 📱 Send WhatsApp notification if enabled
        try {
            // Get doctor with WhatsApp fields
            const doctorWithWhatsApp = await Doctor.findById(doctor).select('+whatsappApiKey');

            if (doctorWithWhatsApp && doctorWithWhatsApp.whatsappEnabled) {
                const whatsappService = require('../services/whatsapp-free.service');
                console.log(`📱 Attempting to send WhatsApp to Dr. ${doctorWithWhatsApp.name}...`);

                // Send WhatsApp (don't wait for it, send async)
                whatsappService.sendConsultationNotification(doctorWithWhatsApp, consultation)
                    .then(result => {
                        if (result.success) {
                            console.log(`✅ WhatsApp notification sent to Dr. ${doctorWithWhatsApp.name}`);
                        }
                    })
                    .catch(err => {
                        console.error(`❌ WhatsApp notification failed:`, err.message);
                    });
            } else {
                console.log(`⏭️  WhatsApp notifications not enabled for Dr. ${doctorExists.name}`);
            }
        } catch (whatsappError) {
            // Don't fail the consultation if WhatsApp fails
            console.error('WhatsApp notification error (non-critical):', whatsappError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Consultation booked successfully',
            data: consultation
        });
    } catch (error) {
        console.error('=== ERROR CREATING CONSULTATION ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating consultation'
        });
    }
});

// @route   GET /api/consultations/doctor/my-consultations
// @desc    Get doctor's consultations
// @access  Private (Doctor only)
router.get('/doctor/my-consultations', protect, authorize('doctor'), async (req, res) => {
    try {
        const consultations = await Consultation.find({ doctor: req.user._id })
            .sort('-appointmentDate');

        res.status(200).json({
            success: true,
            count: consultations.length,
            data: consultations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/consultations/:id
// @desc    Update consultation status
// @access  Private (Doctor only)
router.put('/:id', protect, authorize('doctor'), async (req, res) => {
    try {
        let consultation = await Consultation.findById(req.params.id);

        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: 'Consultation not found'
            });
        }

        // Make sure doctor owns the consultation
        if (consultation.doctor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this consultation'
            });
        }

        consultation = await Consultation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Consultation updated successfully',
            data: consultation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/consultations/doctor/notifications
// @desc    Get doctor's unread notifications
// @access  Private (Doctor only)
router.get('/doctor/notifications', protect, authorize('doctor'), async (req, res) => {
    try {
        const notifications = await Consultation.find({
            doctor: req.user._id,
            notificationRead: false
        })
            .sort('-createdAt')
            .limit(20);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/consultations/doctor/notifications/:id/read
// @desc    Mark notification as read
// @access  Private (Doctor only)
router.put('/doctor/notifications/:id/read', protect, authorize('doctor'), async (req, res) => {
    try {
        const consultation = await Consultation.findOneAndUpdate(
            {
                _id: req.params.id,
                doctor: req.user._id
            },
            { notificationRead: true },
            { new: true }
        );

        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: consultation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/consultations/doctor/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private (Doctor only)
router.put('/doctor/notifications/mark-all-read', protect, authorize('doctor'), async (req, res) => {
    try {
        await Consultation.updateMany(
            {
                doctor: req.user._id,
                notificationRead: false
            },
            { notificationRead: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
