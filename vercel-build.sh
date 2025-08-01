#!/bin/bash
echo "🔧 Building for Vercel..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Build frontend
echo "🏗️ Building frontend..."
npm run build

echo "✅ Build completed!" 