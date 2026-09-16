# Deploy HGT Stock & Sales System to Render

Complete guide to deploy your FastAPI backend + modern dashboard to Render (accessible to your team).

## What You'll Get

✅ Dashboard accessible at: `https://hgt-stock-system.onrender.com`  
✅ Real-time inventory management  
✅ Multi-branch support  
✅ Automatic backups  
✅ SSL/HTTPS security  
✅ Team access from anywhere  

---

## Prerequisites

- Render account (free): https://render.com
- PostgreSQL database (Render provides free tier)
- Your code on GitHub (recommended) or ready to push

---

## Step 1: Prepare Your Code for Deployment

### 1.1 Create/Update `.env.production`

Create a new file in your `stock_api` folder:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/stock_db

# API Settings
DEBUG=false
ENVIRONMENT=production

# CORS
ALLOWED_ORIGINS=["https://hgt-stock-system.onrender.com"]
```

### 1.2 Update `requirements.txt`

Make sure your `stock_api/requirements.txt` includes all dependencies. If missing, add:

```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-dotenv==1.0.0
pydantic==2.5.0
```

### 1.3 Verify Backend Structure

Your backend should have:
```
stock_api/
├── app/
│   ├── main.py           ✓ (FastAPI app)
│   ├── database.py       ✓ (Database config)
│   ├── models.py         ✓ (SQLAlchemy models)
│   └── routers/          ✓ (API endpoints)
├── requirements.txt      ✓ (Python dependencies)
└── .env                  ✓ (Environment variables)
```

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git (if not already done)

```powershell
cd "C:\Users\User\Desktop\INVETORY FILE AND SALES"
git init
git add .
git commit -m "Initial commit: Stock management system ready for deployment"
git branch -M main
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `hgt-stock-system`
3. Description: "Holland Greentech Inventory & Sales Management System"
4. Make it **Private** (security)
5. Click "Create repository"

### 2.3 Push to GitHub

```powershell
git remote add origin https://github.com/YOUR_USERNAME/hgt-stock-system.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

---

## Step 3: Set Up Render PostgreSQL Database

### 3.1 Create Free PostgreSQL Database

1. Go to https://render.com
2. Sign up (GitHub login is easiest)
3. Click **"New"** → **"PostgreSQL"**
4. Configure:
   - **Name:** `hgt-stock-db`
   - **Database:** `stock_db`
   - **User:** `stockuser`
   - **Region:** Choose closest to you (e.g., Frankfurt for Africa)
5. Click **"Create Database"**
6. Wait 2-3 minutes for database to be ready

### 3.2 Save Your Database Credentials

Once created, Render will show:
```
External Database URL: postgresql://stockuser:PASSWORD@HOST:5432/stock_db
```

**Copy the entire URL** - you'll need it next!

---

## Step 4: Deploy Backend to Render

### 4.1 Create New Web Service

1. Go to https://render.com dashboard
2. Click **"New"** → **"Web Service"**
3. Select **"Build and deploy from GitHub"**

### 4.2 Connect GitHub Repository

1. Click **"Connect"** next to your repository
2. Select `hgt-stock-system`
3. Click **"Connect"**

### 4.3 Configure Deployment

Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `hgt-stock-system` |
| **Environment** | `Python 3` |
| **Region** | Same as database (e.g., Frankfurt) |
| **Branch** | `main` |
| **Build Command** | `pip install -r stock_api/requirements.txt` |
| **Start Command** | `cd stock_api && uvicorn app.main:app --host 0.0.0.0 --port 8000` |

### 4.4 Add Environment Variables

1. Scroll down to **"Environment"** section
2. Click **"Add Environment Variable"**
3. Add these variables:

```
DATABASE_URL = postgresql://stockuser:PASSWORD@HOST:5432/stock_db
DEBUG = false
ENVIRONMENT = production
ALLOWED_ORIGINS = ["https://hgt-stock-system.onrender.com"]
```

Replace `PASSWORD` and `HOST` with your actual database credentials from Step 3.2

### 4.5 Deploy

1. Scroll to bottom
2. Click **"Create Web Service"**
3. Render will build and deploy automatically (takes 3-5 minutes)
4. You'll see build logs in real time
5. Once complete, you'll get a URL like: `https://hgt-stock-system.onrender.com`

---

## Step 5: Verify Deployment

### 5.1 Test API Health

Open in browser:
```
https://hgt-stock-system.onrender.com/health
```

You should see:
```json
{"status": "healthy"}
```

