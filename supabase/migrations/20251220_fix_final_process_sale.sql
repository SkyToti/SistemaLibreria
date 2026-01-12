-- FIX FINAL WARNING - process_sale_transaction
-- Si la advertencia persiste, es porque PostgreSQL está manteniendo una versión "cacheada" o 
-- hay una sobrecarga de funciones (mismo nombre, distintos tipos de parámetros).
-- Vamos a usar una "bomba nuclear" controlada: Borrar la función por su OID (identificador único) si es posible,
-- o forzar la recreación asegurándonos de que los tipos coincidan EXACTAMENTE con lo que Supabase reporta.

-- PASO 1: Eliminar explícitamente cualquier versión existente con tipos genéricos o variantes
-- Nota: 'character varying' y 'text' a veces se tratan distinto en la firma.
-- También 'numeric' vs 'decimal'.

DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, text, jsonb, numeric);
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, varchar, jsonb, numeric);
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, text, jsonb, decimal);
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, varchar, jsonb, decimal);

-- PASO 2: Recrear la función con la configuración de seguridad explícita.
-- Esta vez usaremos tipos estándar (TEXT y NUMERIC) que son los preferidos de Postgres.

CREATE OR REPLACE FUNCTION public.process_sale_transaction(
  p_user_id UUID,
  p_payment_method TEXT,  -- Usamos TEXT explícitamente
  p_items JSONB,
  p_total_amount NUMERIC  -- Usamos NUMERIC explícitamente (sin alias)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp -- FIX: Añadimos pg_temp por si acaso usa tablas temporales implícitas
AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_book_stock INTEGER;
  v_book_price NUMERIC;
  v_book_title TEXT;
BEGIN
  -- Verificar stock primero
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT stock_quantity, title, sale_price 
    INTO v_book_stock, v_book_title, v_book_price
    FROM books 
    WHERE id = (v_item->>'id')::UUID;
    
    -- Validación de existencia
    IF v_book_stock IS NULL THEN
        RAISE EXCEPTION 'Libro no encontrado: %', (v_item->>'id');
    END IF;

    IF v_book_stock < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Stock insuficiente para el libro: % (Stock actual: %)', v_book_title, v_book_stock;
    END IF;
  END LOOP;

  -- 1. Crear la venta
  INSERT INTO sales (user_id, total_amount, payment_method)
  VALUES (p_user_id, p_total_amount, p_payment_method)
  RETURNING id INTO v_sale_id;

  -- 2. Procesar items y actualizar stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO sale_items (sale_id, book_id, quantity, unit_price, total_price)
    VALUES (
      v_sale_id,
      (v_item->>'id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::NUMERIC,
      ((v_item->>'quantity')::INTEGER * (v_item->>'price')::NUMERIC)
    );

    UPDATE books
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER,
        updated_at = NOW()
    WHERE id = (v_item->>'id')::UUID;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'sale_id', v_sale_id,
    'message', 'Venta procesada correctamente'
  );

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Error procesando la venta: %', SQLERRM;
END;
$$;
