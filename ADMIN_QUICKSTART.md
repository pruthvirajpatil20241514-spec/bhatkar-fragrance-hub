# 🎯 Quick Start Guide - Admin Panel

## Admin Credentials
```
📧 Email: admin@bhatkar.com
🔐 Password: admin123
```

## Access Admin Panel
1. Click **Account** in the header
2. Open the Login Modal
3. Enter admin credentials above
4. Click **Log In**
5. ✅ Automatically redirected to **Admin Dashboard**

## Admin Modules

### 📦 Products Management
**Route**: `/admin/products`
- ➕ Add new fragrance products
- ✏️ Edit product details (name, price, category, concentration)
- 🗑️ Delete products
- 📊 View all products in table format

### 📊 Inventory Management
**Route**: `/admin/inventory`
- 📈 Real-time stock tracking
- 🏭 Multi-warehouse support
- ⚠️ Low stock alerts
- 🔧 Stock adjustments (add/remove inventory)
- 📉 Inventory analytics

### 🛒 Order Management
**Route**: `/admin/orders`
- 📋 View all orders
- 🔄 Update order status (Pending → Processing → Shipped → Delivered)
- 🔍 Filter by status
- 💰 Revenue tracking

### 💳 Payments & Refunds
**Route**: `/admin/payments`
- 💰 View payment transactions
- 💸 Process refunds (Full/Partial/Wallet/Store Credit)
- 📊 Revenue analytics
- ✅ Refund approval workflow

### 🔄 Returns & Exchanges
**Route**: `/admin/returns`
- 📥 Manage return requests
- 🔄 Handle exchange requests
- ✔️ Quality checks
- 📊 Return reason analytics

## Key Features

✅ **Role-Based Access Control** - Only admins can access admin panel  
✅ **Protected Routes** - All admin routes secured  
✅ **Auto-Redirect** - Admins automatically redirected to dashboard after login  
✅ **Real-Time Updates** - All changes reflected immediately  
✅ **Status Management** - Full status tracking for orders, refunds, returns  
✅ **Data Analytics** - Dashboard with key metrics and insights  

## Testing Checklist

- [ ] Login with admin credentials
- [ ] Verify redirect to admin dashboard
- [ ] Add a new product
- [ ] Edit existing product
- [ ] Adjust inventory stock
- [ ] Update order status
- [ ] Process a refund
- [ ] Approve a return request
- [ ] View all analytics
- [ ] Logout successfully

## Notes

- All data is stored in component state (demo)
- For production, integrate with backend API
- No real payments are processed (mock data)
- Session persists using localStorage

---

**Ready to explore? Start by logging in!** 🚀
