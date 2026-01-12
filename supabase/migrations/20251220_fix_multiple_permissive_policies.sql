-- OPTIMIZE RLS (Fix Multiple Permissive Policies & Init Plan)
-- Problema 1: "Auth RLS Initialization Plan" en users. 
--    (Todavía queda alguna política vieja sin optimizar o se nos pasó una).
-- Problema 2: "Multiple Permissive Policies". 
--    Esto pasa cuando tienes varias políticas que hacen lo mismo (ej: "Usuarios ven perfil" y "Admins ven todo").
--    PostgreSQL tiene que evaluar TODAS ellas con un "OR".
--    Solución: Fusionar políticas redundantes en una sola más eficiente.

-- 1. Optimización y Unificación para la tabla USERS
-- Borramos las políticas viejas y fragmentadas
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuarios actualizan su perfil" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users; -- Si existe esta vieja
DROP POLICY IF EXISTS "Users can read own data" ON public.users;   -- Nombre genérico que a veces se crea

-- Creamos una política UNIFICADA y OPTIMIZADA para SELECT
CREATE POLICY "Unified Read Policy for Users"
ON public.users
FOR SELECT
TO authenticated
USING (
  -- Optimización: (select auth.uid()) una sola vez
  (select auth.uid()) = id 
  OR 
  (select public.is_admin()) = true
);

-- Creamos una política UNIFICADA y OPTIMIZADA para UPDATE
CREATE POLICY "Unified Update Policy for Users"
ON public.users
FOR UPDATE
TO authenticated
USING (
  (select auth.uid()) = id 
  OR 
  (select public.is_admin()) = true
);

-- 2. Optimización y Unificación para la tabla SUPPLIERS
-- "Multiple Permissive Policies" en suppliers suele ser: "Todos ven" + "Admins editan".
-- Si la política es "Todos ven", no necesitamos más políticas de lectura.
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer proveedores" ON public.suppliers;
DROP POLICY IF EXISTS "Read access for all authenticated users" ON public.suppliers;

CREATE POLICY "Unified Read Policy for Suppliers"
ON public.suppliers
FOR SELECT
TO authenticated
USING (true); -- Simple y eficiente, no evalúa nada complejo.

-- 3. Limpieza extra para BOOKS (por si acaso)
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer libros" ON public.books;
DROP POLICY IF EXISTS "Read access for all authenticated users" ON public.books;

CREATE POLICY "Unified Read Policy for Books"
ON public.books
FOR SELECT
TO authenticated
USING (true);

-- Nota: Las políticas de INSERT/DELETE suelen estar bien separadas (solo admin),
-- así que no causan el warning de "Multiple Permissive".
