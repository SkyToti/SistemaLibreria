-- OPTIMIZACIÓN DASHBOARD
-- Ejecuta este script en Supabase para crear funciones que calculan estadísticas en el servidor.

-- 1. Función para obtener estadísticas generales (Ventas totales, Ingresos, Libros, Stock Bajo)
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_sales BIGINT,
  total_revenue NUMERIC,
  total_books BIGINT,
  low_stock_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM sales),
    (SELECT COALESCE(SUM(total_amount), 0) FROM sales),
    (SELECT COUNT(*) FROM books),
    (SELECT COUNT(*) FROM books WHERE stock_quantity < 5);
END;
$$ LANGUAGE plpgsql;


-- 2. Función para obtener productos más vendidos (Top Products)
-- Evita traer todos los sale_items al cliente
CREATE OR REPLACE FUNCTION get_top_products(limit_count INT DEFAULT 5)
RETURNS TABLE (
  title TEXT,
  sales BIGINT,
  revenue NUMERIC
) AS $$
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
$$ LANGUAGE plpgsql;

-- 3. Función para obtener ingresos por día (Últimos 7 días)
CREATE OR REPLACE FUNCTION get_revenue_by_day(days_limit INT DEFAULT 7)
RETURNS TABLE (
  date TEXT,
  amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(sale_date, 'Mon DD') as date,
    SUM(total_amount) as amount
  FROM sales
  WHERE sale_date >= (CURRENT_DATE - (days_limit || ' days')::INTERVAL)
  GROUP BY TO_CHAR(sale_date, 'Mon DD'), sale_date::DATE
  ORDER BY sale_date::DATE ASC;
END;
$$ LANGUAGE plpgsql;
