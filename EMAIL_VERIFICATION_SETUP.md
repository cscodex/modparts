# 📧 Email Verification Setup Guide

Your Sardaarji Auto Parts application now has email verification functionality built-in! Follow these steps to activate it.

## 🗄️ Step 1: Database Setup

1. **Go to Supabase Dashboard** → Your Project → SQL Editor
2. **Copy and paste** the SQL from `add-email-verification.sql`
3. **Click "Run"** to add email verification columns to your users table

## 📦 Step 2: Package Installation ✅

✅ **Already Done!** - `nodemailer` package has been installed.

## 🔧 Step 3: Environment Variables

Add these to your `.env.local` file (copy from `.env.example`):

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=Sardaarji Auto Parts

# Email Verification Settings
EMAIL_VERIFICATION_URL=https://sardaarjiautoparts.onrender.com/verify-email
EMAIL_VERIFICATION_EXPIRES_HOURS=24
```

## 📧 Step 4: Gmail Setup (Recommended)

### Option A: Gmail with App Password (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to [Google Account settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
   - Use this password in `SMTP_PASS`

### Option B: Alternative Email Services

- **SendGrid**: Professional email service
- **Mailgun**: Developer-friendly email API  
- **AWS SES**: Amazon's email service
- **Resend**: Modern email API

## 🛣️ Step 5: Frontend Routes ✅

✅ **Already Done!** - Email verification routes have been added:
- `/verify-email` - Email verification page
- `/resend-verification` - Resend verification page

## 🎯 Step 6: Test Your Setup

1. **Run the database SQL** → Add email verification columns
2. **Set up email credentials** → Configure SMTP settings
3. **Register a new user** → Should send verification email
4. **Check email inbox** → Should receive verification email
5. **Click verification link** → Should verify and auto-login

## 🔄 How It Works

### Registration Flow:
1. **User registers** → Email verification email sent
2. **User gets message** → "Check your email to verify account"
3. **User clicks email link** → Email verified, auto-login
4. **Welcome email sent** → Professional welcome message

### Login Flow:
1. **Unverified user tries login** → "Please verify your email" message
2. **Resend link shown** → User can request new verification email
3. **After verification** → Normal login works

## 🎨 Features Included

### ✅ Professional Email Templates
- **Verification Email**: Branded email with your logo and colors
- **Welcome Email**: Sent after successful verification
- **Responsive Design**: Works on all email clients

### ✅ Security Features
- **Secure Tokens**: Cryptographically secure verification tokens
- **Token Expiration**: 24-hour expiration (configurable)
- **Rate Limiting**: 1-minute cooldown between resend requests
- **Input Validation**: Proper email and token validation

### ✅ User Experience
- **Auto-login**: Automatic login after email verification
- **Clear Messages**: User-friendly success/error messages
- **Resend Option**: Easy resend verification email
- **Mobile Friendly**: Responsive design for all devices

## 🚨 Current Status

- ✅ **Database Schema**: Ready (run SQL to activate)
- ✅ **Backend APIs**: Email verification endpoints ready
- ✅ **Frontend Pages**: Verification and resend pages ready
- ✅ **Email Service**: Professional email templates ready
- ⏳ **Configuration**: Needs SMTP credentials

## 🎯 Next Steps

1. **Run the SQL** in Supabase to add database columns
2. **Set up email credentials** (Gmail app password recommended)
3. **Test with a new user registration**
4. **Customize email templates** if desired (optional)

## 🔧 Troubleshooting

### Email Not Sending?
- Check SMTP credentials are correct
- Verify Gmail app password (not regular password)
- Check spam folder
- Verify environment variables are loaded

### Verification Link Not Working?
- Check EMAIL_VERIFICATION_URL is correct
- Verify token hasn't expired (24 hours)
- Check browser console for errors

### Database Errors?
- Ensure SQL script was run successfully
- Check Supabase logs for errors
- Verify column names match

## 📞 Support

If you need help with setup, the email verification system is designed to be optional - your app will work normally without it until you complete the configuration.

Once configured, users will get a professional email verification experience that enhances security and user engagement!
