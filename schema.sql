-- ==========================================
-- QuantStakes Supabase Database Migration
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==========================================

-- 1. Add bio column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- 2. Add social metric counters to profiles table (Default 0)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS followers_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscribers_count INT DEFAULT 0;

-- 3. Add profile_mode column for tipster status
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_mode TEXT DEFAULT 'tracker';
