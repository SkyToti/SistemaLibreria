-- Asegurar que las funciones del Dashboard existen y son seguras
-- FIX: Se agregaron CASTS explícitos (::TYPE) para evitar el error 42804 (Datatype Mismatch)

-- 1. DROP old functions to ensure clean state
DROP FUNCTION IF EXISTS public.get_dashboard_stats();
DROP FUNCTION IF EXISTS public.get_top_products(INT);
DROP FUNCTION IF EXISTS public.get_revenue_by_day(INT);

-- 2. Función para obtener estadísticas generales
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE (
  total_sales BIGINT,
  total_revenue NUMERIC,
  total_books BIGINT,
  low_stock_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.sales)::BIGINT,
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.sales)::NUMERIC,
    (SELECT COUNT(*) FROM public.books)::BIGINT,
    (SELECT COUNT(*) FROM public.books WHERE stock_quantity < 5)::BIGINT;
END;
$$;

-- 3. Función para obtener Top Products
-- FIX: Casting explícito para title, sales y revenue
CREATE OR REPLACE FUNCTION public.get_top_products(limit_count INT DEFAULT 5)
RETURNS TABLE (
  title TEXT,
  sales BIGINT,
  revenue NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.title::TEXT,
    SUM(si.quantity)::BIGINT as sales,
    SUM(si.total_price)::NUMERIC as revenue
  FROM public.sale_items si
  JOIN public.books b ON si.book_id = b.id
  GROUP BY b.title
  ORDER BY sales DESC
  LIMIT limit_count;
END;
$$;

-- 4. Función para obtener Revenue por día (últimos 7 días)
CREATE OR REPLACE FUNCTION public.get_revenue_by_day(days_limit INT DEFAULT 7)
RETURNS TABLE (
  date TEXT,
  amount NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(sale_date, 'Mon DD')::TEXT as date,
    SUM(total_amount)::NUMERIC as amount
  FROM public.sales
  WHERE sale_date >= (CURRENT_DATE - (days_limit || ' days')::INTERVAL)
  GROUP BY TO_CHAR(sale_date, 'Mon DD'), sale_date::DATE
  ORDER BY sale_date::DATE ASC;
END;
$$;
