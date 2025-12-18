// Quick script to create a test doctor account
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Doctor = require('./models/Doctor');

async function createTestDoctor() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if doctor already exists
        const existing = await Doctor.findOne({ email: 'testdoc@test.com' });
        if (existing) {
            console.log('⚠️  Doctor testdoc@test.com already exists!');
            console.log('Email:', existing.email);
            console.log('Name:', existing.name);
            console.log('\nYou can login with:');
            console.log('Email: testdoc@test.com');
            console.log('Password: test123');
            process.exit(0);
        }

        // Create new doctor
        const doctor = await Doctor.create({
            name: 'Test Doctor',
            email: 'testdoc@test.com',
            phone: '+919876543210',
            password: 'test123',
            specialization: 'General Practice',
            qualification: 'BVSc, MVSc',
            experience: '5 years',
            consultationFee: 500,
            availability: true
        });

        console.log('\n✅ Test doctor created successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:    testdoc@test.com');
        console.log('Password: test123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🌐 Login at: file:///c:/Users/Subbareddybhavanam/Desktop/pet-frontend-backend/doctor-dashboard.html');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createTestDoctor();
