-- OPTIMIZE SUPPLIERS POLICIES (Fix Final Warning)
-- Problema: "Multiple Permissive Policies" en la tabla 'suppliers' para la acción DELETE.
-- Razón: Tienes dos políticas que permiten borrar:
--   1. "Solo admins pueden borrar proveedores"
--   2. "Usuarios autenticados pueden eliminar proveedores" (Esta parece ser un error o una política antigua muy permisiva).
-- Solución: Eliminar ambas y dejar SOLO la política correcta (solo admins).

-- 1. Eliminar políticas conflictivas de DELETE en suppliers
DROP POLICY IF EXISTS "Solo admins pueden borrar proveedores" ON public.suppliers;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar proveedores" ON public.suppliers;
DROP POLICY IF EXISTS "Delete access for admins" ON public.suppliers; -- Nombre común alternativo

-- 2. Crear la política ÚNICA y CORRECTA para DELETE
-- Solo un administrador debería poder borrar un proveedor.
CREATE POLICY "Only admins can delete suppliers"
ON public.suppliers
FOR DELETE
TO authenticated
USING (
  (select public.is_admin()) = true
);

-- 3. Revisión preventiva para UPDATE (por si acaso también está duplicada)
DROP POLICY IF EXISTS "Solo admins pueden actualizar proveedores" ON public.suppliers;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar proveedores" ON public.suppliers;

CREATE POLICY "Only admins can update suppliers"
ON public.suppliers
FOR UPDATE
TO authenticated
USING (
  (select public.is_admin()) = true
);

-- 4. Revisión preventiva para INSERT
DROP POLICY IF EXISTS "Solo admins pueden insertar proveedores" ON public.suppliers;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar proveedores" ON public.suppliers;

CREATE POLICY "Only admins can insert suppliers"
ON public.suppliers
FOR INSERT
TO authenticated
WITH CHECK (
  (select public.is_admin()) = true
);
