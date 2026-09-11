# Getting Started - Holland Greentech Inventory System

Welcome! This guide will help you get your inventory system up and running in 30 minutes.

## 📋 What You'll Need

1. **Google Account** - For signing up to cloud services
2. **GitHub Account** (optional) - For easier deployment
3. **Internet Connection** - To access cloud services
4. **Your admin email** - `kawahaule@gmail.com` (already configured)

## ⏱️ Timeline

- **Step 1-2:** Database setup (5 minutes)
- **Step 3:** Deploy to cloud (10 minutes)
- **Step 4:** Create admin account (5 minutes)
- **Step 5:** Add sample data (10 minutes)
- **Total:** ~30 minutes

## 🎯 Step 1: Create Supabase Account (Database)

Supabase is where your data will be stored with automatic daily backups.

### 1.1 Sign Up
1. Visit: https://supabase.com
2. Click "Start your project"
3. Click "Sign up with Google"
4. Select your Google account or create new Gmail
5. Click "Allow" to proceed

### 1.2 Create New Project
1. Click "New Project" or "Create a project"
2. **Organization name**: Holland Greentech
3. **Project name**: `holland-greentech-inventory`
4. **Database password**: Create a strong password like `SecurePass2024!Gth` (save this somewhere!)
5. **Region**: Select your closest region (Europe/Africa)
6. Click "Create new project"
7. Wait 5 minutes for setup...

### 1.3 Create Tables
Once ready:

1. Click **"SQL Editor"** in left sidebar
2. Click **"New Query"**
3. Copy this entire SQL code:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  movement_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read products"
  ON products FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read sales"
  ON sales FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read stock movements"
  ON stock_movements FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read user profiles"
  ON user_profiles FOR SELECT USING (auth.role() = 'authenticated');
```

4. Paste into the query box
5. Click **"Run"** (top right)
6. You should see: "Success. Rows affected: 1"

### 1.4 Save Your Keys
1. Click **"Settings"** (gear icon) in left sidebar
2. Click **"API"**
3. Find and **COPY**:
   - **Project URL** (starts with `https://...supabase.co`)
   - **Anon Public** key (long string starting with `eyJ...`)

**Save these in a text file! You'll need them in 10 minutes.**

---

## 🚀 Step 2: Deploy to Vercel (Hosting)

Vercel is where your website will live (anyone can access from anywhere).

### 2.1 Prepare Files
1. Open PowerShell on your computer
2. Navigate to project folder:
```powershell
cd "C:\Users\User\Desktop\INVETORY FILE AND SALES"
```

3. Initialize Git (if not done):
```powershell
git init
```

### 2.2 Sign Up to GitHub (Optional but Recommended)
If you don't have GitHub:
1. Visit https://github.com/signup
2. Create account with email
3. Verify email

### 2.3 Push Code to GitHub
1. In PowerShell, run:
```powershell
git config user.email "kawahaule@gmail.com"
git config user.name "Holland Greentech Admin"
git add .
git commit -m "Holland Greentech Inventory System"
```

2. Visit https://github.com/new
3. **Repository name**: `holland-greentech-inventory`
4. **Public** (so Vercel can access)
5. Click "Create repository"

3. Copy the command shown (looks like `git remote add origin...`)
4. Paste into PowerShell:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/holland-greentech-inventory.git
git branch -M main
git push -u origin main
```

### 2.4 Deploy on Vercel
1. Visit https://vercel.com
2. Click "Sign Up"
3. Click "Continue with GitHub"
4. Click "Authorize vercel"
5. Click "Create Team" or "Continue"
6. Click "Add New..." → "Project"
7. **Find your repository**: `holland-greentech-inventory`
8. Click "Import"
9. **Important**: Add Environment Variables:
   - Click "Environment Variables"
   - Add Variable #1:
     - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
     - **Value**: Paste your Supabase Project URL
     - Click "Add"
   - Add Variable #2:
     - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value**: Paste your Supabase Anon Key
     - Click "Add"
10. Click **"Deploy"**
11. Wait 2-3 minutes... (you'll see building progress)
12. When done, click **"Visit"** to open your live app!

🎉 **Your URL is now live!** Looks like: `https://holland-greentech-inventory.vercel.app`

---

## 👤 Step 3: Create Admin Account

### 3.1 Sign Up
1. Open your live app URL
2. Click **"Don't have an account? Sign Up"**
3. Enter:
   - **Email**: `kawahaule@gmail.com`
   - **Password**: Create strong password (save it!)
   - Click **"Sign Up"**
4. You'll see: "Sign up successful! Please check your email"

### 3.2 Confirm Email
1. Check Gmail inbox for email from Supabase
2. Click the confirmation link
3. You'll be directed back to app
4. Try to login with your email and password

