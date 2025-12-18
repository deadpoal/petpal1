const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        zipcode: {
            type: String,
            required: true
        }
    },
    items: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        },
        type: {
            type: String,
            enum: ['pet', 'food'],
            required: true
        }
    }],
    payment: {
        method: {
            type: String,
            required: true,
            enum: ['card', 'upi', 'netbanking', 'cod']
        },
        status: {
            type: String,
            default: 'pending',
            enum: ['pending', 'completed', 'failed']
        }
    },
    subtotal: {
        type: Number,
        required: true
    },
    shipping: {
        type: Number,
        default: 99
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'processing',
        enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
