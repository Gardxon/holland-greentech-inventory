# 🚀 Deploy HGT System to Render.com

Complete guide to deploy your HGT Stock & Sales Management System with a professional domain.

---

## 📋 Prerequisites

- GitHub account (free)
- Render.com account (free)
- Your project pushed to GitHub

---

## ✅ Step 1: Push to GitHub

### If you haven't already:

1. Create a GitHub account (free at github.com)
2. Create a new repository named `hgt-stock-system`
3. Push your code:

```bash
cd "C:\Users\User\Desktop\INVETORY FILE AND SALES"
git remote add origin https://github.com/YOUR-USERNAME/hgt-stock-system.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

---

## 🔧 Step 2: Deploy Backend on Render

### 2.1 Connect GitHub to Render

1. Go to [render.com](https://render.com)
2. Sign up (free) or log in
3. Click **"New +"** → **"Web Service"**
4. Select **"GitHub"** → Authorize access
5. Find your `hgt-stock-system` repository
6. Click **"Connect"**

### 2.2 Configure Backend Service

**Settings:**
- **Name:** `hgt-stock-api`
- **Environment:** `Python 3`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Root Directory:** `stock_api` ← IMPORTANT

**Environment Variables:**
```
PYTHONUNBUFFERED=true
```

### 2.3 Deploy

Click **"Create Web Service"** and wait ~3-5 minutes.

**Your backend URL:** `https://hgt-stock-api.onrender.com` (or similar)

**Save this URL** - you'll need it for the frontend!

---

## 🎨 Step 3: Deploy Frontend on Render

### 3.1 Create Frontend Service

1. On Render Dashboard, click **"New +"** → **"Static Site"**
2. Select your GitHub repo again
3. Click **"Connect"**

### 3.2 Configure Frontend Service

**Settings:**
- **Name:** `hgt-stock-system`
- **Build Command:** `cd stock_frontend && npm install && npm run build`
- **Publish Directory:** `stock_frontend/dist`

**Environment Variables:**
```
VITE_API_URL=https://hgt-stock-api.onrender.com
```

(Replace with your actual backend URL from Step 2.3)

### 3.3 Deploy

Click **"Create Static Site"** and wait ~5 minutes.

**Your frontend URL:** `https://hgt-stock-system.onrender.com`

---

## 🌐 Step 4: Get a Custom Domain

### Option A: Free Subdomain (Easiest)
- Render automatically gives you `hgt-stock-system.onrender.com` ✅

### Option B: Custom Domain ($12/year)

1. Buy a domain at [Namecheap](https://namecheap.com) or [Google Domains](https://domains.google.com)
   - Example: `hgt-inventory.com`
   
2. On Render Dashboard (hgt-stock-system service):
   - Click **"Settings"** → **"Custom Domains"**
   - Enter your domain
   - Update your domain's DNS settings as shown

3. Wait 5-30 minutes for DNS to propagate

---

## ✨ Step 5: Test Your System

1. Open: `https://hgt-stock-system.onrender.com`
2. You should see your HGT dashboard
3. Test all features:
   - ✅ Sales recording
   - ✅ Inventory management
   - ✅ Dashboard statistics
   - ✅ All other features

---

## 🔄 Updating Your System

Whenever you make changes locally:

```bash
git add .
git commit -m "Update description"
git push origin main
```

Render will automatically:
1. Detect the change
2. Rebuild your services
3. Deploy the update

**No manual intervention needed!**

---

## 📊 Monitoring & Logs

### View Backend Logs
1. Render Dashboard → `hgt-stock-api`
2. Click **"Logs"** tab
3. See live output

### View Frontend Logs
1. Render Dashboard → `hgt-stock-system`
2. Click **"Logs"** tab
3. See build and deployment logs

---

## 💰 Costs

- **Backend:** FREE (up to 1GB disk, 512MB RAM)
- **Frontend:** FREE (10GB/month bandwidth)
- **Database:** FREE SQLite (included in backend)
- **Domain:** FREE with Render OR $12/year for custom

**Total:** Free-$12/year!

---

## 🆘 Troubleshooting

### "Failed to load statistics"
- Check backend URL in VITE_API_URL
- Make sure backend service is running (check Logs)
- Verify API endpoint: `https://your-backend-url/dashboard/stats`

### "Cannot connect to server"
- Wait 5 minutes for deployment to complete
- Check Render dashboard status (green = running)
- Verify GitHub repository is public

### Page loads but features don't work
- Open browser DevTools (F12)
- Check "Console" for error messages
- Verify VITE_API_URL matches your backend URL

### Want to use PostgreSQL instead of SQLite?
- Render offers free PostgreSQL 90 days
- Update connection string in `.env`
- Redeploy

---

## 📞 Support Links

- **Render Docs:** https://render.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **React Docs:** https://react.dev

---

## 🎯 Your Live System

**Frontend:** `https://hgt-stock-system.onrender.com`  
**Backend:** `https://hgt-stock-api.onrender.com`  
**Status:** Check Render Dashboard anytime

**Share these URLs with your team to access from anywhere!** 🚀

---

*Deployed with Render.com - Zero-downtime deployments*
