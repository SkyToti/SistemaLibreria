-- FIX SECURITY WARNINGS (Versión Final Definitiva)
-- Solución al error 2BP01: "cannot drop function... because other objects depend on it"
-- El problema es que is_admin() es usada por muchas políticas RLS.
-- NO debemos borrarla (DROP), sino actualizarla "in-place" usando CREATE OR REPLACE con el mismo tipo de retorno.

-- 1. Arreglar get_dashboard_stats (Esta sí requiere DROP porque cambiamos tipos internos a veces)
DROP FUNCTION IF EXISTS public.get_dashboard_stats();

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(total_sales numeric, total_revenue numeric, total_books bigint, low_stock_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.quantity), 0) as total_sales,
    COALESCE(SUM(sa.total_amount), 0) as total_revenue,
    (SELECT COUNT(*) FROM books) as total_books,
    (SELECT COUNT(*) FROM books WHERE stock_quantity < 5) as low_stock_count
  FROM sale_items s
  JOIN sales sa ON s.sale_id = sa.id;
END;
$$;

-- 2. Arreglar is_admin (SIN DROP - Actualización Directa)
-- Al no borrarla, mantenemos las dependencias de las políticas RLS intactas.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Aquí está la mejora de seguridad
AS $$
DECLARE
  current_role VARCHAR;
BEGIN
  SELECT role INTO current_role FROM public.users WHERE id = auth.uid();
  RETURN current_role = 'admin';
END;
$$;

-- 3. Arreglar get_top_products
DROP FUNCTION IF EXISTS public.get_top_products(int);

CREATE OR REPLACE FUNCTION public.get_top_products(limit_count int)
RETURNS TABLE(title varchar, sales numeric, revenue numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.title,
    SUM(si.quantity) as sales,
    SUM(si.total_price) as revenue
  FROM sale_items si
  JOIN books b ON si.book_id = b.id
  GROUP BY b.title
  ORDER BY sales DESC
  LIMIT limit_count;
END;
$$;

-- 4. Arreglar get_revenue_by_day
DROP FUNCTION IF EXISTS public.get_revenue_by_day(int);

CREATE OR REPLACE FUNCTION public.get_revenue_by_day(days_limit int)
RETURNS TABLE(date text, amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(sale_date, 'YYYY-MM-DD') as date,
    SUM(total_amount) as amount
  FROM sales
  WHERE sale_date >= NOW() - (days_limit || ' days')::INTERVAL
  GROUP BY date
  ORDER BY date ASC;
END;
$$;

-- 5. Arreglar log_inventory_change (Trigger function)
-- Usamos CREATE OR REPLACE directamente para evitar problemas de dependencias con el trigger
CREATE OR REPLACE FUNCTION public.log_inventory_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF OLD.stock_quantity <> NEW.stock_quantity THEN
    INSERT INTO inventory_logs (
      book_id, user_id, type, quantity_change, previous_stock, new_stock, reason
    )
    VALUES (
      NEW.id,
      current_user_id,
      CASE WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'entry'::varchar ELSE 'exit'::varchar END,
      ABS(NEW.stock_quantity - OLD.stock_quantity),
      OLD.stock_quantity,
      NEW.stock_quantity,
      CASE WHEN NEW.stock_quantity < OLD.stock_quantity THEN 'Venta o Salida de Stock' ELSE 'Reabastecimiento o Ajuste' END
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Arreglar process_sale_transaction
DROP FUNCTION IF EXISTS public.process_sale_transaction(uuid, text, jsonb, numeric);

CREATE OR REPLACE FUNCTION public.process_sale_transaction(
  p_user_id UUID,
  p_payment_method TEXT,
  p_items JSONB,
  p_total_amount DECIMAL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- 7. Arreglar handle_new_user (Trigger function)
-- Usamos CREATE OR REPLACE directo para evitar borrar dependencias del trigger de auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'employee');
  RETURN new;
END;
$$;
