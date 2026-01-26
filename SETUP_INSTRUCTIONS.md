# 🚀 Quick Start Guide

Your Bhatkar Fragrance Hub is ready to connect to a real MySQL database!

## ✅ Current Status

- ✅ React frontend with all UI/features complete (mobile responsive)
- ✅ Express.js backend fully scaffolded
- ✅ MySQL schema designed (22 tables, fully normalized)
- ✅ Authentication system (JWT + bcrypt)
- ✅ Product API endpoints ready
- ⏳ Database setup pending
- ⏳ Frontend integration pending

## 🗄️ Step 1: Set Up MySQL Database

### Prerequisites
- MySQL 8.0+ installed and running
- Access to MySQL command line or client

### Create Database

```bash
# Option 1: Using MySQL command line
mysql -u root -p < server/database/schema.sql
mysql -u root -p bhatkar_fragrance < server/database/seed.sql

# Option 2: Using npm script (after installing dependencies)
cd server
npm install
npm run db:setup
npm run db:reset  # Resets database if needed
```

**Test credentials after seeding:**
- Admin Email: `admin@bhatkar.com`
- Admin Password: `admin123`
- Customer Email: `customer@example.com`
- Customer Password: `user123`

## 🔧 Step 2: Configure Environment

```bash
# Copy template to .env
cp server/.env.example server/.env

# Edit server/.env with your MySQL credentials:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=bhatkar_fragrance
DB_PORT=3306
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

## 📦 Step 3: Install Dependencies

```bash
# Backend dependencies
cd server
npm install

# If already in root, ensure you're in server:
npm install --prefix server
```

## 🎯 Step 4: Start Backend Server

```bash
cd server

# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

Expected output:
```
✅ Server running on http://localhost:5000
✅ Database connected
```

## 🧪 Step 5: Test Backend APIs

### Health Check
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is healthy",
  "database": "connected"
}
```

### Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bhatkar.com",
    "password": "admin123"
  }'
```

### Get Products
```bash
curl http://localhost:5000/api/products?page=1&limit=10
```

### Get Product by ID
```bash
curl http://localhost:5000/api/products/1
```

### Get Featured Products
```bash
curl http://localhost:5000/api/products/featured
```

## 🎨 Step 6: Update Frontend Configuration

```bash
# In root .env (create if doesn't exist)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 📝 Step 7: Integrate Frontend with Backend

Follow the guide in [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) to:

1. ✅ Create API client with axios
2. ✅ Update AuthContext to use login API
3. ✅ Replace hardcoded product data with API calls
4. ✅ Update Cart/Order/Wishlist contexts
5. ✅ Add loading and error states
6. ✅ Remove mock data files

## 🚀 Step 8: Start Development

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend (in root)
npm run dev

# Access frontend at http://localhost:5173
```

## 🔍 Database Schema Overview

The following tables are created:

### Core Tables
- `users` - Customer accounts
- `admins` - Admin accounts with roles
- `products` - Product catalog
- `product_variants` - Sizes/options per product
- `product_images` - Multiple images per product

### Business Tables
- `categories` - Product categories
- `inventory` - Stock management
- `carts` - Shopping carts
- `orders` - Customer orders
- `order_items` - Items in orders
- `payments` - Payment records
- `refunds` - Refund transactions

### Additional Tables
- `reviews` - Product reviews
- `wishlists` - Saved items
- `coupons` - Discount codes
- `return_requests` - Return management
- `cms_pages` - Content management

### Audit Tables
- `audit_logs` - Change tracking
- `daily_sales` - Sales analytics
- `product_sales` - Product performance

## 📚 API Documentation

Full API documentation with examples: [server/README.md](./server/README.md)

### Implemented Endpoints

**Authentication**
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Customer login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user

**Products** (Public)
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `GET /api/products/featured` - Get featured products

**Endpoints Coming Soon**
- Cart management
- Order management
- Payment processing
- Product reviews
- Admin operations
- Inventory management
- And more...

## 🛠️ Troubleshooting

### Database Connection Failed
```bash
# Check MySQL is running
mysql -u root -p -e "SHOW DATABASES;"

# Check schema was created
mysql -u root -p -e "USE bhatkar_fragrance; SHOW TABLES;"

# Check credentials in server/.env
cat server/.env
```

### Port Already in Use
```bash
# Change PORT in server/.env
PORT=5001

# Or kill existing process
lsof -ti:5000 | xargs kill -9
```

### CORS Errors
```bash
# Update CORS_ORIGIN in server/.env
# Include your frontend URL
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### JWT Token Issues
```bash
# Check localStorage in browser console
console.log(localStorage.getItem('accessToken'))

# Decode token at https://jwt.io
```

## 📊 Architecture

```
Frontend (React)
    ↓
API Client (Axios)
    ↓
Express.js Server
    ↓
MySQL Database
```

## 🔐 Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with refresh rotation
- ✅ SQL injection protection (prepared statements)
- ✅ Role-based authorization (admin/customer)
- ✅ Soft deletes for data preservation
- ✅ CORS configured per environment
- ✅ Input validation on all endpoints

## 📈 Next Steps

1. **Get backend running** (this document)
2. **Test API endpoints** (use curl/Postman)
3. **Integrate frontend** (follow BACKEND_INTEGRATION.md)
4. **Add remaining endpoints** (cart, orders, payments, etc.)
5. **Set up automated testing**
6. **Deploy to production**

## 📞 Support

For issues or questions:
1. Check the [server/README.md](./server/README.md) for detailed API docs
2. Review error logs in terminal
3. Check browser console for frontend errors
4. Verify MySQL credentials in server/.env

---

**You're all set! Start with Step 1 above.** 🎉
