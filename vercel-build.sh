#!/bin/bash

echo "🚀 Starting Vercel build process..."

# Navigate to server directory
cd server

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Check if Prisma Client was generated successfully
if [ -f "node_modules/@prisma/client/index.js" ]; then
    echo "✅ Prisma Client generated successfully"
else
    echo "❌ Prisma Client generation failed"
    exit 1
fi

echo "✅ Build process completed successfully" 