const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/orders
// @desc    Get customer's orders
// @access  Private (Customer only)
router.get('/', protect, authorize('customer'), async (req, res) => {
    try {
        const orders = await Order.find({ 'customer.id': req.user._id })
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private (Customer only)
router.get('/:id', protect, authorize('customer'), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Make sure customer owns the order
        if (order.customer.id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Customer only)
router.post('/', protect, authorize('customer'), async (req, res) => {
    try {
        const { items, shippingDetails, paymentMethod, subtotal, shipping, total } = req.body;

        // Generate order ID
        const orderId = 'ORD' + Date.now();

        // Create order
        const order = await Order.create({
            orderId,
            customer: {
                id: req.user._id,
                name: shippingDetails.name,
                email: req.user.email,
                phone: shippingDetails.phone,
                address: shippingDetails.address,
                city: shippingDetails.city,
                zipcode: shippingDetails.zipcode
            },
            items,
            payment: {
                method: paymentMethod,
                status: paymentMethod === 'cod' ? 'pending' : 'completed'
            },
            subtotal,
            shipping,
            total
        });

        // Add order to customer's orders array
        await Customer.findByIdAndUpdate(req.user._id, {
            $push: { orders: order._id }
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/orders/all/admin
// @desc    Get all orders (for admin/vendor)
// @access  Private (Vendor only)
router.get('/all/admin', protect, authorize('vendor'), async (req, res) => {
    try {
        const orders = await Order.find().sort('-createdAt');

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
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
