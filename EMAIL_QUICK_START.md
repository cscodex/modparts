# 🚀 Quick Start Email Setup (No Custom Domain Required)

Since you're using `sardaarjiautoparts.onrender.com`, here are immediate solutions to get emails working:

## **Option 1: Use Resend's Default Domain (Recommended for Testing)**

### Step 1: Sign up for Resend
1. Go to [resend.com](https://resend.com)
2. Create a free account
3. Skip domain verification for now

### Step 2: Get API Key
1. Go to API Keys in Resend dashboard
2. Create a new API key
3. Copy the key (starts with `re_`)

### Step 3: Configure Environment Variables
In your Supabase Dashboard → Project Settings → Edge Functions:
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_kre_6S72V7sU_HTjr6dzg1D6SvN8fSRYkLaKvey_here
FROM_EMAIL=onboarding@resend.dev
```

### Step 4: Deploy Edge Function
```bash
supabase functions deploy send-order-email
```

### Step 5: Test
Place a test order - you should receive emails from `onboarding@resend.dev`

---

## **Option 2: Use SendGrid's Default Domain**

### Step 1: Sign up for SendGrid
1. Go to [sendgrid.com](https://sendgrid.com)
2. Create free account (100 emails/day)

### Step 2: Get API Key
1. Go to Settings → API Keys
2. Create new API key with "Mail Send" permissions
3. Copy the key (starts with `SG.`)

### Step 3: Update Edge Function for SendGrid
Add this to your environment variables:
```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
FROM_EMAIL=noreply@sendgrid.net
```

---

## **Option 3: Gmail SMTP (For Development Only)**

### Step 1: Enable App Passwords in Gmail
1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate app password for "Mail"

### Step 2: Configure Environment Variables
```bash
EMAIL_PROVIDER=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your_app_password_here
FROM_EMAIL=your-email@gmail.com
```

**Note**: Gmail has daily sending limits (500 emails/day)

---

## **Option 4: Get a Custom Domain (Production Solution)**

### Cheap Domain Options:
1. **Namecheap**: `sardaarjiautoparts.com` (~$10/year)
2. **Cloudflare**: `sardaarjiautoparts.com` (~$10/year)
3. **Freenom**: `sardaarjiautoparts.tk` (Free)

### After Getting Domain:
1. Point domain to Render using CNAME
2. Add custom domain in Render dashboard
3. Verify domain with email provider
4. Use `orders@sardaarjiautoparts.com`

---

## **Current Configuration (Immediate Fix)**

For immediate testing, use this configuration:

### Environment Variables in Supabase:
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
```

### Test Email Flow:
1. Customer places order → Email from `onboarding@resend.dev`
2. Admin changes status → Status update from `onboarding@resend.dev`
3. All emails will have Sardaarji Auto Parts branding

---

## **Email Limitations by Provider**

### Resend (Free Tier):
- ✅ 3,000 emails/month
- ✅ Professional delivery
- ✅ Good reputation
- ❌ "via resend.dev" in some email clients

### SendGrid (Free Tier):
- ✅ 100 emails/day (3,000/month)
- ✅ Professional delivery
- ✅ Advanced analytics
- ❌ "via sendgrid.net" in some email clients

### Gmail SMTP:
- ✅ Free
- ✅ Familiar sender
- ❌ 500 emails/day limit
- ❌ Not professional for business
- ❌ May be marked as spam

---

## **Recommended Approach**

### Phase 1: Immediate (Today)
```bash
# Use Resend with default domain
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
```

### Phase 2: Professional (Within 1 week)
1. Buy `sardaarjiautoparts.com` domain
2. Configure DNS to point to Render
3. Verify domain with Resend
4. Update to `orders@sardaarjiautoparts.com`

---

## **Setup Commands**

### 1. Deploy Updated Edge Function:
```bash
supabase functions deploy send-order-email
```

### 2. Run Database Setup:
```sql
-- Copy contents of database-optimization-indexes.sql
-- Paste in Supabase SQL Editor and run
```

### 3. Test Email:
```javascript
// In browser console on your site:
import { emailService } from './src/services/emailService.js';
await emailService.testEmailConfiguration();
```

---

## **Troubleshooting**

### "Domain not verified" error:
- Use `onboarding@resend.dev` instead of custom domain

### "API key invalid" error:
- Check API key is correctly set in Supabase environment variables
- Ensure no extra spaces in the key

### Emails not sending:
- Check Supabase Edge Function logs
- Verify environment variables are set
- Test with simple email first

---

## **Next Steps**

1. **Choose Option 1 (Resend)** for immediate setup
2. **Test with sample order** to verify emails work
3. **Plan for custom domain** for professional appearance
4. **Monitor email logs** in Supabase dashboard

The system will work immediately with any of these options - you don't need to wait for a custom domain!
