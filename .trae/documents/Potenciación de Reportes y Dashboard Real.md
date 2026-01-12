# Evolución del Módulo de Reportes Inteligentes 🧠

Entendido. Quieres transformar la página de "Historial" en un verdadero **Centro de Inteligencia de Negocio**. No solo ver qué pasó, sino analizar por qué y cuándo. Además, conectar el Dashboard principal a datos reales.

## 1. Conexión de Datos Reales al Dashboard (Prioridad Alta)
Actualmente el Dashboard usa mocks. Lo conectaremos a Supabase para mostrar:
- **Ventas Totales**: Suma real de la tabla `sales` (hoy/mes).
- **Libros Más Vendidos**: Query agrupada de `sale_items`.
- **Alertas de Stock**: Conteo real de libros con `stock < 5`.

## 2. Nuevo Módulo "Reportes Avanzados"
Reemplazaremos la vista simple por un sistema de pestañas o secciones:

### A. Reporte de Ventas (Temporalidad)
- **Gráficos Interactivos**: Ventas por Día, Semana, Mes, Año.
- **Comparativas**: "Este mes vs. Mes pasado".
- **Filtros**: Rango de fechas personalizado (Date Range Picker).

### B. Reporte de Inventario (Inteligente)
- **Valor del Inventario**: Cuánto dinero tienes parado en estanterías.
- **Filtros Avanzados**:
    - Por Categoría (Ficción, Terror, etc.).
    - Por Proveedor (¿Qué proveedor me vende más?).
    - Por Estado (Sin stock, Bajo stock).
- **Exportación**: Botón para exportar a CSV/Excel (clave para contabilidad).

### C. Reporte de Rendimiento
- **Top Productos**: Los 10 libros estrella.
- **Productos "Hueso"**: Los que no se han vendido en X tiempo.

## Plan de Implementación Técnica

1.  **Dashboard Real**:
    - Crear `dashboard.service.ts` con queries optimizadas (usando `count`, `sum`, `group by`).
    - Actualizar `DashboardStats.tsx` y `RevenueChart.tsx` para consumir estos datos.

2.  **Página de Reportes (`/dashboard/reports`)**:
    - Implementar `Tabs` (Ventas | Inventario).
    - Integrar librería de gráficos `recharts` (ya instalada) para visualizar tendencias.
    - Crear componentes de filtro robustos (Selectores múltiples, Calendario).

3.  **Backend (Supabase)**:
    - Necesitaremos queries más complejas. Posiblemente usemos RPCs (funciones SQL) si las queries de cliente se vuelven lentas, pero intentaremos primero con el cliente JS.

¿Te parece bien este enfoque para convertir Mrbeelector en una herramienta de análisis poderosa? Si estás de acuerdo, empezaré conectando el Dashboard a la realidad.