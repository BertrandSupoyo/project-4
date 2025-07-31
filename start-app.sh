#!/bin/bash

# Script untuk menjalankan aplikasi Monitoring Gardu Distribusi dengan Database

echo "🚀 Starting Monitoring Gardu Distribusi Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# App Configuration
VITE_APP_NAME="Monitoring Gardu Distribusi"
VITE_APP_VERSION=1.0.0

# Feature flags
VITE_ENABLE_REALTIME_UPDATES=true
VITE_ENABLE_EXPORT=true

# Timeout configurations
VITE_API_TIMEOUT=10000
VITE_REFRESH_INTERVAL=30000
EOF
    echo "✅ .env file created"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Check if server directory exists
if [ ! -d "server" ]; then
    echo "❌ Server directory not found. Please make sure you have the complete project structure."
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install
cd ..

# Start backend server in background
echo "🔧 Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
echo "⏳ Waiting for backend server to start..."
sleep 3

# Check if backend is running
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend server is running on http://localhost:3001"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend application
echo "🌐 Starting frontend application..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Check if frontend is running
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend application is running on http://localhost:5173"
else
    echo "❌ Frontend application failed to start"
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 Application is running successfully!"
echo ""
echo "📊 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3001/api"
echo "📋 API Health Check: http://localhost:3001/api/health"
echo ""
echo "Press Ctrl+C to stop the application"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping application..."
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    echo "✅ Application stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait 