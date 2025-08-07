-- Remover função existente para recriá-la
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.get_admin_role(uuid);

-- Criar função para verificar se um email é admin master
CREATE OR REPLACE FUNCTION public.is_master_admin(email_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN email_check = 'fasdurian@gmail.com';
END;
$$;

-- Atualizar função is_admin para incluir verificação de master admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  -- Buscar email do usuário
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_uuid;
  
  -- Se é master admin, retorna true
  IF public.is_master_admin(user_email) THEN
    RETURN true;
  END IF;
  
  -- Caso contrário, verifica na tabela admin_users
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = user_uuid 
    AND is_active = true
  );
END;
$$;

-- Função para obter role do admin
CREATE OR REPLACE FUNCTION public.get_admin_role(user_uuid uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  -- Buscar email do usuário
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_uuid;
  
  -- Se é master admin, retorna super_admin
  IF public.is_master_admin(user_email) THEN
    RETURN 'super_admin';
  END IF;
  
  -- Caso contrário, busca na tabela admin_users
  SELECT role::text INTO user_email
  FROM public.admin_users
  WHERE user_id = user_uuid 
  AND is_active = true;
  
  RETURN COALESCE(user_email, 'admin');
END;
$$;