-- Tabla de categorías para libros
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Lectura para todos, escritura para autenticados
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert categories" ON categories
    FOR INSERT TO authenticated WITH CHECK (true);

-- Insertar categorías iniciales (las que ya estaban hardcodeadas)
INSERT INTO categories (name) VALUES 
    ('Ficción'),
    ('No Ficción'),
    ('Infantil'),
    ('Educativo'),
    ('Historia'),
    ('Tecnología')
ON CONFLICT (name) DO NOTHING;
