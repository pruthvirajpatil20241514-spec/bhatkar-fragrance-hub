# Bhatkar Fragrance Hub - Backend API

Production-grade Node.js/Express API with MySQL database integration.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### 2. Setup Environment

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bhatkar_fragrance
JWT_SECRET=your_random_jwt_secret_key
```

### 3. Create Database & Tables

```bash
# Create database and import schema
mysql -u root -p < database/schema.sql

# Insert seed data
mysql -u root -p bhatkar_fragrance < database/seed.sql
```

Or use the npm script:
```bash
npm run db:setup
```

### 4. Start Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build
npm start
```

Server runs on `http://localhost:5000`

## 🔑 Test Credentials

### Admin Account
- Email: `admin@bhatkar.com`
- Password: `admin123`
- Role: `super_admin`

### Customer Account
- Email: `customer@example.com`
- Password: `user123`
- Role: `customer`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": 1,
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Admin Login
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@bhatkar.com",
  "password": "admin123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=12&category=luxury-perfumes&sort=newest&search=oud
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)
- `category`: Filter by category slug
- `search`: Search in name and description
- `sort`: Sort by `newest`, `price_low`, `price_high`, `rating`
- `featured`: Filter featured products (`true`/`false`)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Royal Oud Noir",
        "slug": "royal-oud-noir",
        "base_price": 8999,
        "discounted_price": 7999,
        "category_name": "Luxury Perfumes",
        "variants": [
          {
            "id": 1,
            "size_ml": 30,
            "price": 3999,
            "discounted_price": 3559,
            "stock_quantity": 15
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 1,
      "pages": 1
    }
  }
}
```

#### Get Product by ID
```http
GET /api/products/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Royal Oud Noir",
    "description": "...",
    "base_price": 8999,
    "variants": [
      {
        "id": 1,
        "size_ml": 30,
        "price": 3999,
        "discounted_price": 3559,
        "stock_quantity": 15
      }
    ],
    "images": [
      {
        "id": 1,
        "image_url": "https://...",
        "is_primary": true
      }
    ],
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "title": "Amazing fragrance",
        "review_text": "...",
        "first_name": "John",
        "last_name": "Doe"
      }
    ]
  }
}
```

#### Get Featured Products
```http
GET /api/products/featured?limit=8
```

## 🗄️ Database Schema Overview

### Core Tables
- **users** - Customer accounts
- **admins** - Admin accounts with roles
- **products** - Product catalog
- **product_variants** - Size variants (30ml, 50ml, 100ml)
- **product_images** - Product images
- **categories** - Product categories
- **inventory** - Stock management per warehouse

### Order & Payment
- **orders** - Customer orders
- **order_items** - Items in orders
- **payments** - Payment transactions
- **refunds** - Refund requests
- **return_requests** - Return/exchange requests

### Customer Features
- **carts** - Shopping carts
- **wishlists** - Wishlist items
- **reviews** - Product reviews
- **coupons** - Discount codes
- **coupon_usage** - Coupon usage tracking

### Analytics
- **audit_logs** - Change history
- **daily_sales** - Daily revenue tracking
- **product_sales** - Product sales analytics

## 🔐 Security Features

✅ **Password Hashing** - bcryptjs with 10 rounds
✅ **JWT Authentication** - Access + Refresh tokens
✅ **RBAC** - Role-based access control (super_admin, admin, customer)
✅ **SQL Injection Protection** - Prepared statements
✅ **CORS** - Configurable cross-origin access
✅ **Soft Deletes** - Data preservation with `deleted_at`
✅ **Audit Logs** - Track all changes

## 📋 Admin Permissions

### Super Admin
- Create/Edit/Delete admins
- Manage all products, categories, inventory
- Approve/Reject reviews, returns, refunds
- View all analytics and reports
- Manage CMS pages

### Admin
- Manage products and inventory
- Process orders and returns
- View reports (limited)
- Cannot manage admin users

## 🛠️ Development

### Project Structure
```
server/
├── src/
│   ├── config/       # Database and env config
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth, error handling
│   ├── routes/       # API endpoints
│   ├── utils/        # Helper functions
│   └── index.ts      # Main app file
├── database/
│   ├── schema.sql    # Database structure
│   └── seed.sql      # Test data
├── .env.example      # Environment variables
└── package.json      # Dependencies
```

### Adding New Endpoints

1. Create controller in `src/controllers/`
2. Create routes in `src/routes/`
3. Import in `src/index.ts`

Example:
```typescript
// src/controllers/orderController.ts
export const getOrders = async (req: AuthRequest, res: Response) => {
  // Your logic
};

// src/routes/orders.ts
router.get('/', authMiddleware, asyncHandler(getOrders));

// src/index.ts
app.use('/api/orders', orderRoutes);
```

## 🐛 Error Handling

The API uses custom error classes:

```json
{
  "success": false,
  "error": "Email already registered",
  "statusCode": 409
}
```

**Error Codes:**
- `400` - Validation Error
- `401` - Authentication Error
- `403` - Authorization Error
- `404` - Not Found
- `409` - Conflict (duplicate email, etc.)
- `500` - Server Error

## 📦 Dependencies

- **express** - Web framework
- **mysql2** - MySQL database driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **express-validator** - Input validation

## 🚀 Deployment

### Production Checklist
- [ ] Create `.env` with strong secrets
- [ ] Set `NODE_ENV=production`
- [ ] Use managed MySQL database (AWS RDS, Google Cloud SQL)
- [ ] Enable HTTPS/TLS
- [ ] Setup CORS for your frontend domain
- [ ] Enable database backups
- [ ] Setup monitoring and logging
- [ ] Use environment variables for all secrets
- [ ] Rate limiting on API endpoints
- [ ] DDOS protection

### Deploy to Heroku
```bash
heroku create bhatkar-api
heroku config:set DB_HOST=your_db_host
heroku config:set JWT_SECRET=your_jwt_secret
git push heroku main
```

## 📞 Support

For issues or questions:
1. Check error logs: `npm run dev` (with verbose output)
2. Verify database connection: `GET /api/health`
3. Check MySQL is running: `mysql -u root -p`
4. Verify `.env` configuration

## 📄 License

MIT
