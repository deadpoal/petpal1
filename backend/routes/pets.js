const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const Vendor = require('../models/Vendor');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/pets
// @desc    Get all pets
// @access  Public
router.get('/', async (req, res) => {
    try {
        const pets = await Pet.find({ isAvailable: true })
            .populate('vendor', 'businessName')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: pets.length,
            data: pets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   GET /api/pets/:id
// @desc    Get single pet
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id).populate('vendor', 'businessName phone');

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        res.status(200).json({
            success: true,
            data: pet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/pets
// @desc    Add new pet
// @access  Private (Vendor only)
router.post('/', protect, authorize('vendor'), async (req, res) => {
    try {
        const { name, breed, age, gender, category, price, description, vaccinated, imageData, badge } = req.body;

        // Create pet
        const pet = await Pet.create({
            name,
            breed,
            age,
            gender,
            category,
            price,
            description,
            vaccinated,
            imageData,
            badge,
            vendor: req.user._id
        });

        // Add pet to vendor's pets array
        await Vendor.findByIdAndUpdate(req.user._id, {
            $push: { pets: pet._id }
        });

        res.status(201).json({
            success: true,
            message: 'Pet added successfully',
            data: pet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/pets/:id
// @desc    Update pet
// @access  Private (Vendor only)
router.put('/:id', protect, authorize('vendor'), async (req, res) => {
    try {
        let pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        // Make sure vendor owns the pet
        if (pet.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this pet'
            });
        }

        pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            message: 'Pet updated successfully',
            data: pet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   DELETE /api/pets/:id
// @desc    Delete pet
// @access  Private (Vendor only)
router.delete('/:id', protect, authorize('vendor'), async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);

        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        // Make sure vendor owns the pet
        if (pet.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this pet'
            });
        }

        await pet.deleteOne();

        // Remove pet from vendor's pets array
        await Vendor.findByIdAndUpdate(req.user._id, {
            $pull: { pets: pet._id }
        });

        res.status(200).json({
            success: true,
            message: 'Pet deleted successfully',
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

// @route   GET /api/pets/vendor/my-pets
// @desc    Get vendor's pets
// @access  Private (Vendor only)
router.get('/vendor/my-pets', protect, authorize('vendor'), async (req, res) => {
    try {
        const pets = await Pet.find({ vendor: req.user._id }).sort('-createdAt');

        res.status(200).json({
            success: true,
            count: pets.length,
            data: pets
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
