-- Add missing indexes for foreign keys to improve performance and suppress warnings
CREATE INDEX IF NOT EXISTS idx_books_supplier_id ON public.books(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_user_id ON public.inventory_logs(user_id);

-- Remove redundant index (isbn is already unique, so it has an implicit unique index)
-- Having both is wasteful
DROP INDEX IF EXISTS idx_books_isbn;
