# 🚀 Render Deployment Guide for HomeFlip

## 📋 **Render Configuration**

### **Service Type**: Web Service
### **Environment**: Node.js
### **Plan**: Free (or Starter for production)

## 🔧 **Build & Start Commands for Render:**

### **Build Command:**
```bash
npm ci && npx prisma generate && npx prisma migrate deploy && cd client && npm ci && npm run build && cd ..
```

### **Start Command:**
```bash
node server/index.js
```

## 🌐 **Environment Variables for Render:**

### **Required Variables:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_kALSD8qsTYW0@ep-rapid-butterfly-adkzncnw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=homeflip_super_secret_jwt_key_2024_production_secure_random_string_12345
```

### **Frontend Variables (React):**
```bash
REACT_APP_API_URL=https://homeflip-api.onrender.com
REACT_APP_SENTRY_DSN=https://bc9fd595b3761684158e312f0e7a023d@o4510179879092224.ingest.us.sentry.io/4510179922214913
```

### **Backend Variables:**
```bash
SENTRY_DSN_BACKEND=https://bc9fd595b3761684158e312f0e7a023d@o4510179879092224.ingest.us.sentry.io/4510179922214913
FRONTEND_URL=https://homeflip-api.onrender.com
```

## 🚀 **Deployment Steps:**

### **1. Connect GitHub Repository:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select repository: `adetorok/filp`

### **2. Configure Service:**
- **Name**: `homeflip-api`
- **Environment**: `Node`
- **Region**: `Oregon (US West)`
- **Branch**: `master`
- **Root Directory**: Leave empty (root)

### **3. Build & Deploy:**
- **Build Command**: `npm ci && npx prisma generate && npx prisma migrate deploy && cd client && npm ci && npm run build && cd ..`
- **Start Command**: `node server/index.js`

### **4. Set Environment Variables:**
Add all the environment variables listed above in the Render dashboard.

### **5. Deploy:**
Click "Create Web Service" and Render will:
- Clone your repository
- Install dependencies
- Run database migrations
- Build the React app
- Start the server

## 📁 **Files Created:**
- ✅ `render.yaml` - Render configuration file
- ✅ `RENDER_DEPLOYMENT.md` - Complete deployment guide

## 🔍 **After Deployment:**
1. **Get your Render URL** (e.g., `https://homeflip-api.onrender.com`)
2. **Update `REACT_APP_API_URL`** with your actual Render URL
3. **Update `FRONTEND_URL`** with your actual Render URL
4. **Redeploy** to apply the updated URLs

## ✅ **Your Render Configuration is Ready!**

The `render.yaml` file will automatically configure your deployment with:
- ✅ Database setup
- ✅ Prisma migrations
- ✅ React app building
- ✅ Environment variables
- ✅ Auto-deploy from GitHub

Ready to deploy to Render! 🎉
