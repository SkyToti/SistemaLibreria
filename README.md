# Mrbeelector POS

Sistema de Punto de Venta (POS) moderno desarrollado con Next.js, Supabase y Tailwind CSS.

## Características

- 🛒 **Punto de Venta:** Interfaz ágil para procesar ventas.
- 📚 **Gestión de Inventario:** Control de libros, stock y categorías.
- 👥 **Proveedores:** Gestión de proveedores y contactos.
- 📊 **Reportes:** Historial de ventas y reportes de inventario exportables a Excel.
- 🔐 **Seguridad:** Autenticación y roles de usuario.

## Tecnologías

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4.
- **Backend:** Supabase (PostgreSQL, Auth, Realtime).
- **Estado:** Zustand (con persistencia local).
- **Validación:** Zod + React Hook Form.
- **UI Components:** Shadcn/ui (Radix UI).
- **Tests:** Vitest (Unit), Playwright (E2E).

> **Última actualización:** Enero 2026 - E2E Tests implementados para Sales, Books, Suppliers.

## Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repo>
    cd Mrbeelector_POS
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Variables de Entorno:**
    Crear un archivo `.env.local` con las credenciales de Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_supabase
    ```

4.  **Base de Datos:**
    Ejecutar el script `supabase/schema.sql` en el editor SQL de tu proyecto Supabase para crear las tablas y políticas.

5.  **Correr en desarrollo:**
    ```bash
    npm run dev
    ```

## Scripts

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run test`: Ejecuta las pruebas unitarias.
- `npm run lint`: Ejecuta el linter.
