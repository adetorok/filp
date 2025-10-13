#!/bin/bash

# HomeFlip Production Setup Script
echo "🚀 Setting up HomeFlip for production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..

# Set environment variables
echo "🔧 Setting up environment variables..."
export DATABASE_URL="postgresql://neondb_owner:npg_kALSD8qsTYW0@ep-rapid-butterfly-adkzncnw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
export NODE_ENV=production
export PORT=5000
export JWT_SECRET="homeflip_super_secret_jwt_key_2024_production_secure_random_string_12345"
export REACT_APP_API_URL="http://localhost:5000"
export FRONTEND_URL="http://localhost:3000"
export SENTRY_DSN_BACKEND="https://bc9fd595b3761684158e312f0e7a023d@o4510179879092224.ingest.us.sentry.io/4510179922214913"
export SENTRY_DSN_FRONTEND="https://bc9fd595b3761684158e312f0e7a023d@o4510179879092224.ingest.us.sentry.io/4510179922214913"

# Apply DB schema (production-safe way)
echo "🗄️ Applying database schema..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

echo "✅ Setup complete! You can now run:"
echo "   Backend: npm start"
echo "   Frontend: cd client && npm start"
