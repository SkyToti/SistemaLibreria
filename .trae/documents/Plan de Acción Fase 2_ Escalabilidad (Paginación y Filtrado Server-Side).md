Entendido. La Fase 1 ya fue completada (seguridad y tipado). Ahora planificaremos la **Fase 2: Escalabilidad**, enfocándonos en resolver el problema crítico de "Fetch All" y el filtrado en el cliente.

### Objetivos de la Fase 2:
1.  **Paginación en el Servidor:** Evitar cargar toda la base de datos en memoria.
2.  **Filtrado en el Backend:** Mover la lógica de búsqueda de texto y categorías a consultas SQL optimizadas.

### Plan de Implementación:

1.  **Refactorizar `book.service.ts`:**
    *   Modificar `getAll` para aceptar parámetros: `page`, `limit`, `search`, `category`.
    *   Implementar `supabase.from('books').select('*', { count: 'exact' }).range(...)`.
    *   Añadir filtros dinámicos `.ilike('title', ...)` y `.eq('category', ...)`.

2.  **Refactorizar `sales.service.ts`:**
    *   Modificar `getSales` para aceptar `page`, `limit`, `startDate`, `endDate`.
    *   Implementar paginación similar para el historial de ventas.

3.  **Actualizar `POSPage` (Punto de Venta):**
    *   Eliminar el filtrado local (`filteredBooks.filter(...)`).
    *   Implementar un estado de paginación (`currentPage`, `totalPages`).
    *   Conectar el input de búsqueda (`searchTerm`) y el select de categorías directamente al servicio `bookService` (con debounce para no saturar la red).

4.  **Actualizar `ReportsPage` (Reportes):**
    *   Conectar los filtros de fecha y tablas al nuevo `salesService` paginado.

¿Procedemos con este plan de escalabilidad? Empezaré por refactorizar `book.service.ts` y actualizar la página del POS.