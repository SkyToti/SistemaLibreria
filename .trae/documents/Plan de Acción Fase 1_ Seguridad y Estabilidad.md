Entendido. Basándome en el reporte de auditoría y la prioridad de asegurar la plataforma, he diseñado un plan de acción para ejecutar la **Fase 1: Seguridad y Estabilidad**.

Este plan aborda los dos problemas más críticos: la permisividad excesiva de la base de datos (actualmente cualquier usuario puede borrar datos) y la falta de tipado estricto que puede causar errores en tiempo de ejecución.

### Paso 1: Endurecimiento de Seguridad (RLS)
Modificaremos el archivo `supabase/schema.sql` para restringir permisos según el rol (`admin` vs `employee`).
1.  **Crear función auxiliar `is_admin()`:** Para verificar roles de forma segura y reutilizable en las políticas.
2.  **Actualizar políticas de `books` y `suppliers`:**
    *   `SELECT`: Permitido a todos los autenticados (para vender).
    *   `INSERT/UPDATE/DELETE`: **Solo Admins** (para gestión de inventario).
3.  **Actualizar políticas de `sales`:**
    *   `INSERT`: Permitido a todos (empleados deben poder registrar ventas).
    *   `DELETE/UPDATE`: **Solo Admins** (para anulaciones o correcciones).

### Paso 2: Refactorización de Tipado (TypeScript)
Eliminaremos el uso de `any` detectado para prevenir errores silenciosos.
1.  **`src/services/dashboard.service.ts`:**
    *   Definir interfaces `RecentSale` y `TopProduct`.
    *   Reemplazar `any[]` en `DashboardMetrics` y castings manuales en `getMetrics` y `getInventoryReport`.
2.  **`src/components/suppliers/SupplierForm.tsx`:**
    *   Corregir el tipo `any` en el evento `onValueChange` del Select.
3.  **`src/lib/excel-utils.ts`:**
    *   Tipar correctamente los datos de entrada para la generación de Excel.

¿Procedemos con estas mejoras de seguridad y calidad de código?