### 5.2 Test API Documentation

Open:
```
https://hgt-stock-system.onrender.com/docs
```

You should see the interactive Swagger API documentation.

### 5.3 Seed Initial Data

In browser, visit:
```
https://hgt-stock-system.onrender.com/seed-data
```

This creates initial branches and demo data in the database.

---

## Step 6: Access Your Dashboard

Your system is now live!

### **Dashboard URL:**
```
https://hgt-stock-system.onrender.com
```

### Share with Team

Send this link to your team members:
```
📲 HGT Stock Management System
🔗 https://hgt-stock-system.onrender.com

Access from:
✓ Desktop browsers
✓ Tablet
✓ Mobile phones
✓ Any internet connection
```

---

## Step 7: Configure Dashboard (Optional)

The dashboard from the artifact needs to connect to your API endpoints. Update these in the dashboard code:

### API Base URL
```javascript
const API_BASE_URL = "https://hgt-stock-system.onrender.com/api"
```

### Common Endpoints
```
GET  /branches              - List all branches
GET  /products              - List all products
POST /sales                 - Record a sale
GET  /inventory/branch/{id} - Get branch stock
GET  /dashboard/stats       - Dashboard statistics
```

---

## Step 8: Add Team Members

### For Basic Users (Read-Only)

1. Go to your dashboard
2. Create user account
3. Share dashboard link
4. They log in with credentials

### For Admin Access

1. Admin manages users in system
2. Assign roles (Staff, Manager, Admin)
3. Each role has different permissions

---

## Step 9: Database Backups

Render automatically backs up your PostgreSQL database:

✅ **Daily automatic backups** (free tier)  
✅ **7-day retention**  
✅ **One-click restore**  

To access backups:
1. Go to Render dashboard
2. Select your database
3. Navigate to **"Backups"** tab

---

## Step 10: Monitor Your System

### Check Deployment Status
1. Render dashboard → Select your service
2. View real-time logs
3. Monitor resource usage

### Health Check
Every day, visit:
```
https://hgt-stock-system.onrender.com/health
```

Should always return `{"status": "healthy"}`

---

## Troubleshooting

### Issue: "Service failed to deploy"
**Solution:**
1. Check build logs in Render
2. Verify Python dependencies in `requirements.txt`
3. Check DATABASE_URL is correct in environment variables

### Issue: "Cannot connect to database"
**Solution:**
1. Copy DATABASE_URL exactly from Render PostgreSQL dashboard
2. Make sure database has 2-3 minutes to initialize
3. Check all environment variables are set

### Issue: "500 error when accessing dashboard"
**Solution:**
1. Check API logs in Render
2. Verify CORS settings in `app/main.py`
3. Ensure all routers are imported in `main.py`

### Issue: "Dashboard not loading"
**Solution:**
1. Open browser DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests
4. Verify API_BASE_URL is correct

---

## Performance & Limits

**Render Free Tier:**
- ✅ Up to 2-3 concurrent requests
- ✅ PostgreSQL 256 MB storage
- ✅ 750 hours/month service runtime
- ✅ Auto-pause after 15 min inactivity

**If You Need More:**
- Upgrade to Pro ($7+/month)
- Unlimited concurrent requests
- More database storage
- No auto-pause

---

## Next Steps

### Today
- [ ] Push code to GitHub
- [ ] Create Render PostgreSQL database
- [ ] Deploy backend to Render
- [ ] Test API endpoints

### This Week
- [ ] Train team on dashboard
- [ ] Configure user accounts
- [ ] Set up branch access

### Next Week
- [ ] Monitor system performance
- [ ] Gather feedback
- [ ] Add additional features if needed

---

## Support URLs

| Service | URL |
|---------|-----|
| **Your App** | https://hgt-stock-system.onrender.com |
| **API Docs** | https://hgt-stock-system.onrender.com/docs |
| **Render Dashboard** | https://render.com/dashboard |
| **GitHub** | https://github.com/YOUR_USERNAME/hgt-stock-system |

---

## Important: First Time Setup

After deployment:

1. **Seed database:** Visit `/seed-data` endpoint
2. **Import your data:** Use your Excel migration script
3. **Create admin account:** First user automatically becomes admin
4. **Add team members:** Through dashboard user management

---

**🎉 Your team-accessible inventory system is live!**

Questions? Check the logs or contact support.

---

*Last updated: 2025-01-16*
*System: HGT Stock Management*
*Deployment: Render.com*
