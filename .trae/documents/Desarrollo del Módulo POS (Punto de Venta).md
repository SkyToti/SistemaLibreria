## Plan de Implementación: Módulo de Punto de Venta (POS)

Para transformar el sistema en un verdadero POS, necesitamos una interfaz optimizada para cajeros que permita escanear/buscar productos y procesar ventas rápidamente.

### 1. Nueva Ruta y Layout
- Crear ruta `/dashboard/pos` (Punto de Venta).
- Diseñar un layout dividido:
    - **Izquierda (Catálogo)**: Grid de productos con buscador rápido.
    - **Derecha (Carrito)**: Lista de ítems, totales y botón de cobro.

### 2. Estado del Carrito (Zustand)
- Implementar un store global (`useCartStore`) para persistir el carrito entre navegaciones.
- Funciones: `addItem`, `removeItem`, `updateQuantity`, `clearCart`.

### 3. Componentes UI
- `ProductGrid`: Reutilizar la lógica de búsqueda de inventario pero con tarjetas clicables.
- `CartSidebar`: Panel lateral fijo con el resumen de la venta.
- `CheckoutModal`: Modal para confirmar pago (Efectivo/Tarjeta) y generar el ticket.

### 4. Integración Backend
- Crear servicio `sales.service.ts`.
- Al confirmar venta:
    - Crear registro en tabla `sales`.
    - Crear registros en `sale_items`.
    - **Descontar stock** automáticamente en tabla `books`.

Este módulo es el corazón del negocio. Empezaré configurando la página y el store del carrito.