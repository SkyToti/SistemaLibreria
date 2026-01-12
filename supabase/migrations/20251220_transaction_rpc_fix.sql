-- TRANSACCIÓN DE VENTA ATÓMICA (CORREGIDA)
-- Ejecuta este script para actualizar la función.
-- Se añade SECURITY DEFINER para permitir descontar stock aunque el usuario no sea admin.

CREATE OR REPLACE FUNCTION process_sale_transaction(
  p_user_id UUID,
  p_total_amount NUMERIC,
  p_payment_method TEXT,
  p_items JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_book_id UUID;
  v_quantity INT;
  v_unit_price NUMERIC;
  v_current_stock INT;
BEGIN
  -- 1. Insertar la venta
  INSERT INTO sales (user_id, total_amount, payment_method, sale_date)
  VALUES (p_user_id, p_total_amount, p_payment_method, NOW())
  RETURNING id INTO v_sale_id;

  -- 2. Procesar cada item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_book_id := (v_item->>'book_id')::UUID;
    v_quantity := (v_item->>'quantity')::INT;
    v_unit_price := (v_item->>'unit_price')::NUMERIC;

    -- Verificar stock actual
    SELECT stock_quantity INTO v_current_stock FROM books WHERE id = v_book_id FOR UPDATE;
    
    IF v_current_stock < v_quantity THEN
      RAISE EXCEPTION 'Stock insuficiente para el libro %', v_book_id;
    END IF;

    -- Insertar item de venta
    INSERT INTO sale_items (sale_id, book_id, quantity, unit_price, total_price)
    VALUES (v_sale_id, v_book_id, v_quantity, v_unit_price, v_quantity * v_unit_price);

    -- Actualizar stock
    UPDATE books
    SET stock_quantity = stock_quantity - v_quantity
    WHERE id = v_book_id;
  END LOOP;

  RETURN jsonb_build_object('sale_id', v_sale_id, 'status', 'success');
EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
