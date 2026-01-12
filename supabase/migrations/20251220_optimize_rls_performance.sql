-- OPTIMIZE PERFORMANCE (Auth RLS Initialization Plan)
-- Problema: Las políticas RLS actuales evalúan `auth.uid()` fila por fila.
-- Esto es lento cuando tienes muchas ventas.
-- Solución: Envolver `auth.uid()` en un `(SELECT auth.uid())`.
-- PostgreSQL es inteligente: al ver el SELECT, entiende que el valor es constante para toda la consulta
-- y lo calcula una sola vez al principio, en lugar de mil veces por cada fila.

-- 1. Optimizar política de INSERT en 'sales'
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar ventas" ON public.sales;

CREATE POLICY "Usuarios autenticados pueden insertar ventas"
ON public.sales
FOR INSERT
TO authenticated
WITH CHECK (
  -- Optimización: (select auth.uid()) se ejecuta solo una vez por query
  (select auth.uid()) = user_id
);

-- 2. Optimizar política de SELECT en 'users' (Usuarios ven su propio perfil)
-- Esta también suele dar problemas de rendimiento si no se optimiza
DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON public.users;

CREATE POLICY "Usuarios ven su propio perfil"
ON public.users
FOR SELECT
TO authenticated
USING (
  (select auth.uid()) = id OR public.is_admin()
);

-- 3. Optimizar política de UPDATE en 'users'
DROP POLICY IF EXISTS "Usuarios actualizan su perfil" ON public.users;

CREATE POLICY "Usuarios actualizan su perfil"
ON public.users
FOR UPDATE
TO authenticated
USING (
  (select auth.uid()) = id OR public.is_admin()
);

-- 4. Optimizar política de INSERT en 'sale_items'
-- Esta es crítica porque se insertan muchos items
DROP POLICY IF EXISTS "Creación de items de venta" ON public.sale_items;

CREATE POLICY "Creación de items de venta"
ON public.sale_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sales 
    WHERE id = sale_id 
    AND user_id = (select auth.uid()) -- Optimización aquí también
  )
);
