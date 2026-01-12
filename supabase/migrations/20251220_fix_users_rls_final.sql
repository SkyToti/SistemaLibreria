-- CORRECCIÓN DEFINITIVA RLS (CIRCULAR DEPENDENCY FIX)
-- Ejecuta este script para desbloquear la lectura de usuarios.

-- 1. Limpieza de políticas anteriores
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can read all data" ON public.users;

-- 2. Política Base: Todo usuario autenticado puede leer SU PROPIO registro.
-- Esto es fundamental para que el Sidebar sepa si eres admin o no.
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- 3. Función auxiliar segura (SECURITY DEFINER) para verificar si soy admin.
-- Al ser SECURITY DEFINER, esta función se salta el RLS para comprobar el rol,
-- evitando el ciclo infinito "necesito permiso para ver si tengo permiso".
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Política Admin: Si la función dice que soy admin, puedo leer todo.
CREATE POLICY "Admins can read all users"
ON public.users
FOR SELECT
USING (is_admin());
