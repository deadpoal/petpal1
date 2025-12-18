require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const Customer = require('./models/Customer');
const Vendor = require('./models/Vendor');
const Doctor = require('./models/Doctor');
const Pet = require('./models/Pet');
const Food = require('./models/Food');
const Order = require('./models/Order');
const Consultation = require('./models/Consultation');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('✅ Connected to MongoDB');
    seedDatabase();
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

async function seedDatabase() {
    try {
        console.log('\n🌱 Starting database seeding...\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Customer.deleteMany({});
        await Vendor.deleteMany({});
        await Doctor.deleteMany({});
        await Pet.deleteMany({});
        await Food.deleteMany({});
        await Order.deleteMany({});
        await Consultation.deleteMany({});
        console.log('✅ Existing data cleared\n');

        // Create sample customers
        console.log('👥 Creating sample customers...');
        const customers = await Customer.create([
            {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '9876543210',
                password: 'password123'
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '9876543211',
                password: 'password123'
            },
            {
                name: 'Mike Johnson',
                email: 'mike@example.com',
                phone: '9876543212',
                password: 'password123'
            }
        ]);
        console.log(`✅ Created ${customers.length} customers\n`);

        // Create sample vendors
        console.log('🏪 Creating sample vendors...');
        const vendors = await Vendor.create([
            {
                businessName: 'Happy Paws Pet Store',
                ownerName: 'Robert Brown',
                email: 'happypaws@example.com',
                phone: '9876543220',
                address: '123 Pet Street, Mumbai',
                password: 'vendor123'
            },
            {
                businessName: 'Pet Paradise',
                ownerName: 'Sarah Wilson',
                email: 'petparadise@example.com',
                phone: '9876543221',
                address: '456 Animal Avenue, Delhi',
                password: 'vendor123'
            }
        ]);
        console.log(`✅ Created ${vendors.length} vendors\n`);

        // Create sample pets
        console.log('🐕 Creating sample pets...');
        const pets = await Pet.create([
            {
                name: 'Bruno',
                breed: 'Golden Retriever',
                age: '3 months',
                gender: 'Male',
                category: 'Dog',
                price: 25000,
                description: 'Friendly and playful Golden Retriever puppy. Vaccinated and healthy.',
                vaccinated: true,
                badge: 'Popular',
                vendor: vendors[0]._id,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0ZGQzEwNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdvbGRlbiBSZXRyaWV2ZXI8L3RleHQ+PC9zdmc+'
            },
            {
                name: 'Luna',
                breed: 'Persian Cat',
                age: '2 months',
                gender: 'Female',
                category: 'Cat',
                price: 15000,
                description: 'Beautiful Persian cat with long fur. Very gentle and loving.',
                vaccinated: true,
                badge: 'New',
                vendor: vendors[0]._id,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0U5MUU2MyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBlcnNpYW4gQ2F0PC90ZXh0Pjwvc3ZnPg=='
            },
            {
                name: 'Rocky',
                breed: 'German Shepherd',
                age: '4 months',
                gender: 'Male',
                category: 'Dog',
                price: 30000,
                description: 'Intelligent and loyal German Shepherd. Great for families.',
                vaccinated: true,
                badge: 'Featured',
                vendor: vendors[1]._id,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzNDM0IzRiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdlcm1hbiBTaGVwaGVyZDwvdGV4dD48L3N2Zz4='
            },
            {
                name: 'Milo',
                breed: 'Beagle',
                age: '3 months',
                gender: 'Male',
                category: 'Dog',
                price: 20000,
                description: 'Energetic Beagle puppy. Loves to play and explore.',
                vaccinated: true,
                badge: 'Popular',
                vendor: vendors[1]._id,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0ZGNkYwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJlYWdsZTwvdGV4dD48L3N2Zz4='
            },
            {
                name: 'Bella',
                breed: 'Siamese Cat',
                age: '2 months',
                gender: 'Female',
                category: 'Cat',
                price: 18000,
                description: 'Elegant Siamese cat with beautiful blue eyes.',
                vaccinated: true,
                badge: 'New',
                vendor: vendors[0]._id,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzlDMjdCMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNpYW1lc2UgQ2F0PC90ZXh0Pjwvc3ZnPg=='
            },
            {
                name: 'Max',
                breed: 'Labrador',
                age: '4 months',
                gender: 'Male',
                category: 'Dog',
                price: 22000,
                description: 'Friendly Labrador puppy. Perfect family companion.',
                vaccinated: true,
                badge: 'Featured',
                vendor: vendors[1]._id,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzRDQUY1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxhYnJhZG9yPC90ZXh0Pjwvc3ZnPg=='
            }
        ]);
        console.log(`✅ Created ${pets.length} pets\n`);

        // Update vendors with pet references
        await Vendor.findByIdAndUpdate(vendors[0]._id, {
            $push: { pets: { $each: [pets[0]._id, pets[1]._id, pets[4]._id] } }
        });
        await Vendor.findByIdAndUpdate(vendors[1]._id, {
            $push: { pets: { $each: [pets[2]._id, pets[3]._id, pets[5]._id] } }
        });

        // Create sample food items
        console.log('🍖 Creating sample food items...');
        const foodItems = await Food.create([
            {
                name: 'Premium Dog Food',
                description: 'Nutritious dry food for adult dogs with real chicken',
                price: 1299,
                category: 'dog',
                weight: '5kg',
                vendor: vendors[0]._id,
                vendorName: vendors[0].businessName,
                stock: 50,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0ZGOTgwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRvZyBGb29kPC90ZXh0Pjwvc3ZnPg=='
            },
            {
                name: 'Cat Treats Deluxe',
                description: 'Irresistible treats made with real fish',
                price: 499,
                category: 'cat',
                weight: '500g',
                vendor: vendors[0]._id,
                vendorName: vendors[0].businessName,
                stock: 100,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0U5MUU2MyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhdCBUcmVhdHM8L3RleHQ+PC9zdmc+'
            },
            {
                name: 'Puppy Growth Formula',
                description: 'Specially formulated for growing puppies with DHA',
                price: 1599,
                category: 'dog',
                weight: '3kg',
                vendor: vendors[1]._id,
                vendorName: vendors[1].businessName,
                stock: 30,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzRDQUY1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlB1cHB5IEZvb2Q8L3RleHQ+PC9zdmc+'
            },
            {
                name: 'Kitten Milk Replacer',
                description: 'Complete nutrition for kittens',
                price: 799,
                category: 'cat',
                weight: '1kg',
                vendor: vendors[1]._id,
                vendorName: vendors[1].businessName,
                stock: 40,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzlDMjdCMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPktpdHRlbiBNaWxrPC90ZXh0Pjwvc3ZnPg=='
            }
        ]);
        console.log(`✅ Created ${foodItems.length} food items\n`);

        // Update vendors with food references
        await Vendor.findByIdAndUpdate(vendors[0]._id, {
            $push: { foodItems: { $each: [foodItems[0]._id, foodItems[1]._id] } }
        });
        await Vendor.findByIdAndUpdate(vendors[1]._id, {
            $push: { foodItems: { $each: [foodItems[2]._id, foodItems[3]._id] } }
        });

        // Create sample doctors
        console.log('👨‍⚕️ Creating sample doctors...');
        const doctors = await Doctor.create([
            {
                name: 'Dr. Amit Sharma',
                email: 'amit.sharma@example.com',
                phone: '9876543230',
                password: 'doctor123',
                specialization: 'General Veterinary',
                experience: '10 years',
                qualification: 'BVSc & AH, MVSc',
                consultationFee: 500,
                rating: 4.8,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzIxOTZGMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRyLiBBbWl0PC90ZXh0Pjwvc3ZnPg=='
            },
            {
                name: 'Dr. Priya Patel',
                email: 'priya.patel@example.com',
                phone: '9876543231',
                password: 'doctor123',
                specialization: 'Pet Surgery',
                experience: '8 years',
                qualification: 'BVSc & AH, MS (Surgery)',
                consultationFee: 700,
                rating: 4.9,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0U5MUU2MyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRyLiBQcml5YTwvdGV4dD48L3N2Zz4='
            },
            {
                name: 'Dr. Rajesh Kumar',
                email: 'rajesh.kumar@example.com',
                phone: '9876543232',
                password: 'doctor123',
                specialization: 'Pet Dentistry',
                experience: '6 years',
                qualification: 'BVSc & AH',
                consultationFee: 600,
                rating: 4.7,
                imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzRDQUY1MCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjIwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRyLiBSYWplc2g8L3RleHQ+PC9zdmc+'
            }
        ]);
        console.log(`✅ Created ${doctors.length} doctors\n`);

        // Create sample order
        console.log('📦 Creating sample order...');
        const order = await Order.create({
            orderId: 'ORD' + Date.now(),
            customer: {
                id: customers[0]._id,
                name: customers[0].name,
                email: customers[0].email,
                phone: customers[0].phone,
                address: '123 Main Street',
                city: 'Mumbai',
                zipcode: '400001'
            },
            items: [
                {
                    id: pets[0]._id,
                    name: pets[0].name,
                    price: pets[0].price,
                    quantity: 1,
                    type: 'pet'
                },
                {
                    id: foodItems[0]._id,
                    name: foodItems[0].name,
                    price: foodItems[0].price,
                    quantity: 2,
                    type: 'food'
                }
            ],
            payment: {
                method: 'card',
                status: 'completed'
            },
            subtotal: 27598,
            shipping: 99,
            total: 27697,
            status: 'confirmed'
        });
        await Customer.findByIdAndUpdate(customers[0]._id, {
            $push: { orders: order._id }
        });
        console.log(`✅ Created 1 sample order\n`);

        // Create sample consultation
        console.log('🏥 Creating sample consultation...');
        const consultation = await Consultation.create({
            customer: {
                id: customers[1]._id,
                name: customers[1].name,
                email: customers[1].email,
                phone: customers[1].phone
            },
            doctor: doctors[0]._id,
            petDetails: {
                name: 'Buddy',
                type: 'Dog',
                age: '2 years',
                breed: 'Labrador'
            },
            appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            appointmentTime: '10:00 AM',
            symptoms: 'Regular checkup and vaccination',
            consultationType: 'clinic',
            status: 'confirmed',
            fee: doctors[0].consultationFee
        });
        await Doctor.findByIdAndUpdate(doctors[0]._id, {
            $push: { consultations: consultation._id }
        });
        console.log(`✅ Created 1 sample consultation\n`);

        console.log('🎉 Database seeding completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - ${customers.length} Customers`);
        console.log(`   - ${vendors.length} Vendors`);
        console.log(`   - ${pets.length} Pets`);
        console.log(`   - ${foodItems.length} Food Items`);
        console.log(`   - ${doctors.length} Doctors`);
        console.log(`   - 1 Order`);
        console.log(`   - 1 Consultation`);
        console.log('\n✨ You can now use these credentials to login:\n');
        console.log('Customer: john@example.com / password123');
        console.log('Vendor: happypaws@example.com / vendor123');
        console.log('Doctor: amit.sharma@example.com / doctor123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}
