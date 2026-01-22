# Production Configuration Guide

## ⚠️ IMPORTANT: Environment Setup

This file contains instructions for setting up the production environment. **DO NOT commit the `.env` file to version control.**

## Quick Setup for Production

### 1. Copy and Edit Environment File

After uploading the API folder to your server:

```bash
cd api
cp .env.example .env
```

### 2. Update Database Credentials in `.env`

Edit the `.env` file with your actual production credentials:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://anodaapi.coreskool.xyz

DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password

SESSION_DOMAIN=.coreskool.xyz
SANCTUM_STATEFUL_DOMAINS=admin.coreskool.xyz,staff.coreskool.xyz,student.coreskool.xyz,parent.coreskool.xyz
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Complete Setup

Follow the remaining steps in [DEPLOYMENT.md](./DEPLOYMENT.md)

## Production Credentials Structure

Your hosting provider should give you:
- Database name (DB_DATABASE)
- Database username (DB_USERNAME)  
- Database password (DB_PASSWORD)
- Database host (usually 127.0.0.1 or localhost)

## Frontend Integration

The frontend dashboards are configured to connect to:
```
https://anodaapi.coreskool.xyz/api
```

Make sure your web server is configured to serve the API at this URL.

## Security Checklist

- [ ] `.env` file is NOT committed to git
- [ ] `APP_DEBUG=false` in production
- [ ] `APP_ENV=production` is set
- [ ] SSL certificate is installed
- [ ] File permissions are set correctly (755 for directories, 644 for files)
- [ ] Storage and bootstrap/cache folders are writable
- [ ] Database credentials are secure

## Support

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
