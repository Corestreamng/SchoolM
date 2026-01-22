# Frontend Deployment Guide (Vercel)

This repository contains 4 separate Next.js dashboard applications:
1. `school-admin-dashboard-master` - Admin Dashboard
2. `staff-dashboard-main` - Staff Dashboard
3. `student-dashboard-app-main` - Student Dashboard
4. `parent-dashboard-main` - Parent Dashboard

## Prerequisites
- Vercel account
- GitHub repository access
- API deployed at https://anodaapi.coreskool.xyz

## Deployment Steps for Each Dashboard

### Step 1: Import Project to Vercel
1. Log in to [Vercel](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository `Corestreamng/SchoolM`
4. Select the dashboard folder you want to deploy

### Step 2: Configure Build Settings

For each dashboard, use these settings:

**Root Directory:**
- Admin: `school-admin-dashboard-master`
- Staff: `staff-dashboard-main`
- Student: `student-dashboard-app-main`
- Parent: `parent-dashboard-main`

**Framework Preset:** Next.js

**Build Command:** `npm run build` (default)

**Output Directory:** `.next` (default)

**Install Command:** `npm install` (default)

### Step 3: Configure Environment Variables

Add this environment variable in Vercel project settings:

```
NEXT_PUBLIC_API_URL=https://anodaapi.coreskool.xyz/api
```

To add environment variables in Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the variable for all environments (Production, Preview, Development)

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

### Step 5: Configure Custom Domains (Optional)

Suggested domain structure:
- Admin Dashboard: `admin.coreskool.xyz`
- Staff Dashboard: `staff.coreskool.xyz`
- Student Dashboard: `student.coreskool.xyz`
- Parent Dashboard: `parent.coreskool.xyz`

To add custom domains:
1. Go to project Settings → Domains
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Quick Deploy Links

After initial setup, you can deploy updates by:
1. Pushing to your GitHub repository
2. Vercel will automatically deploy the changes

## Local Development

To test locally before deploying:

```bash
# Navigate to dashboard folder
cd school-admin-dashboard-master  # or any other dashboard

# Install dependencies
npm install

# Create .env.local file (already created in repository)
# It should contain: NEXT_PUBLIC_API_URL=https://anodaapi.coreskool.xyz/api

# Run development server
npm run dev

# Open http://localhost:3000
```

## Environment Variables Reference

Each dashboard requires only one environment variable:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://anodaapi.coreskool.xyz/api` | API endpoint URL |

## Troubleshooting

### API Connection Failed
- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check API is accessible at https://anodaapi.coreskool.xyz/api
- Verify CORS settings in API allow your Vercel domains

### Build Failed
- Check build logs in Vercel dashboard
- Ensure all dependencies are listed in `package.json`
- Verify Node.js version compatibility

### Authentication Issues
- Clear browser cache and cookies
- Check API logs for authentication errors
- Verify Sanctum configuration in API

## Multiple Dashboard Deployment

You'll need to deploy each dashboard as a separate Vercel project:

1. **Admin Dashboard** → Project 1
2. **Staff Dashboard** → Project 2
3. **Student Dashboard** → Project 3
4. **Parent Dashboard** → Project 4

Each project should point to its respective folder as the root directory.

## Post-Deployment Checklist

- [ ] API is accessible at https://anodaapi.coreskool.xyz
- [ ] All 4 dashboards are deployed to Vercel
- [ ] Environment variables are set for each dashboard
- [ ] Login functionality works
- [ ] CORS allows requests from Vercel domains
- [ ] Custom domains configured (if applicable)

## Support

For issues:
1. Check Vercel build logs
2. Check API logs at `api/storage/logs/laravel.log`
3. Verify environment variables are correctly set
