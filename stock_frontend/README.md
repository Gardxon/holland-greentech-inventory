# Stock Management System - Frontend

A modern React + Tailwind CSS dashboard for managing multi-branch inventory and stock control.

## Features

✅ **Dashboard Overview** - Real-time statistics and quick actions  
✅ **Branch Management** - View all warehouses and sub-branches  
✅ **Product Catalog** - Browse 197+ products with pagination  
✅ **Inventory Tracking** - Real-time stock levels by branch  
✅ **Stock Transfers** - Log transfers between branches with error handling  
✅ **Movement History** - Complete transaction log with timestamps  
✅ **Loading States** - Spinners and loading indicators  
✅ **Error Handling** - User-friendly error messages  
✅ **Responsive Design** - Mobile, tablet, and desktop support  

## Setup

### Prerequisites
- Node.js 16+ and npm
- Backend API running on http://localhost:8000

### Installation

```bash
# 1. Navigate to the frontend directory
cd stock_frontend

# 2. Install dependencies
npm install

# 3. Create .env file from example
cp .env.example .env

# 4. Update VITE_API_URL if needed (default: http://localhost:8000)
# Edit .env and change the API URL if running on a different host/port
```

### Development

Start the dev server:

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Build for Production

```bash
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
stock_frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx      # Overview with stats
│   │   ├── Branches.jsx       # Branch listing
│   │   ├── Products.jsx       # Product catalog with pagination
│   │   ├── Inventory.jsx      # Stock levels by branch
│   │   ├── StockTransfer.jsx  # Transfer form with validation
│   │   ├── History.jsx        # Movement history
│   │   └── Loading.jsx        # Loading spinner
│   ├── services/
│   │   └── api.js             # Axios API client with interceptors
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Tailwind and global styles
├── index.html                 # HTML template
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
├── postcss.config.js          # PostCSS configuration
├── vite.config.js             # Vite configuration
└── .env.example               # Environment variables template
```

## API Integration

The frontend connects to the FastAPI backend at http://localhost:8000

### Key Endpoints Used

- `GET /branches` - List all branches
- `GET /products` - List all products
- `GET /inventory/branch/{id}` - Get stock levels for a branch
- `POST /movements` - Log a stock transfer
- `GET /movements` - Get movement history

## Error Handling

- Network errors are caught and displayed to the user
- Form validation prevents invalid submissions
- API errors are handled with user-friendly messages
- Loading states prevent double-submissions

## Styling

Built with **Tailwind CSS** for a modern, responsive design:
- Gradient headers
- Card-based layouts
- Responsive tables with scrolling
- Interactive buttons with hover states
- Color-coded status badges
- Mobile-first responsive design

## Available Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] User authentication
- [ ] Advanced filtering and search
- [ ] Export to CSV/PDF
- [ ] Real-time notifications
- [ ] Dark mode toggle
- [ ] Multi-language support

## Troubleshooting

### "Failed to load branches" error
- Ensure the API backend is running on http://localhost:8000
- Check VITE_API_URL in .env is correct
- Verify CORS is enabled in the backend

### Port 3000 already in use
Change the port in `vite.config.js`:
```js
server: {
  port: 3001  // or another available port
}
```

### API calls failing
1. Check that the backend is running
2. Verify the API URL in .env
3. Check browser DevTools Network tab for error details
4. Ensure CORS is properly configured in FastAPI

## Support

For issues or questions, check:
- Backend API documentation at http://localhost:8000/docs
- Console errors in browser DevTools
- Network requests in DevTools Network tab

---

**Built with React, Vite, and Tailwind CSS for the Stock Management System**
