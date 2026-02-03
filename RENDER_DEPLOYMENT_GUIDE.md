# Render Deployment Guide for Bhatkar Fragrance Hub Backend

## Prerequisites
- GitHub repo connected to Render
- MySQL database hosted externally (Render doesn't support local databases)

## Step 1: Set Up External MySQL Database

For Render, you need a cloud-hosted MySQL database. Choose one:

### Option A: AWS RDS (Recommended for production)
1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds/)
2. Create MySQL 8.0 database
3. Note down:
   - Endpoint (e.g., `mydb.xxxxx.us-east-1.rds.amazonaws.com`)
   - Master username
   - Master password
   - Database name
   - Port (default: 3306)

### Option B: PlanetScale (MySQL-compatible, free tier)
1. Go to [PlanetScale](https://planetscale.com/)
2. Create new database
3. Create `main` branch
4. Get connection string credentials

### Option C: Aiven (Free tier available)
1. Go to [Aiven](https://aiven.io/)
2. Create MySQL service
3. Note down connection details

## Step 2: Connect Backend to Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "+ New"** → **Web Service**
3. **Select your GitHub repo** (`bhatkar-fragrance-hub`)
4. **Configuration:**
   - Name: `bhatkar-backend` (or similar)
   - Environment: `Node`
   - Build Command: `npm i` (default is fine)
   - Start Command: `npm start` (already in `Procfile`)
   - Instance Type: Free tier is OK for development

## Step 3: Set Environment Variables in Render

In the Render dashboard, go to your service → **Environment**

Add these variables based on your database choice:

```
DB_HOST=<your-database-host>
DB_USER=<your-database-user>
DB_PASSWORD=<your-database-password>
DB_NAME=fragrance_hub
DB_PORT=3306
JWT_SECRET_KEY=d_aepb5oKnJBvBemM_jaavme1vqEU7tEletSnp98IxY
NODE_ENV=production
```

### Example for AWS RDS:
```
DB_HOST=mydb.xxxxx.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=MySecurePassword123!
DB_NAME=fragrance_hub
DB_PORT=3306
JWT_SECRET_KEY=d_aepb5oKnJBvBemM_jaavme1vqEU7tEletSnp98IxY
NODE_ENV=production
```

### Example for PlanetScale:
```
DB_HOST=xxx.us-east-1.psdb.cloud
DB_USER=root
DB_PASSWORD=<access_token>
DB_NAME=bhatkar_db
DB_PORT=3306
JWT_SECRET_KEY=d_aepb5oKnJBvBemM_jaavme1vqEU7tEletSnp98IxY
NODE_ENV=production
```

## Step 4: Deploy

1. Click **Create Web Service**
2. Render will automatically build and deploy from `main` branch
3. Check logs for any errors
4. Once deployed, you'll get a URL like: `https://bhatkar-backend.onrender.com`

## Step 5: Connect React Frontend

Update your React frontend's API base URL in `src/lib/axios.ts`:

```typescript
const api = axios.create({
  baseURL: 'https://bhatkar-backend.onrender.com/api',
  // ... rest of config
});
```

Or use an environment variable:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});
```

And in your `.env` (frontend):

```
VITE_API_URL=https://bhatkar-backend.onrender.com/api
```

## Step 6: Auto-Deploy on Git Push

Render watches your GitHub repo. Every time you:
```bash
git push origin main
```

Render automatically redeploys your backend! 🚀

## Troubleshooting

### "Missing required credential" error
- Make sure all env variables are set correctly in Render dashboard
- Check database credentials are correct
- Database must be reachable from Render (whitelisted IP if using RDS)

### "Connection refused" error
- Verify database host is correct
- For AWS RDS: add Render's IP to Security Group inbound rules
- For PlanetScale: enable network access

### Logs
View logs in Render dashboard:
1. Go to your service
2. Click **Logs** tab
3. Check recent errors

## Production Best Practices

✅ Always use `NODE_ENV=production` in Render
✅ Use strong passwords for DB (not `pass`)
✅ Use cloud-managed databases, not local containers
✅ Enable CORS only for your frontend domain
✅ Use HTTPS (Render provides SSL automatically)
✅ Keep JWT_SECRET_KEY secure (rotate periodically)

## SSL/TLS Connections

The backend now supports SSL for database connections:
- When `NODE_ENV=production`, SSL is **enabled**
- When `NODE_ENV=development`, SSL is **disabled**

This is configured in `src/config/db.config.js`:
```javascript
ssl: process.env.NODE_ENV === 'production' ? true : false
```
