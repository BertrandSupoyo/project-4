#!/bin/bash
echo "🔧 Building for Vercel..."

# Generate Prisma client with Vercel's recommended command
echo "📦 Generating Prisma client..."
npx prisma generate --no-engine

# Build frontend
echo "🏗️ Building frontend..."
npm run build

echo "✅ Build completed!" 