-- MIGRACIÓN DE SEGURIDAD RLS
-- Ejecuta este script en el editor SQL de Supabase para aplicar las nuevas políticas de seguridad.

-- 1. Crear función auxiliar para verificar admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role VARCHAR;
BEGIN
  SELECT role INTO current_role FROM public.users WHERE id = auth.uid();
  RETURN current_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Limpiar políticas existentes (para evitar conflictos)
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer libros" ON books;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar libros" ON books;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar libros" ON books;
DROP POLICY IF EXISTS "Solo admins pueden insertar libros" ON books;
DROP POLICY IF EXISTS "Solo admins pueden actualizar libros" ON books;
DROP POLICY IF EXISTS "Solo admins pueden borrar libros" ON books;

DROP POLICY IF EXISTS "Usuarios autenticados pueden leer ventas" ON sales;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar ventas" ON sales;
DROP POLICY IF EXISTS "Solo admins pueden actualizar ventas" ON sales;
DROP POLICY IF EXISTS "Solo admins pueden borrar ventas" ON sales;

DROP POLICY IF EXISTS "Lectura de items de venta" ON sale_items;
DROP POLICY IF EXISTS "Creación de items de venta" ON sale_items;

DROP POLICY IF EXISTS "Usuarios autenticados pueden leer proveedores" ON suppliers;
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar proveedores" ON suppliers;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar proveedores" ON suppliers;
DROP POLICY IF EXISTS "Solo admins pueden insertar proveedores" ON suppliers;
DROP POLICY IF EXISTS "Solo admins pueden actualizar proveedores" ON suppliers;
DROP POLICY IF EXISTS "Solo admins pueden borrar proveedores" ON suppliers;

DROP POLICY IF EXISTS "Usuarios ven su propio perfil" ON users;
DROP POLICY IF EXISTS "Solo admins pueden insertar usuarios" ON users;
DROP POLICY IF EXISTS "Usuarios actualizan su perfil" ON users;


-- 3. Habilitar RLS en todas las tablas sensibles
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;


-- 4. Crear nuevas políticas estrictas

-- === LIBROS ===
-- Todos pueden ver
CREATE POLICY "Usuarios autenticados pueden leer libros" 
  ON books FOR SELECT TO authenticated USING (true);
-- Solo admins gestionan
CREATE POLICY "Solo admins pueden insertar libros" 
  ON books FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Solo admins pueden actualizar libros" 
  ON books FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Solo admins pueden borrar libros" 
  ON books FOR DELETE TO authenticated USING (public.is_admin());

-- === VENTAS ===
-- Todos pueden ver
CREATE POLICY "Usuarios autenticados pueden leer ventas" 
  ON sales FOR SELECT TO authenticated USING (true);
-- Empleados pueden registrar ventas (verificando que sean ellos mismos)
CREATE POLICY "Usuarios autenticados pueden insertar ventas" 
  ON sales FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- Solo admins anulan/editan
CREATE POLICY "Solo admins pueden actualizar ventas" 
  ON sales FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Solo admins pueden borrar ventas" 
  ON sales FOR DELETE TO authenticated USING (public.is_admin());

-- === ITEMS DE VENTA ===
CREATE POLICY "Lectura de items de venta" 
  ON sale_items FOR SELECT TO authenticated USING (true);
-- Se permite insertar items si pertenecen a una venta creada por el mismo usuario
CREATE POLICY "Creación de items de venta" 
  ON sale_items FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM sales WHERE id = sale_id AND user_id = auth.uid())
  );

-- === PROVEEDORES ===
-- Todos pueden ver
CREATE POLICY "Usuarios autenticados pueden leer proveedores" 
  ON suppliers FOR SELECT TO authenticated USING (true);
-- Solo admins gestionan
CREATE POLICY "Solo admins pueden insertar proveedores" 
  ON suppliers FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Solo admins pueden actualizar proveedores" 
  ON suppliers FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Solo admins pueden borrar proveedores" 
  ON suppliers FOR DELETE TO authenticated USING (public.is_admin());

-- === USUARIOS ===
-- Ver perfil propio o admin ve todos
CREATE POLICY "Usuarios ven su propio perfil" 
  ON users FOR SELECT TO authenticated 
  USING (auth.uid() = id OR public.is_admin());
-- Insertar solo admins (o trigger del sistema)
CREATE POLICY "Solo admins pueden insertar usuarios" 
  ON users FOR INSERT TO authenticated WITH CHECK (public.is_admin());
-- Actualizar perfil propio o admin todos
CREATE POLICY "Usuarios actualizan su perfil" 
  ON users FOR UPDATE TO authenticated 
  USING (auth.uid() = id OR public.is_admin());
