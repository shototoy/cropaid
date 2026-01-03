# CropAid Deployment Guide

This guide covers deploying the CropAid application with separate backend and frontend deployments.

## Architecture

- **Frontend**: React + Vite (Static hosting with Nginx)
- **Backend**: Node.js + Express API
- **Database**: MySQL 8.0

## Quick Start with Docker Compose

### Local Testing with Docker

1. **Build and run all services:**
```bash
docker-compose up --build
```

2. **Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Database: localhost:3306

3. **Stop services:**
```bash
docker-compose down
```

## Deployment Options

### Option 1: Render (Recommended for beginners)

#### Backend Deployment (Render Web Service)

1. **Create a new Web Service** on Render
2. **Connect your GitHub repository**
3. **Configuration:**
   - Name: `cropaid-backend`
   - Root Directory: `server`
   - Environment: `Docker`
   - Instance Type: Free or Starter
   
4. **Environment Variables:**
   ```
   PORT=3000
   DB_HOST=your-database-host
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=cropaid
   JWT_SECRET=your-super-secret-key-change-this
   FRONTEND_URL=https://your-frontend-url.onrender.com
   NODE_ENV=production
   ```

5. **Database Setup:**
   - Create a PostgreSQL or MySQL database on Render
   - OR use external MySQL service (e.g., PlanetScale, Railway)
   - Run schema.sql and seed.sql manually

6. **Deploy!**

#### Frontend Deployment (Render Static Site)

1. **Create a new Static Site** on Render
2. **Configuration:**
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   
3. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

4. **Deploy!**

### Option 2: Railway

#### Backend Deployment

1. **Create new project** on Railway
2. **Add MySQL database**
3. **Deploy from GitHub:**
   - Root Directory: `server`
   - Use Dockerfile
   
4. **Set Environment Variables:**
   ```
   PORT=3000
   DATABASE_URL=${{MySQL.DATABASE_URL}}
   JWT_SECRET=your-secret-key
   FRONTEND_URL=${{Frontend.url}}
   ```

5. **Run database migrations:**
   - Use Railway's shell to run schema.sql

#### Frontend Deployment

1. **Add new service** to same Railway project
2. **Deploy from GitHub:**
   - Root Directory: `/` (root)
   - Use Dockerfile
   
3. **Set Environment Variables:**
   ```
   VITE_API_URL=${{Backend.url}}/api
   ```

### Option 3: Vercel (Frontend) + Render/Railway (Backend)

#### Frontend on Vercel

1. **Import repository** to Vercel
2. **Framework Preset:** Vite
3. **Root Directory:** `.` (leave as root)
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

#### Backend on Render/Railway (Same as above)

### Option 4: Digital Ocean App Platform

1. **Create new app** from GitHub
2. **Add two components:**
   - Backend (Web Service from server/)
   - Frontend (Static Site from root)
   - Database (Managed MySQL)

3. **Configure both with appropriate environment variables**

## Environment Variables Reference

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.com/api
```

### Backend (server/.env.production)
```env
PORT=3000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=cropaid
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-frontend-url.com
NODE_ENV=production
```

## Post-Deployment Steps

### 1. Database Setup

After deploying the backend, connect to your database and run:

```sql
-- Run schema.sql first
source server/schema.sql;

-- Then run seed.sql (optional - for test data)
source server/seed.sql;
```

### 2. Test the Connection

1. **Test Backend Health:**
   ```
   https://your-backend-url.com/api/health
   ```
   Should return: `{"status":"ok","message":"CropAid API is running"}`

2. **Test Frontend:**
   Open your frontend URL and try to:
   - Register a new farmer
   - Login
   - Submit a report

### 3. CORS Configuration

Make sure your backend's `FRONTEND_URL` environment variable matches your actual frontend URL. The backend is configured to accept requests from:
- The configured FRONTEND_URL
- http://localhost:5173 (development)
- http://localhost:3000 (development)

### 4. Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS on both frontend and backend
- [ ] Configure database firewall rules
- [ ] Set up proper CORS origins
- [ ] Review and update security headers

## Troubleshooting

### CORS Errors
- Check that `FRONTEND_URL` in backend matches your actual frontend URL
- Ensure HTTPS is used if frontend uses HTTPS
- Check browser console for specific CORS errors

### Database Connection Issues
- Verify database credentials
- Check if database service is running
- Ensure database allows connections from your backend IP
- Test connection with database client

### Build Failures
- Check Node.js version (should be 18+ or 22)
- Verify all dependencies are in package.json
- Check build logs for specific errors
- Ensure environment variables are set

### API Not Found (404)
- Verify VITE_API_URL is correctly set in frontend
- Check that backend is deployed and running
- Test backend health endpoint directly

## Monitoring

### Health Checks

Both services have health check endpoints:

- **Backend:** `https://your-backend-url.com/api/health`
- **Frontend:** `https://your-frontend-url.com/` (should return 200)

### Logs

Check deployment platform's logs for:
- Application errors
- Database connection issues
- API request errors

## Scaling Considerations

For production use:
- Use managed database service (higher availability)
- Enable database backups
- Set up CDN for frontend (Cloudflare, etc.)
- Configure rate limiting on backend
- Add monitoring (Sentry, LogRocket, etc.)
- Set up CI/CD pipelines

## Cost Estimates

### Free Tier Options
- **Render:** Backend + Database (sleeps after inactivity)
- **Vercel:** Frontend hosting
- **Railway:** $5 credit monthly
- **Total:** Free or ~$5-10/month

### Production Setup
- **Backend:** $7-25/month
- **Database:** $7-15/month
- **Frontend:** Free (static)
- **Total:** ~$15-40/month

## Support

For deployment issues:
- Check platform documentation
- Review application logs
- Test locally with docker-compose first
- Verify all environment variables are set correctly
