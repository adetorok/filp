#!/bin/bash

# HomeFlip Build Script for Vercel
echo "🚀 Building HomeFlip application..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..

# Build React app
echo "🏗️ Building React app..."
cd client && npm run build && cd ..

# Copy build files to root for Vercel
echo "📁 Copying build files..."
cp -r client/build ./build

echo "✅ Build complete!"
