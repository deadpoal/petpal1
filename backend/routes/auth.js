const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const Doctor = require('../models/Doctor');
const { generateToken, protect, authorize } = require('../middleware/auth');

// @route   POST /api/auth/customer/register
// @desc    Register a new customer
// @access  Public
router.post('/customer/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create customer
        const customer = await Customer.create({
            name,
            email,
            phone,
            password
        });

        // Generate token
        const token = generateToken(customer._id, 'customer');

        res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            data: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/auth/customer/login
// @desc    Login customer
// @access  Public
router.post('/customer/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for customer
        const customer = await Customer.findOne({ email }).select('+password');
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await customer.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(customer._id, 'customer');

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                id: customer._id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/auth/vendor/register
// @desc    Register a new vendor
// @access  Public
router.post('/vendor/register', async (req, res) => {
    try {
        const { businessName, ownerName, email, phone, address, password } = req.body;

        // Check if vendor already exists
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create vendor
        const vendor = await Vendor.create({
            businessName,
            ownerName,
            email,
            phone,
            address,
            password
        });

        // Generate token
        const token = generateToken(vendor._id, 'vendor');

        res.status(201).json({
            success: true,
            message: 'Vendor registered successfully',
            data: {
                id: vendor._id,
                businessName: vendor.businessName,
                ownerName: vendor.ownerName,
                email: vendor.email,
                phone: vendor.phone,
                address: vendor.address,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/auth/vendor/login
// @desc    Login vendor
// @access  Public
router.post('/vendor/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for vendor
        const vendor = await Vendor.findOne({ email }).select('+password');
        if (!vendor) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await vendor.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(vendor._id, 'vendor');

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                id: vendor._id,
                businessName: vendor.businessName,
                ownerName: vendor.ownerName,
                email: vendor.email,
                phone: vendor.phone,
                address: vendor.address,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/auth/doctor/register
// @desc    Register a new doctor
// @access  Public
router.post('/doctor/register', async (req, res) => {
    try {
        const { name, email, phone, password, specialization, experience, qualification, consultationFee } = req.body;

        // Check if doctor already exists
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create doctor
        const doctor = await Doctor.create({
            name,
            email,
            phone,
            password,
            specialization,
            experience,
            qualification,
            consultationFee
        });

        // Generate token
        const token = generateToken(doctor._id, 'doctor');

        res.status(201).json({
            success: true,
            message: 'Doctor registered successfully',
            data: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                specialization: doctor.specialization,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   POST /api/auth/doctor/login
// @desc    Login doctor
// @access  Public
router.post('/doctor/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check for doctor
        const doctor = await Doctor.findOne({ email }).select('+password');
        if (!doctor) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await doctor.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(doctor._id, 'doctor');

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                specialization: doctor.specialization,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// @route   PUT /api/auth/doctor/whatsapp-settings
// @desc    Update doctor's WhatsApp notification settings
// @access  Private (Doctor only)
router.put('/doctor/whatsapp-settings', protect, authorize('doctor'), async (req, res) => {
    try {
        const { whatsappApiKey, whatsappEnabled } = req.body;

        const doctor = await Doctor.findById(req.user._id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Update WhatsApp settings
        if (whatsappApiKey !== undefined) {
            doctor.whatsappApiKey = whatsappApiKey;
        }
        if (whatsappEnabled !== undefined) {
            doctor.whatsappEnabled = whatsappEnabled;
        }

        await doctor.save();

        res.status(200).json({
            success: true,
            message: 'WhatsApp settings updated successfully',
            data: {
                whatsappEnabled: doctor.whatsappEnabled
            }
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
