-- PERMITIR QUE ADMINS VEAN TODOS LOS USUARIOS
-- Ejecuta este script en Supabase para arreglar la lista de usuarios.

-- 1. Eliminar política vieja si existe (para evitar conflictos)
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;

-- 2. Política: Los usuarios normales solo ven su propio perfil
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- 3. Política: Los administradores ven TODOS los perfiles
CREATE POLICY "Admins can read all users"
ON public.users
FOR SELECT
USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Asegurarnos que RLS esté activo
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
