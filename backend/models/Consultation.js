const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerPhone: {
        type: String,
        required: true
    },
    petName: String,
    petType: String,
    petAge: String,
    petBreed: String,
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    symptoms: {
        type: String,
        required: true
    },
    consultationType: {
        type: String,
        enum: ['online', 'clinic'],
        default: 'online'
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'confirmed', 'completed', 'cancelled']
    },
    fee: {
        type: Number,
        required: true
    },
    notes: {
        type: String
    },
    notified: {
        type: Boolean,
        default: true  // Automatically set to true when consultation is created
    },
    notificationRead: {
        type: Boolean,
        default: false  // Doctor hasn't read the notification yet
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Consultation', consultationSchema);
