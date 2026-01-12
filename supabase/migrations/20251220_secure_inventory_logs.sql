-- Base de datos: PostgreSQL (Supabase)
-- Propósito: Asegurar la tabla inventory_logs y automatizar el registro de movimientos
-- Compatibilidad verificada con:
--   - Tabla: public.inventory_logs
--   - Columnas: book_id, user_id, type (varchar 20), quantity_change, previous_stock, new_stock
--   - Constraints: FK a users(id), Check type in ('entry', 'exit', 'adjustment')

-- 1. Habilitar RLS para solucionar la advertencia de seguridad
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- 2. Crear política: Solo admins pueden ver los logs
-- Esto protege los datos para que no sean públicos
DROP POLICY IF EXISTS "Admins can view inventory logs" ON inventory_logs;
CREATE POLICY "Admins can view inventory logs"
  ON inventory_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 3. Función Trigger para automatizar el registro
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Obtener ID del usuario actual (vinculado a public.users por FK)
  current_user_id := auth.uid();

  -- Validación de seguridad:
  -- Si no hay usuario (ej. operación interna del sistema sin sesión),
  -- no podemos insertar porque user_id es NOT NULL.
  IF current_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Solo registrar si el stock cambió
  IF OLD.stock_quantity <> NEW.stock_quantity THEN
    INSERT INTO inventory_logs (
      book_id,
      user_id,
      type,
      quantity_change,
      previous_stock,
      new_stock,
      reason
    )
    VALUES (
      NEW.id,
      current_user_id,
      -- Determinar tipo según el cambio (cumple con el check constraint)
      CASE 
        WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'entry'::varchar
        ELSE 'exit'::varchar
      END,
      -- Cantidad absoluta del cambio
      ABS(NEW.stock_quantity - OLD.stock_quantity),
      OLD.stock_quantity,
      NEW.stock_quantity,
      -- Razón automática
      CASE
        WHEN NEW.stock_quantity < OLD.stock_quantity THEN 'Venta o Salida de Stock'
        ELSE 'Reabastecimiento o Ajuste'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Activar el trigger en la tabla books
DROP TRIGGER IF EXISTS on_stock_change ON books;

CREATE TRIGGER on_stock_change
AFTER UPDATE ON books
FOR EACH ROW
EXECUTE PROCEDURE log_inventory_change();
