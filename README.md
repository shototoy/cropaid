# 🌾 CropAid - Farmer Assistance Application

A comprehensive agricultural disaster reporting and assistance application for farmers in Norala, South Cotabato, Philippines.

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd cropaid
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

3. **Set up MySQL database**
```bash
cd server
node setup-db.js
cd ..
```

4. **Run both servers**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 📦 Features

### For Farmers
- 📱 **Mobile-First Design** - Optimized for smartphones
- 🌾 **Report Disasters** - Pest infestations, floods, droughts
- 📸 **Photo Evidence** - Capture and upload damage photos
- 📍 **GPS Location** - Automatic location tagging
- 📊 **Track Reports** - Monitor status of submitted reports
- 🔔 **Notifications** - Get updates on report status
- 👤 **Profile Management** - Manage farm and personal info

### For Administrators
- 🗺️ **Interactive Map** - Visualize all reports geographically
- ✅ **Report Verification** - Review and verify farmer reports
- 👥 **Farmer Management** - View and manage farmer database
- 📈 **Dashboard Analytics** - Real-time statistics and insights
- 📋 **Daily Summaries** - Organized reports by type
- ⚙️ **Settings** - System configuration

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS
- **Maps:** Leaflet & React-Leaflet
- **Icons:** Lucide React
- **PWA:** Vite PWA Plugin

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Authentication:** JWT (jsonwebtoken)
- **Security:** Helmet, CORS, bcryptjs
- **Validation:** Zod

## 📂 Project Structure

```
cropaid/
├── src/                      # Frontend source code
│   ├── components/          # All reusable components (flat, no ui/layout/map/report/status subfolders)
│   ├── pages/              # Page components
│   ├── context/            # React context
│   ├── config/             # Configuration files
│   ├── services/           # API services
│   └── utils/              # Utility helpers
├── server/                  # Backend source code
│   ├── index.js            # Main server file
│   ├── db.js               # Database connection
│   ├── schema.sql          # Database schema
│   ├── seed.sql            # Seed data
│   └── Dockerfile          # Backend Docker config
├── public/                  # Static assets
├── Dockerfile              # Frontend Docker config
├── docker-compose.yml      # Full-stack Docker setup
└── package.json            # Frontend dependencies
```

## 🚀 Deployment

### Quick Deploy (Recommended)

See **[DEPLOY_QUICK.md](./DEPLOY_QUICK.md)** for step-by-step deployment guide.

**Recommended Setup:**
- **Frontend:** Vercel (Free)
- **Backend:** Render (Free tier)
- **Database:** Render MySQL or PlanetScale

### Detailed Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Comprehensive deployment guide
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Architecture overview

### Environment Variables

**Frontend (.env.production):**
```env
VITE_API_URL=https://your-backend-url.com/api
```

**Backend (server/.env):**
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cropaid
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

## 🧪 Testing

### Manual Testing
1. Register a new farmer account
2. Submit different types of reports (pest, flood, drought)
3. Upload photos with reports
4. Login as admin (use seeded admin account)
5. Verify and manage reports from admin panel

### Default Admin Login
```
Username: admin
Password: admin123
```
**⚠️ Change this in production!**

## 📱 Progressive Web App (PWA)

CropAid is a PWA and can be installed on mobile devices:
1. Open the app in a mobile browser
2. Tap "Add to Home Screen"
3. Use like a native app

Features:
- ✅ Offline-capable
- ✅ App-like experience
- ✅ Push notifications ready
- ✅ Custom app icons

## 🔐 Security

- **Authentication:** JWT-based with secure httpOnly cookies
- **Password Hashing:** bcryptjs with salt rounds
- **SQL Injection Prevention:** Parameterized queries
- **CORS:** Configured for specific origins
- **Helmet:** Security headers configured
- **Input Validation:** Zod schemas for all inputs

## 🌍 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Known Issues & Fixes

All major issues have been resolved:
- ✅ Fixed AUTO_INCREMENT ID issues
- ✅ Fixed CORS configuration
- ✅ Fixed registration foreign key constraints
- ✅ Fixed report creation and display
- ✅ Updated API to use environment variables

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new farmer
- `POST /api/auth/login` - Login (farmer/admin)

### Reports (Protected)
- `GET /api/reports/history` - Get user's reports
- `POST /api/reports` - Submit new report

### Admin (Protected + Admin Role)
- `GET /api/admin/reports` - Get all reports
- `PATCH /api/admin/reports/:id/status` - Update report status
- `GET /api/admin/farmers` - Get all farmers
- `GET /api/admin/dashboard/stats` - Dashboard statistics

### Public
- `GET /api/health` - Health check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and community service purposes.

## 👥 Credits

Developed for the Municipality of Norala, South Cotabato, Philippines.

## 📞 Support

For issues or questions:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review application logs
3. Test locally first
4. Check environment variables

---

**Built with ❤️ for Filipino farmers**
