# 🚀 Quick Start - Production Deployment Guide

This guide will help you deploy your CoreSkool application with the configuration you provided.

## 📋 What's Been Configured

✅ **API Configuration**
- Database: `coreskool_anoda`
- Username: `coreskool_anodadev`
- Password: `@nod@_6565!$.`
- API URL: `https://anodaapi.coreskool.xyz`

✅ **CORS Settings**
- Configured to allow Vercel deployments
- Supports both production and preview URLs

✅ **Frontend Configuration**
- All 4 dashboards configured to connect to your API
- Environment variables ready for Vercel deployment

## 🎯 Deployment Steps

### Step 1: Upload API to Your Hosting

1. **Upload the `api` folder** to your hosting account
2. **Set document root** to `api/public` folder
3. **Create `.env` file** from `.env.example`:
   ```bash
   cd api
   cp .env.example .env
   ```
4. **Update the database credentials** in `.env`:
   ```env
   DB_DATABASE=coreskool_anoda
   DB_USERNAME=coreskool_anodadev
   DB_PASSWORD=@nod@_6565!$.
   ```
5. **Install dependencies and setup**:
   ```bash
   composer install --optimize-autoloader --no-dev
   php artisan key:generate
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   ```
6. **Set permissions**:
   ```bash
   chmod -R 755 storage bootstrap/cache
   ```

### Step 2: Deploy Dashboards to Vercel

For each of the 4 dashboards:

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repository
3. Configure each project:

   **Admin Dashboard:**
   - Root Directory: `school-admin-dashboard-master`
   - Environment Variable: `NEXT_PUBLIC_API_URL=https://anodaapi.coreskool.xyz/api`

   **Staff Dashboard:**
   - Root Directory: `staff-dashboard-main`
   - Environment Variable: `NEXT_PUBLIC_API_URL=https://anodaapi.coreskool.xyz/api`

   **Student Dashboard:**
   - Root Directory: `student-dashboard-app-main`
   - Environment Variable: `NEXT_PUBLIC_API_URL=https://anodaapi.coreskool.xyz/api`

   **Parent Dashboard:**
   - Root Directory: `parent-dashboard-main`
   - Environment Variable: `NEXT_PUBLIC_API_URL=https://anodaapi.coreskool.xyz/api`

4. Click **Deploy** for each

### Step 3: Verify Everything Works

1. ✅ API is accessible at: `https://anodaapi.coreskool.xyz/api`
2. ✅ Each dashboard loads correctly
3. ✅ Login functionality works
4. ✅ Data loads from API

## 📁 Files You Need to Upload

Only upload the **`api`** folder to your hosting. The frontend dashboards will be deployed to Vercel automatically.

```
Your Hosting (anodaapi.coreskool.xyz)
└── api/
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/  ← Document root should point here
    ├── routes/
    ├── storage/
    ├── vendor/
    ├── .env  ← Create this from .env.example
    └── ...
```

## 🔑 Important Notes

### API Setup
- Make sure your hosting supports PHP 8.1+
- Ensure the document root points to `api/public`
- The `.env` file will NOT be in the repository - you need to create it from `.env.example`

### Database
- Create the database `coreskool_anoda` if it doesn't exist
- The migrations will create all necessary tables

### Vercel Setup
- You'll need to deploy each dashboard as a **separate Vercel project**
- Make sure to set the environment variable `NEXT_PUBLIC_API_URL` for each

## 📚 Detailed Documentation

If you need more details:
- 📖 [API Deployment Guide](api/DEPLOYMENT.md) - Complete API setup instructions
- 📖 [Vercel Deployment Guide](VERCEL_DEPLOYMENT.md) - Detailed frontend deployment
- 📖 [Production Setup](api/PRODUCTION_SETUP.md) - Production configuration

## ❓ Common Issues

**"500 Internal Server Error"**
- Check that document root points to `api/public`
- Verify file permissions on `storage` and `bootstrap/cache`
- Check `api/storage/logs/laravel.log` for errors

**"Database connection failed"**
- Verify credentials in `.env` file match your database
- Ensure database exists: `coreskool_anoda`

**"CORS Error" in browser**
- Verify API is accessible at `https://anodaapi.coreskool.xyz/api`
- Check that Vercel URLs are included in allowed origins

**Can't login**
- Clear browser cache and cookies
- Check API logs for authentication errors
- Run `php artisan config:clear` on server

## ✅ Deployment Checklist

- [ ] API folder uploaded to hosting
- [ ] Document root set to `api/public`
- [ ] `.env` file created with correct credentials
- [ ] `composer install` completed
- [ ] `php artisan key:generate` executed
- [ ] `php artisan migrate --force` completed
- [ ] Permissions set correctly
- [ ] API accessible at https://anodaapi.coreskool.xyz/api
- [ ] Admin dashboard deployed to Vercel
- [ ] Staff dashboard deployed to Vercel
- [ ] Student dashboard deployed to Vercel
- [ ] Parent dashboard deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Login tested and working

## 🎉 That's It!

Once you complete these steps, your CoreSkool application will be fully deployed and ready to use!
