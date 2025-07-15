# Install Email Packages

Run these commands in your project root:

```bash
# Install nodemailer for sending emails
npm install nodemailer

# Install crypto for generating secure tokens (usually built-in)
# npm install crypto

# Optional: Install email templates
npm install handlebars

# Optional: Install email validation
npm install validator
```

## Environment Variables

Add these to your `.env.local` file:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
SMTP_FROM_NAME=Sardaarji Auto Parts

# Email Verification
EMAIL_VERIFICATION_URL=https://sardaarjiautoparts.onrender.com/verify-email
EMAIL_VERIFICATION_EXPIRES_HOURS=24

# For development
# EMAIL_VERIFICATION_URL=http://localhost:3000/verify-email
```

## Gmail Setup (if using Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in SMTP_PASS

## Alternative Email Services

- **SendGrid**: Professional email service
- **Mailgun**: Developer-friendly email API
- **AWS SES**: Amazon's email service
- **Resend**: Modern email API
