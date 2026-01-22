# API Deployment Guide

## Prerequisites
- PHP 8.1 or higher
- MySQL database
- Composer installed on server
- Apache/Nginx web server
- SSL certificate configured for https://anodaapi.coreskool.xyz

## Deployment Steps

### 1. Upload Files
Upload the entire `api` folder to your hosting server. The document root should point to the `api/public` folder.

### 2. Database Configuration
Create your database and update the `.env` file with your database credentials:
```
DB_DATABASE=your_database_name
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

### 3. Install Dependencies
```bash
cd api
composer install --optimize-autoloader --no-dev
```

### 4. Generate Application Key
```bash
php artisan key:generate
```

### 5. Run Database Migrations
```bash
php artisan migrate --force
```

### 6. Optimize for Production
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 7. Set Proper Permissions
```bash
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### 8. Configure Web Server

#### For Apache (using .htaccess)
Ensure your document root points to the `public` folder:
```
DocumentRoot /path/to/api/public
```

The `.htaccess` file is already configured.

#### For Nginx
Add this configuration:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name anodaapi.coreskool.xyz;
    root /path/to/api/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 9. SSL Configuration
Ensure SSL is properly configured for https://anodaapi.coreskool.xyz

### 10. Test API
Visit https://anodaapi.coreskool.xyz/api to verify the API is working.

## Important Security Notes

1. The `.env` file contains sensitive credentials - ensure it's not publicly accessible
2. Set `APP_DEBUG=false` in production (already configured)
3. Keep Laravel and dependencies updated
4. Monitor error logs in `storage/logs/laravel.log`
5. **CSRF Protection**: Laravel Sanctum provides built-in CSRF protection for authenticated requests. The session is configured with `SameSite=none` to support cross-domain authentication with Vercel frontends.
6. **CORS Security**: The Vercel wildcard pattern allows preview deployments. Once in production, you can restrict this to only specific domains by editing `config/cors.php`.

## CORS Configuration
The API is configured to allow requests from:
- https://admin.coreskool.xyz
- https://staff.coreskool.xyz
- https://student.coreskool.xyz
- https://parent.coreskool.xyz
- https://coreskool.xyz
- Any *.vercel.app domains (for staging)

## Troubleshooting

### "500 Internal Server Error"
- Check `storage/logs/laravel.log`
- Verify file permissions
- Ensure all dependencies are installed

### Database Connection Failed
- Verify database credentials in `.env`
- Check database server is running
- Ensure database user has proper permissions

### Authentication Issues
- Clear config cache: `php artisan config:clear`
- Verify SANCTUM_STATEFUL_DOMAINS in `.env`
- Check CORS settings in `config/cors.php`
