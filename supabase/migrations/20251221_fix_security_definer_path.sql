-- Fix Security Warning: Function has a role mutable search_path
-- Also ensures only ONE version of the function exists with the correct signature matching the frontend

-- 1. Drop ALL potential variations of the function to clear the warning and avoid confusion
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, numeric, text, jsonb); -- The one likely being used
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, text, jsonb, numeric); -- Previous attempt
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, varchar, jsonb, numeric);
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, text, jsonb, decimal);
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, numeric, text, jsonb);

-- 2. Recreate the function with the Security Fix (SET search_path) and correct logic
CREATE OR REPLACE FUNCTION public.process_sale_transaction(
  p_user_id UUID,
  p_total_amount NUMERIC,
  p_payment_method TEXT,
  p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp -- THIS FIXES THE WARNING
AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_book_stock INTEGER;
  v_book_price NUMERIC;
  v_book_title TEXT;
BEGIN
  -- Verificar stock primero (Atomicidad)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Note: Frontend sends 'book_id', so we use that key
    SELECT stock_quantity, title, sale_price 
    INTO v_book_stock, v_book_title, v_book_price
    FROM public.books 
    WHERE id = (v_item->>'book_id')::UUID;
    
    IF v_book_stock IS NULL THEN
        RAISE EXCEPTION 'Libro no encontrado: %', (v_item->>'book_id');
    END IF;

    IF v_book_stock < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Stock insuficiente para el libro: % (Stock actual: %)', v_book_title, v_book_stock;
    END IF;
  END LOOP;

  -- 1. Crear la venta
  INSERT INTO public.sales (user_id, total_amount, payment_method, sale_date)
  VALUES (p_user_id, p_total_amount, p_payment_method, NOW())
  RETURNING id INTO v_sale_id;

  -- 2. Procesar items y actualizar stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.sale_items (sale_id, book_id, quantity, unit_price, total_price)
    VALUES (
      v_sale_id,
      (v_item->>'book_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::NUMERIC,
      ((v_item->>'quantity')::INTEGER * (v_item->>'unit_price')::NUMERIC)
    );

    UPDATE public.books
    SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER,
        updated_at = NOW()
    WHERE id = (v_item->>'book_id')::UUID;
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
