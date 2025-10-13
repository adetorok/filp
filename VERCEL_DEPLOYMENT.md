# 🚀 Vercel Deployment Guide for HomeFlip

## 📋 **Project Information:**
- **Vercel Project ID**: `prj_KfIyKuGlmJO5pVHeo0xbCUDsfpnk`
- **GitHub Repository**: `https://github.com/adetorok/filp.git`
- **Framework**: Express.js + React

## 🔧 **Environment Variables to Set in Vercel:**

### **Required Variables:**
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_kALSD8qsTYW0@ep-rapid-butterfly-adkzncnw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=homeflip_super_secret_jwt_key_2024_production_secure_random_string_12345
```

### **Frontend Variables (React):**
```bash
REACT_APP_API_URL=https://omo-sena.vercel.app
REACT_APP_SENTRY_DSN=https://bc9fd595b3761684158e312f0e7a023d@o4510179879092224.ingest.us.sentry.io/4510179922214913
```

### **Backend Variables:**
```bash
SENTRY_DSN_BACKEND=https://bc9fd595b3761684158e312f0e7a023d@o4510179879092224.ingest.us.sentry.io/4510179922214913
FRONTEND_URL=https://omo-sena.vercel.app
```

## 🚀 **Deployment Steps:**

### **1. Connect to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link --project=prj_KfIyKuGlmJO5pVHeo0xbCUDsfpnk
```

### **2. Set Environment Variables:**
In Vercel Dashboard → Settings → Environment Variables, add all the variables above.

### **3. Deploy:**
```bash
# Deploy to production
vercel --prod

# Or push to GitHub (if connected)
git add .
git commit -m "Ready for Vercel deployment"
git push origin master
```

## 📁 **Build Configuration:**
- **Build Command**: `npm ci && npx prisma generate && npx prisma migrate deploy && cd client && npm ci && npm run build && cd ..`
- **Output Directory**: `client/build`
- **Start Command**: `node server/index.js` (automatic)

## 🔍 **After Deployment:**

1. **Get your Vercel domain** (e.g., `omo-sena.vercel.app`)
2. **Update `REACT_APP_API_URL`** with your actual domain
3. **Update `FRONTEND_URL`** with your actual domain
4. **Redeploy** to apply the updated URLs

## ✅ **Your Vercel Configuration is Ready!**

The `vercel.json` file is configured with your project ID and will handle:
- ✅ Database migrations
- ✅ Prisma client generation
- ✅ React app building
- ✅ API routing
- ✅ Static file serving

Ready to deploy! 🎉
