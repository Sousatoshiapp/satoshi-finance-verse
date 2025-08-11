-- Correção definitiva para recursão infinita nas políticas admin_users

-- 1. Criar função SECURITY DEFINER que quebra a recursão
CREATE OR REPLACE FUNCTION public.check_user_is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = user_uuid 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Remover políticas problemáticas que causam recursão
DROP POLICY IF EXISTS "Super admins can view all admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON public.admin_users;

-- 3. Criar políticas sem recursão usando a função segura
CREATE POLICY "Admins can view admin users" ON public.admin_users
FOR SELECT USING (public.check_user_is_admin(auth.uid()));

CREATE POLICY "Admins can manage admin users" ON public.admin_users  
FOR ALL USING (public.check_user_is_admin(auth.uid()));

-- 4. Atualizar função is_admin para usar a nova função também
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN public.check_user_is_admin(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;