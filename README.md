# CoreSkool - School Management System

A comprehensive school management system with separate dashboards for administrators, staff, students, and parents.

## 🏗️ Architecture

- **Backend API**: Laravel (PHP) - RESTful API with authentication
- **Frontend Dashboards**: Next.js (TypeScript/React) - 4 separate dashboard applications
- **Database**: MySQL
- **Authentication**: Laravel Sanctum

## 📁 Repository Structure

```
SchoolM/
├── api/                              # Laravel Backend API
│   ├── .env.example                  # Environment template
│   ├── DEPLOYMENT.md                 # API deployment guide
│   └── PRODUCTION_SETUP.md          # Production setup instructions
│
├── school-admin-dashboard-master/    # Admin Dashboard (Next.js)
│   └── .env.example                  # API URL configuration
│
├── staff-dashboard-main/             # Staff Dashboard (Next.js)
│   └── .env.example                  # API URL configuration
│
├── student-dashboard-app-main/       # Student Dashboard (Next.js)
│   └── .env.example                  # API URL configuration
│
├── parent-dashboard-main/            # Parent Dashboard (Next.js)
│   └── .env.example                  # API URL configuration
│
└── VERCEL_DEPLOYMENT.md              # Frontend deployment guide
```

## 🚀 Quick Start - Production Deployment

### Prerequisites
- PHP 8.1+ with MySQL
- Node.js 18+
- Web hosting with SSL (for API)
- Vercel account (for frontends)

### Step 1: Deploy the API

1. Upload the `api` folder to your hosting at `https://anodaapi.coreskool.xyz`
2. Follow the detailed instructions in [`api/DEPLOYMENT.md`](api/DEPLOYMENT.md)

**Key Configuration:**
- Point document root to `api/public` folder
- Create `.env` from `.env.example`
- Update database credentials
- Run `php artisan key:generate`
- Run migrations: `php artisan migrate --force`

### Step 2: Deploy Frontend Dashboards to Vercel

Each dashboard needs to be deployed as a separate Vercel project.

1. Import the repository to Vercel (4 times, once for each dashboard)
2. Set the root directory for each project:
   - Admin: `school-admin-dashboard-master`
   - Staff: `staff-dashboard-main`
   - Student: `student-dashboard-app-main`
   - Parent: `parent-dashboard-main`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://anodaapi.coreskool.xyz/api`
4. Deploy

For detailed instructions, see [`VERCEL_DEPLOYMENT.md`](VERCEL_DEPLOYMENT.md)

## 🔧 Configuration

### API Configuration

The API is configured to accept requests from:
- `admin.coreskool.xyz`
- `staff.coreskool.xyz`
- `student.coreskool.xyz`
- `parent.coreskool.xyz`
- `*.vercel.app` (for preview deployments)

**Key Settings in `.env`:**
```env
APP_URL=https://anodaapi.coreskool.xyz
SESSION_DOMAIN=.coreskool.xyz
SANCTUM_STATEFUL_DOMAINS=admin.coreskool.xyz,staff.coreskool.xyz,student.coreskool.xyz,parent.coreskool.xyz
```

### Frontend Configuration

Each dashboard connects to the API via environment variable:
```env
NEXT_PUBLIC_API_URL=https://anodaapi.coreskool.xyz/api
```

## 💻 Local Development

### API Development

```bash
cd api
cp .env.example .env
# Edit .env with local database credentials
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend Development

```bash
cd school-admin-dashboard-master  # or any other dashboard
npm install
cp .env.example .env.local
# Edit .env.local if needed (defaults to localhost:8000)
npm run dev
```

## 📚 Documentation

- [API Deployment Guide](api/DEPLOYMENT.md) - Detailed API deployment instructions
- [API Production Setup](api/PRODUCTION_SETUP.md) - Production configuration guide
- [Vercel Deployment Guide](VERCEL_DEPLOYMENT.md) - Frontend deployment instructions

## 🔒 Security

- All sensitive credentials should be in `.env` files (never commit these)
- API runs with `APP_DEBUG=false` in production
- HTTPS enforced on all production endpoints
- CORS properly configured for authorized domains
- Session cookies secured with `SameSite=none` and `Secure` flags

## 🎯 Production URLs

### API
- Base URL: `https://anodaapi.coreskool.xyz`
- API Endpoint: `https://anodaapi.coreskool.xyz/api`

### Suggested Frontend URLs
- Admin: `https://admin.coreskool.xyz`
- Staff: `https://staff.coreskool.xyz`
- Student: `https://student.coreskool.xyz`
- Parent: `https://parent.coreskool.xyz`

## 🛠️ Troubleshooting

### API Issues
- Check `api/storage/logs/laravel.log`
- Verify database connection
- Ensure file permissions: `chmod -R 755 storage bootstrap/cache`

### Frontend Issues
- Verify `NEXT_PUBLIC_API_URL` environment variable
- Check browser console for CORS errors
- Clear browser cache and cookies

### Authentication Issues
- Clear API config cache: `php artisan config:clear`
- Verify SANCTUM_STATEFUL_DOMAINS includes your frontend domain
- Check CORS settings in `api/config/cors.php`

## 📋 Deployment Checklist

- [ ] API uploaded to hosting
- [ ] Database created and credentials configured
- [ ] `php artisan key:generate` executed
- [ ] Database migrations run
- [ ] API accessible at https://anodaapi.coreskool.xyz/api
- [ ] All 4 dashboards deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Login functionality tested
- [ ] CORS working correctly

## 🤝 Support

For deployment assistance:
1. Check the deployment guides (linked above)
2. Review error logs (API: `storage/logs/laravel.log`)
3. Verify all environment variables are correctly set

## 📄 License

[Add your license information here]
