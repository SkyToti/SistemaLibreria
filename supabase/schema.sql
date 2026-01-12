-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Proveedores
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Libros
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    description TEXT,
    cover_image_url TEXT,
    supplier_id UUID REFERENCES suppliers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Ventas
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'transfer')),
    notes TEXT,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Items de Venta
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) NOT NULL,
    book_id UUID REFERENCES books(id) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
);

-- Tabla de Logs de Inventario
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('entry', 'exit', 'adjustment')) NOT NULL,
    quantity_change INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_book_id ON sale_items(book_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_book_id ON inventory_logs(book_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  current_role VARCHAR;
BEGIN
  SELECT role INTO current_role FROM public.users WHERE id = auth.uid();
  RETURN current_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de seguridad de Supabase (RLS)
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas para LIBROS
-- Todos los autenticados pueden ver libros (necesario para vender)
CREATE POLICY "Usuarios autenticados pueden leer libros" 
  ON books FOR SELECT TO authenticated USING (true);

-- Solo admins pueden crear/editar/borrar libros
CREATE POLICY "Solo admins pueden insertar libros" 
  ON books FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Solo admins pueden actualizar libros" 
  ON books FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Solo admins pueden borrar libros" 
  ON books FOR DELETE TO authenticated USING (public.is_admin());

-- Políticas para VENTAS
-- Todos pueden ver ventas (para reportes personales o globales)
CREATE POLICY "Usuarios autenticados pueden leer ventas" 
  ON sales FOR SELECT TO authenticated USING (true);

-- Todos pueden registrar ventas
CREATE POLICY "Usuarios autenticados pueden insertar ventas" 
  ON sales FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Solo admins pueden modificar/borrar ventas (anulaciones)
CREATE POLICY "Solo admins pueden actualizar ventas" 
  ON sales FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Solo admins pueden borrar ventas" 
  ON sales FOR DELETE TO authenticated USING (public.is_admin());

-- Políticas para ITEMS DE VENTA (Heredan permisos de ventas implícitamente por lógica de negocio, pero explícitamente aquí)
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura de items de venta" 
  ON sale_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Creación de items de venta" 
  ON sale_items FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM sales WHERE id = sale_id AND user_id = auth.uid())
  );

-- Políticas para PROVEEDORES
-- Todos pueden ver proveedores
CREATE POLICY "Usuarios autenticados pueden leer proveedores" 
  ON suppliers FOR SELECT TO authenticated USING (true);

-- Solo admins gestionan proveedores
CREATE POLICY "Solo admins pueden insertar proveedores" 
  ON suppliers FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "Solo admins pueden actualizar proveedores" 
  ON suppliers FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "Solo admins pueden borrar proveedores" 
  ON suppliers FOR DELETE TO authenticated USING (public.is_admin());

-- Políticas para USUARIOS
-- Usuarios ven su propio perfil, admins ven todos
CREATE POLICY "Usuarios ven su propio perfil" 
  ON users FOR SELECT TO authenticated 
  USING (auth.uid() = id OR public.is_admin());

-- Solo el sistema (trigger) inserta usuarios, o admins manualmente
CREATE POLICY "Solo admins pueden insertar usuarios" 
  ON users FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- Usuarios pueden actualizar su perfil (nombre), admins todo
CREATE POLICY "Usuarios actualizan su perfil" 
  ON users FOR UPDATE TO authenticated 
  USING (auth.uid() = id OR public.is_admin());

-- Trigger para manejar nuevos usuarios en la tabla publica users cuando se registran en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'employee');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
