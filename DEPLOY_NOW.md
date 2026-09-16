# ⚡ Deploy to Team in 15 Minutes

Follow these exact steps to make your system accessible to your team TODAY.

---

## Step 1: Push to GitHub (3 minutes)

### Open PowerShell and run:

```powershell
cd "C:\Users\User\Desktop\INVETORY FILE AND SALES"

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Stock system ready for team deployment"

# Create main branch
git branch -M main

# Go to https://github.com/new and create repo named: hgt-stock-system
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/hgt-stock-system.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

---

## Step 2: Create Render Account (2 minutes)

1. Go to https://render.com
2. Click **"Sign Up"**
3. Sign up with **GitHub** (fastest)
4. Done!

---

## Step 3: Create Database (3 minutes)

In Render dashboard:

1. Click **"New"** → **"PostgreSQL"**
2. Name: `hgt-stock-db`
3. Database: `stock_db`
4. User: `stockuser`
5. Click **"Create Database"**

**⏰ Wait 2-3 minutes for database to initialize**

When ready, Render shows:
```
postgresql://stockuser:PASSWORD@HOST:5432/stock_db
```

**Copy this entire line** ← You'll need it next

---

## Step 4: Deploy Backend (5 minutes)

In Render dashboard:

1. Click **"New"** → **"Web Service"**
2. Click **"Build and deploy from GitHub"**
3. Find and select `hgt-stock-system`
4. Click **"Connect"**

### Fill in deployment settings:

```
Name:           hgt-stock-system
Environment:    Python 3
Region:         (Same as database - usually Frankfurt)
Branch:         main
Build Command:  pip install -r stock_api/requirements.txt
Start Command:  cd stock_api && uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Add Environment Variables:

Click **"Add Environment Variable"** and paste:

```
DATABASE_URL = postgresql://stockuser:PASSWORD@HOST:5432/stock_db
DEBUG = false
ENVIRONMENT = production
```

(Replace PASSWORD and HOST from Step 3)

### Deploy!

Click **"Create Web Service"** and watch the build logs.

**⏰ Wait 3-5 minutes for deployment**

---

## Step 5: Test It Works (1 minute)

Once deployed, Render gives you a URL like:
```
https://hgt-stock-system.onrender.com
```

### Test the API:

Open in browser:
```
https://hgt-stock-system.onrender.com/health
```

Should see:
```json
{"status": "healthy"}
```

✅ **Your backend is live!**

---

## Step 6: Share with Team

Send this link to your team:

```
📲 HGT Stock Management System
🔗 https://hgt-stock-system.onrender.com

Available on:
✓ Desktop
✓ Tablet  
✓ Mobile
✓ Any browser with internet
```

---

## ✅ Done!

Your team can now access the system from anywhere. It's fully live and ready to use.

### Next Steps:

1. **Seed data:** Visit `https://hgt-stock-system.onrender.com/seed-data`
2. **Create users:** Through the dashboard
3. **Import your products:** Use your Excel migration script

---

## If Something Goes Wrong

### "Build failed" error
→ Check build logs in Render  
→ Verify Python dependencies in `stock_api/requirements.txt`

### "Cannot connect to database"
→ Double-check DATABASE_URL (especially PASSWORD and HOST)

### "Page not loading"
→ Wait 1-2 more minutes (Render can be slow to start)  
→ Refresh browser (Ctrl+F5)

---

## Detailed Guide

Full instructions: See `DEPLOYMENT_TO_RENDER.md`

---

**Questions?** Everything is in the docs. You've got this! 🚀**
