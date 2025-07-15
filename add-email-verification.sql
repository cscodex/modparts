-- Add email verification fields to users table
-- Run this in your Supabase SQL Editor

-- Add email verification columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_verification_sent_at TIMESTAMP WITH TIME ZONE;

-- Create index for verification token lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token 
ON public.users(email_verification_token);

-- Create index for verification expiry cleanup
CREATE INDEX IF NOT EXISTS idx_users_verification_expires 
ON public.users(email_verification_expires);

-- Update existing users to be verified (optional - for existing users)
-- Uncomment the line below if you want existing users to be automatically verified
-- UPDATE public.users SET email_verified = TRUE WHERE email_verified IS NULL;

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('email_verified', 'email_verification_token', 'email_verification_expires', 'email_verification_sent_at')
ORDER BY column_name;
