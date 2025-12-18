const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a food name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'Please provide category'],
        enum: ['dog', 'cat', 'bird', 'other'],
        lowercase: true
    },
    weight: {
        type: String,
        trim: true
    },
    imageData: {
        type: String // Base64 image data
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    vendorName: {
        type: String,
        trim: true
    },
    stock: {
        type: Number,
        default: 100,
        min: 0
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

module.exports = mongoose.model('Food', foodSchema);