### 3.3 Set Admin Role
Go back to Supabase:
1. Click **"SQL Editor"**
2. Click **"New Query"**
3. Paste this:
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'kawahaule@gmail.com';
```
4. Click **"Run"**

Now log out and log back in - you should see **Admin** badge!

---

## 📦 Step 4: Add Sample Products

### 4.1 Add First Product
1. Click **"Products"** in left menu
2. Click **"+ Add Product"**
3. Fill in (example):
   - **Product Name**: Solar Panel 500W
   - **SKU**: SP-500
   - **Quantity**: 50
   - **Cost Price**: 150000
   - **Selling Price**: 250000
   - **Location**: Warehouse A
   - **Supplier**: Global Solar
   - Click **"Add Product"**

### 4.2 Add More Products
Repeat for other products:

**Product 2 - Battery Pack**
- Name: Battery Pack 100Ah
- SKU: BP-100
- Quantity: 25
- Cost Price: 120000
- Selling Price: 180000
- Location: Warehouse B
- Supplier: Energy Solutions

**Product 3 - LED Lights**
- Name: LED Bulb 20W
- SKU: LED-20
- Quantity: 100
- Cost Price: 15000
- Selling Price: 30000
- Location: Warehouse A
- Supplier: Eco Lighting Ltd

---

## 💰 Step 5: Record Your First Sale

### 5.1 Create Sale
1. Click **"Sales"** in menu
2. Click **"+ Record Sale"**
3. Select:
   - **Product**: Solar Panel 500W
   - **Quantity**: 5
   - **Unit Price**: 250000 (auto-filled)
4. Click **"Record Sale"**

✅ **Success!** Stock automatically reduced to 45!

### 5.2 Record Stock Movement
1. Click **"Stock Movements"** in menu
2. Click **"+ Record Movement"**
3. Select:
   - **Product**: Battery Pack 100Ah
   - **Type**: Stock In (new delivery)
   - **Quantity**: 10
   - **Notes**: Received from Energy Solutions
4. Click **"Record Movement"**

✅ **Success!** Stock increased to 35!

---

## 📊 Step 6: View Reports

1. Click **"Reports"** in menu
2. You'll see:
   - **Total Products**: 3
   - **Total Stock**: 160
   - **Low Stock Items**: 0
   - **Total Sales**: 1

3. Click **"Sales Report"** to see:
   - Total Sales: 1
   - Total Revenue: 1,250,000 TZS
   - Top Products

---

## 👥 Step 7: Add Staff Members

### Create New Staff Account
1. Click **"Users"** (admin only)
2. Click **"+ Add User"**
3. Enter:
   - **Email**: `staff1@hollandgreentech.com`
   - **Password**: `Staff@123`
   - **Role**: Staff
   - Click **"Create User"**

✅ **Staff user created!** They can now login and record sales.

---

## 🎓 What's Next?

### Daily Tasks
- **Morning**: Check Dashboard for low stock alerts
- **Throughout day**: Record sales in **Sales**
- **Afternoon**: Update stock movements if received deliveries
- **Before close**: Generate reports in **Reports**

### Weekly Tasks
- Review sales trends
- Check stock levels
- Update product information if needed

### Monthly Tasks
- Generate monthly sales report
- Review profit margins
- Check backups are working (Supabase → Settings → Backups)

---

## 🆘 Quick Troubleshooting

### Can't Login?
- Check email spelling
- Verify email confirmation was done
- Try password reset on login page

### Products Won't Save?
- Make sure you're logged in as Admin
- Check all required fields are filled
- Try again

### Can't Access App?
- Check internet connection
- Try clearing browser cache (Ctrl+Shift+Delete)
- Use different browser if needed

### Need Help?
- Check README.md for more details
- See DEPLOYMENT_GUIDE.md for technical info
- Contact Supabase support: https://supabase.com/support
- Contact Vercel support: https://vercel.com/support

---

## 🔒 Important Security Notes

✅ **Keep these safe:**
- Admin password
- Supabase database password
- API keys (already in Vercel)

❌ **Never share:**
- Your passwords with anyone
- API keys in emails or messages
- Admin account access

✅ **Do these:**
- Check backups weekly
- Change password every 3 months
- Keep email account secure

---

## 📞 Support

**Your System is Now Live!** 🎉

- **Admin Email**: kawahaule@gmail.com
- **App URL**: https://holland-greentech-inventory.vercel.app
- **Database**: Supabase (Daily backups active)
- **Hosting**: Vercel (Always online)

**Access it from:**
- Any computer with internet
- Tablets
- Smartphones (responsive design)
- Different locations
- Staff members' devices

---

**Next Steps:**
1. Add your complete product list
2. Invite staff members to the system
3. Start recording daily sales
4. Monitor reports weekly
5. Enjoy automated inventory management! ✨

Questions? Refer to README.md or DEPLOYMENT_GUIDE.md for detailed technical information.
