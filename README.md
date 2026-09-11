# Holland Greentech Inventory Management System

A professional, cloud-based inventory management system designed for Holland Greentech TZ with multi-user support, real-time stock tracking, sales recording, and comprehensive analytics.

## ✨ Features

### Core Functionality
- 📦 **Product Management** - Add, edit, track products with cost/selling prices
- 💰 **Sales Tracking** - Record sales and automatically update inventory
- 📈 **Stock Movements** - Log all inventory changes (in, out, adjustments)
- 📊 **Reports & Analytics** - Generate detailed inventory and sales reports
- 👥 **Multi-User System** - Admin and Staff roles with different permissions
- 🔐 **Secure Authentication** - Email-based login with role-based access control

### Data Tracking
- Product name and SKU
- Current stock quantity
- Cost and selling prices
- Location and supplier information
- Complete sales history
- Stock movement audit trail

### Admin Features
- User management (create, edit, delete users)
- Role assignment (Admin/Staff)
- Full system access
- User activity management

### Staff Features
- Record sales transactions
- Update stock levels
- View inventory and reports
- Cannot delete products or manage users

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Git (optional)

### 1. Install Dependencies

```bash
cd "C:\Users\User\Desktop\INVETORY FILE AND SALES"
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from Supabase dashboard (see DEPLOYMENT_GUIDE.md)

### 3. Run Local Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser

## 📚 Project Structure

```
├── pages/
│   ├── _app.tsx              # App wrapper with auth
│   ├── _document.tsx         # HTML document setup
│   ├── index.tsx             # Login page
│   ├── dashboard.tsx         # Main dashboard
│   ├── products.tsx          # Product management
│   ├── sales.tsx             # Sales recording
│   ├── stock.tsx             # Stock movements
│   ├── reports.tsx           # Reports & analytics
│   └── users.tsx             # User management (admin only)
├── components/
│   └── Layout.tsx            # Sidebar navigation and layout
├── lib/
│   └── supabase.ts          # Supabase client configuration
├── styles/
│   └── globals.css          # Tailwind CSS and custom styles
├── public/                   # Static assets
└── package.json             # Dependencies and scripts
```

## 🗄️ Database Schema

### Tables

**products**
- id (UUID) - Primary key
- name - Product name
- sku - SKU code
- quantity - Current stock
- cost_price - Cost per unit
- selling_price - Sale price per unit
- location - Storage location
- supplier - Supplier name
- created_at - Creation timestamp

**sales**
- id (UUID) - Primary key
- product_id - Reference to product
- quantity - Units sold
- price - Actual sale price
- total - Total amount (quantity × price)
- created_at - Sale timestamp

**stock_movements**
- id (UUID) - Primary key
- product_id - Reference to product
- movement_type - Type (in/out/adjustment/damage)
- quantity - Quantity changed (positive/negative)
- notes - Additional notes
- created_at - Movement timestamp

**user_profiles**
- id (UUID) - Reference to auth user
- email - User email
- role - Role (admin/staff)
- created_at - Account creation timestamp

## 🌐 Deployment

Follow the **DEPLOYMENT_GUIDE.md** for:
- Supabase setup (database & authentication)
- Vercel deployment (hosting)
- Custom domain configuration
- User account creation

### Key Deployment Features
- ✅ Automatic daily backups
- ✅ Cloud hosting (accessible from anywhere)
- ✅ Multi-location access
- ✅ HTTPS encryption
- ✅ Scalable infrastructure

## 🔐 Security

- **Authentication**: Email + password via Supabase Auth
- **Authorization**: Role-based access control (Admin/Staff)
- **Database Security**: Row-level security policies
- **Encryption**: HTTPS in transit, encrypted at rest
- **Backups**: Automatic daily backups with point-in-time recovery

## 🎨 Technology Stack

- **Frontend**: React 18 + Next.js 14
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel
- **Language**: TypeScript

## 📖 User Guides

### For Admins
1. Log in with admin credentials
2. Manage products in **Products** section
3. Manage users in **Users** section
4. Monitor all activities via **Reports**

### For Staff
1. Log in with staff credentials
2. Record sales in **Sales** section
3. Update stock in **Stock Movements** section
4. View reports in **Reports** section

## 🛠️ Common Tasks

### Add a New Product
1. Go to **Products** → **+ Add Product**
2. Fill in all required fields
3. Click **"Add Product"**

### Record a Sale
1. Go to **Sales** → **+ Record Sale**
2. Select product and quantity
3. Review total amount
4. Click **"Record Sale"**

### Update Stock Levels
1. Go to **Stock Movements** → **+ Record Movement**
2. Select product and type (in/out)
3. Enter quantity and notes
4. Click **"Record Movement"**

### Generate Reports
1. Go to **Reports**
2. Select report type (Stock/Sales/Values)
3. Apply date filters if needed
4. View analytics and export data

## 📞 Support & Troubleshooting

### Common Issues

**Issue: Can't log in**
- Check email and password are correct
- Verify account exists in Supabase
- Try password reset

**Issue: Products not showing**
- Ensure you're logged in
- Check database tables exist in Supabase
- Verify Row Level Security policies

**Issue: Sales not saving**
- Confirm sufficient stock available
- Check product is active in database
- Verify user role is not "guest"

### Getting Help
- Check DEPLOYMENT_GUIDE.md for deployment issues
- Review Supabase docs: https://supabase.com/docs
- Vercel support: https://vercel.com/support

## 📄 License

This system is built for Holland Greentech TZ. All rights reserved.

## 🎯 Future Enhancements

Potential features for future versions:
- Mobile app for iOS/Android
- SMS notifications for low stock
- Integration with payment gateways
- Barcode/QR code scanning
- Advanced analytics dashboard
- Multi-branch/location support
- Inventory forecasting
- Purchase order management

## 📝 Version History

**v1.0.0** - Initial release
- Core inventory management
- Multi-user system
- Sales and stock tracking
- Reports and analytics
- Cloud deployment ready

---

**Built with ❤️ for Holland Greentech TZ**

Green & White | Professional | Reliable
