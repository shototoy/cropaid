# Quick Deployment Guide

## Backend Deployment (Render.com)

1. **Go to https://render.com** and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. **Configure:**
   - Name: `cropaid-backend`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   
5. **Add Environment Variables:**
   ```
   PORT=3000
   JWT_SECRET=cropaid_production_secret_key_2026
   FRONTEND_URL=https://cropaid.vercel.app
   ```

6. **Add MySQL Database** (Render Dashboard → New → MySQL)
   - Copy connection details and add to backend:
   ```
   DB_HOST=your-db-host
   DB_USER=your-user
   DB_PASSWORD=your-password
   DB_NAME=cropaid
   ```

7. **Run Database Setup:**
   - Connect to MySQL database using a client (MySQL Workbench, DBeaver, etc.)
   - Run the contents of `server/schema.sql`
   - Optionally run `server/seed.sql` for test data

8. **Deploy!** - Copy your backend URL (e.g., `https://cropaid-backend.onrender.com`)

## Frontend Deployment (Vercel)

1. **Go to https://vercel.com** and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. **Configure:**
   - Framework Preset: Vite
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   
5. **Add Environment Variable:**
   ```
   VITE_API_URL=https://cropaid-backend.onrender.com/api
   ```
   (Use your actual backend URL from step 8 above)

6. **Deploy!**

## Alternative: Netlify for Frontend

1. **Go to https://netlify.com** and sign up/login
2. Drag and drop your project folder OR connect GitHub
3. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   
4. **Environment Variables:**
   ```
   VITE_API_URL=https://cropaid-backend.onrender.com/api
   ```

## Testing Your Deployment

1. **Test Backend:**
   Open: `https://your-backend-url.onrender.com/api/health`
   Should see: `{"status":"ok","message":"CropAid API is running"}`

2. **Test Frontend:**
   Open your Vercel/Netlify URL
   Try registering a new farmer account

## Updating CORS

After deploying, update your backend's `FRONTEND_URL` environment variable with your actual frontend URL:

On Render:
1. Go to your backend service
2. Environment → Add: `FRONTEND_URL=https://your-actual-frontend-url.com`
3. Save changes (will trigger redeploy)

## Free Tier Limits

- **Render Free:** Backend sleeps after 15min inactivity
- **Vercel Free:** Unlimited static hosting
- **Netlify Free:** 100GB bandwidth/month

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Check DEPLOYMENT.md for detailed troubleshooting
