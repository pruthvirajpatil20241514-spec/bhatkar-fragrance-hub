# 🛠️ Fix: Supabase Storage Authentication Error

The `JWS Protected Header is invalid` error occurs because the backend is using an **anon/publishable key** instead of the **Service Role Key** for storage operations. Storage uploads require admin privileges.

## ✅ How to Fix

### 1. Get the Service Role Key
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project: `kztbfdzvulahrivixgkx`.
3. Go to **Project Settings** (gear icon) → **API**.
4. Find the **service_role (secret)** key.
5. Click **Reveal** and copy the key.
   > [!IMPORTANT]
   > The key should start with `eyJ...`. Do NOT use keys starting with `sb_publishable_` or `anon_`.

### 2. Update Render Dashboard
1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Select your Web Service: `bhatkar-fragrance-hub-1`.
3. Go to **Environment**.
4. Update/Add the following variables:
   - `SUPABASE_SERVICE_ROLE_KEY`: Paste the key you copied in Step 1.
   - `SUPABASE_URL`: `https://kztbfdzvulahrivixgkx.supabase.co`
   - `SUPABASE_STORAGE_BUCKET`: `products`
5. Click **Save Changes**. Render will automatically restart your service.

### 3. Verify
- Try uploading an image again via the Admin Dashboard.
- The `POST /api/images/upload-temp` request should now return a `201 Created` status with the image URL.

---

## 🔍 Technical Changes Made
- **Validation**: Added a check in the backend to ensure the `SUPABASE_SERVICE_ROLE_KEY` is present and correctly formatted (JWT).
- **Logging**: Improved error logging to capture and display the specific reason for failure in the server logs.
