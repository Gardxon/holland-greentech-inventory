# Holland Greentech Inventory System - Deployment Guide

Complete step-by-step instructions to deploy your inventory management system to the cloud with automatic backups.

## Prerequisites

- Google account (for Gmail/authentication)
- GitHub account (optional, but recommended for easier deployment)
- Node.js 18+ installed locally

## Step 1: Set Up Supabase (Database & Auth)

Supabase provides free PostgreSQL database with automatic daily backups.

### 1.1 Create Supabase Account

1. Visit https://supabase.com
2. Click "Sign Up" → Sign in with Google
3. Create a new organization
4. Create a new project:
   - Project name: `holland-greentech`
   - Database password: `CreateASecurePassword123!` (save this!)
   - Region: Choose closest to your location
   - Click "Create new project" (takes ~5 minutes)

### 1.2 Create Database Tables

Once your project is ready:

1. Go to **SQL Editor** on the left sidebar
2. Click **"New Query"** and paste the following SQL:

```sql
-- Users profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0,
  cost_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  location TEXT NOT NULL,
  supplier TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sales table
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stock movements table
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read products"
  ON products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read sales"
  ON sales FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read stock movements"
  ON stock_movements FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read user profiles"
  ON user_profiles FOR SELECT
  USING (auth.role() = 'authenticated');
```

3. Click **"Run"** to execute
4. You should see the tables created successfully

### 1.3 Get Your Supabase Keys

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
3. Save these in a safe place (you'll need them next)

## Step 2: Set Up Vercel (Hosting)

Vercel is the easiest way to deploy Next.js apps. They have a free tier.

### 2.1 Prepare Your Project

1. Open PowerShell and navigate to your project:
```powershell
cd "C:\Users\User\Desktop\INVETORY FILE AND SALES"
```

2. Create a GitHub repository (optional but recommended):
   - Go to https://github.com/new
   - Repository name: `holland-greentech-inventory`
   - Click "Create repository"

3. Push code to GitHub:
```powershell
git init
git add .
git commit -m "Initial inventory system commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/holland-greentech-inventory.git
git push -u origin main
```

### 2.2 Deploy to Vercel

**Option A: Deploy from GitHub (Recommended)**

1. Visit https://vercel.com
2. Sign up with GitHub (if not already done)
3. Click **"New Project"**
4. Select your `holland-greentech-inventory` repository
5. Click **"Import"**
6. Configure environment variables:
   - Click **"Environment Variables"**
   - Add two variables:
     - **Name:** `NEXT_PUBLIC_SUPABASE_URL` → **Value:** Your Supabase Project URL
     - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **Value:** Your Supabase anon key
7. Click **"Deploy"**
8. Wait 2-3 minutes for deployment to complete
9. You'll get a live URL like `https://holland-greentech-inventory.vercel.app`

**Option B: Deploy from CLI**

1. Install Vercel CLI:
```powershell
npm install -g vercel
```

2. Deploy:
```powershell
vercel
```

3. Follow the prompts and add your Supabase keys when asked

## Step 3: Create Admin Account

### 3.1 Initial Setup

1. Go to your live URL: `https://your-project.vercel.app`
2. Click **"Sign Up"**
3. Enter admin email: `kawahaule@gmail.com`
4. Set a strong password
5. Click **"Sign Up"**
6. Check email for confirmation link (may take 1-2 minutes)
7. Confirm your email

### 3.2 Set Admin Role

Go back to Supabase:

1. Navigate to **SQL Editor**
2. Create new query to set admin role:

```sql
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'kawahaule@gmail.com';
```

3. Click **"Run"**

## Step 4: Add Sample Data (Optional)

To test your system with sample products:

1. Log in to your app as admin
2. Go to **Products** → **+ Add Product**
3. Add sample products:

**Example Product 1:**
- Name: Solar Panel 500W
- SKU: SP-500
- Quantity: 50
- Cost Price: 150,000
- Selling Price: 250,000
- Location: Warehouse A
- Supplier: Global Solar Corp

**Example Product 2:**
- Name: Battery Pack 100Ah
- SKU: BP-100
- Quantity: 25
- Cost Price: 120,000
- Selling Price: 180,000
- Location: Warehouse B
- Supplier: Energy Solutions Ltd

## Step 5: Automatic Backups

Supabase provides:
- ✅ **Daily automatic backups** (stored for 7 days)
- ✅ **Point-in-time recovery**
- ✅ **Backup restoration**

To access backups:
1. Go to Supabase Dashboard
2. Navigate to **Settings** → **Backups**
3. You'll see all automatic daily backups
4. Click any backup to restore if needed

## Step 6: Add More Users

### For Admin:

1. Log in as admin
2. Go to **Users** → **+ Add User**
3. Enter staff member email and password
4. Select role (Staff or Admin)
5. Click **"Create User"**
6. Staff member will receive confirmation email

### For Users:

If a user doesn't receive an email, they can:
1. Go to login page
2. Click **"Don't have an account? Sign Up"**
3. Create their own account
4. Admin can then change their role to "Admin" if needed

## Step 7: Custom Domain (Optional)

To use your own domain (e.g., inventory.hollandgreentech.com):

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration steps
4. Takes ~5 minutes to activate

## Troubleshooting

### Issue: "Cannot connect to database"
- Check that both Supabase keys are correct in Vercel environment variables
- Verify Supabase project is active

### Issue: "Email not received"
- Check spam/junk folder
- Manually set role in Supabase SQL Editor

### Issue: "Page not loading"
- Clear browser cache (Ctrl+Shift+Delete)
- Check Vercel deployment logs

### Issue: "Products not saving"
- Make sure you're logged in as admin
- Check that tables were created successfully in Supabase

## Features Quick Reference

### Admin Dashboard
- View inventory statistics
- Manage all products
- Manage users and roles
- Access all reports

### Staff Dashboard
- Record sales
- Update stock levels
- View current inventory
- Generate reports

### Security Features
- Email authentication
- Role-based access control
- Row-level security in database
- HTTPS encryption

## Important URLs

- **App URL:** Your Vercel deployment link
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Database Backups:** Supabase → Settings → Backups

## Support & Maintenance

### Regular Backups Check
- Weekly: Visit Supabase backups page to verify backups exist

### Monitor Usage
- Vercel: Free tier supports up to 10M requests/month
- Supabase: Free tier supports up to 500MB database

### Update Admin Email
Contact support or modify in Supabase user_profiles table

## Video Tutorials (Optional)

- Supabase Setup: https://www.youtube.com/watch?v=vyJU9efvMgA
- Vercel Deployment: https://www.youtube.com/watch?v=gJZwUUhIu8U

---

**Deployment complete! Your system is now live and accessible from anywhere with internet connection. 🎉**

Admin Email: kawahaule@gmail.com
System Features: Products, Sales, Stock Tracking, Reports, Multi-user Management
Automatic Backups: Daily via Supabase
