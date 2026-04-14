#!/bin/bash

# Quick Setup Script for Virtual Website Backend with OTP Auth

echo "=================================="
echo "Virtual Website - Backend Setup"
echo "OTP Authentication Enabled"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

echo "✅ Node.js is installed: $(node -v)"

# Check if MongoDB is running
if ! nc -z localhost 27017 2>/dev/null; then
    echo "⚠️  WARNING: MongoDB is not running on localhost:27017"
    echo "   Make sure to start MongoDB before running the server"
    echo "   On Windows: mongod"
    echo "   On Mac: brew services start mongodb-community"
    echo "   On Linux: sudo systemctl start mongod"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/virtual
JWT_SECRET=super_secret_jwt_key
JWT_REFRESH_SECRET=super_secret_refresh_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5174
NODE_ENV=development

# Supabase Configuration for OTP Authentication
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
EOF
    echo "✅ .env file created"
fi

echo ""
echo "=================================="
echo "Setup Complete!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo "1. Get Supabase credentials (Optional but recommended):"
echo "   - Go to https://supabase.com"
echo "   - Create a new project"
echo "   - Get API URL and Anon Key from Settings → API"
echo "   - Update .env with your credentials"
echo ""
echo "2. Make sure MongoDB is running"
echo ""
echo "3. Start the server:"
echo "   npm run dev"
echo ""
echo "4. API will be available at: http://localhost:5000"
echo "   Health check: http://localhost:5000/api/health"
echo ""
echo "📚 Documentation: See AUTHENTICATION_SETUP.md for detailed API docs"
echo ""
