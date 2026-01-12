-- FIX FINAL WARNING - SUPER SECURE VERSION
-- Basado en las recomendaciones del asistente de Supabase:
-- 1. Agregamos 'pg_catalog' al search_path.
-- 2. Usamos referencias COMPLETAS (public.tabla) dentro del código.
-- 3. Borramos versiones viejas agresivamente.

-- Paso 1: Limpieza agresiva de versiones antiguas
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, text, jsonb, numeric);
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, varchar, jsonb, numeric);
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, text, jsonb, decimal);
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, varchar, jsonb, decimal);

-- Paso 2: Creación de la versión blindada
CREATE OR REPLACE FUNCTION public.process_sale_transaction(
  p_user_id UUID,
  p_payment_method TEXT,
  p_items JSONB,
  p_total_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
-- FIX 1: Incluir pg_catalog primero para funciones nativas seguras
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_book_stock INTEGER;
  v_book_price NUMERIC;
  v_book_title TEXT;
BEGIN
  -- FIX 2: Usar referencias completas (public.books, public.sales, etc.)
  
  -- Verificar stock primero
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT stock_quantity, title, sale_price 
    INTO v_book_stock, v_book_title, v_book_price
    FROM public.books 
    WHERE id = (v_item->>'id')::UUID;
    
    IF v_book_stock IS NULL THEN
        RAISE EXCEPTION 'Libro no encontrado: %', (v_item->>'id');
    END IF;

    IF v_book_stock < (v_item->>'quantity')::INTEGER THEN
      RAISE EXCEPTION 'Stock insuficiente para el libro: % (Stock actual: %)', v_book_title, v_book_stock;
    END IF;
  END LOOP;

  -- 1. Crear la venta
  INSERT INTO public.sales (user_id, total_amount, payment_method)
  VALUES (p_user_id, p_total_amount, p_payment_method)
  RETURNING id INTO v_sale_id;

  -- 2. Procesar items y actualizar stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.sale_items (sale_id, book_id, quantity, unit_price, total_price)
    VALUES (
      v_sale_id,
      (v_item->>'id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'price')::NUMERIC,
      ((v_item->>'quantity')::INTEGER * (v_item->>'price')::NUMERIC)
    );

    UPDATE public.books
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
