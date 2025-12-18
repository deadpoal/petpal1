@echo off
echo Creating .env file for PetPal Backend...
echo.

(
echo MONGODB_URI=mongodb+srv://nagasubbareddybhavanam:Subbareddy%%401432@cluster0.s3wqjxz.mongodb.net/petpal?retryWrites=true^&w=majority
echo PORT=5000
echo JWT_SECRET=petpal_jwt_secret_key_2025_secure_token_bhavanam
echo FRONTEND_URL=http://localhost:3000
) > .env

echo .env file created successfully!
echo.
echo Configuration:
type .env
echo.
echo.
echo Starting backend server...
echo.
node server.js
