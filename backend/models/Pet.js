const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a pet name'],
        trim: true
    },
    breed: {
        type: String,
        required: [true, 'Please provide a breed'],
        trim: true
    },
    age: {
        type: String,
        required: [true, 'Please provide age'],
        trim: true
    },
    gender: {
        type: String,
        required: [true, 'Please provide gender'],
        enum: ['Male', 'Female']
    },
    category: {
        type: String,
        required: [true, 'Please provide category'],
        enum: ['Dog', 'Cat', 'Bird', 'Other']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    vaccinated: {
        type: Boolean,
        default: false
    },
    imageData: {
        type: String // Base64 image data
    },
    badge: {
        type: String,
        enum: ['New', 'Popular', 'Featured', ''],
        default: 'New'
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pet', petSchema);
