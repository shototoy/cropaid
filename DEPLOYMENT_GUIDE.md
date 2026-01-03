# CropAid Deployment Architecture

## 🚀 Deployment Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PRODUCTION SETUP                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│   Frontend       │────────▶│   Backend API    │────────▶│   MySQL DB       │
│   (Vercel/       │  HTTPS  │   (Render/       │         │   (Managed       │
│   Netlify)       │         │   Railway)       │         │   Service)       │
│                  │         │                  │         │                  │
│  React + Vite    │         │  Node.js +       │         │  MySQL 8.0       │
│  Nginx (Docker)  │         │  Express         │         │                  │
│                  │         │                  │         │                  │
└──────────────────┘         └──────────────────┘         └──────────────────┘
     Port 80/443                  Port 3000                   Port 3306

Environment:                 Environment:                 Auto-managed
VITE_API_URL=               PORT=3000                    by platform
https://backend.com/api     DB_HOST=...
                            DB_USER=...
                            JWT_SECRET=...
                            FRONTEND_URL=...
```

## 📦 What's Included

### Frontend Deployment Files
- ✅ `Dockerfile` - Multi-stage build with Nginx
- ✅ `nginx.conf` - Production Nginx configuration
- ✅ `vercel.json` - Vercel deployment config
- ✅ `netlify.toml` - Netlify deployment config
- ✅ `.env.production` - Production environment template
- ✅ `.dockerignore` - Files to exclude from Docker build

### Backend Deployment Files
- ✅ `server/Dockerfile` - Node.js backend container
- ✅ `server/.env.production` - Backend environment template
- ✅ `server/.dockerignore` - Backend Docker exclusions

### Full-Stack Testing
- ✅ `docker-compose.yml` - Complete local stack (Frontend + Backend + DB)

### Documentation
- ✅ `DEPLOYMENT.md` - Comprehensive deployment guide
- ✅ `DEPLOY_QUICK.md` - Quick start deployment steps

## 🎯 Deployment Strategies

### Strategy 1: Easiest (No Docker Required)
**Best for:** Quick deployment, beginners

Frontend: **Vercel** (Free tier available)
- Push to GitHub
- Import to Vercel
- Set `VITE_API_URL` environment variable
- Auto-deploy on push

Backend: **Render** (Free tier with sleep)
- Connect GitHub repo
- Set root directory to `server`
- Add database and environment variables
- Auto-deploy on push

**Time to deploy:** ~15 minutes

### Strategy 2: Docker-Based
**Best for:** Full control, consistent environments

Both: **Railway** or **Render** with Docker
- Uses Dockerfile for building
- Consistent production environment
- Easy to scale

**Time to deploy:** ~20 minutes

### Strategy 3: All-in-One
**Best for:** Simplicity, single platform

Both: **Railway** or **Digital Ocean App Platform**
- Single project for everything
- Managed database included
- One dashboard for all services

**Time to deploy:** ~25 minutes

## 🔧 Configuration Flow

### 1. Deploy Backend First
```bash
1. Create database (MySQL)
2. Run schema.sql on database
3. Deploy backend service
4. Note backend URL
```

### 2. Update Frontend Config
```bash
1. Set VITE_API_URL=<backend-url>/api
2. Deploy frontend service
3. Note frontend URL
```

### 3. Update Backend CORS
```bash
1. Set FRONTEND_URL=<frontend-url>
2. Redeploy backend
```

### 4. Test Connection
```bash
1. Open frontend URL
2. Try to register/login
3. Check browser console for errors
4. Test API health endpoint
```

## 📊 Cost Comparison

| Platform Combo | Frontend | Backend | Database | Total/mo | Free Tier |
|---------------|----------|---------|----------|----------|-----------|
| Vercel + Render | Free | Free* | Free* | $0 | ✅ (with limits) |
| Netlify + Railway | Free | $5 | $5 | $10 | ❌ |
| Vercel + Railway | Free | $5 | $5 | $10 | ❌ |
| DO App Platform | - | - | - | $12-25 | ❌ |
| All on Render | Free | Free* | Free* | $0 | ✅ (with limits) |

*Free tier has limitations (backend sleeps, limited hours)

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change all default passwords and secrets
- [ ] Generate strong JWT_SECRET (use random string generator)
- [ ] Set up HTTPS (auto on Vercel/Netlify/Render)
- [ ] Configure proper CORS origins
- [ ] Review database security settings
- [ ] Enable database backups
- [ ] Set up error monitoring (Sentry)
- [ ] Test with different browsers
- [ ] Test mobile responsiveness
- [ ] Set up custom domain (optional)

## 🚨 Common Issues & Solutions

### Frontend can't reach Backend (CORS error)
**Solution:** 
1. Check `VITE_API_URL` is set correctly in frontend
2. Verify `FRONTEND_URL` matches in backend
3. Ensure both use HTTPS or both use HTTP

### Database connection failed
**Solution:**
1. Check database credentials in backend env vars
2. Verify database is running
3. Test connection with database client
4. Check if database allows external connections

### Backend returns 404 for all routes
**Solution:**
1. Verify backend is deployed and running
2. Check health endpoint: `/api/health`
3. Review backend logs for errors
4. Ensure PORT environment variable is set

### Build fails on deployment
**Solution:**
1. Test build locally first: `npm run build`
2. Check Node.js version (use 18+ or 22)
3. Review build logs for specific errors
4. Ensure all dependencies are in package.json

## 📱 Testing Checklist

After deployment, test these features:

- [ ] Homepage loads
- [ ] User registration works
- [ ] Login functionality
- [ ] Report submission (Pest/Flood/Drought)
- [ ] Photo upload
- [ ] Geolocation on map
- [ ] Admin login
- [ ] Admin dashboard loads
- [ ] Admin can verify/reject reports
- [ ] Mobile responsive design
- [ ] PWA installation (if enabled)

## 🎓 Next Steps

1. **Read** `DEPLOY_QUICK.md` for step-by-step deployment
2. **Choose** your deployment platform
3. **Deploy** backend first, then frontend
4. **Test** all features
5. **Monitor** application performance
6. **Set up** custom domain (optional)
7. **Configure** analytics (optional)

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Netlify Documentation](https://docs.netlify.com)
- [Docker Documentation](https://docs.docker.com)

---

**Need help?** Check the troubleshooting section in `DEPLOYMENT.md`
