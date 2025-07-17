# 📧 Email System Setup Guide for Supabase

This guide will help you set up automated email notifications for order confirmations and status updates using Supabase Edge Functions.

## 🚀 Quick Setup Overview

1. **Choose Email Provider** (Resend recommended)
2. **Deploy Edge Function** to Supabase
3. **Configure Environment Variables**
4. **Run Database Setup** (indexes + email tables)
5. **Test Email System**

---

## 📋 Step 1: Choose Email Provider

### Option A: Resend (Recommended) ⭐
- **Free tier**: 3,000 emails/month
- **Easy setup**: Simple API
- **Good deliverability**: High inbox rates
- **Cost**: $20/month for 50k emails

**Setup:**
1. Go to [resend.com](https://resend.com)
2. Create account and verify domain
3. Get API key from dashboard
4. Add DNS records for domain verification

### Option B: SendGrid
- **Free tier**: 100 emails/day
- **Enterprise features**: Advanced analytics
- **Cost**: $19.95/month for 50k emails

### Option C: Mailgun
- **Free tier**: 5,000 emails/month (3 months)
- **Developer-friendly**: Powerful API
- **Cost**: $35/month for 50k emails

---

## 🛠️ Step 2: Deploy Edge Function

### Install Supabase CLI
```bash
npm install -g supabase
```

### Login to Supabase
```bash
supabase login
```

### Link to your project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Deploy the email function
```bash
# Navigate to your project root
cd /path/to/your/project

# Deploy the function
supabase functions deploy send-order-email
```

---

## 🔧 Step 3: Configure Environment Variables

### In Supabase Dashboard:
1. Go to **Project Settings** → **Edge Functions**
2. Add these environment variables:

```bash
# Required for Resend
RESEND_API_KEY=re_your_api_key_here

# Your sending email address
FROM_EMAIL=orders@sardaarjiautoparts.com

# Supabase configuration (auto-filled usually)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Alternative: Using .env file for local development
```bash
# Create supabase/.env file
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=orders@sardaarjiautoparts.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🗄️ Step 4: Database Setup

### Run the SQL script in Supabase SQL Editor:

```sql
-- Copy and paste the entire contents of database-optimization-indexes.sql
-- This will create:
-- 1. All performance indexes
-- 2. Email logs table
-- 3. Automatic email triggers
-- 4. Email tracking system
```

### Verify tables were created:
```sql
-- Check if email_logs table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'email_logs';

-- Check if triggers were created
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE '%email%';
```

---

## 🧪 Step 5: Test Email System

### Test 1: Manual Email Test
```javascript
// In browser console or test file
import { emailService } from './src/services/emailService.js';

// Test email configuration
const result = await emailService.testEmailConfiguration();
console.log(result);
```

### Test 2: Create Test Order
1. Place a test order through your application
2. Check email logs in database:
```sql
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 5;
```

### Test 3: Update Order Status
1. Go to admin panel
2. Change order status to "shipped"
3. Verify email was sent automatically

---

## 🔄 Integration with Your Application

### Automatic Emails (Already Configured)
- ✅ **Order Confirmation**: Sent when order is created
- ✅ **Order Shipped**: Sent when status changes to "shipped"
- ✅ **Order Delivered**: Sent when status changes to "delivered"
- ✅ **Order Cancelled**: Sent when status changes to "cancelled"

### Manual Email Sending
```javascript
import { emailService } from './services/emailService';

// Send order confirmation manually
await emailService.sendOrderConfirmation(orderData);

// Send status update manually
await emailService.sendOrderStatusUpdate(orderData, 'shipped');

// Send welcome email
await emailService.sendWelcomeEmail(userData);
```

### Admin Panel Integration
```javascript
// Resend email from admin panel
const resendEmail = async (orderId, emailType) => {
  try {
    await emailService.resendOrderEmail(orderId, emailType);
    alert('Email sent successfully!');
  } catch (error) {
    alert('Failed to send email: ' + error.message);
  }
};

// View email logs
const viewEmailLogs = async (orderId) => {
  const logs = await emailService.getEmailLogs(orderId);
  console.log('Email logs:', logs);
};
```

---

## 📊 Monitoring & Analytics

### Email Logs Table Structure
```sql
-- View email statistics
SELECT 
  email_type,
  status,
  COUNT(*) as count,
  DATE(sent_at) as date
FROM email_logs 
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY email_type, status, DATE(sent_at)
ORDER BY date DESC;
```

### Common Queries
```sql
-- Failed emails in last 24 hours
SELECT * FROM email_logs 
WHERE status = 'failed' 
AND created_at >= NOW() - INTERVAL '24 hours';

-- Email success rate
SELECT 
  email_type,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) * 100.0 / COUNT(*) as success_rate
FROM email_logs 
GROUP BY email_type;
```

---

## 🚨 Troubleshooting

### Common Issues:

#### 1. "Function not found" error
```bash
# Redeploy the function
supabase functions deploy send-order-email --no-verify-jwt
```

#### 2. "API key invalid" error
- Check RESEND_API_KEY in environment variables
- Verify API key is active in Resend dashboard

#### 3. "Domain not verified" error
- Complete domain verification in email provider
- Use verified sending domain

#### 4. Emails not sending automatically
```sql
-- Check if triggers exist
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE '%email%';

-- Check function exists
SELECT * FROM information_schema.routines 
WHERE routine_name LIKE '%email%';
```

#### 5. Permission errors
```sql
-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.email_logs TO authenticated;
```

---

## 💰 Cost Estimation

### Resend Pricing (Recommended)
- **Free**: 3,000 emails/month
- **Pro**: $20/month for 50,000 emails
- **Business**: $85/month for 300,000 emails

### Expected Usage for Auto Parts Store:
- **Order confirmations**: ~100-500/month
- **Status updates**: ~300-1500/month (3x orders)
- **Welcome emails**: ~50-200/month
- **Total**: ~450-2200/month

**Recommendation**: Start with free tier, upgrade to Pro when needed.

---

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit API keys to git
2. **RLS Policies**: Email logs are admin-only by default
3. **Rate Limiting**: Implement in Edge Function if needed
4. **Email Validation**: Validate email addresses before sending
5. **Unsubscribe**: Add unsubscribe links for marketing emails

---

## 📈 Next Steps

1. **Set up email provider** (Resend recommended)
2. **Deploy Edge Function** with your API keys
3. **Run database setup** script
4. **Test with sample order**
5. **Monitor email logs** for issues
6. **Add custom email templates** as needed

---

## 🆘 Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Verify environment variables
3. Test email provider API directly
4. Check database triggers and functions
5. Review email logs table for errors

**Need help?** Check the troubleshooting section or contact support.
