#!/bin/bash

# Virtual Platform - Quick Start Script (Mac/Linux)
# This script helps you set up and run the Virtual Platform

echo ""
echo "====================================="
echo "Virtual Platform - Quick Start"
echo "====================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    echo ""
    exit 1
fi

echo "[✓] Node.js is installed: $(node --version)"
echo ""

# Check if MongoDB is accessible
if command -v mongod &> /dev/null; then
    echo "[✓] MongoDB is installed: $(mongod --version)"
else
    echo "[!] MongoDB not found locally"
    echo "You can use MongoDB Atlas (cloud) instead"
fi

echo ""
echo "====================================="
echo "Installation Steps"
echo "====================================="
echo ""

# Navigate to backend folder
cd backend || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing NPM dependencies..."
    echo "This may take a few minutes..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: npm install failed!"
        cd ..
        exit 1
    fi
    echo "[✓] Dependencies installed successfully"
else
    echo "[✓] Dependencies already installed"
fi

echo ""
echo "====================================="
echo "Configuration"
echo "====================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Virtual Platform Configuration
PORT=5000
NODE_ENV=development

# MongoDB - Choose one:
# For local: mongodb://localhost:27017/virtual-platform
# For Atlas: mongodb+srv://username:password@cluster.mongodb.net/virtual-platform
MONGODB_URI=mongodb://localhost:27017/virtual-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Password Hashing
BCRYPT_ROUNDS=10
EOF
    echo "[✓] .env file created"
    echo ""
    echo "IMPORTANT: Edit the .env file with your MongoDB connection string!"
    echo ""
else
    echo "[✓] .env file already exists"
fi

echo ""
echo "====================================="
echo "Starting Virtual Platform"
echo "====================================="
echo ""

echo "To run the application:"
echo ""
echo "Option 1 - Production Mode:"
echo "   npm start"
echo ""
echo "Option 2 - Development Mode (with auto-reload):"
echo "   npm run dev"
echo ""

# Prompt user if they want to start now
read -p "Would you like to start the server now? (y/n): " startNow

if [[ "$startNow" == "y" || "$startNow" == "Y" ]]; then
    echo ""
    echo "Starting server..."
    echo "Remember: MongoDB must be running!"
    echo ""
    sleep 2
    
    npm start
else
    echo ""
    echo "Setup complete!"
    echo ""
    echo "To start the server later:"
    echo "   cd backend"
    echo "   npm start"
    echo ""
    echo "Then open: http://localhost:5000"
    echo ""
    cd ..
fi
