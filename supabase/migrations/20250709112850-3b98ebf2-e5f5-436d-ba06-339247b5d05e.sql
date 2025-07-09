-- Fix infinite recursion in guild_members policies by creating security definer functions

-- Create function to check if user is guild member (security definer to bypass RLS)
CREATE OR REPLACE FUNCTION public.is_guild_member(p_user_id uuid, p_guild_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.guild_members
    WHERE user_id = p_user_id 
    AND guild_id = p_guild_id 
    AND is_active = true
  );
$$;

-- Create function to check if user is guild leader/officer
CREATE OR REPLACE FUNCTION public.is_guild_leader_or_officer(p_user_id uuid, p_guild_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.guild_members
    WHERE user_id = p_user_id 
    AND guild_id = p_guild_id 
    AND role IN ('leader', 'officer')
    AND is_active = true
  );
$$;

-- Get user's profile id from auth uid
CREATE OR REPLACE FUNCTION public.get_user_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Membros podem ver seus membros de guild" ON public.guild_members;
DROP POLICY IF EXISTS "Membros podem sair das guilds" ON public.guild_members;

-- Create new policies using security definer functions
CREATE POLICY "Membros podem ver seus membros de guild"
ON public.guild_members
FOR SELECT
USING (
  public.is_guild_member(public.get_user_profile_id(), guild_id)
);

CREATE POLICY "Membros podem sair das guilds"
ON public.guild_members
FOR UPDATE
USING (
  user_id = public.get_user_profile_id() OR
  public.is_guild_leader_or_officer(public.get_user_profile_id(), guild_id)
);