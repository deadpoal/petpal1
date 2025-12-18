require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Doctor = require('./models/Doctor');
const Order = require('./models/Order');

async function checkArunRecords() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Search for customer named "Arun" or "arun"
        console.log('🔍 Searching for customer "Arun"...');
        const customers = await Customer.find({
            name: { $regex: /arun/i }
        });

        if (customers.length > 0) {
            console.log(`✅ Found ${customers.length} customer(s) with name containing "Arun":\n`);
            customers.forEach((customer, index) => {
                console.log(`Customer ${index + 1}:`);
                console.log(`  ID: ${customer._id}`);
                console.log(`  Name: ${customer.name}`);
                console.log(`  Email: ${customer.email}`);
                console.log(`  Phone: ${customer.phone || 'N/A'}`);
                console.log(`  Created: ${customer.createdAt}`);
                console.log('');
            });

            // Check orders for each Arun customer
            for (const customer of customers) {
                console.log(`📦 Checking orders for ${customer.name} (${customer._id})...`);
                const orders = await Order.find({ 'customer.id': customer._id });

                if (orders.length > 0) {
                    console.log(`✅ Found ${orders.length} order(s):`);
                    orders.forEach((order, index) => {
                        console.log(`  Order ${index + 1}:`);
                        console.log(`    Order ID: ${order.orderId}`);
                        console.log(`    Total: ₹${order.total}`);
                        console.log(`    Items: ${order.items.length}`);
                        console.log(`    Status: ${order.status}`);
                        console.log(`    Created: ${order.createdAt}`);
                    });
                } else {
                    console.log(`❌ No orders found for ${customer.name}`);
                }
                console.log('');
            }
        } else {
            console.log('❌ No customer found with name containing "Arun"\n');
        }

        // Search for doctor named "Arun" or "arun"
        console.log('🔍 Searching for doctor "Arun"...');
        const doctors = await Doctor.find({
            name: { $regex: /arun/i }
        });

        if (doctors.length > 0) {
            console.log(`✅ Found ${doctors.length} doctor(s) with name containing "Arun":\n`);
            doctors.forEach((doctor, index) => {
                console.log(`Doctor ${index + 1}:`);
                console.log(`  ID: ${doctor._id}`);
                console.log(`  Name: ${doctor.name}`);
                console.log(`  Email: ${doctor.email}`);
                console.log(`  Specialization: ${doctor.specialization}`);
                console.log(`  Experience: ${doctor.experience}`);
                console.log(`  Consultation Fee: ₹${doctor.consultationFee}`);
                console.log(`  Rating: ${doctor.rating || 0}`);
                console.log(`  Created: ${doctor.createdAt}`);
                console.log('');
            });
        } else {
            console.log('❌ No doctor found with name containing "Arun"\n');
        }

        // Show all customers
        console.log('📋 All Customers in Database:');
        const allCustomers = await Customer.find().select('name email createdAt');
        console.log(`Total: ${allCustomers.length}`);
        allCustomers.forEach((c, i) => {
            console.log(`  ${i + 1}. ${c.name} (${c.email}) - ${c.createdAt.toLocaleDateString()}`);
        });
        console.log('');

        // Show all doctors
        console.log('📋 All Doctors in Database:');
        const allDoctors = await Doctor.find().select('name email specialization createdAt');
        console.log(`Total: ${allDoctors.length}`);
        allDoctors.forEach((d, i) => {
            console.log(`  ${i + 1}. Dr. ${d.name} (${d.specialization}) - ${d.createdAt.toLocaleDateString()}`);
        });
        console.log('');

        // Show all orders
        console.log('📋 All Orders in Database:');
        const allOrders = await Order.find().select('orderId customer.name total createdAt');
        console.log(`Total: ${allOrders.length}`);
        allOrders.forEach((o, i) => {
            console.log(`  ${i + 1}. ${o.orderId} - ${o.customer.name} - ₹${o.total} - ${o.createdAt.toLocaleDateString()}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
    }
}

checkArunRecords();
