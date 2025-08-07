-- Add financial_goal column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN financial_goal TEXT;