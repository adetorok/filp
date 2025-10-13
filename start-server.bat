@echo off
set DATABASE_URL=postgresql://neondb_owner:npg_kALSD8qsTYW0@ep-rapid-butterfly-adkzncnw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
set JWT_SECRET=your_super_secure_jwt_secret_here_change_this_in_production
set NODE_ENV=development
set PORT=5000
set FRONTEND_URL=http://localhost:3000

echo Starting HomeFlip Server...
echo Database: Connected to Neon PostgreSQL
echo Port: 5000
echo Environment: Development
echo.

node server/index.js
