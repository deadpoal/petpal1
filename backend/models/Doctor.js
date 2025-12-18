const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    specialization: {
        type: String,
        required: [true, 'Please provide specialization'],
        trim: true
    },
    experience: {
        type: String,
        trim: true
    },
    qualification: {
        type: String,
        trim: true
    },
    consultationFee: {
        type: Number,
        required: [true, 'Please provide consultation fee'],
        min: 0
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
    },
    imageData: {
        type: String // Base64 image data
    },
    availability: {
        type: Boolean,
        default: true
    },
    consultations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation'
    }],
    whatsappApiKey: {
        type: String,
        default: '',
        select: false  // Don't include in regular queries for security
    },
    whatsappEnabled: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
doctorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
doctorSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);
