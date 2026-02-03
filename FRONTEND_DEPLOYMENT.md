# Frontend Deployment on Render

## Quick Setup

### Step 1: Create a Static Site on Render

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Select **main branch**

### Step 2: Configure Build Settings

In the Render dashboard, set:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install && npm run build` |
| **Publish directory** | `dist` |
| **Environment** | Production |

### Step 3: Add Environment Variable (Optional)

If you want to override the API URL:

1. Go to **Settings** tab
2. Click **Environment**
3. Add:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://bhatkar-fragrance-hub-1.onrender.com/api`

(This is optional — the default `.env.production` already has this)

### Step 4: Deploy

Click **"Create Static Site"** — Render will automatically:
- ✅ Clone your repo
- ✅ Run `npm install && npm run build`
- ✅ Deploy the `dist/` folder
- ✅ Assign you a `.onrender.com` URL

---

## Environment Configuration

### Development (Local)
```bash
npm run dev
# Uses .env.development → http://localhost:3000/api
```

### Production (Render)
```bash
npm run build
# Uses .env.production → https://bhatkar-fragrance-hub-1.onrender.com/api
```

---

## Auto-Deployments

Render automatically redeploys when you:
- Push to **main branch**
- Update environment variables
- Modify the build command

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Cannot GET /"** | Vite build failed. Check Render logs for build errors. |
| **API 404 errors** | Verify `VITE_API_BASE_URL` points to correct backend. |
| **CORS errors** | Ensure backend has `cors()` middleware enabled. |
| **Blank page** | Check browser console for errors; verify assets loaded from correct domain. |

---

## Current URLs

- **Frontend:** https://bhatkar-fragrance-hub-1.onrender.com
- **Backend API:** https://bhatkar-fragrance-hub-backend.onrender.com/api

Update `.env.production` if backend URL changes!

