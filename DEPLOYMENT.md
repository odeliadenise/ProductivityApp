# Cloudflare Deployment Guide

## Overview
This productivity app is ready for deployment to Cloudflare Pages with the following features:
- ✅ **Frontend**: Optimized React build with Vite
- ✅ **Email Notifications**: Task and event reminders
- ✅ **Settings Panel**: User preferences and notification controls
- ✅ **Cloud Ready**: Environment-based configuration

## Deployment Steps

### 1. Cloudflare Pages Setup

1. **Connect Repository**
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project"
   - Connect your GitHub repository
   - Select this repository

2. **Build Configuration**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

3. **Environment Variables**
   Set these in Cloudflare Pages → Settings → Environment variables:
   ```
   NODE_ENV=production
   VITE_API_URL=https://your-backend-api.com/api
   ```

### 2. Backend Deployment (Choose One)

#### Option A: Cloudflare Workers
```bash
# Install Wrangler CLI
npm install -g wrangler

# Configure and deploy
wrangler publish
```

#### Option B: Railway/Render/Heroku
1. Create new project
2. Connect repository  
3. Set environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-production-secret
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=Productivity App <your-email@gmail.com>
   ```
4. Deploy from `server/` directory

### 3. Environment Configuration

#### Frontend (.env)
```bash
VITE_API_URL=https://your-api-domain.com/api
```

#### Backend (.env)
```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret-here
DB_PATH=./database/productivity.db
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Productivity App <your-email@gmail.com>
```

### 4. Email Setup (Gmail Example)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Google Account → Security → App passwords
   - Generate password for "Productivity App"
3. **Use App Password** in EMAIL_PASS environment variable

### 5. Database Options

#### Development/Small Scale
- ✅ **SQLite** (included) - Single file database
- ✅ **Local file storage** - Works out of the box

#### Production Scale
- 🚀 **PostgreSQL** on Railway/Supabase
- 🚀 **Cloudflare D1** for serverless
- 🚀 **MongoDB Atlas** for document storage

## Features Included

### 📧 Email Notifications
- **Task Reminders**: 24 hours before due date
- **Event Reminders**: 2 hours before start time
- **HTML Email Templates**: Professional styled emails
- **User Preferences**: Control notification types

### ⚙️ Settings Panel
- **Account Information**: View user details
- **Notification Preferences**: Toggle email types
- **Test Notifications**: Send sample emails
- **Appearance Settings**: Theme selection (extensible)
- **Timezone Settings**: Localization support

### 🌐 Cloud Optimizations
- **Environment-based API URLs**
- **Production build optimizations**
- **Code splitting and lazy loading**
- **Static asset caching**
- **Security headers**

## Testing Notifications

1. **Access Settings**: Click gear icon in header
2. **Test Emails**: Use "Test Task Reminder" / "Test Event Reminder" buttons
3. **Check Email**: Verify delivery and formatting
4. **Configure Preferences**: Enable/disable notification types

## Production Checklist

- [ ] **Frontend deployed** to Cloudflare Pages
- [ ] **Backend deployed** with database
- [ ] **Environment variables** set correctly
- [ ] **Email service** configured and tested
- [ ] **API endpoints** accessible from frontend
- [ ] **HTTPS** enabled on both frontend and backend
- [ ] **Custom domain** configured (optional)

## Monitoring & Maintenance

### Health Check Endpoints
- `GET /api/health` - Server status
- `GET /api/preferences/test-notification` - Email service test

### Log Monitoring
- **Task Reminders**: Hourly cron job logs
- **Event Reminders**: 30-minute cron job logs
- **Email Delivery**: Success/failure tracking

### Database Backups
- **SQLite**: Regular file backups
- **Cloud DB**: Automated backup policies

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - ✅ Check EMAIL_* environment variables
   - ✅ Verify Gmail app password
   - ✅ Test with simple email service first

2. **API Connection Failed**
   - ✅ Verify VITE_API_URL points to backend
   - ✅ Check CORS configuration
   - ✅ Ensure backend is accessible

3. **Build Errors**
   - ✅ Run `npm ci` for clean install
   - ✅ Check Node.js version compatibility
   - ✅ Verify TypeScript compilation

### Performance Optimization

- **Code Splitting**: Automatic with Vite
- **Image Optimization**: Use WebP format
- **CDN**: Cloudflare automatically provides
- **Caching**: Static assets cached for 1 year

## Security Considerations

- 🔒 **HTTPS Enforcement**: Always use secure connections
- 🔒 **JWT Secrets**: Use strong, unique secrets in production
- 🔒 **Input Validation**: All user data sanitized
- 🔒 **Email Security**: App passwords, not main credentials
- 🔒 **CORS Configuration**: Restrict to known origins

## Cost Estimation

### Cloudflare Pages
- **Free Tier**: 1 build per minute, unlimited requests
- **Pro**: $20/month for advanced features

### Backend Hosting
- **Railway**: $5/month for small apps
- **Render**: $7/month for web services  
- **Heroku**: $7/month for basic dyno

### Email Service
- **Gmail**: Free for personal use
- **SendGrid**: Free tier: 100 emails/day
- **Mailgun**: Free tier: 5000 emails/month

**Total Monthly Cost**: $5-25 depending on scale and provider choices.

---

Your productivity app is now **production-ready** with email notifications, settings management, and cloud deployment configuration! 🚀