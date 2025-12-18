# PetPal Backend API

Complete Node.js/Express backend with MongoDB for the PetPal pet-selling application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string

```bash
cp .env.example .env
```

4. **Edit `.env` file with your MongoDB connection**

For **Local MongoDB**:
```
MONGODB_URI=mongodb://localhost:27017/petpal
```

For **MongoDB Atlas** (Cloud):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/petpal
```

5. **Start the server**
```bash
npm run dev
```

The server will start on `http://localhost:5000`

---

## 📦 MongoDB Setup

### Option 1: Local MongoDB

1. **Download and install MongoDB**
   - Visit: https://www.mongodb.com/try/download/community
   - Install MongoDB Community Edition

2. **Start MongoDB service**
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

3. **Use connection string**
```
MONGODB_URI=mongodb://localhost:27017/petpal
```

### Option 2: MongoDB Atlas (Cloud - Free)

1. **Create account**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create cluster**
   - Click "Build a Database"
   - Choose FREE tier
   - Select region closest to you

3. **Create database user**
   - Go to Database Access
   - Add new database user
   - Save username and password

4. **Whitelist IP address**
   - Go to Network Access
   - Add IP Address
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)

5. **Get connection string**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/petpal
```

---

## 🔌 API Endpoints

### Authentication

#### Customer
- `POST /api/auth/customer/register` - Register new customer
- `POST /api/auth/customer/login` - Customer login

#### Vendor
- `POST /api/auth/vendor/register` - Register new vendor
- `POST /api/auth/vendor/login` - Vendor login

#### Doctor
- `POST /api/auth/doctor/register` - Register new doctor
- `POST /api/auth/doctor/login` - Doctor login

### Pets
- `GET /api/pets` - Get all pets
- `GET /api/pets/:id` - Get single pet
- `POST /api/pets` - Add new pet (vendor only)
- `PUT /api/pets/:id` - Update pet (vendor only)
- `DELETE /api/pets/:id` - Delete pet (vendor only)
- `GET /api/pets/vendor/my-pets` - Get vendor's pets (vendor only)

### Food
- `GET /api/food` - Get all food items
- `GET /api/food/:id` - Get single food item
- `POST /api/food` - Add new food (vendor only)
- `PUT /api/food/:id` - Update food (vendor only)
- `DELETE /api/food/:id` - Delete food (vendor only)

### Orders
- `GET /api/orders` - Get customer's orders (customer only)
- `GET /api/orders/:id` - Get single order (customer only)
- `POST /api/orders` - Create new order (customer only)
- `GET /api/orders/all/admin` - Get all orders (vendor only)

### Consultations
- `GET /api/doctors` - Get all doctors
- `GET /api/consultations` - Get customer's consultations (customer only)
- `POST /api/consultations` - Book consultation (customer only)
- `GET /api/consultations/doctor/my-consultations` - Get doctor's consultations (doctor only)
- `PUT /api/consultations/:id` - Update consultation (doctor only)

### Health Check
- `GET /api/health` - Check API status

---

## 🧪 Testing the API

### Using Postman or Thunder Client

1. **Register a customer**
```
POST http://localhost:5000/api/auth/customer/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "password123"
}
```

2. **Login**
```
POST http://localhost:5000/api/auth/customer/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response will include a `token`. Use this token for authenticated requests.

3. **Get all pets**
```
GET http://localhost:5000/api/pets
```

4. **Create order (requires authentication)**
```
POST http://localhost:5000/api/orders
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "items": [...],
  "shippingDetails": {...},
  "paymentMethod": "cod",
  "subtotal": 25000,
  "shipping": 99,
  "total": 25099
}
```

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── Customer.js          # Customer schema
│   ├── Vendor.js            # Vendor schema
│   ├── Pet.js               # Pet schema
│   ├── Food.js              # Food schema
│   ├── Doctor.js            # Doctor schema
│   ├── Order.js             # Order schema
│   └── Consultation.js      # Consultation schema
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── pets.js              # Pet routes
│   ├── food.js              # Food routes
│   ├── orders.js            # Order routes
│   └── consultations.js     # Consultation routes
├── middleware/
│   └── auth.js              # JWT authentication
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── server.js                # Main server file
└── README.md
```

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. After login/register, you'll receive a token. Include this token in the Authorization header for protected routes:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-restart)
npm run dev

# Run in production mode
npm start
```

---

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/petpal` |
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | Secret key for JWT | `your_secret_key` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- For Atlas, verify IP whitelist and credentials

### Port Already in Use
- Change PORT in `.env` file
- Or kill process using port 5000

### CORS Error
- Update `FRONTEND_URL` in `.env`
- Ensure frontend is running on correct port

---

## 📚 Next Steps

1. ✅ Install MongoDB (local or Atlas)
2. ✅ Configure `.env` file
3. ✅ Run `npm install`
4. ✅ Start server with `npm run dev`
5. ⏭️ Update frontend to use API endpoints
6. ⏭️ Test all functionality

---

## 🤝 Support

For issues or questions, check:
- MongoDB connection is active
- All environment variables are set
- Dependencies are installed
- Port 5000 is available

---

**Built with ❤️ for PetPal**
