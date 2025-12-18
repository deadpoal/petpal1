const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const Vendor = require('../models/Vendor');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/food
// @desc    Get all food items
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const query = { isAvailable: true };

        if (category) {
            query.category = category;
        }

        const foodItems = await Food.find(query)
            .populate('vendor', 'businessName')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: foodItems.length,
            data: foodItems
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/food/:id
// @desc    Get single food item
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const food = await Food.findById(req.params.id).populate('vendor', 'businessName phone');

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: food
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/food
// @desc    Add new food item
// @access  Private (Vendor only)
router.post('/', protect, authorize('vendor'), async (req, res) => {
    try {
        const { name, description, price, category, weight, imageData, stock } = req.body;

        // Create food item
        const food = await Food.create({
            name,
            description,
            price,
            category,
            weight,
            imageData,
            stock,
            vendor: req.user._id,
            vendorName: req.user.businessName
        });

        // Add food to vendor's foodItems array
        await Vendor.findByIdAndUpdate(req.user._id, {
            $push: { foodItems: food._id }
        });

        res.status(201).json({
            success: true,
            message: 'Food item added successfully',
            data: food
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/food/:id
// @desc    Update food item
// @access  Private (Vendor only)
router.put('/:id', protect, authorize('vendor'), async (req, res) => {
    try {
        let food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        // Make sure vendor owns the food item
        if (food.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this food item'
            });
        }

        food = await Food.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Food item updated successfully',
            data: food
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/food/:id
// @desc    Delete food item
// @access  Private (Vendor only)
router.delete('/:id', protect, authorize('vendor'), async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found'
            });
        }

        // Make sure vendor owns the food item
        if (food.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this food item'
            });
        }

        await food.deleteOne();

        // Remove food from vendor's foodItems array
        await Vendor.findByIdAndUpdate(req.user._id, {
            $pull: { foodItems: food._id }
        });

        res.status(200).json({
            success: true,
            message: 'Food item deleted successfully',
            data: {}
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
