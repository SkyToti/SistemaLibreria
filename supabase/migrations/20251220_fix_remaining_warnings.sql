-- FIX REMAINING WARNINGS
-- Este script elimina específicamente las versiones antiguas de la función que podrían haber quedado "huérfanas"
-- por diferencias en los tipos de datos (ej: varchar vs text), y recrea la versión segura.

-- 1. Asegurar limpieza total de process_sale_transaction
-- Intentamos borrar variaciones comunes para asegurar que no quede ninguna versión antigua insegura.
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, text, jsonb, numeric);
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, character varying, jsonb, numeric);
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, text, jsonb, decimal);

-- 2. Recrear process_sale_transaction con seguridad (search_path = public)
CREATE OR REPLACE FUNCTION public.process_sale_transaction(
  p_user_id UUID,
  p_payment_method TEXT,
  p_items JSONB,
  p_total_amount DECIMAL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- FIX DE SEGURIDAD
AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_book_stock INTEGER;
  v_book_price DECIMAL;
  v_book_title TEXT;
BEGIN
  -- Verificar stock primero
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT stock_quantity, title, sale_price 
    INTO v_book_stock, v_book_title, v_book_price
    FROM books 
    WHERE id = (v_item->>'id')::UUID;
    
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
      (v_item->>'price')::DECIMAL,
      ((v_item->>'quantity')::INTEGER * (v_item->>'price')::DECIMAL)
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

-- 3. Asegurar handle_new_user también (por si acaso es la segunda advertencia)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- FIX DE SEGURIDAD
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'employee');
  RETURN new;
END;
$$;
