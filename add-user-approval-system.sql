-- Add user approval system to users table
-- Run this in your Supabase SQL Editor

-- Add status column for user approval system
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending_approval', 'active', 'rejected', 'suspended'));

-- Add approval tracking columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approval_reason TEXT;

-- Create index for status lookups
CREATE INDEX IF NOT EXISTS idx_users_status 
ON public.users(status);

-- Create index for pending approval queries
CREATE INDEX IF NOT EXISTS idx_users_pending_approval 
ON public.users(status, created_at) WHERE status = 'pending_approval';

-- Update existing users to be active (so they can continue logging in)
UPDATE public.users 
SET status = 'active', approved_at = created_at 
WHERE status IS NULL OR status = '';

-- Set email_verified to true for all users (disable email verification)
UPDATE public.users 
SET email_verified = TRUE 
WHERE email_verified IS NULL OR email_verified = FALSE;

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('status', 'approved_at', 'approval_reason', 'email_verified')
ORDER BY column_name;

-- Check current user statuses
SELECT 
    status,
    COUNT(*) as count
FROM public.users 
GROUP BY status
ORDER BY status;
